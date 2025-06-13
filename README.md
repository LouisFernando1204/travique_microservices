# Travique: Discover, Book, and Review Your Dream Destinations 🌍✨

## ✨ Overview
Welcome to **Travique**, a full-stack tourism booking platform that simplifies how users explore, book, and review tourist destinations. 🚀🧳 From secure registration to payment integration and real-time booking management, Travique is designed to enhance user travel experiences with transparency, efficiency, and seamless interaction.

## 💡 Features
### 👤 User Service
* **Secure Registration/Login** with password hashing and JWT token authentication.
* **Profile Management** including name, email, avatar, and booking history.

### 🧭 Booking Service
* **Explore Destinations**: View and filter available tourist spots with detailed descriptions.
* **Booking System**: Reserve places with selected dates and number of people.
* **Booking History**: Check your past reservations with total price and status tracking.

### 💳 Payment Service
* **Payment Integration**: Connects with Midtrans for seamless and secure transactions.
* **Payment Status**: Monitor transaction statuses (Pending, Paid, Failed).
* **Transaction History**: Retrieve a log of your payment records.

### ⭐ Review Service
* **Create Review**: Submit ratings, comments, and images after your visit.
* **View Reviews**: Read others’ experiences on each destination.
* **Edit/Delete Review**: Manage your past reviews with ease.
* **Review Filtering**: Easily browse reviews by rating or keyword.

## 📋 How It Works
1. **User Authentication**: Register and login securely using JWT-authentication (Go backend).
2. **Search & Book**: Browse destinations, view details, and place bookings via Booking Service.
3. **Make Payment**: Complete payments using Midtrans integration through the Payment Service.
4. **Leave a Review**: After visiting, share your experience by submitting a review.
5. **Manage Everything**: Track your bookings, payments, and feedback history all in one place.

## ⚙️ Tech Stack Behind Travique
* 🌐 **Frontend** : React.js + TailwindCSS
* 🚪 **API Gateway** : Node.js
* 🧾 **User Service** : Go (Fiber) + MongoDB
* 🧳 **Booking Service** : Node.js + MongoDB
* 💳 **Payment Service** : Node.js + MongoDB + Midtrans Integration
* 💬 **Review Service** : Node.js + MongoDB

## 🚀 Travique Insights
* 🌐 **Frontend** : [View Code](https://github.com/LouisFernando1204/travique_microservices/frontend)
* 🔧 **User Service (Go)** : [View Code](https://github.com/LouisFernando1204/travique_microservices/services/user-service)
* 📦 **Booking Service** : [View Code](https://github.com/LouisFernando1204/travique_microservices/services/booking-service)
* 💳 **Payment Service** : [View Code](https://github.com/LouisFernando1204/travique_microservices/services/payment-service)
* ⭐ **Review Service** : [View Code](https://github.com/LouisFernando1204/travique_microservices/services/review-service)
* 🧩 **Microservice Architecture** : [View Diagram](https://drive.google.com/file/d/1saMnLL26nW3Yx2qowBOonkTuKV0Gi4EC/view?usp=sharing)

## 🤝 Contributors
* 🧑‍💻 **Yobel Nathaniel Filipus** (User Service) : [@yebology](https://github.com/yebology)
* 🧑‍💻 **Louis Fernando** (Booking Service) : [@LouisFernando1204](https://github.com/LouisFernando1204)
* 🧑‍💻 **Dicky Al Fayed** (Payment Service) : [@dickyalf](https://github.com/dickyalf)
* 🧑‍💻 **Richie Reuben Hermanto** (Review Service) : [@richiereubenn](https://github.com/richiereubenn)
