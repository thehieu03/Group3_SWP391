# Test Role Synchronization Logic
Write-Host "=== Testing Role Synchronization Logic ===" -ForegroundColor Green

function Test-SynchronizeLogic {
    param(
        [string]$Description,
        [int[]]$CurrentRoles,
        [int[]]$NewRoles
    )
    
    Write-Host "`n--- $Description ---" -ForegroundColor Yellow
    Write-Host "Current roles: [$($CurrentRoles -join ', ')]" -ForegroundColor Cyan
    Write-Host "New roles: [$($NewRoles -join ', ')]" -ForegroundColor Cyan
    
    # Find roles to add (in newRoles but not in currentRoles)
    $rolesToAdd = $NewRoles | Where-Object { $CurrentRoles -notcontains $_ }
    
    # Find roles to remove (in currentRoles but not in newRoles)
    $rolesToRemove = $CurrentRoles | Where-Object { $NewRoles -notcontains $_ }
    
    Write-Host "Roles to add: [$($rolesToAdd -join ', ')]" -ForegroundColor Green
    Write-Host "Roles to remove: [$($rolesToRemove -join ', ')]" -ForegroundColor Red
    
    # Check if seller role (ID: 2) is being removed
    $hasSellerRoleToRemove = $rolesToRemove -contains 2
    if ($hasSellerRoleToRemove) {
        Write-Host "⚠️  SELLER role will be removed - shops should be deactivated" -ForegroundColor Magenta
    }
    
    # Final result
    Write-Host "Final roles: [$($NewRoles -join ', ')]" -ForegroundColor White
}

# Test Case 1: User has [3, 2], Frontend sends [3]
Test-SynchronizeLogic -Description "User has [CUSTOMER, SELLER], Frontend sends [CUSTOMER]" -CurrentRoles @(3, 2) -NewRoles @(3)

# Test Case 2: User has [3], Frontend sends [3, 2]
Test-SynchronizeLogic -Description "User has [CUSTOMER], Frontend sends [CUSTOMER, SELLER]" -CurrentRoles @(3) -NewRoles @(3, 2)

# Test Case 3: User has [3, 2], Frontend sends [2]
Test-SynchronizeLogic -Description "User has [CUSTOMER, SELLER], Frontend sends [SELLER]" -CurrentRoles @(3, 2) -NewRoles @(2)

# Test Case 4: User has [3, 2], Frontend sends []
Test-SynchronizeLogic -Description "User has [CUSTOMER, SELLER], Frontend sends []" -CurrentRoles @(3, 2) -NewRoles @()

# Test Case 5: User has [3], Frontend sends [3]
Test-SynchronizeLogic -Description "User has [CUSTOMER], Frontend sends [CUSTOMER]" -CurrentRoles @(3) -NewRoles @(3)

Write-Host "`n=== All tests completed ===" -ForegroundColor Green
Write-Host "The logic looks correct! Now test the actual API." -ForegroundColor Yellow
