package types

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"strings"
)

type Authenticator struct {
	Request        *http.Request
	ResponseWriter http.ResponseWriter
	Code           *int
	Service        string
	ServiceId      string
	SystemLog      SystemLogInterface
	Proxy          *httputil.ReverseProxy
}

func (auth *Authenticator) PopulateAuthenticate(endpoints *MapEndPoint) error {
	err := auth.UrlData(endpoints)
	if err != nil {
		return err
	}
	if err := auth.SystemLog.Populate(auth.Request); err != nil {
		data := map[string]string{"message": "Authentication Failed"}
		auth.ResponseWriter.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(auth.ResponseWriter).Encode(data)
		return err
	}
	return nil
}

func (auth *Authenticator) UrlData(endpoints *MapEndPoint) error {
	auth.Service = auth.GetServiceName(auth.Request.URL.Path)
	path := auth.Request.URL.Path
	fmt.Println(path)
	endPoint, exists := endpoints.GetEndPoint(auth.Service)
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		auth.ResponseWriter.WriteHeader(http.StatusNotFound)
		json.NewEncoder(auth.ResponseWriter).Encode(data)
		return fmt.Errorf("Service Not Found")
	}
	auth.ServiceId = endPoint.ServiceId
	auth.Request.URL.Path = strings.Replace(path, auth.Service, "/"+endPoint.FixedPath+"/", 1)

	auth.Request.URL.Path = RefineUrl(auth.Request.URL.Path)
	fmt.Println(auth.Request.URL.Path)
	return nil
}
func (auth *Authenticator) GetServiceName(r string) string {
	parts := strings.FieldsFunc(r, func(rw rune) bool {
		return rw == '/'
	})
	log.Println("service accessed", parts[0])
	return parts[0]
}

func NewAuthenticator(w http.ResponseWriter, r *http.Request) *Authenticator {
	return &Authenticator{
		Request:        r,
		ResponseWriter: w,
		SystemLog:      &SystemLog{},
	}
}
