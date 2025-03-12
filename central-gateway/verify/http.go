package verify

import (
	"fmt"
	"strings"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
)

var (
	available_methods = []string{"get", "patch", "delete", "post"}
)

func VerifyMethods(methods []string) error {
	for _, value := range methods {
		found := false
		for _, fixed_value := range available_methods {
			if strings.ToLower(value) == strings.ToLower(fixed_value) {
				found = true
			}
		}
		if !found {
			return fmt.Errorf("invalid method")
		}
	}
	return nil
}

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
