# 💱 USD LKR Exchange Rate Dashboard

A simple full-stack project to track and display the USD exchange rate using data from [Sampath Bank](https://www.sampath.lk/api/exchange-rates). This project fetches, stores, and visualizes exchange rates using MongoDB, a Go backend, a React frontend, and a scheduled background job.

---

## 📦 Project Structure

```
.
├── frontend/   # React app to visualize USD exchange rate trends
├── backend/    # Go server exposing an API to fetch rates from MongoDB
└── job/        # Go job that periodically fetches USD rate and stores it in MongoDB
```

---

## 🚀 Getting Started

1. **Start MongoDB** (local or cloud)
2. **Run the Job** to fetch and store USD rate (see `job/README.md`)
3. **Run the Backend** to expose data via REST API (see `backend/README.md`)
4. **Run the Frontend** to view the chart (see `frontend/README.md`)

---

## 📊 Features

- Periodically fetches real-time USD exchange rates
- Stores data in MongoDB with timestamps
- REST API to retrieve historical data
- Interactive frontend chart to visualize USD trends

---

## 🧪 Technologies Used

- Go (Backend & Job)
- React + Chart.js (Frontend)
- MongoDB (Database)

---

## 📜 License

MIT — feel free to use, learn, and contribute!
