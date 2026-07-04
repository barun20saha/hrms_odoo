# Human Resource Management System (HRMS) Backend

This is the complete, production-ready backend for the **Human Resource Management System (HRMS)** built using Spring Boot, MongoDB, and Spring Security with JWT.

---

## Technical Stack
- **Language**: Java 21 / 22
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security (Role-Based Authorization) & JJWT (Json Web Token)
- **Database**: MongoDB Atlas / Local MongoDB
- **Build Tool**: Maven
- **API Documentation**: Springdoc OpenAPI / Swagger UI
- **Utilities**: Lombok & Jakarta Validation

---

## Project Structure
```
dev/src/main/java/com/hrms/dev/
 ├── config/            # SecurityConfig, MongoConfig, SwaggerConfig
 ├── constants/         # Role/Status constants
 ├── controller/        # Rest API Controllers
 ├── dto/               # Request/Response payloads (Data Transfer Objects)
 ├── entity/            # MongoDB Documents (@Document)
 ├── exception/         # Custom exceptions & GlobalExceptionHandler
 ├── mapper/            # Entity-to-DTO conversion mapping
 ├── repository/        # Spring Data MongoDB Repositories
 ├── security/          # JWT Filters, token provider, principal, details service
 └── service/           # Service interfaces and implementation classes
```

---

## Installation & Setup

### Prerequisites
1. **JDK 21 or 22** installed.
2. **Apache Maven 3.9+** installed.
3. **MongoDB** local instance running on `localhost:27017` or a MongoDB Atlas cloud connection.

