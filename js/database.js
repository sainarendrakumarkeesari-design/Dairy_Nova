/**
 * DAIRY NOVA - Cloud Database & LocalStorage Persistence Ledger
 * Enhanced with Predefined Quality-Based Pricing Rules, Farmer Registration & Management
 */

// Seamless bi-directional synchronization between dairy_nova and dairy_dova keys
['farmers', 'records', 'config', 'quality_rules'].forEach(k => {
  try {
    const dovaVal = localStorage.getItem('dairy_dova_' + k);
    const novaVal = localStorage.getItem('dairy_nova_' + k);
    if (dovaVal && !novaVal) {
      localStorage.setItem('dairy_nova_' + k, dovaVal);
    } else if (novaVal && !dovaVal) {
      localStorage.setItem('dairy_dova_' + k, novaVal);
    }
  } catch (e) {}
});

const STORAGE_KEYS = {
  FARMERS: 'dairy_nova_farmers',
  RECORDS: 'dairy_nova_records',
  CONFIG: 'dairy_nova_config',
  QUALITY_RULES: 'dairy_nova_quality_rules'
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

// Cooperative Pricing Standards Configuration & SIH 2026 Regression Weights
const DEFAULT_CONFIG = {
  cow: {
    baseRatePerLitre: 32.0, // R_Base
    w1_fat: 3.20,           // w1: Fat regression coefficient (₹ / Fat%)
    w2_snf: 2.40,           // w2: SNF regression coefficient (₹ / SNF%)
    stdFat: 3.5,
    stdSnf: 8.5,
    fatPremiumPerPoint: 3.8,
    snfPremiumPerPoint: 2.5,
    minFat: 3.2,            // FSSAI standard (min 3.2% Fat)
    minSnf: 8.3             // FSSAI standard (min 8.3% SNF)
  },
  buffalo: {
    baseRatePerLitre: 40.0, // R_Base
    w1_fat: 3.80,           // w1: Fat regression coefficient
    w2_snf: 2.80,           // w2: SNF regression coefficient
    stdFat: 6.5,
    stdSnf: 9.0,
    fatPremiumPerPoint: 4.5,
    snfPremiumPerPoint: 3.2,
    minFat: 6.0,            // FSSAI standard (min 6.0% Fat)
    minSnf: 9.0             // FSSAI standard (min 9.0% SNF)
  },
  fssai: {
    phMin: 6.50,
    phMax: 6.75,
    conductivityMin: 4.0,   // mS/cm at 25°C
    conductivityMax: 5.5,   // mS/cm at 25°C
    cowMinFat: 3.2,
    cowMinSnf: 8.3,
    buffaloMinFat: 6.0,
    buffaloMinSnf: 9.0
  },
  penalties: {
    waterDeductionPercent: 2.5,
    deltaMax: 1.0
  }
};

// Initial Seed Farmers (SIH 2026 Smart Milk System)
const DEFAULT_FARMERS = [
  {
    id: "DD-1082",
    rfid: "RFID-88192-A2",
    name: "Ramesh Patel",
    phone: "+91 98251 40912",
    upiId: "9825140912@upi",
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
    upiId: "9416082103@paytm",
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
    upiId: "9718233491@okaxis",
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

// Initial Records (empty by default)
const DEFAULT_RECORDS = [];

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

  clearRecords() {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
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
    link.setAttribute('download', `DairyNova_Quality_Passbook_${new Date().toISOString().split('T')[0]}.csv`);
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
