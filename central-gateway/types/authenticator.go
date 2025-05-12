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
	Request            *http.Request
	ResponseWriter     http.ResponseWriter
	Code               *int
	Service            string
	ServiceMachineName string
	ServiceId          string
	SystemLog          SystemLogInterface
	Endpoints          *MapEndPoint
	Proxy              *httputil.ReverseProxy
}

func (auth *Authenticator) PopulateAuthenticate(endpoints *MapEndPoint, managerCredentials *ManagerLogInCredentials) error {
	auth.Endpoints = endpoints
	err := auth.UrlData(endpoints)
	if err != nil {
		return err
	}
	serviceDetails := map[string]string{"service": auth.ServiceMachineName, "serviceId": auth.ServiceId}
	return auth.SystemLog.Populate(auth.Request, serviceDetails, managerCredentials)
}

func (auth *Authenticator) VerifyService() error {
	return nil
}

func (auth *Authenticator) UrlData(endpoints *MapEndPoint) error {
	auth.ServiceMachineName = auth.GetServiceName(auth.Request.URL.Path)
	auth.Service = auth.GetServiceName(auth.Request.URL.Path)
	path := auth.Request.URL.Path
	log.Println(path)
	endPoint, exists := endpoints.GetEndPoint(auth.Service)
	if !exists {
		data := map[string]string{"message": "Service Not Found"}
		auth.ResponseWriter.WriteHeader(http.StatusNotFound)
		json.NewEncoder(auth.ResponseWriter).Encode(data)
		return fmt.Errorf("service not found")
	}
	auth.ServiceId = endPoint.ServiceId
	auth.Request.URL.Path = strings.Replace(path, auth.ServiceMachineName, "/"+endPoint.FixedPath+"/", 1)
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

//	func NewAuthenticator(w http.ResponseWriter, r *http.Request) *Authenticator {
//		return &Authenticator{
//			Request:        r,
//			ResponseWriter: w,
//			SystemLog:      &SystemLog{},
//		}
//	}
func NewAuthenticator(r *http.Request) *Authenticator {
	return &Authenticator{
		Request:   r,
		SystemLog: &SystemLog{},
	}
}
