package server

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

type Server struct {
	id          string
	EndPoints   map[string]*types.Endpoint
	Proxies     map[string]*httputil.ReverseProxy
	Credentials ManagerLogInCredentials
}

func (srv *Server) FetchServices() *[]types.PublicService {
	req, err := http.NewRequest("GET", centralDomain+"manager/service/", nil)
	if err != nil {
		log.Fatal("ServerStartUp::\n Failed to generate request(fetchServices)")
	}
	req.Header.Set("Authorization", "Bearer "+srv.Credentials.Access)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("ServerStartUp::\n Failed to execute request(fetchServices)")
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Failed to decode boby (fetchServices)")
	}
	var services []types.PublicService
	if err := json.Unmarshal(body, &services); err != nil {
		log.Fatal("ServerStartUp::\n Failed to decode response(fetchServices)\n" + err.Error())
	}
	return &services
}

func (srv *Server) GenerateEndPoints() {
	services := srv.FetchServices()
	camEndpoint, err := NewEndpoint("c_a_m", "c_a_m", "", central_access_managementUrl, []string{"GET", "PATCH", "DELETE", "POST"})
	if err != nil {
		log.Fatal(err)
	}
	endPoints := map[string]*types.Endpoint{}
	endPoints[camEndpoint.MachineName] = camEndpoint

	for _, service := range *services {
		endpoint, err := NewEndpoint(service.Title, service.MachineName, "", service.URL, service.Methods)
		if err != nil {
			log.Fatal("Failed to create endpoint: \n\t" + service.String())
		}
		endPoints[service.MachineName] = endpoint
	}
	if err := verify.VerifyMachineNames(endPoints); err != nil {
		log.Fatal("Duplicate ServicesNames ")
	}
	srv.EndPoints = endPoints
}
func (srv *Server) FetchEndpoints() {
	// endPoint1, err := NewEndpoint("server1", "service", "/service", rudiUrl, []string{"GET", "PATCH"})
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// endPoint2, err := NewEndpoint("server2", "stuff", "/stuff", rudiUrl2, []string{"GET", "PATCH"})
	// if err != nil {
	// 	log.Fatal(err)
	// }

	srv.GenerateEndPoints()
	srv.CreateProxies()
}

func (srv *Server) CreateProxies() {
	srv.Proxies = map[string]*httputil.ReverseProxy{}
	for _, endpoint := range srv.EndPoints {
		proxy := httputil.NewSingleHostReverseProxy(endpoint.URL)
		srv.Proxies[endpoint.MachineName] = proxy
	}
	fmt.Println("proxies at first", srv.Proxies)

}

func (srv *Server) HandleServe(w http.ResponseWriter, r *http.Request) {
	serviceName := srv.GetServiceName(r.URL.Path)
	path := r.URL.Path
	fmt.Println(path)
	endPoint, exists := srv.EndPoints[serviceName]
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(data)
		return
	}
	r.URL.Path = strings.Replace(path, serviceName, "/"+endPoint.FixedPath+"/", 1)

	r.URL.Path = refineUrl(r.URL.Path)
	fmt.Println(r.URL.Path)
	proxy, exists := srv.Proxies[serviceName]
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(data)
		return
	}
	log.Println("this is the proxy: ", proxy)
	proxy.ServeHTTP(w, r)
}

func (srv *Server) GetServiceName(r string) string {
	parts := strings.FieldsFunc(r, func(rw rune) bool {
		return rw == '/'
	})
	log.Println("service accessed", parts[0])
	return parts[0]
}

func (srv *Server) StartGateway(port string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		srv.HandleServe(w, r)
	})

	_ = http.ListenAndServe(":"+port, nil)
}

func NewServer() *Server {
	credentials := generateManagerCredentials()
	credentials.startCredentials()
	server := Server{Credentials: *credentials}
	server.FetchEndpoints()
	return &server
}
