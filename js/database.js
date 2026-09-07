/**
 * DAIRY DOVA - Cloud Database & LocalStorage Persistence Ledger
 * Enhanced with Predefined Quality-Based Pricing Rules, Farmer Registration & Management
 */

const STORAGE_KEYS = {
  FARMERS: 'dairy_dova_farmers',
  RECORDS: 'dairy_dova_records',
  CONFIG: 'dairy_dova_config',
  QUALITY_RULES: 'dairy_dova_quality_rules'
};

// Predefined Quality-Based Pricing Rules Matrix
const DEFAULT_QUALITY_RULES = [
  {
    grade: "GRADE A+",
    label: "Elite Pure / Premium",
    purityMin: 95.0,
    multiplier: 1.12,
    bonusPct: "+12% Premium",
    description: "Highest compositional density, 0% dilution, and pristine freshness. Receives top market premium.",
    badgeClass: "badge-success",
    color: "#10b981"
  },
  {
    grade: "GRADE A",
    label: "Standard Pure Compliant",
    purityMin: 85.0,
    multiplier: 1.00,
    bonusPct: "Standard 100%",
    description: "Fully compliant with FSSAI standards. Standard cooperative base rate.",
    badgeClass: "badge-primary",
    color: "#0ea5e9"
  },
  {
    grade: "GRADE B",
    label: "Marginal / Borderline",
    purityMin: 70.0,
    multiplier: 0.90,
    bonusPct: "-10% Deduction",
    description: "Minor compositional deficit or slight dilution (1–5%). Notice sent for herd feed improvement.",
    badgeClass: "badge-warning",
    color: "#f59e0b"
  },
  {
    grade: "GRADE C",
    label: "Substandard / Water Diluted",
    purityMin: 50.0,
    multiplier: 0.75,
    bonusPct: "-25% Deduction",
    description: "High dilution or substandard solids. Substantial rate deduction applied.",
    badgeClass: "badge-warning",
    color: "#f97316"
  },
  {
    grade: "GRADE F",
    label: "Adulterated / Rejected Hazard",
    purityMin: 0.0,
    multiplier: 0.00,
    bonusPct: "₹0.00 (Confiscated)",
    description: "Chemical contamination (Urea, Soda, Starch, or Detergent). Confiscation & disciplinary alert.",
    badgeClass: "badge-danger",
    color: "#ef4444"
  }
];

// Cooperative Pricing Standards Configuration
const DEFAULT_CONFIG = {
  cow: {
    baseRatePerLitre: 45.0,
    stdFat: 3.5,
    stdSnf: 8.5,
    fatPremiumPerPoint: 3.8,
    snfPremiumPerPoint: 2.5,
    minFat: 3.0,
    minSnf: 8.0
  },
  buffalo: {
    baseRatePerLitre: 56.0,
    stdFat: 6.5,
    stdSnf: 9.0,
    fatPremiumPerPoint: 4.5,
    snfPremiumPerPoint: 3.2,
    minFat: 5.5,
    minSnf: 8.5
  },
  penalties: {
    waterDeductionPercent: 2.5
  }
};

// Initial Seed Farmers
const DEFAULT_FARMERS = [
  {
    id: "DD-1082",
    rfid: "RFID-88192-A2",
    name: "Ramesh Patel",
    phone: "+91 98251 40912",
    village: "Anand, Gujarat",
    cattleType: "Cow",
    breed: "A2 Gir Indigenous",
    memberSince: "2023",
    loyaltyTier: "Gold Tier",
    rating: "Grade A+ Elite",
    bankAccount: "SBI ****4918",
    avatar: "RP"
  },
  {
    id: "DD-2451",
    rfid: "RFID-77102-MB",
    name: "Sunita Devi",
    phone: "+91 94160 82103",
    village: "Karnal, Haryana",
    cattleType: "Buffalo",
    breed: "Murrah High-Yield",
    memberSince: "2022",
    loyaltyTier: "Gold Tier",
    rating: "Grade A+ Elite",
    bankAccount: "PNB ****7721",
    avatar: "SD"
  },
  {
    id: "DD-3190",
    rfid: "RFID-33491-SW",
    name: "Suresh Yadav",
    phone: "+91 97182 33491",
    village: "Etawah, UP",
    cattleType: "Cow",
    breed: "Sahiwal Dairy",
    memberSince: "2024",
    loyaltyTier: "Silver Tier",
    rating: "Grade B Marginal",
    bankAccount: "BOB ****1092",
    avatar: "SY"
  },
  {
    id: "DD-4822",
    rfid: "RFID-99341-JF",
    name: "Vikram Singh",
    phone: "+91 98870 91456",
    village: "Jaipur, Rajasthan",
    cattleType: "Buffalo",
    breed: "Jaffarabadi",
    memberSince: "2021",
    loyaltyTier: "Gold Tier",
    rating: "Grade A Compliant",
    bankAccount: "HDFC ****9934",
    avatar: "VS"
  }
];

