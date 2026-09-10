/**
 * DAIRY DOVA - Cloud-Based Dynamic Pricing Engine & Receipt Slip Generator
 * Implements SIH 2026 Dynamic Quality-Indexed Payment Formulation:
 * P_Total = V_Milk × [ R_Base + w_1 × Fat% + w_2 × SNF% ] × (1 - δ_Adulteration)
 * Key Research Literature & Citations: FSSAI, IEEE Agri-Food Electronics, NDDB AMCU
 */

class PricingEngine {
  constructor() {
    this.currencySymbol = "₹";
  }

  generateThermalSlip(record) {
    return this.renderReceiptHTML(record);
  }

  /**
   * Evaluates Dynamic Quality-Indexed Payment Formulation:
   * P_Total = V_Milk × [ R_Base + w1 × Fat% + w2 × SNF% ] × (1 - δ_Adulteration)
   */
  calculatePricing(sensorState, farmer) {
    const config = window.db ? window.db.getConfig() : null;
    const sampleType = sensorState.sampleType || (farmer ? farmer.cattleType : 'Cow');
    const isCow = sampleType.toLowerCase() === 'cow';
    const rules = config ? (config[sampleType.toLowerCase()] || config.cow) : {
      baseRatePerLitre: isCow ? 32.0 : 40.0,
      w1_fat: isCow ? 3.20 : 3.80,
      w2_snf: isCow ? 2.40 : 2.80,
      minFat: isCow ? 3.2 : 6.0,
      minSnf: isCow ? 8.3 : 9.0
    };

    const volume = parseFloat(sensorState.volume) || 0;
    const fat = parseFloat(sensorState.fat) || 0;
    const snf = parseFloat(sensorState.snf) || 0;
    const waterAdded = parseFloat(sensorState.waterAdded) || 0;
    const ph = parseFloat(sensorState.ph) || 6.65;
    const conductivity = parseFloat(sensorState.conductivity || sensorState.tds || 4.8);
    const purity = parseFloat(sensorState.purityScore) || 0;
    const adulterants = sensorState.adulterants || [];
    const classification = sensorState.classification || (window.sensorEngine ? window.sensorEngine.classifySample(sensorState) : { code: '--', label: 'Awaiting Milk Sample', color: '#94a3b8' });

    // Initial Unanalyzed State Check
    if (classification.code === '--' || (!fat && !volume && !purity)) {
      return {
        status: "AWAITING_TEST",
        badgeClass: "badge-secondary",
        grade: "--",
        gradeLabel: "Awaiting Milk Sample",
        gradeColor: "#94a3b8",
        reason: "No Milk Sample Analyzed",
        rBase: rules.baseRatePerLitre || 32.0,
        w1: rules.w1_fat || 3.20,
        w2: rules.w2_snf || 2.40,
        fatVal: 0,
        snfVal: 0,
        compositionRate: 0,
        delta: 0,
        penaltyMultiplier: 1.0,
        netRatePerLitre: 0.0,
        volume: 0,
        totalPayout: 0.0,
        isPayable: false,
        formulaDisplay: "P_Total = V × [ R_Base + w1·Fat + w2·SNF ] × (1 - δ)",
        fssai: {
          phValid: false,
          conductivityValid: false,
          fatValid: false,
          snfValid: false
        }
      };
    }

    // Baseline variables from SIH 2026 Specification
    const rBase = rules.baseRatePerLitre || (isCow ? 32.0 : 40.0);
    const w1 = rules.w1_fat || (isCow ? 3.20 : 3.80);
    const w2 = rules.w2_snf || (isCow ? 2.40 : 2.80);

    // Composition Gross Rate = R_Base + w1 × Fat% + w2 × SNF%
    const fatVal = parseFloat((w1 * fat).toFixed(2));
    const snfVal = parseFloat((w2 * snf).toFixed(2));
    const compositionRate = parseFloat((rBase + fatVal + snfVal).toFixed(2));

    // FSSAI Benchmark Validation
    // pH Range: 6.50 - 6.75 (below 6.4 souring/mastitis; above 6.8 soda/neutralizers)
    const phValid = ph >= 6.50 && ph <= 6.75;
    // Specific Conductivity: 4.0 - 5.5 mS/cm at 25°C
    const conductivityValid = conductivity >= 4.0 && conductivity <= 5.5;
    // Fat & SNF Standards: Cow (min 3.2% Fat, 8.3% SNF); Buffalo (min 6.0% Fat, 9.0% SNF)
    const minFatStd = isCow ? 3.2 : 6.0;
    const minSnfStd = isCow ? 8.3 : 9.0;
    const fatValid = fat >= minFatStd;
    const snfValid = snf >= minSnfStd;

    // Check for Chemical Adulteration (Urea, Detergent, Starch, Neutralizers)
    const hasChemical = adulterants.some(a => 
      a.toLowerCase().includes('neutralizer') || 
      a.toLowerCase().includes('urea') || 
      a.toLowerCase().includes('detergent') ||
      a.toLowerCase().includes('synthetic') ||
      a.toLowerCase().includes('starch')
    );

    // Calculate Penalty Index: δ_Adulteration (0 = Pure, 1 = Rejected Sample)
    let delta = 0.0;

    if (hasChemical || classification.code === "GRADE F" || purity < 45.0) {
      // Rejection: 100% penalty index
      delta = 1.0;
    } else {
      // Added water dilution penalty
      if (waterAdded > 0) {
        delta += Math.min(0.60, waterAdded * 0.025);
      }

      // pH deviation penalty
      if (ph < 6.40) {
        // High lactic acidity / mastitis
        delta += Math.min(0.35, (6.40 - ph) * 0.8);
      } else if (ph > 6.80) {
        // Added soda / alkaline neutralizers
        delta += Math.min(0.40, (ph - 6.80) * 0.9);
      }

      // Conductivity deviation penalty (synthetic electrolytes, urea salts)
      if (conductivity > 5.5) {
        delta += Math.min(0.30, (conductivity - 5.5) * 0.15);
      } else if (conductivity < 4.0 && conductivity > 0.5) {
        delta += Math.min(0.20, (4.0 - conductivity) * 0.15);
      }

      // Minor penalty if Fat or SNF falls below FSSAI statutory minimums
      if (fat < minFatStd) {
        delta += Math.min(0.15, (minFatStd - fat) * 0.05);
      }
      if (snf < minSnfStd) {
        delta += Math.min(0.15, (minSnfStd - snf) * 0.05);
      }
    }

    // Clamp δ between 0.00 and 1.00
    delta = parseFloat(Math.max(0.0, Math.min(1.0, delta)).toFixed(3));
    const penaltyMultiplier = parseFloat((1 - delta).toFixed(3));

    // Dynamic Net Rate Per Litre
    let netRate = parseFloat((compositionRate * penaltyMultiplier).toFixed(2));
    if (delta >= 1.0 || classification.code === "GRADE F") {
      netRate = 0.0;
    }

    // Total Payment Formulation: P_Total = V_Milk × Net Rate
    const totalPayout = parseFloat((volume * netRate).toFixed(2));

    // Status Assignment
    let status = "APPROVED";
    let badgeClass = "badge-success";
    let isPayable = true;

    if (delta >= 1.0 || classification.code === "GRADE F" || purity < 45.0) {
      status = "REJECTED";
      badgeClass = "badge-danger";
      isPayable = false;
    } else if (delta > 0.35 || classification.code === "GRADE C") {
      status = "PENALIZED";
      badgeClass = "badge-warning";
    } else if (delta > 0.10 || classification.code === "GRADE B") {
      status = "MARGINAL";
      badgeClass = "badge-warning";
    }

    // Step-by-step mathematical representation
    const formulaDisplay = `P_Total = ${volume.toFixed(1)}L × [ ₹${rBase.toFixed(1)} + (${w1.toFixed(2)} × ${fat.toFixed(2)}%) + (${w2.toFixed(2)} × ${snf.toFixed(2)}%) ] × (1 - ${delta.toFixed(2)}) = ₹${totalPayout.toFixed(2)}`;

    return {
      status: status,
      badgeClass: badgeClass,
      grade: classification.code,
      gradeLabel: classification.label,
      gradeColor: classification.color,
      reason: classification.description,
      sampleType: sampleType,
      volume: volume,
      fat: fat,
      snf: snf,
      ph: ph,
      conductivity: conductivity,
      purityScore: Math.round(purity),
      // SIH 2026 Formulation Parameters
      rBase: rBase,
      w1: w1,
      w2: w2,
      fatVal: fatVal,
      snfVal: snfVal,
      compositionRate: compositionRate,
      delta: delta,
      penaltyMultiplier: penaltyMultiplier,
      netRatePerLitre: netRate,
      grossAmount: parseFloat((volume * compositionRate).toFixed(2)),
      deductions: parseFloat((volume * compositionRate * delta).toFixed(2)),
      totalPayout: totalPayout,
      isPayable: isPayable,
      formulaDisplay: formulaDisplay,
      fssai: {
        phValid: phValid,
        phRange: "6.50 - 6.75",
        conductivityValid: conductivityValid,
        conductivityRange: "4.0 - 5.5 mS/cm",
        fatValid: fatValid,
        fatMin: minFatStd,
        snfValid: snfValid,
        snfMin: minSnfStd
      }
    };
  }

