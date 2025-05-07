package serviceTransport

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	normalLog "log"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	server "github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/Server"
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
	case "service not found":
		w.WriteHeader(http.StatusNotFound)
	case "service error":
		w.WriteHeader(http.StatusInternalServerError)
	case "service unauthorized":
		w.WriteHeader(http.StatusUnauthorized)
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
		auth.Proxy.ModifyResponse
		user := auth.SystemLog.GetSpecialUser()
		if !(user == "manager" || user == "admin" || user == "grantee") {
			previousFunc := auth.Proxy.ModifyResponse
			auth.Proxy.ModifyResponse = createResponseModifier(auth.)
		}
		// 	auth.Proxy.ModifyResponse = func(resp *http.Response) error {
		// 		if previousFunc != nil {
		// 			if err := previousFunc(resp); err != nil {
		// 				return err
		// 			}
		// 		}
		// 		contentType := resp.Header.Get("Content-Type")
		// 		// Only process text-based responses
		// 		if !(strings.HasPrefix(contentType, "text/") ||
		// 			strings.Contains(contentType, "html") ||
		// 			strings.Contains(contentType, "json") ||
		// 			strings.Contains(contentType, "javascript") ||
		// 			strings.Contains(contentType, "xml") ||
		// 			strings.Contains(contentType, "css")) {
		// 			return nil // Skip binary or irrelevant types (e.g., images, PDF, etc.)
		// 		}
		// 		// Read and close the original body
		// 		bodyBytes, err := io.ReadAll(resp.Body)
		// 		if err != nil {
		// 			return err
		// 		}
		// 		resp.Body.Close()
		// 		modifiedBody := string(bodyBytes)
		// 		// Replace all occurrences of internal service URLs with gateway paths
		// 		for _, endPoint := range server.EndPoints {
		// 			targetURL := endPoint.URL.Scheme + "://" + endPoint.URL.Host
		// 			if uri := endPoint.URL.RequestURI(); uri != "/" {
		// 				targetURL += uri
		// 			}
		// 			gatewayPath := "http://127.0.0.1:8020/" + endPoint.MachineName
		// 			modifiedBody = strings.ReplaceAll(modifiedBody, targetURL, gatewayPath)
		// 		}
		// 		// Reset response body with modified content
		// 		resp.Body = io.NopCloser(bytes.NewBufferString(modifiedBody))
		// 		resp.ContentLength = int64(len(modifiedBody))
		// 		resp.Header.Set("Content-Length", strconv.Itoa(len(modifiedBody)))
		// 		return nil
		// 	}
		// }
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

