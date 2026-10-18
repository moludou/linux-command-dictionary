(() => {
  const lessons=window.PYTHON_API_LESSONS;
  const prefix='import csv\nfrom io import StringIO\n';
  function add(name,summary,syntax,explanation,code,output,bad,errorType,fix,caution) {
    lessons[`csv.${name}`]={summary:`${name}は、${summary}`,syntax,explanation,code:prefix+code,output,errorCode:prefix+bad,errorType,fixCode:prefix+fix,caution};
  }
  add('reader','CSVを1行ずつ読み、各行を文字列のリストとして返す関数です。','csv.reader(行を読み取れるもの, delimiter=",")','ファイル名ではなく、開いたファイルやStringIOを渡します。数値に見える列も通常はstrのままです。',
    'rows = csv.reader(StringIO("name,score\\nAki,80\\n"))\nprint(next(rows))\nprint(next(rows))',"['name', 'score']\n['Aki', '80']",
    'list(csv.reader([b"Aki,80"]))','Error','print(list(csv.reader(["Aki,80"])))','bytesの行は読めません。テキストとして開きます。実ファイルではopen(path, newline="", encoding="utf-8")を使い、CSV側に改行の処理を任せます。');
  add('writer','CSV形式の行を、書き込み先へ出力する関数です。','writer = csv.writer(書き込み先); writer.writerow(1行の値)','writerowは1行、writerowsは複数行を書きます。カンマを含む値などは必要に応じて引用符で囲まれます。',
    'file = StringIO(newline="")\nwriter = csv.writer(file, lineterminator="\\n")\nwriter.writerow(["Aki", 80])\nprint(repr(file.getvalue()))',"'Aki,80\\n'",
    'csv.writer("result.csv")','TypeError','file = StringIO()\ncsv.writer(file).writerow(["Aki", 80])\nprint(file.getvalue().strip())','ファイル名のstrにはwrite()がありません。実際の保存では書き込み用に開いたファイルを渡します。wモードは既存内容を上書きします。');
  add('DictReader','列名をキーにした辞書としてCSVの各行を読むクラスです。','csv.DictReader(ファイル)','既定では最初の行が列名になり、それ以降の行が辞書になります。行の値は通常strです。',
    'rows = csv.DictReader(StringIO("name,score\\nAki,80\\n"))\nrow = next(rows)\nprint(row["name"])\nprint(int(row["score"]) + 1)','Aki\n81',
    'row = next(csv.DictReader(StringIO("name\\nAki\\n")))\nprint(row["score"])','KeyError','row = next(csv.DictReader(StringIO("name\\nAki\\n")))\nprint(row.get("score", "未登録"))','存在しない列名を[]で読むとKeyErrorです。列名を確認するかgetで既定値を指定します。欠けたセルと存在しない列名は別です。');
  add('DictWriter','辞書の値を、指定した列順でCSVに書くクラスです。','csv.DictWriter(書き込み先, fieldnames=[列名, ...])','fieldnamesで出力順を決めます。列名の行はwriteheader()、データ行はwriterow()で書きます。',
    'file = StringIO(newline="")\nwriter = csv.DictWriter(file, fieldnames=["name", "score"], lineterminator="\\n")\nwriter.writeheader()\nwriter.writerow({"score": 80, "name": "Aki"})\nprint(repr(file.getvalue()))',"'name,score\\nAki,80\\n'",
    'writer = csv.DictWriter(StringIO(), fieldnames=["name"])\nwriter.writerow({"name": "Aki", "extra": 1})','ValueError','writer = csv.DictWriter(StringIO(), fieldnames=["name", "extra"])\nwriter.writerow({"name": "Aki", "extra": 1})','指定していないキーがあると既定ではValueErrorです。列に追加するか、不要であることを確認したうえでextrasaction="ignore"を指定します。');
  add('Error','CSVの読み書きで問題が起きたときの例外クラスです。','except csv.Error as error:','不正な引用符や、読み取り行の型の問題などを捕まえます。すべてのCSV関連エラーがこのクラスになるわけではありません。',
    'try:\n    list(csv.reader([b"Aki,80"]))\nexcept csv.Error:\n    print("テキストの行を渡してください")','テキストの行を渡してください',
    'list(csv.reader([b"Aki,80"]))','Error','print(list(csv.reader(["Aki,80"])))','except csv.Errorで処理できます。ファイルがない場合のFileNotFoundErrorや、設定値のTypeErrorなどは別の例外です。');
  add('Dialect','区切り文字や引用符など、CSVの書式設定をまとめる基底クラスです。','class Custom(csv.Dialect): ...','CSVには複数の書式があります。設定のまとまりをdialect（方言）と呼びます。通常はexcelなどの既存設定を利用・継承する方が簡単です。',
    'class Semi(csv.excel):\n    delimiter = ";"\nprint(next(csv.reader(["Aki;80"], dialect=Semi)))',"['Aki', '80']",
    'csv.reader([], delimiter=";;")','TypeError','print(next(csv.reader(["Aki;80"], delimiter=";")))','delimiterは1文字です。複数文字の区切りを指定しても読めるようにはなりません。');
  for(const [name,summary,delimiter,line] of [
    ['excel','一般的なカンマ区切りのCSV書式を表すクラスです。',',','Aki,80'],
    ['excel_tab','タブ区切りのCSV書式を表すクラスです。','\t','Aki\t80'],
    ['unix_dialect','改行をLFにし、出力する全フィールドを引用符で囲むCSV書式のクラスです。',',','Aki,80']
  ]) {
    const code=`print(next(csv.reader([${JSON.stringify(line)}], dialect=csv.${name})))`;
    add(name,summary,`csv.reader(file, dialect=csv.${name})`,'書式クラスはreaderやwriterのdialect引数に渡します。readerでは読み取り方、writerでは出力形式に反映されます。',code,"['Aki', '80']",`csv.reader([], dialect=csv.${name}, delimiter="")`,'TypeError',code,'delimiterを空文字にするとTypeErrorです。実際の区切り文字と書式が異なると、例外にならず1列として読まれることもあるため、列数も確認します。');
  }
  add('field_size_limit','CSVの1フィールドで読み取れる最大文字数を確認・設定する関数です。','csv.field_size_limit() / csv.field_size_limit(上限)','引数なしなら現在の上限を返します。設定すると同じプロセス内のCSV読み取りに影響するため、必要なら元へ戻します。',
    'old = csv.field_size_limit()\ntry:\n    csv.field_size_limit(1000)\n    print(csv.field_size_limit())\nfinally:\n    csv.field_size_limit(old)','1000',
    'csv.field_size_limit(2)\nlist(csv.reader(["abcd"]))','Error','csv.field_size_limit(1000)\nprint(list(csv.reader(["abcd"])))','長いセルが上限を超えるとcsv.Errorです。信頼できない巨大な入力に対して、無制限に大きな上限を設定しないでください。');
  add('get_dialect','名前で登録されたCSV書式を取得する関数です。','csv.get_dialect("excel")','取得した設定は読み取り専用です。別の設定にしたいときはreaderやwriterの引数で上書きします。',
    'dialect = csv.get_dialect("excel")\nprint(dialect.delimiter)',',',
    'csv.get_dialect("missing_example")','Error','print(csv.get_dialect("excel").delimiter)','存在しない登録名はcsv.Errorです。list_dialects()で名前を確認できます。excel_tabクラスに対応する既定の登録名はexcel-tabです。');
  add('list_dialects','現在登録されているCSV書式の名前を一覧で返す関数です。','csv.list_dialects()','戻り値は文字列のリストです。自分でregister_dialectした名前も含まれます。',
    'print("excel" in csv.list_dialects())','True',
    'csv.list_dialects("excel")','TypeError','print("excel" in csv.list_dialects())','引数は取りません。特定の名前が含まれるかはinで調べ、その設定を取得するときはget_dialectを使います。');
  add('register_dialect','CSVの書式に名前を付けて登録する関数です。','csv.register_dialect(名前, delimiter=";")','同じ書式を繰り返し使うときに便利です。登録の有効範囲は実行中のプロセスで、PC全体の設定を変更しません。',
    'csv.register_dialect("lesson_semi", delimiter=";")\ntry:\n    print(next(csv.reader(["Aki;80"], dialect="lesson_semi")))\nfinally:\n    csv.unregister_dialect("lesson_semi")',"['Aki', '80']",
    'csv.register_dialect("lesson_bad", delimiter=";;")','TypeError','csv.register_dialect("lesson_semi", delimiter=";")\nprint(csv.get_dialect("lesson_semi").delimiter)\ncsv.unregister_dialect("lesson_semi")','区切り文字は1文字です。同名の登録は置き換えるため、他の処理と衝突しない名前を使います。');
  add('unregister_dialect','登録済みのCSV書式を名前で削除する関数です。','csv.unregister_dialect(名前)','書式の登録表から消す操作です。CSVファイルそのものは消しません。',
    'csv.register_dialect("lesson_temp", delimiter=";")\ncsv.unregister_dialect("lesson_temp")\nprint("lesson_temp" in csv.list_dialects())','False',
    'csv.unregister_dialect("missing_example")','Error','if "lesson_temp" in csv.list_dialects():\n    csv.unregister_dialect("lesson_temp")\nprint("確認完了")','名前が存在しない場合はcsv.Errorです。登録状態を確認するか、必要な例外だけ捕まえます。');
  add('Sniffer','CSVのサンプルから区切り文字などの書式を推測するクラスです。','csv.Sniffer().sniff(サンプル文字列)','推測は保証ではありません。候補をdelimitersで絞ったり、読み取った列名・列数を検証したりして使います。',
    'sample = "name;score\\nAki;80\\n"\ndialect = csv.Sniffer().sniff(sample, delimiters=",;")\nprint(dialect.delimiter)', ';',
    'csv.Sniffer().sniff("")','Error','sample = "name;score\\nAki;80\\n"\nprint(csv.Sniffer().sniff(sample, delimiters=",;").delimiter)','空文字や判断できないサンプルではcsv.Errorです。ファイルをサンプルとして読んだ後、先頭から読み直すならseek(0)で位置を戻します。');
  const quoteRows=[
    ['QUOTE_ALL','すべてのフィールドを引用符で囲んで出力する設定です。','["Aki", 80]','"Aki","80"'],
    ['QUOTE_MINIMAL','区切り文字などを含む、必要なフィールドだけ引用符で囲む設定です。','["Aki,Tokyo", 80]','"Aki,Tokyo",80'],
    ['QUOTE_NONNUMERIC','数値以外を引用符で囲んで出力する設定です。','["Aki", 80]','"Aki",80'],
    ['QUOTE_NONE','フィールドを引用符で囲まない設定です。','["Aki", 80]','Aki,80'],
    ['QUOTE_NOTNULL','None以外を引用符で囲み、Noneを引用符なしの空欄にする設定です。','[None, "", 80]',',"","80"'],
    ['QUOTE_STRINGS','文字列を引用符で囲み、Noneは引用符なしの空欄にする設定です。','[None, "", 80]',',"",80']
  ];
  for(const [name,summary,values,output] of quoteRows) {
    const code=`file = StringIO()\nwriter = csv.writer(file, quoting=csv.${name}, lineterminator="\\n")\nwriter.writerow(${values})\nprint(file.getvalue().strip())`;
    add(name,summary,`csv.writer(file, quoting=csv.${name})`,'定数なので()を付けて呼びません。writerやreaderのquoting引数へ渡します。'+(name==='QUOTE_NONNUMERIC'?'読み取り時には引用符で囲まれていない値をfloatに変換します。':name==='QUOTE_NOTNULL'||name==='QUOTE_STRINGS'?'Python 3.12で追加されました。3.12のreaderにはこの設定が効かない既知の不具合があり、3.13で修正されています。例はwriterの動作です。':''),code,output,
      'file = StringIO()\ncsv.writer(file, quoting=csv.QUOTE_NONE).writerow(["Aki,Tokyo"])','Error',
      'file = StringIO()\ncsv.writer(file, quoting=csv.QUOTE_MINIMAL).writerow(["Aki,Tokyo"])\nprint(file.getvalue().strip())','QUOTE_NONEで区切り文字を含む値を出す場合はescapecharが必要です。引用符を使ってよいならQUOTE_MINIMALなどに変更すると、区切り文字を含む値を1つのセルとして表せます。');
  }
})();
