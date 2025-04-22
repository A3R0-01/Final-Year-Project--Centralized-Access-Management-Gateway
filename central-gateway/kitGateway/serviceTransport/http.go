package serviceTransport

import (
	"context"
	"encoding/json"
	"fmt"
	normalLog "log"
	"net/http"
	"net/http/httputil"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/serviceEndpoint"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/system"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/go-kit/kit/transport"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/go-kit/log"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func errorEncoder(ctx context.Context, err error, w http.ResponseWriter) {
	data := map[string]string{"message": err.Error()}
	switch err.Error() {
	case "authentication failed":
		w.WriteHeader(http.StatusUnauthorized)
		break
	case "service not found":
		w.WriteHeader(http.StatusNotFound)
		break
	case "service error":
		w.WriteHeader(http.StatusInternalServerError)
		break
	case "service unauthorized":
		w.WriteHeader(http.StatusUnauthorized)
		break
	default:
		break
	}
	json.NewEncoder(w).Encode(data)
	normalLog.Println("This is coming from the error Encoder -> ", err)
}

func NewHTTPHandler(sets []*serviceEndpoint.Set, server *system.Server, logger log.Logger) http.Handler {
	options := []httptransport.ServerOption{
		httptransport.ServerErrorEncoder(errorEncoder),
		httptransport.ServerErrorHandler(transport.NewLogErrorHandler(logger)),
	}

	m := http.NewServeMux()
	for _, set := range sets {
		fmt.Println("/" + set.ServiceMachineName)
		m.Handle("/"+set.ServiceMachineName+"/", httptransport.NewServer(
			set.ServiceEndpoint,
			makeDecoderHttpServiceRequest(server),
			encodeHttpServiceResponse,
			options...,
		))
	}
	m.Handle("/metrics", promhttp.Handler())

	return m

}

func makeDecoderHttpServiceRequest(server *system.Server) httptransport.DecodeRequestFunc {
	return func(ctx context.Context, request *http.Request) (req interface{}, err error) {
		auth := types.NewAuthenticator(request)
		normalLog.Println(auth.Request.URL)
		if err := auth.PopulateAuthenticate(&server.EndPoints); err != nil {
			return nil, err
		}
		return auth, nil
	}
}

func encodeHttpServiceResponse(ctx context.Context, w http.ResponseWriter, response interface{}) error {
	auth := response.(*types.Authenticator)
	// alterBody(auth.Proxy)
	auth.Proxy.ServeHTTP(w, auth.Request)
	return nil
}

func alterBody(proxy *httputil.ReverseProxy) {
	proxy.ModifyResponse = makeAlterBodyFunc(proxy)
}

func makeAlterBodyFunc(proxy *httputil.ReverseProxy) func(r *http.Response) error {
	previousFunc := proxy.ModifyResponse
	if previousFunc != nil {
		return func(r *http.Response) error {
			previousFunc(r)
			return nil
		}
	}
	return nil
}
