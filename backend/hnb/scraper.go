package hnb

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func ScrapeHnb() {
	// Open the HTML file
	file, err := os.Open("hnb-exchange.html")
	if err != nil {
		log.Fatalf("Error opening file: %v", err)
	}
	defer file.Close()

	// Parse the HTML
	doc, err := goquery.NewDocumentFromReader(file)
	if err != nil {
		log.Fatalf("Error parsing HTML: %v", err)
	}

	// Look for the row that contains "USD" and extract buying/selling rates
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
