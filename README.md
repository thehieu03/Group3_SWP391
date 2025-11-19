# MMO - Marketplace Management Online

Hệ thống quản lý thị trường trực tuyến (E-commerce Marketplace) được xây dựng bởi Group 3 - SWP391.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu hình](#cấu-hình)
- [API Documentation](#api-documentation)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Testing](#testing)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)

## 🎯 Giới thiệu

MMO là một nền tảng thương mại điện tử cho phép:
- **Người dùng (User)**: Mua sắm sản phẩm, quản lý đơn hàng, nạp tiền vào tài khoản
- **Người bán (Seller)**: Quản lý shop, sản phẩm, đơn hàng, kho hàng
- **Quản trị viên (Admin)**: Quản lý toàn bộ hệ thống, người dùng, danh mục, hỗ trợ khách hàng

## ✨ Tính năng

### Cho người dùng (User)
- ✅ Đăng ký/Đăng nhập (JWT Authentication, Google OAuth)
- ✅ Duyệt và tìm kiếm sản phẩm
- ✅ Xem chi tiết sản phẩm với variants
- ✅ Mua hàng với validation số dư và tồn kho
- ✅ Quản lý đơn hàng và xem lịch sử
- ✅ Nạp tiền vào tài khoản (VietQR, SePay)
- ✅ Xem lịch sử giao dịch
- ✅ Gửi feedback và đánh giá
- ✅ Hỗ trợ khách hàng (Support Tickets)

### Cho người bán (Seller)
- ✅ Quản lý shop của mình
- ✅ Quản lý sản phẩm (thêm, sửa, xóa)
- ✅ Quản lý variants và tồn kho
- ✅ Xem và xử lý đơn hàng
- ✅ Dashboard thống kê bán hàng

### Cho quản trị viên (Admin)
- ✅ Quản lý người dùng và phân quyền
- ✅ Quản lý danh mục và subcategories
- ✅ Quản lý sản phẩm toàn hệ thống
- ✅ Quản lý đơn hàng
- ✅ Dashboard tổng quan hệ thống
- ✅ Xử lý support tickets
- ✅ Quản lý cấu hình hệ thống

## 🛠 Công nghệ sử dụng

### Backend
- **Framework**: ASP.NET Core 8.0
- **Database**: MySQL
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token
- **API**: RESTful API với OData support
- **Message Queue**: RabbitMQ (cho xử lý đơn hàng bất đồng bộ)
- **Payment Integration**: 
  - VietQR API
  - SePay API
- **Mapping**: AutoMapper
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript
- **Build Tool**: Vite 7.1.6
- **Routing**: React Router DOM 7.9.2
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: 
  - Font Awesome
  - React Icons
- **UI Components**: Custom components
- **State Management**: React Context API
- **Authentication**: JWT với Google OAuth

### Tools & Services
- **Version Control**: Git
- **Package Manager**: 
  - npm (Frontend)
  - NuGet (Backend)
- **Code Quality**: ESLint, Qodana

## 📁 Cấu trúc dự án

```
Group3_SWP391/
├── BackEnd/
│   └── Mmo/
│       ├── Mmo_Api/              # Web API Layer
│       │   ├── Api/              # Controllers
│       │   ├── Boostraping/     # Middleware & DI
│       │   ├── Helper/          # Helper classes
│       │   └── Images/           # Static image storage
│       ├── Mmo_Application/      # Application Layer (Services)
│       │   └── Services/        # Business logic services
│       ├── Mmo_Domain/           # Domain Layer
│       │   ├── Models/           # Entity models
│       │   ├── Enum/             # Enumerations
│       │   ├── ModelRequest/     # Request DTOs
│       │   ├── ModelResponse/    # Response DTOs
│       │   └── IRepository/      # Repository interfaces
│       ├── Mmo_Infrastructure/   # Infrastructure Layer
│       │   └── Repository/       # Repository implementations
│       └── Mmo_Test/             # Unit & Integration Tests
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── contexts/             # React contexts
│   │   ├── hooks/                # Custom hooks
│   │   ├── models/               # TypeScript models
│   │   ├── routes/               # Route configuration
│   │   └── utils/                # Utility functions
│   └── public/                   # Static assets
└── Data/                          # Database scripts/data
```

## 💻 Yêu cầu hệ thống

### Backend
- .NET 8.0 SDK
- MySQL Server 8.0+
- RabbitMQ Server (tùy chọn, cho message queue)
- Docker (tùy chọn, cho containerization)

### Frontend
- Node.js 18+ và npm
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🚀 Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <repository-url>
cd Group3_SWP391
```

### 2. Backend Setup

#### Cài đặt database
1. Tạo database MySQL:
```sql
CREATE DATABASE swp_group3;
```

2. Cập nhật connection string trong `BackEnd/Mmo/Mmo_Api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "????"
  }
}
```

3. Chạy migrations (nếu có) hoặc import database schema từ thư mục `Data/`

#### Cài đặt RabbitMQ (Tùy chọn)
```bash
# Sử dụng Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Hoặc cài đặt trực tiếp
# https://www.rabbitmq.com/download.html
```

#### Chạy Backend
```bash
cd BackEnd/Mmo
dotnet restore
dotnet build
cd Mmo_Api
dotnet run
```

Backend sẽ chạy tại: `https://localhost:5134` (hoặc port được cấu hình)

