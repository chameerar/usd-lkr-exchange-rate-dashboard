# 🕒 USD LKR Exchange Rate Dashboard – Job

This Go service is a scheduled job that fetches the USD exchange rate periodically from the [Sampath Bank Exchange Rates API](https://www.sampath.lk/api/exchange-rates) and stores the result in a MongoDB database.

This service is designed to be deployed as a cron job or periodic task in a Kubernetes cluster or any scheduled environment.

---

## 📦 Features

- Fetches the current USD exchange rate from the Sampath Bank API
- Extracts and parses the TTBUY rate for USD
- Persists the rate with a timestamp to MongoDB
- Logs success or error during operation
- Accepts runtime configuration via environment variables

---

## 🛠️ Tech Stack

- Go
- MongoDB (Go driver v2)
- Cron-compatible (Kubernetes, cloud scheduler, etc.)

---

## ⚙️ Environment Variables

Make sure to set the following environment variables:

| Variable             | Description                               |
|----------------------|-------------------------------------------|
| `MONGODB_URI`        | MongoDB connection string                 |
| `MONGODB_DB_NAME`    | Name of the MongoDB database              |
| `MONGODB_COLLECTION` | Name of the collection to store the rate |

---

## 🚀 Running Locally

### 1. Export environment variables

```bash
export MONGODB_URI="your-mongodb-uri"
export MONGODB_DB_NAME="usd-exchange-tracker"
export MONGODB_COLLECTION="exchange_rates"
```

### 2. Run the job

```bash
go run .
```

If successful, the output will log the fetched rate and insertion:

```
2024/04/10 12:00:00 Fetch and added rate successfully.  {Rate:325.75 FetchedAt:2024-04-10 12:00:00 +0000 UTC}
```

---

## ⏱️ Deployment

You can run this as a cron job in:

- Kubernetes (using `CronJob` resources)
- GitHub Actions with scheduled workflows
- Any cloud platform with job schedulers (GCP Cloud Scheduler, AWS EventBridge, etc.)

> Example: A `CronJob` YAML in Kubernetes can schedule this to run every hour or as needed.

---

## 🧪 Sample Output Document (MongoDB)

```json
{
  "rate": 325.75,
  "fetchedAt": "2024-04-10T12:00:00Z"
}
```

---

## 📜 License

MIT – use freely and customize as needed.
