package serviceTransport

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/serviceEndpoint"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/system"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/go-kit/kit/transport"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/go-kit/log"
)

func errorEncoder(ctx context.Context, err error, w http.ResponseWriter) {
	fmt.Println("This is coming from the error Encoder -> ", err)
}

func NewHTTPHandler(endpoints serviceEndpoint.Set, server *system.Server, logger log.Logger) http.Handler {
	options := []httptransport.ServerOption{
		httptransport.ServerErrorEncoder(errorEncoder),
		httptransport.ServerErrorHandler(transport.NewLogErrorHandler(logger)),
	}

	m := http.NewServeMux()
	for service, endpoint := range endpoints.Endpoints {
		m.Handle("/"+service.GetServiceMachineName(), httptransport.NewServer(
			endpoint,
			makeDecoderHttpServiceRequest(server),
			encodeHttpServiceResponse,
			options...,
		))
	}

	return m

}

func makeDecoderHttpServiceRequest(server *system.Server) httptransport.DecodeRequestFunc {
	return func(ctx context.Context, request *http.Request) (req interface{}, err error) {
		auth := types.NewAuthenticator(request)
		if err := auth.PopulateAuthenticate(&server.EndPoints); err != nil {
			return nil, err
		}
		return auth, nil
	}
}

func encodeHttpServiceResponse(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	auth := response.(*types.Authenticator)
	alterBody(auth.Proxy)
	auth.Proxy.ServeHTTP(w, auth.Request)
	return nil
}

func alterBody(proxy *httputil.ReverseProxy) {
	proxy.ModifyResponse = func(r *http.Response) error {
		proxy.ModifyResponse(r)
		return nil
	}
}
