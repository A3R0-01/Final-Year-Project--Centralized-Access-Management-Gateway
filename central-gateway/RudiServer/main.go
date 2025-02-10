package main

import (
	"log"
	"net/http"
)

func main() {
	CreateClient()
}

func CreateClient() {
	http.HandleFunc("/service", handler)
	http.HandleFunc("/service/file", handler2("131. Anger x And x Light.mkv"))
	log.Fatal(http.ListenAndServe(":8002", nil))
}
func CreateSecondClient() {
	http.HandleFunc("/api", handler3)
	http.HandleFunc("/api/file", handler2("131. Anger x And x Light.mkv"))
	log.Fatal(http.ListenAndServe(":8001", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}
func handler3(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index copy.html")
}
func handler2(filename string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filename)
	}
}
