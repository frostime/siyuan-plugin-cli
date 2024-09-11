$scriptDir = $PSScriptRoot

$elevateScript = Join-Path $scriptDir "elevate.ps1"
$makeDevLinkScript = Join-Path $scriptDir "make_dev_link.js"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File $elevateScript -scriptPath $makeDevLinkScript
