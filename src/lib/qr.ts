/**
 * Minimal QR code SVG generator.
 *
 * Encodes data in a QR code (mode: byte, error correction: L)
 * and returns an SVG string. Supports up to ~150 characters (version 1-6).
 *
 * Based on the QR code specification (ISO/IEC 18004).
 */

// ── Galois Field GF(256) with polynomial 0x11d ──

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(() => {
	let x = 1;
	for (let i = 0; i < 255; i++) {
		EXP[i] = x;
		LOG[x] = i;
		x = x << 1;
		if (x & 256) x ^= 0x11d;
	}
	for (let i = 255; i < 512; i++) {
		EXP[i] = EXP[i - 255];
	}
})();

function gfMul(a: number, b: number): number {
	if (a === 0 || b === 0) return 0;
	return EXP[LOG[a] + LOG[b]];
}

// ── Reed-Solomon error correction ──

function rsGeneratorPoly(degree: number): Uint8Array {
	let g = new Uint8Array([1]);
	for (let i = 0; i < degree; i++) {
		const next = new Uint8Array(g.length + 1);
		for (let j = 0; j < g.length; j++) {
			next[j] ^= g[j];
			next[j + 1] ^= gfMul(g[j], EXP[i]);
		}
		g = next;
	}
	return g;
}

function rsEncode(data: Uint8Array, ecLen: number): Uint8Array {
	const gen = rsGeneratorPoly(ecLen);
	const result = new Uint8Array(data.length + ecLen);
	result.set(data);
	for (let i = 0; i < data.length; i++) {
		const coef = result[i];
		if (coef !== 0) {
			for (let j = 0; j < gen.length; j++) {
				result[i + j] ^= gfMul(gen[j], coef);
			}
		}
	}
	return result.slice(data.length);
}

// ── QR code data structures ──

type VersionInfo = {
	version: number;
	size: number;
	dataBytes: number; // for EC level L, byte mode
	ecBytesPerBlock: number;
	numBlocks: number;
};

// Versions 1-10 for EC level L, byte mode
const VERSIONS: VersionInfo[] = [
	{ version: 1, size: 21, dataBytes: 19, ecBytesPerBlock: 7, numBlocks: 1 },
	{ version: 2, size: 25, dataBytes: 34, ecBytesPerBlock: 10, numBlocks: 1 },
	{ version: 3, size: 29, dataBytes: 55, ecBytesPerBlock: 15, numBlocks: 1 },
	{ version: 4, size: 33, dataBytes: 80, ecBytesPerBlock: 20, numBlocks: 1 },
	{ version: 5, size: 37, dataBytes: 108, ecBytesPerBlock: 26, numBlocks: 1 },
	{ version: 6, size: 41, dataBytes: 136, ecBytesPerBlock: 18, numBlocks: 2 },
	{ version: 7, size: 45, dataBytes: 156, ecBytesPerBlock: 20, numBlocks: 2 },
	{ version: 8, size: 49, dataBytes: 192, ecBytesPerBlock: 24, numBlocks: 2 },
	{ version: 9, size: 53, dataBytes: 224, ecBytesPerBlock: 30, numBlocks: 2 },
	{ version: 10, size: 57, dataBytes: 264, ecBytesPerBlock: 18, numBlocks: 4 },
];

function selectVersion(dataLen: number): VersionInfo {
	// In byte mode, overhead: 4 bits mode + char count bits (8 for v1-9, 16 for v10+) + data
	for (const v of VERSIONS) {
		const charCountBits = v.version <= 9 ? 8 : 16;
		const overhead = Math.ceil((4 + charCountBits) / 8);
		if (dataLen + overhead <= v.dataBytes) return v;
	}
	return VERSIONS[VERSIONS.length - 1];
}

// ── Bit stream utilities ──

class BitStream {
	bits: number[] = [];

