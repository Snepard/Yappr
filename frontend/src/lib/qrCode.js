/**
 * Ultra-lightweight standalone QR Code Matrix Generator (Byte Mode, ECC Level M/L)
 * Generates boolean 2D matrix (true = dark module, false = light module)
 * Completely dependency-free and runs in both browser and Node.js
 */

// Galois Field GF(256) tables with primitive polynomial 0x11d (285)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  LOG_TABLE[0] = 0;
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function polyMul(p, q) {
  const r = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      r[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return r;
}

function getGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return poly;
}

function calculateECC(dataBytes, eccCount) {
  const gen = getGeneratorPoly(eccCount);
  const msg = new Uint8Array(dataBytes.length + eccCount);
  msg.set(dataBytes);

  for (let i = 0; i < dataBytes.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(dataBytes.length);
}

// QR Code Specifications for versions 1-6 (Level M ECC)
const QR_SPECS = [
  null,
  { version: 1, size: 21, dataCapacity: 16, totalBytes: 26, eccBytes: 10, align: [] },
  { version: 2, size: 25, dataCapacity: 28, totalBytes: 44, eccBytes: 16, align: [6, 18] },
  { version: 3, size: 29, dataCapacity: 44, totalBytes: 70, eccBytes: 26, align: [6, 22] },
  { version: 4, size: 33, dataCapacity: 64, totalBytes: 100, eccBytes: 36, align: [6, 26] },
  { version: 5, size: 37, dataCapacity: 86, totalBytes: 134, eccBytes: 48, align: [6, 30] },
  { version: 6, size: 41, dataCapacity: 108, totalBytes: 172, eccBytes: 64, align: [6, 34] },
];

export function generateQRCodeMatrix(text) {
  const utf8Bytes = new TextEncoder().encode(text);
  const byteCount = utf8Bytes.length;

  // Find minimum version that fits data (Byte mode overhead = 4 mode bits + 8 count bits = 1.5 bytes)
  let spec = null;
  for (let v = 1; v < QR_SPECS.length; v++) {
    const s = QR_SPECS[v];
    if (byteCount + 2 <= s.dataCapacity) {
      spec = s;
      break;
    }
  }

  if (!spec) {
    spec = QR_SPECS[QR_SPECS.length - 1]; // Max fallback
  }

  const { size, dataCapacity, eccBytes, align } = spec;

  // 1. Bit Stream construction (Byte Mode = 0100)
  let bitBuffer = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(byteCount, 8); // Character count indicator
  for (let i = 0; i < byteCount; i++) {
    pushBits(utf8Bytes[i], 8);
  }

  // Terminator (up to 4 zeroes)
  const maxDataBits = dataCapacity * 8;
  const termLen = Math.min(4, maxDataBits - bitBuffer.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0);
  }

  // Pad bytes (0xEC, 0x11)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuffer.length < maxDataBits) {
    pushBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data bytes
  const dataBytes = new Uint8Array(dataCapacity);
  for (let i = 0; i < dataCapacity; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitBuffer[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Calculate Error Correction Codewords
  const eccData = calculateECC(dataBytes, eccBytes);

  // Interleaved Final Codewords
  const allCodewords = new Uint8Array(dataCapacity + eccBytes);
  allCodewords.set(dataBytes, 0);
  allCodewords.set(eccData, dataCapacity);

  // 2. Initialize Matrix (null = empty, true/false = reserved or set)
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r, c, val) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // 3. Draw Finder Patterns (7x7 at 3 corners)
  function drawFinder(top, left) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isDark =
          r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setModule(top + r, left + c, isDark);
      }
    }
    // Separators (1 module white around finders)
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          if (top + r >= 0 && top + r < size && left + c >= 0 && left + c < size) {
            setModule(top + r, left + c, false);
          }
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 4. Draw Alignment Patterns
  if (align.length > 0) {
    for (const r of align) {
      for (const c of align) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isDark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            setModule(r + dr, c + dc, isDark);
          }
        }
      }
    }
  }

  // 5. Draw Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setModule(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 6. Dark Module
  setModule(size - 8, 8, true);

  // 7. Format Information Area Reserve
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) isFunction[8][i] = true;
    if (!isFunction[i][8]) isFunction[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) isFunction[8][size - 1 - i] = true;
    if (!isFunction[size - 1 - i][8]) isFunction[size - 1 - i][8] = true;
  }

  // 8. Place Data Bits in matrix with zig-zag scanning
  let bitIdx = 0;
  const totalDataBits = allCodewords.length * 8;
  let dir = -1; // up
  let row = size - 1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing pattern column

    for (let i = 0; i < size; i++) {
      const r = row;
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (!isFunction[r][c]) {
          let bit = false;
          if (bitIdx < totalDataBits) {
            const bytePos = Math.floor(bitIdx / 8);
            const bitPos = 7 - (bitIdx % 8);
            bit = ((allCodewords[bytePos] >> bitPos) & 1) === 1;
            bitIdx++;
          }
          // Apply Standard Mask Pattern 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bit : bit;
        }
      }
      row += dir;
    }
    dir = -dir;
    row += dir;
    col -= 2;
  }

  // 9. Format Info: Mask Pattern 0 + ECC Level M (00) -> Format bits 0x5412 (XOR 0x5412 = 0)
  // Format code for Level M & Mask 000 is 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Draw format bits around top-left finder
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 0; i < 6; i++) matrix[5 - i][8] = formatBits[9 + i] === 1;

  // Draw format bits along other finders
  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = formatBits[7 + i] === 1;

  return matrix;
}
