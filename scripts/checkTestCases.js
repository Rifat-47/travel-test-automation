// Keeps test-cases/ and tests/ in step: unique IDs, every test documented,
// and no code files named in the documents.
import { globSync, readFileSync } from 'node:fs';

const ID = 'TRV-\\d+-[A-Z]+\\d+';
const problems = [];
const documented = new Set();
const automated = new Set();

for (const file of globSync('test-cases/*.md')) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const at = `${file}:${index + 1}`;
      const id = line.match(new RegExp(`^\\| (${ID}) \\|`))?.[1];
      if (id && documented.has(id)) problems.push(`${at} duplicate ID ${id}`);
      if (id) documented.add(id);
      if (/\w\.(jsx?|tsx?|py|mjs|cjs)\b/.test(line)) {
        problems.push(`${at} references a code file`);
      }
    });
}

for (const file of globSync('tests/**/*.spec.js')) {
  const titles = readFileSync(file, 'utf8').matchAll(
    /\btest(?:\.(?:fail|skip|fixme|only))?\(\s*(['"`])(.*?)\1/g,
  );
  for (const [, , title] of titles) {
    const id = title.match(new RegExp(`^${ID}`))?.[0];
    if (!id) problems.push(`${file} test without an ID: ${title}`);
    else if (!documented.has(id)) problems.push(`${file} ${id} has no test case`);
    else if (automated.has(id)) problems.push(`${file} ${id} is automated twice`);
    if (id) automated.add(id);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`${documented.size} test cases, ${automated.size} automated`);
