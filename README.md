# بازی ماجراجویی | Adventure World 🎮

یه بازی HTML5 Canvas کاملاً مستقل به زبان فارسی. بدون نیاز به هیچ فریمورک یا بیلد، فقط `index.html` رو باز کنید و بازی کنید.

## اجرا

```bash
# فقط کافیه index.html رو باز کنید
# یا یه سرور ساده بالا بیارید:
python3 -m http.server 8080
```

بعد به `http://localhost:8080` برید.

## ساخت APK (اندروید)

این مخزن یه **GitHub Actions Workflow** داره که خودش بازی رو تو یه WebView بسته‌بندی می‌کنه و APK می‌سازه.

### روش استفاده:

1. تغییرات رو push کنید:
   ```bash
   git add . && git commit -m "msg" && git push
   ```

2. تو GitHub برید به تب **Actions** ← workflow "Build Android APK" رو اجرا کنید.

3. بعد از اتمام، تو صفحه run پایین قسمت **Artifacts** فایل `app-debug.apk` رو دانلود کنید.

### دانلود آخرین APK بدون نیاز به بیلد:

تو صفحه Actions هر run موفق یه APK قابل دانلود میذاره. یا می‌تونید release بزنید که APK کنار کد منتشر بشه.

## ساختار مخزن

```
.
├── index.html                  # خود بازی (تک‌فایل)
├── .github/workflows/main.yml  # Workflow بیلد APK
└── README.md
```