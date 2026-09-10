/**
 * DAIRY DOVA - Dynamic SVG Data Visualizations
 * Lightweight, zero-dependency charts for quality trends, volume analysis, and purity ratios
 */

class ChartManager {
  // Render a responsive 7-Day Quality Trend SVG line chart
  renderTrendChart(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filter last 7 records
    const recent = records.slice(0, 7).reverse();
    if (recent.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-dim);">No collection records found.</div>`;
      return;
    }

    const width = 640;
    const height = 220;
    const padding = { top: 30, right: 30, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Determine scale for Fat & SNF (from 2.0 to 10.0)
    const minY = 2.0;
    const maxY = 10.0;
    const getY = val => padding.top + chartH - ((val - minY) / (maxY - minY)) * chartH;
    const getX = idx => padding.left + (idx / Math.max(1, recent.length - 1)) * chartW;

    // Build Fat points & SNF points
    let fatPoints = [];
    let snfPoints = [];
    let labels = [];

    recent.forEach((r, idx) => {
      const x = getX(idx);
      fatPoints.push(`${x},${getY(r.fat)}`);
      snfPoints.push(`${x},${getY(r.snf)}`);
      labels.push({ x, text: r.date.substring(5) + ' ' + (r.shift === 'Morning' ? 'M' : 'E') });
    });

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; font-family: var(--font-mono); overflow: visible;">
        <defs>
          <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="snfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines & Y-Axis -->
        ${[2, 4, 6, 8, 10].map(val => {
          const y = getY(val);
          return `
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
            <text x="${padding.left - 10}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end">${val}%</text>
          `;
        }).join('')}

        <!-- X-Axis Labels -->
        ${labels.map(l => `
          <text x="${l.x}" y="${height - 12}" fill="#94a3b8" font-size="10" text-anchor="middle">${l.text}</text>
        `).join('')}

        <!-- Fat Area & Line -->
        <polygon points="${padding.left},${padding.top + chartH} ${fatPoints.join(' ')} ${padding.left + chartW},${padding.top + chartH}" fill="url(#fatGrad)" />
        <polyline points="${fatPoints.join(' ')}" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- SNF Line -->
        <polyline points="${snfPoints.join(' ')}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Dots -->
        ${recent.map((r, idx) => {
          const x = getX(idx);
          const yFat = getY(r.fat);
          const ySnf = getY(r.snf);
          return `
            <circle cx="${x}" cy="${yFat}" r="4" fill="#0ea5e9" stroke="#070c14" stroke-width="2">
              <title>${r.date} Fat: ${r.fat}%</title>
            </circle>
            <circle cx="${x}" cy="${ySnf}" r="4" fill="#10b981" stroke="#070c14" stroke-width="2">
              <title>${r.date} SNF: ${r.snf}%</title>
            </circle>
          `;
        }).join('')}
      </svg>
    `;

    container.innerHTML = svg;
  }

  // Render Volume Distribution Bar Chart
  renderVolumeBars(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const recent = records.slice(0, 6).reverse();
    const maxVol = Math.max(60, ...recent.map(r => r.volume));
    const width = 500;
    const height = 180;
    const padX = 40;
    const padY = 30;
    const barWidth = 32;

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; font-family: var(--font-mono);">
        ${recent.map((r, idx) => {
          const step = (width - padX * 2) / recent.length;
          const x = padX + idx * step + (step - barWidth) / 2;
          const barH = (r.volume / maxVol) * (height - padY * 2);
          const y = height - padY - barH;
          const color = r.shift === 'Morning' ? '#38bdf8' : '#818cf8';

          return `
            <g>
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}" opacity="0.9" />
              <text x="${x + barWidth / 2}" y="${y - 6}" fill="#f1f5f9" font-size="10" font-weight="700" text-anchor="middle">${r.volume}L</text>
              <text x="${x + barWidth / 2}" y="${height - 12}" fill="#94a3b8" font-size="9" text-anchor="middle">${r.date.substring(8)} ${r.shift[0]}</text>
            </g>
          `;
        }).join('')}
      </svg>
    `;

    container.innerHTML = svg;
  }
}

window.chartManager = new ChartManager();
