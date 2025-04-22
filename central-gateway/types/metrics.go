package types

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

type GlobalMetricsHolder struct {
	GlobalReqLatency      prometheus.Histogram
	GlobalErrLatency      prometheus.Histogram
	GlobalReqCounter      prometheus.Counter
	GlobalErrCounter      prometheus.Counter
	GlobalServicesCounter prometheus.Counter
}

func NewGlobalMetricsHolder() *GlobalMetricsHolder {

	globalReqLatency := promauto.NewHistogram(prometheus.HistogramOpts{
		Namespace: "global_request_latency",
		Name:      "global",
		Buckets:   []float64{0.1, 0.5, 1.0},
	})
	globalErrLatency := promauto.NewHistogram(prometheus.HistogramOpts{
		Namespace: "global_error_latency",
		Name:      "global",
		Buckets:   []float64{0.1, 0.5, 1.0},
	})
	globalReqCounter := promauto.NewCounter(prometheus.CounterOpts{
		Namespace: "global_request_counter",
		Name:      "global",
	})
	globalErrCounter := promauto.NewCounter(prometheus.CounterOpts{
		Namespace: "global_error_counter",
		Name:      "global",
	})
	globalServicesCounter := promauto.NewCounter(prometheus.CounterOpts{
		Namespace: "global_services_counter",
		Name:      "global",
	})

	return &GlobalMetricsHolder{
		GlobalReqLatency:      globalReqLatency,
		GlobalErrLatency:      globalErrLatency,
		GlobalReqCounter:      globalReqCounter,
		GlobalErrCounter:      globalErrCounter,
		GlobalServicesCounter: globalServicesCounter,
	}

}