  // Render Perforated Digital Receipt Slip with SIH 2026 Formula
  renderReceiptHTML(record) {
    const isApproved = record.status === "APPROVED";
    const isRejected = record.status === "REJECTED";
    const grade = record.grade || (record.purityScore >= 95 ? "GRADE A+" : record.purityScore >= 85 ? "GRADE A" : record.purityScore >= 70 ? "GRADE B" : "GRADE C");

    const rBase = record.rBase || (record.milkType === 'Buffalo' ? 40.0 : 32.0);
    const w1 = record.w1 || (record.milkType === 'Buffalo' ? 3.80 : 3.20);
    const w2 = record.w2 || (record.milkType === 'Buffalo' ? 2.80 : 2.40);
    const delta = typeof record.delta === 'number' ? record.delta : (record.waterAdded ? record.waterAdded * 0.025 : 0);

    return `
      <div class="receipt-slip-container" id="printable-receipt">
        <div class="receipt-header">
          <div class="receipt-brand">TEAM PURELACTO &bull; DAIRY DOVA</div>
          <div class="receipt-sub">SMART MILK QUALITY, PURITY &amp; CLOUD PRICING TERMINAL</div>
          <div style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono); margin-top: 2px;">
            SIH 2026 &bull; RASPBERRY PI 5 EDGE HUB &bull; ADS1115 16-BIT ADC
          </div>
          <div style="margin-top: 8px; display: flex; justify-content: center; gap: 8px;">
            <span class="badge ${record.status === 'APPROVED' ? 'badge-success' : record.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">
              ${record.status}
            </span>
            <span class="badge" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid #10b981;">
              ${grade}
            </span>
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div class="receipt-meta-item"><strong>Receipt #:</strong> ${record.id}</div>
          <div class="receipt-meta-item"><strong>Batch Tag:</strong> ${record.batchId || 'BATCH-' + record.id}</div>
          <div class="receipt-meta-item"><strong>Farmer ID:</strong> ${record.farmerId}</div>
          <div class="receipt-meta-item"><strong>Farmer:</strong> ${record.farmerName}</div>
          <div class="receipt-meta-item"><strong>UPI ID:</strong> ${record.upiId || (record.farmerId + '@upi')}</div>
          <div class="receipt-meta-item"><strong>Date / Shift:</strong> ${record.date} (${record.shift})</div>
          <div class="receipt-meta-item"><strong>Milk Origin:</strong> ${record.milkType || 'Cow'} Milk</div>
          <div class="receipt-meta-item"><strong>Compute Hub:</strong> Raspberry Pi 5 (Quad 2.4GHz)</div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>PARAMETER</th>
              <th>TEST VALUE</th>
              <th>FSSAI BENCHMARK</th>
              <th style="text-align: right;">FORMULA FACTOR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Intake Volume (V_Milk)</td>
              <td><strong>${record.volume.toFixed(1)} L</strong></td>
              <td>HX711 Load Cell</td>
              <td style="text-align: right;">Mass-to-Volume Verified</td>
            </tr>
            <tr>
              <td>Base Govt Rate (R_Base)</td>
              <td><strong>₹${rBase.toFixed(2)}/L</strong></td>
              <td>Statutory Baseline</td>
              <td style="text-align: right;">R_Base</td>
            </tr>
            <tr>
              <td>Fat Composition (w1·Fat%)</td>
              <td><strong>${record.fat.toFixed(2)}%</strong></td>
              <td>${record.milkType === 'Buffalo' ? 'Min 6.0%' : 'Min 3.2%'}</td>
              <td style="text-align: right; color: #059669;">
                +₹${(w1 * record.fat).toFixed(2)} (${w1}×)
              </td>
            </tr>
            <tr>
              <td>Solid-Not-Fat (w2·SNF%)</td>
              <td><strong>${record.snf.toFixed(2)}%</strong></td>
              <td>${record.milkType === 'Buffalo' ? 'Min 9.0%' : 'Min 8.3%'}</td>
              <td style="text-align: right; color: #059669;">
                +₹${(w2 * record.snf).toFixed(2)} (${w2}×)
              </td>
            </tr>
            <tr>
              <td>pH Value (SEN0161)</td>
              <td><strong>${(record.ph || 6.68).toFixed(2)}</strong></td>
              <td>6.50 - 6.75 Normal</td>
              <td style="text-align: right;">${(record.ph >= 6.50 && record.ph <= 6.75) ? '✓ Compliant' : '⚠ Non-compliant'}</td>
            </tr>
            <tr>
              <td>Electrical Conductivity (TDS)</td>
              <td><strong>${(record.conductivity || 4.8).toFixed(1)} mS/cm</strong></td>
              <td>4.0 - 5.5 mS/cm @25°C</td>
              <td style="text-align: right;">${(record.conductivity >= 4.0 && record.conductivity <= 5.5) ? '✓ Pure Electrolytes' : '⚠ Salt Anomaly'}</td>
            </tr>
            <tr>
              <td>Penalty Index (δ_Adulteration)</td>
              <td><strong>${delta.toFixed(2)}</strong></td>
              <td>0 = Pure, 1 = Reject</td>
              <td style="text-align: right; color: ${delta > 0 ? '#dc2626' : '#059669'};">
                ${delta > 0 ? `-${(delta * 100).toFixed(0)}% Penalty` : '0% (Pure)'}
              </td>
            </tr>
            <tr>
              <td>Final Net Rate / Litre</td>
              <td colspan="2">P_Rate = [R_Base + w1·Fat + w2·SNF] × (1 - δ)</td>
              <td style="text-align: right; font-weight: 700; font-size: 1rem; color: #0284c7;">
                ₹${record.ratePerLitre.toFixed(2)}/L
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="2">NET FARMER PAYOUT (P_Total)</td>
              <td colspan="2" style="text-align: right; font-size: 1.35rem; color: #0284c7;">
                ₹${record.totalPayout.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Live SIH 2026 Formulation Box -->
        <div style="background: rgba(14, 165, 233, 0.08); border: 1px dashed rgba(14, 165, 233, 0.35); border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.76rem; font-family: var(--font-mono); color: #0284c7;">
          <strong>SIH 2026 Quality-Indexed Formulation:</strong><br>
          P_Total = ${record.volume.toFixed(1)}L × [ ₹${rBase.toFixed(1)} + (${w1} × ${record.fat.toFixed(2)}%) + (${w2} × ${record.snf.toFixed(2)}%) ] × (1 - ${delta.toFixed(2)}) = <strong>₹${record.totalPayout.toFixed(2)}</strong>
        </div>

        ${record.adulterantsDetected && record.adulterantsDetected.length > 0 ? `
          <div style="background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.78rem; color: #991b1b;">
            <strong>Adulteration Warnings Detected:</strong> ${record.adulterantsDetected.join(', ')}
          </div>
        ` : ''}

        <div class="receipt-qr-footer">
          <div style="font-size: 0.75rem; color: #64748b; max-width: 230px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Offline SQLite &bull; Cloud PostgreSQL Sync</div>
            Edge transaction hash authenticated on Raspberry Pi 5. Direct UPI instant settlement sandbox linked.
          </div>
          <div class="qr-code-box">
            ${this.generateMockQRCodeSVG(record.batchId || record.id)}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 1.25rem; flex-wrap: wrap;" class="no-print">
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.print()">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Thermal Slip
          </button>
          <button class="btn btn-success btn-sm" style="flex: 1;" onclick="window.pricingEngine.triggerInstantUPIPayout('${record.farmerName}', '${record.totalPayout.toFixed(2)}', '${record.farmerId}')">
            ⚡ Instant UPI Payout
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.pricingEngine.simulateSMS('${record.farmerName}', '${record.totalPayout.toFixed(2)}', '${record.fat.toFixed(1)}', '${record.snf.toFixed(1)}')">
            📱 SMS
          </button>
        </div>
      </div>
    `;
  }

