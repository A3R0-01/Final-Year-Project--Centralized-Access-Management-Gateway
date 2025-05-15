package service

import (
	"compress/flate"
	"compress/gzip"
	"io"
	"regexp"
	"strings"

	"github.com/A3R0-01/Final-Year-Project--Centralized-Access-Management-Gateway/central-gateway/types"
	"github.com/andybalholm/brotli"
)

func injectBaseTag(html []byte, serviceMachineName string, originalDomain string) []byte {
	re := regexp.MustCompile(`href\s*=\s*"(.*?)"`)

	updated := re.ReplaceAllFunc(html, func(match []byte) []byte {
		hrefMatch := re.FindSubmatch(match)
		if len(hrefMatch) < 2 {
			return match
		}

		original := string(hrefMatch[1])

		// Skip absolute URLs that aren't the original domain
		if strings.HasPrefix(original, "http://") || strings.HasPrefix(original, "https://") {
			if !strings.HasPrefix(original, originalDomain) {
				return match // leave external links alone
			}
			// Strip domain and treat like relative
			original = strings.TrimPrefix(original, originalDomain)
		}

		// Clean relative path
		cleanPath := strings.TrimLeft(original, "/.")
		newHref := types.GatewayDomain + "/" + serviceMachineName + "/" + cleanPath
		return []byte(`href="` + newHref + `"`)
	})

	return updated

	// lower := bytes.ToLower(html)
	// headIndex := bytes.Index(lower, []byte("<head>"))
	// if headIndex == -1 {
	// 	return html // no <head> found
	// }

	// insertPos := headIndex + len("<head>")
	// baseTag := `<base href="` + types.GatewayDomain + serviceMachineName + `/">`
	// return append(html[:insertPos], append([]byte(baseTag), html[insertPos:]...)...)
}

func rewriteCSSUrlsToGateway(css []byte, serviceName string) []byte {
	gatewayDomain := "http://www.gateway.com"
	originalDomain := "http://www.somesite.com"

	re := regexp.MustCompile(`url\(["']?(.*?)["']?\)`)

	return re.ReplaceAllFunc(css, func(match []byte) []byte {
		urlMatch := re.FindSubmatch(match)
		if len(urlMatch) < 2 {
			return match
		}

		original := string(urlMatch[1])

		// Skip external links
		if strings.HasPrefix(original, "http://") || strings.HasPrefix(original, "https://") {
			if !strings.HasPrefix(original, originalDomain) {
				return match // skip external domains
			}
			// Treat original domain as internal, strip it
			original = strings.TrimPrefix(original, originalDomain)
		}

		cleanPath := strings.TrimLeft(original, "/.")
		newURL := gatewayDomain + "/" + serviceName + "/" + cleanPath

		return []byte(`url("` + newURL + `")`)
	})
}

func decompressBody(body io.Reader, encoding string) ([]byte, error) {
	switch encoding {
	case "gzip":
		r, err := gzip.NewReader(body)
		if err != nil {
			return nil, err
		}
		defer r.Close()
		return io.ReadAll(r)
	case "deflate":
		r := flate.NewReader(body)
		defer r.Close()
		return io.ReadAll(r)
	case "br":
		r := brotli.NewReader(body)
		return io.ReadAll(r)
	default:
		return io.ReadAll(body) // uncompressed
	}
}

func compressBody(w io.Writer, data []byte, encoding string) error {
	switch encoding {
	case "gzip":
		gz := gzip.NewWriter(w)
		defer gz.Close()
		_, err := gz.Write(data)
		return err
	case "deflate":
		fl, err := flate.NewWriter(w, flate.DefaultCompression)
		if err != nil {
			return err
		}
		defer fl.Close()
		_, err = fl.Write(data)
		return err
	case "br":
		br := brotli.NewWriter(w)
		defer br.Close()
		_, err := br.Write(data)
		return err
	default:
		_, err := w.Write(data)
		return err
	}
}
