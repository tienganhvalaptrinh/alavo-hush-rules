import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { findServiceProblems } from './service-rules.mjs';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));

const checkOnly = process.argv.includes('--check');
const baseRef = readOption('--base');
const errors = [];
const outdated = [];
const ajv = loadSchemas();

main();

function main() {
  const protectedDomains = loadProtectedDomains();
  const services = loadServices(protectedDomains);
  checkVersionBumps(services);
  writeIndex(services);
  report();
}

function report() {
  errors.forEach((message) => console.error(`error: ${message}`));
  outdated.forEach((file) => console.error(`out of date: ${file}`));
  if (errors.length > 0) process.exit(1);
  if (outdated.length > 0) {
    console.error('Generated or formatted files are stale. Run "npm run build" and commit the result.');
    process.exit(1);
  }
  console.log(checkOnly ? 'All rules are valid and up to date.' : 'Build finished.');
}

function readOption(name) {
  const position = process.argv.indexOf(name);
  return position === -1 ? null : process.argv[position + 1];
}

function loadSchemas() {
  const instance = new Ajv({ allErrors: true, strict: true, strictRequired: false });
  readdirSync('schema').forEach((file) => {
    instance.addSchema(readJson(`schema/${file}`));
  });
  return instance;
}

function loadProtectedDomains() {
  const domains = readJson('protected-domains.json');
  return validate('protected-domains.schema.json', domains, 'protected-domains.json') ? domains : [];
}

function loadServices(protectedDomains) {
  return readdirSync('services')
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => loadService(file, protectedDomains))
    .filter(Boolean);
}

function loadService(file, protectedDomains) {
  const path = `services/${file}`;
  const service = readJson(path);
  if (service === null || !validate('service.schema.json', service, path)) return null;
  const expectedId = file.replace(/\.json$/, '');
  if (service.id !== expectedId) {
    errors.push(`${path}: id "${service.id}" must match the file name "${expectedId}"`);
    return null;
  }
  const problems = findServiceProblems(service, protectedDomains);
  problems.forEach((message) => errors.push(`${path}: ${message}`));
  if (problems.length > 0) return null;
  writeJson(path, service);
  return { path, service, text: serialize(service) };
}

function checkVersionBumps(entries) {
  if (baseRef === null) return;
  entries.forEach(({ path, service, text }) => {
    const base = readFromGit(baseRef, path);
    if (base === null) return;
    const changed = serialize(base) !== text;
    if (changed && service.version <= base.version) {
      errors.push(`${path}: content changed but version ${service.version} is not higher than ${base.version} on ${baseRef}`);
    }
  });
}

function readFromGit(ref, path) {
  try {
    const text = execFileSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function writeIndex(entries) {
  if (entries.length === 0) return;
  const index = {
    schemaVersion: 1,
    version: entries.reduce((sum, { service }) => sum + service.version, 0),
    services: entries.map(({ path, service, text }) => ({
      id: service.id,
      file: path,
      version: service.version,
      sha256: createHash('sha256').update(text).digest('hex'),
    })),
  };
  if (validate('index.schema.json', index, 'index.json')) writeJson('index.json', index);
}

function validate(schemaId, value, label) {
  const check = ajv.getSchema(schemaId);
  if (check(value)) return true;
  check.errors.forEach((problem) => errors.push(`${label}: ${problem.instancePath || '/'} ${problem.message}`));
  return false;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (problem) {
    errors.push(`${path}: ${problem.message}`);
    return null;
  }
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeJson(path, value) {
  const text = serialize(value);
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === text) return;
  if (checkOnly) outdated.push(path);
  else writeFileSync(path, text);
}
