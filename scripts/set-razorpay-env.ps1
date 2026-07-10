param(
  [string]$EnvPath = ".env"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root $EnvPath

Write-Host ""
Write-Host "HUMAIX ECHO REALM - Razorpay Local Setup" -ForegroundColor Cyan
Write-Host "This saves keys only on this computer in $EnvPath. Do not share RAZORPAY_KEY_SECRET." -ForegroundColor Yellow
Write-Host ""

$keyId = Read-Host "Enter RAZORPAY_KEY_ID"
$secretSecure = Read-Host "Enter RAZORPAY_KEY_SECRET" -AsSecureString
$secretPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
try {
  $keySecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPtr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPtr)
}

if ([string]::IsNullOrWhiteSpace($keyId) -or [string]::IsNullOrWhiteSpace($keySecret)) {
  throw "Both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required."
}

$existing = @{}
if (Test-Path -LiteralPath $target) {
  Get-Content -LiteralPath $target | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+?)=(.*)$") {
      $existing[$matches[1].Trim()] = $matches[2]
    }
  }
}

if (-not $existing.ContainsKey("PORT")) { $existing["PORT"] = "3000" }
if (-not $existing.ContainsKey("SESSION_SECRET")) {
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $existing["SESSION_SECRET"] = [Convert]::ToHexString($bytes).ToLower()
}

$existing["RAZORPAY_KEY_ID"] = $keyId.Trim()
$existing["RAZORPAY_KEY_SECRET"] = $keySecret.Trim()

$order = @(
  "PORT",
  "SESSION_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "UPI_ID",
  "AI_PROVIDER",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET"
)

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Local environment for HUMAIX ECHO REALM")
$lines.Add("# Keep this file private. It is ignored by git.")
foreach ($name in $order) {
  if ($existing.ContainsKey($name)) {
    $lines.Add("$name=$($existing[$name])")
  }
}
foreach ($name in ($existing.Keys | Sort-Object)) {
  if ($order -notcontains $name) {
    $lines.Add("$name=$($existing[$name])")
  }
}

Set-Content -LiteralPath $target -Value $lines -Encoding UTF8

Write-Host ""
Write-Host "Saved Razorpay keys to $target" -ForegroundColor Green
Write-Host "Next: restart local server with: npm start" -ForegroundColor Cyan
Write-Host "For live Vercel site, add the same variables in Vercel Project Settings > Environment Variables and redeploy." -ForegroundColor Yellow
