// Original examples: no user files, network, or persistent system changes.
(() => {
  const lessons=window.PYTHON_API_LESSONS;
  function add(module,name,summary,syntax,explanation,code,output,errorCode,errorType,fixCode,caution) {
    lessons[`${module}.${name}`]={summary:`${name}は、${summary}`,syntax,explanation,code,output,errorCode,errorType,fixCode,caution};
  }
  const j='import json\n';
  add('json','loads','JSON形式の文字列をPythonの辞書やリストに変換する関数です。','json.loads(JSON文字列)','文字列の中身を読み取り、オブジェクトならdict、配列ならlistを返します。ファイル名を渡す関数ではありません。',j+'data = json.loads(\'{"name": "Aki", "active": true}\')\nprint(data["name"])\nprint(data["active"])','Aki\nTrue',j+'json.loads("{name: 1}")','JSONDecodeError',j+'print(json.loads(\'{"name": 1}\'))','JSONのキーにはダブルクォートが必要です。Pythonの辞書をstr()で文字列化したものは、正しいJSONとは限りません。');
  add('json','dumps','Pythonの値をJSON形式の文字列にする関数です。','json.dumps(値, ensure_ascii=False, indent=2)','戻り値はstrです。ensure_ascii=Falseなら日本語をそのまま出力し、indentで見やすく改行できます。ファイルにはまだ保存しません。',j+'text = json.dumps({"name": "あき"}, ensure_ascii=False)\nprint(text)\nprint(type(text).__name__)','{"name": "あき"}\nstr',j+'json.dumps({1, 2})','TypeError',j+'print(json.dumps(sorted({1, 2})))','setはJSONに直接対応しません。順序が必要ならsorted()などでリストに直します。独自クラスにも変換方法の指定が必要です。');
  add('json','load','開いてあるファイルからJSONを読み取る関数です。','json.load(読み取り用ファイル)','loadはファイル、loadsは文字列を受け取ります。例のStringIOはメモリー内のファイルなので、実ファイルを用意せず試せます。',j+'from io import StringIO\nwith StringIO(\'{"score": 80}\') as file:\n    data = json.load(file)\nprint(data["score"])','80',j+'json.load("data.json")','AttributeError',j+'from io import StringIO\nprint(json.load(StringIO(\'{"score": 80}\')))','文字列にはファイルを読むread()がありません。実ファイルならwith open("data.json", encoding="utf-8") as file:で開き、fileを渡します。');
  add('json','dump','Pythonの値をJSONとして、開いてあるファイルに書き込む関数です。','json.dump(値, 書き込み用ファイル)','dumpはファイルに書き、dumpsは文字列を返します。戻り値はNoneです。例ではメモリー内だけに書き込みます。',j+'from io import StringIO\nfile = StringIO()\nresult = json.dump({"score": 80}, file)\nprint(file.getvalue())\nprint(result)','{"score": 80}\nNone',j+'json.dump({"score": 80}, "data.json")','AttributeError',j+'from io import StringIO\nfile = StringIO()\njson.dump({"score": 80}, file)\nprint(file.getvalue())','ファイル名でなくwrite()を持つ書き込み先を渡します。実ファイルをwモードで開くと既存内容を消して上書きします。');
  add('json','JSONDecoder','JSONを読み取る処理を設定し、繰り返し利用するクラスです。','decoder = json.JSONDecoder(); decoder.decode(文字列)','単発の変換はloadsで十分です。クラスを使うと読み取り方法を設定したオブジェクトを保持できます。',j+'decoder = json.JSONDecoder()\nprint(decoder.decode("[10, 20]")[1])','20',j+'json.JSONDecoder().decode("[1,]")','JSONDecodeError',j+'print(json.JSONDecoder().decode("[1]"))','JSONでは最後の要素の後に余分なカンマを書けません。JSONとPythonのリスト表記のルールを混同しないようにします。');
  add('json','JSONEncoder','Pythonの値からJSONを作る処理を設定するクラスです。','encoder = json.JSONEncoder(); encoder.encode(値)','独自の変換を追加する基底クラスとしても使います。通常はdumpsで足ります。encodeの戻り値はstrです。',j+'encoder = json.JSONEncoder(ensure_ascii=False)\nprint(encoder.encode(["日本語", 1]))','["日本語", 1]',j+'json.JSONEncoder().encode(1+2j)','TypeError',j+'print(json.JSONEncoder().encode({"real": 1, "imag": 2}))','複素数はJSONに直接対応しません。実部・虚部を別の数値として辞書にするなど、保存形式を決めます。');
  add('json','JSONDecodeError','JSONの書式が壊れているときに発生する例外のクラスです。','except json.JSONDecodeError as error:','exceptで捕まえると、処理を中断せずエラーを説明できます。linenoは行番号、colnoは列番号です。検出位置や文面はPythonの版によって変わる場合があります。',j+'try:\n    json.loads("[1,]")\nexcept json.JSONDecodeError as error:\n    print(error.lineno)','1',j+'json.loads("[1,]")','JSONDecodeError',j+'print(json.loads("[1]"))','例外を捕まえるだけで入力が修復されるわけではありません。位置を確認して、余分なカンマなどを直します。');
  const pathCases=[
    ['Path','実行中のOSに合わせて、パスの組み立てや実際のファイル操作を行うクラスです。','Path("notes") / "memo.txt"','Pathを作るだけではファイルは作成されません。exists()で存在を調べ、read_text()などで内容を読みます。','p = Path("notes") / "memo.txt"\nprint(p.name)\nprint(p.suffix)','memo.txt\n.txt'],
    ['PurePath','OSに合ったパスの文字列操作だけを行うクラスです。','PurePath("notes") / "memo.txt"','ファイルにアクセスせず、名前や拡張子の抽出などを行います。exists()やread_text()はありません。','p = PurePath("notes") / "memo.txt"\nprint(p.name)','memo.txt'],
    ['PurePosixPath','LinuxやMac形式のパスを、どのOSでも文字列として扱うクラスです。','PurePosixPath("/home/user/memo.txt")','区切り文字は/です。実在するファイルかどうかは調べません。Windows上でもこの形式のパスを解析できます。','p = PurePosixPath("/home/user/memo.txt")\nprint(p.parent)\nprint(p.name)','/home/user\nmemo.txt'],
    ['PureWindowsPath','Windows形式のパスを、どのOSでも文字列として扱うクラスです。','PureWindowsPath(r"C:\\notes\\memo.txt")','ドライブ名やバックスラッシュをWindowsのルールで解釈します。先頭のrはバックスラッシュを特殊文字として処理しない文字列の書き方です。','p = PureWindowsPath(r"C:\\notes\\memo.txt")\nprint(p.drive)\nprint(p.name)','C:\nmemo.txt'],
    ['PosixPath','LinuxやMac上で実際のファイル操作を行うパスクラスです。','PosixPath("notes/memo.txt")','OSに合わせて自動選択したい場合はPathを使います。Windowsではこのクラスを直接生成できません。','import os\nif os.name != "nt":\n    print(PosixPath("notes/memo.txt").name)\nelse:\n    print("この例はLinux・Mac向けです")','memo.txt'],
    ['WindowsPath','Windows上で実際のファイル操作を行うパスクラスです。','WindowsPath(r"C:\\notes\\memo.txt")','LinuxやMacでは直接生成できません。Windows形式を文字列として解析するだけならPureWindowsPathです。','import os\nif os.name == "nt":\n    print(WindowsPath(r"C:\\notes\\memo.txt").name)\nelse:\n    print("この例はWindows向けです")','この例はWindows向けです']
  ];
  for(const [name,summary,syntax,explanation,example,output] of pathCases) {
    const prefix=`from pathlib import ${name}\n`;
    add('pathlib',name,summary,syntax,explanation,prefix+example,output,
      'from pathlib import PurePath\nPurePath("memo.txt").read_text()','AttributeError',
      'from pathlib import Path\np = Path("memo.txt")\nprint(p.name)',
      'Pure系のクラスはファイルを読めません。実際の読み書きにはPathを使います。Path.read_text()でも、存在しないパスを読むとFileNotFoundErrorです。');
  }
  const mathRows=[
    ['acos','余弦の値から角度をラジアンで求めます。','xは-1以上1以下です。','1','0.0','2','ValueError','1'],
    ['acosh','双曲線余弦の逆関数を計算します。','xは1以上です。','1','0.0','0','ValueError','1'],
    ['asin','正弦の値から角度をラジアンで求めます。','xは-1以上1以下です。','0','0.0','2','ValueError','0'],
    ['asinh','双曲線正弦の逆関数を計算します。','実数を受け取り、floatを返します。','0','0.0','"0"','TypeError','0'],
    ['atan','正接の値から角度をラジアンで求めます。','実数を受け取り、-π/2からπ/2の間の角度を返します。','0','0.0','"0"','TypeError','0'],
    ['atan2','座標(x, y)の方向をラジアンで求めます。','引数はy, xの順です。象限を区別して角度を返します。','0, 1','0.0','0','TypeError','0, 1'],
    ['atanh','双曲線正接の逆関数を計算します。','xは-1より大きく1より小さい値です。端の±1は含みません。','0','0.0','1','ValueError','0'],
    ['cbrt','実数の立方根を求めます。','負の数も使えます。Python 3.11以降で利用できます。','27','3.0','"27"','TypeError','27'],
    ['ceil','値以上の最小の整数へ切り上げます。','戻り値は整数です。負の数でも数直線の右側へ丸めます。','-1.2','-1','float("inf")','OverflowError','-1.2'],
    ['floor','値以下の最大の整数へ切り下げます。','-1.2は-2です。0方向への切り捨てとは異なります。','-1.2','-2','float("inf")','OverflowError','-1.2'],
    ['trunc','小数部分を0方向へ切り捨てます。','正の値はfloorと同じ、負の値はceilと同じ結果になります。','-1.8','-1','"1.8"','TypeError','-1.8'],
    ['comb','n個から順序を区別せずk個を選ぶ組合せの数を求めます。','引数は非負の整数n, kです。k > nなら0です。','5, 2','10','5, -1','ValueError','5, 2'],
    ['perm','n個から順序を区別してk個を選ぶ並べ方の数を求めます。','kを省くとn!です。非負の整数を渡します。','5, 2','20','5, -1','ValueError','5, 2'],
    ['copysign','第1引数の大きさに、第2引数の符号を付けます。','戻り値はfloatです。第2引数の絶対値は使いません。','3, -1','-3.0','3, "-"','TypeError','3, -1'],
    ['cos','角度の余弦を求めます。','引数の単位は度ではなくラジアンです。','0','1.0','float("inf")','ValueError','0'],
    ['sin','角度の正弦を求めます。','度を使う場合は先にradians()でラジアンへ直します。','0','0.0','float("inf")','ValueError','0'],
    ['tan','角度の正接を求めます。','引数はラジアンです。π/2付近では値が極端に大きくなる点に注意します。','0','0.0','float("inf")','ValueError','0'],
    ['cosh','双曲線余弦を計算します。','指数関数を使った数学関数です。大きすぎる入力では表現範囲を超えます。','0','1.0','1000','OverflowError','0'],
    ['sinh','双曲線正弦を計算します。','(exp(x)-exp(-x))/2に相当する数学関数です。','0','0.0','1000','OverflowError','0'],
    ['tanh','双曲線正接を計算します。','実数を-1から1の範囲へ写す数学関数です。','0','0.0','"0"','TypeError','0'],
    ['degrees','ラジアンで表された角度を度へ変換します。','πラジアンは180度です。','math.pi','180.0','"pi"','TypeError','math.pi'],
    ['radians','度で表された角度をラジアンへ変換します。','sinやcosに度の値を渡す前に使います。','0','0.0','"90"','TypeError','90'],
    ['dist','2つの座標の直線距離を求めます。','p, qは同じ次元数の座標列です。','[0, 0], [3, 4]','5.0','[0], [3, 4]','ValueError','[0, 0], [3, 4]'],
    ['hypot','原点から指定した座標までの距離を求めます。','各座標を引数として渡します。hypot(3, 4)は5です。','3, 4','5.0','"3", 4','TypeError','3, 4'],
    ['erf','統計などで使う誤差関数の値を計算します。','正規分布の確率計算などに使う数学関数です。入力は実数です。','0','0.0','"0"','TypeError','0'],
    ['erfc','誤差関数の補数を計算します。','1-erf(x)に相当します。1から直接引く際の精度低下を避ける用途があります。','0','1.0','"0"','TypeError','0'],
    ['exp','自然対数の底eのx乗を計算します。','大きすぎる正の入力ではOverflowErrorになります。','0','1.0','1000','OverflowError','0'],
    ['exp2','2のx乗を計算します。','Python 3.11以降の関数です。戻り値はfloatです。','3','8.0','10000','OverflowError','3'],
    ['expm1','eのx乗から1を引いた値を計算します。','xが0に近いとき、exp(x)-1より精度を保ちやすい計算です。','0','0.0','1000','OverflowError','0'],
    ['fabs','実数の絶対値をfloatで返します。','組み込みabsとは異なり、複素数は受け取りません。','-3','3.0','1+2j','TypeError','-3'],
    ['factorial','非負の整数nの階乗を計算します。','5!は5×4×3×2×1です。0!は1です。','5','120','-1','ValueError','5'],
    ['fmod','実数の除算の余りを求めます。','結果の符号は第1引数側に付きます。%演算子とは符号の規則が異なります。','-5, 2','-1.0','5, 0','ValueError','5, 2'],
    ['remainder','最も近い整数商を使った余りを求めます。','x-n*yのnはx/yに最も近い整数です。同距離なら偶数側です。%とは別の規則です。','5, 2','1.0','5, 0','ValueError','5, 2'],
    ['frexp','実数を仮数と2の指数に分解します。','(m, e)を返し、元の値はm*2**eです。0以外なら0.5 <= abs(m) < 1です。','8','(0.5, 4)','"8"','TypeError','8'],
    ['ldexp','仮数xと整数の指数iからx*2**iを計算します。','frexpで分けた値を組み立てる逆の操作です。','0.5, 4','8.0','0.5, 1.5','TypeError','0.5, 4'],
    ['fsum','数値列の和を、浮動小数点の丸め誤差を抑えて求めます。','引数は数値のリストなどです。通常のsumで失われる小さい項を保ちやすくなります。','[1e16, 1, -1e16]','1.0','[1, "2"]','TypeError','[1, 2]'],
    ['gamma','ガンマ関数の値を計算します。','正の整数nなら(n-1)!です。0や負の整数では定義されません。','5','24.0','0','ValueError','5'],
    ['lgamma','ガンマ関数の絶対値の自然対数を求めます。','ガンマ関数が大きな値になる計算を、対数で扱う用途があります。','1','0.0','0','ValueError','1'],
    ['gcd','整数の最大公約数を求めます。','複数の整数を渡せます。結果は非負です。','12, 18','6','1.5, 3','TypeError','12, 18'],
    ['lcm','整数の最小公倍数を求めます。','いずれかが0なら結果は0です。','4, 6','12','1.5, 3','TypeError','4, 6'],
    ['isclose','2つの数が許容誤差の範囲で近いか判定します。','abs_tolは絶対誤差、rel_tolは相対誤差の許容値です。特に0付近ではabs_tolを指定します。','0.1 + 0.2, 0.3','True','1, 1, rel_tol=-1','ValueError','1, 1, rel_tol=1e-9'],
    ['isfinite','値が無限大でもNaNでもない有限の数か判定します。','戻り値はboolです。0も有限の数です。','10','True','"10"','TypeError','10'],
    ['isinf','値が正または負の無限大か判定します。','無限大はfloat("inf")などで表せます。','float("inf")','True','"inf"','TypeError','float("inf")'],
    ['isnan','値が数値として定まらないNaNか判定します。','NaNは自分自身とも==で等しくならないため、この関数を使います。','float("nan")','True','"nan"','TypeError','float("nan")'],
    ['isqrt','平方根以下の最大の整数を求めます。','非負の整数専用です。大きな整数もfloatへの変換なしに扱えます。','10','3','-1','ValueError','10'],
    ['log','対数を計算します。底を省くと自然対数です。','log(x, base)のxは正数、baseは正数かつ1以外です。','8, 2','3.0','0','ValueError','8, 2'],
    ['log10','底10の対数を計算します。','xは正数です。100の対数は2です。','100','2.0','0','ValueError','100'],
    ['log2','底2の対数を計算します。','xは正数です。8の対数は3です。','8','3.0','0','ValueError','8'],
    ['log1p','1+xの自然対数を計算します。','xが0に近いときに精度を保ちやすい関数です。xは-1より大きい必要があります。','0','0.0','-1','ValueError','0'],
    ['modf','実数の小数部分と整数部分をfloatの組で返します。','順番は(小数部分, 整数部分)です。両方とも元の数の符号を持ちます。','-2.5','(-0.5, -2.0)','"2.5"','TypeError','-2.5'],
    ['nextafter','指定した方向へ、浮動小数点数の表現で隣の値を求めます。','x, yを渡すとxからy方向へ進みます。stepsで進む段数を指定できます（3.12以降）。','1.0, 2.0','1.0000000000000002','1.0, 2.0, steps=-1','ValueError','1.0, 2.0'],
    ['pow','実数のべき乗をfloatで返します。','整数の厳密なべき乗なら組み込みpowや**を使います。math.powとは戻り値や機能が異なります。','2, 3','8.0','-1, 0.5','ValueError','2, 3'],
    ['prod','数値列の要素をすべて掛け合わせます。','空の列の結果は既定で1です。startで初期値を指定できます。','[2, 3, 4]','24','None','TypeError','[2, 3, 4]'],
    ['sqrt','非負の実数の平方根を求めます。','戻り値はfloatです。負の数の平方根を複素数で求める場合はcmath.sqrtです。','9','3.0','-1','ValueError','9'],
    ['sumprod','2つの数値列の対応する要素を掛けて合計します。','内積の計算です。2つの列は同じ長さにします。Python 3.12以降で使えます。','[1, 2], [3, 4]','11','[1], [2, 3]','ValueError','[1, 2], [3, 4]'],
    ['ulp','その数付近の浮動小数点表現の最小桁の大きさを返します。','丸め誤差を評価するための関数です。数値の大きさによって間隔は変わります。','1.0','2.220446049250313e-16','"1"','TypeError','1.0']
  ];
  for(const [name,summary,explanation,args,output,bad,type,fixed] of mathRows){
    const call=a=>`import math\n${name==='cbrt'?'# 浮動小数点の微小な誤差を丸めて表示します。\n':''}print(${name==='cbrt'?`round(math.${name}(${a}), 6)`:`math.${name}(${a})`})`;
    add('math',name,summary,`math.${name}(${args})`,explanation,call(args),output,call(bad),type,call(fixed),`${type}の例では、${type==='TypeError'?'入力の型や引数の数が合っていません。文字の数字は必要に応じてint()やfloat()で変換します。':type==='OverflowError'?'計算結果が表せる範囲を超えています。入力範囲や、対数で計算する方法を見直します。':'入力がこの関数の条件を満たしていません。上の条件と、直した例の値を比較してください。'} 元の引数を変更する関数ではありません。`);
  }
})();
