package server

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

type managerLogInCredentials struct {
	Email           string `json:"Email"`
	Password        string `json:"Password"`
	ManagerUserName string `json:"ManagerUserName"`
	ManagerPassword string `json:"ManagerPassword"`
	Access          string `json:"access"`
	Refresh         string `json:"refresh"`
}

func (c *managerLogInCredentials) login() {
	credentials, err := json.Marshal(c)
	if err != nil {
		log.Fatal("Credentials json error")
	}
	req, err := http.NewRequest("POST", loginEndpoint, bytes.NewReader(credentials))
	if err != nil {
		log.Fatal("Creation: http login Request")
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("http login request failed")
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal("http server response failed, \n: body conversion failed as well")
		}
		log.Fatal("http server response failed:\n\tBody: \t" + string(bodyBytes))
	}

	var respContainer managerLogInCredentials
	if err := json.NewDecoder(resp.Body).Decode(&respContainer); err != nil {
		log.Fatal("Credentials Decoding failed", err)
	}
	c.Access = respContainer.Access
	c.Refresh = respContainer.Refresh
}

func (c *managerLogInCredentials) refresh() bool {
	credentials, err := json.Marshal(c)
	if err != nil {
		log.Fatal("Refresh:: Credentials json error")
	}
	req, err := http.NewRequest("POST", refreshEndpoint, bytes.NewReader(credentials))
	if err != nil {
		log.Fatal("Creation: http refresh Request")
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal("http refresh request failed")
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return false
	}

	if resp.StatusCode != http.StatusOK {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal("Refresh: http server response failed, \n: body conversion failed as well")
		}
		log.Fatal("Refresh: http server response failed:\n\tBody: \t" + string(bodyBytes))
	}

	var respContainer managerLogInCredentials
	if err := json.NewDecoder(resp.Body).Decode(&respContainer); err != nil {
		log.Fatal("Refresh: Credentials Decoding failed", err)
	}
	c.Access = respContainer.Access
	return true
}

func (c *managerLogInCredentials) startCredentials() {
	c.login()
	for {
		success := c.refresh()
		if !success {
			c.login()
		}
		time.Sleep(time.Minute * 5)
	}
}

func refineUrl(url string) string {
	prev := ""
	newString := ""
	for key, str := range url {
		if key == 0 {
			prev = string(str)
			newString = newString + prev
			continue
		}
		if prev == "/" && string(str) == "/" {
			continue
		}
		newString = newString + string(str)
		prev = string(str)

	}
	return newString
}
