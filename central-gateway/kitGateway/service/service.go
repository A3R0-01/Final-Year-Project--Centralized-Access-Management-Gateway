package service

import (
	"crypto/tls"
	"fmt"
	normalLog "log"

	"github.com/go-kit/log"

	"net/http"
	"net/http/httputil"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/system"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

type Service interface {
	Serve(*types.Authenticator) (*types.Authenticator, error)
	GetServiceName() string
	GetServiceId() string
	GetServiceMachineName() string
	GetProxy() *httputil.ReverseProxy
}

type BasicService struct {
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
	proxy.ModifyResponse = func(response *http.Response) error {
		auth.Code = &response.StatusCode
		return nil
	}
	normalLog.Println("this is the proxy: ", srvc.Proxy)
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
		// r.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
	}
	return &BasicService{
		Endpoint:           endPoint,
		ServiceName:        endPoint.ServiceName,
		ServiceMachineName: endPoint.MachineName,
		ServiceId:          endPoint.ServiceId,
		Proxy:              proxy,
	}
}

func NewProducer() (*kafka.Producer, error) {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": "localhost",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create the producer: %s", err.Error())
	}
	go func() {
		for e := range producer.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					normalLog.Printf("Delivery failed: %v\n ", ev.TopicPartition)
				} else {
					normalLog.Printf("Delivered message: to %v\n", ev.TopicPartition)
				}
			}
		}
	}()
	return producer, nil
}

func New(logger log.Logger, server *system.Server, globalMetricsHolder *types.GlobalMetricsHolder) []Service {
	var services []Service
	producer, err := NewProducer()
	if err != nil {
		normalLog.Fatal("failed to create producer: ", err)
	}
	for _, endP := range server.EndPoints {
		{
			basicService := NewBasicService(endP)
			service := NewLoggingMiddleware(logger, producer)(basicService)
			service = NewInstrumentingMiddleware(globalMetricsHolder)(service)
			services = append(services, service)
		}

	}
	return services
}
