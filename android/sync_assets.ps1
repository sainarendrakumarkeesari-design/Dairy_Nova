# ==============================================================================
# DAIRY DOVA - Android Asset Synchronizer & Icon Generator
# Copies all root web files into the Android WebView asset directory
# ==============================================================================

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidAssetWww = Join-Path $PSScriptRoot "app\src\main\assets\www"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DAIRY DOVA - SYNCING ASSETS TO ANDROID APP" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Source: $root"
Write-Host "  Destination: $androidAssetWww"

# Ensure destination directories exist
if (-not (Test-Path $androidAssetWww)) {
    New-Item -ItemType Directory -Path $androidAssetWww -Force | Out-Null
}

$foldersToCopy = @("css", "js", "assets", "admin")
foreach ($folder in $foldersToCopy) {
    $srcPath = Join-Path $root $folder
    $destPath = Join-Path $androidAssetWww $folder
    if (Test-Path $srcPath) {
        Write-Host "Syncing folder: $folder ..." -ForegroundColor DarkCyan
        Copy-Item -Path $srcPath -Destination $androidAssetWww -Recurse -Force
    }
}

$filesToCopy = @("index.html", "admin.html", "testing.html", "farmer-auth.html", "manifest.json", "sw.js")
foreach ($file in $filesToCopy) {
    $srcPath = Join-Path $root $file
    if (Test-Path $srcPath) {
        Write-Host "Syncing file: $file ..." -ForegroundColor DarkCyan
        Copy-Item -Path $srcPath -Destination $androidAssetWww -Force
    }
}

# Sync App Icons into Android Mipmap Folders
$iconSrc = Join-Path $root "assets\app-icon.png"
if (Test-Path $iconSrc) {
    Write-Host "Syncing launcher mipmap icons..." -ForegroundColor DarkCyan
    $mipmapDirs = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
    foreach ($m in $mipmapDirs) {
        $targetMipmap = Join-Path $PSScriptRoot "app\src\main\res\$m"
        if (-not (Test-Path $targetMipmap)) {
            New-Item -ItemType Directory -Path $targetMipmap -Force | Out-Null
        }
        Copy-Item -Path $iconSrc -Destination (Join-Path $targetMipmap "ic_launcher.png") -Force
        Copy-Item -Path $iconSrc -Destination (Join-Path $targetMipmap "ic_launcher_round.png") -Force
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ASSETS SYNCHRONIZED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  The Android app is ready to build in Android Studio." -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan
