package server

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

type Server struct {
	id          string
	EndPoints   types.MapEndPoint
	Proxies     map[string]*httputil.ReverseProxy
	Credentials ManagerLogInCredentials
}

func (srv *Server) FetchServices() *[]types.PublicService {
	req, err := http.NewRequest("GET", types.CentralDomain+"manager/service/", nil)
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
	camEndpoint, err := NewEndpoint("c_a_m", "c_a_m", "", types.Central_access_managementUrl, []string{"GET", "PATCH", "DELETE", "POST"}, "")
	if err != nil {
		log.Fatal(err)
	}
	endPoints := map[string]*types.Endpoint{}
	endPoints[camEndpoint.MachineName] = camEndpoint

	for _, service := range *services {
		endpoint, err := NewEndpoint(service.Title, service.MachineName, "", service.URL, service.Methods, service.PublicId)
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

func (srv *Server) HandleRequest(auth *types.Authenticator, code *int) {
	proxy, exists := srv.Proxies[auth.Service]
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		auth.ResponseWriter.WriteHeader(http.StatusNotFound)
		json.NewEncoder(auth.ResponseWriter).Encode(data)
		log.Println("Proxy not found")
	}
	log.Println("this is the proxy: ", proxy)
	proxy.ModifyResponse = func(response *http.Response) error {
		*code = response.StatusCode
		return nil
	}
	proxy.ServeHTTP(auth.ResponseWriter, auth.Request)
	return
}

func (srv *Server) HandleServe(auth *types.Authenticator, code *int) {
	srv.HandleRequest(auth, code)
}
func (srv *Server) Serve(w http.ResponseWriter, r *http.Request) {
	authenticator := types.NewAuthenticator(w, r)
	if err := authenticator.PopulateAuthenticate(&srv.EndPoints); err != nil {
		log.Println(err)
		return
	}
	var code int = 0
	srv.HandleServe(authenticator, &code)
	if authenticator.Service == "c_a_m" {
		authenticator.SystemLog.SetStatusCode(code)
		fmt.Printf("Status Code is %d\n", code)
	} else {
		authenticator.SystemLog.SetObject("PublicService")
		authenticator.SystemLog.SetRecordId(authenticator.ServiceId)
		authenticator.SystemLog.SetMessage("Accessed Service: " + authenticator.Service + " at " + authenticator.Request.URL.Path)
	}
}

func (srv *Server) StartGateway(port string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		srv.Serve(w, r)
		return
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
