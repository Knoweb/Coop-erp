$baseUrl = "http://localhost:8080/api/v1"

function Get-Token($username, $password, $tenantCode) {
    $body = @{
        usernameOrEmail = $username
        password = $password
        tenantCode = $tenantCode
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    return $response.token
}

Write-Host "1. Login default admin"
$adminToken = Get-Token "admin" "admin123" "COOPFED_KILINOCHCHI"
$headersAdmin = @{ Authorization = "Bearer $adminToken" }

Write-Host "2. Calling Admin Reports"
$reports = @("trial-balance", "income-statement", "balance-sheet", "cash-flow", "general-ledger")

foreach ($report in $reports) {
    Write-Host "Fetching $report for Admin..."
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/admin/reports/$report" -Headers $headersAdmin
        Write-Host "SUCCESS: $report"
    } catch {
        Write-Host "FAIL: $report - $($_.Exception.Message)"
        exit 1
    }
}

Write-Host "3. Login tenant2admin"
$tenant2Token = Get-Token "tenant2admin" "tenant2admin123" "TEST_TENANT_2"
$headersTenant2 = @{ Authorization = "Bearer $tenant2Token" }

Write-Host "4. Calling Tenant2 Reports"
foreach ($report in $reports) {
    Write-Host "Fetching $report for Tenant2..."
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/admin/reports/$report" -Headers $headersTenant2
        Write-Host "SUCCESS: $report"
    } catch {
        Write-Host "FAIL: $report - $($_.Exception.Message)"
        exit 1
    }
}

Write-Host "All API tests passed!"
