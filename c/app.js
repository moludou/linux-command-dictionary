const entries = [
  {name:'int',kind:'基本型',words:'整数 変数 型 宣言 初期化',description:'整数を入れる基本型です。変数を宣言するときに初期値を決めると、現在値を追いやすくなります。',code:'#include <stdio.h>\n\nint main(void) {\n    int count = 3;\n    count = count + 2;\n    printf("%d\\n", count);\n    return 0;\n}',output:'5',bad:'int count;\nprintf("%d\\n", count);',reason:'初期化していない自動変数の値を読み取っています。未定義動作になり得るため、結果は予測できません。',fix:'int count = 0;',note:'intの範囲は処理系に依存します。符号付き整数の範囲を超える計算は未定義動作です。'},
  {name:'if / else',kind:'条件分岐',words:'比較 条件 判定 分岐',description:'条件が0以外ならif側、0ならelse側を実行します。値を比べるときは == を使います。',code:'#include <stdio.h>\n\nint main(void) {\n    int score = 75;\n    if (score >= 60) {\n        printf("pass\\n");\n    } else {\n        printf("retry\\n");\n    }\n    return 0;\n}',output:'pass',bad:'int score = 0;\nif (score = 60) {\n    printf("pass\\n");\n}',reason:'= は代入です。scoreに60を入れ、条件の値も60になるため、常にif側へ進みます。構文エラーとは限らず、意図と違う処理になる例です。',fix:'if (score == 60) {\n    printf("exactly 60\\n");\n}',note:'== は等しいかの比較、= は値の代入です。'},
  {name:'for',kind:'繰り返し',words:'ループ 反復 繰り返し カウンタ',description:'初期化・継続条件・更新をまとめて書くループです。条件を確認してから本体を実行し、最後に更新します。',code:'#include <stdio.h>\n\nint main(void) {\n    for (int i = 0; i < 3; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}',output:'0\n1\n2',bad:'for (int i = 0; i < 3; i--) {\n    printf("%d\\n", i);\n}',reason:'iが減り続けるため、条件が偽になる方向へ進みません。最終的に符号付き整数の範囲を超えると未定義動作になります。',fix:'for (int i = 0; i < 3; i++) {\n    printf("%d\\n", i);\n}',note:'continueは残りの本体を飛ばして更新式へ進み、breakはループ自体を終了します。'},
  {name:'配列',kind:'データの並び',words:'array 添字 インデックス 要素',description:'同じ型の要素を並べたものです。3要素の配列なら、添字は0、1、2を使います。',code:'#include <stdio.h>\n\nint main(void) {\n    int values[3] = {10, 20, 30};\n    printf("%d\\n", values[1]);\n    return 0;\n}',output:'20',bad:'int values[3] = {10, 20, 30};\nprintf("%d\\n", values[3]);',reason:'添字3は配列の範囲外です。Cでは自動的に例外になるとは限らず、未定義動作になります。',fix:'printf("%d\\n", values[2]);',note:'最後の要素の添字は「要素数 - 1」です。配列の境界は自分で確認します。'},
  {name:'ポインタ',kind:'アドレス',words:'pointer アドレス メモリ 間接参照 & * NULL',description:'オブジェクトなどのアドレスを扱う型です。&で変数のアドレスを取得し、有効なポインタを*で間接参照します。',code:'#include <stdio.h>\n\nint main(void) {\n    int value = 10;\n    int *p = &value;\n    *p = 20;\n    printf("%d\\n", value);\n    return 0;\n}',output:'20',bad:'int *p = NULL;\n*p = 20;',reason:'NULLは有効なintオブジェクトを指していません。間接参照すると未定義動作になり、プログラムが異常終了する場合があります。',fix:'int value = 10;\nint *p = &value;\n*p = 20;',note:'この例ではvalueが存在している間だけ、そのアドレスを使います。NULLでないことだけで有効性が保証されるわけではありません。'},
  {name:'printf',kind:'標準ライブラリ関数',words:'stdio.h 出力 書式 文字列 表示',description:'書式文字列に従って標準出力へ表示します。<stdio.h>をインクルードし、書式指定と引数の型を合わせます。',code:'#include <stdio.h>\n\nint main(void) {\n    int count = 3;\n    printf("count=%d\\n", count);\n    printf("name=%s\\n", "C");\n    return 0;\n}',output:'count=3\nname=C',bad:'printf("%s\\n", 42);',reason:'%sは文字列へのポインタを要求しますが、整数を渡しています。型の不一致は未定義動作になります。',fix:'printf("%d\\n", 42);',note:'%dはint、%sは文字列、%zuはsize_tに使います。戻り値は出力した文字数で、出力エラー時は負の値です。'}
];
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function highlight(code) {
  return code.split(/("(?:\\.|[^"\\])*"|\b(?:int|void|return|if|else|for|NULL)\b|\b\d+\b)/g).map(token => {
    const safe = escapeHtml(token);
    if (token.startsWith('"')) return `<span class="code-string">${safe}</span>`;
    if (/^(int|void|return|if|else|for|NULL)$/.test(token)) return `<span class="code-keyword">${safe}</span>`;
    if (/^\d+$/.test(token)) return `<span class="code-number">${safe}</span>`;
    return safe;
  }).join('');
}
const list = document.querySelector('#entries');
list.innerHTML = entries.map((entry, index) => `<details class="entry" data-index="${index}"><summary><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.kind)}</span></summary><div class="entry-body"><p>${escapeHtml(entry.description)}</p><h3>実行例</h3><pre><code>${highlight(entry.code)}</code></pre><h3>実行結果</h3><pre><code>${escapeHtml(entry.output)}</code></pre><h3>間違いの例</h3><pre><code>${highlight(entry.bad)}</code></pre><p>${escapeHtml(entry.reason)}</p><h3>修正例</h3><pre><code>${highlight(entry.fix)}</code></pre><h3>覚えておくこと</h3><p>${escapeHtml(entry.note)}</p></div></details>`).join('');
document.querySelector('#c-search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  let count = 0;
  list.querySelectorAll('.entry').forEach((node, index) => {
    const entry = entries[index];
    const matches = `${entry.name} ${entry.kind} ${entry.words} ${entry.description}`.toLowerCase().includes(query);
    node.hidden = !matches;
    if (matches) count++;
  });
  document.querySelector('#count').textContent = `${count}項目`;
  document.querySelector('#empty').hidden = count !== 0;
});
