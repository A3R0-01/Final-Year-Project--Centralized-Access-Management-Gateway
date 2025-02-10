package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"strings"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

var rudiUrl = "http://127.0.0.1:8002"
var rudiUrl2 = "http://127.0.0.1:8001"

type Server struct {
	id        string
	EndPoints map[string]*types.Endpoint
	Proxies   map[string]*httputil.ReverseProxy
}

func (srv *Server) FetchEndpoints() {
	endPoint1, err := NewEndpoint("server1", "service", "/service", rudiUrl, false, false, []string{"get", "patch"})
	if err != nil {
		log.Fatal(err)
	}
	endPoint2, err := NewEndpoint("server2", "stuff", "/stuff", rudiUrl2, false, false, []string{"get", "patch"})
	if err != nil {
		log.Fatal(err)
	}
	endpoints := []*types.Endpoint{endPoint1, endPoint2}
	if err := verify.VerifyMachineNames(endpoints); err != nil {
		log.Fatal(err)
	}
	newEndpoints := map[string]*types.Endpoint{}
	for _, endpoint := range endpoints {
		newEndpoints[strings.ToLower(endpoint.MachineName)] = endpoint
	}

	srv.EndPoints = newEndpoints
	// srv.EndPoints = endpoints
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
	endPoint, exists := srv.EndPoints[serviceName]
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(data)
		return
	}
	r.URL.Path = strings.Replace(path, serviceName, "/"+endPoint.FixedPath+"/", 1)
	prev := ""
	newString := ""
	for key, str := range r.URL.Path {
		if key == 0 {
			prev = string(str)
			newString = newString + prev
			continue
		}
		if prev == "/" && string(str) == "/" {
			continue
		}
		newString = newString + string(str)
		prev = string(str)

	}
	r.URL.Path = newString
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
	server := Server{}
	server.FetchEndpoints()
	return &server
}