func createResponseModifier(gatewayHost, gatewayBase, token string, server *server.Server, previousFunc func(*http.Response) error) func(*http.Response) error {
	// Token is passed as a parameter

	return func(resp *http.Response) error {
		// Check if content type should be processed
		err := previousFunc(resp); err != nil{
			return err
		}
		contentType := resp.Header.Get("Content-Type")
		shouldProcess := strings.Contains(contentType, "text/html") ||
			strings.Contains(contentType, "text/css") ||
			strings.Contains(contentType, "application/javascript") ||
			strings.Contains(contentType, "application/json") ||
			strings.Contains(contentType, "text/xml")

		if !shouldProcess {
			return nil
		}

		// Read the original response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		resp.Body.Close()

		// Function to add token to URL
		addTokenToURL := func(urlStr string) string {
			parsedURL, err := url.Parse(urlStr)
			if err != nil {
				// If URL parsing fails, just append the token as a query parameter
				if strings.Contains(urlStr, "?") {
					return urlStr + "&token=" + token
				}
				return urlStr + "?token=" + token
			}

			q := parsedURL.Query()
			q.Set("token", token)
			parsedURL.RawQuery = q.Encode()
			return parsedURL.String()
		}

		// Replace absolute URLs (with protocol)
		// First, create a replacement that includes the token
		for _, endPoint := range server.EndPoints {
			targetURL := endPoint.URL.Scheme + "://" + endPoint.URL.Host
			if uri := endPoint.URL.RequestURI(); uri != "/" {
					targetURL += uri
			}
			tokenizedGatewayURL := addTokenToURL(gatewayBase)
			modifiedBody := bytes.ReplaceAll(body, []byte(targetURL), []byte(tokenizedGatewayURL))
			targetHost := endPoint.URL.Host
			if uri := endPoint.URL.RequestURI(); uri != "/" {
				targetHost += uri
			}
			// Handle protocol-relative URLs with token
			protocolRelativePattern := regexp.MustCompile(`(//)` + targetHost + `(/[^"'\s>]*)`)
			modifiedBody = protocolRelativePattern.ReplaceAllFunc(modifiedBody, func(match []byte) []byte {
				parts := protocolRelativePattern.FindSubmatch(match)
				if len(parts) >= 3 {
					path := string(parts[2])
					// Create a dummy URL to use the addTokenToURL function
					dummyURL := "http:" + string(parts[1]) + types.RefineUrl(gatewayHost + path)
					tokenizedURL := addTokenToURL(dummyURL)
					// Remove the protocol part added for parsing
					tokenizedURLWithoutProtocol := strings.TrimPrefix(tokenizedURL, "http:")
					return []byte(tokenizedURLWithoutProtocol)
				}
				return match
			})

			// Replace URLs in href and src attributes
			hrefSrcPattern := regexp.MustCompile(`(href|src)=["'](?:https?:)?//` + targetHost + `(/[^"']*)(["'])`)
			modifiedBody = hrefSrcPattern.ReplaceAllFunc(modifiedBody, func(match []byte) []byte {
				parts := hrefSrcPattern.FindSubmatch(match)
				if len(parts) >= 4 {
					attr := string(parts[1])
					path := string(parts[2])
					quote := string(parts[3])

					// Create URL with token
					fullURL := "https://" + types.RefineUrl(gatewayHost + path)
					tokenizedURL := addTokenToURL(fullURL)

					// Remove protocol for protocol-relative URLs if original was protocol-relative
					if !bytes.Contains(match, []byte("https:")) && !bytes.Contains(match, []byte("http:")) {
						tokenizedURL = strings.TrimPrefix(tokenizedURL, "https:")
					}

					return []byte(attr + "=" + quote + tokenizedURL + quote)
				}
				return match
			})
		}


		// Replace absolute paths (starting with /)
		absolutePathPattern := regexp.MustCompile(`(href|src|action)=["'](/[^"'?]*)([?][^"']*)?["']`)
		modifiedBody = absolutePathPattern.ReplaceAllFunc(modifiedBody, func(match []byte) []byte {
			parts := absolutePathPattern.FindSubmatch(match)
			if len(parts) >= 3 {
				attr := string(parts[1])
				path := string(parts[2])
				query := ""
				quote := `"`

				if len(parts) >= 4 && len(parts[3]) > 0 {
					query = string(parts[3])
				}
				if bytes.HasSuffix(match, []byte("'")) {
					quote = "'"
				}

				// Add token to query
				if query != "" {
					query = query + "&token=" + token
				} else {
					query = "?token=" + token
				}

				return []byte(attr + "=" + quote + path + query + quote)
			}
			return match
		})

		for _, endPoint := range server.EndPoints {
			targetHost := endPoint.URL.Host
			if uri := endPoint.URL.RequestURI(); uri != "/" {
				targetHost += uri
			}

			// Use regex for more complex URL replacements in HTML/JS
			if strings.Contains(contentType, "text/html") || strings.Contains(contentType, "application/javascript") {
				// Replace URLs in various formats that might appear in HTML or JS
				// For example: domain: "targetHost" or domain: 'targetHost'
				domainPattern := regexp.MustCompile(`(['"]\s*domain\s*['"]?\s*[:=]\s*['"])` + targetHost + `(['"])`)
				modifiedBody = domainPattern.ReplaceAll(modifiedBody, []byte("${1}"+gatewayHost+"${2}"))

				// Replace API endpoints or other patterns specific to your application
				apiPattern := regexp.MustCompile(`(api\.url\s*=\s*['"])` + targetHost + `(['"])`)
				modifiedBody = apiPattern.ReplaceAll(modifiedBody, []byte("${1}"+gatewayHost+"${2}"))

				// Handle JavaScript URL constructions
				jsURLPattern := regexp.MustCompile(`(["'])https?://` + targetHost + `(/[^"']+)(["'])`)
				modifiedBody = jsURLPattern.ReplaceAllFunc(modifiedBody, func(match []byte) []byte {
					parts := jsURLPattern.FindSubmatch(match)
					if len(parts) >= 4 {
						quote := string(parts[1])
						path := string(parts[2])
						endQuote := string(parts[3])

						fullURL := "https://" + types.RefineUrl(gatewayHost + path)
						tokenizedURL := addTokenToURL(fullURL)

						return []byte(quote + tokenizedURL + endQuote)
					}
					return match
				})
			}
		}
		// Update content length and replace body
		resp.ContentLength = int64(len(modifiedBody))
		resp.Body = io.NopCloser(bytes.NewReader(modifiedBody))

		// Update Location header if present (for redirects)
		if location := resp.Header.Get("Location"); location != "" {
			tokenizedLocation := addTokenToURL(strings.Replace(location, targetBase, gatewayBase, -1))
			resp.Header.Set("Location", tokenizedLocation)
		}

		return nil
	}
}
