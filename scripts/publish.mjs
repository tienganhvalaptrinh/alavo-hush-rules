import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { signBytes, verifyBytes } from './sign.mjs';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const OUT = 'dist';
const PUBLIC_KEY_PATH = 'keys/rules-signing.pub';

main();

function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  cpSync('index.json', `${OUT}/index.json`);
  cpSync('services', `${OUT}/services`, { recursive: true });
  signIndexIfKeyPresent();
}

function signIndexIfKeyPresent() {
  const privateKey = process.env.RULES_SIGNING_KEY;
  if (!privateKey) {
    console.warn('RULES_SIGNING_KEY is not set: publishing index.json without a signature.');
    return;
  }
  const bytes = readFileSync(`${OUT}/index.json`);
  const signature = signBytes(privateKey, bytes);
  verifyAgainstCommittedPublicKey(bytes, signature);
  writeFileSync(`${OUT}/index.json.sig`, `${signature}\n`);
  console.log('Wrote index.json.sig');
}

function verifyAgainstCommittedPublicKey(bytes, signature) {
  if (!existsSync(PUBLIC_KEY_PATH)) fail(`${PUBLIC_KEY_PATH} is missing, so the signature cannot be verified.`);
  const publicKey = readFileSync(PUBLIC_KEY_PATH, 'utf8').trim();
  if (!verifyBytes(publicKey, bytes, signature)) {
    fail(`The signature does not match ${PUBLIC_KEY_PATH}. The secret and the committed public key are not a pair.`);
  }
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}
