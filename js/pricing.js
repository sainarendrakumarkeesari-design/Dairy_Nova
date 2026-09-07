/**
 * DAIRY DOVA - Cloud-Based Dynamic Pricing Engine & Receipt Slip Generator
 * Implements Quality-Based Pricing Rules, 5-Tier Classification, and Transparent Digital Slips
 */

class PricingEngine {
  constructor() {
    this.currencySymbol = "₹";
  }

  calculatePricing(sensorState, farmer) {
    const config = window.db.getConfig();
    const milkType = (sensorState.sampleType || (farmer ? farmer.cattleType : 'Cow')).toLowerCase();
    const rules = config[milkType] || config.cow;

    const volume = parseFloat(sensorState.volume) || 0;
    const fat = parseFloat(sensorState.fat) || 0;
    const snf = parseFloat(sensorState.snf) || 0;
    const waterAdded = parseFloat(sensorState.waterAdded) || 0;
    const purity = parseFloat(sensorState.purityScore) || 0;
    const adulterants = sensorState.adulterants || [];
    const classification = sensorState.classification || window.sensorEngine.classifySample(sensorState);

    // Severe Rejection Check: Grade F
    if (classification.code === "GRADE F" || purity < 45.0) {
      return {
        status: "REJECTED",
        badgeClass: "badge-danger",
        grade: classification.code,
        gradeLabel: classification.label,
        gradeColor: classification.color,
        reason: "Adulterant Contamination / Substandard Safety Violation",
        baseRate: rules.baseRatePerLitre,
        fatDiff: (fat - rules.stdFat).toFixed(2),
        fatAdjustment: 0,
        snfDiff: (snf - rules.stdSnf).toFixed(2),
        snfAdjustment: 0,
        qualityMultiplier: 0.0,
        qualityBonusOrDeduction: 0,
        waterPenalty: 0,
        netRatePerLitre: 0.0,
        volume: volume,
        grossAmount: 0.0,
        deductions: 0.0,
        totalPayout: 0.0,
        isPayable: false
      };
    }

    // Baseline reference rate (₹45.00/L for Cow)
    const baseRate = rules.baseRatePerLitre;

    // Quality Bonus based on 4-Tier Quality Score Rule:
    // 90–100 → PREMIUM: +₹4.00/L
    // 75–89  → GOOD: ₹0.00/L (Standard Rate)
    // 60–74  → AVERAGE: -₹6.00/L
    // <60    → POOR: Rejection (₹0.00)
    let qualityBonus = 0;
    if (purity >= 90.0) {
      qualityBonus = 4.0;
    } else if (purity >= 75.0) {
      qualityBonus = 0.0;
    } else if (purity >= 60.0) {
      qualityBonus = -6.0;
    } else {
      qualityBonus = -baseRate;
    }

    // Fat & SNF Differential tracking
    const fatDiff = fat - rules.stdFat;
    const fatAdjustment = fatDiff * rules.fatPremiumPerPoint;
    const snfDiff = snf - rules.stdSnf;
    const snfAdjustment = snfDiff * rules.snfPremiumPerPoint;

    // Final Rate / Litre = Base Price + Quality Bonus
    let netRate = Math.max(0, baseRate + qualityBonus);

    // Added Water Penalty Deduction
    let waterPenalty = 0;
    if (waterAdded > 0) {
      const penaltyFactor = (waterAdded * config.penalties.waterDeductionPercent) / 100;
      waterPenalty = netRate * penaltyFactor;
      netRate = Math.max(0, netRate - waterPenalty);
    }

    // Total Payment = Quantity × Final Rate
    const totalPayout = parseFloat((volume * netRate).toFixed(2));

    let status = "APPROVED";
    let badgeClass = "badge-success";
    if (classification.code === "GRADE C") {
      status = "PENALIZED";
      badgeClass = "badge-warning";
    } else if (classification.code === "GRADE B") {
      status = "MARGINAL";
      badgeClass = "badge-warning";
    }

    return {
      status: status,
      badgeClass: badgeClass,
      grade: classification.code,
      gradeLabel: classification.label,
      gradeColor: classification.color,
      reason: classification.description,
      baseRate: rules.baseRatePerLitre,
      fatDiff: (fatDiff > 0 ? `+${fatDiff.toFixed(2)}` : fatDiff.toFixed(2)),
      fatAdjustment: parseFloat(fatAdjustment.toFixed(2)),
      snfDiff: (snfDiff > 0 ? `+${snfDiff.toFixed(2)}` : snfDiff.toFixed(2)),
      snfAdjustment: parseFloat(snfAdjustment.toFixed(2)),
      qualityScore: Math.round(purity),
      qualityBonus: qualityBonus,
      qualityBonusOrDeduction: qualityBonus,
      qualityMultiplier: 1.0,
      waterPenalty: parseFloat(waterPenalty.toFixed(2)),
      purityBonus: 0,
      netRatePerLitre: parseFloat(netRate.toFixed(2)),
      volume: volume,
      grossAmount: parseFloat((volume * baseRate).toFixed(2)),
      deductions: parseFloat((volume * waterPenalty).toFixed(2)),
      totalPayout: totalPayout,
      isPayable: true
    };
  }

