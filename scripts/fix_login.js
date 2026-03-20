const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf-8');
c = c.replace("await signIn('credentials', {", "const res = await signIn('credentials', {");
c = c.replace("// This code won't execute if redirect succeeds", "if (res?.error) { setLoading(false); setError(res.error === 'CredentialsSignin' ? 'البيانات غير صحيحة' : 'حدث خطأ: ' + res.error); return; } else if (res?.ok) { window.location.href = res?.url || callbackUrl; return; }");
fs.writeFileSync('app/login/page.tsx', c);