	put(value: number, length: number) {
		for (let i = length - 1; i >= 0; i--) {
			this.bits.push((value >> i) & 1);
		}
	}

	toBytes(): Uint8Array {
		const bytes = new Uint8Array(Math.ceil(this.bits.length / 8));
		for (let i = 0; i < this.bits.length; i++) {
			bytes[i >> 3] |= this.bits[i] << (7 - (i & 7));
		}
		return bytes;
	}
}

// ── Module placement ──

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
	2: [6, 18],
	3: [6, 22],
	4: [6, 26],
	5: [6, 30],
	6: [6, 34],
	7: [6, 22, 38],
	8: [6, 24, 42],
	9: [6, 26, 46],
	10: [6, 28, 52],
};

function createMatrix(size: number): {
	matrix: number[][];
	reserved: boolean[][];
} {
	const matrix: number[][] = Array.from({ length: size }, () =>
		Array(size).fill(0),
	);
	const reserved: boolean[][] = Array.from({ length: size }, () =>
		Array(size).fill(false),
	);
	return { matrix, reserved };
}

function placeFinder(
	matrix: number[][],
	reserved: boolean[][],
	row: number,
	col: number,
) {
	for (let r = -1; r <= 7; r++) {
		for (let c = -1; c <= 7; c++) {
			const rr = row + r;
			const cc = col + c;
			if (rr < 0 || rr >= matrix.length || cc < 0 || cc >= matrix.length)
				continue;
			const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
			const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
			const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
			matrix[rr][cc] = (isOuter || isInner) && !isBorder ? 1 : 0;
			reserved[rr][cc] = true;
		}
	}
}

function placeAlignment(
	matrix: number[][],
	reserved: boolean[][],
	row: number,
	col: number,
) {
	for (let r = -2; r <= 2; r++) {
		for (let c = -2; c <= 2; c++) {
			const rr = row + r;
			const cc = col + c;
			if (reserved[rr][cc]) return; // overlaps finder
		}
	}
	for (let r = -2; r <= 2; r++) {
		for (let c = -2; c <= 2; c++) {
			const rr = row + r;
			const cc = col + c;
			const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
			const isCenter = r === 0 && c === 0;
			matrix[rr][cc] = isEdge || isCenter ? 1 : 0;
			reserved[rr][cc] = true;
		}
	}
}

function placeTiming(matrix: number[][], reserved: boolean[][], size: number) {
	for (let i = 8; i < size - 8; i++) {
		const v = i % 2 === 0 ? 1 : 0;
		if (!reserved[6][i]) {
			matrix[6][i] = v;
			reserved[6][i] = true;
		}
		if (!reserved[i][6]) {
			matrix[i][6] = v;
			reserved[i][6] = true;
		}
	}
}

function reserveFormatArea(reserved: boolean[][], size: number) {
	// Around top-left finder
	for (let i = 0; i <= 8; i++) {
		reserved[8][i] = true;
		reserved[i][8] = true;
	}
	// Around top-right finder
	for (let i = 0; i <= 7; i++) {
		reserved[8][size - 1 - i] = true;
	}
	// Around bottom-left finder
	for (let i = 0; i <= 7; i++) {
		reserved[size - 1 - i][8] = true;
	}
	// Dark module
	reserved[size - 8][8] = true;
}

function placeData(matrix: number[][], reserved: boolean[][], bits: number[]) {
	const size = matrix.length;
	let bitIdx = 0;
	let upward = true;

	for (let col = size - 1; col >= 0; col -= 2) {
		if (col === 6) col = 5; // skip timing column
		const rows = upward
			? Array.from({ length: size }, (_, i) => size - 1 - i)
			: Array.from({ length: size }, (_, i) => i);

		for (const row of rows) {
			for (const c of [col, col - 1]) {
				if (c < 0) continue;
				if (!reserved[row][c]) {
					matrix[row][c] = bitIdx < bits.length ? bits[bitIdx] : 0;
					bitIdx++;
				}
			}
		}
		upward = !upward;
	}
}

