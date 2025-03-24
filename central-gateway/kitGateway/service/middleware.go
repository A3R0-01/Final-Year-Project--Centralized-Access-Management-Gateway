package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-kit/log"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

type Middleware func(*BasicService) Service

type LoggingMiddleware struct {
	log         log.Logger
	producer    *kafka.Producer
	ServiceName string
	ServiceId   string
	next        Service
}

func NewLoggingMiddleware(logger log.Logger, producer *kafka.Producer) Middleware {
	return func(service *BasicService) Service {
		return &LoggingMiddleware{
			log:         logger,
			producer:    producer,
			ServiceName: service.ServiceName,
			ServiceId:   service.ServiceId,
			next:        service,
		}
	}
}

func (md *LoggingMiddleware) LogData(auth *types.Authenticator) error {
	jsonLog, err := json.Marshal(auth.SystemLog)
	if err != nil {
		return fmt.Errorf("Failed to marshal log data")
	}
	err = md.producer.Produce(
		&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &types.KafkaLoggerTopic, Partition: kafka.PartitionAny},
			Value:          jsonLog},
		nil,
	)
	if err != nil {
		return fmt.Errorf("Failed to push data to kafka")
	}
	return nil

}

func (md *LoggingMiddleware) Serve(auth *types.Authenticator) {
	defer func(start time.Time) {
		err := md.LogData(auth)
		md.log.Log("method", md.ServiceId, "took", time.Since(start), "err", err)
	}(time.Now())
	md.next.Serve(auth)
}
