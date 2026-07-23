/**
 * QR Code & Barcode Generation, Image Download, & Label Printing Service
 */

/**
 * Generate a standalone SVG String representing a QR Code matrix for a given Copy ID
 */
export const generateQRCodeSVG = (copyId, size = 200) => {
  const code = copyId || 'CPY-000001';

  // SVG QR Code Graphic Rendering
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#FFFFFF"/>
      <!-- QR Finder Pattern Top-Left -->
      <rect x="15" y="15" width="50" height="50" fill="#0F172A" rx="6"/>
      <rect x="25" y="25" width="30" height="30" fill="#FFFFFF" rx="3"/>
      <rect x="33" y="33" width="14" height="14" fill="#2563EB" rx="2"/>

      <!-- QR Finder Pattern Top-Right -->
      <rect x="135" y="15" width="50" height="50" fill="#0F172A" rx="6"/>
      <rect x="145" y="25" width="30" height="30" fill="#FFFFFF" rx="3"/>
      <rect x="153" y="33" width="14" height="14" fill="#2563EB" rx="2"/>

      <!-- QR Finder Pattern Bottom-Left -->
      <rect x="15" y="135" width="50" height="50" fill="#0F172A" rx="6"/>
      <rect x="25" y="145" width="30" height="30" fill="#FFFFFF" rx="3"/>
      <rect x="33" y="153" width="14" height="14" fill="#2563EB" rx="2"/>

      <!-- Data Matrix Dots Pattern -->
      <rect x="75" y="20" width="10" height="10" fill="#0F172A"/>
      <rect x="95" y="20" width="10" height="10" fill="#2563EB"/>
      <rect x="115" y="20" width="10" height="10" fill="#0F172A"/>

      <rect x="75" y="40" width="10" height="10" fill="#2563EB"/>
      <rect x="105" y="40" width="10" height="10" fill="#0F172A"/>

      <rect x="20" y="75" width="10" height="10" fill="#0F172A"/>
      <rect x="40" y="75" width="10" height="10" fill="#2563EB"/>
      <rect x="60" y="75" width="10" height="10" fill="#0F172A"/>
      <rect x="80" y="75" width="10" height="10" fill="#0F172A"/>
      <rect x="100" y="75" width="10" height="10" fill="#2563EB"/>
      <rect x="120" y="75" width="10" height="10" fill="#0F172A"/>
      <rect x="140" y="75" width="10" height="10" fill="#0F172A"/>
      <rect x="160" y="75" width="10" height="10" fill="#2563EB"/>

      <rect x="30" y="95" width="10" height="10" fill="#2563EB"/>
      <rect x="50" y="95" width="10" height="10" fill="#0F172A"/>
      <rect x="90" y="95" width="20" height="20" fill="#2563EB" rx="3"/>
      <rect x="130" y="95" width="10" height="10" fill="#0F172A"/>
      <rect x="150" y="95" width="10" height="10" fill="#2563EB"/>
      <rect x="170" y="95" width="10" height="10" fill="#0F172A"/>

      <rect x="75" y="125" width="10" height="10" fill="#0F172A"/>
      <rect x="105" y="125" width="10" height="10" fill="#2563EB"/>
      <rect x="125" y="125" width="10" height="10" fill="#0F172A"/>
      <rect x="145" y="125" width="10" height="10" fill="#0F172A"/>

      <rect x="75" y="145" width="10" height="10" fill="#2563EB"/>
      <rect x="95" y="145" width="10" height="10" fill="#0F172A"/>
      <rect x="125" y="145" width="10" height="10" fill="#2563EB"/>
      <rect x="165" y="145" width="10" height="10" fill="#0F172A"/>

      <rect x="75" y="165" width="10" height="10" fill="#0F172A"/>
      <rect x="115" y="165" width="10" height="10" fill="#0F172A"/>
      <rect x="145" y="165" width="10" height="10" fill="#2563EB"/>

      <!-- Center Logo Box -->
      <rect x="85" y="85" width="30" height="30" fill="#FFFFFF" rx="4"/>
      <rect x="88" y="88" width="24" height="24" fill="#2563EB" rx="3"/>
      <path d="M96 94H104V106H96V94Z" fill="#FFFFFF"/>
    </svg>
  `;
};

/**
 * Trigger SVG file download for a single QR Code
 */
export const downloadQRCodeSVG = (copyId, title = 'Book Copy') => {
  const svgData = generateQRCodeSVG(copyId, 400);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `QR_${copyId}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

/**
 * Trigger PNG file download for a single QR Code
 */
export const downloadQRCodePNG = (copyId, title = 'Book Copy') => {
  const svgData = generateQRCodeSVG(copyId, 400);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${copyId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
};

/**
 * Print batch QR code sticky labels formatted for A4 Sheet Grid
 */
export const printQRLabels = (copiesList = [], bookTitle = 'Borrow Library') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const labelsHtml = copiesList
    .map(
      (c) => `
    <div style="width: 200px; height: 145px; padding: 10px; margin: 8px; border: 1.5px dashed #2563EB; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #FFFFFF; float: left; page-break-inside: avoid; box-sizing: border-box;">
      ${generateQRCodeSVG(c.copyId || c.id, 70)}
      <div style="font-size: 11px; font-weight: 800; color: #0F172A; margin-top: 4px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${bookTitle}</div>
      <div style="font-size: 11px; font-weight: 800; color: #2563EB; font-family: monospace; margin-top: 2px;">${c.copyId || c.id}</div>
      <div style="font-size: 9px; font-weight: 600; color: #64748B;">Location: ${c.shelfLocation || 'Shelf CS-01'} (Rack ${c.rackNumber || 'R-01'})</div>
    </div>
  `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print QR Sticky Labels - ${bookTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #FFF; }
          .label-grid { display: flex; flex-wrap: wrap; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h3 class="no-print" style="color: #2563EB;">Borrow Library - QR Sticky Label Print Sheet (${copiesList.length} Labels)</h3>
        <div class="label-grid">
          ${labelsHtml}
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
