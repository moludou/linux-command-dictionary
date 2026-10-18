// Shared by the browser and the search regression tests.
window.PYTHON_SEARCH = {
  normalize(value) { return String(value ?? '').normalize('NFKC').toLowerCase().replace(/\bpd\./g, 'pandas.').replace(/[()._]/g, '').replace(/\s+/g, ' ').trim(); },
  matches(text, query) {
    const haystack = this.normalize(text);
    return this.normalize(query).split(' ').filter(Boolean).every(word => haystack.includes(word));
  },
  find(records, query) {
    const q = this.normalize(query);
    if (!q) return [];
    return records.filter(record => this.matches(record.text, q)).map(record => {
      const title = this.normalize(record.title);
      const short = this.normalize(record.name || record.title);
      return {record, score: title === q ? 0 : short === q ? 1 : title.startsWith(q) ? 2 : title.includes(q) ? 3 : 4};
    }).sort((a,b) => a.score-b.score || a.record.title.localeCompare(b.record.title)).map(item=>item.record);
  }
};