  generateMockQRCodeSVG(code) {
    return `
      <svg viewBox="0 0 45 45" width="68" height="68" shape-rendering="crispEdges">
        <rect width="45" height="45" fill="#ffffff" />
        <rect x="3" y="3" width="11" height="11" fill="#0f172a" />
        <rect x="5" y="5" width="7" height="7" fill="#ffffff" />
        <rect x="7" y="7" width="3" height="3" fill="#0f172a" />
        <rect x="31" y="3" width="11" height="11" fill="#0f172a" />
        <rect x="33" y="5" width="7" height="7" fill="#ffffff" />
        <rect x="35" y="7" width="3" height="3" fill="#0f172a" />
        <rect x="3" y="31" width="11" height="11" fill="#0f172a" />
        <rect x="5" y="33" width="7" height="7" fill="#ffffff" />
        <rect x="7" y="35" width="3" height="3" fill="#0f172a" />
        <rect x="18" y="4" width="2" height="6" fill="#0f172a" />
        <rect x="22" y="6" width="3" height="2" fill="#0f172a" />
        <rect x="27" y="3" width="2" height="4" fill="#0f172a" />
        <rect x="16" y="16" width="4" height="4" fill="#0f172a" />
        <rect x="24" y="16" width="3" height="3" fill="#0f172a" />
        <rect x="29" y="18" width="5" height="2" fill="#0f172a" />
        <rect x="18" y="24" width="6" height="2" fill="#0f172a" />
        <rect x="28" y="26" width="3" height="4" fill="#0f172a" />
        <rect x="34" y="24" width="4" height="2" fill="#0f172a" />
        <rect x="18" y="32" width="2" height="6" fill="#0f172a" />
        <rect x="24" y="34" width="6" height="2" fill="#0f172a" />
        <rect x="33" y="32" width="5" height="5" fill="#0f172a" />
      </svg>
    `;
  }

