package server

import (
	"net/url"
	"os"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

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
		ManagerUserName: getEnvOrDefault("ManagerUserName", "A3R0"),
		ManagerPassword: getEnvOrDefault("ManagerPassword", "12345678"),
		Email:           getEnvOrDefault("Email", "null@gmail.com"),
		Password:        getEnvOrDefault("Password", "12345678"),
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
