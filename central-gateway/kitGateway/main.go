package main

import (
	"net"
	"net/http"
	"os"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/service"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/serviceEndpoint"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/serviceTransport"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/kitGateway/system"
	"github.com/go-kit/kit/metrics"
	"github.com/go-kit/kit/metrics/prometheus"
	"github.com/go-kit/log"
	stdprometheus "github.com/prometheus/client_golang/prometheus"
)

func main() {
	httpAddr := "8020"
	var logger log.Logger
	{
		logger = log.NewLogfmtLogger(os.Stderr)
		logger = log.With(logger, "ts", log.DefaultTimestampUTC)
		logger = log.With(logger, "caller", log.DefaultCaller)
	}
	var duration metrics.Histogram
	{
		duration = prometheus.NewSummaryFrom(stdprometheus.SummaryOpts{
			Namespace: "Central Access Gateway",
			Subsystem: "GateWay Metrics",
			Name:      "request_duration_seconds",
			Help:      "Request duration in seconds",
		}, []string{"method", "success"})
	}

	var (
		httpListener, err = net.Listen("tcp", httpAddr)
		server            = system.NewServer()
		basicServices     = service.New(logger, server)
		endPoints         = serviceEndpoint.New(basicServices, logger, duration)
		httpHandler       = serviceTransport.NewHTTPHandler(endPoints, server, logger)
	)

	if err != nil {
		logger.Log("transport", "HTTP", "during", "Listen", "err", err)
		os.Exit(1)
	}
	logger.Log("transport", "HTTP", "addr", httpAddr)
	err = http.Serve(httpListener, httpHandler)
	if err != nil {
		panic(err)
	}
}
