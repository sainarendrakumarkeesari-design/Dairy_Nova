/**
 * DAIRY DOVA - Embedded IoT Sensors & Raspberry Pi 5 Edge Terminal Simulator
 * Simulates:
 * - Compute Hub: Raspberry Pi 5 (Quad-Core 2.4GHz, 8GB)
 * - ADC Interfacing: ADS1115 16-Bit Precision I2C ADC (Channels A0, A1, A2, A3)
 * - Sensor Array: SEN0161 pH, TS-300B Turbidity, TDS/Conductivity, DS18B20 1-Wire, HX711 Load Cell
 * - Actuation: Relay-controlled 12V peristaltic flush pump (citric-acid reverse wash)
 * - On-Device Edge AI: Scikit-Learn ML regression (<8s inference latency)
 * - Local SQLite Purity Ledger with offline resilience
 */

class SensorEngine {
  constructor() {
    this.isConnected = sessionStorage.getItem('dairy_nova_hardware_connected') === 'true';
    this.hasTested = false;
    this.isFlushing = false;
    this.isOfflineResilient = true;

    // Current Sensor Live State
    this.state = {
      volume: 0,          // Litres (HX711 Load Cell mass-to-volume)
      netWeightKg: 0,     // kg (Load Cell Mass)
      grossWeightKg: 0,   // kg
      tareWeightKg: 2.15, // kg
      fat: 0,             // % (On-Device ML Regression & Optical NIR)
      snf: 0,             // % (Solids-Not-Fat)
      waterAdded: 0,      // % (Conductance dilution)
      ph: 0,              // pH units (SEN0161 via ADS1115 A0)
      conductivity: 0,    // mS/cm at 25°C (TDS & EC via ADS1115 A2)
      turbidity: 0,       // NTU (TS-300B Turbidity via ADS1115 A1)
      temperature: 0,     // °C (DS18B20 1-Wire Digital Temp)
      density: 0,         // kg/L (Richmond formula)
      protein: 0,         // %
      lactose: 0,         // %
      adulterants: [],
      purityScore: 0,
      classification: null,
      isScanning: false,
      sampleType: 'Cow',
      
      // ADS1115 16-Bit I2C ADC Converter Channels
      adcChannels: {
        A0: { name: 'SEN0161 Analog pH', voltage: 0.0, raw: 0, unit: 'V' },
        A1: { name: 'TS-300B Turbidity', voltage: 0.0, raw: 0, unit: 'V' },
        A2: { name: 'TDS / Conductivity', voltage: 0.0, raw: 0, unit: 'V' },
        A3: { name: 'HX711 Strain Gauge', voltage: 0.0, raw: 0, unit: 'V' }
      },

      // Raspberry Pi 5 Edge Hub Telemetry
      pi5: {
        model: "Raspberry Pi 5 (Quad-Core 2.4GHz Cortex-A76, 8GB)",
        cpuTemp: 43.8,
        fanRpm: 2750,
        activeCoolerStatus: "OPTIMAL (<55°C)",
        upsBatteryPct: 98,
        overlayfs: "Active (Read-Only)",
        offlineAutonomy: true,
        lastInferenceLatencyMs: 640
      }
    };

    // 5-Tier Predefined Quality Classification Standards
    this.gradeStandards = {
      GRADE_A_PLUS: {
        code: "GRADE A+",
        label: "Elite Pure / Premium",
        badgeClass: "badge-success",
        color: "#10b981",
        purityMin: 95.0,
        priceMultiplier: 1.12,
        description: "Optimal biological composition, 0% added water, zero chemicals, exceptional freshness."
      },
      GRADE_A: {
        code: "GRADE A",
        label: "Standard Pure Compliant",
        badgeClass: "badge-primary",
        color: "#0ea5e9",
        purityMin: 85.0,
        priceMultiplier: 1.00,
        description: "Fully compliant with FSSAI & Cooperative purity benchmarks. No adulterants detected."
      },
      GRADE_B: {
        code: "GRADE B",
        label: "Marginal / Dilution Warning",
        badgeClass: "badge-warning",
        color: "#f59e0b",
        purityMin: 70.0,
        priceMultiplier: 0.90,
        description: "Minor compositional deficit or slight dilution (1–5%). Requires herd nutrition review."
      },
      GRADE_C: {
        code: "GRADE C",
        label: "Substandard / High Dilution",
        badgeClass: "badge-warning",
        color: "#f97316",
        purityMin: 50.0,
        priceMultiplier: 0.75,
        description: "Excessive water dilution detected (>5%). Significant rate deduction applied."
      },
      GRADE_F: {
        code: "GRADE F",
        label: "Adulterated / Rejected Hazard",
        badgeClass: "badge-danger",
        color: "#ef4444",
        purityMin: 0.0,
        priceMultiplier: 0.00,
        description: "Chemical adulterant contamination (Urea, Soda, Starch, or Detergent). Batch confiscated."
      }
    };

    // Realistic Simulation Presets
    this.presets = {
      standardAnalysis: {
        name: "Standard Pure Cow Milk (4.2% Fat)",
        badge: "GRADE A+ OPTIMAL",
        badgeClass: "badge-success",
        sampleType: "Cow",
        volume: 25.4,
        fat: 4.20,
        protein: 3.40,
        lactose: 4.65,
        density: 1.030,
        snf: 8.75,
        waterAdded: 0.0,
        ph: 6.68,
        conductivity: 4.85,
        turbidity: 2150,
        temp: 6.8,
        adulterants: []
      },
      pureCow: {
        name: "Pure Cow Milk (A2 Gir)",
        badge: "GRADE A+",
        badgeClass: "badge-success",
        sampleType: "Cow",
        volume: 38.5,
        fat: 4.6,
        protein: 3.45,
        lactose: 4.75,
        density: 1.031,
        snf: 8.85,
        waterAdded: 0.0,
        ph: 6.68,
        conductivity: 4.75,
        turbidity: 2200,
        temp: 18.2,
        adulterants: []
      },
      pureBuffalo: {
        name: "Pure Buffalo Milk (Murrah)",
        badge: "GRADE A+ PREMIUM",
        badgeClass: "badge-success",
        sampleType: "Buffalo",
        volume: 45.0,
        fat: 7.8,
        snf: 9.35,
        waterAdded: 0.0,
        ph: 6.64,
        conductivity: 4.90,
        turbidity: 2450,
        temp: 19.0,
        adulterants: []
      },
      waterDiluted: {
        name: "Water-Diluted Sample",
        badge: "GRADE C DILUTED",
        badgeClass: "badge-warning",
        sampleType: "Cow",
        volume: 40.0,
        fat: 2.8,
        snf: 7.4,
        waterAdded: 22.5,
        ph: 6.72,
        conductivity: 3.40,
        turbidity: 1100,
        temp: 22.0,
        adulterants: ["Added Water (+22.5%)", "Conductivity Anomaly (<4.0 mS/cm)"]
      },
      chemicalContaminated: {
        name: "Synthetic / Neutralizer Sample",
        badge: "GRADE F REJECTED",
        badgeClass: "badge-danger",
        sampleType: "Cow",
        volume: 32.0,
        fat: 3.1,
        snf: 7.1,
        waterAdded: 18.0,
        ph: 7.85,
        conductivity: 8.40,
        turbidity: 1650,
        temp: 24.5,
        adulterants: ["Neutralizer (Sodium Bicarbonate)", "Urea / Detergent Trace", "High pH (7.85)", "High Conductivity (8.4 mS/cm)"]
      },
      souredMilk: {
        name: "Soured / Bacterial Degradation",
        badge: "GRADE C SOUR",
        badgeClass: "badge-danger",
        sampleType: "Cow",
        volume: 25.0,
        fat: 4.1,
        snf: 8.3,
        waterAdded: 0.0,
        ph: 5.75,
        conductivity: 5.80,
        turbidity: 2050,
        temp: 31.0,
        adulterants: ["High Lactic Acidity (pH 5.75)", "Elevated Temp (31°C)"]
      }
    };

    this.recalculateDerivedParameters();
  }

