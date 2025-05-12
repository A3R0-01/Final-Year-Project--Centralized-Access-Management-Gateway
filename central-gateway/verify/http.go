package verify

import (
	"fmt"
	"net"
	"net/http"
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

func GetIP(r *http.Request) string {
	// Check for X-Forwarded-For header first (standard for proxies)
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		// X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
		// The first one is the original client IP
		ips := strings.Split(ip, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	// Try other common headers
	ip = r.Header.Get("X-Real-IP")
	if ip != "" {
		return ip
	}

	// Try X-Client-IP (used by some CDNs and proxies)
	ip = r.Header.Get("X-Client-IP")
	if ip != "" {
		return ip
	}

	// Use RemoteAddr as fallback
	if r.RemoteAddr != "" {
		// RemoteAddr includes port, so we need to strip it
		ipWithPort := r.RemoteAddr
		host, _, err := net.SplitHostPort(ipWithPort)
		if err == nil {
			return host
		}
		// If SplitHostPort fails, return the original string
		return ipWithPort
	}

	return "unknown"
}