// ── Format information ──

const FORMAT_BITS: Record<number, number> = {
	0: 0x77c4,
	1: 0x72f3,
	2: 0x7daa,
	3: 0x789d,
	4: 0x662f,
	5: 0x6318,
	6: 0x6c41,
	7: 0x6976,
};

function placeFormatBits(
	matrix: number[][],
	size: number,
	maskPattern: number,
) {
	// EC level L = 01, combined with mask pattern
	const formatInfo = FORMAT_BITS[maskPattern] ?? 0x77c4;

	for (let i = 0; i <= 5; i++) {
		matrix[8][i] = (formatInfo >> (14 - i)) & 1;
	}
	matrix[8][7] = (formatInfo >> 8) & 1;
	matrix[8][8] = (formatInfo >> 7) & 1;
	matrix[7][8] = (formatInfo >> 6) & 1;
	for (let i = 0; i <= 5; i++) {
		matrix[5 - i][8] = (formatInfo >> (5 - i)) & 1;
	}

	for (let i = 0; i <= 7; i++) {
		matrix[size - 1 - i][8] = (formatInfo >> i) & 1;
	}
	for (let i = 0; i <= 7; i++) {
		matrix[8][size - 8 + i] = (formatInfo >> (7 - i)) & 1;
	}

	matrix[size - 8][8] = 1; // dark module
}

// ── Masking ──

type MaskFn = (row: number, col: number) => boolean;

