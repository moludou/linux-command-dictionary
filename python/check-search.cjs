const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path'), assert=require('node:assert/strict');
const context={window:{}};
for(const file of ['module-catalog.js','api-lessons.js','core-lessons.js','csv-lessons.js','search.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context);
const engine=context.window.PYTHON_SEARCH, lessons=context.window.PYTHON_API_LESSONS;
const records=context.window.PYTHON_MODULE_CATALOG.modules.flatMap(module=>module.api.map(item=>{
  const title=`${module.name}.${item.name}`;
  return {title,name:item.name,text:`${title} ${JSON.stringify(item)} ${JSON.stringify(lessons[title]||{})}`};
}));
assert.equal(records.length,5890);
for(const query of ['typing.BinaryIO','BinaryIO','ＢｉｎａｒｙＩＯ（）','typing BinaryIO']) assert.equal(engine.find(records,query)[0].title,'typing.BinaryIO',query);
assert.equal(engine.find(records,'json.loads')[0].title,'json.loads');
assert.equal(engine.find(records,'pd.read_csv')[0].title,'pandas.read_csv');
assert(engine.find(records,'JSON 文字列').some(item=>item.title==='json.loads'));
assert.equal(engine.find(records,'存在しない確認語xyz').length,0);
assert.equal(engine.find(records,'　 ').length,0);
assert(engine.find(records,'read').length>60);
assert.equal(engine.find([{title:'pandas.read_csv',kind:'api',text:'pandas.read_csv'},{title:'pandas.read_csv()',kind:'entry',text:'pandas.read_csv'}],'pd.read_csv')[0].kind,'entry');
for(const [name,lesson] of Object.entries(lessons)) assert(lesson.summary.startsWith(name.split('.').pop()+'は、'),name);
console.log('PASS: 5,890 searchable APIs; qualified/short/full-width names, Japanese, multiple words, pandas alias, empty queries, name-first summaries');
