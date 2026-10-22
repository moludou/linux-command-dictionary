const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {PROJECTS, PRACTICES} = require('./data.js');
const {matchesLesson, highlight} = require('./app.js');
assert.deepEqual(PROJECTS.map(p => p.id), ['00','01','02','03','04','05bis','maze']);
assert.equal(PROJECTS.flatMap(p => p.lessons).length, 44);
for (const project of PROJECTS) {
  assert.equal(new Set(project.lessons.map(l => l.id)).size, project.lessons.length);
  for (const lesson of project.lessons) {
    assert.ok(PRACTICES[lesson.example]);
    assert.ok(lesson.goal && lesson.check && lesson.steps.length >= 3);
    for (const name of lesson.concepts) assert.ok(matchesLesson(lesson, name));
    assert.equal(matchesLesson(lesson, 'no_such_928491'), false);
  }
}
assert.ok(matchesLesson(PROJECTS[5].lessons[0], 'ＳＹＳ．ＰＲＥＦＩＸ'));
assert.ok(!highlight('print("<script>")').includes('<script>'));
for (const [name, sample] of Object.entries(PRACTICES)) {
  const normal = spawnSync('python3', ['-I', '-c', sample.code], {encoding:'utf8', timeout:5000});
  assert.equal(normal.status, 0, `${name}: ${normal.stderr}`);
  if (name === 'stream') {
    assert.equal(normal.stdout.trim(), 'result'); assert.equal(normal.stderr.trim(), 'notice');
  } else if (name === 'env') assert.match(normal.stdout.trim(), /^(True|False)$/);
  else assert.equal(normal.stdout.trim(), sample.output, name);
  const bad = spawnSync('python3', ['-I', '-c', sample.bad], {encoding:'utf8', timeout:5000});
  assert.notEqual(bad.status, 0, name);
  assert.ok(bad.stderr.includes(sample.error), `${name}: ${bad.stderr}`);
}
console.log(`PASS: 7 projects, 44 lessons, ${Object.keys(PRACTICES).length} normal/error pairs, search and escaping`);
// Exercise initialization, selection, filtering and clearing without a browser.
const vm = require('node:vm');
const fs = require('node:fs');
const elements = {};
for (const id of ['search','clear','projects','projectTitle','projectDescription','count','lessons']) {
  elements[id] = {value:'', innerHTML:'', textContent:'', events:{}, focus(){}, scrollIntoView(){}, addEventListener(event, fn){this.events[event] = fn;}};
}
const events = {};
const context = vm.createContext({document:{getElementById:id=>elements[id]}, window:{addEventListener:(event, fn)=>events[event]=fn}, location:{hash:''}});
vm.runInContext(fs.readFileSync(__dirname + '/data.js','utf8'), context);
vm.runInContext(fs.readFileSync(__dirname + '/app.js','utf8'), context);
assert.equal((elements.lessons.innerHTML.match(/<details/g)||[]).length, 8);
context.location.hash = '#05bis'; events.hashchange();
assert.equal(elements.projectTitle.textContent, 'Python_Module_05bis');
assert.equal((elements.lessons.innerHTML.match(/<details/g)||[]).length, 5);
elements.search.value = 'sys.prefix'; elements.search.events.input();
assert.equal((elements.lessons.innerHTML.match(/<details/g)||[]).length, 1);
elements.search.value = 'doesnotexist'; elements.search.events.input();
assert.ok(elements.lessons.innerHTML.includes('一致する項目がありません'));
elements.clear.events.click();
assert.equal((elements.lessons.innerHTML.match(/<details/g)||[]).length, 5);
for (const project of PROJECTS) {context.location.hash = '#' + project.id; events.hashchange(); assert.equal((elements.lessons.innerHTML.match(/<details/g)||[]).length, project.lessons.length);}
console.log('PASS: page initialization, seven selections, search, empty state and clear');
