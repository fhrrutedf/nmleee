@echo off
echo === دفع الإصلاحات إلى GitHub ===
git add .
git commit -m "Fix dynamic route params for Next.js 15+"
git push origin main
echo === تم بنجاح ===
pause
