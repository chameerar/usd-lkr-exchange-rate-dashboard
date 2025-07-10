// main.go
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

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Bank name constants
const (
	BankSampath    = "SAMPATH"
	BankCommercial = "COMMERCIAL"
	BankHNB        = "HNB"
	BankNSB        = "NSB"
	BankSeylan     = "SEYLAN"
	BankNation     = "NATION"
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
	return BankSampath
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

// Commercial Bank extractor with mock data for testing
type ComBankExtractor struct {
	httpClient *http.Client
}

func NewComBankExtractor() *ComBankExtractor {
	return &ComBankExtractor{
		httpClient: &http.Client{},
	}
}

func (c *ComBankExtractor) GetBankName() string {
	return BankCommercial
}

func (c *ComBankExtractor) ExtractUSDRate() (float64, error) {
	// Mock implementation - in real scenario, you'd call the actual API
	// For now, return a mock rate that's slightly different from Sampath
	baseRate := 301.5 // Slightly different base rate
	// Add some small random variation
	variation := float64(time.Now().Unix()%5) * 0.1
	mockRate := baseRate + variation

	log.Printf("Mock Commercial Bank rate: %.2f", mockRate)
	return mockRate, nil
}

// HNB Bank extractor with mock data
type HNBExtractor struct {
	httpClient *http.Client
}

func NewHNBExtractor() *HNBExtractor {
	return &HNBExtractor{
		httpClient: &http.Client{},
	}
}

func (h *HNBExtractor) GetBankName() string {
	return BankHNB
}

func (h *HNBExtractor) ExtractUSDRate() (float64, error) {
	// Mock implementation
	baseRate := 299.8 // Different base rate
	variation := float64(time.Now().Unix()%7) * 0.15
	mockRate := baseRate + variation

	log.Printf("Mock HNB rate: %.2f", mockRate)
	return mockRate, nil
}

var client *mongo.Client
var collection *mongo.Collection

// Initialize bank extractors
var bankExtractors []BankExtractor

func fetchRateHandler(c *gin.Context) {
	// Get bank parameter from query (optional, defaults to all banks)
	bankParam := c.DefaultQuery("bank", "")

	var extractorsToProcess []BankExtractor

	if bankParam != "" {
		// Find specific bank extractor
		for _, extractor := range bankExtractors {
			if extractor.GetBankName() == bankParam {
				extractorsToProcess = append(extractorsToProcess, extractor)
				break
			}
		}
		if len(extractorsToProcess) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bank not supported: " + bankParam})
			return
		}
	} else {
		// Process all banks
		extractorsToProcess = bankExtractors
	}

	var rates []ExchangeRate
	var errors []string

	// Process each bank
	for _, extractor := range extractorsToProcess {
		log.Printf("Fetching exchange rate from %s...", extractor.GetBankName())

		usdRate, err := extractor.ExtractUSDRate()
		if err != nil {
			errorMsg := fmt.Sprintf("Error fetching rate from %s: %v", extractor.GetBankName(), err)
			log.Println(errorMsg)
			errors = append(errors, errorMsg)
			continue
		}

		rate := ExchangeRate{
			Rate:      usdRate,
			FetchedAt: time.Now(),
			Bank:      extractor.GetBankName(),
		}

		_, err = collection.InsertOne(context.TODO(), rate)
		if err != nil {
			errorMsg := fmt.Sprintf("Error inserting rate for %s to DB: %v", extractor.GetBankName(), err)
			log.Println(errorMsg)
			errors = append(errors, errorMsg)
			continue
		}

		rates = append(rates, rate)
		log.Printf("Successfully fetched and added rate for %s: %v", extractor.GetBankName(), rate)
	}

	if len(rates) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch rates from any bank",
			"details": errors,
		})
		return
	}

	// Return single rate if only one bank was processed, otherwise return array
	if len(rates) == 1 && bankParam != "" {
		c.JSON(http.StatusOK, rates[0])
	} else {
		response := gin.H{"rates": rates}
		if len(errors) > 0 {
			response["warnings"] = errors
		}
		c.JSON(http.StatusOK, response)
	}
}

