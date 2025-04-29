package serviceTransport

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	normalLog "log"
	"net/http"
	"strconv"
	"strings"

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
			makeEncoderHttpServiceResponse(server),
			options...,
		))
	}
	m.Handle("/promMetrics", promhttp.Handler())

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
func makeEncoderHttpServiceResponse(server *system.Server) httptransport.EncodeResponseFunc {
	return func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
		auth := response.(*types.Authenticator)

		previousFunc := auth.Proxy.ModifyResponse
		auth.Proxy.ModifyResponse = func(resp *http.Response) error {
			if previousFunc != nil {
				if err := previousFunc(resp); err != nil {
					return err
				}
			}

			contentType := resp.Header.Get("Content-Type")

			// Only process text-based responses
			if !(strings.HasPrefix(contentType, "text/") ||
				strings.Contains(contentType, "html") ||
				strings.Contains(contentType, "json") ||
				strings.Contains(contentType, "javascript") ||
				strings.Contains(contentType, "xml") ||
				strings.Contains(contentType, "css")) {
				return nil // Skip binary or irrelevant types (e.g., images, PDF, etc.)
			}

			// Read and close the original body
			bodyBytes, err := io.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			resp.Body.Close()

			modifiedBody := string(bodyBytes)

			// Replace all occurrences of internal service URLs with gateway paths
			for _, endPoint := range server.EndPoints {
				targetURL := endPoint.URL.Scheme + "://" + endPoint.URL.Host
				if uri := endPoint.URL.RequestURI(); uri != "/" {
					targetURL += uri
				}

				gatewayPath := "http://127.0.0.1:8020/" + endPoint.MachineName
				modifiedBody = strings.ReplaceAll(modifiedBody, targetURL, gatewayPath)
			}

			// Reset response body with modified content
			resp.Body = io.NopCloser(bytes.NewBufferString(modifiedBody))
			resp.ContentLength = int64(len(modifiedBody))
			resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedBody)))

			return nil
		}

		// Serve through proxy
		auth.Proxy.ServeHTTP(w, auth.Request)
		return nil
	}
}

// func makeEncoderHttpServiceResponse(server *system.Server) httptransport.EncodeResponseFunc {
// 	return func(ctx context.Context, w http.ResponseWriter, response interface{}) error {
// 		auth := response.(*types.Authenticator)
// 		// alterBody(auth.Proxy)
// 		previousFunc := auth.Proxy.ModifyResponse
// 		auth.Proxy.ModifyResponse = func(resp *http.Response) error {
// 			if previousFunc != nil {
// 				previousFunc(resp)
// 			}
// 			contentType := resp.Header.Get("Content-Type")
// 			if !strings.HasPrefix(contentType, "text/") && !strings.Contains(contentType, "html") {
// 				return nil // skip non-text responses
// 			}

// 			// Read the body
// 			bodyBytes, err := io.ReadAll(resp.Body)
// 			if err != nil {
// 				return err
// 			}
// 			resp.Body.Close()
// 			modifiedBody := string(bodyBytes)
// 			// Replace all links starting with oldDomain
// 			for _, endPoint := range server.EndPoints {
// 				modifiedBody = strings.ReplaceAll(modifiedBody, endPoint.URL.Scheme+"://"+endPoint.URL.Host+endPoint.URL.RequestURI(), "http://127.0.0.1:8020/"+endPoint.MachineName)
// 			}

// 			// Replace the body with the modified content
// 			resp.Body = io.NopCloser(bytes.NewBufferString(modifiedBody))
// 			resp.ContentLength = int64(len(modifiedBody))
// 			resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedBody)))
// 			return nil
// 		}
// 		auth.Proxy.ServeHTTP(w, auth.Request)
// 		return nil
// 	}
// }

// func encodeHttpServiceResponse(ctx context.Context, w http.ResponseWriter, response interface{}) error {
// 	auth := response.(*types.Authenticator)
// 	// alterBody(auth.Proxy)
// 	alterBody(auth)
// 	auth.Proxy.ServeHTTP(w, auth.Request)
// 	return nil
// }

// func alterBody(auth *types.Authenticator) {
// 	auth.Proxy.ModifyResponse = makeAlterBodyFunc(auth.Proxy, auth.ServiceMachineName)
// }

// func makeAlterBodyFunc(proxy *httputil.ReverseProxy, serviceMachineName string) func(r *http.Response) error {
// 	previousFunc := proxy.ModifyResponse
// 	return func(resp *http.Response) error {
// 		if previousFunc != nil {
// 			previousFunc(resp)
// 		}
// 		// Only modify text-based responses
// 		contentType := resp.Header.Get("Content-Type")
// 		if !strings.HasPrefix(contentType, "text/") && !strings.Contains(contentType, "html") {
// 			return nil // skip non-text responses
// 		}

// 		// Read the body
// 		bodyBytes, err := io.ReadAll(resp.Body)
// 		if err != nil {
// 			return err
// 		}
// 		resp.Body.Close()

// 		// Replace all links starting with oldDomain
// 		modifiedBody := strings.ReplaceAll(string(bodyBytes), oldDomain, "http://127.0.0.1:8020/"+serviceMachineName)

// 		// Replace the body with the modified content
// 		resp.Body = io.NopCloser(bytes.NewBufferString(modifiedBody))
// 		resp.ContentLength = int64(len(modifiedBody))
// 		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedBody)))
// 		return nil
// 	}
// }
