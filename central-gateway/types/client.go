package types

import (
	"net/http"
	"net/url"
)

type HandlerFunc func(http.ResponseWriter, *http.Request)

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
