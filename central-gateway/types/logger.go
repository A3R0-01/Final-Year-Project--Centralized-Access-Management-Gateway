package types

// import (
// 	"encoding/json"
// 	"fmt"
// 	"log"

// 	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
// )

// type Logger struct {
// 	Producer *kafka.Producer
// 	Topic    string
// 	next     HandleServeInterface
// }

// func (logger *Logger) Serve(auth *Authenticator) {
// 	logger.next.Serve(auth)
// 	logger.LogData(auth)
// }

// func (logger *Logger) LogData(auth *Authenticator) error {
// 	jsonLog, err := json.Marshal(auth.SystemLog)
// 	if err != nil {
// 		return fmt.Errorf("Failed to marshal log data")
// 	}
// 	err = logger.Producer.Produce(
// 		&kafka.Message{
// 			TopicPartition: kafka.TopicPartition{Topic: &logger.Topic, Partition: kafka.PartitionAny},
// 			Value:          jsonLog},
// 		nil,
// 	)
// 	if err != nil {
// 		return fmt.Errorf("Failed to push data to kafka")
// 	}
// 	return nil

// }

// func NewLoggerKafkaProducer(prevServer HandleServeInterface) (*Logger, error) {
// 	producer, err := kafka.NewProducer(&kafka.ConfigMap{
// 		"bootstrap.servers": "host1:9092, host2:9092",
// 		"client.id":         "central-access-gateway",
// 		"acks":              "all",
// 	})
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create the producer: %s", err.Error())
// 	}
// 	go func() {
// 		for e := range producer.Events() {
// 			switch ev := e.(type) {
// 			case *kafka.Message:
// 				if ev.TopicPartition.Error != nil {
// 					log.Printf("Delivery failed: %v\n ", ev.TopicPartition)
// 				} else {
// 					log.Printf("Delivered message: to %v\n", ev.TopicPartition)
// 				}
// 			}
// 		}
// 	}()
// 	logger := Logger{
// 		Producer: producer,
// 		Topic:    KafkaLoggerTopic,
// 		next:     prevServer,
// 	}

// 	return &logger, nil

// }
