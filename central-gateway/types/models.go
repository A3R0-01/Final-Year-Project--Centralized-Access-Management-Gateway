package types

import (
	"fmt"
)

type PublicService struct {
	PublicId    string              `json:"id"`
	Title       string              `json:"Title"`
	MachineName string              `json:"MachineName"`
	Description string              `json:"Description"`
	Email       string              `json:"Email"`
	Grantee     []map[string]string `json:"Grantee"`
	Association map[string]string   `json:"Association"`
	Restricted  bool                `json:"Restricted"`
	URL         string              `json:"URL"`
	Visibility  bool                `json:"Visibility"`
	Methods     []string            `json:"Methods"`
}

func (s *PublicService) String() string {
	return fmt.Sprint(s.Title + ": \tMachine Name: " + s.MachineName + "\tUrl: " + s.URL)
}

type ServiceSessionService struct {
	PublicId    string `json:"id"`
	Title       string `json:"Title"`
	MachineName string `json:"MachineName"`
	URL         string `json:"URL"`
}

type ServiceSessionCitizen struct {
	PublicId   string `json:"id"`
	UserName   string `json:"UserName"`
	Email      string `json:"Email"`
	FirstName  string `json:"FirstName"`
	SecondName string `json:"SecondName"`
	NationalId string `json:"NationalId"`
}

type ServiceSession struct {
	PublicId      string                `json:"id"`
	Citizen       ServiceSessionCitizen `json:"Citizen"`
	Service       ServiceSessionService `json:"Service"`
	IpAddress     string                `json:"IpAddress"`
	EnforceExpiry bool                  `json:"EnforceExpiry"`
	Expired       bool                  `json:"Expired"`
}
type ServiceSessionRequest struct {
	Citizen   string `json:"Citizen"`
	Service   string `json:"Service"`
	IpAddress string `json:"IpAddress"`
}
