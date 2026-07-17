# test-exports.ps1

Write-Host "Running Tenant Isolation Export Tests" -ForegroundColor Cyan

# 1. Login admin
$loginAdmin = Invoke-RestMethod -Method POST "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body '{"usernameOrEmail":"admin","password":"admin123"}'
$tokenAdmin = $loginAdmin.token

# 2. Export products (Admin)
Write-Host "Testing Admin Export Products..."
$resAdmin = Invoke-WebRequest -Method GET "http://localhost:8080/api/v1/admin/exports/products" -Headers @{ Authorization = "Bearer $tokenAdmin" }
if ($resAdmin.StatusCode -eq 200) {
    Write-Host "Admin Export Products: OK (200)" -ForegroundColor Green
    # Output part of the CSV to show it works
    $csv = [System.Text.Encoding]::UTF8.GetString($resAdmin.Content)
    Write-Host "CSV Prefix: $($csv.Substring(0, [math]::Min(100, $csv.Length)))"
} else {
    Write-Host "Admin Export Products Failed: $($resAdmin.StatusCode)" -ForegroundColor Red
}

# 3. Login tenant2admin
$loginT2 = Invoke-RestMethod -Method POST "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body '{"usernameOrEmail":"tenant2admin","password":"tenant2admin123"}'
$tokenT2 = $loginT2.token

# 4. Export products (Tenant 2 Admin)
Write-Host "Testing Tenant 2 Admin Export Products..."
$resT2 = Invoke-WebRequest -Method GET "http://localhost:8080/api/v1/admin/exports/products" -Headers @{ Authorization = "Bearer $tokenT2" }
if ($resT2.StatusCode -eq 200) {
    Write-Host "Tenant 2 Admin Export Products: OK (200)" -ForegroundColor Green
    $csv2 = [System.Text.Encoding]::UTF8.GetString($resT2.Content)
    Write-Host "CSV Prefix: $($csv2.Substring(0, [math]::Min(100, $csv2.Length)))"
} else {
    Write-Host "Tenant 2 Admin Export Products Failed: $($resT2.StatusCode)" -ForegroundColor Red
}

# 5. Login shop1admin
$loginShop = Invoke-RestMethod -Method POST "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body '{"usernameOrEmail":"shop1admin","password":"shop123"}'
$tokenShop = $loginShop.token

# 6. Try admin export endpoint
Write-Host "Testing Shop Admin trying to export..."
try {
    $resShop = Invoke-WebRequest -Method GET "http://localhost:8080/api/v1/admin/exports/products" -Headers @{ Authorization = "Bearer $tokenShop" }
    Write-Host "Shop Admin Export Products: Unexpectedly Succeeded ($($resShop.StatusCode))" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode
    if ($statusCode -eq 'Forbidden') {
        Write-Host "Shop Admin Export Products: Blocked (403 Forbidden) - AS EXPECTED" -ForegroundColor Green
    } else {
        Write-Host "Shop Admin Export Products: Failed with $statusCode" -ForegroundColor Yellow
    }
}

# 7. Login platform admin
$loginPlatform = Invoke-RestMethod -Method POST "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body '{"usernameOrEmail":"platform_admin","password":"platform_admin123"}'
$tokenPlatform = $loginPlatform.token

# 8. Export tenants (Platform Admin)
Write-Host "Testing Platform Admin Export Tenants..."
$resPlatform = Invoke-WebRequest -Method GET "http://localhost:8080/api/v1/platform/exports/tenants" -Headers @{ Authorization = "Bearer $tokenPlatform" }
if ($resPlatform.StatusCode -eq 200) {
    Write-Host "Platform Admin Export Tenants: OK (200)" -ForegroundColor Green
    $csvPlat = [System.Text.Encoding]::UTF8.GetString($resPlatform.Content)
    Write-Host "CSV Prefix: $($csvPlat.Substring(0, [math]::Min(100, $csvPlat.Length)))"
} else {
    Write-Host "Platform Admin Export Tenants Failed: $($resPlatform.StatusCode)" -ForegroundColor Red
}

Write-Host "Done"
