/**
 * DAIRY NOVA - Main Application Coordinator
 * Enhanced with Interactive RFID Scanner, Farmer Registration Modal, 2-Step Milk Quality Flow, and Mobile Simulator
 */

class DairyNovaApp {
  constructor() {
    this.currentSection = 'overview';
    this.activeFarmer = null;
    this.theme = 'dark';
    this.activeGradeFilter = 'ALL';
    this.isMobileView = false;
    this.rfidScanned = true;
    this.activeFatModel = 'PLS';
    this.isAdminAuthenticated = false;
  }

  init() {
    const farmers = window.db.getFarmers();
    this.activeFarmer = farmers[0];

    this.populateFarmerSelectors();
    this.renderRfidCardsDeck();
    this.renderOverviewRfidDeck();
    this.setupNavigation();
    this.setupRfidScanner();
    this.setupOverviewRfidScanner();
    this.setupFarmerRegistration();
    this.setupSensorControls();
    this.setupActionButtons();
    this.setupQualityRulesView();

    this.updateLiveSensorUI();
    this.refreshPassbook();
    this.refreshAdminDashboard();
    this.updateDeviceStatusUI(sessionStorage.getItem('dairy_nova_hardware_connected') === 'true');
    this.initViewMode();

    const staleFooter = document.querySelector('.app-footer');
    if (staleFooter) staleFooter.remove();

    document.addEventListener('click', () => {
      if (window.soundCtrl) window.soundCtrl.init();
    }, { once: true });

    console.log("DAIRY NOVA initialized successfully with Farmer Registration & RFID Engine.");
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.section;
        if (target) {
          this.switchSection(target);
          if (window.soundCtrl) window.soundCtrl.playTick();
        }
      });
    });

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    const heritageBtn = document.getElementById('heritage-theme-switch-btn');
    if (heritageBtn) {
      heritageBtn.addEventListener('click', () => this.toggleHeritageWallpaper());
    }

    // Restore saved heritage wallpaper
    const savedWallpaper = localStorage.getItem('dairy_heritage_wallpaper');
    if (savedWallpaper === 'pasture') {
      document.body.classList.add('theme-heritage-pasture');
      this.updateHeritageBtnLabel(true);
    }

    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = window.soundCtrl.toggleSound();
        soundBtn.innerHTML = enabled ? `
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
        ` : `
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
        `;
        this.showToast(enabled ? "Audio Synthesizer: ON" : "Audio Synthesizer: MUTED", "info");
      });
    }
  }

  switchSection(sectionId) {
    if (sectionId === 'admin') {
      window.location.href = window.location.protocol === 'file:' ? 'admin.html' : '/admin';
      return;
    }

    this.currentSection = sectionId;

    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.section === sectionId);
    });

    document.querySelectorAll('.app-section').forEach(sec => {
      sec.classList.toggle('active-section', sec.id === `section-${sectionId}`);
    });

    if (sectionId === 'passbook') {
      this.refreshPassbook();
      this.renderMobilePassbookPreview();
    } else if (sectionId === 'pricing') {
      this.refreshPricingPreview();
    } else if (sectionId === 'quality-rules') {
      this.setupQualityRulesView();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = this.theme === 'dark' ? `
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      ` : `
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
      `;
    }
  }

  toggleHeritageWallpaper() {
    const isPasture = document.body.classList.toggle('theme-heritage-pasture');
    localStorage.setItem('dairy_heritage_wallpaper', isPasture ? 'pasture' : 'desi');
    this.updateHeritageBtnLabel(isPasture);
    this.showToast(isPasture ? "Heritage Scenery: Golden Pasture Meadow" : "Heritage Scenery: Desi Gir Dairy Farm", "info");
    if (window.soundCtrl) window.soundCtrl.playTick();
  }

  updateHeritageBtnLabel(isPasture) {
    const label = document.getElementById('heritage-scene-text');
    if (label) {
      label.textContent = isPasture ? 'Pasture Meadow' : 'Desi Gir Farm';
    }
  }

  // --- App vs Web Display Mode Logic ---
  initViewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');

    let activeMode = 'web';
    if (modeParam === 'app') {
      activeMode = 'app';
    } else if (modeParam === 'web') {
      activeMode = 'web';
    } else if (window.DairyAndroid && typeof window.DairyAndroid.isNativeApp === 'function') {
      activeMode = 'app';
    } else if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      activeMode = 'app';
    } else if (window.navigator.standalone === true) {
      activeMode = 'app';
    } else {
      const savedMode = localStorage.getItem('dairy_view_mode');
      if (savedMode) activeMode = savedMode;
    }

    this.applyViewMode(activeMode);
  }

  toggleViewMode() {
    const nextMode = this.viewMode === 'app' ? 'web' : 'app';
    localStorage.setItem('dairy_view_mode', nextMode);
    this.applyViewMode(nextMode);
    this.showToast(nextMode === 'app' ? '📱 Switched to App Mode: Farmer Sign In & Admin Login only' : '🌐 Switched to Web Mode: Full Ecosystem (Sign In/Up, Admin & Start Milk Test)', 'info');
    if (window.soundCtrl) window.soundCtrl.playTick();
  }

  applyViewMode(mode) {
    this.viewMode = mode;
    const isApp = (mode === 'app');
    document.body.classList.toggle('mode-app', isApp);
    document.body.classList.toggle('mode-web', !isApp);

    const modeBtnText = document.getElementById('mode-toggle-text');
    const modeBtnIcon = document.getElementById('mode-toggle-icon');
    const badgeText = document.getElementById('overview-badge-text');
    const portalTitle = document.getElementById('overview-portal-title');
    const portalSub = document.getElementById('overview-portal-sub');

    const farmerTitle = document.getElementById('farmer-card-title');
    const farmerDesc = document.getElementById('farmer-card-desc');
    const farmerBtnText = document.getElementById('farmer-card-btn-text');
    const farmerPill = document.getElementById('farmer-card-pill');

    const testCard = document.getElementById('card-start-milk-test');
    const rfidSection = document.getElementById('overview-rfid-section');

    if (isApp) {
      // APP MODE: Farmer Sign In and Admin Login ONLY
      if (modeBtnIcon) modeBtnIcon.textContent = '📱';
      if (modeBtnText) modeBtnText.textContent = 'App Mode';
      if (badgeText) badgeText.textContent = 'DAIRY NOVA • MOBILE APP';
      if (portalTitle) portalTitle.innerHTML = 'SMART MILK <span class="gradient-text">MOBILE PORTAL</span>';
      if (portalSub) portalSub.textContent = 'Welcome to the Dairy Nova Mobile Application. Sign in to access your producer passbook or cooperative administration.';

      if (farmerTitle) farmerTitle.textContent = 'Farmer Sign In';
      if (farmerDesc) farmerDesc.textContent = 'Sign in with your registered phone number or RFID card to view your milk passbook, daily collections, purity bonuses, and bank payouts.';
      if (farmerBtnText) farmerBtnText.textContent = 'Farmer Sign In';
      if (farmerPill) farmerPill.textContent = 'PRODUCER SIGN IN';

      if (testCard) testCard.style.display = 'none';
      if (rfidSection) rfidSection.style.display = 'none';
    } else {
      // WEB SITE MODE: Farmer Sign In & Sign Up + Admin Login + Start Milk Test
      if (modeBtnIcon) modeBtnIcon.textContent = '🌐';
      if (modeBtnText) modeBtnText.textContent = 'Web Mode';
      if (badgeText) badgeText.textContent = 'DAIRY NOVA SMART MILK QUALITY TESTING';
      if (portalTitle) portalTitle.innerHTML = 'SMART MILK <span class="gradient-text">QUALITY SYSTEM</span>';
      if (portalSub) portalSub.textContent = 'Welcome to the centralized dairy portal. Access farmer records, cooperative admin management, automated optical milk quality testing, and new producer onboarding.';

      if (farmerTitle) farmerTitle.textContent = 'Farmer Sign In & Sign Up';
      if (farmerDesc) farmerDesc.textContent = 'Sign in to view milk passbook, purity certificates & payouts, or register as a new producer to receive a smart RFID card.';
      if (farmerBtnText) farmerBtnText.textContent = 'Sign In / Sign Up';
      if (farmerPill) farmerPill.textContent = 'PRODUCER PORTAL';

      if (testCard) testCard.style.display = 'flex';
      if (rfidSection) rfidSection.style.display = 'block';
    }
  }

  handleFarmerCardClick() {
    if (this.viewMode === 'app') {
      window.location.href = 'farmer-auth.html?mode=signin';
    } else {
      window.location.href = 'farmer-auth.html';
    }
  }

  // Render RFID Cards Deck dynamically
  renderRfidCardsDeck() {
    const container = document.getElementById('rfid-cards-deck-container');
    if (!container) return;

    const farmers = window.db.getFarmers();
    container.innerHTML = farmers.map(f => `
      <button class="rfid-card-item ${this.activeFarmer && this.activeFarmer.id === f.id ? 'active' : ''}" data-farmer-id="${f.id}">
        <span style="font-size: 1.1rem;">💳</span>
        <div>
          <strong style="display:block; font-size: 0.85rem;">${f.name}</strong>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${f.rfid} &bull; ${f.cattleType}</span>
        </div>
      </button>
    `).join('');

    // Re-attach click listeners
    container.querySelectorAll('.rfid-card-item').forEach(item => {
      item.addEventListener('click', () => {
        this.scanFarmerRFID(item.dataset.farmerId);
      });
    });
  }

  // Interactive RFID Scanner Setup
  setupRfidScanner() {
    const pad = document.getElementById('rfid-touch-pad');
    if (pad) {
      pad.addEventListener('click', () => {
        const farmers = window.db.getFarmers();
        const currentIdx = farmers.findIndex(f => f.id === this.activeFarmer.id);
        const nextFarmer = farmers[(currentIdx + 1) % farmers.length];
        this.scanFarmerRFID(nextFarmer.id);
      });
    }
  }

  scanFarmerRFID(farmerId) {
    const farmer = window.db.getFarmerById(farmerId);
    if (!farmer) return;

    this.activeFarmer = farmer;
    this.rfidScanned = true;

    if (window.soundCtrl) window.soundCtrl.playRfidBeep();

    const led = document.getElementById('rfid-scanner-led');
    if (led) {
      led.className = 'rfid-status-led';
      led.style.background = '#10b981';
      led.style.boxShadow = '0 0 16px #10b981';
    }

    document.querySelectorAll('.rfid-card-item').forEach(c => {
      c.classList.toggle('active', c.dataset.farmerId === farmer.id);
    });

    const sel1 = document.getElementById('intake-farmer-select');
    if (sel1) sel1.value = farmer.id;
    const sel2 = document.getElementById('passbook-farmer-select');
    if (sel2) sel2.value = farmer.id;

    this.updateActiveFarmerDisplay();
    this.showToast(`📡 RFID BEEP! Farmer Identified: ${farmer.name} (${farmer.rfid})`, "success");

    this.updateLiveSensorUI();
    this.refreshPassbook();
    this.renderMobilePassbookPreview();
    this.renderOverviewRfidDeck();
  }

  // Render Overview Page Interactive RFID Cards Deck
  renderOverviewRfidDeck() {
    const container = document.getElementById('overview-rfid-deck-container');
    if (!container) return;

    const farmers = window.db.getFarmers();
    const countBadge = document.getElementById('overview-rfid-count-badge');
    if (countBadge) countBadge.innerText = `${farmers.length} Cards Active`;

    container.innerHTML = farmers.map(f => `
      <div class="overview-rfid-chip ${this.activeFarmer && this.activeFarmer.id === f.id ? 'active' : ''}" onclick="const inp = document.getElementById('overview-rfid-input'); if(inp) inp.value = '${f.rfid}'; window.app.enterManualRFID('${f.rfid}')" title="Click to view Farmer Details for ${f.name} (${f.rfid})">
        <div class="rfid-chip-icon">${f.cattleType === 'Buffalo' ? '🐃' : '🐄'}</div>
        <div class="rfid-chip-info">
          <strong class="rfid-chip-name">${f.name}</strong>
          <span class="rfid-chip-uid">${f.rfid} &bull; ${f.village}</span>
        </div>
        <span class="rfid-chip-arrow" style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;">Details &rarr;</span>
      </div>
    `).join('');
  }

  // Setup Overview Interactive RFID Scanner
  setupOverviewRfidScanner() {
    const pad = document.getElementById('overview-rfid-touch-pad');
    if (pad) {
      pad.addEventListener('click', () => {
        this.scanRandomOrNextFarmerRFID();
      });
    }

    const input = document.getElementById('overview-rfid-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.scanInputRFID(input.value);
        }
      });
    }
  }

  scanRandomOrNextFarmerRFID() {
    const farmers = window.db.getFarmers();
    const currentIdx = farmers.findIndex(f => f.id === (this.activeFarmer ? this.activeFarmer.id : ''));
    const nextFarmer = farmers[(currentIdx + 1) % farmers.length];
    this.scanAndStartMilkTestFlow(nextFarmer.id);
  }

  scanInputRFID(value) {
    if (!value || !value.trim()) {
      this.scanRandomOrNextFarmerRFID();
      return;
    }
    const q = value.trim().toLowerCase();
    const farmers = window.db.getFarmers();
    const match = farmers.find(f =>
      (f.rfid && f.rfid.toLowerCase() === q) ||
      (f.id && f.id.toLowerCase() === q) ||
      (f.name && f.name.toLowerCase().includes(q))
    );
    if (match) {
      this.scanAndStartMilkTestFlow(match.id);
    } else {
      this.showToast(`⚠️ RFID Card "${value}" not found in registered database`, 'danger');
      if (window.soundCtrl) window.soundCtrl.playWarning();
    }
  }

  // 1. Scan RFID: First it goes to Milk Test
  scanAndStartMilkTestFlow(farmerIdOrRfid) {
    let farmer = window.db.getFarmerById(farmerIdOrRfid);
    if (!farmer) {
      const farmers = window.db.getFarmers();
      const q = (farmerIdOrRfid || '').toString().toLowerCase().trim();
      farmer = farmers.find(f =>
        (f.rfid && f.rfid.toLowerCase() === q) ||
        (f.id && f.id.toLowerCase() === q) ||
        (f.name && f.name.toLowerCase().includes(q))
      );
    }
    if (!farmer) {
      const farmers = window.db.getFarmers();
      farmer = this.activeFarmer || farmers[0];
    }

    // Authenticate farmer & mark RFID scanned
    this.activeFarmer = farmer;
    this.rfidScanned = true;

    // Glowing LED feedback on both Overview and Intake station
    const overviewLed = document.getElementById('overview-rfid-led');
    if (overviewLed) {
      overviewLed.className = 'rfid-status-led';
      overviewLed.style.background = '#10b981';
      overviewLed.style.boxShadow = '0 0 20px #10b981';
    }
    const intakeLed = document.getElementById('rfid-scanner-led');
    if (intakeLed) {
      intakeLed.className = 'rfid-status-led';
      intakeLed.style.background = '#10b981';
      intakeLed.style.boxShadow = '0 0 16px #10b981';
    }

    // Play crisp RFID audio beep
    if (window.soundCtrl) window.soundCtrl.playRfidBeep();

    // Sync select dropdowns
    const sel1 = document.getElementById('intake-farmer-select');
    if (sel1) sel1.value = farmer.id;
    const sel2 = document.getElementById('passbook-farmer-select');
    if (sel2) sel2.value = farmer.id;

    // Update active farmer UI
    this.updateActiveFarmerDisplay();
    this.updateLiveSensorUI();
    this.renderOverviewRfidDeck();

    this.showToast(`📡 RFID Verified: ${farmer.name} (${farmer.rfid}). Opening Milk Test Station...`, 'success');

    // 1. First it goes to Milk Test
    this.switchSection('testing-station');

    // Update RFID Active Session Card in Testing Station
    const banner = document.getElementById('rfid-session-banner');
    if (banner) {
      banner.style.display = 'block';
      const nameEl = document.getElementById('rfid-session-farmer-name');
      if (nameEl) nameEl.innerText = farmer.name;
      const uidEl = document.getElementById('rfid-session-uid');
      if (uidEl) uidEl.innerText = farmer.rfid;
      const villageEl = document.getElementById('rfid-session-village');
      if (villageEl) villageEl.innerText = `${farmer.village} • ${farmer.cattleType}`;
      const avatarEl = document.getElementById('rfid-session-avatar');
      if (avatarEl) avatarEl.innerText = farmer.cattleType === 'Buffalo' ? '🐃' : '🐄';
    }

    // Automatically trigger Milk Quality Test & Volume Calculation
    setTimeout(() => {
      this.runLiveIntakeScan({ autoRedirectToPassbook: true });
    }, 480);
  }

  // Alias for backward compatibility
  scanAndGoToFarmerDetails(farmerIdOrRfid) {
    this.scanAndStartMilkTestFlow(farmerIdOrRfid);
  }

  // Proceed directly to Farmer Details from Volume Calculation Modal
  proceedToFarmerDetailsFromModal() {
    if (this.calcRedirectTimer) {
      clearInterval(this.calcRedirectTimer);
      this.calcRedirectTimer = null;
    }
    const modal = document.getElementById('modal-volume-calculation');
    if (modal) modal.classList.remove('modal-open');

    // Go to Farmer Details (Passbook)
    this.switchSection('passbook');

    const welcomeCard = document.getElementById('farmer-welcome-card');
    if (welcomeCard) {
      welcomeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      welcomeCard.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.5)';
      setTimeout(() => { welcomeCard.style.boxShadow = ''; }, 2500);
    }

    // Highlight newest intake record in table
    setTimeout(() => {
      const firstRow = document.querySelector('#passbook-table-body tr');
      if (firstRow) {
        firstRow.style.background = 'rgba(16, 185, 129, 0.25)';
        firstRow.style.transition = 'background 2.5s ease';
        setTimeout(() => { firstRow.style.background = ''; }, 2500);
      }
    }, 350);
  }

  // Registration & Onboarding for Farmers (Unified in Farmer Portal)
  setupFarmerRegistration() {
    const openBtns = [
      document.getElementById('btn-open-register-modal'),
      document.getElementById('btn-open-register-modal-passbook'),
      document.getElementById('btn-open-register-modal-intake'),
      document.getElementById('btn-open-register-modal-admin')
    ];
    const form = document.getElementById('form-register-farmer');

    openBtns.forEach(b => {
      if (b) b.addEventListener('click', () => this.openFarmerLoginModal('signup'));
    });

    // Form Submit inside Sign Up Tab
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const farmerId = document.getElementById('reg-farmer-id').value.trim() || `FARM-${Math.floor(1000 + Math.random() * 9000)}`;
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const village = document.getElementById('reg-village').value.trim();
        const district = document.getElementById('reg-district').value.trim();
        const milkType = document.getElementById('reg-milk-type').value;
        const bankAccount = document.getElementById('reg-bank').value.trim();
        const rfid = document.getElementById('reg-rfid').value.trim();

        if (!name) {
          this.showToast("Please enter the farmer's full name", "warning");
          return;
        }

        const cattleType = milkType.includes('Buffalo') ? 'Buffalo' : 'Cow';
        const breed = milkType.includes('Buffalo') ? 'Murrah High-Yield Buffalo' : 'A2 Gir Indigenous Cow';

        const newFarmer = window.db.addFarmer({
          id: farmerId,
          name: name,
          phone: phone || "+91 98000 00000",
          village: district ? `${village}, ${district}` : village,
          district: district || "Cooperative District",
          villageOnly: village || "Rural Dairy",
          milkType: milkType,
          cattleType: cattleType,
          breed: breed,
          bankAccount: bankAccount || "SBI ****1234",
          rfid: rfid,
          loyaltyTier: "Gold Tier Member",
          rating: "Grade A+ Registered"
        });

        this.closeFarmerLoginModal();
        form.reset();

        // Refresh lists & select new farmer
        this.populateFarmerSelectors();
        this.renderRfidCardsDeck();
        this.renderOverviewRfidDeck();
        this.scanFarmerRFID(newFarmer.id);
        this.refreshAdminDashboard();

        if (window.soundCtrl) window.soundCtrl.playSuccessChime();
        this.showToast(`🎉 Registration Complete! Welcome, ${newFarmer.name}. Signed into your passbook.`, "success");
        this.switchSection('passbook');
      });
    }
  }

  openRegisterFarmerModal() {
    window.location.href = 'farmer-auth.html?mode=signup';
  }

  // Farmer Portal Navigation (Redirect to dedicated page)
  openFarmerLoginModal(initialTab = 'signin') {
    window.location.href = initialTab === 'signup' ? 'farmer-auth.html?mode=signup' : 'farmer-auth.html';
  }

  closeFarmerLoginModal() {
    const modal = document.getElementById('modal-farmer-login');
    if (modal) modal.classList.remove('modal-open');
  }

  // Device Connection Controller
  toggleDeviceConnection() {
    if (window.sensorEngine) {
      const isConn = window.sensorEngine.isDeviceConnected();
      if (isConn) {
        window.sensorEngine.disconnectDevice();
        this.updateDeviceStatusUI(false);
        this.showToast('🔴 Raspberry Pi 5 Hub Disconnected (Status: Connecting)', 'info');
        if (window.soundCtrl) window.soundCtrl.playTick();
      } else {
        const text = document.getElementById('index-iot-text');
        const btn = document.getElementById('index-btn-connect-device');
        if (text) text.innerText = 'DEVICE: CONNECTING...';
        if (btn) btn.innerText = '⏳ Connecting...';

        setTimeout(() => {
          window.sensorEngine.connectDevice();
          this.updateDeviceStatusUI(true);
          this.showToast('🟢 Raspberry Pi 5 Hub & ADS1115 Sensors connected successfully!', 'success');
          if (window.soundCtrl) window.soundCtrl.playSuccessChime();
        }, 500);
      }
    }
  }

  updateDeviceStatusUI(connected) {
    const isConn = connected !== undefined ? connected : (window.sensorEngine ? window.sensorEngine.isDeviceConnected() : false);
    const pill = document.getElementById('index-iot-pill');
    const dot = document.getElementById('index-iot-dot');
    const text = document.getElementById('index-iot-text');
    const btn = document.getElementById('index-btn-connect-device');

    if (pill) {
      if (isConn) {
        pill.classList.remove('connecting');
        pill.classList.add('connected');
      } else {
        pill.classList.remove('connected');
        pill.classList.add('connecting');
      }
    }
    if (dot) {
      dot.style.background = isConn ? '#10b981' : '#f59e0b';
      dot.style.boxShadow = isConn ? '0 0 10px #10b981' : '0 0 10px #f59e0b';
      if (isConn) {
        dot.classList.remove('dot-connecting');
        dot.classList.add('dot-connected');
      } else {
        dot.classList.remove('dot-connected');
        dot.classList.add('dot-connecting');
      }
    }
    if (text) {
      text.innerText = isConn ? 'DEVICE: CONNECTED' : 'DEVICE: CONNECTING';
      text.style.color = isConn ? '#10b981' : '#fbbf24';
    }
    if (btn) {
      btn.innerText = isConn ? '⚡ Disconnect Device' : '🔌 Connect Device';
      btn.className = isConn ? 'btn btn-sm btn-outline' : 'btn btn-sm btn-primary';
    }
  }

  switchFarmerModalTab(tab = 'signin') {
    const btnSignin = document.getElementById('tab-btn-farmer-signin');
    const btnSignup = document.getElementById('tab-btn-farmer-signup');
    const panelSignin = document.getElementById('panel-farmer-signin');
    const panelSignup = document.getElementById('panel-farmer-signup');
    const title = document.getElementById('farmer-modal-header-title');
    const sub = document.getElementById('farmer-modal-header-sub');

    if (tab === 'signup') {
      if (btnSignin) btnSignin.classList.remove('active');
      if (btnSignup) btnSignup.classList.add('active');
      if (panelSignin) panelSignin.style.display = 'none';
      if (panelSignup) panelSignup.style.display = 'block';
      if (title) title.textContent = 'New Farmer Sign Up';
      if (sub) sub.textContent = 'Register producer profile & issue smart contactless RFID card';

      // Auto-generate next Farmer ID & RFID
      const farmers = window.db.getFarmers();
      const nextId = 1080 + farmers.length + 1;
      const farmerIdInput = document.getElementById('reg-farmer-id');
      if (farmerIdInput) farmerIdInput.value = `FARM-${nextId}`;

      const randomHex = Math.floor(10000 + Math.random() * 90000);
      const rfidInput = document.getElementById('reg-rfid');
      if (rfidInput) rfidInput.value = `RFID-${randomHex}-DD`;

      const nameInput = document.getElementById('reg-name');
      if (nameInput) {
        nameInput.value = '';
        setTimeout(() => nameInput.focus(), 150);
      }
    } else {
      if (btnSignin) btnSignin.classList.add('active');
      if (btnSignup) btnSignup.classList.remove('active');
      if (panelSignin) panelSignin.style.display = 'block';
      if (panelSignup) panelSignup.style.display = 'none';
      if (title) title.textContent = 'Farmer Portal Login';
      if (sub) sub.textContent = 'Access your digital milk passbook, quality history & bank payouts';
      this.renderFarmerLoginList();
    }
    if (window.soundCtrl) window.soundCtrl.playTick();
  }

  renderFarmerLoginList() {
    const container = document.getElementById('farmer-login-accounts-list');
    if (!container) return;
    const farmers = window.db.getFarmers();
    const currentId = this.activeFarmer ? this.activeFarmer.id : farmers[0].id;

    container.innerHTML = farmers.map(f => `
      <div class="farmer-login-account-card ${f.id === currentId ? 'selected' : ''}" onclick="window.app.selectFarmerForLogin('${f.id}')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="farmer-login-avatar">${f.cattleType === 'Buffalo' ? '🐃' : '🐄'}</div>
          <div>
            <strong style="font-size: 0.95rem; display: block; color: #ffffff;">${f.name}</strong>
            <div style="font-size: 0.76rem; color: var(--text-muted);">
              ${f.village} &bull; ${f.breed} &bull; <span style="font-family: var(--font-mono); color: var(--primary-light);">${f.rfid}</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 4px 10px;">
          ${f.id === currentId ? '● Selected' : 'Select'}
        </button>
      </div>
    `).join('');
  }

  selectFarmerForLogin(farmerId) {
    const farmer = window.db.getFarmerById(farmerId);
    if (farmer) {
      this.scanFarmerRFID(farmer.id);
      this.renderFarmerLoginList();
      if (window.soundCtrl) window.soundCtrl.playTick();
    }
  }

  loginActiveFarmerAndSwitch() {
    this.closeFarmerLoginModal();
    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    if (window.soundCtrl) window.soundCtrl.playSuccessChime();
    this.showToast(`👨‍🌾 Logged in as ${farmer.name}! Welcome to Farmer Portal.`, 'success');
    this.switchSection('passbook');
  }

  // Admin Portal Navigation (Redirect to dedicated page)
  openAdminLoginModal() {
    window.location.href = window.location.protocol === 'file:' ? 'admin.html' : '/admin';
  }

  closeAdminLoginModal() {
    const modal = document.getElementById('modal-admin-login');
    if (modal) modal.classList.remove('modal-open');
    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput) {
      pinInput.value = '';
      pinInput.style.borderColor = '';
      pinInput.style.boxShadow = '';
    }
    const errEl = document.getElementById('admin-login-error');
    if (errEl) errEl.style.display = 'none';
  }

  handleAdminLogin(e) {
    if (e) e.preventDefault();
    const pinInput = document.getElementById('admin-pin-input');
    const errEl = document.getElementById('admin-login-error');
    const errText = document.getElementById('admin-login-error-text');
    const enteredPin = pinInput ? pinInput.value.trim() : '';

    if (!enteredPin) {
      if (window.soundCtrl) window.soundCtrl.playWarning();
      this.showToast('⚠️ Please enter the admin password.', 'warning');
      if (errEl) {
        if (errText) errText.innerText = 'Please enter the admin password.';
        errEl.style.display = 'flex';
      }
      if (pinInput) {
        pinInput.style.borderColor = '#ef4444';
        pinInput.focus();
      }
      return;
    }

    if (enteredPin !== 'NANI@2005') {
      if (window.soundCtrl) window.soundCtrl.playWarning();

      // 1. Show prominent error banner in the modal
      if (errEl) {
        if (errText) errText.innerText = 'Incorrect password! Please try again.';
        errEl.style.display = 'flex';
      }

      // 2. Highlight password field in red
      if (pinInput) {
        pinInput.style.borderColor = '#ef4444';
        pinInput.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.6)';
        pinInput.value = '';
        pinInput.focus();
      }

      // 3. Show error toast notification
      this.showToast('⛔ Incorrect password! Access denied.', 'error');

      // 4. Explicit dialog alert telling the user it is incorrect password
      alert('Incorrect password! Please try again.');
      return;
    }

    // Success - correct password entered
    this.isAdminAuthenticated = true;
    if (pinInput) {
      pinInput.value = '';
      pinInput.style.borderColor = '';
    }
    if (errEl) errEl.style.display = 'none';
    this.closeAdminLoginModal();
    const roleSelect = document.getElementById('admin-role-select');
    const roleName = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : 'Cooperative Manager';
    if (window.soundCtrl) window.soundCtrl.playSuccessChime();
    this.showToast(`🏢 Authenticated as ${roleName}! Accessing Admin Portal.`, 'success');
    this.switchSection('admin');
  }

  adminLogout() {
    this.isAdminAuthenticated = false;
    if (window.soundCtrl) window.soundCtrl.playTick();
    this.showToast('🔒 Admin session logged out successfully.', 'info');
    this.switchSection('overview');
  }

  populateFarmerSelectors() {
    const farmers = window.db.getFarmers();
    const selectors = ['intake-farmer-select', 'passbook-farmer-select'];

    selectors.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = farmers.map(f => `
        <option value="${f.id}">${f.name} (${f.id} &bull; ${f.rfid})</option>
      `).join('');

      el.addEventListener('change', (e) => {
        this.scanFarmerRFID(e.target.value);
      });
    });

    this.updateActiveFarmerDisplay();
  }

  updateActiveFarmerDisplay() {
    if (!this.activeFarmer) return;
    const farmer = this.activeFarmer;

    const showcase = document.getElementById('farmer-showcase-box');
    if (showcase) {
      showcase.className = 'farmer-identity-showcase identified-highlight';
      showcase.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="farmer-big-avatar">${farmer.avatar}</div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-success" style="font-size: 0.72rem; padding: 2px 8px;">RFID VERIFIED</span>
              <span style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--primary-light);">${farmer.rfid}</span>
            </div>
            <h3 style="font-size: 1.4rem; margin: 4px 0 2px; color: #ffffff;">${farmer.name}</h3>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              ${farmer.village} &bull; <strong>${farmer.breed} (${farmer.cattleType})</strong> &bull; Member Since ${farmer.memberSince}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1.5rem; text-align: right;">
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Loyalty Status</div>
            <div style="font-weight: 700; color: #10b981; font-size: 0.95rem; margin-top: 2px;">${farmer.loyaltyTier}</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Bank Account</div>
            <div style="font-weight: 700; font-family: var(--font-mono); font-size: 0.95rem; margin-top: 2px;">${farmer.bankAccount}</div>
          </div>
        </div>
      `;
    }
  }

  setupSensorControls() {
    const inputs = [
      { id: 'slider-volume', key: 'volume', dispId: 'disp-volume' },
      { id: 'slider-fat', key: 'fat', dispId: 'disp-fat' },
      { id: 'slider-snf', key: 'snf', dispId: 'disp-snf' },
      { id: 'slider-water', key: 'waterAdded', dispId: 'disp-water' },
      { id: 'slider-ph', key: 'ph', dispId: 'disp-ph' },
      { id: 'slider-temp', key: 'temperature', dispId: 'disp-temp' }
    ];

    inputs.forEach(item => {
      const el = document.getElementById(item.id);
      const disp = document.getElementById(item.dispId);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (disp) disp.innerText = val.toFixed(item.key === 'ph' ? 2 : 1);
          window.sensorEngine.updateSensor(item.key, val);
          this.updateLiveSensorUI();
        });
      }
    });

    document.querySelectorAll('.preset-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.dataset.preset;
        if (presetKey) {
          document.querySelectorAll('.preset-card-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          window.sensorEngine.loadPreset(presetKey);
          this.syncSlidersFromState();
          this.updateLiveSensorUI();
          if (window.soundCtrl) window.soundCtrl.playSonarPing();
          this.showToast(`Loaded Sample: ${window.sensorEngine.presets[presetKey].name}`, "info");
        }
      });
    });
  }

  syncSlidersFromState() {
    const s = window.sensorEngine.state;
    const setVal = (id, val, dispId) => {
      const el = document.getElementById(id);
      const disp = document.getElementById(dispId);
      if (el) el.value = val;
      if (disp) disp.innerText = parseFloat(val).toFixed(id.includes('ph') ? 2 : 1);
    };

    setVal('slider-volume', s.volume, 'disp-volume');
    setVal('slider-fat', s.fat, 'disp-fat');
    setVal('slider-snf', s.snf, 'disp-snf');
    setVal('slider-water', s.waterAdded, 'disp-water');
    setVal('slider-ph', s.ph, 'disp-ph');
    setVal('slider-temp', s.temperature, 'disp-temp');
  }

  updateLiveSensorUI() {
    const s = window.sensorEngine.state;
    const classification = s.classification || window.sensorEngine.classifySample(s);
    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    const pricing = window.pricingEngine.calculatePricing(s, farmer);

    const tankFluid = document.getElementById('tank-milk-fluid');
    const tankVolText = document.getElementById('tank-volume-disp');
    if (tankFluid) {
      const heightPercent = Math.min(92, Math.max(12, (s.volume / 80) * 85));
      tankFluid.style.height = `${heightPercent}%`;
      if (classification.code === "GRADE F") {
        tankFluid.style.background = 'linear-gradient(180deg, #fef08a 0%, #cbd5e1 100%)';
      } else {
        tankFluid.style.background = 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%)';
      }
    }
    if (tankVolText) {
      tankVolText.innerHTML = `${s.volume.toFixed(1)}<span>L</span>`;
    }

    // Hardware Terminal Card (MILK QUALITY TEST)
    const terminalFarmerId = document.getElementById('test-box-farmer-id');
    const terminalMass = document.getElementById('test-box-mass');
    const terminalQty = document.getElementById('test-box-quantity');
    const terminalDensity = document.getElementById('test-box-density');
    const terminalTemp = document.getElementById('test-box-temperature');
    if (terminalFarmerId) terminalFarmerId.innerText = farmer && farmer.id ? farmer.id : 'FMR-2026-00125';
    if (terminalMass) terminalMass.innerText = `${(s.netWeightKg || (s.volume * s.density)).toFixed(2)} kg`;
    if (terminalQty) terminalQty.innerText = `${s.volume.toFixed(1)} L`;
    if (terminalDensity) terminalDensity.innerText = `${s.density.toFixed(3)} kg/L`;
    if (terminalTemp) terminalTemp.innerText = `${s.temperature.toFixed(1)} °C`;

    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('telemetry-fat', s.fat.toFixed(2));
    setInner('telemetry-snf', s.snf.toFixed(2));
    setInner('telemetry-water', s.waterAdded.toFixed(1));
    setInner('telemetry-ph', s.ph.toFixed(2));
    setInner('telemetry-density', s.density.toFixed(3));
    setInner('telemetry-protein', s.protein.toFixed(2));
    setInner('telemetry-lactose', s.lactose.toFixed(2));
    setInner('telemetry-temp', s.temperature.toFixed(1));
    setInner('telemetry-purity', `${s.purityScore.toFixed(1)}%`);

    const purityEl = document.getElementById('telemetry-purity');
    if (purityEl) purityEl.style.color = classification.color;

    // --- Dynamic Colors to Determine Ingredient Levels ---
    // 1. Fat Level & Color
    let fatLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Optimal Fat', pct: 60 };
    if (s.fat >= 5.2 || (s.sampleType === 'Buffalo' && s.fat >= 7.8)) {
      fatLevel = { text: '🟣 PREMIUM', badgeClass: 'badge-level-purple', fillClass: 'fill-purple', color: '#a855f7', label: 'Rich Fat Bonus', pct: 90 };
    } else if (s.fat >= (s.sampleType === 'Buffalo' ? 6.5 : 4.0)) {
      fatLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Standard High', pct: 70 };
    } else if (s.fat >= 3.2) {
      fatLevel = { text: '🔵 STANDARD', badgeClass: 'badge-level-blue', fillClass: 'fill-blue', color: '#38bdf8', label: 'Cooperative Base', pct: 50 };
    } else if (s.fat >= 2.6) {
      fatLevel = { text: '🟡 LOW FAT', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f59e0b', label: 'Deficit Marginal', pct: 35 };
    } else {
      fatLevel = { text: '🔴 CRITICAL', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: 'Severe Deficit', pct: 20 };
    }

    // 2. Protein Level & Color
    let proteinLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'High Protein', pct: 68 };
    if (s.protein >= 3.8) {
      proteinLevel = { text: '🟣 PREMIUM', badgeClass: 'badge-level-purple', fillClass: 'fill-purple', color: '#a855f7', label: 'Elite Protein', pct: 92 };
    } else if (s.protein >= 3.2) {
      proteinLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'High Quality', pct: 72 };
    } else if (s.protein >= 2.9) {
      proteinLevel = { text: '🔵 STANDARD', badgeClass: 'badge-level-blue', fillClass: 'fill-blue', color: '#38bdf8', label: 'Normal Level', pct: 52 };
    } else if (s.protein >= 2.5) {
      proteinLevel = { text: '🟡 LOW PROTEIN', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f59e0b', label: 'Marginal Level', pct: 38 };
    } else {
      proteinLevel = { text: '🔴 DEFICIENT', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: 'Degraded', pct: 20 };
    }

    // 3. Lactose Level & Color
    let lactoseLevel = { text: '🟢 NATURAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Natural Pure', pct: 75 };
    if (s.lactose >= 4.6 && s.lactose <= 5.2) {
      lactoseLevel = { text: '🟢 NATURAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Optimal Pure', pct: 80 };
    } else if (s.lactose >= 4.2) {
      lactoseLevel = { text: '🔵 NORMAL', badgeClass: 'badge-level-blue', fillClass: 'fill-blue', color: '#38bdf8', label: 'Normal Range', pct: 60 };
    } else if (s.lactose >= 3.7) {
      lactoseLevel = { text: '🟡 LOW LACTOSE', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f59e0b', label: 'Souring/Fermented', pct: 40 };
    } else {
      lactoseLevel = { text: '🔴 DEGRADED', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: 'Abnormal Acidic', pct: 20 };
    }

    // 4. Added Water Dilution Level & Color
    let waterLevel = { text: '🟢 0% PURE', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Undiluted Pure', pct: 0 };
    if (s.waterAdded === 0) {
      waterLevel = { text: '🟢 0% PURE', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Undiluted Pure', pct: 0 };
    } else if (s.waterAdded <= 5.0) {
      waterLevel = { text: '🟡 MINOR (+5%)', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f59e0b', label: `+${s.waterAdded.toFixed(1)}% Water`, pct: 30 };
    } else if (s.waterAdded <= 15.0) {
      waterLevel = { text: '🟠 MODERATE', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f97316', label: `+${s.waterAdded.toFixed(1)}% Penalty`, pct: 60 };
    } else {
      waterLevel = { text: '🔴 DILUTED HAZARD', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: `+${s.waterAdded.toFixed(1)}% Diluted`, pct: 95 };
    }

    // 5. Milk Density Level & Color
    let densityLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Pure Gravity', pct: 75 };
    if (s.density >= 1.028 && s.density <= 1.033) {
      densityLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Pure Gravity', pct: 75 };
    } else if (s.density > 1.033) {
      densityLevel = { text: '🟣 DENSE RICH', badgeClass: 'badge-level-purple', fillClass: 'fill-purple', color: '#a855f7', label: 'High Solids', pct: 92 };
    } else if (s.density >= 1.025) {
      densityLevel = { text: '🟡 LOW DENSITY', badgeClass: 'badge-level-yellow', fillClass: 'fill-yellow', color: '#f59e0b', label: 'Thin/Diluted', pct: 40 };
    } else {
      densityLevel = { text: '🔴 CRITICAL LOW', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: 'Heavy Water Dilution', pct: 15 };
    }

    // 6. Solid-Not-Fat (SNF) & Freshness Level & Color
    let snfLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Optimal SNF', pct: 85 };
    if (s.snf >= 9.2) {
      snfLevel = { text: '🟣 ELITE SNF', badgeClass: 'badge-level-purple', fillClass: 'fill-purple', color: '#a855f7', label: 'Elite Solids', pct: 95 };
    } else if (s.snf >= 8.5) {
      snfLevel = { text: '🟢 OPTIMAL', badgeClass: 'badge-level-green', fillClass: 'fill-green', color: '#10b981', label: 'Standard High', pct: 80 };
    } else if (s.snf >= 8.0) {
      snfLevel = { text: '🔵 STANDARD', badgeClass: 'badge-level-blue', fillClass: 'fill-blue', color: '#38bdf8', label: 'Cooperative Base', pct: 55 };
    } else {
      snfLevel = { text: '🔴 DEFICIENT', badgeClass: 'badge-level-red', fillClass: 'fill-red', color: '#ef4444', label: 'Deficient Solids', pct: 25 };
    }

    // Apply color determinations to DOM
    const applyColorLevel = (badgeId, barId, labelId, valId, level) => {
      const badge = document.getElementById(badgeId);
      const bar = document.getElementById(barId);
      const label = document.getElementById(labelId);
      const val = document.getElementById(valId);
      if (badge) {
        badge.className = `level-indicator-badge ${level.badgeClass}`;
        badge.innerText = level.text;
      }
      if (bar) {
        bar.className = `sensor-fill-bar ${level.fillClass}`;
        bar.style.width = `${level.pct}%`;
      }
      if (label) {
        label.innerText = level.label;
        label.style.color = level.color;
      }
      if (val) {
        val.style.color = level.color;
      }
    };

    applyColorLevel('badge-fat-level', 'bar-fat-fill', 'label-fat-level', 'telemetry-fat', fatLevel);
    applyColorLevel('badge-protein-level', 'bar-protein-fill', 'label-protein-level', 'telemetry-protein', proteinLevel);
    applyColorLevel('badge-lactose-level', 'bar-lactose-fill', 'label-lactose-level', 'telemetry-lactose', lactoseLevel);
    applyColorLevel('badge-water-level', 'bar-water-fill', 'label-water-level', 'telemetry-water', waterLevel);
    applyColorLevel('badge-density-level', 'bar-density-fill', 'label-density-level', 'telemetry-density', densityLevel);
    applyColorLevel('badge-snf-level', 'bar-snf-fill', 'label-snf-level', 'telemetry-snf', snfLevel);

    // Update Milk Composition Spectrum Stacked Bar
    const totalNaturalSolids = s.fat + s.protein + s.lactose + 0.7;
    const naturalWater = Math.max(60, 100 - totalNaturalSolids - s.waterAdded);
    const dilutionPercent = s.waterAdded;
    const totalSample = naturalWater + totalNaturalSolids + dilutionPercent;

    const wWater = (naturalWater / totalSample) * 100;
    const wFat = (s.fat / totalSample) * 100;
    const wProtein = (s.protein / totalSample) * 100;
    const wLactose = (s.lactose / totalSample) * 100;
    const wMinerals = (0.7 / totalSample) * 100;
    const wDilution = (dilutionPercent / totalSample) * 100;

    const segWater = document.getElementById('seg-water');
    const segFat = document.getElementById('seg-fat');
    const segProtein = document.getElementById('seg-protein');
    const segLactose = document.getElementById('seg-lactose');
    const segMinerals = document.getElementById('seg-minerals');
    const segDilution = document.getElementById('seg-dilution');

    if (segWater) segWater.style.width = `${wWater.toFixed(1)}%`;
    if (segFat) segFat.style.width = `${wFat.toFixed(1)}%`;
    if (segProtein) segProtein.style.width = `${wProtein.toFixed(1)}%`;
    if (segLactose) segLactose.style.width = `${wLactose.toFixed(1)}%`;
    if (segMinerals) segMinerals.style.width = `${wMinerals.toFixed(1)}%`;
    if (segDilution) segDilution.style.width = `${wDilution.toFixed(1)}%`;

    setInner('spec-water', `${naturalWater.toFixed(1)}%`);
    setInner('spec-fat', `${s.fat.toFixed(2)}%`);
    setInner('spec-protein', `${s.protein.toFixed(2)}%`);
    setInner('spec-lactose', `${s.lactose.toFixed(2)}%`);
    setInner('spec-dilution', `${s.waterAdded.toFixed(1)}%`);

    const specDilutionEl = document.getElementById('spec-dilution');
    if (specDilutionEl) specDilutionEl.style.color = s.waterAdded === 0 ? '#10b981' : '#ef4444';

    const compTag = document.getElementById('composition-purity-tag');
    if (compTag) {
      if (s.waterAdded === 0 && s.adulterants.length === 0) {
        compTag.className = 'badge badge-success';
        compTag.innerText = '100% ORGANIC PURE';
      } else if (s.adulterants.length > 0) {
        compTag.className = 'badge badge-danger';
        compTag.innerText = '⚠️ CONTAMINATED';
      } else {
        compTag.className = 'badge badge-warning';
        compTag.innerText = `⚠️ DILUTED (+${s.waterAdded.toFixed(1)}%)`;
      }
    }

    // Update Dedicated MILK ANALYSIS Card (6 Core Parameters & Color Indicators)
    const specCardFat = document.getElementById('spec-card-fat');
    const specIndFat = document.getElementById('spec-ind-fat');
    const specCardProtein = document.getElementById('spec-card-protein');
    const specIndProtein = document.getElementById('spec-ind-protein');
    const specCardLactose = document.getElementById('spec-card-lactose');
    const specIndLactose = document.getElementById('spec-ind-lactose');
    const specCardDensity = document.getElementById('spec-card-density');
    const specIndDensity = document.getElementById('spec-ind-density');
    const specCardWater = document.getElementById('spec-card-water');
    const specIndWater = document.getElementById('spec-ind-water');
    const specCardTemp = document.getElementById('spec-card-temp');
    const specIndTemp = document.getElementById('spec-ind-temp');
    const analysisOverallBadge = document.getElementById('analysis-overall-badge');

    if (specCardFat) specCardFat.innerText = `${s.fat.toFixed(2)} %`;
    if (specIndFat) {
      if (fatLevel.text.includes('🟣')) specIndFat.innerText = '🟣';
      else if (fatLevel.text.includes('🟢')) specIndFat.innerText = '🟢';
      else if (fatLevel.text.includes('🔵')) specIndFat.innerText = '🔵';
      else if (fatLevel.text.includes('🟡')) specIndFat.innerText = '🟡';
      else specIndFat.innerText = '🔴';
    }

    if (specCardProtein) specCardProtein.innerText = `${s.protein.toFixed(2)} %`;
    if (specIndProtein) {
      if (proteinLevel.text.includes('🟣')) specIndProtein.innerText = '🟣';
      else if (proteinLevel.text.includes('🟢')) specIndProtein.innerText = '🟢';
      else if (proteinLevel.text.includes('🔵')) specIndProtein.innerText = '🔵';
      else if (proteinLevel.text.includes('🟡')) specIndProtein.innerText = '🟡';
      else specIndProtein.innerText = '🔴';
    }

    if (specCardLactose) specCardLactose.innerText = `${s.lactose.toFixed(2)} %`;
    if (specIndLactose) {
      if (lactoseLevel.text.includes('🟢')) specIndLactose.innerText = '🟢';
      else if (lactoseLevel.text.includes('🔵')) specIndLactose.innerText = '🔵';
      else if (lactoseLevel.text.includes('🟡')) specIndLactose.innerText = '🟡';
      else specIndLactose.innerText = '🔴';
    }

    if (specCardDensity) specCardDensity.innerText = `${s.density.toFixed(3)}`;
    if (specIndDensity) {
      if (densityLevel.text.includes('🟢')) specIndDensity.innerText = '🟢';
      else if (densityLevel.text.includes('🟣')) specIndDensity.innerText = '🟣';
      else if (densityLevel.text.includes('🟡')) specIndDensity.innerText = '🟡';
      else specIndDensity.innerText = '🔴';
    }

    if (specCardWater) {
      if (s.waterAdded === 0 && s.adulterants.length === 0) {
        specCardWater.innerText = 'Normal';
        specCardWater.style.color = '#10b981';
        if (specIndWater) specIndWater.innerText = '🟢';
      } else if (s.adulterants.length > 0) {
        specCardWater.innerText = `${s.adulterants[0]}`;
        specCardWater.style.color = '#ef4444';
        if (specIndWater) specIndWater.innerText = '🔴';
      } else {
        specCardWater.innerText = `+${s.waterAdded.toFixed(1)}% Diluted`;
        specCardWater.style.color = '#f59e0b';
        if (specIndWater) specIndWater.innerText = '🟡';
      }
    }

    if (specCardTemp) specCardTemp.innerText = `${s.temperature.toFixed(1)} °C`;
    if (specIndTemp) {
      if (s.temperature >= 3.0 && s.temperature <= 10.0) {
        specIndTemp.innerText = '🟢';
      } else if (s.temperature <= 18.0) {
        specIndTemp.innerText = '🟡';
      } else {
        specIndTemp.innerText = '🔴';
      }
    }

    if (analysisOverallBadge) {
      if (s.waterAdded === 0 && s.adulterants.length === 0) {
        analysisOverallBadge.className = 'badge badge-success';
        analysisOverallBadge.innerText = `100% PURE • ${classification.code}`;
      } else if (s.adulterants.length > 0) {
        analysisOverallBadge.className = 'badge badge-danger';
        analysisOverallBadge.innerText = `CONTAMINATED • ${classification.code}`;
      } else {
        analysisOverallBadge.className = 'badge badge-warning';
        analysisOverallBadge.innerText = `DILUTED • ${classification.code}`;
      }
    }

    // Update Dedicated MILK STATUS Summary Card (FAT, PROTEIN, LACTOSE, DENSITY, PURITY)
    const mstatusDotFat = document.getElementById('mstatus-dot-fat');
    const mstatusDotProtein = document.getElementById('mstatus-dot-protein');
    const mstatusDotLactose = document.getElementById('mstatus-dot-lactose');
    const mstatusDotDensity = document.getElementById('mstatus-dot-density');
    const mstatusDotPurity = document.getElementById('mstatus-dot-purity');
    const mstatusScoreText = document.getElementById('mstatus-score-text');
    const mstatusTierText = document.getElementById('mstatus-tier-text');
    const mstatusBox = document.getElementById('milk-status-box');

    if (mstatusDotFat) {
      mstatusDotFat.innerText = fatLevel.text.includes('🔴') ? '🔴' : fatLevel.text.includes('🟡') ? '🟡' : '🟢';
    }
    if (mstatusDotProtein) {
      mstatusDotProtein.innerText = proteinLevel.text.includes('🔴') ? '🔴' : proteinLevel.text.includes('🟡') ? '🟡' : '🟢';
    }
    if (mstatusDotLactose) {
      mstatusDotLactose.innerText = lactoseLevel.text.includes('🔴') ? '🔴' : (lactoseLevel.text.includes('🟡') || s.lactose <= 4.65) ? '🟡' : '🟢';
    }
    if (mstatusDotDensity) {
      mstatusDotDensity.innerText = densityLevel.text.includes('🔴') ? '🔴' : densityLevel.text.includes('🟡') ? '🟡' : '🟢';
    }
    if (mstatusDotPurity) {
      mstatusDotPurity.innerText = s.adulterants.length > 0 ? '🔴' : s.waterAdded > 0 ? '🟡' : '🟢';
    }

    const displayScore = (s.waterAdded === 0 && s.adulterants.length === 0 && s.lactose <= 4.65) ? 91 : Math.round(s.purityScore);
    const scoreTier = window.sensorEngine.getQualityScoreTier ? window.sensorEngine.getQualityScoreTier(displayScore) : {
      code: displayScore >= 90 ? 'PREMIUM' : displayScore >= 75 ? 'GOOD' : displayScore >= 60 ? 'AVERAGE' : 'POOR',
      label: displayScore >= 90 ? 'PREMIUM' : displayScore >= 75 ? 'GOOD' : displayScore >= 60 ? 'AVERAGE' : 'POOR',
      icon: displayScore >= 75 ? '🟢' : displayScore >= 60 ? '🟡' : '🔴',
      color: displayScore >= 75 ? '#10b981' : displayScore >= 60 ? '#f59e0b' : '#ef4444'
    };

    if (mstatusScoreText) {
      mstatusScoreText.innerText = `QUALITY: ${displayScore}/100`;
    }

    if (mstatusTierText && mstatusBox) {
      mstatusTierText.innerText = `${scoreTier.icon} ${scoreTier.label}`;
      mstatusTierText.style.color = scoreTier.color;
      mstatusBox.style.borderColor = scoreTier.color;
      mstatusBox.style.background = scoreTier.color === '#ef4444'
        ? 'rgba(239, 68, 68, 0.12)'
        : scoreTier.color === '#f59e0b'
          ? 'rgba(245, 158, 11, 0.12)'
          : 'rgba(16, 185, 129, 0.12)';
    }

    // Highlight active tier rule chip: 90–100 PREMIUM, 75–89 GOOD, 60–74 AVERAGE, <60 POOR
    ['premium', 'good', 'average', 'poor'].forEach(t => {
      const chip = document.getElementById(`rule-chip-${t}`);
      if (chip) {
        if (t === scoreTier.code.toLowerCase()) chip.classList.add('active-tier');
        else chip.classList.remove('active-tier');
      }
    });

    // Update 100-Point Quality Scorecard
    if (window.sensorEngine && window.sensorEngine.calculateQualityPoints) {
      const pts = window.sensorEngine.calculateQualityPoints(s);

      const updatePtRow = (prefix, scored, max) => {
        const valEl = document.getElementById(`pts-${prefix}-val`);
        const barEl = document.getElementById(`pts-${prefix}-bar`);
        const dotEl = document.getElementById(`pts-${prefix}-dot`);
        if (valEl) valEl.innerText = scored;
        if (barEl) {
          const pct = Math.round((scored / max) * 100);
          barEl.style.width = `${pct}%`;
          barEl.style.background = pct >= 85 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444';
        }
        if (dotEl) {
          dotEl.innerText = (scored / max) >= 0.85 ? '🟢' : (scored / max) >= 0.65 ? '🟡' : '🔴';
        }
      };

      updatePtRow('fat', pts.fat, pts.fatMax);
      updatePtRow('protein', pts.protein, pts.proteinMax);
      updatePtRow('density', pts.density, pts.densityMax);
      updatePtRow('ph', pts.ph, pts.phMax);
      updatePtRow('adult', pts.adulteration, pts.adulterationMax);
      updatePtRow('temp', pts.temperature, pts.temperatureMax);

      const totalValEl = document.getElementById('pts-total-val');
      const totalBarEl = document.getElementById('pts-total-bar');
      const totalBadgeEl = document.getElementById('pts-total-badge');
      const scorecardTierBadge = document.getElementById('scorecard-tier-badge');

      if (totalValEl) totalValEl.innerText = `${pts.total} / 100`;
      if (totalBarEl) {
        totalBarEl.style.width = `${pts.total}%`;
        totalBarEl.style.background = pts.total >= 90
          ? 'linear-gradient(90deg, #10b981, #0ea5e9)'
          : pts.total >= 75
            ? '#10b981'
            : pts.total >= 60
              ? '#f59e0b'
              : '#ef4444';
      }
      if (totalBadgeEl) {
        totalBadgeEl.innerText = `${scoreTier.icon} ${scoreTier.label}`;
        totalBadgeEl.className = `badge ${scoreTier.badgeClass}`;
      }
      if (scorecardTierBadge) {
        scorecardTierBadge.innerText = `${scoreTier.label} • ${pts.total}/100 PTS`;
        scorecardTierBadge.className = `badge ${scoreTier.badgeClass}`;
      }
    }

    // Update Transparent Milk Payment Breakdown Card
    const calcScoreVal = document.getElementById('calc-score-val');
    const calcBaseVal = document.getElementById('calc-base-val');
    const calcBonusVal = document.getElementById('calc-bonus-val');
    const calcRateVal = document.getElementById('calc-rate-val');
    const calcQtyVal = document.getElementById('calc-qty-val');
    const calcMultiLine = document.getElementById('calc-multi-line');
    const calcTotalVal = document.getElementById('calc-total-val');
    const calcRuleBadge = document.getElementById('calc-rule-badge');

    const scoreVal = pricing.qualityScore || Math.round(s.purityScore);
    if (calcScoreVal) calcScoreVal.innerText = scoreVal;
    if (calcBaseVal) calcBaseVal.innerText = `₹${pricing.baseRate.toFixed(0)}/L`;
    if (calcBonusVal) {
      calcBonusVal.innerText = pricing.qualityBonus >= 0 ? `+₹${pricing.qualityBonus.toFixed(0)}/L` : `-₹${Math.abs(pricing.qualityBonus).toFixed(0)}/L`;
      calcBonusVal.style.color = pricing.qualityBonus > 0 ? '#10b981' : pricing.qualityBonus < 0 ? '#ef4444' : '#cbd5e1';
    }
    if (calcRateVal) calcRateVal.innerText = `₹${pricing.netRatePerLitre.toFixed(0)}/L`;
    if (calcQtyVal) calcQtyVal.innerText = `${s.volume.toFixed(1)} L`;
    if (calcMultiLine) calcMultiLine.innerText = `= ${s.volume.toFixed(1)} × ₹${pricing.netRatePerLitre.toFixed(0)}`;
    if (calcTotalVal) {
      calcTotalVal.innerText = `= ₹${pricing.totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      calcTotalVal.style.color = pricing.totalPayout > 0 ? '#10b981' : '#ef4444';
    }
    if (calcRuleBadge) {
      calcRuleBadge.innerText = `${scoreTier.label} ${scoreTier.icon} • DIRECT BENEFIT TRANSFER`;
      calcRuleBadge.className = `badge ${scoreTier.badgeClass}`;
    }

    // Update Official Payment Receipt Card
    const receiptFarmerVal = document.getElementById('receipt-farmer-val');
    const receiptQtyVal = document.getElementById('receipt-qty-val');
    const receiptQualityVal = document.getElementById('receipt-quality-val');
    const receiptGradeVal = document.getElementById('receipt-grade-val');
    const receiptRateVal = document.getElementById('receipt-rate-val');
    const receiptTotalVal = document.getElementById('receipt-total-val');
    const receiptStatusVal = document.getElementById('receipt-status-val');

    if (receiptFarmerVal) receiptFarmerVal.innerText = farmer.id || 'FMR-2026-00125';
    if (receiptQtyVal) receiptQtyVal.innerText = `${s.volume.toFixed(1)} L`;
    if (receiptQualityVal) receiptQualityVal.innerText = `${scoreVal}/100`;
    if (receiptGradeVal) {
      receiptGradeVal.innerText = scoreTier.label;
      receiptGradeVal.style.color = scoreTier.badgeClass === 'badge-success' ? '#10b981' : scoreTier.badgeClass === 'badge-warning' ? '#f59e0b' : '#ef4444';
    }
    if (receiptRateVal) receiptRateVal.innerText = `₹${pricing.netRatePerLitre.toFixed(0)}/L`;
    if (receiptTotalVal) {
      receiptTotalVal.innerText = `₹${pricing.totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      receiptTotalVal.style.color = pricing.totalPayout > 0 ? '#10b981' : '#ef4444';
    }
    if (receiptStatusVal) {
      if (pricing.status === 'REJECTED' || pricing.totalPayout <= 0) {
        receiptStatusVal.innerText = 'REJECTED';
        receiptStatusVal.className = 'receipt-stamp-pill rejected';
        receiptStatusVal.style.borderColor = '#ef4444';
        receiptStatusVal.style.color = '#ef4444';
        receiptStatusVal.style.background = 'rgba(239, 68, 68, 0.15)';
      } else {
        receiptStatusVal.innerText = 'PAID';
        receiptStatusVal.className = 'receipt-stamp-pill paid';
        receiptStatusVal.style.borderColor = '#10b981';
        receiptStatusVal.style.color = '#10b981';
        receiptStatusVal.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    }

    // Update End-to-End AI / ML Prediction Architecture Card
    const e2eFatVal = document.getElementById('e2e-fat-val');
    const e2eProteinVal = document.getElementById('e2e-protein-val');
    const e2eLactoseVal = document.getElementById('e2e-lactose-val');
    const e2eDensityVal = document.getElementById('e2e-density-val');
    const e2eSnfVal = document.getElementById('e2e-snf-val');
    const e2eWaterVal = document.getElementById('e2e-water-val');

    if (e2eFatVal) e2eFatVal.innerText = `${s.fat.toFixed(2)}%`;
    if (e2eProteinVal) e2eProteinVal.innerText = `${s.protein.toFixed(2)}%`;
    if (e2eLactoseVal) e2eLactoseVal.innerText = `${s.lactose.toFixed(2)}%`;
    if (e2eDensityVal) e2eDensityVal.innerText = s.density.toFixed(3);
    if (e2eSnfVal) e2eSnfVal.innerText = `${s.snf.toFixed(2)}%`;
    if (e2eWaterVal) {
      e2eWaterVal.innerText = `${s.waterAdded.toFixed(1)}%`;
      e2eWaterVal.style.color = s.waterAdded === 0 ? '#10b981' : '#ef4444';
    }

    const qualityShowcase = document.getElementById('milk-quality-result-card');
    if (qualityShowcase) {
      let gradeClass = 'grade-a';
      let gradeIcon = '🥇';
      if (classification.code === 'GRADE A+') {
        gradeClass = 'grade-a-plus';
        gradeIcon = '🏆';
      } else if (classification.code === 'GRADE B') {
        gradeClass = 'grade-b';
        gradeIcon = '🥈';
      } else if (classification.code === 'GRADE C') {
        gradeClass = 'grade-c';
        gradeIcon = '🥉';
      } else if (classification.code === 'GRADE F') {
        gradeClass = 'grade-f';
        gradeIcon = '⛔';
      }

      // Sensor Criteria Verification Checklist
      const minFatBenchmark = s.sampleType === 'Buffalo' ? 6.5 : 4.0;
      const minSnfBenchmark = s.sampleType === 'Buffalo' ? 9.0 : 8.5;
      const fatPass = s.fat >= minFatBenchmark;
      const snfPass = s.snf >= minSnfBenchmark;
      const waterPass = s.waterAdded === 0;
      const adulterantPass = s.adulterants.length === 0;
      const phPass = s.ph >= 6.50 && s.ph <= 6.85;

      // 5-Tier Ladder Data
      const tiers = [
        { code: 'GRADE A+', label: 'Elite Pure', mult: '+12% Premium', badge: 'grade-a-plus' },
        { code: 'GRADE A', label: 'Standard Pure', mult: 'Base Rate', badge: 'grade-a' },
        { code: 'GRADE B', label: 'Marginal', mult: '-8% Discount', badge: 'grade-b' },
        { code: 'GRADE C', label: 'Diluted Substandard', mult: '-25% Penalty', badge: 'grade-c' },
        { code: 'GRADE F', label: 'Hazard Confiscated', mult: '₹0.00 Payout', badge: 'grade-f' }
      ];

      qualityShowcase.innerHTML = `
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 1.25rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
            <!-- Official Automatic Grade Stamp -->
            <div class="auto-grade-seal ${gradeClass}">
              <span style="font-size: 1.5rem;">${gradeIcon}</span>
              <span style="font-size: 1.85rem; letter-spacing: 1px; line-height: 1.1;">${classification.code}</span>
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; opacity: 0.9;">${classification.label}</span>
            </div>

            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge ${classification.badgeClass}" style="font-size: 0.8rem; font-weight: 700;">
                  AUTOMATIC GRADE ASSIGNED
                </span>
                <span class="badge" style="background: rgba(14,165,233,0.15); color: var(--primary-light); font-size: 0.8rem;">
                  Farmer: ${farmer.name}
                </span>
              </div>
              <h3 style="font-size: 1.5rem; margin-top: 6px; color: ${classification.color};">
                ${classification.code === 'GRADE A+' ? '🏆 Grade A+ Certified: 100% Pure Organic Milk' :
          classification.code === 'GRADE A' ? '🥇 Grade A Certified: Standard Cooperative Quality' :
            classification.code === 'GRADE B' ? '🥈 Grade B Assigned: Marginal Composition Discounted' :
              classification.code === 'GRADE C' ? '🥉 Grade C Assigned: Diluted / High Water Penalty' :
                '🚨 Grade F Assigned: Chemical Adulteration Confiscated'}
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                ${classification.description}
              </p>
              <div style="font-size: 0.85rem; font-weight: 700; color: ${pricing.qualityBonusOrDeduction >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
                Rule Applied: ${pricing.qualityBonusOrDeduction > 0 ? `+${Math.round((classification.priceMultiplier - 1) * 100)}% Quality Premium Bonus (₹${pricing.netRatePerLitre.toFixed(2)}/L)` : pricing.qualityBonusOrDeduction < 0 ? `-${Math.round((1 - classification.priceMultiplier) * 100)}% Quality Deduction (₹${pricing.netRatePerLitre.toFixed(2)}/L)` : `Standard Cooperative Rate (₹${pricing.netRatePerLitre.toFixed(2)}/L)`}
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Measured Purity Score</div>
            <div style="font-size: 2.8rem; font-weight: 800; font-family: var(--font-mono); color: ${classification.color}; line-height: 1;">
              ${s.purityScore.toFixed(1)}%
            </div>
            <div class="sensor-range-bar" style="width: 140px; margin-left: auto; margin-top: 8px;">
              <div class="sensor-fill-bar" style="width: ${s.purityScore}%; background: ${classification.color};"></div>
            </div>
          </div>
        </div>

        <!-- Automatic Grading Criteria Table -->
        <div style="background: rgba(0,0,0,0.2); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--primary-light); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            Sensor Quality Diagnostics &amp; Auto-Grading Benchmark Verification:
          </div>
          <table class="grading-criteria-table">
            <thead>
              <tr>
                <th>Quality Indicator</th>
                <th>Measured Value</th>
                <th>Cooperative Benchmark</th>
                <th>Auto-Grading Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fat Content (Optical NIR)</strong></td>
                <td><span style="font-family: var(--font-mono); font-weight: 700;">${s.fat.toFixed(2)}%</span></td>
                <td>&ge; ${minFatBenchmark.toFixed(1)}% (${s.sampleType})</td>
                <td>${fatPass ? '<span class="criteria-badge-pass">✓ STANDARD MET</span>' : '<span class="criteria-badge-fail">✗ LOW FAT</span>'}</td>
              </tr>
              <tr>
                <td><strong>Solid-Not-Fat (SNF)</strong></td>
                <td><span style="font-family: var(--font-mono); font-weight: 700;">${s.snf.toFixed(2)}%</span></td>
                <td>&ge; ${minSnfBenchmark.toFixed(1)}%</td>
                <td>${snfPass ? '<span class="criteria-badge-pass">✓ STANDARD MET</span>' : '<span class="criteria-badge-fail">✗ DEFICIENT</span>'}</td>
              </tr>
              <tr>
                <td><strong>Added Water (Conductance)</strong></td>
                <td><span style="font-family: var(--font-mono); font-weight: 700;">${s.waterAdded.toFixed(1)}%</span></td>
                <td>0.0% Strict Pure</td>
                <td>${waterPass ? '<span class="criteria-badge-pass">✓ ZERO DILUTION</span>' : `<span class="criteria-badge-fail">✗ +${s.waterAdded.toFixed(1)}% WATER DILUTED</span>`}</td>
              </tr>
              <tr>
                <td><strong>Adulterant Screening</strong></td>
                <td><span style="font-family: var(--font-mono); font-weight: 700;">${s.adulterants.length === 0 ? 'None Detected' : s.adulterants.join(', ')}</span></td>
                <td>Zero Chemical Tolerance</td>
                <td>${adulterantPass ? '<span class="criteria-badge-pass">✓ 100% CLEAN ORGANIC</span>' : '<span class="criteria-badge-fail">✗ CONTAMINATED HAZARD</span>'}</td>
              </tr>
              <tr>
                <td><strong>pH &amp; Thermal Freshness</strong></td>
                <td><span style="font-family: var(--font-mono); font-weight: 700;">${s.ph.toFixed(2)} pH &bull; ${s.temperature.toFixed(1)}°C</span></td>
                <td>6.50 &ndash; 6.85 pH (Optimal)</td>
                <td>${phPass ? '<span class="criteria-badge-pass">✓ NATURAL FRESH</span>' : '<span class="criteria-badge-fail">✗ ACIDIC / SOURING</span>'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5-Tier Grade Ladder -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">
            Cooperative 5-Tier Quality Ladder:
          </div>
          <div class="grade-tier-ladder">
            ${tiers.map(t => `
              <div class="grade-tier-step ${t.code === classification.code ? 'current-grade' : ''}">
                <div style="font-weight: 800; color: ${t.code === classification.code ? classification.color : 'inherit'};">
                  ${t.code}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${t.label}</div>
                <div style="font-size: 0.68rem; font-weight: 700; margin-top: 2px;">${t.mult}</div>
                ${t.code === classification.code ? `<div style="font-size: 0.65rem; color: #10b981; font-weight: 800; margin-top: 4px;">● CURRENT GRADE</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid-4" style="margin-bottom: 1.25rem;">
          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-muted);">SAMPLED VOLUME</div>
            <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-mono);">${s.volume.toFixed(1)} Litres</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-muted);">FAT / SNF</div>
            <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-mono);">${s.fat.toFixed(2)}% / ${s.snf.toFixed(2)}%</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-muted);">NET RATE / LITRE</div>
            <div style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-mono); color: var(--primary-light);">₹${pricing.netRatePerLitre.toFixed(2)}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-muted);">TOTAL PAYOUT (DBT)</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: ${pricing.totalPayout > 0 ? '#10b981' : '#ef4444'};">₹${pricing.totalPayout.toFixed(2)}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Farmer: <strong style="color: #ffffff;">${farmer.name}</strong> &bull; Bank: <strong style="color: var(--primary-light);">${farmer.bankAccount}</strong>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.switchSection('pricing')">
              Pricing Details
            </button>
            <button class="btn btn-success btn-sm" onclick="window.app.commitIntakeToCloud()">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Confirm &amp; Disburse Payout to ${farmer.name}
            </button>
          </div>
        </div>
      `;
    }

    const adulterationBox = document.getElementById('adulteration-indicator-box');
    const adulterantList = document.getElementById('adulterant-detected-list');
    if (adulterationBox && adulterantList) {
      if (s.adulterants.length === 0) {
        adulterationBox.className = 'adulteration-box purity-clean';
        adulterantList.innerHTML = `
          <span class="adulterant-pill safe">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            Zero Adulterants &bull; 100% Pure &bull; ${classification.code}
          </span>
        `;
      } else {
        adulterationBox.className = 'adulteration-box';
        adulterantList.innerHTML = s.adulterants.map(a => `
          <span class="adulterant-pill detected">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
            ${a}
          </span>
        `).join('');
      }
    }

    // Update AI/ML Live Inference Display Box (Fat % Prediction, Quality Score, Purity Status)
    const aiFatPred = document.getElementById('ai-fat-pred');
    const aiFatCi = document.getElementById('ai-fat-ci');
    const aiFatBadge = document.getElementById('ai-fat-badge');
    const aiScoreDisp = document.getElementById('ai-score-disp');
    const aiQualityGradeBadge = document.getElementById('ai-quality-grade-badge');
    const aiPurityBadge = document.getElementById('ai-purity-badge');
    const aiPurityText = document.getElementById('ai-purity-text');
    const aiAdulterantRisk = document.getElementById('ai-adulterant-risk');
    const aiLatencyDisp = document.getElementById('ai-latency-disp');

    if (aiFatPred) {
      const predictedFatVal = (s.fat === 4.20 ? 4.21 : s.fat).toFixed(2);
      aiFatPred.innerText = `${predictedFatVal}%`;
      const ci = s.waterAdded > 0 ? (0.05 + s.waterAdded * 0.004).toFixed(2) : '0.04';
      if (aiFatCi) aiFatCi.innerText = `± ${ci}%`;

      const confPct = s.waterAdded === 0 && s.adulterants.length === 0 ? 94 : Math.max(45, Math.round(94 - s.waterAdded * 2.2 - s.adulterants.length * 15));
      const aiFatConfText = document.getElementById('ai-fat-conf-text');
      if (aiFatConfText) aiFatConfText.innerText = `${confPct}%`;

      const pipePredConfVal = document.getElementById('pipe-pred-conf-val');
      if (pipePredConfVal) pipePredConfVal.innerText = `${confPct}%`;

      if (aiFatBadge) {
        if (s.waterAdded === 0 && s.adulterants.length === 0) {
          aiFatBadge.className = 'level-indicator-badge badge-level-green';
          aiFatBadge.innerText = `🟢 ${confPct}% CONF`;
        } else if (s.adulterants.length > 0) {
          aiFatBadge.className = 'level-indicator-badge badge-level-red';
          aiFatBadge.innerText = `🔴 ${confPct}% NOISE`;
        } else {
          aiFatBadge.className = 'level-indicator-badge badge-level-yellow';
          aiFatBadge.innerText = `🟡 ${confPct}% DILUTED`;
        }
      }
    }

    if (aiScoreDisp) {
      aiScoreDisp.innerText = s.purityScore.toFixed(1);
      aiScoreDisp.style.color = classification.color;
      if (aiQualityGradeBadge) {
        aiQualityGradeBadge.className = `level-indicator-badge ${classification.badgeClass}`;
        aiQualityGradeBadge.innerText = classification.code;
      }
    }

    if (aiPurityText) {
      if (s.waterAdded === 0 && s.adulterants.length === 0) {
        aiPurityText.innerText = 'Organic Pure';
        aiPurityText.style.color = '#10b981';
        if (aiPurityBadge) {
          aiPurityBadge.className = 'level-indicator-badge badge-level-green';
          aiPurityBadge.innerText = 'PASS • 100% PURE';
        }
        if (aiAdulterantRisk) {
          aiAdulterantRisk.innerText = '< 0.1%';
          aiAdulterantRisk.style.color = '#10b981';
        }
      } else if (s.adulterants.length > 0) {
        aiPurityText.innerText = 'Chemical Hazard';
        aiPurityText.style.color = '#ef4444';
        if (aiPurityBadge) {
          aiPurityBadge.className = 'level-indicator-badge badge-level-red';
          aiPurityBadge.innerText = 'ALERT • ADULTERATED';
        }
        if (aiAdulterantRisk) {
          aiAdulterantRisk.innerText = '99.8% HAZARD';
          aiAdulterantRisk.style.color = '#ef4444';
        }
      } else {
        aiPurityText.innerText = `Diluted (+${s.waterAdded.toFixed(1)}%)`;
        aiPurityText.style.color = '#f59e0b';
        if (aiPurityBadge) {
          aiPurityBadge.className = 'level-indicator-badge badge-level-yellow';
          aiPurityBadge.innerText = 'WARN • DILUTION';
        }
        if (aiAdulterantRisk) {
          aiAdulterantRisk.innerText = `${(s.waterAdded * 1.5).toFixed(1)}% RISK`;
          aiAdulterantRisk.style.color = '#f59e0b';
        }
      }
    }

    if (aiLatencyDisp) {
      aiLatencyDisp.innerText = `${Math.floor(9 + Math.random() * 5)}ms`;
    }

    const pipePredFatVal = document.getElementById('pipe-pred-fat-val');
    if (pipePredFatVal) {
      const predictedFatVal = (s.fat === 4.20 ? 4.21 : s.fat).toFixed(2);
      pipePredFatVal.innerText = `${predictedFatVal}%`;
    }

    this.renderNIRSpectroscopy(s);
    this.refreshPricingPreview();
  }

  selectFatModel(model) {
    this.activeFatModel = model;
    ['pls', 'svr', 'xgb'].forEach(k => {
      const btn = document.getElementById(`btn-model-${k}`);
      if (btn) btn.classList.remove('active');
    });

    const targetKey = model === 'PLS' ? 'pls' : model === 'SVR' ? 'svr' : 'xgb';
    const activeBtn = document.getElementById(`btn-model-${targetKey}`);
    if (activeBtn) activeBtn.classList.add('active');

    const desc = document.getElementById('pipe-active-model-desc');
    const aiFatCi = document.getElementById('ai-fat-ci');
    const aiLatencyDisp = document.getElementById('ai-latency-disp');

    if (model === 'PLS') {
      if (desc) desc.innerHTML = 'Active: PLS Regressor &bull; R&sup2; = 0.992 &bull; RMSEP = 0.05%';
      if (aiFatCi) aiFatCi.innerText = '± 0.04%';
      if (aiLatencyDisp) aiLatencyDisp.innerText = '6ms';
      this.showToast('Switched to Partial Least Squares (PLS) Chemometrics Model', 'info');
    } else if (model === 'SVR') {
      if (desc) desc.innerHTML = 'Active: SVR (RBF Kernel) &bull; R&sup2; = 0.994 &bull; RMSEP = 0.04%';
      if (aiFatCi) aiFatCi.innerText = '± 0.03%';
      if (aiLatencyDisp) aiLatencyDisp.innerText = '11ms';
      this.showToast('Switched to Support Vector Regression (SVR - RBF Kernel)', 'info');
    } else if (model === 'XGBoost') {
      if (desc) desc.innerHTML = 'Active: XGBoost Regressor &bull; R&sup2; = 0.996 &bull; RMSEP = 0.03%';
      if (aiFatCi) aiFatCi.innerText = '± 0.03%';
      if (aiLatencyDisp) aiLatencyDisp.innerText = '9ms';
      this.showToast('Switched to Extreme Gradient Boosted Trees (XGBoost)', 'info');
    }
  }

  renderNIRSpectroscopy(s) {
    const grid = document.getElementById('nir-bands-grid');
    const svg = document.getElementById('nir-spectrum-svg');
    if (!window.sensorEngine || !window.sensorEngine.getNIRWavelengthReadings) return;

    const channels = window.sensorEngine.getNIRWavelengthReadings(s);

    if (grid) {
      grid.innerHTML = channels.map(c => `
        <div class="nir-band-card">
          <div class="nir-band-top">
            <span class="nir-wave-chip" style="border-color: ${c.color}40; color: ${c.color};">${c.bandName}</span>
            <span class="badge ${c.badgeClass}" style="font-size: 0.68rem; padding: 2px 6px;">${c.status}</span>
          </div>
          <div class="nir-band-component">${c.component}</div>
          <div class="nir-band-bond">${c.bond}</div>
          <div class="nir-band-metric-row">
            <span class="nir-band-au" style="color: ${c.color};">${c.absorbance.toFixed(3)}<span class="nir-band-unit">AU</span></span>
            <span style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${c.relativePct.toFixed(0)}% Int</span>
          </div>
          <div class="nir-band-meter-track">
            <div class="nir-band-meter-bar" style="width: ${c.relativePct}%; background: ${c.color};"></div>
          </div>
        </div>
      `).join('');
    }

    if (svg) {
      // Continuous NIR spectral absorption curve based on molecular vibration peaks
      // Spectral range: 900nm (x=50) to 2250nm (x=750), ViewBox: 800 x 130
      const mapX = (wl) => 50 + ((wl - 900) / (2250 - 900)) * 700;
      const mapY = (au) => Math.max(18, Math.min(115, 115 - (au / 1.7) * 95));

      let pathD = "M 50 115 ";
      for (let wl = 900; wl <= 2250; wl += 15) {
        let totalAU = 0.22; // baseline matrix scatter
        channels.forEach(ch => {
          const sigma = 38; // spectral half-width
          const diff = wl - ch.wavelength;
          totalAU += ch.absorbance * Math.exp(-(diff * diff) / (2 * sigma * sigma)) * 0.72;
        });
        const x = mapX(wl);
        const y = mapY(totalAU);
        pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      pathD += "L 750 115 Z";

      const peakDots = channels.map(ch => {
        const cx = mapX(ch.wavelength);
        const cy = mapY(ch.absorbance);
        return `
          <g>
            <line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${cx.toFixed(1)}" y2="115" stroke="${ch.color}" stroke-width="1" stroke-dasharray="2,2" opacity="0.6" />
            <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${ch.color}" stroke="#ffffff" stroke-width="1.5" />
            <text x="${cx.toFixed(1)}" y="${(cy - 7).toFixed(1)}" fill="${ch.color}" font-size="9.5" font-weight="700" font-family="monospace" text-anchor="middle">${ch.wavelength}</text>
          </g>
        `;
      }).join('');

      svg.innerHTML = `
        <defs>
          <linearGradient id="nir-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.45" />
            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="40" y1="115" x2="760" y2="115" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <text x="50" y="127" fill="#64748b" font-size="9" font-family="monospace">900nm</text>
        <text x="283" y="127" fill="#64748b" font-size="9" font-family="monospace">1400nm</text>
        <text x="516" y="127" fill="#64748b" font-size="9" font-family="monospace">1800nm</text>
        <text x="735" y="127" fill="#64748b" font-size="9" font-family="monospace">2250nm</text>
        <path d="${pathD}" fill="url(#nir-grad)" stroke="#c084fc" stroke-width="2" stroke-linejoin="round" />
        ${peakDots}
      `;
    }
  }

  toggleArchView(view) {
    const visual = document.getElementById('arch-visual-view');
    const ascii = document.getElementById('arch-ascii-view');
    const btnVisual = document.getElementById('btn-arch-visual');
    const btnAscii = document.getElementById('btn-arch-ascii');

    if (view === 'ascii') {
      if (visual) visual.style.display = 'none';
      if (ascii) ascii.style.display = 'block';
      if (btnVisual) btnVisual.classList.remove('active');
      if (btnAscii) btnAscii.classList.add('active');
    } else {
      if (visual) visual.style.display = 'flex';
      if (ascii) ascii.style.display = 'none';
      if (btnVisual) btnVisual.classList.add('active');
      if (btnAscii) btnAscii.classList.remove('active');
    }
  }

  copyAsciiDiagram() {
    const asciiText = `                    WEB APPLICATION
                          │
        ┌─────────────────┼──────────────────┐
        ↓                 ↓                  ↓
   Farmer Portal     Collection Center    Admin Portal
        │                 │                  │
        └─────────────────┼──────────────────┘
                          ↓
                     Backend API
                          ↓
                 AI / ML Prediction
                          ↓
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Fat %        Quality       Purity
        Prediction      Score       Status
             └────────────┼────────────┘
                          ↓
                   Pricing Engine
                          ↓
                    Cloud Database
                          ↓
                 Reports / Analytics

         ───────────────────────────────────────────────────
                NIR CHEMOMETRICS FAT PREDICTION PIPELINE
         ───────────────────────────────────────────────────
                               NIR Data
                                  │
                                  ↓
                            Preprocessing
                        (SNV + Savitzky-Golay)
                                  │
                                  ↓
                         PLS / SVR / XGBoost
                                  │
                                  ↓
                          Predicted Fat %

         ───────────────────────────────────────────────────
              FULL-STACK CLOUD DATA PIPELINE ARCHITECTURE
         ───────────────────────────────────────────────────
                                React
                                  │
                                  ↓
                           Node.js / Express
                                   │
                                   ↓
                             MongoDB Atlas

         ───────────────────────────────────────────────────
                 AI / ML INFERENCE BACKEND PIPELINE
         ───────────────────────────────────────────────────
                                Node.js
                                   │
                                   ↓
                             Python AI API
                                   │
                                   ↓
                                ML Model

         ───────────────────────────────────────────────────
              END-TO-END AI / ML INFERENCE ARCHITECTURE
         ───────────────────────────────────────────────────
                                Website
                                   │
                                   ↓
                              Node.js API
                                   │
                                   ↓
                            Python AI API
                                   │
                                   ↓
                            Preprocessing
                                   │
                                   ↓
                            ML Prediction
                                   │
                        ┌──────────┼──────────┐
                        ↓          ↓          ↓
                      Fat       Protein     Other
                    Prediction  Prediction  Parameters`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(asciiText).then(() => {
        const btn = document.getElementById('btn-copy-ascii');
        if (btn) {
          btn.innerText = '✓ Copied!';
          setTimeout(() => { btn.innerText = '📋 Copy Diagram'; }, 2000);
        }
      }).catch(() => {
        alert('Copied to clipboard!');
      });
    } else {
      alert('Diagram copied!');
    }
  }

  setupActionButtons() {
    const scanBtn = document.getElementById('btn-run-scan');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        this.runLiveIntakeScan();
      });
    }

    const commitBtn = document.getElementById('btn-commit-intake');
    if (commitBtn) {
      commitBtn.addEventListener('click', () => {
        this.commitIntakeToCloud();
      });
    }

    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.db.exportCSV();
        this.showToast("Exported Collection Records to CSV", "success");
      });
    }

    const resetBtn = document.getElementById('btn-reset-db');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Reset database to initial sample records?")) {
          window.db.resetDefaults();
          this.populateFarmerSelectors();
          this.renderRfidCardsDeck();
          this.activeFarmer = window.db.getFarmers()[0];
          this.updateActiveFarmerDisplay();
          this.refreshPassbook();
          this.refreshAdminDashboard();
          this.showToast("Database restored to defaults", "info");
        }
      });
    }

    const mobileToggleBtn = document.getElementById('btn-toggle-mobile-view');
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', () => {
        this.isMobileView = !this.isMobileView;
        const wrapper = document.getElementById('mobile-simulator-container');
        if (wrapper) {
          wrapper.style.display = this.isMobileView ? 'block' : 'none';
        }
        mobileToggleBtn.innerText = this.isMobileView ? "Hide Mobile View" : "Simulate Mobile App";
        if (this.isMobileView) {
          this.renderMobilePassbookPreview();
          wrapper.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    const traceBtn = document.getElementById('btn-search-trace');
    const traceInput = document.getElementById('trace-input-code');
    if (traceBtn && traceInput) {
      const doSearch = () => {
        const code = traceInput.value.trim();
        if (!code) {
          this.showToast("Please enter a valid Batch or Record ID", "warning");
          return;
        }
        this.performTraceLookup(code);
      };
      traceBtn.addEventListener('click', doSearch);
      traceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
      });
    }

    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeGradeFilter = pill.dataset.filter;
        this.refreshPassbook();
      });
    });
  }

  runLiveIntakeScan(options = { autoRedirectToPassbook: true }) {
    const scanBtn = document.getElementById('btn-run-scan');
    const laser = document.getElementById('tank-scan-laser');
    const diagBanner = document.getElementById('sensor-diagnostic-banner');

    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `
        <div class="diag-spinner" style="width: 15px; height: 15px; border-width: 2px;"></div>
        Checking Milk Quality...
      `;
    }

    if (laser) laser.classList.add('scanning-active');
    if (window.soundCtrl) window.soundCtrl.playScanSweep();

    // Multi-phase diagnostics
    const steps = [
      { text: "Optical NIR Spectrometry: Measuring Fat % and Solid-Not-Fat (SNF)...", icon: "🔬" },
      { text: "Richmond Formula & Ultrasonic Probe: Checking Milk Density and Volume...", icon: "⚖️" },
      { text: "Conductance Probe: Screening for Added Water Dilution & Chemical Adulterants...", icon: "🛡️" },
      { text: "pH & Thermal Sensors: Evaluating Acidity, Freshness & Computing Purity Score...", icon: "🌡️" },
      { text: "Automatic Grading Engine: Applying Cooperative Standards & Awarding Official Grade...", icon: "🏆" }
    ];

    let stepIdx = 0;
    if (diagBanner) {
      diagBanner.style.display = 'flex';
      diagBanner.innerHTML = `
        <div class="diag-step-indicator">
          <div class="diag-spinner"></div>
          <div>
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">LIVE SENSOR PROBE (PHASE 1 OF 5)</span>
            <div style="color: var(--primary-light); font-weight: 700; font-size: 0.92rem;">
              ${steps[0].icon} ${steps[0].text}
            </div>
          </div>
        </div>
      `;
    }

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        if (window.soundCtrl) window.soundCtrl.playTick();
        if (diagBanner) {
          diagBanner.innerHTML = `
            <div class="diag-step-indicator">
              <div class="diag-spinner"></div>
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">LIVE SENSOR PROBE (PHASE ${stepIdx + 1} OF 5)</span>
                <div style="color: var(--primary-light); font-weight: 700; font-size: 0.92rem;">
                  ${steps[stepIdx].icon} ${steps[stepIdx].text}
                </div>
              </div>
            </div>
          `;
        }
      } else {
        clearInterval(interval);

        const s = window.sensorEngine.state;
        const farmer = this.activeFarmer || window.db.getFarmers()[0];
        window.sensorEngine.recalculateDerivedParameters();
        this.updateLiveSensorUI();

        if (laser) laser.classList.remove('scanning-active');

        if (scanBtn) {
          scanBtn.disabled = false;
          scanBtn.innerHTML = `
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Check Milk Quality &amp; Auto-Grade
          `;
        }

        const classification = s.classification;
        const pricing = window.pricingEngine.calculatePricing(s, farmer);
        const weightKg = (s.netWeightKg || (s.volume * s.density)).toFixed(2);
        const densityKgL = s.density.toFixed(3);
        const liters = s.volume.toFixed(2);

        // 2. Automatically commit intake to cloud database
        this.commitIntakeToCloud();

        if (classification.code === "GRADE A+") {
          if (window.soundCtrl) window.soundCtrl.playSuccessChime();
          this.showToast(`🌟 Quality Certified: ${classification.code}! Volume: ${liters} L • Net Payout: ₹${pricing.totalPayout.toFixed(2)}`, "success");
        } else if (classification.code === "GRADE F") {
          if (window.soundCtrl) window.soundCtrl.playHazardAlarm();
          this.showToast(`🚨 ALERT: Contaminated Sample! Confiscated under Grade F rules.`, "danger");
        } else {
          if (window.soundCtrl) window.soundCtrl.playTick();
          this.showToast(`Quality Measured: ${classification.code} • ${liters} Liters Calculated`, "info");
        }

        if (diagBanner) {
          diagBanner.innerHTML = `
            <div class="diag-step-indicator" style="flex-direction: column; align-items: flex-start; gap: 8px; width: 100%;">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4rem;">🥛</span>
                  <div>
                    <span style="font-size: 0.72rem; color: #10b981; text-transform: uppercase; font-weight: 800; font-family: var(--font-mono);">
                      STEP 1: QUALITY COMPLETE &bull; STEP 2: VOLUME CALCULATED
                    </span>
                    <div style="color: #ffffff; font-weight: 800; font-size: 1.05rem;">
                      Milk Volume: <span class="highlight-cyan" style="font-size: 1.25rem;">${liters} Liters</span> 
                      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">
                        (${weightKg} kg &divide; ${densityKgL} kg/L)
                      </span>
                    </div>
                  </div>
                </div>
                <span class="badge badge-success" style="font-size: 0.85rem; padding: 4px 12px;">
                  ${classification.code} &bull; ₹${pricing.netRatePerLitre.toFixed(2)}/L
                </span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; font-size: 0.85rem; flex-wrap: wrap; gap: 6px;">
                <span style="color: var(--text-muted);">
                  Total Payout: <strong style="color: #10b981; font-size: 1.05rem;">₹${pricing.totalPayout.toFixed(2)}</strong> (${liters} L &times; ₹${pricing.netRatePerLitre.toFixed(2)}/L)
                </span>
                <span style="color: #38bdf8; font-weight: 700; font-size: 0.82rem; display: flex; align-items: center; gap: 6px;">
                  <span class="live-dot" style="background: #38bdf8;"></span>
                  Transferring to Farmer's Details in 2s...
                </span>
              </div>
            </div>
          `;
        }

        // Populate & Display Calculation Modal
        const calcModal = document.getElementById('modal-volume-calculation');
        if (calcModal) {
          const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
          };
          setVal('calc-modal-farmer-name', farmer.name);
          setVal('calc-modal-farmer-id', farmer.id);
          setVal('calc-modal-mass', `${weightKg} kg`);
          setVal('calc-modal-density', `${densityKgL} kg/L`);
          setVal('calc-modal-liters', `${liters} LITERS`);
          setVal('calc-modal-grade', pricing.grade);
          setVal('calc-modal-rate', `₹${pricing.netRatePerLitre.toFixed(2)} / L`);
          setVal('calc-modal-total', `₹${pricing.totalPayout.toFixed(2)}`);

          calcModal.classList.add('modal-open');

          // Countdown to Farmer Details
          let remaining = 2;
          const countdownEl = document.getElementById('calc-modal-countdown');
          if (countdownEl) countdownEl.innerText = remaining;

          if (this.calcRedirectTimer) clearInterval(this.calcRedirectTimer);
          this.calcRedirectTimer = setInterval(() => {
            remaining--;
            if (countdownEl) countdownEl.innerText = remaining;
            if (remaining <= 0) {
              clearInterval(this.calcRedirectTimer);
              this.calcRedirectTimer = null;
              this.proceedToFarmerDetailsFromModal();
            }
          }, 1000);
        }
      }
    }, 280);
  }

  commitIntakeToCloud() {
    const s = window.sensorEngine.state;
    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    const pricing = window.pricingEngine.calculatePricing(s, farmer);

    const now = new Date();
    const hours = now.getHours();
    const shift = hours >= 14 ? 'Evening' : 'Morning';
    const recNum = Math.floor(1000 + Math.random() * 9000);
    const recId = `REC-${recNum}`;
    const batchId = `BATCH-DD-${now.getFullYear()}-${recNum}`;

    const newRecord = {
      id: recId,
      batchId: batchId,
      farmerId: farmer.id,
      farmerName: farmer.name,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      date: now.toISOString().split('T')[0],
      shift: shift,
      milkType: s.sampleType || farmer.cattleType,
      volume: s.volume,
      fat: s.fat,
      snf: s.snf,
      density: s.density,
      protein: s.protein,
      lactose: s.lactose,
      waterAdded: s.waterAdded,
      pH: s.ph,
      temperature: s.temperature,
      purityScore: s.purityScore,
      grade: pricing.grade,
      adulterantsDetected: [...s.adulterants],
      status: pricing.status,
      ratePerLitre: pricing.netRatePerLitre,
      totalPayout: pricing.totalPayout
    };

    window.db.saveRecord(newRecord);
    if (window.soundCtrl) window.soundCtrl.playPrintReceipt();

    this.showToast(`✅ ${pricing.grade} Milk Sourced from ${farmer.name}! Net Payout: ₹${pricing.totalPayout.toFixed(2)} credited.`, "success");

    this.renderActiveReceipt(newRecord);
    this.refreshPassbook();
    this.renderMobilePassbookPreview();
    this.refreshAdminDashboard();
  }

  refreshPricingPreview() {
    const s = window.sensorEngine.state;
    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    const pricing = window.pricingEngine.calculatePricing(s, farmer);

    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('pricing-preview-base', `₹${pricing.baseRate.toFixed(2)}/L`);
    setInner('pricing-preview-fat-adj', `${pricing.fatDiff > 0 ? '+' : ''}₹${pricing.fatAdjustment.toFixed(2)}`);
    setInner('pricing-preview-snf-adj', `${pricing.snfDiff > 0 ? '+' : ''}₹${pricing.snfAdjustment.toFixed(2)}`);

    const qualityAdjText = pricing.qualityBonusOrDeduction > 0
      ? `+₹${pricing.qualityBonusOrDeduction.toFixed(2)} (${pricing.grade})`
      : pricing.qualityBonusOrDeduction < 0
        ? `-₹${Math.abs(pricing.qualityBonusOrDeduction).toFixed(2)} (${pricing.grade})`
        : `₹0.00 (Standard)`;
    setInner('pricing-preview-quality-tier', qualityAdjText);
    const qualityAdjEl = document.getElementById('pricing-preview-quality-tier');
    if (qualityAdjEl) {
      qualityAdjEl.style.color = pricing.qualityBonusOrDeduction > 0 ? '#10b981' : pricing.qualityBonusOrDeduction < 0 ? '#f59e0b' : '#cbd5e1';
    }

    setInner('pricing-preview-water-ded', `-₹${pricing.waterPenalty.toFixed(2)}`);
    setInner('pricing-preview-net-rate', `₹${pricing.netRatePerLitre.toFixed(2)}/L`);
    setInner('pricing-preview-total', `₹${pricing.totalPayout.toFixed(2)}`);

    const statusBadge = document.getElementById('pricing-preview-status');
    if (statusBadge) {
      statusBadge.className = `badge ${pricing.badgeClass}`;
      statusBadge.innerText = `${pricing.status} (${pricing.grade})`;
    }

    const receiptContainer = document.getElementById('live-receipt-placeholder');
    if (receiptContainer) {
      const tempRecord = {
        id: "REC-PREVIEW",
        batchId: "BATCH-DD-LIVE",
        farmerId: farmer.id,
        farmerName: farmer.name,
        date: new Date().toISOString().split('T')[0],
        shift: new Date().getHours() >= 14 ? 'Evening' : 'Morning',
        milkType: s.sampleType || farmer.cattleType,
        volume: s.volume,
        fat: s.fat,
        snf: s.snf,
        density: s.density,
        protein: s.protein,
        waterAdded: s.waterAdded,
        pH: s.ph,
        purityScore: s.purityScore,
        grade: pricing.grade,
        adulterantsDetected: s.adulterants,
        status: pricing.status,
        ratePerLitre: pricing.netRatePerLitre,
        totalPayout: pricing.totalPayout
      };
      receiptContainer.innerHTML = window.pricingEngine.renderReceiptHTML(tempRecord);
    }
  }

  renderActiveReceipt(record) {
    const container = document.getElementById('live-receipt-placeholder');
    if (container) {
      container.innerHTML = window.pricingEngine.renderReceiptHTML(record);
    }
  }

  refreshPassbook() {
    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    const records = window.db.getRecordsByFarmer(farmer.id, this.activeGradeFilter);

    const tbody = document.getElementById('passbook-records-body');
    if (tbody) {
      if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-dim);">No collection records matching filter for ${farmer.name}.</td></tr>`;
      } else {
        tbody.innerHTML = records.map(r => {
          const fatColor = r.fat >= 4.5 ? '#a855f7' : r.fat >= 3.8 ? '#10b981' : r.fat >= 3.2 ? '#38bdf8' : r.fat >= 2.6 ? '#f59e0b' : '#ef4444';
          const snfColor = r.snf >= 9.0 ? '#a855f7' : r.snf >= 8.5 ? '#10b981' : r.snf >= 8.0 ? '#38bdf8' : '#ef4444';
          const waterColor = r.waterAdded === 0 ? '#10b981' : '#ef4444';
          const purityColor = r.purityScore >= 95 ? '#10b981' : r.purityScore >= 85 ? '#38bdf8' : r.purityScore >= 70 ? '#f59e0b' : '#ef4444';

          return `
            <tr>
              <td><strong>${r.id}</strong></td>
              <td>${r.date} <span style="font-size:0.75rem; color:var(--text-muted);">(${r.shift})</span></td>
              <td>${r.volume.toFixed(1)} L</td>
              <td>
                <span style="color: ${fatColor}; font-weight: 700;">
                  ${r.fat.toFixed(2)}%
                </span>
              </td>
              <td>
                <span style="color: ${snfColor}; font-weight: 700;">
                  ${r.snf.toFixed(2)}%
                </span>
              </td>
              <td>
                <span style="color: ${waterColor}; font-weight: 700;">
                  ${r.waterAdded > 0 ? `+${r.waterAdded}% ⚠️` : '0% Pure'}
                </span>
              </td>
              <td>
                <span class="badge" style="color: ${purityColor}; background: rgba(255,255,255,0.06); border: 1px solid ${purityColor}44; font-weight: 700;">
                  ${r.purityScore.toFixed(0)}%
                </span>
              </td>
              <td>
                <span class="badge ${r.grade === 'GRADE A+' ? 'badge-success' : r.grade === 'GRADE A' ? 'badge-primary' : r.grade === 'GRADE F' ? 'badge-danger' : 'badge-warning'}">
                  ${r.grade || 'GRADE A'}
                </span>
              </td>
              <td>₹${r.ratePerLitre.toFixed(2)}</td>
              <td><strong style="color: var(--primary-light);">₹${r.totalPayout.toFixed(2)}</strong></td>
            </tr>
          `;
        }).join('');
      }
    }

    const allFarmerRecords = window.db.getRecordsByFarmer(farmer.id);
    const totalMilk = allFarmerRecords.reduce((acc, r) => acc + r.volume, 0);
    const totalEarnings = allFarmerRecords.reduce((acc, r) => acc + r.totalPayout, 0);
    const avgFat = allFarmerRecords.length ? (allFarmerRecords.reduce((acc, r) => acc + r.fat, 0) / allFarmerRecords.length) : 0;
    const gradeAPlusCount = allFarmerRecords.filter(r => r.grade === 'GRADE A+').length;

    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('passbook-stat-milk', `${totalMilk.toFixed(1)} L`);
    setInner('passbook-stat-earnings', `₹${totalEarnings.toFixed(2)}`);
    setInner('passbook-stat-fat', `${avgFat.toFixed(2)}%`);
    setInner('passbook-stat-bonus', `${gradeAPlusCount} Batches`);

    // Update Welcome, Farmer Dashboard Card
    setInner('farmer-welcome-name', farmer.name);
    setInner('farmer-welcome-id', farmer.id);
    setInner('farmer-welcome-avatar', farmer.cattleType === 'Buffalo' ? '🐃' : '🐄');
    setInner('farmer-welcome-village', farmer.village);
    setInner('farmer-metric-supply', '25.4 L');
    setInner('farmer-metric-quality', '92/100 🟢');
    setInner('farmer-metric-fat', '4.20%');
    setInner('farmer-metric-protein', '3.40%');
    setInner('farmer-metric-rate', '₹49/L');
    setInner('farmer-metric-payment', '₹1,244.60');

    window.chartManager.renderTrendChart('farmer-trend-chart-container', allFarmerRecords);
  }

  renderMobilePassbookPreview() {
    const container = document.getElementById('mobile-screen-content');
    if (!container) return;

    const farmer = this.activeFarmer || window.db.getFarmers()[0];
    const records = window.db.getRecordsByFarmer(farmer.id);
    const latest = records[0] || {};
    const totalEarnings = records.reduce((acc, r) => acc + r.totalPayout, 0);
    const totalMilk = records.reduce((acc, r) => acc + r.volume, 0);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">DAIRY NOVA FARMER APP</div>
          <div style="font-size: 1.15rem; font-weight: 800;">${farmer.name}</div>
        </div>
        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
          ${farmer.avatar}
        </div>
      </div>

      <!-- Mobile Welcome Summary -->
      <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 0.85rem; margin-bottom: 1rem;">
        <div style="font-size: 0.72rem; font-weight: 800; color: #10b981; letter-spacing: 1px;">WELCOME, FARMER</div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
          <span style="font-size: 0.82rem; color: var(--text-muted);">Today's Supply: <strong style="color: #ffffff;">25.4 L</strong></span>
          <span style="font-size: 0.82rem; color: #10b981; font-weight: 700;">92/100 🟢</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); margin-top: 3px;">
          <span>Fat: 4.20% &bull; Protein: 3.40%</span>
          <span>Rate: ₹49/L</span>
        </div>
        <div style="border-top: 1px solid rgba(16, 185, 129, 0.3); margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Today's Payment:</span>
          <span style="font-size: 1.1rem; font-weight: 800; color: #10b981; font-family: var(--font-mono);">₹1,244.60</span>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #0284c7, #0369a1); border-radius: 18px; padding: 1.25rem; color: #ffffff; margin-bottom: 1.25rem; box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);">
        <div style="font-size: 0.75rem; opacity: 0.85;">Total Cloud Earnings (7 Days)</div>
        <div style="font-size: 1.9rem; font-weight: 800; font-family: var(--font-mono); margin: 4px 0 8px;">₹${totalEarnings.toFixed(2)}</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
          <span>Sourced: <strong>${totalMilk.toFixed(1)} L</strong></span>
          <span>Status: <strong>Direct DBT Linked</strong></span>
        </div>
      </div>

      <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); border-radius: 16px; padding: 1rem; margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 0.85rem;">Latest Intake Test</strong>
          <span class="badge ${latest.grade === 'GRADE A+' ? 'badge-success' : 'badge-primary'}">${latest.grade || 'GRADE A'}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center;">
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
            <div style="font-size: 0.65rem; color: var(--text-dim);">FAT</div>
            <div style="font-weight: 700; font-family: var(--font-mono); font-size: 0.9rem;">${latest.fat || 0}%</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
            <div style="font-size: 0.65rem; color: var(--text-dim);">SNF</div>
            <div style="font-weight: 700; font-family: var(--font-mono); font-size: 0.9rem;">${latest.snf || 0}%</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
            <div style="font-size: 0.65rem; color: var(--text-dim);">PAYOUT</div>
            <div style="font-weight: 700; font-family: var(--font-mono); font-size: 0.9rem; color: var(--primary-light);">₹${(latest.totalPayout || 0).toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.5rem;">⭐</span>
        <div>
          <strong style="font-size: 0.82rem; color: var(--success-light); display: block;">${farmer.loyaltyTier}</strong>
          <span style="font-size: 0.72rem; color: var(--text-muted);">Supplying pure unadulterated milk unlocks +12% price bonus on every drop.</span>
        </div>
      </div>

      <!-- Mobile Supply History Table -->
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 0.85rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.78rem; color: #ffffff; letter-spacing: 0.5px;">SUPPLY &amp; RATE HISTORY</strong>
          <span style="font-size: 0.68rem; color: #10b981; font-family: var(--font-mono);">02/09 – 04/09</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.73rem;">
          <div style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1fr; color: var(--text-dim); padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 700; text-transform: uppercase;">
            <span>Date</span><span>Qty</span><span>Fat</span><span>Score</span><span style="text-align: right;">Rate</span>
          </div>
          <div style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1fr; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); color: #ffffff; font-weight: 600;">
            <span style="color: #38bdf8;">04/09</span><span>25.4L</span><span style="color: #facc15;">4.2%</span><span style="color: #10b981;">92</span><span style="text-align: right; color: #10b981;">₹49</span>
          </div>
          <div style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1fr; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); color: #ffffff; font-weight: 600;">
            <span style="color: #38bdf8;">03/09</span><span>23.8L</span><span style="color: #facc15;">4.0%</span><span style="color: #10b981;">88</span><span style="text-align: right; color: #10b981;">₹47</span>
          </div>
          <div style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1fr; padding: 5px 0; color: #ffffff; font-weight: 600;">
            <span style="color: #38bdf8;">02/09</span><span>26.1L</span><span style="color: #facc15;">4.3%</span><span style="color: #10b981;">94</span><span style="text-align: right; color: #10b981;">₹50</span>
          </div>
        </div>
      </div>

      <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
        Recent Digital Slips:
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${records.slice(0, 3).map(r => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 10px; border-radius: 10px; font-size: 0.8rem;">
            <div>
              <div style="font-weight: 600;">${r.date} (${r.shift})</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">${r.volume}L &bull; Fat: ${r.fat}%</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: var(--primary-light);">₹${r.totalPayout.toFixed(2)}</div>
              <span class="badge ${r.grade === 'GRADE A+' ? 'badge-success' : 'badge-primary'}" style="font-size: 0.65rem; padding: 1px 5px;">${r.grade}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  setupQualityRulesView() {
    const rules = window.db.getQualityRules();
    const container = document.getElementById('quality-rules-grid');
    if (!container) return;

    container.innerHTML = rules.map(rule => `
      <div class="tier-card ${rule.grade === 'GRADE A+' ? 'highlight' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge ${rule.badgeClass}">${rule.grade}</span>
          <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-dim);">Purity: &ge;${rule.purityMin}%</span>
        </div>
        <h4 style="margin: 0.5rem 0 0.25rem; font-size: 1.1rem; color: ${rule.color};">${rule.label}</h4>
        <div class="tier-rate-badge" style="background: rgba(255,255,255,0.08); color: ${rule.color};">
          Pricing Impact: <strong>${rule.bonusPct}</strong>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.5;">
          ${rule.description}
        </p>
      </div>
    `).join('');
  }

  clearAllAdminData() {
    if (confirm("Are you sure you want to clear all intake records and data in the Admin page?")) {
      window.db.clearRecords();
      this.refreshAdminDashboard();
      this.refreshPassbook();
      if (window.soundCtrl) window.soundCtrl.playTrash();
      this.showToast("All intake records have been cleared from Admin page.", "info");
    }
  }

  refreshAdminDashboard() {
    const records = window.db.getRecords() || [];
    const farmers = window.db.getFarmers() || [];

    const totalLitres = records.reduce((acc, r) => acc + (r.volume || 0), 0);
    const totalPayout = records.reduce((acc, r) => acc + (r.totalPayout || 0), 0);
    const premiumLitres = records.filter(r => r.grade === 'GRADE A+').reduce((acc, r) => acc + (r.volume || 0), 0);
    const avgQuality = records.length ? Math.round(records.reduce((acc, r) => acc + (r.purityScore || 0), 0) / records.length) : 0;
    const adulterationCount = records.filter(r => r.status === 'REJECTED' || r.status === 'PENALIZED' || (r.adulterantsDetected && r.adulterantsDetected.length > 0)).length;

    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('admin-total-farmers', farmers.length ? farmers.length.toLocaleString() : '0');
    setInner('admin-stat-volume', records.length ? `${totalLitres.toFixed(1)} L` : '0.0 L');
    setInner('admin-premium-milk', records.length ? `${premiumLitres.toFixed(1)} L` : '0.0 L');
    setInner('admin-avg-quality', records.length ? `${avgQuality}/100` : '--');
    setInner('admin-stat-adulterations', adulterationCount.toString());
    setInner('admin-stat-payout', `₹${totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    const asciiPre = document.querySelector('.smart-admin-ascii-pre');
    if (asciiPre) {
      asciiPre.innerText = `SMART MILK ADMIN\n\nTotal Farmers       ${farmers.length}\nToday's Collection  ${records.length ? totalLitres.toFixed(1) + ' L' : '0.0 L'}\nPremium Milk        ${records.length ? premiumLitres.toFixed(1) + ' L' : '0.0 L'}\nAverage Quality     ${records.length ? avgQuality + '/100' : '--'}\nSuspicious Samples  ${adulterationCount}\nToday's Payments    ₹${totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    window.chartManager.renderTrendChart('admin-trend-chart-container', records);
    window.chartManager.renderVolumeBars('admin-volume-bar-container', records);

    const recentBody = document.getElementById('admin-recent-intakes-body');
    if (recentBody) {
      if (!records || records.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">No intake records found. New milk tests performed will appear here.</td></tr>`;
      } else {
        recentBody.innerHTML = records.slice(0, 5).map(r => `
          <tr>
            <td><strong>${r.batchId || r.id}</strong></td>
            <td>${r.farmerName}</td>
            <td>${r.milkType}</td>
            <td>${(r.volume || 0).toFixed(1)} L</td>
            <td>${(r.fat || 0).toFixed(1)}% / ${(r.snf || 0).toFixed(1)}%</td>
            <td>
              <span class="badge ${r.grade === 'GRADE A+' ? 'badge-success' : r.grade === 'GRADE A' ? 'badge-primary' : r.grade === 'GRADE F' ? 'badge-danger' : 'badge-warning'}">
                ${r.grade || r.status}
              </span>
            </td>
            <td>₹${(r.totalPayout || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      }
    }

    const farmersBody = document.getElementById('admin-farmers-table-body');
    if (farmersBody) {
      farmersBody.innerHTML = farmers.map(f => {
        const parts = (f.village || '').split(',');
        const villageName = f.villageOnly || (parts.length > 0 ? parts[0].trim() : 'Local Village');
        const districtName = f.district || (parts.length > 1 ? parts[1].trim() : 'District');
        const milkTypeLabel = f.milkType || (f.cattleType === 'Buffalo' ? 'Buffalo Milk' : 'Cow Milk');

        return `
          <tr>
            <td><strong style="font-family: var(--font-mono); color: var(--primary-light);">${f.id}</strong></td>
            <td><strong>${f.name}</strong></td>
            <td><span style="font-family: var(--font-mono); font-size: 0.82rem;">${f.phone || 'N/A'}</span></td>
            <td>${villageName}</td>
            <td>${districtName}</td>
            <td>
              <span class="badge ${f.cattleType === 'Buffalo' ? 'badge-primary' : 'badge-success'}">
                ${f.cattleType === 'Buffalo' ? '🐃' : '🐄'} ${milkTypeLabel}
              </span>
            </td>
            <td><code style="color: var(--success-light);">${f.bankAccount || 'Direct DBT'}</code></td>
            <td><span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim);">${f.rfid}</span></td>
            <td>
              <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 3px 8px;" onclick="window.app.scanFarmerRFID('${f.id}'); window.app.switchSection('passbook');">
                Passbook
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  performTraceLookup(code) {
    const record = window.db.getBatchDetails(code);
    const resultBox = document.getElementById('trace-result-card');
    if (!resultBox) return;

    if (!record) {
      if (window.soundCtrl) window.soundCtrl.playHazardAlarm();
      resultBox.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #ef4444;">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 1rem;"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/></svg>
          <h3>Batch "${code}" Not Found</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
            No matching certified records in the Dairy Nova Cloud Network. Please verify the batch number on your pouch.
          </p>
        </div>
      `;
      return;
    }

    if (window.soundCtrl) window.soundCtrl.playSuccessChime();
    const isPurityPass = record.purityScore >= 85;

    resultBox.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-glass); padding-bottom: 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="badge ${isPurityPass ? 'badge-success' : 'badge-warning'}">
              ${isPurityPass ? 'VERIFIED PURE MILK' : 'FLAGGED DILUTION'}
            </span>
            <span class="badge badge-primary">${record.grade || 'GRADE A'}</span>
          </div>
          <h2 style="margin-top: 0.5rem; font-size: 1.75rem;">${record.batchId || record.id}</h2>
          <div style="color: var(--text-muted); font-size: 0.88rem;">Tested on ${record.timestamp} via Smart IoT Station</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Certified Quality Score</div>
          <div style="font-size: 2.4rem; font-weight: 800; font-family: var(--font-mono); color: ${isPurityPass ? '#10b981' : '#f59e0b'};">
            ${record.purityScore.toFixed(1)}%
          </div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 2rem;">
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">SOURCE ORIGIN</div>
          <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${record.farmerName}</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">${record.milkType} Milk &bull; ID: ${record.farmerId}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">COMPOSITION</div>
          <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">Fat: ${record.fat}% &bull; SNF: ${record.snf}%</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">Density: ${record.density} g/ml &bull; pH ${record.pH}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">PURITY &amp; ADULTERATION</div>
          <div style="font-size: 1.1rem; font-weight: 700; margin-top: 4px; color: ${record.waterAdded === 0 ? '#10b981' : '#ef4444'};">
            ${record.waterAdded === 0 ? '0% Added Water' : `+${record.waterAdded}% Diluted`}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">${record.adulterantsDetected.length === 0 ? 'Zero Synthetic Chemicals' : record.adulterantsDetected.join(', ')}</div>
        </div>
      </div>

      <h4 style="font-size: 1.1rem; margin-bottom: 1rem;">Farm-to-Pack Cloud Audit Trail</h4>
      <div class="timeline-track">
        <div class="timeline-step done">
          <strong>1. Milked &amp; Sourced at Farm</strong>
          <div style="font-size: 0.82rem; color: var(--text-muted);">${record.farmerName}, Cattle Breed: Indigenous Gir / Murrah (${record.date} ${record.shift})</div>
        </div>
        <div class="timeline-step done">
          <strong>2. Automated Smart Sensor Inspection</strong>
          <div style="font-size: 0.82rem; color: var(--text-muted);">Raspberry Pi 5 Hub &amp; ADS1115 16-Bit Array tested ${record.volume.toFixed(1)}L. Assigned ${record.grade || 'GRADE A'}.</div>
        </div>
        <div class="timeline-step done">
          <strong>3. Quality-Based Pricing &amp; Instant Bank Credit</strong>
          <div style="font-size: 0.82rem; color: var(--text-muted);">Transparent rate ₹${record.ratePerLitre.toFixed(2)}/L paid directly to ${record.farmerName}.</div>
        </div>
        <div class="timeline-step done">
          <strong>4. Cold-Chain Chilling &amp; Sealed Packaging</strong>
          <div style="font-size: 0.82rem; color: var(--text-muted);">Maintained at 4°C. Cryptographically stamped with Batch ID ${record.batchId || record.id}.</div>
        </div>
      </div>
    `;
  }

  printReceiptSlip() {
    if (window.soundCtrl) window.soundCtrl.playPrintReceipt();
    window.print();
  }

  copyReceiptSummary() {
    const farmer = document.getElementById('receipt-farmer-val')?.innerText || 'FMR-2026-00125';
    const qty = document.getElementById('receipt-qty-val')?.innerText || '25.4 L';
    const quality = document.getElementById('receipt-quality-val')?.innerText || '92/100';
    const grade = document.getElementById('receipt-grade-val')?.innerText || 'PREMIUM';
    const rate = document.getElementById('receipt-rate-val')?.innerText || '₹49/L';
    const total = document.getElementById('receipt-total-val')?.innerText || '₹1,244.60';
    const status = document.getElementById('receipt-status-val')?.innerText || 'PAID';

    const text = `              PAYMENT RECEIPT\n\nFarmer: ${farmer}\n\nQuantity:       ${qty}\nQuality:        ${quality}\nGrade:          ${grade}\nRate:           ${rate}\n\nTOTAL:          ${total}\n\nStatus:         ${status}`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ Payment receipt copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Payment receipt text ready: ' + text, 'info');
    });
  }

  simulateAtlasPing() {
    const latency = Math.floor(Math.random() * 8) + 12;
    const connEl = document.getElementById('atlas-conn-status');
    if (connEl) {
      connEl.innerHTML = `mongodb+srv://cluster0.dairynova.mongodb.net (<span style="color: #10b981;">Connected &bull; ${latency}ms latency &bull; Primary M10 Replica</span>)`;
    }
    if (window.soundCtrl) window.soundCtrl.playSuccess();
    this.showToast(`⚡ MongoDB Atlas Cluster Ping: ${latency}ms (Connected: AWS Mumbai ap-south-1)`, 'success');
  }

  simulateApiCall() {
    this.dispatchMilkTestPayload();
  }

  dispatchMilkTestPayload() {
    const btn = document.getElementById('btn-test-api');
    if (btn) btn.innerText = '📡 Dispatching...';
    if (window.soundCtrl) window.soundCtrl.playBeep();

    const payload = {
      farmerId: "FMR-2026-00125",
      quantity: 25.4,
      temperature: 6.8,
      fat: 4.2,
      protein: 3.4,
      lactose: 4.65,
      density: 1.03
    };

    setTimeout(() => {
      if (btn) btn.innerText = '📡 Test POST /api/v1/milk-test';
      if (window.soundCtrl) window.soundCtrl.playScanSuccess();

      // Synchronize Sensor Engine with exact JSON payload values
      if (window.sensorEngine) {
        window.sensorEngine.state.volume = payload.quantity;
        window.sensorEngine.state.temperature = payload.temperature;
        window.sensorEngine.state.fat = payload.fat;
        window.sensorEngine.state.protein = payload.protein;
        window.sensorEngine.state.lactose = payload.lactose;
        window.sensorEngine.state.density = payload.density;
        window.sensorEngine.state.purityScore = 92.0;
        window.sensorEngine.recalculateDerivedParameters();
      }

      this.showToast(`✅ Node.js / Express API 201 Created: POST /api/v1/milk-test &bull; Payload persisted to MongoDB Atlas: Farmer ${payload.farmerId}, ${payload.quantity}L, ${payload.fat}% Fat &bull; Payout ₹1,244.60`, 'success');
    }, 400);
  }

  copyMilkTestJsonPayload() {
    const payload = JSON.stringify({
      farmerId: "FMR-2026-00125",
      quantity: 25.4,
      temperature: 6.8,
      fat: 4.2,
      protein: 3.4,
      lactose: 4.65,
      density: 1.03
    }, null, 2);
    navigator.clipboard.writeText(payload).then(() => {
      this.showToast('✅ JSON intake telemetry payload copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('JSON payload ready: ' + payload, 'info');
    });
  }

  simulateAiPipelinePing() {
    const btn = document.getElementById('btn-ping-ai-pipeline');
    if (btn) btn.innerText = '⚡ Benchmarking...';
    if (window.soundCtrl) window.soundCtrl.playBeep();

    setTimeout(() => {
      if (btn) btn.innerText = '⚡ Benchmark Pipeline (8ms)';
      if (window.soundCtrl) window.soundCtrl.playSuccess();
      this.showToast(`🚀 Inference Pipeline Benchmark: Node.js &rarr; Python FastAPI &rarr; ML Model: 7.8ms (R² = 0.992, RMSEP = 0.048%, 94% Confidence)`, 'success');
    }, 400);
  }

  toggleAdminAsciiView() {
    const el = document.getElementById('smart-admin-ascii-box');
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    if (window.soundCtrl) window.soundCtrl.playTick();
  }

  copySmartAdminAscii() {
    const text = `SMART MILK ADMIN\n\nTotal Farmers       1,245\nToday's Collection  8,420 L\nPremium Milk        4,250 L\nAverage Quality     86/100\nSuspicious Samples  38\nToday's Payments    ₹3,84,250`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ SMART MILK ADMIN summary copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('SMART MILK ADMIN text ready: ' + text, 'info');
    });
  }

  copyFarmerWelcomeSummary() {
    const text = `WELCOME, FARMER\n\nToday's Supply\n25.4 L\n\nQuality\n92/100 🟢\n\nFat\n4.20%\n\nProtein\n3.40%\n\nRate\n₹49/L\n\nToday's Payment\n₹1,244.60`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ WELCOME, FARMER summary copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('WELCOME, FARMER text ready: ' + text, 'info');
    });
  }

  copySupplyHistoryAscii() {
    const text = `Date       Qty     Fat    Score    Rate\n04/09      25.4L   4.2%   92       ₹49\n03/09      23.8L   4.0%   88       ₹47\n02/09      26.1L   4.3%   94       ₹50`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ 3-Day Supply & Rate History copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Supply History ready: ' + text, 'info');
    });
  }

  copyOperationalHierarchyAscii() {
    const text = `ADMIN\n   ↓\nCollection Center\n   ↓\nFARMER`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ Operational hierarchy (ADMIN ↓ Collection Center ↓ FARMER) copied!', 'success');
    }).catch(() => {
      this.showToast('Hierarchy: ' + text, 'info');
    });
  }

  copyManualTestFlowAscii() {
    const text = `Website\n   ↓\nManual/Test Data`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ Data Ingestion Flow (Website ↓ Manual/Test Data) copied!', 'success');
    }).catch(() => {
      this.showToast('Ingestion Flow: ' + text, 'info');
    });
  }

  copyIotTelemetryFlowAscii() {
    const text = `ADS1115 Sensors\n     ↓\nRaspberry Pi 5\n     ↓\nWi-Fi / 4G\n     ↓\nCloud Ledger\n     ↓\nPortal`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ IoT Telemetry Flow (Sensors ↓ Raspberry Pi 5 ↓ Cloud Ledger ↓ Portal) copied!', 'success');
    }).catch(() => {
      this.showToast('Telemetry flow: ' + text, 'info');
    });
  }

  copyIntakeSettlementPipelineAscii() {
    const text = `                 🥛 MILK SAMPLE\n                       │\n                       ▼\n              ┌─────────────────┐\n              │  QUALITY CHECK  │\n              │                 │\n              │ NIR / Sensors   │\n              │ pH              │\n              │ Temperature     │\n              │ Conductivity    │\n              │ Adulteration    │\n              └────────┬────────┘\n                       │\n                       ▼\n              🧪 QUALITY ANALYSIS\n                       │\n                       ▼\n              ┌─────────────────┐\n              │ QUALITY SCORE   │\n              │     / GRADE     │\n              └────────┬────────┘\n                       │\n              ┌────────┴────────┐\n              ▼                 ▼\n        Quality Grade       Price / Litre\n              │                 │\n              └────────┬────────┘\n                       ▼\n               ⚖️ QUANTITY CHECK\n                       │\n                       ▼\n                 Load Cell\n                       │\n                       ▼\n                  Weight (kg)\n                       │\n                       ▼\n                 Density Based\n                Volume (Litres)\n                       │\n                       ▼\n              💰 TOTAL PAYMENT\n                       │\n                       ▼\n                  ☁️ CLOUD\n                       │\n                       ▼\n              👨‍🌾 FARMER DASHBOARD`;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('✅ E2E Milk Intake & Settlement Pipeline copied!', 'success');
    }).catch(() => {
      this.showToast('Pipeline text ready to copy', 'info');
    });
  }

  pingIotPipeline() {
    const btn = document.getElementById('btn-ping-iot-pipeline');
    if (btn) btn.innerText = '⚡ Pinging Link...';
    if (window.soundCtrl) window.soundCtrl.playBeep();

    const textEl = document.getElementById('iot-status-text');
    if (textEl) textEl.innerText = 'Transmitting packet: ADS1115 Sensors (2ms) → Raspberry Pi 5 I2C (1ms) → Cloud Ledger (5ms) → Portal (2ms)...';

    setTimeout(() => {
      if (btn) btn.innerText = '⚡ Ping Pipeline (10ms)';
      if (textEl) textEl.innerText = 'Packet Delivered: 10ms Total Latency • Raspberry Pi 5 Hub & ADS1115 Synchronized • 0% Packet Loss';
      if (window.soundCtrl) window.soundCtrl.playSuccess();
      this.showToast('🚀 IoT Telemetry Link Ping: 10ms (Sensors → Raspberry Pi 5 → Cloud Ledger → Portal: Synchronized)', 'success');
    }, 450);
  }

  toggleManualTestPanel() {
    const p = document.getElementById('manual-test-flow-panel');
    if (!p) return;
    p.style.display = p.style.display === 'none' ? 'block' : 'none';
    if (window.soundCtrl) window.soundCtrl.playTick();
  }

  loadManualTestPreset(presetKey) {
    if (!window.sensorEngine || !window.sensorEngine.presets) return;
    const p = window.sensorEngine.presets[presetKey];
    if (!p) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('m-input-qty', p.volume !== undefined ? p.volume : 25.4);
    setVal('m-input-fat', p.fat !== undefined ? p.fat.toFixed(2) : 4.20);
    setVal('m-input-protein', p.protein !== undefined ? p.protein.toFixed(2) : (p.snf ? (p.snf * 0.385).toFixed(2) : 3.40));
    setVal('m-input-snf', p.snf !== undefined ? p.snf.toFixed(2) : 8.75);
    setVal('m-input-temp', p.temp !== undefined ? p.temp.toFixed(1) : 6.8);

    let score = 92;
    if (presetKey === 'pureCow') score = 99;
    else if (presetKey === 'pureBuffalo') score = 100;
    else if (presetKey === 'waterDiluted') score = 68;
    else if (presetKey === 'chemicalContaminated') score = 24;
    else if (presetKey === 'souredMilk') score = 48;
    setVal('m-input-score', score);

    if (window.soundCtrl) window.soundCtrl.playBeep();
    this.showToast(`🧪 Loaded Preset: ${p.name}`, 'info');
  }

  applyManualTestData() {
    const getNum = (id, def) => {
      const el = document.getElementById(id);
      return el ? parseFloat(el.value) || def : def;
    };

    const qty = getNum('m-input-qty', 25.4);
    const fat = getNum('m-input-fat', 4.20);
    const protein = getNum('m-input-protein', 3.40);
    const snf = getNum('m-input-snf', 8.75);
    const temp = getNum('m-input-temp', 6.8);
    const score = getNum('m-input-score', 92);

    if (window.sensorEngine) {
      window.sensorEngine.state.volume = qty;
      window.sensorEngine.state.fat = fat;
      window.sensorEngine.state.protein = protein;
      window.sensorEngine.state.snf = snf;
      window.sensorEngine.state.temperature = temp;
      window.sensorEngine.state.purityScore = score;
      window.sensorEngine.recalculateDerivedParameters();
    }

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setText('terminal-farmer-qty', `${qty.toFixed(1)} L`);
    setText('terminal-farmer-temp', `${temp.toFixed(1)} °C`);
    setText('meter-fat-val', `${fat.toFixed(2)} %`);
    setText('meter-protein-val', `${protein.toFixed(2)} %`);
    setText('meter-temp-val', `${temp.toFixed(1)} °C`);
    setText('calc-score-val', `${score.toFixed(0)}`);
    setText('calc-vol-val', `${qty.toFixed(1)} L`);
    setText('receipt-qty-val', `${qty.toFixed(1)} L`);
    setText('receipt-quality-val', `${score.toFixed(0)}/100`);

    const rate = score >= 90 ? 49.00 : (score >= 75 ? 47.00 : (score >= 60 ? 40.00 : 0.00));
    const total = qty * rate;

    setText('calc-rate-val', `₹${rate.toFixed(0)}/L`);
    setText('calc-final-rate-val', `₹${rate.toFixed(0)}/L`);
    setText('calc-total-payment-val', `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    setText('receipt-rate-val', `₹${rate.toFixed(0)}/L`);
    setText('receipt-total-val', `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    if (window.soundCtrl) window.soundCtrl.playScanSuccess();
    this.showToast(`⚡ Manual/Test Data Applied: ${qty}L &bull; ${fat}% Fat &bull; Score ${score} &bull; ₹${rate}/L &bull; Total ₹${total.toFixed(2)}`, 'success');
  }

  copyMilkaiMasterAscii() {
    const ascii = `                    MILKAI
                      │
        ┌─────────────┴─────────────┐
        ↓                           ↓
   FARMER PORTAL              COLLECTION CENTER
        │                           │
        └─────────────┬─────────────┘
                      ↓
               MILK ANALYSIS
                      ↓
                 NIR + IoT
                      ↓
                  AI MODEL
                      ↓
           ┌──────────┼──────────┐
           ↓          ↓          ↓
        FAT %      QUALITY     PURITY
                    SCORE
                      ↓
                🌈 COLOUR
                      ↓
               💰 PRICING
                      ↓
                 ☁️ CLOUD
                      ↓
               📊 ANALYTICS`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ascii).then(() => {
        this.showToast('📋 MILKAI Master Ecosystem Architecture copied to clipboard!', 'success');
        const btn = document.getElementById('btn-copy-ascii');
        if (btn) {
          btn.innerText = '✅ Copied MILKAI!';
          setTimeout(() => { btn.innerText = '📋 Copy MILKAI Diagram'; }, 2500);
        }
      }).catch(() => {
        this.fallbackCopy(ascii, 'MILKAI Master Ecosystem Diagram');
      });
    } else {
      this.fallbackCopy(ascii, 'MILKAI Master Ecosystem Diagram');
    }
  }

  fallbackCopy(text, label) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showToast(`📋 ${label} copied to clipboard!`, 'success');
    } catch (err) {
      this.showToast('Could not copy to clipboard', 'error');
    }
    document.body.removeChild(textArea);
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div style="flex: 1;">${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new DairyNovaApp();
  window.DairyDovaApp = DairyNovaApp;
  window.app.init();

  // Mobile Progressive Web App Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('PWA Service Worker offline caching skipped:', err);
    });
  }
});

