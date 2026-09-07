# 📱 DAIRY NOVA - Mobile Application (Android Project & PWA)

This directory contains the **Native Android Application Wrapper** for **Dairy Nova**. It bundles the entire web application locally into `app/src/main/assets/www/` so the app operates **100% offline with zero external server dependencies**.

---

## 🚀 How to Build the Android APK

### Option A: Using Android Studio (Recommended)

1. Open **Android Studio**.
2. Click **File > Open...** and select the **`android`** folder inside this project (`c:\Users\keesa\OneDrive\Desktop\New folder (2)\android`).
3. Allow Android Studio a moment to index and sync Gradle dependencies automatically.
4. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in the top menu.
5. Once built, click **locate** in the popup notification to find your **`app-debug.apk`**!
6. Transfer this APK to any Android phone and install it directly.

---

### Option B: Generating a Release Signed APK for Play Store

1. In Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle (.aab)** for Google Play, or **APK** for direct distribution.
3. Select your existing keystore or click **Create new...**
4. Choose **release**, check **V1/V2 signature**, and click **Finish**.

---

## 🔄 Syncing Web Updates to the Android App

Whenever you make changes to HTML, CSS, JavaScript, or images in the main Dairy Nova project:

1. Simply double-click **`sync_assets.bat`** (or run `powershell .\sync_assets.ps1`).
2. It will automatically copy all the updated web code and icons into `android/app/src/main/assets/www/`.
3. In Android Studio, click **Run (Shift + F10)** or **Build APK** to see your updates immediately.

---

## 📲 Alternative: Instant Mobile PWA Installation (Zero Build Required)

Dairy Nova is also equipped with a full **Progressive Web App (PWA)** layer (`manifest.json` and `sw.js`):

- **Android**: Open Dairy Nova in Google Chrome, tap the 3-dots menu, and select **"Add to Home screen"** or **"Install App"**.
- **iOS / iPhone**: Open Dairy Nova in Safari, tap the **Share** button, and tap **"Add to Home Screen"**.

The app will appear on your phone's home screen with the custom Dairy Nova droplet icon and launch in full-screen standalone mode without any browser URL bar.