Swagger UI: `https://localhost:5134/swagger`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4. Build Production

#### Backend
```bash
cd BackEnd/Mmo/Mmo_Api
dotnet publish -c Release
```

#### Frontend
```bash
cd frontend
npm run build
```

Output sẽ ở thư mục `frontend/dist/`

## ⚙️ Cấu hình

### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_MYSQL_CONNECTION_STRING"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "http://localhost:5134",
    "Audience": "http://localhost:5173",
    "DurationInMinutes": 60
  },
  "RabbitMQ": {
    "Enabled": true,
    "Host": "localhost",
    "Port": "5672",
    "Username": "guest",
    "Password": "guest"
  },
  "VietQR": {
    "ApiUrl": "https://api.vietqr.io/image/",
    "BankBin": "YOUR_BANK_BIN",
    "AccountNo": "YOUR_ACCOUNT_NUMBER",
    "AccountName": "YOUR_ACCOUNT_NAME",
    "TemplateId": "YOUR_TEMPLATE_ID"
  },
  "SePay": {
    "ApiUrl": "https://my.sepay.vn/userapi/",
    "ApiKey": "YOUR_SEPAY_API_KEY",
    "AccountNumber": "YOUR_ACCOUNT_NUMBER"
  }
}
```

### Frontend Configuration

Cập nhật API base URL trong `frontend/src/utils/apiBase.ts`:
```typescript
export const API_BASE_URL = 'https://localhost:5134/api';
```

Cấu hình Google OAuth trong `frontend/src/config/clientId.ts`:
```typescript
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
```

## 📚 API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:
- Development: `https://localhost:5134/swagger`

### Các API Endpoints chính:

- **Authentication**: `/api/auth/*`
- **Accounts**: `/api/accounts/*`
- **Products**: `/api/products/*`
- **Orders**: `/api/orders/*`
- **Categories**: `/api/categories/*`
- **Shops**: `/api/shops/*`
- **Deposit**: `/api/deposit/*`
- **Payment History**: `/api/payment-history/*`
- **Support Tickets**: `/api/support-tickets/*`
- **Dashboard**: `/api/dashboard/*`

Tất cả API đều hỗ trợ OData query options (filter, select, orderby, expand, count).

## 🏗 Kiến trúc hệ thống

### Backend Architecture (Clean Architecture)

```
┌─────────────────────────────────────┐
│         Mmo_Api (Presentation)      │
│  - Controllers                      │
│  - Middleware                       │
│  - Configuration                    │
└─────────────┬───────────────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Mmo_Application (Business Logic)  │
│  - Services                          │
│  - DTOs Mapping                      │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Mmo_Domain (Domain Models)      │
│  - Entities                          │
│  - Interfaces                        │
│  - Enums                            │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│  Mmo_Infrastructure (Data Access)    │
│  - Repository Implementation         │
│  - DbContext                         │
└──────────────────────────────────────┘
```

### Frontend Architecture

- **Component-based**: Tách biệt components, pages, layouts
- **Service Layer**: Tách biệt API calls vào services
- **Context API**: Quản lý authentication state
- **Custom Hooks**: Tái sử dụng logic (useAuth, useDebounce, useDeposit)

### Order Processing Flow

1. User tạo đơn hàng → API `/api/orders` (POST)
2. Backend validate (số dư, tồn kho)
3. Tạo order với status `Pending`
4. Gửi message vào RabbitMQ queue (nếu enabled)
5. Consumer xử lý order → Update status `Processing`
6. Trừ số dư, giảm tồn kho
7. Update status `Completed` hoặc `Failed`

## 🧪 Testing

### Backend Tests

```bash
cd BackEnd/Mmo/Mmo_Test
dotnet test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Cases

Xem file `Test_Cases_Purchase_Flow.md` để biết chi tiết các test cases cho purchase flow.

## 🐳 Deployment

### Docker Deployment

#### Backend
```bash
cd BackEnd/Mmo
docker build -f Mmo_Api/Dockerfile -t mmo-api .
docker run -p 8080:8080 mmo-api
```

#### Frontend
Có thể deploy frontend build lên:
- Static hosting (Vercel, Netlify)
- Nginx
- Apache
- CDN

### Environment Variables

Đảm bảo cấu hình các biến môi trường cho production:
- Database connection string
- JWT secret key
- Payment API keys
- RabbitMQ credentials
- CORS origins

## 👥 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được phát triển cho mục đích học tập - SWP391.

## 📞 Liên hệ

Group 3 - SWP391

---

**Lưu ý**: Đây là dự án học tập. Vui lòng cập nhật các thông tin cấu hình (API keys, connection strings) trước khi sử dụng trong môi trường production.

