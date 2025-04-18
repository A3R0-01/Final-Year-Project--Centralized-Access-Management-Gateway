package service

import (
	"encoding/json"
	"fmt"
	"net/http/httputil"
	"time"

	"github.com/go-kit/log"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"

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
			globalReqCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: "global_request_counter",
				Name:      "global",
			}),
			serviceReqCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: next.GetServiceMachineName() + "_request_counter",
				Name:      next.GetServiceMachineName(),
			}),
			globalErrCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: "global_error_counter",
				Name:      "global",
			}),
			serviceErrCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: next.GetServiceMachineName() + "_error_counter",
				Name:      next.GetServiceMachineName(),
			}),
			globalReqLatency: promauto.NewHistogram(prometheus.HistogramOpts{
				Namespace: "global_request_latency",
				Name:      "global",
				Buckets:   []float64{0.1, 0.5, 1.0},
			}),
			serviceReqLatency: promauto.NewHistogram(prometheus.HistogramOpts{
				Namespace: next.GetServiceMachineName() + "_request_latency",
				Name:      next.GetServiceMachineName(),
				Buckets:   []float64{0.1, 0.5, 1.0},
			}),
			globalErrLatency: promauto.NewHistogram(prometheus.HistogramOpts{
				Namespace: "global_error_latency",
				Name:      "global",
				Buckets:   []float64{0.1, 0.5, 1.0},
			}),
			serviceErrLatency: promauto.NewHistogram(prometheus.HistogramOpts{
				Namespace: next.GetServiceMachineName() + "_error_latency",
				Name:      next.GetServiceMachineName(),
				Buckets:   []float64{0.1, 0.5, 1.0},
			}),

			next:               next,
			ServiceName:        next.GetServiceName(),
			ServiceMachineName: next.GetServiceMachineName(),
			ServiceId:          next.GetServiceId(),
			Proxy:              next.GetProxy(),
		}
	}
}

type InstrumentingMiddleware struct {
	globalReqCounter   prometheus.Counter
	serviceReqCounter  prometheus.Counter
	globalErrCounter   prometheus.Counter
	serviceErrCounter  prometheus.Counter
	globalReqLatency   prometheus.Histogram
	serviceReqLatency  prometheus.Histogram
	globalErrLatency   prometheus.Histogram
	serviceErrLatency  prometheus.Histogram
	next               Service
	ServiceName        string
	ServiceMachineName string
	ServiceId          string
	Proxy              *httputil.ReverseProxy
}

func (isMiddleware *InstrumentingMiddleware) Serve(auth *types.Authenticator) (returnAuth *types.Authenticator, err error) {
	defer func(start time.Time) {
		if err != nil {
			isMiddleware.globalErrCounter.Inc()
			isMiddleware.serviceErrCounter.Inc()
			isMiddleware.globalErrLatency.Observe(float64(time.Since(start).Seconds()))
			isMiddleware.serviceErrLatency.Observe(float64(time.Since(start).Seconds()))

		}
		isMiddleware.serviceReqCounter.Inc()
		isMiddleware.globalReqCounter.Inc()
		isMiddleware.globalReqLatency.Observe(float64(time.Since(start).Seconds()))
		isMiddleware.serviceReqLatency.Observe(float64(time.Since(start).Seconds()))

	}(time.Now())
	returnAuth, err = isMiddleware.next.Serve(auth)
	return
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
