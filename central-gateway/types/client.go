package types

import (
	"net/http"
	"net/url"
)

type HandlerFunc func(http.ResponseWriter, *http.Request)

type HandleServeInterface interface {
	Serve(interface{})
}

type Endpoint struct {
	ServiceName string
	MachineName string
	URL         *url.URL
	FixedPath   string
	Methods     []string
	ServiceId   string
}
type MapEndPoint map[string]*Endpoint

func (m MapEndPoint) GetEndPoint(name string) (*Endpoint, bool) {
	endPoint, exists := m[name]
	return endPoint, exists
}

type AssociationClient struct {
	Endpoints []Endpoint `json:"endpoints"`
	Service   string     `json:"company"`
	Type      string     `json:"http"`
}

type RequestData struct {
	Model    string
	Method   string
	UserType string
	URL      *url.URL
}
