package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func main() {
	// Replace this with the actual URL
	url := "https://www.hnb.net/exchange-rates"

	// Make the GET request
	resp, err := http.Get(url)
	if err != nil {
		log.Fatalf("Failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("Unexpected status code: %d", resp.StatusCode)
	}

	// Parse the HTML from the response
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		log.Fatalf("Error parsing HTML: %v", err)
	}

	// Extract USD buying and selling rates
	doc.Find("tr").Each(func(i int, s *goquery.Selection) {
		cells := s.Find("td.exrateText")
		if cells.Length() >= 4 {
			currencyCode := strings.TrimSpace(cells.Eq(1).Text())
			if currencyCode == "USD" {
				buyingRate := strings.TrimSpace(cells.Eq(2).Text())
				sellingRate := strings.TrimSpace(cells.Eq(3).Text())
				fmt.Printf("USD Buying Rate: %s\n", buyingRate)
				fmt.Printf("USD Selling Rate: %s\n", sellingRate)
			}
		}
	})
}
