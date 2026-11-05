$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputDirectory = Join-Path $projectRoot 'levering'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$zipPath = Join-Path $outputDirectory ('MovieMate-B03-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip')
# Recurse explicitly to avoid traversing dependencies and generated directories.
$excludedDirectories = @('node_modules', '.wrangler', '.expo', 'dist', 'coverage', '.web-reference', 'levering', '.claude', '.codex', '.agents', '.vscode')
function Add-ProjectFiles([string]$directory, $archive) {
  foreach ($item in Get-ChildItem -LiteralPath $directory -Force) {
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
    if ($item.PSIsContainer) {
      if ($item.Name -notin $excludedDirectories) { Add-ProjectFiles $item.FullName $archive }
    } else {
      $relative = $item.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
      # Keep .git history; omit working credentials, caches and lock files used by running tools.
      if ($item.Name -match '^\.env($|\.)|^\.dev\.vars($|\.)' -and $item.Name -notin @('.env.example', '.dev.vars.example')) { continue }
      if ($item.Name -match '\.(log|tsbuildinfo|zip)$|^\.DS_Store$|^index\.lock$') { continue }
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $item.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
}
$archive = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
try { Add-ProjectFiles $projectRoot $archive } finally { $archive.Dispose() }
$check = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $names = @($check.Entries | ForEach-Object FullName)
  if (-not ($names -contains '.git/HEAD')) { throw 'Arkivet mangler .git/HEAD.' }
  if ($names | Where-Object { $_ -match '(^|/)(node_modules|\.wrangler|\.env|\.dev\.vars)(/|$)' }) { throw 'Arkivet inneholder filer som skal utelates.' }
  Write-Output ('Verifisert zip med .git og uten lokale hemmeligheter: ' + $zipPath)
} finally { $check.Dispose() }
