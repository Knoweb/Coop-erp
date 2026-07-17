$ErrorActionPreference = 'Stop'
$baseUrl = "http://localhost:8080/api/v1"

Write-Host "1. Login as Tenant Admin and Shop Admin"
$loginBodyAdmin = @{ usernameOrEmail = "admin"; password = "admin123" } | ConvertTo-Json
$resAdmin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBodyAdmin -ContentType "application/json"
$tenantToken = $resAdmin.token

$loginBodyShop = @{ usernameOrEmail = "shop1admin"; password = "shop123" } | ConvertTo-Json
$resShop = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBodyShop -ContentType "application/json"
$shopToken = $resShop.token

Write-Host "2. Get a Product as Tenant Admin"
$headersAdmin = @{ Authorization = "Bearer $tenantToken" }
$products = Invoke-RestMethod -Uri "$baseUrl/admin/products" -Method Get -Headers $headersAdmin

if ($products.Count -eq 0) {
    Write-Host "No products found!"
    exit
}
$product = $products[0]
$productId = $product.id

Write-Host "3. Get a Shop Terminal as Shop Admin"
$headersShop = @{ Authorization = "Bearer $shopToken" }
# Wait, /shop/terminals might require shopId in query, but shopAdmin can get it
$terminals = Invoke-RestMethod -Uri "$baseUrl/shop/terminals" -Method Get -Headers $headersShop -ErrorAction SilentlyContinue

if ($null -eq $terminals -or $terminals.Count -eq 0) {
    # Try fetching via tenant admin
    $shops = Invoke-RestMethod -Uri "$baseUrl/admin/shops" -Method Get -Headers $headersAdmin
    $shopId = $shops[0].id
    $terminals = Invoke-RestMethod -Uri "$baseUrl/shop/terminals?shopId=$shopId" -Method Get -Headers $headersAdmin
}

if ($terminals.Count -eq 0) {
    Write-Host "No terminals found for shop!"
    exit
}
$terminal = $terminals[0]
$terminalId = $terminal.id
$shopId = $terminal.shopId
$terminal = $terminals[0]
$terminalId = $terminal.id

Write-Host "Target Product: $($product.name) (ID: $productId)"
Write-Host "Target Shop: $($shopId), Terminal: $terminalId"

Write-Host "3.5 Open Cash Session"
$shiftBody = @{
    shopId = $shopId
    terminalId = $terminalId
    openingCash = 1000
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/shop/cash-session/open" -Method Post -Body $shiftBody -ContentType "application/json" -Headers $headersShop | Out-Null
    Write-Host "Shift opened successfully."
} catch {
    Write-Host "Shift open returned error (might be Jackson serialization or already open): $_"
}

# Add stock adjustment to ensure exactly 10 items in stock
Write-Host "3.6 Add Stock Adjustment (10 items)"
$adjBody = @{
    itemId = $productId
    quantity = 10
    adjustmentType = "Opening Stock"
    reason = "Testing race condition"
    remarks = "Test script"
} | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$baseUrl/inventory/adjustments" -Method Post -Body $adjBody -ContentType "application/json" -Headers $headersAdmin | Out-Null
} catch {
    Write-Host "Adjustment failed: $_"
}

# Set up the sale body
$saleBody = @{
    notes = "Concurrency test"
    saleType = "CUSTOMER"
    terminalId = $terminalId
    paymentMethod = "CASH"
    paymentStatus = "PAID"
    paidAmount = 100
    items = @(
        @{
            productId = $productId
            quantity = 6
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "4. Testing Race Condition (2 parallel requests for huge quantity)"

$job1 = Start-Job -ScriptBlock {
    param($url, $token, $shopId, $body)
    try {
        $res = Invoke-RestMethod -Uri "$url/shop/sales?shopId=$shopId" -Method Post -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
        return "JOB1 SUCCESS: Sale created"
    } catch {
        return "JOB1 FAILED: $_"
    }
} -ArgumentList $baseUrl, $shopToken, $shopId, $saleBody

$job2 = Start-Job -ScriptBlock {
    param($url, $token, $shopId, $body)
    try {
        $res = Invoke-RestMethod -Uri "$url/shop/sales?shopId=$shopId" -Method Post -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
        return "JOB2 SUCCESS: Sale created"
    } catch {
        return "JOB2 FAILED: $_"
    }
} -ArgumentList $baseUrl, $shopToken, $shopId, $saleBody

Wait-Job -Job $job1, $job2 | Out-Null

$result1 = Receive-Job -Job $job1
$result2 = Receive-Job -Job $job2

Write-Host ""
Write-Host "--- RESULTS ---"
Write-Host $result1
Write-Host $result2

Remove-Job -Job $job1, $job2