  // Render Perforated Digital Receipt Slip
  renderReceiptHTML(record) {
    const isApproved = record.status === "APPROVED";
    const isRejected = record.status === "REJECTED";
    const grade = record.grade || (record.purityScore >= 95 ? "GRADE A+" : record.purityScore >= 85 ? "GRADE A" : record.purityScore >= 70 ? "GRADE B" : "GRADE C");

    return `
      <div class="receipt-slip-container" id="printable-receipt">
        <div class="receipt-header">
          <div class="receipt-brand">DAIRY DOVA</div>
          <div class="receipt-sub">SMART MILK QUALITY &amp; CLOUD PRICING NETWORK</div>
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
          <div class="receipt-meta-item"><strong>Date / Shift:</strong> ${record.date} (${record.shift})</div>
          <div class="receipt-meta-item"><strong>Milk Origin:</strong> ${record.milkType} Milk</div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>PARAMETER</th>
              <th>TEST VALUE</th>
              <th>QUALITY REF</th>
              <th style="text-align: right;">PRICE IMPACT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Volume / Intake</td>
              <td><strong>${record.volume.toFixed(1)} L</strong></td>
              <td>Ultrasonic Can Depth</td>
              <td style="text-align: right;">-</td>
            </tr>
            <tr>
              <td>Fat Composition</td>
              <td><strong>${record.fat.toFixed(2)}%</strong></td>
              <td>${record.milkType === 'Buffalo' ? '6.5%' : '3.5%'} Std</td>
              <td style="text-align: right; color: ${record.fat >= 4.0 ? '#059669' : '#d97706'}">
                ${record.fat >= 4.0 ? 'Incentive Applied' : 'Standard'}
              </td>
            </tr>
            <tr>
              <td>Solid-Not-Fat (SNF)</td>
              <td><strong>${record.snf.toFixed(2)}%</strong></td>
              <td>${record.milkType === 'Buffalo' ? '9.0%' : '8.5%'} Min</td>
              <td style="text-align: right; color: #059669;">Optimal</td>
            </tr>
            <tr>
              <td>Density &amp; Protein</td>
              <td>${record.density} g/ml | ${record.protein}%</td>
              <td>Pure Cow/Buffalo</td>
              <td style="text-align: right;">Pass</td>
            </tr>
            <tr>
              <td>Added Water Dilution</td>
              <td><strong>${record.waterAdded.toFixed(1)}%</strong></td>
              <td>0.0% Pure</td>
              <td style="text-align: right; color: ${record.waterAdded > 0 ? '#dc2626' : '#059669'}">
                ${record.waterAdded > 0 ? `-${record.waterAdded}% Deduction` : '0% Dilution'}
              </td>
            </tr>
            <tr>
              <td>Quality Score &amp; Grade</td>
              <td><strong>${record.purityScore.toFixed(1)}%</strong> (${grade})</td>
              <td>95%+ Elite</td>
              <td style="text-align: right; font-weight: 700; color: ${record.purityScore >= 95 ? '#059669' : '#0284c7'}">
                ${record.purityScore >= 95 ? '+12% Quality Bonus' : 'Standard Tier'}
              </td>
            </tr>
            <tr>
              <td>Final Net Rate / Litre</td>
              <td colspan="2">Quality-Based Pricing Rule</td>
              <td style="text-align: right; font-weight: 700; font-size: 1rem; color: #0284c7;">
                ₹${record.ratePerLitre.toFixed(2)}/L
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="2">NET FARMER PAYOUT</td>
              <td colspan="2" style="text-align: right; font-size: 1.35rem; color: #0284c7;">
                ₹${record.totalPayout.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        ${record.adulterantsDetected && record.adulterantsDetected.length > 0 ? `
          <div style="background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.78rem; color: #991b1b;">
            <strong>Adulteration Warnings:</strong> ${record.adulterantsDetected.join(', ')}
          </div>
        ` : ''}

        <div class="receipt-qr-footer">
          <div style="font-size: 0.75rem; color: #64748b; max-width: 220px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Cloud Digital Passbook</div>
            Transmitted via ESP32 Controller to Dairy Dova Cloud Database. Scan QR to verify milk quality certificate.
          </div>
          <div class="qr-code-box">
            ${this.generateMockQRCodeSVG(record.batchId || record.id)}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 1.25rem;" class="no-print">
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.print()">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Slip
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.pricingEngine.simulateSMS('${record.farmerName}', '${record.totalPayout.toFixed(2)}')">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            Simulate SMS
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

  simulateSMS(name, amount) {
    if (window.soundCtrl) window.soundCtrl.playTick();
    if (window.app) {
      window.app.showToast(`📲 SMS Sent to ${name}: "DAIRY DOVA Credit: ₹${amount} has been paid directly into your bank account for your Grade A milk delivery."`, 'success');
    }
  }
}

window.pricingEngine = new PricingEngine();
