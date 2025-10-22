# Dashboard API Documentation

## Tổng quan

API Dashboard cung cấp thống kê tổng quan và thông báo cho hệ thống quản trị.

## Endpoint

### GET /api/dashboard/overview

Lấy dữ liệu tổng quan dashboard

**Authorization:** Admin Only

**Response:**

```json
{
  "totalActiveUsers": 150,
  "totalActiveShops": 25,
  "totalSubcategories": 45,
  "totalTransactions": 1200,
  "totalPendingSupportTickets": 8,
  "notifications": [
    {
      "type": "NewShop",
      "message": "3 shop mới đã đăng ký hôm nay",
      "createdAt": "2024-01-15T10:30:00Z",
      "count": 3
    },
    {
      "type": "NewTransaction",
      "message": "15 giao dịch mới hôm nay",
      "createdAt": "2024-01-15T10:30:00Z",
      "count": 15
    },
    {
      "type": "NewSupportTicket",
      "message": "2 yêu cầu hỗ trợ mới hôm nay",
      "createdAt": "2024-01-15T10:30:00Z",
      "count": 2
    },
    {
      "type": "NewOrder",
      "message": "Tổng số đơn hàng: 45",
      "createdAt": "2024-01-15T10:30:00Z",
      "count": 45
    },
    {
      "type": "NewRevenue",
      "message": "Doanh thu hôm nay: 2,500,000 VNĐ",
      "createdAt": "2024-01-15T10:30:00Z",
      "count": 2500000
    }
  ]
}
```

## Các loại thông báo

1. **NewShop**: Thông báo shop mới đăng ký trong ngày
2. **NewTransaction**: Thông báo giao dịch mới trong ngày
3. **NewSupportTicket**: Thông báo yêu cầu hỗ trợ mới trong ngày
4. **NewOrder**: Thông báo tổng số đơn hàng
5. **NewRevenue**: Thông báo doanh thu trong ngày

## Thống kê

- **totalActiveUsers**: Tổng số người dùng không bị ban (IsActive = true)
- **totalActiveShops**: Tổng số shop không bị ban (IsActive = true)
- **totalSubcategories**: Tổng số subcategory
- **totalTransactions**: Tổng số giao dịch
- **totalPendingSupportTickets**: Tổng số ticket hỗ trợ chưa xử lý

## Cách sử dụng

1. Đăng nhập với tài khoản Admin
2. Gửi request GET đến `/api/dashboard/overview` với Bearer token
3. Nhận response chứa dữ liệu thống kê và thông báo

## Lưu ý

- API chỉ dành cho Admin (yêu cầu role ADMIN)
- Dữ liệu được tính theo thời gian thực
- Thông báo chỉ hiển thị khi có dữ liệu mới trong ngày