func latestRateHandler(c *gin.Context) {
	// Get bank parameter from query (optional)
	bankParam := c.DefaultQuery("bank", "")

	filter := bson.M{}
	if bankParam != "" {
		filter["bank"] = bankParam
	}

	var result ExchangeRate
	err := collection.FindOne(
		context.TODO(),
		filter,
		options.FindOne().SetSort(bson.D{{Key: "fetchedAt", Value: -1}}),
	).Decode(&result)

	if err != nil {
		if bankParam != "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "No rates found for bank: " + bankParam})
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "No rates found"})
		}
		return
	}
	c.JSON(http.StatusOK, result)
}

func historyHandler(c *gin.Context) {
	// Get bank and period parameters from query (optional)
	bankParam := c.DefaultQuery("bank", "")
	periodParam := c.DefaultQuery("period", "week")

	filter := bson.M{}
	if bankParam != "" {
		filter["bank"] = bankParam
	}

	// Calculate time range based on period
	var timeRange time.Time
	var limit int64 = 30 // default for month

	switch periodParam {
	case "week":
		timeRange = time.Now().AddDate(0, 0, -7)
		limit = 7
	case "month":
		timeRange = time.Now().AddDate(0, -1, 0)
		limit = 30
	case "year":
		timeRange = time.Now().AddDate(-1, 0, 0)
		limit = 52 // Weekly data points for a year
	default:
		timeRange = time.Now().AddDate(0, 0, -7)
		limit = 7
	}

	// Add time range filter
	filter["fetchedAt"] = bson.M{"$gte": timeRange}

	cursor, err := collection.Find(
		context.TODO(),
		filter,
		options.Find().SetSort(bson.D{{Key: "fetchedAt", Value: -1}}).SetLimit(limit),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}
	defer cursor.Close(context.TODO())

	var rates []ExchangeRate
	for cursor.Next(context.TODO()) {
		var rate ExchangeRate
		if err := cursor.Decode(&rate); err == nil {
			rates = append(rates, rate)
		}
	}
	c.JSON(http.StatusOK, rates)
}

// New endpoint to get available banks
func banksHandler(c *gin.Context) {
	banks := make([]string, len(bankExtractors))
	for i, extractor := range bankExtractors {
		banks[i] = extractor.GetBankName()
	}
	c.JSON(http.StatusOK, gin.H{"banks": banks})
}

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
	collection = client.Database(dbName).Collection(collectionName)

	// Initialize bank extractors
	bankExtractors = []BankExtractor{
		NewSampathExtractor(),
		// NewComBankExtractor(),
		// NewHNBExtractor(),
		// Add more bank extractors here as you implement them
		// NewNSBExtractor(),
		// NewSeylanExtractor(),
		// NewNationExtractor(),
	}

	r := gin.New()

	// Enable CORS for frontend integration
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API endpoints
	// Examples:
	// GET /health                       - Health check endpoint
	// GET /fetch-rate                    - Fetch from all banks
	// GET /fetch-rate?bank=SAMPATH      - Fetch from Sampath Bank only
	// GET /latest-rate?bank=COMMERCIAL   - Get latest rate from Commercial Bank
	// GET /history?bank=HNB&period=week - Get history from HNB for last week
	// GET /banks                        - Get list of all supported banks
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now(),
			"banks":     len(bankExtractors),
		})
	})
	r.GET("/fetch-rate", fetchRateHandler)   // ?bank=SAMPATH (optional)
	r.GET("/latest-rate", latestRateHandler) // ?bank=SAMPATH (optional)
	r.GET("/history", historyHandler)        // ?bank=SAMPATH&period=month (optional)
	r.GET("/banks", banksHandler)            // Get list of available banks

	log.Println("Server started at :8080")
	log.Printf("Available banks: %v", getBankNames())
	r.Run(":8080")
}

// Helper function to get bank names for logging
func getBankNames() []string {
	names := make([]string, len(bankExtractors))
	for i, extractor := range bankExtractors {
		names[i] = extractor.GetBankName()
	}
	return names
}

// Helper function to check if a bank name is valid
func isValidBankName(bankName string) bool {
	validBanks := map[string]bool{
		BankSampath:    true,
		BankCommercial: true,
		BankHNB:        true,
		BankNSB:        true,
		BankSeylan:     true,
		BankNation:     true,
	}
	return validBanks[bankName]
}

// Helper function to get all supported bank names
func getAllSupportedBanks() []string {
	return []string{
		BankSampath,
		BankCommercial,
		BankHNB,
		BankNSB,
		BankSeylan,
		BankNation,
	}
}
