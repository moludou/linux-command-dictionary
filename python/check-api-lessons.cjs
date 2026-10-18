// Run with Node.js; Python 3.12+ must be available as python3.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const context = {window: {}};
for (const file of ['module-catalog.js', 'api-lessons.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
}
const lessons = context.window.PYTHON_API_LESSONS;
const typing = context.window.PYTHON_MODULE_CATALOG.modules.find(m => m.name === 'typing');
for (const item of typing.api) assert(lessons[`typing.${item.name}`], `Missing lesson: ${item.name}`);
for (const [name, lesson] of Object.entries(lessons)) {
  for (const field of ['summary', 'syntax', 'explanation', 'code', 'output', 'caution']) {
    assert.equal(typeof lesson[field], 'string', `${name}.${field}`);
    assert(lesson[field].trim(), `Empty field: ${name}.${field}`);
  }
  const result = spawnSync('python3', ['-c', lesson.code], {encoding: 'utf8', timeout: 10000});
  assert.equal(result.status, 0, `${name}: ${result.stderr || result.error}`);
  if (name === 'typing.reveal_type') {
    assert.equal(result.stdout.trim(), '7');
    assert(result.stderr.includes("Runtime type is 'int'"));
  } else {
    assert.equal(result.stdout.trim(), lesson.output, name);
  }
}
console.log(`PASS: ${Object.keys(lessons).length} lessons, catalog coverage, and example outputs`);
