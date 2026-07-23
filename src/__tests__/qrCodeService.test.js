/**
 * Unit Test Suite: QR Code Generator & Label Formatting
 */

import assert from 'node:assert';
import { test, describe } from 'node:test';
import { generateQRCodeSVG } from '../services/qrCodeService.js';

describe('QR Code Generation & Sticker Label Formatting Tests', () => {
  test('generateQRCodeSVG should return valid SVG markup with Copy ID payload', () => {
    const copyId = 'CPY-235088-001';
    const svgOutput = generateQRCodeSVG(copyId, 200);

    assert.strictEqual(svgOutput.includes('<svg'), true);
    assert.strictEqual(svgOutput.includes('</svg>'), true);
    assert.strictEqual(svgOutput.includes('width="200"'), true);
  });

  test('QR Code payload must NEVER embed raw passwords or sensitive tokens', () => {
    const copyId = 'CPY-9942';
    const svgOutput = generateQRCodeSVG(copyId);

    assert.strictEqual(svgOutput.includes('password'), false);
    assert.strictEqual(svgOutput.includes('secret'), false);
    assert.strictEqual(svgOutput.includes('token'), false);
  });
});
