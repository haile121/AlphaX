# One commit per file (run from repo root after .gitignore is committed)
$ErrorActionPreference = 'Continue'
$root = (Resolve-Path '.').Path

$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
  $f = $_.FullName
  $f -notmatch '\\node_modules\\' -and
  $f -notmatch '\\.git\\' -and
  $f -notmatch '\\.next\\' -and
  $f -notmatch '\\dist\\' -and
  $f -notmatch '\\.gitignore$' -and
  $f -notmatch '\\backend\\.env$' -and
  $f -notmatch '\\frontend\\.env\\.local$' -and
  $f -notmatch '\\backend\\public\\certificates\\[^\\]+\\.pdf$' -and
  $f -notmatch '\\commit-each\\.ps1$'
} | Sort-Object FullName

$n = 0
foreach ($item in $files) {
  $rel = $item.FullName.Substring($root.Length + 1).Replace('\', '/')
  git add -- $item.FullName 2>&1 | Out-Null
  git diff --cached --quiet
  if ($LASTEXITCODE -eq 1) {
    git commit -m "Add $rel"
    if ($LASTEXITCODE -eq 0) { $n++; Write-Host "Committed: $rel" }
  }
}
Write-Host "Done. Commits created: $n"
