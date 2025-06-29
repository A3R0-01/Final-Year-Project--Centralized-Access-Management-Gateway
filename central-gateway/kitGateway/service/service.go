package service

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io"
	normalLog "log"
	"strconv"
	"strings"

	"github.com/go-kit/log"

	"net/http"
	"net/http/httputil"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/system"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
)

type Service interface {
	Serve(*types.Authenticator) (*types.Authenticator, error)
	GetServiceName() string
	GetServiceId() string
	GetServiceMachineName() string
	GetProxy() *httputil.ReverseProxy
}

type BasicService struct {
	EndPoints          types.MapEndPoint
	Endpoint           *types.Endpoint
	ServiceName        string
	ServiceMachineName string
	ServiceId          string
	Proxy              *httputil.ReverseProxy
}

func (srvc *BasicService) GetServiceName() string {
	return srvc.ServiceName
}
func (srvc *BasicService) GetServiceId() string {
	return srvc.ServiceId
}
func (srvc *BasicService) GetServiceMachineName() string {
	return srvc.ServiceMachineName
}
func (srvc *BasicService) GetProxy() *httputil.ReverseProxy {
	return srvc.Proxy
}

func (srvc *BasicService) Serve(auth *types.Authenticator) (*types.Authenticator, error) {
	if auth.Service != srvc.ServiceMachineName {
		normalLog.Println("Proxy not found")
		return auth, fmt.Errorf("service not found")
	}
	proxy := *srvc.Proxy
	newProxy := &proxy
	proxy.ModifyResponse = func(resp *http.Response) error {
		// Rewrite headers pointing to original service
		for key, values := range resp.Header {
			for i, val := range values {
				if strings.Contains(val, srvc.Endpoint.URL.Host) {
					updated := strings.Replace(val, srvc.Endpoint.URL.String(), types.GatewayDomain+"/"+srvc.Endpoint.MachineName, 1)
					resp.Header[key][i] = updated
				}
			}
		}

		contentType := resp.Header.Get("Content-Type")

		encoding := resp.Header.Get("Content-Encoding")
		originalEncoding := encoding // remember it for recompression

		decompressed, err := decompressBody(resp.Body, encoding)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()
		// Remove encoding so we can safely modify
		resp.Header.Del("Content-Encoding")

		var modified []byte
		modified = decompressed
		// fmt.Println(auth.SystemLog.GetSpecialUser() + "\n\n")
		if strings.Contains(contentType, "text/html") {

			targetURL := srvc.Endpoint.URL.Scheme + "://" + srvc.Endpoint.URL.Host
			if uri := srvc.Endpoint.URL.RequestURI(); uri != "/" {
				targetURL += uri
			}
			modified = injectBaseTag(modified, srvc.Endpoint.MachineName, targetURL)
		} else if strings.Contains(contentType, "text/css") {
			targetURL := srvc.Endpoint.URL.Scheme + "://" + srvc.Endpoint.URL.Host
			if uri := srvc.Endpoint.URL.RequestURI(); uri != "/" {
				targetURL += uri
			}
			modified = rewriteCSSUrlsToGateway(modified, srvc.Endpoint.MachineName, targetURL)
		} else if (strings.Contains(contentType, "application/json") || strings.Contains(contentType, "text/json")) && strings.ToLower(auth.SystemLog.GetSpecialUser()) == "citizen" {
			// Add JSON URL rewriting here
			for _, serviceEndPoint := range srvc.EndPoints {
				targetURL := serviceEndPoint.URL.Scheme + "://" + serviceEndPoint.URL.Host
				if uri := serviceEndPoint.URL.RequestURI(); uri != "/" {
					targetURL += uri
				}
				modified = rewriteJSONUrls(modified, serviceEndPoint.MachineName, targetURL)
			}
		} else {
			modified = decompressed
		}

		// Recompress to match original encoding
		var finalBody bytes.Buffer
		if originalEncoding != "" {
			err := compressBody(&finalBody, modified, originalEncoding)
			if err != nil {
				return err
			}
			resp.Header.Set("Content-Encoding", originalEncoding)
		} else {
			finalBody.Write(modified)
		}

		// Set updated body and headers
		// fmt.Println("the content length: \n", finalBody.Len(), "     "+strconv.Itoa(finalBody.Len()))
		resp.Body = io.NopCloser(&finalBody)
		resp.ContentLength = int64(finalBody.Len())
		resp.Header.Set("Content-Length", strconv.Itoa(finalBody.Len()))

		return nil
	}
	previousModifyResponse := proxy.ModifyResponse
	newProxy.ModifyResponse = func(response *http.Response) error {
		if previousModifyResponse != nil {
			if err := previousModifyResponse(response); err != nil {
				return err
			}
		}
		auth.Code = &response.StatusCode
		return nil
	}
	auth.Proxy = &proxy
	return auth, nil
}

func NewBasicService(endPoint *types.Endpoint) *BasicService {
	proxy := httputil.NewSingleHostReverseProxy(endPoint.URL)
	proxy.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	proxy.Director = func(r *http.Request) {
		r.URL.Scheme = endPoint.URL.Scheme
		r.URL.Host = endPoint.URL.Host
		r.Host = endPoint.URL.Host
		r.URL.Path = types.RefineUrl(endPoint.URL.Path + "/" + r.URL.Path)
		if ua := r.Header.Get("User-Agent"); ua != "" {
			r.Header.Set("User-Agent", ua)
		}
	}
	return &BasicService{
		Endpoint:           endPoint,
		ServiceName:        endPoint.ServiceName,
		ServiceMachineName: endPoint.MachineName,
		ServiceId:          endPoint.ServiceId,
		Proxy:              proxy,
	}
}

// func NewProducer() (*kafka.Producer, error) {
// 	producer, err := kafka.NewProducer(&kafka.ConfigMap{
// 		"bootstrap.servers": "localhost",
// 	})
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create the producer: %s", err.Error())
// 	}
// 	go func() {
// 		for e := range producer.Events() {
// 			switch ev := e.(type) {
// 			case *kafka.Message:
// 				if ev.TopicPartition.Error != nil {
// 					normalLog.Printf("Delivery failed: %v\n ", ev.TopicPartition)
// 				} else {
// 					normalLog.Printf("Delivered message: to %v\n", ev.TopicPartition)
// 				}
// 			}
// 		}
// 	}()
// 	return producer, nil
// }

func New(logger log.Logger, server *system.Server, globalMetricsHolder *types.GlobalMetricsHolder) []Service {
	var services []Service
	for _, endP := range server.EndPoints {
		{
			basicService := NewBasicService(endP)
			basicService.EndPoints = server.EndPoints
			service := NewLoggingMiddleware(logger, &server.Credentials)(basicService)
			service = NewInstrumentingMiddleware(globalMetricsHolder)(service)
			services = append(services, service)
		}

	}
	return services
}
