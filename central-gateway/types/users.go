package types

import "unicode"

type User struct {
	PublicId string `json:"id"`
}

type Administrator struct {
}

type Grantee struct {
}

type SiteManager struct {
}

type UserLogin struct {
}

func Capitalize(s string) string {
	if len(s) == 0 {
		return s
	}

	r := []rune(s)               // Convert string to rune slice for Unicode safety.
	r[0] = unicode.ToUpper(r[0]) // Capitalize the first rune.
	return string(r)             // Convert rune slice back to string.

}
