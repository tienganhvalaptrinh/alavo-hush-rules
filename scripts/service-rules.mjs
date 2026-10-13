export function findServiceProblems(service, protectedDomains) {
  return [
    ...findDuplicateComponentIds(service),
    ...service.components.flatMap((component) => findComponentProblems(component, protectedDomains)),
    ...findConflictingRules(service),
    ...findUnknownMeasuredPackages(service),
  ];
}

function findDuplicateComponentIds(service) {
  const seen = new Set();
  return service.components.flatMap(({ id }) => {
    const duplicate = seen.has(id);
    seen.add(id);
    return duplicate ? [`component id "${id}" appears more than once`] : [];
  });
}

function findComponentProblems(component, protectedDomains) {
  const where = `component "${component.id}"`;
  return [
    ...findKindProblems(component).map((message) => `${where}: ${message}`),
    ...findRuleProblems(component, protectedDomains).map((message) => `${where}: ${message}`),
  ];
}

function findKindProblems(component) {
  const { kind, packages, rules } = component;
  const problems = [];
  if (rules.length === 0) problems.push('needs at least one rule');
  if (kind === 'web' && packages.length > 0) problems.push('a web component must not list packages');
  if (kind !== 'web' && packages.length === 0) problems.push(`a ${kind} component needs at least one package`);
  if (kind !== 'web') problems.push(...findScopeOutsidePackages(component));
  if (kind === 'app') problems.push(...findNonBlockEverythingRules(component));
  if (kind === 'chat') problems.push(...findChatProblems(component));
  if (component.status !== 'stable' && component.enabledByDefault && hasBlockRule(component)) {
    problems.push(`status "${component.status}" with block rules must have enabledByDefault set to false`);
  }
  return problems;
}

function findScopeOutsidePackages({ packages, rules }) {
  return rules
    .filter(({ scope }) => scope === 'all' || scope.some((name) => !packages.includes(name)))
    .map(({ domain }) => `rule for "${domain}" must be scoped to the component's own packages`);
}

function findNonBlockEverythingRules({ rules }) {
  return rules
    .filter(({ domain, action }) => domain !== '*' || action !== 'block')
    .map(({ domain }) => `an app component only blocks everything: rule for "${domain}" is not allowed`);
}

function findChatProblems({ packages, rules }) {
  const allowsEverything = (name) =>
    rules.some(
      ({ domain, action, scope }) =>
        domain === '*' && action === 'allow' && Array.isArray(scope) && scope.includes(name),
    );
  const missing = packages.filter((name) => !allowsEverything(name)).map((name) => `needs an allow rule for "*" scoped to ${name}`);
  const blocking = rules.some(({ action }) => action === 'block') ? ['a chat component only allows'] : [];
  return [...missing, ...blocking];
}

function findRuleProblems(component, protectedDomains) {
  const problems = [];
  const seen = new Set();
  component.rules.forEach((rule) => {
    const key = ruleKey(rule);
    if (seen.has(key)) problems.push(`duplicate rule ${key}`);
    seen.add(key);
    if (rule.domain === '*' && rule.scope === 'all') problems.push('domain "*" must be scoped to specific packages');
    if (rule.action === 'block' && touchesProtectedDomain(rule.domain, protectedDomains)) {
      problems.push(`rule for "${rule.domain}" would block a protected domain`);
    }
  });
  return problems;
}

function findConflictingRules(service) {
  const actions = new Map();
  return service.components.flatMap((component) =>
    component.rules.flatMap((rule) => {
      const target = `${rule.domain} ${scopeKey(rule.scope)}`;
      const earlier = actions.get(target);
      actions.set(target, rule.action);
      return earlier && earlier !== rule.action
        ? [`rules conflict: "${rule.domain}" with scope ${scopeKey(rule.scope)} is both blocked and allowed`]
        : [];
    }),
  );
}

function findUnknownMeasuredPackages(service) {
  const known = new Set(service.components.flatMap(({ packages }) => packages));
  return service.measurements
    .filter(({ package: name }) => !known.has(name))
    .map(({ package: name }) => `measurement lists package "${name}" that no component uses`);
}

function hasBlockRule({ rules }) {
  return rules.some(({ action }) => action === 'block');
}

function touchesProtectedDomain(domain, protectedDomains) {
  if (domain === '*') return false;
  return protectedDomains.some(
    (name) => domain === name || domain.endsWith(`.${name}`) || name.endsWith(`.${domain}`),
  );
}

function ruleKey({ domain, action, scope }) {
  return `${action} ${domain} ${scopeKey(scope)}`;
}

function scopeKey(scope) {
  return scope === 'all' ? 'all' : [...scope].sort().join(',');
}
