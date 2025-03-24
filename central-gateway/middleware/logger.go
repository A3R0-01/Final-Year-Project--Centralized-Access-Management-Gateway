package middleware

import (
	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

type Logger struct {
	Producer *kafka.Producer
}

func (logger *Logger) Serve(auth *types.Authenticator) {

}
