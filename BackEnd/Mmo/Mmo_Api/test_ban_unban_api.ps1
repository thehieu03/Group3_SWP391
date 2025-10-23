# Test Ban/Unban User API
Write-Host "=== Testing Ban/Unban User API ===" -ForegroundColor Green

# Configuration
$baseUrl = "https://localhost:7000"
$userId = 15
$adminToken = "REPLACE_WITH_ADMIN_TOKEN"

# Headers
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Test Case 1: Check current user status
Write-Host "`n=== Test Case 1: Check current user status ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$userId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Current user status: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 2: Ban user
Write-Host "`n=== Test Case 2: Ban user ===" -ForegroundColor Yellow
$banBody = @{
    userId = $userId
    isActive = $false
} | ConvertTo-Json

Write-Host "Request body: $banBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$userId/status" -Method PUT -Body $banBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test Case 3: Check user status after ban
Write-Host "`n=== Test Case 3: Check user status after ban ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$userId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "User status after ban: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 4: Unban user
Write-Host "`n=== Test Case 4: Unban user ===" -ForegroundColor Yellow
$unbanBody = @{
    userId = $userId
    isActive = $true
} | ConvertTo-Json

Write-Host "Request body: $unbanBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$userId/status" -Method PUT -Body $unbanBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test Case 5: Check user status after unban
Write-Host "`n=== Test Case 5: Check user status after unban ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$userId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "User status after unban: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting user: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 6: Test with invalid user ID
Write-Host "`n=== Test Case 6: Test with invalid user ID ===" -ForegroundColor Yellow
$invalidUserId = 999
$invalidBody = @{
    userId = $invalidUserId
    isActive = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/accounts/$invalidUserId/status" -Method PUT -Body $invalidBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Expected error for invalid user: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
Write-Host "Check the console output for debug logs and audit trail." -ForegroundColor Yellow
