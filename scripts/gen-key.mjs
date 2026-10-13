import { generateKeyPairSync } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const PUBLIC_KEY_PATH = 'keys/rules-signing.pub';
const force = process.argv.includes('--force');

main();

function main() {
  if (existsSync(PUBLIC_KEY_PATH) && !force) {
    console.error(`error: ${PUBLIC_KEY_PATH} already exists. Pass --force to replace it, which invalidates every released app that embeds the old key.`);
    process.exit(1);
  }
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  writeFileSync(PUBLIC_KEY_PATH, `${publicKey.export({ type: 'spki', format: 'der' }).toString('base64')}\n`);
  console.error(`Wrote ${PUBLIC_KEY_PATH}. Commit it.`);
  console.error('The private key is printed on stdout below. Save it as the GitHub secret RULES_SIGNING_KEY and do not store it anywhere else.\n');
  console.log(privateKey.export({ type: 'pkcs8', format: 'pem' }));
}
