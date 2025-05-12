package camendpoints

// import (
// 	"encoding/json"
// 	"fmt"
// 	"io"
// 	"log"
// 	"net/http"
// 	"net/http/httputil"

// 	server "github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/Server"
// 	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
// 	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
// )

// type Server struct {
// 	id          string
// 	EndPoints   types.MapEndPoint
// 	Proxies     map[string]*httputil.ReverseProxy
// 	Credentials types.ManagerLogInCredentials
// }

// func (srv *Server) FetchServices() *[]types.PublicService {
// 	req, err := http.NewRequest("GET", types.CentralDomain+"manager/service/", nil)
// 	if err != nil {
// 		log.Fatal("ServerStartUp::\n Failed to generate request(fetchServices)")
// 	}
// 	req.Header.Set("Authorization", "Bearer "+srv.Credentials.Access)
// 	resp, err := http.DefaultClient.Do(req)
// 	if err != nil {
// 		log.Fatal("ServerStartUp::\n Failed to execute request(fetchServices)")
// 	}
// 	defer resp.Body.Close()
// 	body, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		log.Fatal("Failed to decode boby (fetchServices)")
// 	}
// 	var services []types.PublicService
// 	if err := json.Unmarshal(body, &services); err != nil {
// 		log.Fatal("ServerStartUp::\n Failed to decode response(fetchServices)\n" + err.Error())
// 	}
// 	return &services
// }

// func (srv *Server) GenerateEndPoints() {
// 	services := srv.FetchServices()
// 	camEndpoint, err := server.NewEndpoint("c_a_m", "c_a_m", "", types.Central_access_managementUrl, []string{"GET", "PATCH", "DELETE", "POST"}, "")
// 	if err != nil {
// 		log.Fatal(err)
// 	}
// 	endPoints := map[string]*types.Endpoint{}
// 	endPoints[camEndpoint.MachineName] = camEndpoint

// 	for _, service := range *services {
// 		endpoint, err := server.NewEndpoint(service.Title, service.MachineName, "", service.URL, service.Methods, service.PublicId)
// 		if err != nil {
// 			log.Fatal("Failed to create endpoint: \n\t" + service.String())
// 		}
// 		endPoints[service.MachineName] = endpoint
// 	}
// 	if err := verify.VerifyMachineNames(endPoints); err != nil {
// 		log.Fatal("Duplicate ServicesNames ")
// 	}
// 	srv.EndPoints = endPoints
// }
// func (srv *Server) FetchEndpoints() {
// 	// endPoint1, err := NewEndpoint("server1", "service", "/service", rudiUrl, []string{"GET", "PATCH"})
// 	// if err != nil {
// 	// 	log.Fatal(err)
// 	// }
// 	// endPoint2, err := NewEndpoint("server2", "stuff", "/stuff", rudiUrl2, []string{"GET", "PATCH"})
// 	// if err != nil {
// 	// 	log.Fatal(err)
// 	// }

// 	srv.GenerateEndPoints()
// 	srv.CreateProxies()
// }

// func (srv *Server) CreateProxies() {
// 	srv.Proxies = map[string]*httputil.ReverseProxy{}
// 	for _, endpoint := range srv.EndPoints {
// 		proxy := httputil.NewSingleHostReverseProxy(endpoint.URL)
// 		proxy.ModifyResponse = func(response *http.Response) error {
// 			// modify page data
// 			return nil
// 		}
// 		srv.Proxies[endpoint.MachineName] = proxy
// 	}
// 	fmt.Println("proxies at first", srv.Proxies)

// }

// func NewServer() *Server {
// 	credentials := types.GenerateManagerCredentials()
// 	credentials.startCredentials()
// 	server := Server{Credentials: *credentials}
// 	server.FetchEndpoints()
// 	return &server
// }
