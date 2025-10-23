# Test Shop Management API
Write-Host "=== Testing Shop Management API ===" -ForegroundColor Green

# Configuration
$baseUrl = "https://localhost:7000"
$shopId = 1
$adminToken = "REPLACE_WITH_ADMIN_TOKEN"

# Headers
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Test Case 1: Get all shops with OData support
Write-Host "`n=== Test Case 1: Get all shops ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "All shops: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting shops: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 2: Get shops with OData filter (active shops only)
Write-Host "`n=== Test Case 2: Get active shops only ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops?`$filter=isActive eq true" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Active shops: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting active shops: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 3: Get shops with OData filter (banned shops only)
Write-Host "`n=== Test Case 3: Get banned shops only ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops?`$filter=isActive eq false" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Banned shops: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting banned shops: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 4: Get specific shop by ID
Write-Host "`n=== Test Case 4: Get shop by ID ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$shopId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Shop details: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting shop: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 5: Ban shop
Write-Host "`n=== Test Case 5: Ban shop ===" -ForegroundColor Yellow
$banBody = @{
    shopId = $shopId
    isActive = $false
} | ConvertTo-Json

Write-Host "Request body: $banBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$shopId/status" -Method PUT -Body $banBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test Case 6: Check shop status after ban
Write-Host "`n=== Test Case 6: Check shop status after ban ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$shopId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Shop status after ban: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting shop: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 7: Unban shop
Write-Host "`n=== Test Case 7: Unban shop ===" -ForegroundColor Yellow
$unbanBody = @{
    shopId = $shopId
    isActive = $true
} | ConvertTo-Json

Write-Host "Request body: $unbanBody" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$shopId/status" -Method PUT -Body $unbanBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}

# Test Case 8: Check shop status after unban
Write-Host "`n=== Test Case 8: Check shop status after unban ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$shopId" -Method GET -Headers $headers -SkipCertificateCheck
    Write-Host "Shop status after unban: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Error getting shop: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Case 9: Test with invalid shop ID
Write-Host "`n=== Test Case 9: Test with invalid shop ID ===" -ForegroundColor Yellow
$invalidShopId = 999
$invalidBody = @{
    shopId = $invalidShopId
    isActive = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shops/$invalidShopId/status" -Method PUT -Body $invalidBody -Headers $headers -SkipCertificateCheck
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Expected error for invalid shop: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
Write-Host "Check the console output for debug logs and audit trail." -ForegroundColor Yellow
