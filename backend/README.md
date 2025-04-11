# 💱 USD LKR Exchange Rate Dashboard – Backend

This is a lightweight Go-based backend service that fetches the current USD exchange rate from Sampath Bank’s API, stores it in MongoDB, and serves it through simple REST endpoints. Built using the Gin framework.

---

## 📦 Features

- Fetches and stores the latest USD rate from Sampath Bank
- Persists data to MongoDB
- Exposes:
  - `GET /fetch-rate`: Fetch & store latest rate
  - `GET /latest-rate`: Retrieve most recent rate
  - `GET /history`: Get last 7 recorded rates (in descending time order)

---

## 🛠️ Tech Stack

- Go 1.24+
- Gin Web Framework
- MongoDB Go Driver (v2)
- Sampath Bank public API

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/chameerar/usd-lkr-exchange-rate-dashboard.git
cd usd-lkr-exchange-rate-dashboard/backend
```

### 2. Set environment variables

Create a `.env` file or export manually:

```bash
export MONGODB_URI="your_mongodb_connection_string"
export MONGODB_DB_NAME="your_database_name"
export MONGODB_COLLECTION="your_collection_name"
```

### 3. Run the backend

```bash
go run .
```

The server will start at: `http://localhost:8080`

---

## 🔌 API Endpoints

| Endpoint         | Method | Description                                |
|------------------|--------|--------------------------------------------|
| `/fetch-rate`    | GET    | Fetches latest USD rate and stores it      |
| `/latest-rate`   | GET    | Returns the most recently stored rate      |
| `/history`       | GET    | Returns last 7 stored rates (newest first) |

---

## 📊 Sample Response

```json
{
  "rate": 324.53,
  "fetchedAt": "2024-10-10T15:42:19.123Z"
}
```

---

## 📁 File Structure

```
backend/
├── main.go          # Main application logic
├── go.mod / go.sum  # Go module dependencies
├── openapi.yaml     # OpenAPI specification
```

---

## 📝 Notes

- Make sure the MongoDB URI allows external connections (if cloud-hosted).
- The API fetches data from: `https://www.sampath.lk/api/exchange-rates`
- Uses custom User-Agent to avoid being blocked by the API.

---

## 📜 License

MIT – feel free to fork and build on it.


