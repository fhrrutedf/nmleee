#!/usr/bin/env pwsh
# هذا السكريبت يتحقق من المشكلة ويحلها

Write-Host "=== فحص حالة Git ===" -ForegroundColor Cyan
git log --oneline -5

Write-Host "`n=== الملفات المتغيرة محلياً ===" -ForegroundColor Cyan
git diff --name-only HEAD

Write-Host "`n=== التحقق من الملفات الجديدة ===" -ForegroundColor Cyan
git ls-files --others --exclude-standard

Write-Host "`n=== محتوى layout.tsx السطر 9 ===" -ForegroundColor Cyan
(Get-Content ".\app\dashboard\layout.tsx")[8]

Write-Host "`n=== هل NavbarWrapper موجود في git؟ ===" -ForegroundColor Cyan
git ls-files "app\components\NavbarWrapper.tsx"

Write-Host "`n=== هل integrations page موجود في git؟ ===" -ForegroundColor Cyan
git ls-files "app\dashboard\integrations\page.tsx"

Write-Host "`n=== إضافة كل الملفات وعمل commit ===" -ForegroundColor Yellow
git add --all
$status = git status --porcelain
if ($status) {
    Write-Host "وجدت ملفات جديدة! سأعمل commit..." -ForegroundColor Green
    Write-Host $status
    git commit -m "feat: add integrations page, hide navbar on dashboard, calendar fixes"
    git push origin main
    Write-Host "`n✅ تم الرفع بنجاح!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ لا يوجد تغييرات جديدة في git" -ForegroundColor Yellow
    Write-Host "جميع الملفات الحالية موجودة بالفعل في GitHub" -ForegroundColor Yellow
    
    # Force redeploy by touching a file
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Set-Content -Path ".\public\version.txt" -Value "Version updated: $timestamp"
    git add ".\public\version.txt"
    git commit -m "chore: force redeploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin main
    Write-Host "`n✅ تم إجبار Vercel على إعادة البناء!" -ForegroundColor Green
}
