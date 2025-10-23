# Debug Role Synchronization Issue

## Problem

API PUT `/api/accounts/{userId}/role` không thực sự synchronize roles trong database.

## Debug Steps

### 1. Chạy ứng dụng với debug logs

```bash
cd Mmo_Api
dotnet run
```

### 2. Test với PowerShell script

```powershell
# Mở PowerShell và chạy:
cd Mmo_Api
.\test_roles_api.ps1
```

**Lưu ý**: Cần thay đổi `$adminToken` trong script thành token admin thực tế.

### 3. Kiểm tra debug logs trong console

Khi gọi API, bạn sẽ thấy logs như:

```
[DEBUG] User 15 - Current roles: [3, 2]
[DEBUG] User 15 - New roles: [3]
[DEBUG] User 15 - Roles to add: []
[DEBUG] User 15 - Roles to remove: [2]
[DEBUG] DeleteAccountRoles SQL: DELETE FROM accountroles WHERE accountId = @accountId AND roleId IN (@roleId0)
[DEBUG] DeleteAccountRoles Parameters: accountId=15, roleIds=[2]
[DEBUG] DeleteAccountRoles affected rows: 1
```

### 4. Test cases

#### Test Case 1: Chỉ giữ CUSTOMER role

```json
PUT /api/accounts/15/role
{
  "userId": 15,
  "roleIds": [3]
}
```

**Expected**: User 15 chỉ có role CUSTOMER (ID: 3)
**Expected logs**:

- Current roles: [3, 2] (hoặc [2, 3])
- Roles to remove: [2]
- DeleteAccountRoles affected rows: 1

#### Test Case 2: Thêm SELLER role

```json
PUT /api/accounts/15/role
{
  "userId": 15,
  "roleIds": [3, 2]
}
```

**Expected**: User 15 có roles CUSTOMER và SELLER
**Expected logs**:

- Current roles: [3]
- Roles to add: [2]
- InsertAccountRoles affected rows: 1

### 5. Kiểm tra database trực tiếp

```sql
-- Kiểm tra roles hiện tại của user 15
SELECT ar.accountId, ar.roleId, r.roleName
FROM accountroles ar
LEFT JOIN roles r ON ar.roleId = r.roleId
WHERE ar.accountId = 15;

-- Kiểm tra shops của user 15
SELECT shopId, name, isActive
FROM shops
WHERE accountId = 15;
```

## Possible Issues & Solutions

### Issue 1: SQL DELETE không chạy

**Symptom**: `DeleteAccountRoles affected rows: 0`
**Solution**: Kiểm tra SQL syntax và parameters

### Issue 2: Transaction rollback

**Symptom**: SQL chạy nhưng database không thay đổi
**Solution**: Kiểm tra transaction scope và connection

### Issue 3: Cache issue

**Symptom**: Database đã thay đổi nhưng API trả về data cũ
**Solution**: Clear cache hoặc restart application

### Issue 4: Role ID mapping sai

**Symptom**: Roles không đúng với expected
**Solution**: Kiểm tra mapping giữa roleId và roleName

## Debug Commands

### Kiểm tra connection string

```bash
# Trong appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=your_db;Uid=your_user;Pwd=your_password;"
}
```

### Kiểm tra Dapper package

```bash
cd Mmo_Application
dotnet list package | findstr Dapper
```

### Kiểm tra logs chi tiết

Thêm vào `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Information",
      "System.Data": "Information"
    }
  }
}
```

## Expected Results After Fix

### Before Fix:

- User 15 có roles: [CUSTOMER, SELLER]
- Frontend gửi: [CUSTOMER]
- Database: Vẫn [CUSTOMER, SELLER] ❌

### After Fix:

- User 15 có roles: [CUSTOMER, SELLER]
- Frontend gửi: [CUSTOMER]
- Database: Chỉ [CUSTOMER] ✅
- Shops của user bị deactivate ✅
