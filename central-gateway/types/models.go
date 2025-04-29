package types

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
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

type SystemLogInterface interface {
	Populate(request *http.Request, service map[string]string) error
	getCitizen(authenticationHeader string) error
	getSpecialUserId(authenticationHeader string) error
	SetStatusCode(statusCode int)
	SetRecordId(id string)
	SetMessage(message string)
	SetObject(object string)
	GenerateLog() (SystemLogInterface, error)
}

type SystemLog struct {
	Citizen       string `json:"Citizen"`
	Method        string `json:"Method"`
	Object        string `json:"Object"`
	RecordId      string `json:"RecordId"`
	StatusCode    int    `json:"StatusCode"`
	Message       string `json:"Message"`
	SpecialUser   string
	SpecialUserId string
}

type AdministratorSystemLog struct {
	SystemLog
	Administrator string `json:"Administrator"`
}

type ManagerSystemLog struct {
	SystemLog
	SiteManager string `json:"SiteManager"`
}

type GranteeSystemLog struct {
	SystemLog
	Grantee string `json:"Grantee"`
}

func (sl *SystemLog) Populate(request *http.Request, service map[string]string) error {
	parts := strings.FieldsFunc(request.URL.Path, func(rw rune) bool {
		return rw == '/'
	})
	var secondary bool = false
	var found = false
	var baseModel string
	sl.RecordId = ""
	if service["service"] == "c_a_m" {
		for key, routeComponent := range parts {
			if !found {
				if answer, text := isBaseModel(routeComponent, secondary); !answer {
					if baseModel == "auth" || baseModel == "manager" || baseModel == "grantee" || baseModel == "admin" {
						sl.Object = Capitalize(text)
					} else {
						sl.Object = Capitalize(text) + Capitalize(baseModel)
					}
					if sl.Object == "Service" {
						sl.Object = "PublicService"
					}
					found = true
					continue
				}
			} else {
				sl.RecordId = routeComponent
			}

			baseModel = routeComponent
			if (baseModel == "manager" || baseModel == "admin" || baseModel == "grantee" || baseModel == "auth") && key == 0 {
				if baseModel == "auth" {
					sl.SpecialUser = "citizen"
				} else {
					sl.SpecialUser = baseModel
				}
			} else {
				sl.SpecialUser = "citizen"
			}
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
	} else {
		sl.SpecialUser = "citizen"
		sl.Object = "Service"
		sl.RecordId = service["serviceId"]
		sl.Method = request.Method
		sl.Message = "Accessed Service: " + service["service"]
	}

	fmt.Println(sl.Object)
	fmt.Println(sl.Method)
	fmt.Println(sl.SpecialUser)
	fmt.Println(sl.RecordId)
	if !isExemptModel(strings.ToLower(sl.Object)) {
		authenticationHeader := request.Header.Get("Authorization")
		if authenticationHeader == "" {
			return fmt.Errorf("Not Authenticated")
		}
		err := sl.getCitizen(authenticationHeader)
		if err != nil {
			log.Println(err)
			return err
		}
		fmt.Println(sl.Citizen)
		if sl.SpecialUser != "citizen" {
			if err := sl.getSpecialUserId(authenticationHeader); err != nil {
				log.Println("Failed To get special user")
				return err
			}
		}
		return nil
	}
	return nil

}
func (sl *SystemLog) getCitizen(authenticationHeader string) error {
	req, err := http.NewRequest("GET", CentralDomain+"citizen/stuff", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authenticationHeader)
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
	var user User
	if err := json.Unmarshal(body, &user); err != nil {
		return err
	}
	sl.Citizen = user.PublicId
	return sl.VerifyService(authenticationHeader)

}
func (sl *SystemLog) getSpecialUserId(authenticationHeader string) error {
	req, err := http.NewRequest("GET", CentralDomain+sl.SpecialUser+"/"+sl.SpecialUser+"/stuff", nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authenticationHeader)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("authentication failed")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	var user User
	if err := json.Unmarshal(body, &user); err != nil {
		return err
	}
	sl.SpecialUserId = user.PublicId
	return nil
}
func (sl *SystemLog) VerifyService(authenticationHeader string) error {
	if sl.Object == "Service" {
		if sl.RecordId == "" {
			return fmt.Errorf("service error")
		}
		fmt.Println("log: " + CentralDomain + "service/" + sl.RecordId)
		req, err := http.NewRequest("GET", CentralDomain+"service/"+sl.RecordId, nil)
		if err != nil {
			return err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", authenticationHeader)
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return err
		}
		defer resp.Body.Close()
		if resp.StatusCode == http.StatusNotFound {
			return fmt.Errorf("service unauthorized")
		} else if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("authentication failed")
		}

	}
	return nil
}
func (sl *SystemLog) GenerateLog() (SystemLogInterface, error) {
	if sl.SpecialUser == "citizen" {
		return sl, nil
	} else if sl.SpecialUser == "manager" {
		return &ManagerSystemLog{
			SystemLog:   *sl,
			SiteManager: sl.SpecialUserId,
		}, nil
	} else if sl.SpecialUser == "admin" {
		return &AdministratorSystemLog{
			SystemLog:     *sl,
			Administrator: sl.SpecialUserId,
		}, nil
	} else if sl.SpecialUser == "grantee" {
		return &GranteeSystemLog{
			SystemLog: *sl,
			Grantee:   sl.SpecialUserId,
		}, nil
	}

	return nil, fmt.Errorf("specialUser not set")

}

func (sl *SystemLog) SetRecordId(id string) {
	sl.RecordId = id
}
func (sl *SystemLog) SetMessage(message string) {
	sl.Message = message
}
func (sl *SystemLog) SetObject(object string) {
	sl.Object = object
}
func (sl *SystemLog) SetStatusCode(code int) {
	sl.StatusCode = code
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
