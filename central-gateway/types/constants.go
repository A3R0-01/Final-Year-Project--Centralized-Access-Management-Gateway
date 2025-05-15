package types

var (
	GatewayDomain                = "http://127.0.0.1:8020/"
	CentralDomain                = "http://127.0.0.1:8000/api/"
	LoginEndpoint                = CentralDomain + "manager/login/"
	RefreshEndpoint              = CentralDomain + "auth/refresh/"
	rudiUrl                      = "http://127.0.0.1:8002"
	rudiUrl2                     = "http://127.0.0.1:8001"
	Central_access_managementUrl = "http://127.0.0.1:8000/api"
	Exempt_models                = []string{"login", "refresh"}
	Base_models                  = []string{"manager", "grantee", "admin", "permission", "log", "auth"}
	SecondLevel_base_models      = []string{"permission", "log"}
	KafkaLoggerTopic             = "systemLog"
)

func RefineUrl(url string) string {
	prev := ""
	newString := ""
	for key, str := range url {
		if key == 0 {
			prev = string(str)
			newString = newString + prev
			continue
		}
		if prev == "/" && string(str) == "/" {
			continue
		}
		newString = newString + string(str)
		prev = string(str)

	}
	return newString
}
