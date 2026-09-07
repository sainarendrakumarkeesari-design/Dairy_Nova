# DAIRY NOVA (DAIRY DOVA) 🥛
### Smart Milk Quality, Purity & RFID Cloud-Based Pricing System

An automated milk quality testing, IoT sensor simulation, interactive RFID farmer identification, 5-tier purity grading, and transparent cloud pricing platform.

---

## 🌟 Key Features

- 🔬 **Automated Milk Quality Testing**: Real-time evaluation of FAT %, SNF %, pH, Density, Temperature, and Adulteration tests.
- 🏷️ **Interactive RFID Scanner**: Instant farmer identification and profile retrieval with smart card emulation.
- 📊 **5-Tier Purity Grading System**: Accurate classification (Grade A+ to Rejected) based on standardized dairy metrics.
- 💰 **Cloud Pricing Engine**: Dynamic formula-based milk valuation based on Fat/SNF ratios and quality grade multipliers.
- 📱 **3 Role Portals**:
  - 👨‍🌾 **Farmer Portal & Passbook**: View collection history, purity certificates, payment statements, and alerts.
  - 🏭 **Collection Center**: Operator interface for RFID scanning, sensor testing, and instant receipt generation.
  - 🏢 **Dairy Cooperative Admin**: High-level overview, analytics charts, price slab configuration, and audit logs.
- 📜 **Purity Traceability**: Batch verification and QR/hash-based authenticity records for milk consignments.
- 🔊 **Voice & Audio Feedback**: Integrated audio cues and speech announcements for field operators.

---

## 🚀 Getting Started

This application is built with vanilla web technologies (HTML5, CSS3, JavaScript) and requires **no complex build steps or dependencies**.

### Running Locally

#### Method 1: Using the Included PowerShell Server (Windows)
Double-click `run.bat` or open PowerShell in the project directory:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
The server will start at:
👉 **`http://localhost:8080/`**

#### Method 2: Using Python
```bash
# Python 3
python -m http.server 8080
```

#### Method 3: Using Node.js (npx)
```bash
npx serve .
```

#### Method 4: Directly in Browser
Simply open `index.html` in any modern web browser.

---

## 📂 Project Structure

```
├── assets/
│   └── logo.svg            # Application vector logo
├── css/
│   ├── components.css      # UI components and layout styling
│   └── style.css           # Core styling and theme definitions
├── js/
│   ├── app.js              # Core application logic and router
│   ├── audio.js            # Sound effects and audio feedback
│   ├── charts.js           # Interactive data visualization
│   ├── database.js         # Local database & persistence layer
│   ├── pricing.js          # Pricing engine calculations
│   └── sensors.js          # IoT sensor simulations & calibrations
├── index.html              # Main single-page application entry point
├── run.bat                 # Quick launcher batch file for Windows
├── serve.ps1               # Lightweight local HTTP server script
└── README.md               # Project documentation
```

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
