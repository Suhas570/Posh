import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export interface CertificatePdfData {
  certificateId: string;
  serialNumber: string;
  candidateName: string;
  courseName: string;
  trainerName: string;
  organizationName: string;
  completionDate: Date;
  issueDate: Date;
  generatedTimestamp: Date;
  grade?: string | null;
  scorePercentage?: number | null;
  verificationUrl: string;
  qrPayload: string;
  barcodePayload: string;
}

const PAGE_WIDTH = 842; // A4 landscape (pt)
const PAGE_HEIGHT = 595;

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTimestamp(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

/** Draws a procedurally generated organization badge/logo (no external image asset required). */
function drawOrgLogo(doc: PDFKit.PDFDocument, x: number, y: number) {
  doc.save();
  doc.circle(x, y, 26).lineWidth(2.5).strokeColor('#1e3a8a').stroke();
  doc.circle(x, y, 20).fillColor('#1e3a8a').fill();
  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('LMS', x - 15, y - 7, { width: 30, align: 'center' });
  doc.restore();
}

/**
 * Repeats the full certificate ID diagonally across the entire page as the
 * certificate's watermark, defeating simple crop/redraw tampering and making
 * every square inch of the document traceable back to a single Certificate ID.
 * This is the ONLY watermark drawn on the certificate (the old large centered
 * "VERIFIED BY <ORG>" watermark has been removed in favor of this).
 */
function drawDiagonalTiledWatermark(doc: PDFKit.PDFDocument, text: string) {
  doc.save();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e3a8a').fillOpacity(0.09);

  const stepX = 190;
  const stepY = 55;
  doc.rotate(-30, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] });

  for (let y = -250; y < PAGE_HEIGHT + 250; y += stepY) {
    for (let x = -250; x < PAGE_WIDTH + 250; x += stepX) {
      doc.text(text, x, y, { lineBreak: false });
    }
  }
  doc.restore();
  doc.fillOpacity(1);
}

async function generateQrBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    scale: 6,
    color: { dark: '#0f172a', light: '#ffffffff' },
  });
}

async function generateBarcodeBuffer(payload: string): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: payload,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: 'center',
  });
}

/**
 * Renders a complete, tamper-evident certificate PDF to disk and returns the
 * absolute file path. All visible security features (watermarks, QR, barcode,
 * fingerprint fragment) are derived from server-issued, immutable data.
 */