// Seed Historical Collection Records
const DEFAULT_RECORDS = [
  {
    id: "REC-9014",
    batchId: "BATCH-DD-2026-9014",
    farmerId: "DD-1082",
    farmerName: "Ramesh Patel",
    timestamp: "2026-09-04 07:15 AM",
    date: "2026-09-04",
    shift: "Morning",
    milkType: "Cow",
    volume: 25.4,
    fat: 4.2,
    snf: 8.75,
    density: 1.030,
    protein: 3.40,
    lactose: 4.70,
    waterAdded: 0.0,
    pH: 6.68,
    temperature: 6.8,
    purityScore: 92.0,
    grade: "GRADE A+",
    adulterantsDetected: [],
    status: "APPROVED",
    ratePerLitre: 49.00,
    totalPayout: 1244.60
  },
  {
    id: "REC-9013",
    batchId: "BATCH-DD-2026-9013",
    farmerId: "DD-2451",
    farmerName: "Sunita Devi",
    timestamp: "2026-09-04 06:45 AM",
    date: "2026-09-04",
    shift: "Morning",
    milkType: "Buffalo",
    volume: 52.0,
    fat: 7.8,
    snf: 9.35,
    density: 1.032,
    protein: 4.10,
    lactose: 5.15,
    waterAdded: 0.0,
    pH: 6.62,
    temperature: 19.5,
    purityScore: 100.0,
    grade: "GRADE A+",
    adulterantsDetected: [],
    status: "APPROVED",
    ratePerLitre: 70.52,
    totalPayout: 3667.04
  },
  {
    id: "REC-9012",
    batchId: "BATCH-DD-2026-9012",
    farmerId: "DD-3190",
    farmerName: "Suresh Yadav",
    timestamp: "2026-09-03 06:30 PM",
    date: "2026-09-03",
    shift: "Evening",
    milkType: "Cow",
    volume: 24.0,
    fat: 2.8,
    snf: 7.60,
    density: 1.022,
    protein: 2.30,
    lactose: 3.50,
    waterAdded: 16.5,
    pH: 6.72,
    temperature: 22.1,
    purityScore: 68.2,
    grade: "GRADE C",
    adulterantsDetected: ["Water Dilution (+16.5%)"],
    status: "PENALIZED",
    ratePerLitre: 24.30,
    totalPayout: 583.20
  },
  {
    id: "REC-9011",
    batchId: "BATCH-DD-2026-9011",
    farmerId: "DD-4822",
    farmerName: "Vikram Singh",
    timestamp: "2026-09-03 05:55 PM",
    date: "2026-09-03",
    shift: "Evening",
    milkType: "Buffalo",
    volume: 45.0,
    fat: 7.2,
    snf: 9.10,
    density: 1.031,
    protein: 3.95,
    lactose: 5.02,
    waterAdded: 0.0,
    pH: 6.65,
    temperature: 17.8,
    purityScore: 98.6,
    grade: "GRADE A+",
    adulterantsDetected: [],
    status: "APPROVED",
    ratePerLitre: 66.60,
    totalPayout: 2997.00
  },
  {
    id: "REC-9010",
    batchId: "BATCH-DD-2026-9010",
    farmerId: "DD-1082",
    farmerName: "Ramesh Patel",
    timestamp: "2026-09-03 07:05 AM",
    date: "2026-09-03",
    shift: "Morning",
    milkType: "Cow",
    volume: 23.8,
    fat: 4.0,
    snf: 8.65,
    density: 1.029,
    protein: 3.35,
    lactose: 4.65,
    waterAdded: 0.0,
    pH: 6.67,
    temperature: 7.2,
    purityScore: 88.0,
    grade: "GRADE A",
    adulterantsDetected: [],
    status: "APPROVED",
    ratePerLitre: 47.00,
    totalPayout: 1118.60
  },
  {
    id: "REC-9009",
    batchId: "BATCH-DD-2026-9009",
    farmerId: "DD-3190",
    farmerName: "Suresh Yadav",
    timestamp: "2026-09-02 06:10 AM",
    date: "2026-09-02",
    shift: "Morning",
    milkType: "Cow",
    volume: 20.0,
    fat: 2.1,
    snf: 6.90,
    density: 1.018,
    protein: 1.80,
    lactose: 2.90,
    waterAdded: 28.0,
    pH: 7.60,
    temperature: 24.5,
    purityScore: 24.0,
    grade: "GRADE F",
    adulterantsDetected: ["Severe Dilution (28%)", "Neutralizer/Soda Detected"],
    status: "REJECTED",
    ratePerLitre: 0.0,
    totalPayout: 0.0
  },
  {
    id: "REC-9008",
    batchId: "BATCH-DD-2026-9008",
    farmerId: "DD-1082",
    farmerName: "Ramesh Patel",
    timestamp: "2026-09-02 07:20 AM",
    date: "2026-09-02",
    shift: "Morning",
    milkType: "Cow",
    volume: 26.1,
    fat: 4.3,
    snf: 8.80,
    density: 1.031,
    protein: 3.45,
    lactose: 4.75,
    waterAdded: 0.0,
    pH: 6.66,
    temperature: 6.5,
    purityScore: 94.0,
    grade: "GRADE A+",
    adulterantsDetected: [],
    status: "APPROVED",
    ratePerLitre: 50.00,
    totalPayout: 1305.00
  }
];

class DatabaseManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.FARMERS)) {
      localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(DEFAULT_FARMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUALITY_RULES)) {
      localStorage.setItem(STORAGE_KEYS.QUALITY_RULES, JSON.stringify(DEFAULT_QUALITY_RULES));
    }
  }

  getFarmers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FARMERS)) || DEFAULT_FARMERS;
    } catch (e) {
      return DEFAULT_FARMERS;
    }
  }

  getFarmerById(id) {
    const farmers = this.getFarmers();
    return farmers.find(f => f.id === id || f.rfid === id) || farmers[0];
  }

  // Add New Farmer to Database
  addFarmer(newFarmer) {
    const farmers = this.getFarmers();
    
    // Auto-generate avatar initials if missing
    if (!newFarmer.avatar && newFarmer.name) {
      const parts = newFarmer.name.trim().split(' ');
      newFarmer.avatar = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    }

    // Auto-generate ID & RFID if missing
    if (!newFarmer.id) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      newFarmer.id = `DD-${randomNum}`;
    }
    if (!newFarmer.rfid) {
      const randomHex = Math.floor(10000 + Math.random() * 90000);
      newFarmer.rfid = `RFID-${randomHex}-${newFarmer.name.substring(0, 2).toUpperCase()}`;
    }
    if (!newFarmer.memberSince) {
      newFarmer.memberSince = new Date().getFullYear().toString();
    }
    if (!newFarmer.loyaltyTier) {
      newFarmer.loyaltyTier = "Standard Tier";
    }
    if (!newFarmer.rating) {
      newFarmer.rating = "Grade A Registered";
    }

    farmers.push(newFarmer);
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
    return newFarmer;
  }

  // Delete Farmer
  deleteFarmer(id) {
    let farmers = this.getFarmers();
    farmers = farmers.filter(f => f.id !== id && f.rfid !== id);
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  }

  getQualityRules() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUALITY_RULES)) || DEFAULT_QUALITY_RULES;
    } catch (e) {
      return DEFAULT_QUALITY_RULES;
    }
  }

  getRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || DEFAULT_RECORDS;
    } catch (e) {
      return DEFAULT_RECORDS;
    }
  }

  getRecordsByFarmer(farmerId, filterGrade = null) {
    const records = this.getRecords();
    return records.filter(r => {
      const matchFarmer = r.farmerId === farmerId;
      if (!matchFarmer) return false;
      if (filterGrade && filterGrade !== 'ALL') {
        return r.grade === filterGrade;
      }
      return true;
    });
  }

  saveRecord(record) {
    const records = this.getRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return record;
  }

  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }

  updateConfig(newConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
  }

  getBatchDetails(batchOrRecId) {
    const records = this.getRecords();
    const cleanId = batchOrRecId.trim().toUpperCase();
    return records.find(r => 
      (r.batchId && r.batchId.toUpperCase() === cleanId) || 
      (r.id && r.id.toUpperCase() === cleanId) ||
      cleanId.includes(r.id.toUpperCase())
    ) || null;
  }

  exportCSV() {
    const records = this.getRecords();
    const headers = [
      "Record ID", "Batch ID", "Farmer ID", "Farmer Name", "Timestamp", 
      "Shift", "Type", "Volume (L)", "Fat (%)", "SNF (%)", 
      "Density (g/ml)", "Water Added (%)", "pH", "Purity Score", "Quality Grade", "Status", "Rate (INR)", "Payout (INR)"
    ];
    
    const rows = records.map(r => [
      r.id, r.batchId || '', r.farmerId, `"${r.farmerName}"`, `"${r.timestamp}"`,
      r.shift, r.milkType, r.volume, r.fat, r.snf,
      r.density, r.waterAdded, r.pH, r.purityScore, `"${r.grade || 'GRADE A'}"`, r.status, r.ratePerLitre, r.totalPayout
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DairyDova_Quality_Passbook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(DEFAULT_FARMERS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_RECORDS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    localStorage.setItem(STORAGE_KEYS.QUALITY_RULES, JSON.stringify(DEFAULT_QUALITY_RULES));
  }
}

window.db = new DatabaseManager();