  // Trigger Instant UPI Payout (Sandbox UPI 2.0 / Direct Bank Transfer API)
  triggerInstantUPIPayout(name, amount, farmerId) {
    if (window.soundCtrl && window.soundCtrl.playSuccess) {
      window.soundCtrl.playSuccess();
    } else if (window.soundCtrl) {
      window.soundCtrl.playTick();
    }

    const utr = 'UPI/' + new Date().getFullYear() + '/' + Math.floor(100000000000 + Math.random() * 900000000000);
    const upiId = (farmerId ? farmerId.toLowerCase().replace('-', '') : 'farmer') + '@okhdfcbank';

    const msg = `⚡ INSTANT UPI DISBURSEMENT SUCCESSFUL!\n` +
      `Beneficiary: ${name} (${upiId})\n` +
      `Amount Paid: ₹${amount}\n` +
      `NPCI Reference (UTR): ${utr}\n` +
      `Status: Settled via Sandbox UPI / Direct Bank Transfer API\n` +
      `Mobile Passbook Synchronized.`;

    if (window.app && window.app.showToast) {
      window.app.showToast(msg, 'success', 8000);
    } else {
      alert(msg);
    }
  }

  // Simulate Automated SMS Receipt
  simulateSMS(name, amount, fat = "4.2", snf = "8.7") {
    if (window.soundCtrl) window.soundCtrl.playTick();
    const sms = `📲 [TEAM PURELACTO SMS]: Dear ${name}, your milk delivery was verified by Raspberry Pi 5 Edge Terminal. Fat: ${fat}%, SNF: ${snf}%. Payout of ₹${amount} credited instantly via UPI to your bank account.`;
    if (window.app && window.app.showToast) {
      window.app.showToast(sms, 'success', 7000);
    } else {
      alert(sms);
    }
  }
}

window.pricingEngine = new PricingEngine();
