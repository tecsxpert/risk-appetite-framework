# 🚀 Risk Appetite Framework (Backend)

## 📌 Overview

This is a **Spring Boot backend application** for managing risks in an organization.

It provides APIs to:

* Create, update, delete risks
* Search risks by keyword
* Filter by category & status
* Secure APIs using JWT authentication

---

## 🛠️ Tech Stack

* Java 17
* Spring Boot 3
* Spring Data JPA
* Spring Security (JWT)
* PostgreSQL
* Swagger (OpenAPI)

---

## ✨ Features

* 🔐 JWT Authentication
* 📄 CRUD Operations
* 🔍 Search (title, category, status)
* 📊 Pagination & Sorting
* ⚠️ Global Exception Handling
* 📘 Swagger API Documentation

---

## 🧱 Architecture

```
Controller → Service → Repository → Database
        ↓
     DTO / Mapper
        ↓
   Exception Handler
        ↓
     Security (JWT)
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone <your-repo-url>
cd risk-appetite-framework
```

---

### 2. Configure Database

Update `application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/your_db
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
```

---

### 3. JWT Configuration

```
jwt.secret=mysecretkeymysecretkeymysecretkey123
jwt.expiration=3600000
```

---

### 4. Run Application

```
mvn spring-boot:run
```

---

## 🔐 Authentication

### Login API

```
POST /api/auth/login
```

Request:

```
{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```
{
  "token": "your_jwt_token"
}
```

---

## 📡 API Endpoints

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| GET    | /api/risks/all                 | Get all risks      |
| GET    | /api/risks/{id}                | Get risk by ID     |
| POST   | /api/risks/create              | Create risk        |
| PUT    | /api/risks/update/{id}         | Update risk        |
| DELETE | /api/risks/{id}                | Delete risk        |
| GET    | /api/risks/category/{category} | Filter by category |
| GET    | /api/risks/status/{status}     | Filter by status   |
| GET    | /api/risks/search?keyword=...  | Search risks       |

---

## 📘 Swagger UI

```
http://localhost:8080/swagger-ui/index.html
```

---

## 🧪 Example Request

```
GET /api/risks/search?keyword=Security&page=0&size=5&sort=riskScore,desc
Authorization: Bearer <token>
```

---

## 🌍 Environment Variables (Example)

| Variable       | Description        |
| -------------- | ------------------ |
| jwt.secret     | Secret key for JWT |
| jwt.expiration | Token expiry time  |

---

## 👨‍💻 Author

Prajwal J S
Java Developer Intern
