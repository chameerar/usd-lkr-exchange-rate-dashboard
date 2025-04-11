package main

import (
	"context"
	"encoding/json"
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
	collection := client.Database("exchange_db").Collection("rates")

	req, err := http.NewRequest("GET", "https://www.sampath.lk/api/exchange-rates", nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return
	}

	// Add User-Agent header
	req.Header.Set("User-Agent", "My Custom User Agent")

	// Send the request using the default client
	httpClient := &http.Client{}
	resp, err := httpClient.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return
	}

	defer resp.Body.Close()

	var apiResp ApiResponse

	err = json.NewDecoder(resp.Body).Decode(&apiResp)
	if err != nil || !apiResp.Success {
		log.Fatalln("Error parsing ", err)
		return
	}

	var usdRate float64
	for _, entry := range apiResp.Data {
		if entry.CurrCode == "USD" {
			usdRate, err = strconv.ParseFloat(entry.TTBUY, 64)
			if err != nil {
				log.Fatalln("Invalid rate format ", err)
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
		log.Fatalln("Error insert to DB ", err)
	}
	log.Println("Fetch and added rate succesfully. ", rate)
}
