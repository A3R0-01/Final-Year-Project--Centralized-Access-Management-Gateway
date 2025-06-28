package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"
	"time"

	"github.com/go-kit/log"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
)

// type Middleware func(*BasicService) Service
type Middleware func(Service) Service

type LoggingMiddleware struct {
	log                log.Logger
	ServiceName        string
	ServiceMachineName string
	ServiceId          string
	next               Service
	Proxy              *httputil.ReverseProxy
	Credentials        *types.ManagerLogInCredentials
}

func NewLoggingMiddleware(logger log.Logger, credentials *types.ManagerLogInCredentials) Middleware {
	return func(service Service) Service {
		return &LoggingMiddleware{
			log:                logger,
			ServiceName:        service.GetServiceName(),
			ServiceMachineName: service.GetServiceMachineName(),
			ServiceId:          service.GetServiceId(),
			Proxy:              service.GetProxy(),
			Credentials:        credentials,
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
		return fmt.Errorf("failed to marshal log data")
	}
	// fmt.Println(logOutput)
	req, err := http.NewRequest("POST", types.CentralDomain+"manager/log/manager/", bytes.NewBuffer(jsonLog))
	if err != nil {
		return fmt.Errorf("failed create the request to push the log")
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+md.Credentials.Access)
	// err = md.producer.Produce(
	// 	&kafka.Message{
	// 		TopicPartition: kafka.TopicPartition{Topic: &types.KafkaLoggerTopic, Partition: kafka.PartitionAny},
	// 		Value:          jsonLog},
	// 	nil,
	// )
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to push data to central access management")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("failed to push log: server side")
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

func NewInstrumentingMiddleware(globalMetricsHolder *types.GlobalMetricsHolder) Middleware {
	return func(next Service) Service {
		globalMetricsHolder.GlobalServicesCounter.Inc()
		return &InstrumentingMiddleware{
			globalReqCounter: globalMetricsHolder.GlobalReqCounter,
			globalErrCounter: globalMetricsHolder.GlobalErrCounter,
			globalReqLatency: globalMetricsHolder.GlobalReqLatency,
			globalErrLatency: globalMetricsHolder.GlobalErrLatency,
			serviceReqCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: next.GetServiceMachineName() + "_request_counter",
				Name:      next.GetServiceMachineName(),
			}),

			serviceErrCounter: promauto.NewCounter(prometheus.CounterOpts{
				Namespace: next.GetServiceMachineName() + "_error_counter",
				Name:      next.GetServiceMachineName(),
			}),

			serviceReqLatency: promauto.NewHistogram(prometheus.HistogramOpts{
				Namespace: next.GetServiceMachineName() + "_request_latency",
				Name:      next.GetServiceMachineName(),
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