  // Recalculate secondary parameters, ADS1115 ADC voltages, and 5-tier classification
  recalculateDerivedParameters() {
    const s = this.state;

    // Density via Richmond's Formula + Temp Compensation
    const tempCorrection = (20.0 - (s.temperature || 20.0)) * 0.00025;
    const clr = (s.snf - (0.21 * s.fat) - 0.36) / 0.25;
    const baseDensity = 1 + (clr / 1000);
    s.density = parseFloat((baseDensity + tempCorrection).toFixed(3));

    // Mass via HX711 Load Cell = Volume × Density
    s.netWeightKg = parseFloat((s.volume * s.density).toFixed(2));
    s.grossWeightKg = parseFloat((s.netWeightKg + (s.tareWeightKg || 2.15)).toFixed(2));

    // Protein & Lactose estimation
    s.protein = parseFloat((s.snf * 0.385).toFixed(2));
    s.lactose = parseFloat((s.snf * 0.535).toFixed(2));

    // Physical Conductivity & Turbidity modeling
    if (!s.conductivity || s.conductivity === 0) {
      if (s.waterAdded > 0) {
        s.conductivity = parseFloat(Math.max(2.5, 4.80 - (s.waterAdded * 0.05)).toFixed(2));
      } else {
        s.conductivity = 4.85;
      }
    }
    if (!s.turbidity || s.turbidity === 0) {
      if (s.waterAdded > 0) {
        s.turbidity = Math.max(700, Math.round(2100 - (s.waterAdded * 45)));
      } else {
        s.turbidity = 2150;
      }
    }

    // ADS1115 16-Bit I2C ADC Voltage Converter Simulation (0 - 3.3V / 4.096V Gain)
    // Channel A0: SEN0161 Analog pH Probe
    const phVolt = parseFloat((1.50 + ((7.0 - (s.ph || 7.0)) * 0.22)).toFixed(3));
    s.adcChannels.A0 = {
      name: 'SEN0161 Analog pH Probe',
      voltage: Math.max(0, phVolt),
      raw: Math.round((phVolt / 4.096) * 32767),
      unit: 'V'
    };

    // Channel A1: TS-300B Turbidity Sensor (0-4.5V)
    const turbVolt = parseFloat((1.10 + ((s.turbidity / 3000) * 2.8)).toFixed(3));
    s.adcChannels.A1 = {
      name: 'TS-300B Turbidity Sensor',
      voltage: Math.max(0, turbVolt),
      raw: Math.round((turbVolt / 4.096) * 32767),
      unit: 'V'
    };

    // Channel A2: TDS & Electrical Conductivity Probe
    const ecVolt = parseFloat((0.45 + ((s.conductivity / 10.0) * 2.4)).toFixed(3));
    s.adcChannels.A2 = {
      name: 'TDS / Conductivity Probe',
      voltage: Math.max(0, ecVolt),
      raw: Math.round((ecVolt / 4.096) * 32767),
      unit: 'V'
    };

    // Channel A3: HX711 Load Cell Strain Gauge Bridge
    const loadVolt = parseFloat((0.25 + ((s.grossWeightKg / 50.0) * 2.2)).toFixed(3));
    s.adcChannels.A3 = {
      name: 'HX711 Strain Gauge Bridge',
      voltage: Math.max(0, loadVolt),
      raw: Math.round((loadVolt / 4.096) * 32767),
      unit: 'V'
    };

    // Purity Score calculation (0 - 100)
    let score = 100.0;

    // Penalty for added water
    if (s.waterAdded > 0) {
      score -= (s.waterAdded * 2.2);
    }

    // Penalty for pH deviation
    if (s.ph < 6.5) {
      score -= (6.5 - s.ph) * 35;
    } else if (s.ph > 6.85) {
      score -= (s.ph - 6.85) * 45;
    }

    // Penalty for conductivity deviation
    if (s.conductivity > 5.5) {
      score -= (s.conductivity - 5.5) * 15;
    } else if (s.conductivity < 4.0 && s.conductivity > 0) {
      score -= (4.0 - s.conductivity) * 12;
    }

    // Penalty for chemical adulterants
    if (s.adulterants.length > 0) {
      const hasChemicals = s.adulterants.some(a => 
        a.toLowerCase().includes('neutralizer') || 
        a.toLowerCase().includes('urea') || 
        a.toLowerCase().includes('detergent') ||
        a.toLowerCase().includes('synthetic') ||
        a.toLowerCase().includes('starch')
      );
      score -= hasChemicals ? 60 : (s.adulterants.length * 20);
    }

    // Penalty for temperature out of fresh bounds
    if (s.temperature > 25) {
      score -= (s.temperature - 25) * 1.5;
    }

    s.purityScore = Math.max(0.0, Math.min(100.0, parseFloat(score.toFixed(1))));

    // Assign Predefined Classification
    s.classification = this.classifySample(s);
  }

