package types

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

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
	Citizen     string `json:"Citizen"`
	Method      string `json:"Method"`
	Object      string `json:"Object"`
	RecordId    string `json:"RecordId"`
	StatusCode  int    `json:"StatusCode"`
	Message     string `json:"Message"`
	SpecialUser string
}

func (sl *SystemLog) Populate(request *http.Request, header string) {
	parts := strings.FieldsFunc(request.URL.Path, func(rw rune) bool {
		return rw == '/'
	})
	var secondary bool = false
	var baseModel string
	for _, routeComponent := range parts {
		if answer, text := isBaseModel(routeComponent, secondary); !answer {
			sl.Object = Capitalize(baseModel) + Capitalize(text)
			if baseModel == "manager" || baseModel == "admin" || baseModel == "grantee" || baseModel == "auth" {
				if baseModel == "Auth" {
					sl.SpecialUser = "citizen"
				} else {
					sl.SpecialUser = baseModel
				}

			}
			break
		}
		baseModel = routeComponent
		secondary = true
	}

	sl.Method = request.Method
	if sl.Method == http.MethodPost {
		sl.Message = "Created Entity"
	} else if sl.Method == http.MethodPatch {
		sl.RecordId = parts[len(parts)-1]
		sl.Message = "Edited Entity: " + sl.RecordId
	} else if sl.Method == http.MethodDelete {
		sl.RecordId = parts[len(parts)-1]
		sl.Message = "Deleted Entity: " + sl.RecordId
	} else {
		sl.Message = "Accessd Entity: N\\A"
	}
	sl.getCitizen(header)
}
func (sl *SystemLog) getCitizen(header string) error {
	req, err := http.NewRequest("GET", CentralDomain+"/user", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", header)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Authentication Failed")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	var user *User
	if err := json.Unmarshal(body, user); err != nil {
		return err
	}
	sl.Citizen = user.PublicId
	return nil

}

func isBaseModel(text string, secondLevel bool) (bool, string) {
	if isExemptModel(text) {
		return false, text
	}
	for _, model := range Base_models {
		if !secondLevel {
			if model == text {
				return true, text
			}
		} else {
			for _, secondary_model := range SecondLevel_base_models {
				if secondary_model == text {
					return true, text
				}
			}
		}
	}
	return false, text
}
func isExemptModel(text string) bool {
	for _, model := range Exempt_models {
		if model == text {
			return true
		}
	}
	return false
}
