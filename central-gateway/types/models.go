package types

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	server "github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/Server"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
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
type SystemLogInterface interface {
	Populate(request *http.Request, service map[string]string, managerCredentials *server.ManagerLogInCredentials) error
	getCitizen(request *http.Request, managerCredentials *server.ManagerLogInCredentials) error
	CheckSessions(managerCredentials *server.ManagerLogInCredentials) error
	VerifyService(authenticationHeader string, managerCredentials *server.ManagerLogInCredentials) error
	getSpecialUserId(authenticationHeader string) error
	SetStatusCode(statusCode int)
	SetRecordId(id string)
	SetMessage(message string)
	SetObject(object string)
	GenerateLog() (SystemLogInterface, error)
	GetSpecialUser() string
}

type SystemLog struct {
	Citizen       string `json:"Citizen"`
	Method        string `json:"Method"`
	Object        string `json:"Object"`
	RecordId      string `json:"RecordId"`
	StatusCode    int    `json:"StatusCode"`
	Message       string `json:"Message"`
	IpAddress     string `json:"IpAddress"`
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

func (sl *SystemLog) Populate(request *http.Request, service map[string]string, managerCredentials *server.ManagerLogInCredentials) error {
	sl.IpAddress = verify.GetIP(request)
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
					if len(parts) == 1 {
						sl.SpecialUser = "citizen"
					}
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
		err := sl.getCitizen(request, managerCredentials)
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
func (sl *SystemLog) getCitizen(request *http.Request, managerCredentials *server.ManagerLogInCredentials) error {
	authenticationHeader := request.Header.Get("Authorization")

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
	if sl.Object == "Service" {
		if err := sl.CheckSessions(managerCredentials); err != nil {
			return sl.VerifyService(authenticationHeader, managerCredentials)
		}
	}
	return nil
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
func (sl *SystemLog) VerifyService(authenticationHeader string, managerCredentials *server.ManagerLogInCredentials) error {
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
	session := ServiceSessionRequest{
		Citizen:   sl.Citizen,
		Service:   sl.RecordId,
		IpAddress: sl.IpAddress,
	}
	sessionJson, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("Failed to create Session: 0")
	}
	sessionReq, err := http.NewRequest("POST", CentralDomain+"manager/session/", bytes.NewBuffer(sessionJson))
	if err != nil {
		return fmt.Errorf("Failed to create Session: 1")
	}
	sessionReq.Header.Set("Content-Type", "application/json")
	sessionReq.Header.Set("Authorization", managerCredentials.Access)
	resp, err = http.DefaultClient.Do(sessionReq)
	if err != nil {
		return fmt.Errorf("Failed To Create Session: 2")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("service unauthorized")
	}
	return nil
}

func (sl *SystemLog) CheckSessions(managerCredentials *server.ManagerLogInCredentials) error {
	if sl.IpAddress == "unknown" || sl.IpAddress == "" {
		return fmt.Errorf("Authentication Failed")
	}
	sessionReq, err := http.NewRequest("GET", CentralDomain+"manager/session/?Service="+sl.RecordId+"&Citizen="+sl.Citizen+"&IpAddress="+sl.IpAddress, nil)
	if err != nil {
		return fmt.Errorf("Failed to GET Session: 1")
	}
	sessionReq.Header.Set("Content-Type", "application/json")
	sessionReq.Header.Set("Authorization", managerCredentials.Access)
	resp, err := http.DefaultClient.Do(sessionReq)
	if err != nil {
		return fmt.Errorf("Failed To GET Session: 2")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("service unauthorized")
	}
	var respContainer []ServiceSession
	if err := json.NewDecoder(resp.Body).Decode(&respContainer); err != nil {
		log.Fatal("Credentials Decoding failed: CheckSession", err)
		return fmt.Errorf("Credentials Decoding failed: CheckSession")
	}
	found := false
	for _, serviceSession := range respContainer {
		if serviceSession.Expired {
			continue
		}
		found = true
	}
	if found {
		return nil
	}
	return fmt.Errorf("Failed to Find Active Session")
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
func (sl *SystemLog) GetSpecialUser() string {
	return sl.SpecialUser
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
