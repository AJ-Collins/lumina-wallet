const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const DIGEST = 'SHA-256';

function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

function generateIv() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(data, password) {
  const salt = generateSalt();
  const iv = generateIv();
  const key = await deriveKey(password, salt);
  
  const enc = new TextEncoder();
  const encodedData = enc.encode(typeof data === 'string' ? data : JSON.stringify(data));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedData
  );

  return {
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encrypted)
  };
}

export async function decryptData(encryptedObj, password) {
  const salt = base64ToArrayBuffer(encryptedObj.salt);
  const iv = base64ToArrayBuffer(encryptedObj.iv);
  const key = await deriveKey(password, salt);
  const encryptedData = base64ToArrayBuffer(encryptedObj.data);

  try {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed. Incorrect password or corrupted data.');
  }
}
