package types

import "fmt"

type PublicService struct {
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

type SystemLog struct {
	Citizen    string `json:"Citizen"`
	Method     string `json:"Method"`
	Object     string `json:"Object"`
	RecordId   string `json:"RecordId"`
	StatusCode int    `json:"StatusCode"`
	Message    string `json:"Message"`
}
