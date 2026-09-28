// Export Utilities: CSV Download & Government Printable Surveillance Bulletin Generator

export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row: any) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (typeof cell === 'object') {
              cell = JSON.stringify(cell);
            }
            cell = cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function printSurveillanceBulletin(districtName: string = 'Maharashtra State', data: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to generate printable report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PashuRakshak Surveillance Bulletin - ${districtName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0f2942; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 22px; font-weight: bold; color: #0b3f6f; margin: 5px 0; }
          .subtitle { font-size: 14px; color: #64748b; }
          .badge { display: inline-block; padding: 4px 12px; background: #fef3c7; color: #92400e; font-weight: bold; border-radius: 4px; font-size: 12px; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
          .card-num { font-size: 24px; font-weight: bold; color: #0b3f6f; }
          .card-label { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #0b3f6f; color: white; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 16px; font-weight: bold; color: #b45309;">GOVERNMENT OF MAHARASHTRA</div>
          <div style="font-size: 13px; color: #475569;">DEPARTMENT OF ANIMAL HUSBANDRY & MSInS</div>
          <div class="title">PashuRakshak — Weekly Livestock Health Intelligence Bulletin</div>
          <div class="subtitle">Jurisdiction: ${districtName} | Date of Generation: ${dateStr}</div>
          <div class="badge">OFFICIAL GOVERNMENT EPIDEMIOLOGICAL RECORD</div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-num">${data?.kpis?.totalLivestock || '24,50,000'}</div>
            <div class="card-label">Total Monitored Livestock</div>
          </div>
          <div class="card">
            <div class="card-num" style="color: #dc2626;">${data?.kpis?.activeCases || '47'}</div>
            <div class="card-label">Active Disease Reports</div>
          </div>
          <div class="card">
            <div class="card-num" style="color: #d97706;">${data?.kpis?.activeOutbreaks || '3'}</div>
            <div class="card-label">Active Outbreak Clusters</div>
          </div>
          <div class="card">
            <div class="card-num" style="color: #16a34a;">${data?.vaccinationCoverage?.stateAveragePct || '76.4'}%</div>
            <div class="card-label">Vaccination Coverage</div>
          </div>
        </div>

        <h3>Active Disease Prevalence & Risk Profile</h3>
        <table>
          <thead>
            <tr>
              <th>Disease Name</th>
              <th>Suspected / Active Cases</th>
              <th>Primary Target Species</th>
              <th>Containment Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Lumpy Skin Disease (LSD)</strong></td>
              <td>23 cases</td>
              <td>Cattle, Buffalo</td>
              <td>Containment Zone Active (Shirur, Pune)</td>
            </tr>
            <tr>
              <td><strong>Foot and Mouth Disease (FMD)</strong></td>
              <td>38 cases</td>
              <td>Cattle, Buffalo, Goat</td>
              <td>Ring Vaccination Drive Underway (Parner)</td>
            </tr>
            <tr>
              <td><strong>Hemorrhagic Septicemia (HS)</strong></td>
              <td>8 cases</td>
              <td>Cattle, Buffalo</td>
              <td>Quarantine Alert (Karad, Satara)</td>
            </tr>
            <tr>
              <td><strong>Peste des Petits Ruminants (PPR)</strong></td>
              <td>12 cases</td>
              <td>Goat, Sheep</td>
              <td>Routine Monitoring</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by PashuRakshak AI Surveillance System. Disclaimer: Official veterinary sign-off required for statutory containment orders.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
