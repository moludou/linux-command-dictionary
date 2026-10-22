'use strict';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[_\s-]+/g, '');
function matchesLesson(lesson, query) {
  return normalize([lesson.id, lesson.title, lesson.goal, ...lesson.concepts, ...lesson.steps, lesson.check].join(' ')).includes(normalize(query));
}
function highlight(code) {
  const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[^\n]*|\b(?:def|class|return|if|else|elif|for|in|while|import|from|as|try|except|finally|raise|with|pass|yield|True|False|None|not|and|or)\b|\b\d+\b)/g;
  let result = '', end = 0;
  for (const token of code.matchAll(pattern)) {
    result += escapeHTML(code.slice(end, token.index));
    const type = /^['"]/.test(token[0]) ? 'str' : token[0][0] === '#' ? 'comment' : /^\d/.test(token[0]) ? 'num' : 'kw';
    result += `<span class="${type}">${escapeHTML(token[0])}</span>`;
    end = token.index + token[0].length;
  }
  return result + escapeHTML(code.slice(end));
}
function lessonHTML(lesson, opened) {
  const sample = PRACTICES[lesson.example];
  return `<details id="lesson-${escapeHTML(lesson.id)}" ${opened ? 'open' : ''}><summary>${escapeHTML(lesson.id)} · ${escapeHTML(lesson.title)}</summary><div class="body">
    <h3>何を作る？</h3><p>${escapeHTML(lesson.goal)}</p>
    <h3>使うクラス・関数・仕組み</h3><div class="tags">${lesson.concepts.map(name => `<span class="tag">${escapeHTML(name)}</span>`).join('')}</div>
    <h3>作る順番</h3><ol>${lesson.steps.map(step => `<li>${escapeHTML(step)}</li>`).join('')}</ol>
    <h3>短い実行例</h3><p class="muted">仕組みを確かめる小さな練習です。課題の完成コードではありません。Python 3で実行します。</p>
    <pre><code>${highlight(sample.code)}</code></pre><h3>期待する結果</h3><pre><code>${escapeHTML(sample.output)}</code></pre>
    <h3>エラー例</h3><pre><code>${highlight(sample.bad)}</code></pre><p class="error">発生する例外：<code>${escapeHTML(sample.error)}</code></p>
    <h3>原因と直し方</h3><p>${escapeHTML(sample.fix)}</p><h3>課題で確認すること</h3><p class="note">${escapeHTML(lesson.check)}</p>
    </div></details>`;
}
if (typeof document !== 'undefined') {
  const search = document.getElementById('search');
  let selected = PROJECTS[0];
  let opened = '';
  function renderLessons() {
    const lessons = selected.lessons.filter(lesson => matchesLesson(lesson, search.value));
    document.getElementById('count').textContent = `${lessons.length} / ${selected.lessons.length}項目 — タッチして解説を開く`;
    document.getElementById('lessons').innerHTML = lessons.length ? lessons.map(lesson => lessonHTML(lesson, lesson.id === opened)).join('') : '<p class="note">一致する項目がありません。別の語で検索するか、クリアしてください。</p>';
  }
  function selectProject() {
    const [id, lessonId] = location.hash.slice(1).split('/');
    selected = PROJECTS.find(project => project.id === id) || PROJECTS[0];
    opened = lessonId || '';
    search.value = '';
    document.getElementById('projects').innerHTML = PROJECTS.map(project => `<a class="project" href="#${project.id}" ${selected === project ? 'aria-current="page"' : ''}><strong>${escapeHTML(project.name)}</strong><small>${escapeHTML(project.subtitle)} · ${project.lessons.length}項目</small></a>`).join('');
    document.getElementById('projectTitle').textContent = selected.name;
    document.getElementById('projectDescription').textContent = `${selected.subtitle}。${selected.source}`;
    renderLessons();
  }
  search.addEventListener('input', renderLessons);
  document.getElementById('clear').addEventListener('click', () => {search.value = ''; renderLessons(); search.focus();});
  window.addEventListener('hashchange', () => {
    selectProject();
    document.getElementById('projectTitle').focus();
    document.getElementById('projectTitle').scrollIntoView({block:'start'});
  });
  selectProject();
}
if (typeof module !== 'undefined') module.exports = {matchesLesson, highlight, escapeHTML};
