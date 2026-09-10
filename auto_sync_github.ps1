# ==============================================================================
# DAIRY DOVA - Continuous Auto-Deploy File Watcher for GitHub
# Watches all project files and automatically commits & pushes changes to GitHub
# ==============================================================================

param(
    [int]$DebounceSeconds = 3
)

$env:PATH = "C:\Users\keesa\AppData\Local\github-copilot-git-2.53.0-3\cmd;C:\Users\keesa\AppData\Local\github-copilot-git-2.53.0-3\mingw64\bin;" + $env:PATH

$repoPath = $PSScriptRoot
Set-Location $repoPath

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DAIRY DOVA - CONTINUOUS AUTO-DEPLOY FILE WATCHER" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Repository: https://github.com/sainarendrakumarkeesari-design/Dairy_Nova" -ForegroundColor White
Write-Host "  Watching directory: $repoPath" -ForegroundColor White
Write-Host "  Mode: Auto-Commit & Auto-Push on every file change" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop the watcher at any time." -ForegroundColor DarkGray
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

function Run-GitPush {
    param([string]$Reason)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Change detected: $Reason" -ForegroundColor Yellow
    Write-Host "[$timestamp] Staging all updates (git add .)..." -ForegroundColor DarkCyan
    
    git add .
    
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "[$timestamp] Repository is up to date." -ForegroundColor DarkGray
        return
    }

    Write-Host "[$timestamp] Committing changes..." -ForegroundColor DarkCyan
    git commit -m "Auto-update: $timestamp"

    Write-Host "[$timestamp] Pushing to GitHub (origin main)..." -ForegroundColor Cyan
    $pushOut = git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$timestamp] SUCCESS: Automatically deployed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "[$timestamp] Push output: $pushOut" -ForegroundColor DarkYellow
    }
    Write-Host ""
}

# Initial synchronization on startup
Run-GitPush "Initial startup sync"

# Setup FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite

$ignorePatterns = @('\.git', '\.gemini', '\.vscode', 'node_modules', 'auto_sync_github\.log')

$global:autoSyncLastTrigger = [DateTime]::MinValue
$global:autoSyncPendingReason = ""

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $name = $Event.SourceEventArgs.Name

    foreach ($pattern in $ignorePatterns) {
        if ($path -match $pattern) { return }
    }

    $global:autoSyncPendingReason = "$name ($changeType)"
    $global:autoSyncLastTrigger = [DateTime]::Now
}

$h1 = Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
$h2 = Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
$h3 = Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
$h4 = Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action

Write-Host "Watcher is active and running. Waiting for file changes..." -ForegroundColor Green

try {
    while ($true) {
        Start-Sleep -Milliseconds 500
        
        if ($global:autoSyncLastTrigger -ne [DateTime]::MinValue) {
            $elapsed = ([DateTime]::Now - $global:autoSyncLastTrigger).TotalSeconds
            if ($elapsed -ge $DebounceSeconds) {
                $reason = $global:autoSyncPendingReason
                $global:autoSyncLastTrigger = [DateTime]::MinValue
                $global:autoSyncPendingReason = ""
                Run-GitPush $reason
            }
        }
    }
}
finally {
    @($h1, $h2, $h3, $h4) | ForEach-Object { 
        if ($_) { Unregister-Event -SourceIdentifier $_.Name -ErrorAction SilentlyContinue } 
    }
    $watcher.Dispose()
    Write-Host "Auto-deploy watcher stopped." -ForegroundColor Yellow
}