  // Classification Rules Engine
  classifySample(state) {
    if (!state.fat && !state.purityScore) {
      return {
        code: "--",
        label: "Awaiting Milk Sample",
        badgeClass: "badge-secondary",
        color: "#94a3b8",
        purityMin: 0,
        priceMultiplier: 0.00,
        description: "Connect Raspberry Pi 5 terminal & run scan to analyze milk purity."
      };
    }

    const hasChemical = state.adulterants.some(a => 
      a.toLowerCase().includes('neutralizer') || 
      a.toLowerCase().includes('urea') || 
      a.toLowerCase().includes('detergent') ||
      a.toLowerCase().includes('synthetic') ||
      a.toLowerCase().includes('starch')
    );

    if (hasChemical || state.purityScore < 50.0 || state.ph > 7.4 || state.ph < 6.0 || state.conductivity > 7.0) {
      return this.gradeStandards.GRADE_F;
    }

    if (state.waterAdded > 10.0 || state.purityScore < 70.0) {
      return this.gradeStandards.GRADE_C;
    }

    if (state.waterAdded > 0.0 || state.purityScore < 85.0 || state.fat < 3.2 || state.snf < 8.2) {
      return this.gradeStandards.GRADE_B;
    }

    if (state.purityScore >= 95.0 && state.waterAdded === 0 && 
       ((state.sampleType === 'Cow' && state.fat >= 4.2 && state.snf >= 8.6) || 
        (state.sampleType === 'Buffalo' && state.fat >= 7.0 && state.snf >= 9.0))) {
      return this.gradeStandards.GRADE_A_PLUS;
    }

    return this.gradeStandards.GRADE_A;
  }

