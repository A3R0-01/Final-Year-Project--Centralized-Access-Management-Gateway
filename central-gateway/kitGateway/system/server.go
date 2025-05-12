package system

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"

	server "github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/Server"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

type Server struct {
	id          string
	EndPoints   types.MapEndPoint
	Credentials types.ManagerLogInCredentials
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
	if err := server.VerifyMachineNames(endPoints); err != nil {
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
}

func NewServer() *Server {
	credentials := generateManagerCredentials()
	credentials.StartCredentials()
	server := Server{Credentials: *credentials}
	server.FetchEndpoints()
	return &server
}
func NewEndpoint(serviceName string, machineName string, fixedPath string, serviceUrl string, methods []string, id string) (*types.Endpoint, error) {
	formattedUrl, err := url.Parse(serviceUrl)
	if err != nil {
		return nil, err
	}
	if err := verify.VerifyMethods(methods); err != nil {
		return nil, err
	}

	return &types.Endpoint{
		ServiceName: serviceName,
		MachineName: machineName,
		URL:         formattedUrl,
		FixedPath:   fixedPath,
		Methods:     methods,
		ServiceId:   id,
	}, nil

}
func generateManagerCredentials() *types.ManagerLogInCredentials {
	return &types.ManagerLogInCredentials{
		ManagerUserName: "A3R0",
		ManagerPassword: "bsrvnttngjltzl",
		Email:           "erlsontmadara@gmail.com",
		Password:        "1234bsrvnt",
	}
}
