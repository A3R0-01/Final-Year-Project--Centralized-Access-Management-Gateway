package service

import (
	"encoding/json"
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
	Serve(*types.Authenticator)
}

type BasicService struct {
	Endpoint    *types.Endpoint
	ServiceName string
	ServiceId   string
	Proxy       *httputil.ReverseProxy
}

func (srvc *BasicService) Serve(auth *types.Authenticator) {
	if auth.Service != srvc.ServiceName {
		data := map[string]string{"message": "Service Not Found"}
		auth.ResponseWriter.WriteHeader(http.StatusNotFound)
		json.NewEncoder(auth.ResponseWriter).Encode(data)
		*auth.Code = http.StatusNotFound
		log.Println("Proxy not found")
	}
	srvc.Proxy.ModifyResponse = func(response *http.Response) error {
		*auth.Code = response.StatusCode
		return nil
	}
	log.Println("this is the proxy: ", srvc.Proxy)
	srvc.Proxy.ServeHTTP(auth.ResponseWriter, auth.Request)
}

func NewBasicService(endPoint *types.Endpoint) *BasicService {
	proxy := httputil.NewSingleHostReverseProxy(endPoint.URL)
	return &BasicService{
		Endpoint:    endPoint,
		ServiceName: endPoint.ServiceName,
		ServiceId:   endPoint.ServiceId,
		Proxy:       proxy,
	}
}

func NewProducer() (*kafka.Producer, nil) {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": "host1:9092, host2:9092",
		"client.id":         "central-access-gateway",
		"acks":              "all",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create the producer: %s", err.Error())
	}
	go func() {
		for e := range producer.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Printf("Delivery failed: %v\n ", ev.TopicPartition)
				} else {
					log.Printf("Delivered message: to %v\n", ev.TopicPartition)
				}
			}
		}
	}()
	return producer, nil
}

func New(logger log.Logger) []Service {
	var services []Service

	server := system.NewServer()
	producer, err := NewProducer()
	if err != nil {
		normalLog.Fatal("failed to create producer: ", err)
	}
	for _, endP := range server.EndPoints {
		{
			service := NewBasicService(endP)
			service = NewLoggingMiddleware(logger, producer)(service)
		}
		services = append(services, service)
	}
	return services
}
