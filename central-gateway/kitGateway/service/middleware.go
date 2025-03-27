package service

import (
	"encoding/json"
	"fmt"
	"net/http/httputil"
	"time"

	"github.com/go-kit/log"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

// type Middleware func(*BasicService) Service
type Middleware func(Service) Service

type LoggingMiddleware struct {
	log                log.Logger
	producer           *kafka.Producer
	ServiceName        string
	ServiceMachineName string
	ServiceId          string
	next               Service
	Proxy              *httputil.ReverseProxy
}

func NewLoggingMiddleware(logger log.Logger, producer *kafka.Producer) Middleware {
	return func(service Service) Service {
		return &LoggingMiddleware{
			log:                logger,
			producer:           producer,
			ServiceName:        service.GetServiceName(),
			ServiceMachineName: service.GetServiceMachineName(),
			ServiceId:          service.GetServiceId(),
			Proxy:              service.GetProxy(),
			next:               service,
		}
	}
}

func (md *LoggingMiddleware) LogData(auth *types.Authenticator) error {
	logOutput, err := auth.SystemLog.GenerateLog()
	if err != nil {
		return fmt.Errorf("failed to generate log")
	}
	jsonLog, err := json.Marshal(logOutput)
	if err != nil {
		return fmt.Errorf("Failed to marshal log data")
	}
	err = md.producer.Produce(
		&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &types.KafkaLoggerTopic, Partition: kafka.PartitionAny},
			Value:          jsonLog},
		nil,
	)
	if err != nil {
		return fmt.Errorf("Failed to push data to kafka")
	}
	return nil

}

func (md *LoggingMiddleware) GetServiceName() string {
	return md.ServiceName
}
func (md *LoggingMiddleware) GetServiceId() string {
	return md.ServiceId
}
func (md *LoggingMiddleware) GetServiceMachineName() string {
	return md.ServiceMachineName
}
func (md *LoggingMiddleware) GetProxy() *httputil.ReverseProxy {
	return md.Proxy
}

func (md *LoggingMiddleware) Serve(auth *types.Authenticator) (*types.Authenticator, error) {
	defer func(start time.Time) {
		err := md.LogData(auth)
		md.log.Log("method", md.ServiceId, "took", time.Since(start), "err", err)
	}(time.Now())
	return md.next.Serve(auth)
}

func NewInstrumentingMiddleware() Middleware {
	return func(next Service) Service {
		return &InstrumentingMiddleware{
			next:               next,
			ServiceName:        next.GetServiceName(),
			ServiceMachineName: next.GetServiceMachineName(),
			ServiceId:          next.GetServiceId(),
			Proxy:              next.GetProxy(),
		}
	}
}

type InstrumentingMiddleware struct {
	next               Service
	ServiceName        string
	ServiceMachineName string
	ServiceId          string
	Proxy              *httputil.ReverseProxy
}

func (isMiddleware *InstrumentingMiddleware) Serve(auth *types.Authenticator) (*types.Authenticator, error) {
	return isMiddleware.next.Serve(auth)
}

func (isMiddleware *InstrumentingMiddleware) GetServiceName() string {
	return isMiddleware.ServiceName
}
func (isMiddleware *InstrumentingMiddleware) GetServiceMachineName() string {
	return isMiddleware.ServiceMachineName
}
func (isMiddleware *InstrumentingMiddleware) GetServiceId() string {
	return isMiddleware.ServiceId
}
func (isMiddleware *InstrumentingMiddleware) GetProxy() *httputil.ReverseProxy {
	return isMiddleware.Proxy
}
