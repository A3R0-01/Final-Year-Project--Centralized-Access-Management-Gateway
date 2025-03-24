package server

import (
	"fmt"
	"net/url"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/verify"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func NewEndpoint(serviceName string, machineName string, fixedPath string, serviceUrl string, methods []string, id string) (*types.Endpoint, error) {
	formattedUrl, err := url.Parse(serviceUrl)
	if err != nil {
		return nil, err
	}
	if err := verify.VerifyMethods(methods); err != nil {
		return nil, err
	}

	return &types.Endpoint{
		ServiceName: serviceName,
		MachineName: machineName,
		URL:         formattedUrl,
		FixedPath:   fixedPath,
		Methods:     methods,
		ServiceId:   id,
	}, nil

}

func generateManagerCredentials() *ManagerLogInCredentials {
	return &ManagerLogInCredentials{
		ManagerUserName: "A3R0",
		ManagerPassword: "bsrvnttngjltzl",
		Email:           "erlsontmadara@gmail.com",
		Password:        "1234bsrvnt",
	}
}

func NewLoggerKafkaProducer() (*kafka.Producer, error) {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": "host1:9092, host2:9092",
		"client.id":         "central-access-gateway",
		"acks":              "all",
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to create the Producer: ", err.Error())
	}
	return producer, err
}