  // Trigger Live Optical NIR Multi-Sensor Scan on Raspberry Pi 5 Chamber
  triggerOpticalScan(sampleType = this.state.sampleType || 'Cow') {
    this.hasTested = true;
    this.state.isScanning = false;
    this.state.sampleType = sampleType;

    if (sampleType === 'Buffalo') {
      this.state.fat = parseFloat((6.60 + Math.random() * 0.90).toFixed(2));
      this.state.snf = parseFloat((9.10 + Math.random() * 0.40).toFixed(2));
      this.state.protein = parseFloat((3.80 + Math.random() * 0.30).toFixed(2));
      this.state.lactose = parseFloat((4.80 + Math.random() * 0.20).toFixed(2));
      this.state.density = 1.032;
      this.state.conductivity = parseFloat((4.80 + Math.random() * 0.25).toFixed(2));
      this.state.turbidity = Math.round(2300 + Math.random() * 200);
    } else {
      this.state.fat = parseFloat((4.15 + Math.random() * 0.45).toFixed(2));
      this.state.snf = parseFloat((8.65 + Math.random() * 0.30).toFixed(2));
      this.state.protein = parseFloat((3.35 + Math.random() * 0.20).toFixed(2));
      this.state.lactose = parseFloat((4.62 + Math.random() * 0.15).toFixed(2));
      this.state.density = 1.030;
      this.state.conductivity = parseFloat((4.75 + Math.random() * 0.20).toFixed(2));
      this.state.turbidity = Math.round(2100 + Math.random() * 150);
    }

    this.state.temperature = parseFloat((6.4 + Math.random() * 1.2).toFixed(1));
    this.state.ph = parseFloat((6.65 + Math.random() * 0.08).toFixed(2));
    this.state.waterAdded = 0.0;
    this.state.adulterants = [];

    // Simulate Pi 5 Active Cooler temperature variation
    this.state.pi5.cpuTemp = parseFloat((42.0 + Math.random() * 4.5).toFixed(1));
    this.state.pi5.lastInferenceLatencyMs = Math.round(580 + Math.random() * 320);

    this.recalculateDerivedParameters();
    return this.state;
  }

