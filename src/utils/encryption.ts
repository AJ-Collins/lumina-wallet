const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const DIGEST = 'SHA-256';

function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

function generateIv() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(data: any, password: string) {
  const salt = generateSalt();
  const iv = generateIv();
  const key = await deriveKey(password, salt);
  
  const enc = new TextEncoder();
  const stringifiedData = typeof data === 'string' ? data : JSON.stringify(data);
  const encodedData = enc.encode(stringifiedData);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource
    },
    key,
    encodedData as unknown as BufferSource
  );

  return {
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encrypted)
  };
}

export async function decryptData(encryptedObj: { salt: string, iv: string, data: string }, password: string) {
  const salt = new Uint8Array(base64ToArrayBuffer(encryptedObj.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(encryptedObj.iv));
  const key = await deriveKey(password, salt);
  const encryptedData = base64ToArrayBuffer(encryptedObj.data);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      encryptedData as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed. Incorrect password or corrupted data.');
  }
}
