// اعمال تنظیمات بومی اندروید: تمام‌صفحه، قفل افقی، بدون نوار وضعیت
import fs from "fs";
import path from "path";

const AND = "android";
if (!fs.existsSync(AND)) {
  console.log("پوشه‌ی android پیدا نشد — رد شد.");
  process.exit(0);
}

const rd = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const wr = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
  console.log("✓ نوشته شد:", p);
};

/* ---------- 1) AndroidManifest: قفل افقی + تمام‌صفحه ---------- */
const manPath = path.join(AND, "app/src/main/AndroidManifest.xml");
let man = rd(manPath);
if (man) {
  // چرخش صفحه قفل روی حالت افقی
  if (man.includes("android:screenOrientation")) {
    man = man.replace(/android:screenOrientation="[^"]*"/g, 'android:screenOrientation="sensorLandscape"');
  } else {
    man = man.replace(/(<activity\b)/, '$1\n            android:screenOrientation="sensorLandscape"');
  }
  // جلوگیری از ریست شدن بازی هنگام چرخش/تغییر اندازه
  if (!man.includes("android:configChanges")) {
    man = man.replace(/(<activity\b)/, '$1\n            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"');
  }
  // نمایش روی بریدگی صفحه (notch)
  if (!man.includes("android:resizeableActivity")) {
    man = man.replace(/(<activity\b)/, '$1\n            android:resizeableActivity="false"');
  }
  wr(manPath, man);
}

/* ---------- 2) styles.xml: تمام‌صفحه کردن تم‌های موجود ---------- */
const stylesPath = path.join(AND, "app/src/main/res/values/styles.xml");
let styles = rd(stylesPath);
if (styles) {
  const FS_ITEMS = `
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>`;
  // به تم اصلی بعد از اسپلش
  if (!/name="AppTheme\.NoActionBar"[\s\S]*?windowFullscreen/.test(styles)) {
    styles = styles.replace(
      /(<style name="AppTheme\.NoActionBar"[^>]*>)/,
      `$1${FS_ITEMS}`
    );
  }
  // به تم اسپلش (تا از همان ابتدا تمام‌صفحه باشد)
  if (!/name="AppTheme\.NoActionBarLaunch"[\s\S]*?windowFullscreen/.test(styles)) {
    styles = styles.replace(
      /(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)/,
      `$1${FS_ITEMS}`
    );
  }
  wr(stylesPath, styles);
}

/* ---------- 3) رنگ پس‌زمینه ---------- */
const colorsPath = path.join(AND, "app/src/main/res/values/colors.xml");
let colors = rd(colorsPath);
if (colors) {
  if (!colors.includes("gameBackground")) {
    colors = colors.replace("</resources>", '    <color name="gameBackground">#0b0f18</color>\n</resources>');
    wr(colorsPath, colors);
  }
} else {
  wr(colorsPath, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="gameBackground">#0b0f18</color>\n</resources>\n');
}

/* ---------- 4) MainActivity: مخفی کردن کامل نوارها ---------- */
const javaRoot = path.join(AND, "app/src/main/java");
function findMain(dir) {
  if (!fs.existsSync(dir)) return null;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const r = findMain(p);
      if (r) return r;
    } else if (e.name === "MainActivity.java") return p;
  }
  return null;
}
const mainPath = findMain(javaRoot);
if (mainPath) {
  const pkg = (rd(mainPath).match(/package\s+([\w.]+);/) || [])[1] || "ir.artam.adventuregame";
  wr(
    mainPath,
    `package ${pkg};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // صفحه همیشه روشن بماند
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
    }
}
`
  );
}

/* ---------- 5) نام اپ ---------- */
const stringsPath = path.join(AND, "app/src/main/res/values/strings.xml");
let strings = rd(stringsPath);
if (strings) {
  strings = strings
    .replace(/<string name="app_name">[^<]*<\/string>/, '<string name="app_name">ماجراجویی</string>')
    .replace(/<string name="title_activity_main">[^<]*<\/string>/, '<string name="title_activity_main">ماجراجویی</string>');
  wr(stringsPath, strings);
}

/* ---------- 6) شماره نسخه ---------- */
const gradlePath = path.join(AND, "app/build.gradle");
let gradle = rd(gradlePath);
if (gradle) {
  gradle = gradle.replace(/versionName\s+"[^"]*"/, 'versionName "1.0"');
  wr(gradlePath, gradle);
}

console.log("\n✅ تنظیمات اندروید اعمال شد: افقی + تمام‌صفحه + بدون نوار سیستم");
