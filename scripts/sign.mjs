import { createPublicKey, createSign, createVerify } from 'node:crypto';

export function signBytes(privateKeyPem, bytes) {
  return createSign('SHA256').update(bytes).sign(privateKeyPem, 'base64');
}

export function verifyBytes(publicKeyBase64, bytes, signatureBase64) {
  const publicKey = createPublicKey({
    key: Buffer.from(publicKeyBase64, 'base64'),
    format: 'der',
    type: 'spki',
  });
  return createVerify('SHA256').update(bytes).verify(publicKey, signatureBase64, 'base64');
}
