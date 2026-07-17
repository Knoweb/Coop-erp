$ErrorActionPreference = 'Stop'
$baseUrl = "http://localhost:8080/api/v1"

# Helper function to get token
function Get-Token {
    param($username, $password, $tenantCode)
    $body = @{
        usernameOrEmail = $username
        password = $password
        tenantCode = $tenantCode
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    return $response
}

Write-Host "1. Login as Admin and Shop Admin"
$adminRes = Get-Token "admin" "admin123" "COOPFED_KILINOCHCHI"
$shopRes = Get-Token "shop1admin" "shop123" "COOPFED_KILINOCHCHI"

$adminToken = $adminRes.token
$shopToken = $shopRes.token
$shopId = $shopRes.user.shopId

Write-Host "DEBUG: shopId = $shopId"

$headersAdmin = @{ Authorization = "Bearer $adminToken" }
$headersShop = @{ Authorization = "Bearer $shopToken" }

Write-Host "2. Get Product and Terminals"
$products = Invoke-RestMethod -Uri "$baseUrl/admin/products" -Headers $headersAdmin
$productId = $products[0].id

$terminals = Invoke-RestMethod -Uri "$baseUrl/shop/terminals" -Headers $headersShop
if ($terminals.Count -lt 2) {
    Write-Host "Need at least 2 terminals for this test."
    exit 1
}

$pos1 = $terminals[0]
$pos2 = $terminals[1]

Write-Host "POS 1: $($pos1.terminalCode) (ID: $($pos1.id))"
Write-Host "POS 2: $($pos2.terminalCode) (ID: $($pos2.id))"

Write-Host "3. Add stock so sales succeed"
$adjBody = @{
    itemId = $productId
    quantity = 100
    adjustmentType = "Opening Stock"
    reason = "Testing terminal isolation"
    remarks = "Test script"
} | ConvertTo-Json

# 1. Add to main stock (using shop token because of endpoint config, but it updates main stock)
Invoke-RestMethod -Uri "$baseUrl/shop/stock-adjustments" -Method Post -Body $adjBody -ContentType "application/json" -Headers $headersShop | Out-Null

# 2. Transfer to shop via Admin SHOP sale
$transferBody = @{
    saleType = "SHOP"
    targetShopId = $shopId
    notes = "Transfer to shop"
    paymentMethod = "CASH"
    paymentStatus = "PAID"
    paidAmount = 0
    items = @(
        @{
            productId = $productId
            quantity = 50
            unitPrice = 0
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "$baseUrl/admin/sales" -Method Post -Body $transferBody -ContentType "application/json" -Headers $headersAdmin | Out-Null

Write-Host "4. Open sessions for POS_1 and POS_2"
function Open-Session($terminalId, $shopIdParam, $openingCash) {
    $body = @{
        shopId = $shopIdParam
        terminalId = $terminalId
        openingCash = $openingCash
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$baseUrl/shop/cash-session/open" -Method Post -Body $body -ContentType "application/json" -Headers $headersShop | Out-Null
    } catch {
        # Might already be open
    }
}
Open-Session $pos1.id $shopId 1000
Open-Session $pos2.id $shopId 500

Write-Host "5. Create CASH and CARD sale on POS_1"
function Create-Sale($terminalId, $paymentMethod, $amount) {
    $saleBody = @{
        notes = "Test $paymentMethod sale on $terminalId"
        saleType = "CUSTOMER"
        terminalId = $terminalId
        paymentMethod = $paymentMethod
        paymentStatus = "PAID"
        paidAmount = $amount
        items = @(
            @{
                productId = $productId
                quantity = 1
                unitPrice = $amount
            }
        )
    } | ConvertTo-Json -Depth 10
    try {
        Invoke-RestMethod -Uri "$baseUrl/shop/sales" -Method Post -Body $saleBody -ContentType "application/json" -Headers $headersShop | Out-Null
    } catch {
        Write-Host "Failed to create sale: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        }
        exit 1
    }
}

Create-Sale $pos1.id "CASH" 600
Create-Sale $pos1.id "CARD" 500

Write-Host "6. Verify Sales History Isolation"
$today = (Get-Date).ToString("yyyy-MM-dd")
Start-Sleep -Seconds 2

$pos1Sales = Invoke-RestMethod -Uri "$baseUrl/shop/sales/history?terminalId=$($pos1.id)" -Headers $headersShop
$pos2Sales = Invoke-RestMethod -Uri "$baseUrl/shop/sales/history?terminalId=$($pos2.id)" -Headers $headersShop

$pos1HasOurSales = ($pos1Sales | Where-Object { $_.paymentMethod -in 'CASH','CARD' }).Count -ge 2
$pos2HasOurSales = ($pos2Sales | Where-Object { $_.paymentMethod -in 'CASH','CARD' -and $_.notes -match $pos1.id }).Count -gt 0

Write-Host "POS_1 History Count: $($pos1Sales.Count)"
Write-Host "POS_2 History Count: $($pos2Sales.Count)"

if ($pos1HasOurSales -and -not $pos2HasOurSales) {
    Write-Host "PASS: POS_1 and POS_2 sales history is isolated."
} else {
    Write-Host "FAIL: Sales history isolation failed."
}

Write-Host "7. Verify Cash Totals for POS_1"
$pos1Session = Invoke-RestMethod -Uri "$baseUrl/shop/cash-session/current?terminalId=$($pos1.id)" -Headers $headersShop
if ($pos1Session) {
    Write-Host "Expected Cash: $($pos1Session.expectedCash)"
    Write-Host "Card Total: $($pos1Session.cardSalesTotal)"
    Write-Host "Total Sales: $($pos1Session.totalSales)"
    
    if ($pos1Session.expectedCash -ge 1600 -and $pos1Session.cardSalesTotal -ge 500) {
        Write-Host "PASS: Totals are correctly calculated for Cash vs Card."
    } else {
        Write-Host "FAIL: Totals do not match expected logic."
    }
} else {
    Write-Host "FAIL: Could not fetch POS 1 session."
}
