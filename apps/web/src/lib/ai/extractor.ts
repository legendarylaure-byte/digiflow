'use client';

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase/config';

export interface ExtractedText {
  text: string;
  fileName: string;
  fileType: string;
  size: number;
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const buffer = await file.arrayBuffer();
  const fileName = file.name;
  const fileType = file.type || getFileTypeFromExtension(fileName);
  const size = file.size;

  let text = '';

  try {
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      text = new TextDecoder('utf-8').decode(buffer);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      text = await extractTextFromPdf(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      text = await extractTextFromDocx(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileName.endsWith('.xlsx')
    ) {
      text = await extractTextFromXlsx(buffer);
    } else if (fileType.startsWith('image/')) {
      text = '';
    } else {
      text = fileName.replace(/\.[^/.]+$/, '');
    }
  } catch {
    text = fileName.replace(/\.[^/.]+$/, '');
  }

  return { text: text.slice(0, 50000), fileName, fileType, size };
}

export async function uploadAndExtract(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ storagePath: string; downloadUrl: string; extracted: ExtractedText }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const storage = getStorage();
  const timestamp = Date.now();
  const storagePath = `documents/${user.uid}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        const extracted = await extractTextFromFile(file);
        resolve({ storagePath, downloadUrl, extracted });
      },
    );
  });
}

function getFileTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    txt: 'text/plain',
  };
  return types[ext || ''] || 'application/octet-stream';
}

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const textParts: string[] = [];
  let currentText = '';
  let inText = false;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x28) {
      inText = true;
      currentText = '';
    } else if (bytes[i] === 0x29) {
      inText = false;
      if (currentText.trim()) textParts.push(currentText.trim());
    } else if (inText && bytes[i] >= 0x20 && bytes[i] <= 0x7e) {
      currentText += String.fromCharCode(bytes[i]);
    }
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim() || 'No extractable text found';
}

async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const zip = await extractZip(buffer);
  const docXml = zip['word/document.xml'];
  if (!docXml) return 'No document content found';

  const textMatch = docXml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (!textMatch) return 'No text found in document';

  return textMatch
    .map((t: string) => t.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractTextFromXlsx(buffer: ArrayBuffer): Promise<string> {
  const zip = await extractZip(buffer);
  const sharedStrings = zip['xl/sharedStrings.xml'];
  const sheet = zip['xl/worksheets/sheet1.xml'];
  const textParts: string[] = [];

  const stringMap: string[] = [];
  if (sharedStrings) {
      const matches = sharedStrings.match(/<si[^>]*>[\s\S]*?<\/si>/g) || [];
    for (const si of matches) {
      const textMatch = si.match(/<t[^>]*>([^<]*)<\/t>/);
      stringMap.push(textMatch ? textMatch[1] : '');
    }
  }

  if (sheet) {
      const cellMatches = sheet.match(/<c[^>]*>[\s\S]*?<\/c>/g) || [];
    for (const cell of cellMatches) {
      const vMatch = cell.match(/<v>([^<]+)<\/v>/);
      if (vMatch) {
        const val = vMatch[1];
        const isString = cell.includes('t="s"');
        if (isString) {
          textParts.push(stringMap[parseInt(val)] || val);
        } else {
          textParts.push(val);
        }
      }
    }
  }

  return textParts.join(', ').trim() || 'No extractable data found';
}

async function extractZip(buffer: ArrayBuffer): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  const view = new DataView(buffer);
  let offset = 0;

  while (offset < buffer.byteLength - 30) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      offset++;
      continue;
    }

    const version = view.getUint16(offset + 4, true);
    const flags = view.getUint16(offset + 6, true);
    const compression = view.getUint16(offset + 8, true);
    const crc = view.getUint32(offset + 14, true);
    const compSize = view.getUint32(offset + 18, true);
    const uncompSize = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const nameBytes = new Uint8Array(buffer, offset + 30, nameLen);
    const name = new TextDecoder('utf-8').decode(nameBytes);

    const dataStart = offset + 30 + nameLen + extraLen;
    let data: Uint8Array;

    if (compression === 0) {
      data = new Uint8Array(buffer, dataStart, uncompSize);
    } else if (compression === 8) {
      const deflated = new Uint8Array(buffer, dataStart, compSize);
      data = inflateRaw(deflated);
    } else {
      offset = dataStart + compSize;
      continue;
    }

    if (!name.endsWith('/')) {
      files[name] = new TextDecoder('utf-8').decode(data);
    }

    offset = dataStart + compSize;
  }

  return files;
}

function inflateRaw(deflated: Uint8Array): Uint8Array {
  const output: number[] = [];
  let i = 0;

  while (i < deflated.length) {
    const header = deflated[i++];
    const isFinal = header & 0x01;
    const type = (header >> 1) & 0x03;

    if (type === 0) {
      i = (i + 3) & ~3;
      const len = deflated[i++] | (deflated[i++] << 8);
      i += 2;
      for (let j = 0; j < len && i < deflated.length; j++) {
        output.push(deflated[i++]);
      }
    } else if (type === 2) {
      const litTree = buildFixedTree(288, 0);
      const distTree = buildFixedTree(32, 1);

      const { result, newOffset } = decompressHuffman(deflated, i, litTree, distTree);
      output.push(...result);
      i = newOffset;
    }

    if (isFinal) break;
  }

  return new Uint8Array(output);
}

function buildFixedTree(numCodes: number, treeType: number): HuffmanTree {
  const lengths: number[] = [];
  if (treeType === 0) {
    for (let i = 0; i < 144; i++) lengths.push(8);
    for (let i = 144; i < 256; i++) lengths.push(9);
    for (let i = 256; i < 280; i++) lengths.push(7);
    for (let i = 280; i < 288; i++) lengths.push(8);
  } else {
    for (let i = 0; i < 32; i++) lengths.push(5);
  }
  return buildHuffmanTree(lengths);
}

interface HuffmanNode {
  value?: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

interface HuffmanTree {
  root: HuffmanNode;
}

function buildHuffmanTree(lengths: number[]): HuffmanTree {
  const maxLen = Math.max(...lengths);
  const blCount: number[] = new Array(maxLen + 1).fill(0);
  for (const len of lengths) if (len > 0) blCount[len]++;

  let code = 0;
  const nextCode: number[] = [];
  for (let bits = 1; bits <= maxLen; bits++) {
    code = (code + (blCount[bits - 1] || 0)) << 1;
    nextCode[bits] = code;
  }

  const codes: number[] = new Array(lengths.length).fill(-1);
  for (let i = 0; i < lengths.length; i++) {
    const len = lengths[i];
    if (len > 0) {
      codes[i] = nextCode[len]++;
    }
  }

  const root: HuffmanNode = {};
  for (let i = 0; i < codes.length; i++) {
    const len = lengths[i];
    if (len === 0) continue;
    let node = root;
    for (let b = len - 1; b >= 0; b--) {
      const bit = (codes[i] >> b) & 1;
      if (bit === 0) {
        if (!node.left) node.left = {};
        node = node.left;
      } else {
        if (!node.right) node.right = {};
        node = node.right;
      }
    }
    node.value = i;
  }

  return { root };
}

function decompressHuffman(
  data: Uint8Array,
  offset: number,
  litTree: HuffmanTree,
  distTree: HuffmanTree,
): { result: number[]; newOffset: number } {
  const result: number[] = [];
  let i = offset;
  let bitPos = 0;

  while (i < data.length) {
    const sym = readHuffmanSymbol(data, i, bitPos, litTree);
    if (sym === undefined) break;
    const bitsConsumed = sym.bits;
    i += Math.floor((bitPos + bitsConsumed) / 8);
    bitPos = (bitPos + bitsConsumed) % 8;
    const symbol = sym.value;

    if (symbol < 256) {
      result.push(symbol);
    } else if (symbol === 256) {
      break;
    } else {
      const lengthExtra = getLengthExtra(symbol - 257);
      let len = lengthExtra.base;
      if (lengthExtra.extraBits > 0) {
        const extra = readBits(data, i, bitPos, lengthExtra.extraBits);
        i += Math.floor((bitPos + extra.bits) / 8);
        bitPos = (bitPos + extra.bits) % 8;
        len += extra.value;
      }

      const distSym = readHuffmanSymbol(data, i, bitPos, distTree);
      if (distSym === undefined) break;
      const dBits = distSym.bits;
      i += Math.floor((bitPos + dBits) / 8);
      bitPos = (bitPos + dBits) % 8;

      const distExtra = getDistExtra(distSym.value);
      let dist = distExtra.base;
      if (distExtra.extraBits > 0) {
        const extra = readBits(data, i, bitPos, distExtra.extraBits);
        i += Math.floor((bitPos + extra.bits) / 8);
        bitPos = (bitPos + extra.bits) % 8;
        dist += extra.value;
      }

      for (let j = 0; j < len; j++) {
        if (result.length >= dist) {
          result.push(result[result.length - dist]);
        }
      }
    }
  }

  return { result, newOffset: i };
}

function readHuffmanSymbol(
  data: Uint8Array,
  byteOffset: number,
  bitOffset: number,
  tree: HuffmanTree,
): { value: number; bits: number } | undefined {
  let node = tree.root;
  let bits = 0;

  while (node.value === undefined) {
    const byte = data[byteOffset + Math.floor((bitOffset + bits) / 8)];
    if (byte === undefined) return undefined;
    const bit = (byte >> ((bitOffset + bits) % 8)) & 1;
    node = bit === 0 ? node.left! : node.right!;
    bits++;
  }

  return { value: node.value, bits };
}

function readBits(
  data: Uint8Array,
  byteOffset: number,
  bitOffset: number,
  count: number,
): { value: number; bits: number } {
  let value = 0;
  for (let i = 0; i < count; i++) {
    const byte = data[byteOffset + Math.floor((bitOffset + i) / 8)] || 0;
    const bit = (byte >> ((bitOffset + i) % 8)) & 1;
    value |= bit << i;
  }
  return { value, bits: count };
}

const LENGTH_TABLE = [
  { base: 3, extraBits: 0 }, { base: 4, extraBits: 0 }, { base: 5, extraBits: 0 },
  { base: 6, extraBits: 0 }, { base: 7, extraBits: 0 }, { base: 8, extraBits: 0 },
  { base: 9, extraBits: 0 }, { base: 10, extraBits: 0 }, { base: 11, extraBits: 1 },
  { base: 13, extraBits: 1 }, { base: 15, extraBits: 1 }, { base: 17, extraBits: 1 },
  { base: 19, extraBits: 2 }, { base: 23, extraBits: 2 }, { base: 27, extraBits: 2 },
  { base: 31, extraBits: 2 }, { base: 35, extraBits: 3 }, { base: 43, extraBits: 3 },
  { base: 51, extraBits: 3 }, { base: 59, extraBits: 3 }, { base: 67, extraBits: 4 },
  { base: 83, extraBits: 4 }, { base: 99, extraBits: 4 }, { base: 115, extraBits: 4 },
  { base: 131, extraBits: 5 }, { base: 163, extraBits: 5 }, { base: 195, extraBits: 5 },
  { base: 227, extraBits: 5 }, { base: 258, extraBits: 0 },
];

function getLengthExtra(index: number): { base: number; extraBits: number } {
  return LENGTH_TABLE[index] || { base: 258, extraBits: 0 };
}

const DIST_TABLE = [
  { base: 1, extraBits: 0 }, { base: 2, extraBits: 0 }, { base: 3, extraBits: 0 },
  { base: 4, extraBits: 0 }, { base: 5, extraBits: 1 }, { base: 7, extraBits: 1 },
  { base: 9, extraBits: 2 }, { base: 13, extraBits: 2 }, { base: 17, extraBits: 3 },
  { base: 25, extraBits: 3 }, { base: 33, extraBits: 4 }, { base: 49, extraBits: 4 },
  { base: 65, extraBits: 5 }, { base: 97, extraBits: 5 }, { base: 129, extraBits: 6 },
  { base: 193, extraBits: 6 }, { base: 257, extraBits: 7 }, { base: 385, extraBits: 7 },
  { base: 513, extraBits: 8 }, { base: 769, extraBits: 8 }, { base: 1025, extraBits: 9 },
  { base: 1537, extraBits: 9 }, { base: 2049, extraBits: 10 }, { base: 3073, extraBits: 10 },
  { base: 4097, extraBits: 11 }, { base: 6145, extraBits: 11 }, { base: 8193, extraBits: 12 },
  { base: 12289, extraBits: 12 }, { base: 16385, extraBits: 13 }, { base: 24577, extraBits: 13 },
];

function getDistExtra(index: number): { base: number; extraBits: number } {
  return DIST_TABLE[index] || { base: 32769, extraBits: 0 };
}
