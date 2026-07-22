/**
 * Export Utility Service for CSV & PDF generation
 */

/**
 * Export array of data objects to CSV file
 */
export const exportToCSV = (filename, headers, rows) => {
  if (!rows || !rows.length) return;

  const headerLine = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    headers
      .map((h) => {
        let val = row[h.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headerLine, ...rowLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Printable HTML / PDF view generator
 */
export const exportToPDF = (reportTitle, headers, rows) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tableHeaderHtml = headers.map((h) => `<th style="padding: 10px; border-bottom: 2px solid #2563EB; text-align: left; font-size: 12px; color: #475569;">${h.label}</th>`).join('');
  const tableRowsHtml = rows
    .map(
      (row) =>
        `<tr style="border-bottom: 1px solid #E2E8F0;">${headers
          .map((h) => `<td style="padding: 10px; font-size: 13px; color: #0F172A;">${row[h.key] ?? 'N/A'}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - Borrow Admin Portal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0F172A; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563EB; }
          .title { font-size: 18px; font-weight: 700; color: #0F172A; }
          .meta { font-size: 12px; color: #64748B; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .footer { margin-top: 40px; border-top: 1px solid #CBD5E1; padding-top: 15px; font-size: 11px; color: #94A3B8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Borrow Admin Portal</div>
          <div class="title">${reportTitle}</div>
        </div>
        <div class="meta">
          Generated on: <strong>${new Date().toLocaleString()}</strong> | Official Circulation Audit Report
        </div>
        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <div class="footer">
          Borrow Library Management Ecosystem • Confidential Administrative Report
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
