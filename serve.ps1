param(
    [int]$port = 3000
)

# DAIRY DOVA - Lightweight Local Web Server (PowerShell HttpListener)
# Serves static files on http://localhost:3000 without requiring Node.js or Python

$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
} catch {
    # If 127.0.0.1 requires URL reservation, localhost is sufficient
}

try {
    $listener.Start()
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host " DAIRY DOVA Local Web Server Running!" -ForegroundColor Green
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Press Ctrl+C in this terminal to stop the server." -ForegroundColor Gray
    Write-Host "=================================================" -ForegroundColor Cyan
    
    # Auto-open browser
    try {
        Start-Process $prefix
    } catch {
        Write-Host "Browser could not be auto-opened. Please open $prefix manually." -ForegroundColor Yellow
    }

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrEmpty($urlPath) -or $urlPath -eq "/") {
                $urlPath = "index.html"
            }

            # URL decode path to handle spaces and encoded characters
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)

            # Route clean URLs: /admin -> admin.html (or admin/index.html)
            if ($urlPath -eq "admin" -or $urlPath -eq "admin/") {
                if (Test-Path (Join-Path $folder "admin\index.html") -PathType Leaf) {
                    $filePath = Join-Path $folder "admin\index.html"
                } else {
                    $filePath = Join-Path $folder "admin.html"
                }
            } elseif (Test-Path (Join-Path $folder "$urlPath.html") -PathType Leaf) {
                $filePath = Join-Path $folder "$urlPath.html"
            } else {
                $filePath = Join-Path $folder $urlPath
                if ((Test-Path $filePath -PathType Container) -and (Test-Path (Join-Path $filePath "index.html") -PathType Leaf)) {
                    $filePath = Join-Path $filePath "index.html"
                }
            }

            if (Test-Path $filePath -PathType Leaf) {
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($extension) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".json" { "application/json" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    default { "application/octet-stream" }
                }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.AddHeader("Access-Control-Allow-Origin", "*")

                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentType = "text/plain; charset=utf-8"
                $response.ContentLength64 = $notFoundBytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
                }
            }

            $response.Close()
        } catch {
            # Catch per-request errors without exiting the server loop
            if ($response) {
                try { $response.Close() } catch {}
            }
        }
    }
} finally {
    try {
        $listener.Stop()
        $listener.Close()
    } catch {}
}

