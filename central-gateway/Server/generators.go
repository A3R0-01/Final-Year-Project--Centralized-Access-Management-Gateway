package server

import (
	"net/url"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
)

func NewEndpoint(serviceName string, machineName string, fixedPath string, serviceUrl string, restrictMethods bool, restrictPath bool, methods []string) (*types.Endpoint, error) {
	formattedUrl, err := url.Parse(serviceUrl)
	if err != nil {
		return nil, err
	}
	if err := verify.VerifyMethods(methods); err != nil {
		return nil, err
	}

	return &types.Endpoint{
		ServiceName:     serviceName,
		MachineName:     machineName,
		URL:             formattedUrl,
		RestrictMethods: restrictMethods,
		RestrictPath:    restrictPath,
		FixedPath:       fixedPath,
		Methods:         methods,
	}, nil

}
