'use strict';
const form = document.querySelector('#filters');
const search = document.querySelector('#search');
const theme = document.querySelector('#theme');
const star = document.querySelector('#star');
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
function filterReferences() {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let count = 0;
  document.querySelectorAll('.theme').forEach(section => {
    let visible = 0;
    section.querySelectorAll('.reference').forEach(card => {
      const match = (!theme.value || section.dataset.theme === theme.value)
        && (!star.checked || card.dataset.star === 'true')
        && terms.every(term => normalize(card.dataset.search).includes(term));
      card.hidden = !match;
      if (match) { visible++; count++; }
    });
    section.hidden = visible === 0;
  });
  document.querySelector('#count').textContent = `${count}件を表示 / 全53件`;
  document.querySelector('#empty').hidden = count !== 0;
}
form.addEventListener('input', filterReferences);
form.addEventListener('change', filterReferences);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => setTimeout(filterReferences, 0));
document.querySelectorAll('a[href^="#ref-"]').forEach(link => {
  link.addEventListener('click', () => {
    form.reset();
    filterReferences();
  });
});
filterReferences();
