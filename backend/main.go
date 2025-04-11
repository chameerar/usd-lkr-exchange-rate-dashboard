// main.go
package main

import (
	"context"
	"encoding/json"
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

type ExchangeRate struct {
	Rate      float64   `bson:"rate" json:"rate"`
	FetchedAt time.Time `bson:"fetchedAt" json:"fetchedAt"`
}

type ApiResponse struct {
	Success     bool            `json:"success"`
	Description string          `json:"description"`
	Data        []CurrencyEntry `json:"data"`
}

type CurrencyEntry struct {
	CurrCode string `json:"CurrCode"`
	TTBUY    string `json:"TTBUY"`
}

var client *mongo.Client
var collection *mongo.Collection

func fetchRateHandler(c *gin.Context) {
	req, err := http.NewRequest("GET", "https://www.sampath.lk/api/exchange-rates", nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return
	}

	// Add User-Agent header
	req.Header.Set("User-Agent", "My Custom User Agent")

	// Send the request using the default client
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return
	}

	defer resp.Body.Close()

	var apiResp ApiResponse

	err = json.NewDecoder(resp.Body).Decode(&apiResp)
	if err != nil || !apiResp.Success {
		log.Println("Error parsing ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode API response"})
		return
	}

	var usdRate float64
	for _, entry := range apiResp.Data {
		if entry.CurrCode == "USD" {
			usdRate, err = strconv.ParseFloat(entry.TTBUY, 64)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid rate format"})
				return
			}
			break
		}
	}

	rate := ExchangeRate{
		Rate:      usdRate,
		FetchedAt: time.Now(),
	}
	_, err = collection.InsertOne(context.TODO(), rate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB insert failed"})
		return
	}

	c.JSON(http.StatusOK, rate)
}

func latestRateHandler(c *gin.Context) {
	var result ExchangeRate
	err := collection.FindOne(
		context.TODO(),
		bson.M{},
		options.FindOne().SetSort(bson.D{{"fetchedAt", -1}}),
	).Decode(&result)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func historyHandler(c *gin.Context) {
	cursor, err := collection.Find(
		context.TODO(),
		bson.M{},
		options.Find().SetSort(bson.D{{"fetchedAt", -1}}).SetLimit(7),
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

func main() {
	uri := os.Getenv("MONGODB_URI")
	docs := "www.mongodb.com/docs/drivers/go/current/"
	if uri == "" {
		log.Fatal("Set your 'MONGODB_URI' environment variable. " +
			"See: " + docs +
			"usage-examples/#environment-variable")
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
	collection = client.Database("exchange_db").Collection("rates")
	r := gin.New()

	r.GET("/fetch-rate", fetchRateHandler)
	r.GET("/latest-rate", latestRateHandler)
	r.GET("/history", historyHandler)

	log.Println("Server started at :8080")
	r.Run(":8080")
}
