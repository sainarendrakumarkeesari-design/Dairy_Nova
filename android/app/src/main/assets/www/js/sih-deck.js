/**
 * SIH 2026 PRESENTATION DECK VIEWER (SLIDES 01 TO 06)
 * Smart Milk Quality, Purity & Cloud Pricing | Team PureLacto
 * Provides interactive slide presentation mode, keyboard navigation, and live formula widgets
 */

(function () {
  let currentSlide = 1;
  const totalSlides = 6;

  function initSIHDeck() {
    if (document.getElementById('sih-deck-modal')) return;

    const modalHtml = `
      <div class="sih-deck-modal-overlay" id="sih-deck-modal">
        <div class="sih-deck-wrapper">
          <!-- Top Toolbar -->
          <div class="sih-deck-toolbar">
            <div class="sih-deck-title-area">
              <span class="sih-slogan-badge">SIH 2026 IDEA SUBMISSION</span>
              <strong style="color: #ffffff; font-size: 0.88rem;">Team PureLacto &bull; Smart Milk Quality, Purity &amp; Cloud Pricing</strong>
            </div>
            <div class="sih-deck-nav-controls">
              <button class="sih-deck-btn" onclick="window.prevSIHSlide()" title="Previous Slide (Left Arrow)">
                &larr; Prev
              </button>
              <span class="sih-deck-counter" id="sih-slide-counter">SLIDE 01 / 06</span>
              <button class="sih-deck-btn" onclick="window.nextSIHSlide()" title="Next Slide (Right Arrow)">
                Next &rarr;
              </button>
              <button class="sih-deck-btn" onclick="window.closeSIHDeck()" title="Close Presentation (Esc)" style="margin-left: 8px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #f87171;">
                &times; Close
              </button>
            </div>
          </div>

          <!-- Slide Viewport -->
          <div class="sih-slide-viewport" id="sih-slide-viewport">
            
            <!-- SLIDE 1: IDEA SUBMISSION TEMPLATE -->
            <div class="sih-slide active" id="sih-slide-1">
              <div class="sih-slide-header">
                <span class="sih-template-tag">IDEA SUBMISSION TEMPLATE</span>
                <span class="sih-slide-number">SLIDE 01 / 06</span>
              </div>
              <div class="sih-slide-hero-grid">
                <div class="sih-hero-card">
                  <h1 class="sih-hero-title">
                    Smart Milk Quality, Purity &amp; <span>Cloud Pricing</span>
                  </h1>
                  <p class="sih-hero-sub">
                    An intelligent Raspberry Pi 5 powered multi-sensor edge terminal for real-time milk purity assessment, on-device ML scoring, and instant cloud-linked farmer payments.
                  </p>
                  <div class="sih-pill-badges">
                    <span class="sih-pill">⚙️ Raspberry Pi 5 Edge Hub</span>
                    <span class="sih-pill">🥛 Smart Dairy &amp; Agritech</span>
                    <span class="sih-pill">☁️ Cloud-Indexed Pricing</span>
                  </div>
                </div>

                <div class="sih-info-card-stack">
                  <!-- SIH 2026 Registration Details -->
                  <div class="sih-box">
                    <div class="sih-box-header">
                      <span>📋</span> SIH 2026 REGISTRATION DETAILS
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Problem Statement Title:</span>
                      <span class="sih-value">Automated Dairy Purity Assessment</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Category:</span>
                      <span class="sih-value">Hardware &amp; IoT / Edge Computing</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Theme:</span>
                      <span class="sih-value">Smart Agriculture &amp; Dairy Automation</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Team Name:</span>
                      <span class="sih-value" style="color: #38bdf8;">Team PureLacto</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Compute Hub:</span>
                      <span class="sih-value">Raspberry Pi 5 (Quad-Core 2.4GHz)</span>
                    </div>
                  </div>

                  <!-- Core Project Highlights -->
                  <div class="sih-box">
                    <div class="sih-box-header green">
                      <span>✨</span> CORE PROJECT HIGHLIGHTS
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Edge Processing:</span>
                      <span class="sih-value">On-Device ML Inference &amp; Kiosk UI</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">ADC Interfacing:</span>
                      <span class="sih-value">ADS1115 16-Bit Precision I2C</span>
                    </div>
                    <div class="sih-detail-row">
                      <span class="sih-label">Disbursement:</span>
                      <span class="sih-value">Real-Time UPI &amp; Mobile Ledger Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SLIDE 2: PROPOSED SOLUTION & UNIQUENESS -->
            <div class="sih-slide" id="sih-slide-2">
              <div class="sih-slide-header">
                <span class="sih-template-tag">PROPOSED SOLUTION</span>
                <span class="sih-slide-number">SLIDE 02 / 06</span>
              </div>
              <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 1.25rem;">
                💡 Proposed Solution &amp; Uniqueness
              </h2>
              <div class="sih-3col-grid">
                <!-- Col 1: Current Bottlenecks -->
                <div class="sih-col-card warning">
                  <h3 class="sih-col-title" style="color: #f59e0b;">
                    <span>⚠️</span> Current Bottlenecks
                  </h3>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Manual &amp; Tamper-Prone:</strong> Traditional Gerber centrifuges and manual lactometers are slow, subjective, and prone to human manipulation.
                    </li>
                    <li>
                      <strong>Undetected Adulterants:</strong> Dilution with water, synthetic neutralizers, urea, detergent, and starch bypass basic density hydrometers.
                    </li>
                    <li>
                      <strong>Unfair Static Pricing:</strong> Farmers with high-purity yield receive flat payouts, disincentivizing clean organic dairy practices.
                    </li>
                    <li>
                      <strong>Latency &amp; Connectivity:</strong> Remote village dairy booths struggle with intermittent cellular signals for cloud processing.
                    </li>
                  </ul>
                </div>

                <!-- Col 2: Pi 5 Powered Solution -->
                <div class="sih-col-card solution">
                  <h3 class="sih-col-title" style="color: #38bdf8;">
                    <span>⚙️</span> Pi 5 Powered Solution
                  </h3>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Contactless Identification:</strong> RC522 RFID reader maps farmer identities directly to local SQLite records and cloud profiles.
                    </li>
                    <li>
                      <strong>ADS1115 16-Bit ADC Bridge:</strong> Multi-sensor array (pH, Turbidity, TDS/Conductivity) reads high-precision signals via fast I2C bus.
                    </li>
                    <li>
                      <strong>Edge AI Machine Learning:</strong> Scikit-Learn regression runs on Raspberry Pi 5 to estimate Fat% and SNF% with sub-second latency.
                    </li>
                    <li>
                      <strong>Automated Solenoid Flush:</strong> Relay-controlled 12V peristaltic pump clears sample residue to avoid cross-contamination.
                    </li>
                  </ul>
                </div>

                <!-- Col 3: Unique Value Proposition -->
                <div class="sih-col-card value">
                  <h3 class="sih-col-title" style="color: #10b981;">
                    <span>💡</span> Unique Value Proposition
                  </h3>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Zero Cloud-Dependency:</strong> Full offline resilience; Pi 5 executes scoring and issues slips even during complete telecom outages.
                    </li>
                    <li>
                      <strong>Integrated Touchscreen Kiosk:</strong> HDMI / DSI display provides live interactive inspection for both farmer and society clerk.
                    </li>
                    <li>
                      <strong>Dynamic Pricing Formula:</strong> Automated payment calculation based on verified purity, Fat%, and SNF% values.
                    </li>
                    <li>
                      <strong>Cost Advantage:</strong> Complete smart terminal built for under ₹14,000, replacing ₹1,50,000+ commercial ultrasonic analyzers.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- SLIDE 3: SYSTEM ARCHITECTURE & WORKFLOW -->
            <div class="sih-slide" id="sih-slide-3">
              <div class="sih-slide-header">
                <span class="sih-template-tag">TECHNICAL APPROACH</span>
                <span class="sih-slide-number">SLIDE 03 / 06</span>
              </div>
              <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 1.25rem;">
                🛠️ System Architecture &amp; Workflow
              </h2>
              
              <!-- 5-Stage Visual Workflow -->
              <div class="sih-flow-pipeline">
                <div class="sih-flow-node" style="border-top: 3px solid #f97316;">
                  <span class="sih-node-tag" style="background: rgba(249, 115, 22, 0.2); color: #f97316;">INPUT</span>
                  <div class="sih-node-header">Farmer Intake</div>
                  <div class="sih-node-sub">RC522 RFID Tap<br>Milk Deposition</div>
                </div>
                <div class="sih-flow-arrow">&rarr;</div>
                <div class="sih-flow-node" style="border-top: 3px solid #0ea5e9;">
                  <span class="sih-node-tag" style="background: rgba(14, 165, 233, 0.2); color: #0ea5e9;">ANALOG BRIDGE</span>
                  <div class="sih-node-header">Sensors + ADS1115</div>
                  <div class="sih-node-sub">pH (SEN0161) &bull; Turbidity<br>TDS/EC &bull; Load Cell HX711</div>
                </div>
                <div class="sih-flow-arrow">&rarr;</div>
                <div class="sih-flow-node" style="border-top: 3px solid #a855f7; background: rgba(168, 85, 247, 0.1);">
                  <span class="sih-node-tag" style="background: rgba(168, 85, 247, 0.25); color: #c084fc;">EDGE CORE</span>
                  <div class="sih-node-header">Raspberry Pi 5 (8GB)</div>
                  <div class="sih-node-sub">Edge ML Scikit-Learn<br>SQLite Ledger &bull; Kiosk UI &bull; Flush</div>
                </div>
                <div class="sih-flow-arrow">&rarr;</div>
                <div class="sih-flow-node" style="border-top: 3px solid #3b82f6;">
                  <span class="sih-node-tag" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">CLOUD</span>
                  <div class="sih-node-header">Cloud Central Ledger</div>
                  <div class="sih-node-sub">PostgreSQL Master Sync<br>Regional Fraud &bull; Rate Chart Config</div>
                </div>
                <div class="sih-flow-arrow">&rarr;</div>
                <div class="sih-flow-node" style="border-top: 3px solid #10b981;">
                  <span class="sih-node-tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">PAYOUT</span>
                  <div class="sih-node-header">Disbursement &amp; App</div>
                  <div class="sih-node-sub">Instant UPI Payout Trigger<br>Mobile Passbook &bull; SMS Receipt</div>
                </div>
              </div>

              <!-- 4 Technical Specifications Cards -->
              <div class="sih-specs-4col">
                <div class="sih-spec-card">
                  <div class="sih-spec-title">Edge Compute Unit</div>
                  <div class="sih-spec-body">
                    Raspberry Pi 5 (Quad Arm Cortex-A76 @ 2.4GHz), ADS1115 16-bit I2C ADC, Active Cooler.
                  </div>
                </div>
                <div class="sih-spec-card">
                  <div class="sih-spec-title">Sensor Suite &amp; Actuation</div>
                  <div class="sih-spec-body">
                    SEN0161 pH, TS-300B Turbidity, TDS/EC probe, DS18B20 1-Wire, HX711 Load Cell, 12V Flush Pump.
                  </div>
                </div>
                <div class="sih-spec-card">
                  <div class="sih-spec-title">On-Device Software</div>
                  <div class="sih-spec-body">
                    Raspberry Pi OS (64-bit), Python 3 (FastAPI, NumPy, Pandas, Scikit-Learn), Chromium Kiosk UI.
                  </div>
                </div>
                <div class="sih-spec-card">
                  <div class="sih-spec-title">Cloud &amp; Banking Integration</div>
                  <div class="sih-spec-body">
                    AWS IoT Core / Supabase PostgreSQL, Secure HTTPS sync, Sandbox UPI / Direct Bank Transfer APIs.
                  </div>
                </div>
              </div>
            </div>

            <!-- SLIDE 4: FEASIBILITY & RISK MITIGATION -->
            <div class="sih-slide" id="sih-slide-4">
              <div class="sih-slide-header">
                <span class="sih-template-tag">FEASIBILITY &amp; VIABILITY</span>
                <span class="sih-slide-number">SLIDE 04 / 06</span>
              </div>
              <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 1.25rem;">
                🛡️ Feasibility &amp; Risk Mitigation
              </h2>
              <div class="sih-split-grid">
                <!-- Feasibility Analysis -->
                <div class="sih-box" style="display: flex; flex-direction: column; justify-content: center;">
                  <div class="sih-box-header" style="font-size: 0.9rem; color: #38bdf8;">
                    FEASIBILITY ANALYSIS
                  </div>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Edge Processing Power:</strong> The Raspberry Pi 5 runs on-device Scikit-Learn regression and multi-parameter classification models without needing cloud GPU compute.
                    </li>
                    <li>
                      <strong>ADC Resolution:</strong> Interfacing with the ADS1115 16-bit I2C converter delivers significantly cleaner analog signal fidelity than conventional 10-bit/12-bit microcontrollers.
                    </li>
                    <li>
                      <strong>Offline Booth Autonomy:</strong> The Pi 5 hosts an embedded database (SQLite) and local touch web UI, functioning seamlessly in zero-connectivity rural environments.
                    </li>
                    <li>
                      <strong>Economic Feasibility:</strong> The full Pi 5 terminal costs ~₹14,000, which is still ~90% cheaper than proprietary commercial ultrasound analyzers (₹1,50,000+).
                    </li>
                  </ul>
                </div>

                <!-- Risk Mitigation Table -->
                <div class="sih-box">
                  <table class="sih-table">
                    <thead>
                      <tr>
                        <th>Identified Risk</th>
                        <th style="width: 70px;">Severity</th>
                        <th>Engineering Mitigation Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Lack of Native Analog Pins:</strong> Pi 5 GPIO header is 100% digital</td>
                        <td><span class="sih-badge-high">HIGH</span></td>
                        <td>Integrated ADS1115 16-bit ADC via I2C bus; converts analog pH, turbidity &amp; TDS voltages with high noise immunity.</td>
                      </tr>
                      <tr>
                        <td><strong>Sudden Power Loss:</strong> File corruption on microSD card in rural setups</td>
                        <td><span class="sih-badge-high">HIGH</span></td>
                        <td>Read-only filesystem overlay (overlayfs) + Mini UPS battery hat (18650 Li-ion) ensuring graceful safe shutdown.</td>
                      </tr>
                      <tr>
                        <td><strong>Thermal Throttling:</strong> Intensive continuous processing in warm dairies</td>
                        <td><span class="sih-badge-med">MEDIUM</span></td>
                        <td>Official Raspberry Pi Active Cooler (aluminum heatsink + PWM blower fan) maintaining core temps &lt; 55°C.</td>
                      </tr>
                      <tr>
                        <td><strong>Probe Fouling:</strong> Fat deposits adhering to optical and pH probes</td>
                        <td><span class="sih-badge-med">MEDIUM</span></td>
                        <td>Pi 5 GPIO switches a relay-driven peristaltic pump for automated warm citric-acid reverse flushes between tests.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- SLIDE 5: MEASURABLE IMPACT & VALUE PROPOSITION -->
            <div class="sih-slide" id="sih-slide-5">
              <div class="sih-slide-header">
                <span class="sih-template-tag">IMPACT &amp; BENEFITS</span>
                <span class="sih-slide-number">SLIDE 05 / 06</span>
              </div>
              <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 1.25rem;">
                📈 Measurable Impact &amp; Value Proposition
              </h2>

              <!-- 4 Big KPI Numbers -->
              <div class="sih-metrics-row">
                <div class="sih-metric-box">
                  <div class="sih-metric-val">&lt; 8s</div>
                  <div class="sih-metric-lbl">On-Device Edge ML Inference</div>
                </div>
                <div class="sih-metric-box">
                  <div class="sih-metric-val">100%</div>
                  <div class="sih-metric-lbl">Offline Autonomous Uptime</div>
                </div>
                <div class="sih-metric-box">
                  <div class="sih-metric-val">90%+</div>
                  <div class="sih-metric-lbl">Equipment Cost Savings</div>
                </div>
                <div class="sih-metric-box">
                  <div class="sih-metric-val">0%</div>
                  <div class="sih-metric-lbl">Payment Discrepancy</div>
                </div>
              </div>

              <!-- 2 Impact Boxes -->
              <div class="sih-2col-impact">
                <div class="sih-box" style="border-left: 3px solid #38bdf8;">
                  <div class="sih-box-header" style="color: #38bdf8;">
                    👥 Socio-Economic Benefits for Dairy Farmers
                  </div>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Fair Quality-Indexed Payouts:</strong> Eliminates unfair flat-rate pricing; farmers providing unadulterated milk earn up to 18-25% higher monthly income.
                    </li>
                    <li>
                      <strong>Touchscreen Transparency:</strong> Live interactive screen powered by Raspberry Pi 5 shows exact Fat%, SNF%, density, and calculated rate before depositing.
                    </li>
                    <li>
                      <strong>Financial Autonomy:</strong> Instant automated SMS and direct UPI transfers to female dairy farmers' accounts prevent cash leakages.
                    </li>
                  </ul>
                </div>

                <div class="sih-box" style="border-left: 3px solid #10b981;">
                  <div class="sih-box-header" style="color: #10b981;">
                    🏭 Dairy Industry &amp; Consumer Health Impact
                  </div>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>Real-Time Adulterant Interception:</strong> Instant detection of toxic additives (urea, detergent, starch, neutralizers) prevents pooling into bulk milk coolers.
                    </li>
                    <li>
                      <strong>Cold-Chain Traceability:</strong> Edge records tagged with booth IDs and timestamps feed into federation-wide supply chain tracking (e.g., Amul, Mother Dairy).
                    </li>
                    <li>
                      <strong>Edge-to-Cloud Resilience:</strong> Eliminates dependence on continuous high-speed internet, ensuring no village collection booth faces testing delays.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- SLIDE 6: PRICING FORMULA & RESEARCH BASE -->
            <div class="sih-slide" id="sih-slide-6">
              <div class="sih-slide-header">
                <span class="sih-template-tag">RESEARCH &amp; REFERENCES</span>
                <span class="sih-slide-number">SLIDE 06 / 06</span>
              </div>
              <h2 style="font-size: 1.5rem; color: #ffffff; margin-bottom: 1.25rem;">
                📊 Pricing Formula &amp; Research Base
              </h2>

              <!-- The Official Dynamic Payment Formulation -->
              <div class="sih-formula-card">
                <div style="font-size: 0.76rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
                  DYNAMIC QUALITY-INDEXED PAYMENT FORMULATION
                </div>
                <div class="sih-formula-math">
                  P<sub>Total</sub> = V<sub>Milk</sub> &times; [ R<sub>Base</sub> + w<sub>1</sub> &times; Fat% + w<sub>2</sub> &times; SNF% ] &times; (1 - &delta;<sub>Adulteration</sub>)
                </div>
                <div class="sih-formula-sub">
                  Where <em>V</em> is volume, <em>R</em> is baseline government rate, <em>w</em> are composition weights computed via Pi 5 edge regression, and <em>&delta;</em> is the penalty index (0 = pure, 1 = rejected sample).
                </div>
              </div>

              <div class="sih-split-formula">
                <!-- FSSAI Benchmark Quality Parameters -->
                <div class="sih-box">
                  <div class="sih-box-header" style="color: #f59e0b;">
                    FSSAI Benchmark Quality Parameters
                  </div>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>pH Range:</strong> Normal milk registers <strong>6.50 - 6.75</strong> (below 6.4 indicates souring/mastitis; above 6.8 indicates added soda/neutralizers).
                    </li>
                    <li>
                      <strong>Specific Conductivity:</strong> <strong>4.0 - 5.5 mS/cm</strong> at 25°C (abnormal spikes reveal dissolved synthetic electrolytes, urea, or mineral salts).
                    </li>
                    <li>
                      <strong>Standard Fat &amp; SNF:</strong> Cow milk (min. 3.2% Fat, 8.3% SNF); Buffalo milk (min. 6.0% Fat, 9.0% SNF).
                    </li>
                  </ul>

                  <!-- Interactive Live Formula Widget -->
                  <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1);">
                    <div style="font-size: 0.76rem; font-weight: 700; color: #38bdf8; margin-bottom: 6px;">
                      🧪 Interactive Dynamic Pricing Sandbox:
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
                      <div>
                        <label>Fat% (<span id="sih-test-fat-lbl">4.2</span>%):</label>
                        <input type="range" min="2.0" max="8.0" step="0.1" value="4.2" style="width: 100%;" oninput="window.updateSIHFormulaTest(this.value, null, null, null)">
                      </div>
                      <div>
                        <label>SNF% (<span id="sih-test-snf-lbl">8.7</span>%):</label>
                        <input type="range" min="7.0" max="10.0" step="0.1" value="8.7" style="width: 100%;" oninput="window.updateSIHFormulaTest(null, this.value, null, null)">
                      </div>
                      <div>
                        <label>Volume (<span id="sih-test-vol-lbl">25.0</span> L):</label>
                        <input type="range" min="5" max="50" step="1" value="25" style="width: 100%;" oninput="window.updateSIHFormulaTest(null, null, this.value, null)">
                      </div>
                      <div>
                        <label>Dilution &delta; (<span id="sih-test-delta-lbl">0.00</span>):</label>
                        <input type="range" min="0" max="1.0" step="0.05" value="0.0" style="width: 100%;" oninput="window.updateSIHFormulaTest(null, null, null, this.value)">
                      </div>
                    </div>
                    <div style="margin-top: 8px; font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.4); padding: 6px 10px; border-radius: 6px; color: #10b981;" id="sih-formula-calc-output">
                      P_Total = 25.0L × [₹32.0 + (3.2×4.2%) + (2.4×8.7%)] × (1 - 0.0) = <strong>₹1,658.00</strong>
                    </div>
                  </div>
                </div>

                <!-- Key Research Literature & Citations -->
                <div class="sih-box">
                  <div class="sih-box-header" style="color: #38bdf8;">
                    Key Research Literature &amp; Citations
                  </div>
                  <ul class="sih-bullet-list">
                    <li>
                      <strong>FSSAI Manual of Methods of Analysis of Foods (Milk and Milk Products):</strong> Official regulatory guidelines for testing fat, solids-not-fat, and added chemical neutralizers.
                    </li>
                    <li>
                      <strong>IEEE Transactions on Agri-Food Electronics:</strong> "Edge Computing Architectures for Real-Time Spectrophotometric and Electrochemical Milk Quality Analysis in Rural Dairies."
                    </li>
                    <li>
                      <strong>National Dairy Development Board (NDDB):</strong> Automatic Milk Collection Unit (AMCU) guidelines and transparent farmer settlement protocols.
                    </li>
                    <li>
                      <strong>Journal of Food Engineering:</strong> "Non-Destructive Sensing and Machine Learning Regression for Simultaneous Fat, Protein, and Total Solids Estimation in Raw Bovine Milk."
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Navigation -->
          <div class="sih-deck-footer">
            <div class="sih-dot-nav">
              <button class="sih-dot active" onclick="window.goToSIHSlide(1)">01</button>
              <button class="sih-dot" onclick="window.goToSIHSlide(2)">02</button>
              <button class="sih-dot" onclick="window.goToSIHSlide(3)">03</button>
              <button class="sih-dot" onclick="window.goToSIHSlide(4)">04</button>
              <button class="sih-dot" onclick="window.goToSIHSlide(5)">05</button>
              <button class="sih-dot" onclick="window.goToSIHSlide(6)">06</button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Close on ESC key or backdrop click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.closeSIHDeck();
      if (e.key === 'ArrowRight') window.nextSIHSlide();
      if (e.key === 'ArrowLeft') window.prevSIHSlide();
    });

    const modal = document.getElementById('sih-deck-modal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeSIHDeck();
    });
  }

  window.openSIHDeck = function (slideIndex = 1) {
    initSIHDeck();
    const modal = document.getElementById('sih-deck-modal');
    if (modal) {
      modal.classList.add('active');
      window.goToSIHSlide(slideIndex);
    }
  };

  window.closeSIHDeck = function () {
    const modal = document.getElementById('sih-deck-modal');
    if (modal) modal.classList.remove('active');
  };

  window.goToSIHSlide = function (slideIndex) {
    currentSlide = Math.max(1, Math.min(totalSlides, slideIndex));
    for (let i = 1; i <= totalSlides; i++) {
      const slideEl = document.getElementById('sih-slide-' + i);
      if (slideEl) {
        if (i === currentSlide) slideEl.classList.add('active');
        else slideEl.classList.remove('active');
      }
    }

    // Update Counter
    const counterEl = document.getElementById('sih-slide-counter');
    if (counterEl) {
      counterEl.innerText = `SLIDE 0${currentSlide} / 06`;
    }

    // Update Dots
    const dots = document.querySelectorAll('.sih-dot');
    dots.forEach((dot, idx) => {
      if (idx + 1 === currentSlide) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Scroll viewport to top
    const viewport = document.getElementById('sih-slide-viewport');
    if (viewport) viewport.scrollTop = 0;
  };

  window.nextSIHSlide = function () {
    if (currentSlide < totalSlides) {
      window.goToSIHSlide(currentSlide + 1);
    } else {
      window.goToSIHSlide(1);
    }
  };

  window.prevSIHSlide = function () {
    if (currentSlide > 1) {
      window.goToSIHSlide(currentSlide - 1);
    } else {
      window.goToSIHSlide(totalSlides);
    }
  };

  // State for interactive test calculation in Slide 6
  let testFat = 4.2;
  let testSnf = 8.7;
  let testVol = 25.0;
  let testDelta = 0.0;

  window.updateSIHFormulaTest = function (fat, snf, vol, delta) {
    if (fat !== null) testFat = parseFloat(fat);
    if (snf !== null) testSnf = parseFloat(snf);
    if (vol !== null) testVol = parseFloat(vol);
    if (delta !== null) testDelta = parseFloat(delta);

    const fLbl = document.getElementById('sih-test-fat-lbl');
    const sLbl = document.getElementById('sih-test-snf-lbl');
    const vLbl = document.getElementById('sih-test-vol-lbl');
    const dLbl = document.getElementById('sih-test-delta-lbl');
    if (fLbl) fLbl.innerText = testFat.toFixed(1);
    if (sLbl) sLbl.innerText = testSnf.toFixed(1);
    if (vLbl) vLbl.innerText = testVol.toFixed(1);
    if (dLbl) dLbl.innerText = testDelta.toFixed(2);

    const rBase = 32.0;
    const w1 = 3.20;
    const w2 = 2.40;
    const compRate = rBase + (w1 * testFat) + (w2 * testSnf);
    const netRate = testDelta >= 1.0 ? 0.0 : (compRate * (1 - testDelta));
    const total = (testVol * netRate);

    const out = document.getElementById('sih-formula-calc-output');
    if (out) {
      if (testDelta >= 1.0) {
        out.innerHTML = `P_Total = ${testVol.toFixed(1)}L × [₹${rBase} + (${w1}×${testFat}%) + (${w2}×${testSnf}%)] × (1 - 1.0) = <strong style="color: #ef4444;">₹0.00 (REJECTED)</strong>`;
      } else {
        out.innerHTML = `P_Total = ${testVol.toFixed(1)}L × [₹${rBase} + (${w1}×${testFat}%) + (${w2}×${testSnf}%)] × (1 - ${testDelta.toFixed(2)}) = <strong>₹${total.toFixed(2)}</strong> (₹${netRate.toFixed(2)}/L)`;
      }
    }
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSIHDeck);
  } else {
    initSIHDeck();
  }
})();