### Configuration
Update the MongoDB connection URI in [application.properties](file:///c:/Users/Barun%20Saha/Downloads/dev/dev/src/main/resources/application.properties) or set the `MONGODB_URI` environment variable:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/hrms
# OR set MONGODB_URI in your environment variables:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hrms
```

### Running the Application
From the `dev` directory, compile and run using Maven:
```bash
mvn clean compile
mvn spring-boot:run
```
The server will start on port `8080`.

### Running Tests
Execute unit and integration tests using:
```bash
mvn clean test
```

---

## Swagger UI Documentation
Access Swagger documentation when the application is running:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI Json Docs**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

*Note: All endpoints under `/api/employee/**` and `/api/admin/**` are secured. Use `/api/auth/login` to obtain a JWT token, click "Authorize" in Swagger UI, and enter the token as `Bearer <your_token>`.*

---

## REST API Endpoints & Samples

### 1. Authentication (`/api/auth/**` - Public)
- **POST `/api/auth/register`** - Registers a new user.
  - **Request Body**:
    ```json
    {
      "employeeId": "EMP1001",
      "email": "employee@hrms.com",
      "password": "password123",
      "role": "EMPLOYEE"
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Registration successful. Please verify your email using token: <token>",
      "data": "<verification-token>"
    }
    ```
- **POST `/api/auth/login`** - Authenticates credentials and returns a JWT.
  - **Request Body**:
    ```json
    {
      "email": "employee@hrms.com",
      "password": "password123"
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiJ9...",
        "tokenType": "Bearer",
        "role": "ROLE_EMPLOYEE",
        "employeeId": "EMP1001",
        "email": "employee@hrms.com"
      }
    }
    ```
- **GET `/api/auth/verify-email?token=<token>`** - Verifies email registration.
- **POST `/api/auth/forgot-password`** - Requests password reset token.
- **POST `/api/auth/reset-password`** - Resets password using token.

### 2. Employees (`/api/employee/**` & `/api/admin/employees/**`)
- **GET `/api/employee/profile`** - View own profile (Employee/Admin).
- **PUT `/api/employee/profile/phone?phone=xxx`** - Update phone number.
- **PUT `/api/employee/profile/address?address=xxx`** - Update address.
- **POST `/api/employee/profile/picture?url=xxx`** - Update profile picture link.
- **POST `/api/admin/employees`** - Onboards a new employee (Admin only).
  - **Request Body**:
    ```json
    {
      "employeeId": "EMP1005",
      "firstName": "Alice",
      "lastName": "Smith",
      "email": "alice@hrms.com",
      "phone": "9876543210",
      "address": "123 Main St, New York",
      "department": "Engineering",
      "designation": "Software Engineer",
      "dateOfJoining": "2026-07-04T10:00:00Z",
      "basicSalary": 75000.0,
      "allowances": 15000.0,
      "deductions": 5000.0
    }
    ```
- **GET `/api/admin/employees`** - List all employees (Admin only, supports `search` and pagination).

### 3. Attendance (`/api/employee/attendance/**` & `/api/admin/attendance/**`)
- **POST `/api/employee/attendance/check-in`** - Record check-in for today. Status defaults to `PRESENT`.
- **POST `/api/employee/attendance/check-out`** - Record check-out. Status changes to `HALF_DAY` if worked hours < 4.0.
- **GET `/api/employee/attendance/history`** - View personal attendance history.
- **GET `/api/admin/attendance/daily?date=2026-07-04`** - View daily roster (Admin only).

### 4. Leaves (`/api/employee/leaves/**` & `/api/admin/leaves/**`)
- **POST `/api/employee/leaves/apply`** - Apply for leave.
  - **Request Body**:
    ```json
    {
      "leaveType": "PAID",
      "startDate": "2026-07-10",
      "endDate": "2026-07-12",
      "remarks": "Family vacation"
    }
    ```
- **POST `/api/admin/leaves/{requestId}/approve`** - Approve a leave request (Admin only).
  - **Request Body**:
    ```json
    {
      "comments": "Enjoy your time off!"
    }
    ```

### 5. Payroll (`/api/employee/payroll/**` & `/api/admin/payroll/**`)
- **GET `/api/employee/payroll/my-salary`** - View own salary statement (Read-Only).
- **POST `/api/admin/payroll/generate`** - Trigger monthly generation (Admin only).
  - **Request Body**:
    ```json
    {
      "month": 7,
      "year": 2026
    }
    ```

### 6. Dashboard (`/api/employee/dashboard` & `/api/admin/dashboard`)
- **GET `/api/employee/dashboard`** - Returns profile summary, monthly attendance metrics, leave request statuses, and notifications.
- **GET `/api/admin/dashboard`** - Returns total employees count, present today, absent today, pending leave requests, and recent activity logs.

---

## Sample MongoDB Documents

### `users` Document
```json
{
  "_id": ObjectId("64be348f95c4bc5b8c381c11"),
  "employeeId": "EMP1001",
  "email": "employee@hrms.com",
  "password": "$2a$10$eImiTXuGPur1YegmDFJY1.y2mUWhf/92t2.HupQd4ZkY/PtbB1tLq",
  "role": "ROLE_EMPLOYEE",
  "isEmailVerified": true,
  "createdAt": ISODate("2026-07-04T10:00:00Z"),
  "updatedAt": ISODate("2026-07-04T10:05:00Z"),
  "_class": "com.hrms.dev.entity.User"
}
```

### `employees` Document
```json
{
  "_id": ObjectId("64be348f95c4bc5b8c381c12"),
  "employeeId": "EMP1001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "employee@hrms.com",
  "phone": "9876543210",
  "address": "456 Oak Ave, California",
  "profilePictureUrl": "http://example.com/profiles/emp1001.jpg",
  "department": "Engineering",
  "designation": "Senior Developer",
  "dateOfJoining": ISODate("2026-07-01T00:00:00Z"),
  "salaryStructure": {
    "basicSalary": 80000.0,
    "allowances": 10000.0,
    "deductions": 3000.0
  },
  "createdAt": ISODate("2026-07-04T10:00:00Z"),
  "updatedAt": ISODate("2026-07-04T10:15:00Z"),
  "_class": "com.hrms.dev.entity.Employee"
}
```

### `attendance` Document
```json
{
  "_id": ObjectId("64be35ff95c4bc5b8c381c15"),
  "employeeId": "EMP1001",
  "date": ISODate("2026-07-04T00:00:00Z"),
  "checkIn": ISODate("2026-07-04T09:00:00Z"),
  "checkOut": ISODate("2026-07-04T17:30:00Z"),
  "status": "PRESENT",
  "totalHours": 8.5,
  "remarks": "On-site checkin",
  "_class": "com.hrms.dev.entity.Attendance"
}
```

### `leave_requests` Document
```json
{
  "_id": ObjectId("64be36cf95c4bc5b8c381c19"),
  "employeeId": "EMP1001",
  "leaveType": "PAID",
  "startDate": ISODate("2026-07-10T00:00:00Z"),
  "endDate": ISODate("2026-07-12T00:00:00Z"),
  "status": "APPROVED",
  "remarks": "Personal work",
  "adminComments": "Approved. Please handover tasks.",
  "appliedDate": ISODate("2026-07-04T10:30:00Z"),
  "_class": "com.hrms.dev.entity.LeaveRequest"
}
```

### `payroll` Document
```json
{
  "_id": ObjectId("64be38af95c4bc5b8c381c25"),
  "employeeId": "EMP1001",
  "month": 7,
  "year": 2026,
  "basicSalary": 80000.0,
  "allowances": 10000.0,
  "deductions": 3000.0,
  "netSalary": 87000.0,
  "paymentStatus": "PENDING",
  "generatedDate": ISODate("2026-07-04T11:00:00Z"),
  "_class": "com.hrms.dev.entity.Payroll"
}
```