const MASKS: MaskFn[] = [
	(r, c) => (r + c) % 2 === 0,
	(r) => r % 2 === 0,
	(_, c) => c % 3 === 0,
	(r, c) => (r + c) % 3 === 0,
	(r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
	(r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
	(r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
	(r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(
	matrix: number[][],
	reserved: boolean[][],
	maskIdx: number,
): number[][] {
	const size = matrix.length;
	const result = matrix.map((row) => [...row]);
	const fn = MASKS[maskIdx];
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (!reserved[r][c] && fn(r, c)) {
				result[r][c] ^= 1;
			}
		}
	}
	return result;
}

function scoreMask(matrix: number[][]): number {
	const size = matrix.length;
	let penalty = 0;

	// Rule 1: runs of same color
	for (let r = 0; r < size; r++) {
		let count = 1;
		for (let c = 1; c < size; c++) {
			if (matrix[r][c] === matrix[r][c - 1]) {
				count++;
			} else {
				if (count >= 5) penalty += count - 2;
				count = 1;
			}
		}
		if (count >= 5) penalty += count - 2;
	}
	for (let c = 0; c < size; c++) {
		let count = 1;
		for (let r = 1; r < size; r++) {
			if (matrix[r][c] === matrix[r - 1][c]) {
				count++;
			} else {
				if (count >= 5) penalty += count - 2;
				count = 1;
			}
		}
		if (count >= 5) penalty += count - 2;
	}

	// Rule 2: 2x2 blocks
	for (let r = 0; r < size - 1; r++) {
		for (let c = 0; c < size - 1; c++) {
			const v = matrix[r][c];
			if (
				v === matrix[r][c + 1] &&
				v === matrix[r + 1][c] &&
				v === matrix[r + 1][c + 1]
			) {
				penalty += 3;
			}
		}
	}

	return penalty;
}

// ── Main encoder ──

function encodeData(text: string): { bits: number[]; version: VersionInfo } {
	const data = new TextEncoder().encode(text);
	const version = selectVersion(data.length);
	const charCountBits = version.version <= 9 ? 8 : 16;

	const bs = new BitStream();
	bs.put(0b0100, 4); // byte mode
	bs.put(data.length, charCountBits);
	for (const byte of data) {
		bs.put(byte, 8);
	}
	// terminator
	bs.put(0, Math.min(4, version.dataBytes * 8 - bs.bits.length));
	// pad to byte boundary
	while (bs.bits.length % 8 !== 0) bs.put(0, 1);
	// pad bytes
	const padBytes = [0xec, 0x11];
	let padIdx = 0;
	while (bs.bits.length < version.dataBytes * 8) {
		bs.put(padBytes[padIdx % 2], 8);
		padIdx++;
	}

	const dataBytes = bs.toBytes();

	// Split into blocks and compute EC
	const blockSize = Math.floor(version.dataBytes / version.numBlocks);
	const longBlocks = version.dataBytes % version.numBlocks;
	const dataBlocks: Uint8Array[] = [];
	const ecBlocks: Uint8Array[] = [];
	let offset = 0;

	for (let i = 0; i < version.numBlocks; i++) {
		const len = blockSize + (i >= version.numBlocks - longBlocks ? 1 : 0);
		const block = dataBytes.slice(offset, offset + len);
		dataBlocks.push(block);
		ecBlocks.push(rsEncode(block, version.ecBytesPerBlock));
		offset += len;
	}

	// Interleave
	const allBits: number[] = [];
	const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
	for (let i = 0; i < maxDataLen; i++) {
		for (const block of dataBlocks) {
			if (i < block.length) {
				for (let bit = 7; bit >= 0; bit--) {
					allBits.push((block[i] >> bit) & 1);
				}
			}
		}
	}
	for (let i = 0; i < version.ecBytesPerBlock; i++) {
		for (const block of ecBlocks) {
			if (i < block.length) {
				for (let bit = 7; bit >= 0; bit--) {
					allBits.push((block[i] >> bit) & 1);
				}
			}
		}
	}

	return { bits: allBits, version };
}

function buildMatrix(text: string): number[][] {
	const { bits, version } = encodeData(text);
	const size = version.size;

	const { matrix, reserved } = createMatrix(size);

	// Place finder patterns
	placeFinder(matrix, reserved, 0, 0);
	placeFinder(matrix, reserved, 0, size - 7);
	placeFinder(matrix, reserved, size - 7, 0);

	// Place alignment patterns
	const alignPos = ALIGNMENT_POSITIONS[version.version];
	if (alignPos) {
		for (const r of alignPos) {
			for (const c of alignPos) {
				placeAlignment(matrix, reserved, r, c);
			}
		}
	}

	// Place timing patterns
	placeTiming(matrix, reserved, size);

	// Reserve format areas
	reserveFormatArea(reserved, size);

	// Place data
	placeData(matrix, reserved, bits);

	// Select best mask
	let bestMask = 0;
	let bestScore = Number.MAX_SAFE_INTEGER;
	for (let m = 0; m < 8; m++) {
		const masked = applyMask(matrix, reserved, m);
		const score = scoreMask(masked);
		if (score < bestScore) {
			bestScore = score;
			bestMask = m;
		}
	}

	const result = applyMask(matrix, reserved, bestMask);
	placeFormatBits(result, size, bestMask);

	return result;
}

/**
 * Generate an SVG string for a QR code encoding the given text.
 */
export function generateQrSvg(text: string, pixelSize = 8, margin = 4): string {
	const modules = buildMatrix(text);
	const size = modules.length;
	const totalSize = (size + margin * 2) * pixelSize;

	const paths: string[] = [];
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (modules[r][c]) {
				const x = (c + margin) * pixelSize;
				const y = (r + margin) * pixelSize;
				paths.push(`M${x},${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
			}
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
<rect width="${totalSize}" height="${totalSize}" fill="#fff"/>
<path d="${paths.join("")}" fill="#000"/>
</svg>`;
}

/**
 * Generate a data URL for a QR code SVG.
 */
export function generateQrDataUrl(
	text: string,
	pixelSize = 8,
	margin = 4,
): string {
	const svg = generateQrSvg(text, pixelSize, margin);
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
