package server

import (
	"fmt"
	"strings"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
)

func VerifyMachineNames(endpoints map[string]*types.Endpoint) error {
	for key, endpoint := range endpoints {
		for secondKey, duplicate := range endpoints {
			if key != secondKey {
				if strings.ToLower(endpoint.MachineName) == strings.ToLower(duplicate.MachineName) {
					return fmt.Errorf("duplicate services")
				}
			}
		}
	}
	return nil
}
