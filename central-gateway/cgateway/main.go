package main

import (
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	server "github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/Server"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
)

var port = "8020"

func init() {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
}
func main() {
	server := server.NewServer()
	server.StartGateway(port)
}
func redirect(endpoints []*types.Endpoint) func(w http.ResponseWriter, r *http.Request) {

	return func(w http.ResponseWriter, r *http.Request) {

	}
}
func makeProxyHandler(url url.URL) types.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Host = url.Host
		r.URL.Host = url.Host
		r.URL.Scheme = url.Scheme
		fmt.Println("request uri ", r.RequestURI)
		fmt.Println("request url path ", r.URL.Path)
		fmt.Println("host path ", url.Path)
		fmt.Println("host escaped path ", url.EscapedPath())
		// fmt.Println("host path ", url.Path)
		// fmt.Println("request uri", r.RequestURI)
		r.RequestURI = ""
		s, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, "there has been an error, please try again")
		}
		r.Header.Set("X-Forwarded-For", s)
		resp, err := http.DefaultClient.Do(r)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, "there's been an error, please try again later")
			return
		}
		for key, values := range resp.Header {
			for _, value := range values {
				r.Header.Set(key, value)
			}
		}
		done := make(chan bool)
		go func() {
			for {
				select {
				case <-time.Tick(10 * time.Millisecond):
					w.(http.Flusher).Flush()
				case <-done:
					return
				}
			}
		}()

		trailerKeys := []string{}
		for key := range resp.Trailer {
			trailerKeys = append(trailerKeys, key)
		}
		w.Header().Set("Trailer", strings.Join(trailerKeys, ","))
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)

		for key, values := range resp.Trailer {
			for _, value := range values {
				w.Header().Set(key, value)
			}
		}
		close(done)
	}
}