  // Actuate 12V Peristaltic Citric Acid Flush Pump (Slide 4 Risk Mitigation)
  triggerCitricFlush(onProgress, onComplete) {
    this.isFlushing = true;
    if (window.soundCtrl && window.soundCtrl.playTick) window.soundCtrl.playTick();

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(100, step * 25);
      if (onProgress) onProgress(progress);

      if (step >= 4) {
        clearInterval(interval);
        this.isFlushing = false;
        // Reset chamber sensors to pristine baseline
        this.state.waterAdded = 0;
        this.state.adulterants = [];
        this.state.ph = 6.68;
        this.state.conductivity = 4.80;
        this.recalculateDerivedParameters();
        if (onComplete) onComplete();
      }
    }, 600);
  }

  // On-Device Scikit-Learn ML Inference Simulation (< 8s Latency)
  runEdgeMLInference(onProgress, onComplete) {
    let elapsedMs = 0;
    const targetLatency = 1200; // Fast UI feedback (~1.2s realistic simulation)
    const stepMs = 150;

    const timer = setInterval(() => {
      elapsedMs += stepMs;
      const progress = Math.min(100, Math.round((elapsedMs / targetLatency) * 100));
      const remainingSec = ((targetLatency - elapsedMs) / 1000).toFixed(1);

      if (onProgress) onProgress(progress, remainingSec);

      if (elapsedMs >= targetLatency) {
        clearInterval(timer);
        this.state.pi5.lastInferenceLatencyMs = Math.round(680 + Math.random() * 240);
        if (onComplete) onComplete(this.state);
      }
    }, stepMs);
  }

  // Toggle Offline Autonomy Resilience (Pi 5 Local SQLite vs Cloud PostgreSQL)
  toggleOfflineResilience() {
    this.isOfflineResilient = !this.isOfflineResilient;
    this.state.pi5.offlineAutonomy = this.isOfflineResilient;
    return this.isOfflineResilient;
  }

  // Reset to Clean Untested State
  resetToClean() {
    this.hasTested = false;
    this.state.volume = 0;
    this.state.fat = 0;
    this.state.snf = 0;
    this.state.protein = 0;
    this.state.lactose = 0;
    this.state.waterAdded = 0;
    this.state.ph = 0;
    this.state.conductivity = 0;
    this.state.turbidity = 0;
    this.state.temperature = 0;
    this.state.density = 0;
    this.state.purityScore = 0;
    this.state.classification = null;
    this.state.adulterants = [];
    this.recalculateDerivedParameters();
  }

  // Load Preset
  loadPreset(presetKey) {
    const p = this.presets[presetKey];
    if (!p) return;

    this.state.sampleType = p.sampleType;
    this.state.volume = p.volume;
    this.state.fat = p.fat;
    this.state.snf = p.snf;
    this.state.waterAdded = p.waterAdded;
    this.state.ph = p.ph;
    this.state.conductivity = p.conductivity;
    this.state.turbidity = p.turbidity;
    this.state.temperature = p.temp;
    this.state.adulterants = [...p.adulterants];

    this.recalculateDerivedParameters();
  }

  // Update specific sensor value
  updateSensor(key, value) {
    const num = parseFloat(value);
    if (isNaN(num)) return;

    if (key === 'volume') this.state.volume = num;
    if (key === 'fat') this.state.fat = num;
    if (key === 'snf') this.state.snf = num;
    if (key === 'waterAdded') {
      this.state.waterAdded = num;
      const waterIndex = this.state.adulterants.findIndex(a => a.includes('Water'));
      if (num > 0) {
        const desc = `Added Water (+${num.toFixed(1)}%)`;
        if (waterIndex >= 0) this.state.adulterants[waterIndex] = desc;
        else this.state.adulterants.push(desc);
      } else if (waterIndex >= 0) {
        this.state.adulterants.splice(waterIndex, 1);
      }
    }
    if (key === 'ph') {
      this.state.ph = num;
      const phIndex = this.state.adulterants.findIndex(a => a.includes('pH') || a.includes('Acidity') || a.includes('Neutralizer'));
      if (num > 7.2) {
        const desc = `Neutralizer / High Alkaline Anomaly (pH ${num.toFixed(2)})`;
        if (phIndex >= 0) this.state.adulterants[phIndex] = desc;
        else this.state.adulterants.push(desc);
      } else if (num < 6.4) {
        const desc = `High Acidity Souring (pH ${num.toFixed(2)})`;
        if (phIndex >= 0) this.state.adulterants[phIndex] = desc;
        else this.state.adulterants.push(desc);
      } else if (phIndex >= 0) {
        this.state.adulterants.splice(phIndex, 1);
      }
    }
    if (key === 'conductivity') this.state.conductivity = num;
    if (key === 'turbidity') this.state.turbidity = num;
    if (key === 'temperature') this.state.temperature = num;
    if (key === 'sampleType') this.state.sampleType = value;

    this.recalculateDerivedParameters();
  }

  // Device Hardware Connectivity Management
  connectDevice() {
    this.isConnected = true;
    sessionStorage.setItem('dairy_nova_hardware_connected', 'true');
    return true;
  }

  disconnectDevice() {
    this.isConnected = false;
    sessionStorage.removeItem('dairy_nova_hardware_connected');
    return false;
  }

  isDeviceConnected() {
    return sessionStorage.getItem('dairy_nova_hardware_connected') === 'true' || this.isConnected;
  }

  // Multi-Wavelength NIR Spectroscopy Spectral Model
  getNIRSpectra(state = this.state) {
    return this.getNIRWavelengthReadings(state);
  }

  getNIRWavelengthReadings(state = this.state) {
    const s = state;
    if (!this.hasTested && s.fat === 0) {
      return [
        { wavelength: 970, bandName: "970 nm", component: "Water / Dilution", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 1215, bandName: "1215 nm", component: "Fat (Lipid CH₂)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 1440, bandName: "1440 nm", component: "Lactose (Sugar)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 1450, bandName: "1450 nm", component: "Water Matrix", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 1510, bandName: "1510 nm", component: "Protein (Casein)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 1730, bandName: "1730 nm", component: "Fat (Key Peak)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 2100, bandName: "2100 nm", component: "Lactose (C-O-C)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" },
        { wavelength: 2180, bandName: "2180 nm", component: "Protein (Amide)", absorbance: 0.000, unit: "AU", relativePct: 0, status: "⚪ AWAITING TEST", color: "#64748b", badgeClass: "badge-primary" }
      ];
    }

    const fatAU = 0.490 + (s.fat * 0.138);
    const fat2ndAU = 0.420 + (s.fat * 0.082);
    const proteinAU = 0.380 + (s.protein * 0.115);
    const proteinAmideAU = 0.450 + (s.protein * 0.125);
    const lactoseAU = 0.510 + (s.lactose * 0.065);
    const lactoseRingAU = 0.410 + (s.lactose * 0.092);
    const waterAU = 0.650 + (s.waterAdded * 0.018);
    const waterMatrixAU = 1.220 + (s.waterAdded * 0.024);

    return [
      {
        wavelength: 970,
        bandName: "970 nm",
        component: "Water / Dilution",
        bond: "O-H 2nd Overtone",
        absorbance: parseFloat(waterAU.toFixed(3)),
        unit: "AU",
        status: s.waterAdded === 0 ? "🟢 NORMAL BASELINE" : "🟡 DILUTION PEAK",
        color: "#38bdf8",
        badgeClass: s.waterAdded === 0 ? "badge-success" : "badge-warning",
        relativePct: Math.min(100, Math.max(15, (waterAU / 1.5) * 100))
      },
      {
        wavelength: 1215,
        bandName: "1215 nm",
        component: "Fat (Lipid CH₂)",
        bond: "C-H 2nd Overtone",
        absorbance: parseFloat(fat2ndAU.toFixed(3)),
        unit: "AU",
        status: s.fat >= 4.0 ? "🟢 OPTIMAL CH₂" : "🔵 STANDARD",
        color: "#eab308",
        badgeClass: s.fat >= 4.0 ? "badge-success" : "badge-primary",
        relativePct: Math.min(100, Math.max(15, (fat2ndAU / 1.5) * 100))
      },
      {
        wavelength: 1440,
        bandName: "1440 nm",
        component: "Lactose (Sugar)",
        bond: "O-H Combination",
        absorbance: parseFloat(lactoseAU.toFixed(3)),
        unit: "AU",
        status: s.lactose >= 4.5 ? "🟢 NATURAL SUGAR" : "🟡 SOURING DROP",
        color: "#10b981",
        badgeClass: s.lactose >= 4.5 ? "badge-success" : "badge-warning",
        relativePct: Math.min(100, Math.max(15, (lactoseAU / 1.5) * 100))
      },
      {
        wavelength: 1450,
        bandName: "1450 nm",
        component: "Water Matrix",
        bond: "O-H 1st Overtone (Primary)",
        absorbance: parseFloat(waterMatrixAU.toFixed(3)),
        unit: "AU",
        status: "🟢 ISO-REFERENCE",
        color: "#0284c7",
        badgeClass: "badge-primary",
        relativePct: Math.min(100, Math.max(15, (waterMatrixAU / 1.6) * 100))
      },
      {
        wavelength: 1510,
        bandName: "1510 nm",
        component: "Protein (Casein)",
        bond: "N-H 1st Overtone",
        absorbance: parseFloat(proteinAU.toFixed(3)),
        unit: "AU",
        status: s.protein >= 3.2 ? "🟢 HIGH PROTEIN" : "🔵 STANDARD",
        color: "#818cf8",
        badgeClass: s.protein >= 3.2 ? "badge-success" : "badge-primary",
        relativePct: Math.min(100, Math.max(15, (proteinAU / 1.5) * 100))
      },
      {
        wavelength: 1730,
        bandName: "1730 nm",
        component: "Fat (Key Principal Peak)",
        bond: "C-H 1st Overtone Stretch",
        absorbance: parseFloat(fatAU.toFixed(3)),
        unit: "AU",
        status: s.fat >= 4.0 ? "🟢 RICH LIPID PEAK" : "🟡 LOW FAT",
        color: "#f59e0b",
        badgeClass: s.fat >= 4.0 ? "badge-success" : "badge-warning",
        relativePct: Math.min(100, Math.max(15, (fatAU / 1.6) * 100))
      },
      {
        wavelength: 2100,
        bandName: "2100 nm",
        component: "Lactose (C-O-C)",
        bond: "C-O / O-H Combination",
        absorbance: parseFloat(lactoseRingAU.toFixed(3)),
        unit: "AU",
        status: "🟢 PURE LACTOSE",
        color: "#34d399",
        badgeClass: "badge-success",
        relativePct: Math.min(100, Math.max(15, (lactoseRingAU / 1.5) * 100))
      },
      {
        wavelength: 2180,
        bandName: "2180 nm",
        component: "Protein (Amide I / II)",
        bond: "C=O / N-H Peptide Bonds",
        absorbance: parseFloat(proteinAmideAU.toFixed(3)),
        unit: "AU",
        status: s.protein >= 3.2 ? "🟢 INTACT PEPTIDE" : "🔴 DEGRADED",
        color: "#a855f7",
        badgeClass: s.protein >= 3.2 ? "badge-success" : "badge-danger",
        relativePct: Math.min(100, Math.max(15, (proteinAmideAU / 1.5) * 100))
      }
    ];
  }

  convertKgToLiters(netWeightKg, density = this.state.density) {
    const d = (density && density > 0.5) ? density : 1.030;
    return parseFloat((netWeightKg / d).toFixed(2));
  }

  convertLitersToKg(volumeLiters, density = this.state.density) {
    const d = (density && density > 0.5) ? density : 1.030;
    return parseFloat((volumeLiters * d).toFixed(2));
  }
}

window.sensorEngine = new SensorEngine();
