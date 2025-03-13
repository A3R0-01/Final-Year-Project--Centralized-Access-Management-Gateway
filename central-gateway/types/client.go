package types

import (
	"net/http"
	"net/url"
)

type HandlerFunc func(http.ResponseWriter, *http.Request)

type ServerInterface interface {
	HandleServe(http.ResponseWriter, *http.Request)
}

type Endpoint struct {
	ServiceName string
	MachineName string
	URL         *url.URL
	FixedPath   string
	Methods     []string
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

type Authenticator struct {
	Request        *http.Request
	ResponseWriter http.ResponseWriter
}

func (auth *Authenticator) Authenticate()
