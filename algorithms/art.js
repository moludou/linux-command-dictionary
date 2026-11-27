// Classic scripts keep the atlas usable on GitHub Pages and from a local file.
const lessons = [];
const Art = (() => {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[c]);
  function svg(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" role="img" font-family="system-ui,sans-serif">' + inner + '</svg>';
  }
  function text(x, y, value, size=18, fill='#203747', anchor='middle') {
    return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+fill+'" text-anchor="'+anchor+'">'+esc(value)+'</text>';
  }
  function numbers(raw, minLen=1, maxLen=10) {
    const parts=raw.normalize('NFKC').trim().split(/[\s,、]+/);
    if(parts.length<minLen || parts.length>maxLen || parts.some(s => !/^\d{1,2}$/.test(s) || Number(s)<1)) {
      throw Error('1〜99 の整数を '+(minLen===maxLen ? minLen : minLen+'〜'+maxLen)+' 個、カンマで区切って入力してください。');
    }
    return parts.map(Number);
  }
  return {esc,svg,text,numbers};
})();
