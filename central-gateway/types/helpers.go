package types

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"
)

type ManagerLogInCredentials struct {
	Email           string `json:"Email"`
	Password        string `json:"password"`
	ManagerUserName string `json:"ManagerUserName"`
	ManagerPassword string `json:"ManagerPassword"`
	Access          string `json:"access"`
	Refresh         string `json:"refresh"`
}

func (c *ManagerLogInCredentials) login() {
	credentials, err := json.Marshal(c)
	if err != nil {
		log.Fatal("Credentials json error")
	}
	req, err := http.NewRequest("POST", LoginEndpoint, bytes.NewBuffer(credentials))
	if err != nil {
		log.Fatal("Creation: http login Request")
	}
	req.Header.Set("Content-Type", "application/json")
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

	var respContainer ManagerLogInCredentials
	if err := json.NewDecoder(resp.Body).Decode(&respContainer); err != nil {
		log.Fatal("Credentials Decoding failed", err)
	}
	c.Access = respContainer.Access
	c.Refresh = respContainer.Refresh
}

func (c *ManagerLogInCredentials) refresh() bool {
	credentials, err := json.Marshal(c)
	if err != nil {
		log.Fatal("Refresh:: Credentials json error")
	}
	req, err := http.NewRequest("POST", RefreshEndpoint, bytes.NewBuffer(credentials))
	if err != nil {
		log.Fatal("Creation: http refresh Request")
	}
	req.Header.Set("Content-Type", "application/json")

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

	var respContainer ManagerLogInCredentials
	if err := json.NewDecoder(resp.Body).Decode(&respContainer); err != nil {
		log.Fatal("Refresh: Credentials Decoding failed", err)
	}
	c.Access = respContainer.Access
	return true
}

func (c *ManagerLogInCredentials) StartCredentials() {
	c.login()
	go func() {
		for {
			success := c.refresh()
			if !success {
				c.login()
			}
			time.Sleep(time.Minute * 4)
		}
	}()

}
