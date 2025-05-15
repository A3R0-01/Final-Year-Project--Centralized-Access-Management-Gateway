package serviceEndpoint

import (
	"context"
	"time"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/service"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/go-kit/kit/circuitbreaker"
	"github.com/go-kit/kit/endpoint"
	"github.com/go-kit/kit/metrics"
	"github.com/go-kit/kit/ratelimit"
	"github.com/go-kit/log"
	"github.com/sony/gobreaker"
	"golang.org/x/time/rate"
)

type Set struct {
	ServiceMachineName string
	ServiceEndpoint    endpoint.Endpoint
}

func New(service service.Service, logger log.Logger, duration metrics.Histogram) *Set {

	var serviceEndpoint endpoint.Endpoint
	{
		serviceEndpoint = MakeServiceEndpoint(service)
		serviceEndpoint = ratelimit.NewErroringLimiter(rate.NewLimiter(rate.Every(time.Second), 20))(serviceEndpoint)
		serviceEndpoint = circuitbreaker.Gobreaker(gobreaker.NewCircuitBreaker(gobreaker.Settings{}))(serviceEndpoint)
		serviceEndpoint = LoggingMiddleware(log.With(logger, "method", service.GetServiceName()))(serviceEndpoint)
		serviceEndpoint = InstrumentingMiddleware(duration.With("method", service.GetServiceName()))(serviceEndpoint)

	}
	return &Set{
		ServiceEndpoint:    serviceEndpoint,
		ServiceMachineName: service.GetServiceMachineName(),
	}
}

func MakeServiceEndpoint(service service.Service) endpoint.Endpoint {
	return func(ctc context.Context, request interface{}) (response interface{}, err error) {
		req := request.(*types.Authenticator)
		return service.Serve(req)
	}
}
