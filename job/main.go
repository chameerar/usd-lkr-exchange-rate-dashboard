package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type ExchangeRate struct {
	Rate      float64   `bson:"rate" json:"rate"`
	FetchedAt time.Time `bson:"fetchedAt" json:"fetchedAt"`
	Bank      string    `bson:"bank" json:"bank"`
}

// BankExtractor interface for extracting exchange rates from different banks
type BankExtractor interface {
	GetBankName() string
	ExtractUSDRate() (float64, error)
}

// Sampath Bank structures
type SampathApiResponse struct {
	Success     bool                   `json:"success"`
	Description string                 `json:"description"`
	Data        []SampathCurrencyEntry `json:"data"`
}

type SampathCurrencyEntry struct {
	CurrCode string `json:"CurrCode"`
	TTBUY    string `json:"TTBUY"`
}

// SampathExtractor implements BankExtractor for Sampath Bank
type SampathExtractor struct {
	httpClient *http.Client
}

func NewSampathExtractor() *SampathExtractor {
	return &SampathExtractor{
		httpClient: &http.Client{},
	}
}

func (s *SampathExtractor) GetBankName() string {
	return "SAMPATH"
}

func (s *SampathExtractor) ExtractUSDRate() (float64, error) {
	req, err := http.NewRequest("GET", "https://www.sampath.lk/api/exchange-rates", nil)
	if err != nil {
		return 0, err
	}

	req.Header.Set("User-Agent", "My Custom User Agent")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var apiResp SampathApiResponse
	err = json.NewDecoder(resp.Body).Decode(&apiResp)
	if err != nil || !apiResp.Success {
		return 0, err
	}

	for _, entry := range apiResp.Data {
		if entry.CurrCode == "USD" {
			return strconv.ParseFloat(entry.TTBUY, 64)
		}
	}

	return 0, fmt.Errorf("USD rate not found")
}

// Example: Commercial Bank extractor (commented out)
// Uncomment and implement when you want to add Commercial Bank support

/*
type ComBankApiResponse struct {
	Rates []ComBankRate `json:"rates"`
}

type ComBankRate struct {
	Currency string  `json:"currency"`
	Buying   float64 `json:"buying"`
	Selling  float64 `json:"selling"`
}

type ComBankExtractor struct {
	httpClient *http.Client
}

func NewComBankExtractor() *ComBankExtractor {
	return &ComBankExtractor{
		httpClient: &http.Client{},
	}
}

func (c *ComBankExtractor) GetBankName() string {
	return "COMMERCIAL"
}

func (c *ComBankExtractor) ExtractUSDRate() (float64, error) {
	req, err := http.NewRequest("GET", "https://www.combank.lk/api/exchange-rates", nil)
	if err != nil {
		return 0, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var apiResp ComBankApiResponse
	err = json.NewDecoder(resp.Body).Decode(&apiResp)
	if err != nil {
		return 0, err
	}

	for _, rate := range apiResp.Rates {
		if rate.Currency == "USD" {
			return rate.Buying, nil
		}
	}

	return 0, fmt.Errorf("USD rate not found")
}
*/

func main() {
	uri := os.Getenv("MONGODB_URI")
	docs := "www.mongodb.com/docs/drivers/go/current/"
	if uri == "" {
		log.Fatal("Set your 'MONGODB_URI' environment variable. " +
			"See: " + docs +
			"usage-examples/#environment-variable")
	}
	dbName := os.Getenv("MONGODB_DB_NAME")
	if dbName == "" {
		log.Fatal("Set the database name using 'MONGODB_DB_NAME' environment variable.")
	}
	collectionName := os.Getenv("MONGODB_COLLECTION")
	if collectionName == "" {
		log.Fatal("Set the collection name using 'MONGODB_COLLECTION' environment variable.")
	}
	client, err := mongo.Connect(options.Client().
		ApplyURI(uri))
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	collection := client.Database(dbName).Collection(collectionName)

	// Initialize bank extractors
	extractors := []BankExtractor{
		NewSampathExtractor(),
		// Add more bank extractors here as you implement them
		// NewComBankExtractor(),
		// NewHNBExtractor(),
	}

	// Process each bank
	for _, extractor := range extractors {
		log.Printf("Fetching exchange rate from %s...", extractor.GetBankName())

		usdRate, err := extractor.ExtractUSDRate()
		if err != nil {
			log.Printf("Error fetching rate from %s: %v", extractor.GetBankName(), err)
			continue
		}

		rate := ExchangeRate{
			Rate:      usdRate,
			FetchedAt: time.Now(),
			Bank:      extractor.GetBankName(),
		}

		_, err = collection.InsertOne(context.TODO(), rate)
		if err != nil {
			log.Printf("Error inserting rate for %s to DB: %v", extractor.GetBankName(), err)
			continue
		}

		log.Printf("Successfully fetched and added rate for %s: %v", extractor.GetBankName(), rate)
	}
}