export async function renderCertificatePdf(data: CertificatePdfData, outputDir: string): Promise<{ filePath: string; fileName: string }> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `${data.certificateId}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const [qrBuffer, barcodeBuffer] = await Promise.all([
    generateQrBuffer(data.qrPayload),
    generateBarcodeBuffer(data.barcodePayload),
  ]);

  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 0 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Background
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#fffdf7');

  // Outer + inner decorative border
  doc.lineWidth(3).strokeColor('#1e3a8a').rect(18, 18, PAGE_WIDTH - 36, PAGE_HEIGHT - 36).stroke();
  doc.lineWidth(1).strokeColor('#c9a227').rect(28, 28, PAGE_WIDTH - 56, PAGE_HEIGHT - 56).stroke();

  // Security watermark (drawn first, beneath all foreground content).
  // Full Certificate ID tiled diagonally across the whole page.
  drawDiagonalTiledWatermark(doc, data.certificateId);

  // Header: logo + org name
  drawOrgLogo(doc, 75, 70);
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(data.organizationName.toUpperCase(), 110, 55, { width: 400 });
  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(8)
    .text('Accredited Learning & Assessment Platform', 110, 73, { width: 400 });

  // Serial number (top right)
  doc
    .fillColor('#475569')
    .font('Helvetica')
    .fontSize(8)
    .text(`Serial No: ${data.serialNumber}`, PAGE_WIDTH - 260, 55, { width: 220, align: 'right' });
  doc.text(`Certificate ID: ${data.certificateId}`, PAGE_WIDTH - 260, 68, { width: 220, align: 'right' });

  // Title
  doc
    .fillColor('#1e3a8a')
    .font('Helvetica-Bold')
    .fontSize(30)
    .text('CERTIFICATE OF COMPLETION', 0, 130, { width: PAGE_WIDTH, align: 'center' });

  doc
    .moveTo(PAGE_WIDTH / 2 - 90, 172)
    .lineTo(PAGE_WIDTH / 2 + 90, 172)
    .lineWidth(1.5)
    .strokeColor('#c9a227')
    .stroke();

  doc
    .fillColor('#334155')
    .font('Helvetica')
    .fontSize(12)
    .text('This is to certify that', 0, 190, { width: PAGE_WIDTH, align: 'center' });

  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(26)
    .text(data.candidateName, 0, 212, { width: PAGE_WIDTH, align: 'center' });

  const scoreText = data.scorePercentage != null ? ` with a score of ${data.scorePercentage.toFixed(1)}%${data.grade ? ` (${data.grade})` : ''}` : '';

  doc
    .fillColor('#334155')
    .font('Helvetica')
    .fontSize(12)
    .text(
      `has successfully completed the course/assessment`,
      110,
      254,
      { width: PAGE_WIDTH - 220, align: 'center' }
    );

  doc
    .fillColor('#1e3a8a')
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(`"${data.courseName}"`, 110, 274, { width: PAGE_WIDTH - 220, align: 'center' });

  doc
    .fillColor('#334155')
    .font('Helvetica')
    .fontSize(11)
    .text(`conducted under the guidance of ${data.trainerName}${scoreText}.`, 110, 302, {
      width: PAGE_WIDTH - 220,
      align: 'center',
    });

  // Info row: dates
  const infoY = 340;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a');
  doc.text('Completion Date', 130, infoY, { width: 180, align: 'center' });
  doc.text('Issue Date', PAGE_WIDTH / 2 - 90, infoY, { width: 180, align: 'center' });
  doc.text('Certificate ID', PAGE_WIDTH - 310, infoY, { width: 180, align: 'center' });

  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  doc.text(formatDate(data.completionDate), 130, infoY + 14, { width: 180, align: 'center' });
  doc.text(formatDate(data.issueDate), PAGE_WIDTH / 2 - 90, infoY + 14, { width: 180, align: 'center' });
  doc.text(data.certificateId, PAGE_WIDTH - 310, infoY + 14, { width: 180, align: 'center' });

  // Signature block
  const sigY = 430;
  doc.moveTo(110, sigY).lineTo(280, sigY).lineWidth(1).strokeColor('#0f172a').stroke();
  doc.font('Helvetica-Oblique').fontSize(14).fillColor('#1e3a8a').text('Authorized Signatory', 110, sigY - 22, { width: 170 });
  doc.font('Helvetica').fontSize(9).fillColor('#334155').text(`${data.trainerName}`, 110, sigY + 5, { width: 170 });
  doc.text('Training & Certification Authority', 110, sigY + 17, { width: 170 });

  // QR code (verification)
  const qrSize = 78;
  doc.image(qrBuffer, PAGE_WIDTH - 190, sigY - 40, { width: qrSize, height: qrSize });
  doc.font('Helvetica').fontSize(7).fillColor('#475569').text('Scan to verify', PAGE_WIDTH - 190, sigY - 40 + qrSize + 2, {
    width: qrSize,
    align: 'center',
  });

  // Barcode (verification)
  doc.image(barcodeBuffer, 330, sigY - 30, { width: 180, height: 40 });

  // Verification text + footer
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#475569')
    .text(
      `Verify this certificate online at ${data.verificationUrl} using Certificate ID ${data.certificateId}, or scan the QR / barcode above.`,
      110,
      PAGE_HEIGHT - 78,
      { width: PAGE_WIDTH - 220, align: 'center' }
    );

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#94a3b8')
    .text(
      `Generated by ${data.organizationName} LMS on ${formatTimestamp(data.generatedTimestamp)}. This certificate is digitally secured and tamper-evident. Any modification to the candidate name, course, dates, certificate ID, QR code, barcode, or signature invalidates this document.`,
      70,
      PAGE_HEIGHT - 52,
      { width: PAGE_WIDTH - 140, align: 'center' }
    );

  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });

  return { filePath, fileName };
}
