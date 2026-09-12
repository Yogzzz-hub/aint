# Supabase Database Setup Script
# This script loads the schema and seed data into your Supabase PostgreSQL database

Write-Host "=== AINTRIX Supabase Setup ===" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
    Write-Host "✓ Loaded .env file" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

$DATABASE_URL = $env:DATABASE_URL

if (-not $DATABASE_URL) {
    Write-Host "✗ DATABASE_URL not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database URL found" -ForegroundColor Green
Write-Host ""

# Check if psql is available
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ psql found: $psqlVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Loading schema.sql..." -ForegroundColor Yellow
$schemaResult = psql "$DATABASE_URL" -f "schema.sql" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema loaded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Schema load failed:" -ForegroundColor Red
    Write-Host $schemaResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Loading seed.sql..." -ForegroundColor Yellow
$seedResult = psql "$DATABASE_URL" -f "seed.sql" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Seed data loaded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Seed load failed:" -ForegroundColor Red
    Write-Host $seedResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Supabase database is ready with:" -ForegroundColor Green
Write-Host "  • 8 tables (users, articles, jobs, research, contacts, etc.)" -ForegroundColor White
Write-Host "  • 1 admin user (admin@aintrix.com / Aintrix@2026)" -ForegroundColor White
Write-Host "  • 5 demo jobs" -ForegroundColor White
Write-Host "  • 3 demo articles" -ForegroundColor White
Write-Host "  • 4 demo research posts" -ForegroundColor White
Write-Host ""
Write-Host "Start the backend with: python -m uvicorn server:app --reload --port 8000" -ForegroundColor Yellow
