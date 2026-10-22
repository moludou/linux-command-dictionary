/* Public teaching notes, not copies of submission source. */
const practice = (code, output, bad, error, fix) => ({code, output, bad, error, fix});
const PRACTICES = {
  print: practice('def greet():\n    print("Hello, garden!")\n\ngreet()', 'Hello, garden!', 'print(unknown_name)', 'NameError', '文字列は引用符で囲む。変数なら先に値を入れる。'),
  text: practice('name = "Mint"\nprint(f"Name: {name}")', 'Name: Mint', 'print("Count: " + 3)', 'TypeError', '文字列と数値を+で直接つながず、f文字列などで表示する。'),
  number: practice('width = int("4")\nheight = int("3")\nprint(width * height)', '12', 'int("four")', 'ValueError', '数値へ変換できない入力をtry/exceptで扱う。'),
  total: practice('values = [2, 3, 4]\ntotal = 0\nfor value in values:\n    total += value\nprint(total)', '9', 'values = [2, "3"]\nprint(sum(values))', 'TypeError', '集計前に各要素の型をそろえる。'),
  branch: practice('age = 12\nif age >= 10:\n    print("ready")\nelse:\n    print("growing")', 'ready', 'age = "12"\nprint(age >= 10)', 'TypeError', '比較前に文字列を整数へ変換する。'),
  loop: practice('for day in range(1, 4):\n    print(day)', '1\n2\n3', 'for day in range("3"):\n    print(day)', 'TypeError', 'rangeには整数を渡す。終端は含まれない。'),
  hint: practice('def label(name: str, count: int) -> str:\n    return f"{name}: {count}"\n\nprint(label("Mint", 3))', 'Mint: 3', 'def add_one(value: int) -> int:\n    return value + 1\n\nadd_one("3")', 'TypeError', '型注釈は値を変換しない。この例は+の処理時に失敗する。必要なら入力を変換・検証する。'),
  object: practice('class Seed:\n    def __init__(self, name):\n        self.name = name\n\na = Seed("Mint")\nb = Seed("Basil")\nprint(a.name, b.name)', 'Mint Basil', 'class Seed:\n    pass\n\nprint(Seed().name)', 'AttributeError', '__init__などで属性を作ってから読む。'),
  method: practice('class Counter:\n    def __init__(self):\n        self.value = 0\n    def grow(self, amount):\n        self.value += amount\n\nc = Counter()\nc.grow(2)\nprint(c.value)', '2', 'class Counter:\n    def grow(self, amount):\n        return amount\n\nCounter().grow()', 'TypeError', 'self以外の必要な引数も渡す。'),
  guard: practice('def checked_height(value):\n    if value < 0:\n        raise ValueError("height must be nonnegative")\n    return value\n\nprint(checked_height(3))', '3', 'def checked_height(value):\n    if value < 0:\n        raise ValueError("height must be nonnegative")\n    return value\n\nchecked_height(-1)', 'ValueError', '値を代入する前に範囲を確認し、不正なら以前の状態を保つ。'),
  inherit: practice('class Plant:\n    def __init__(self, name):\n        self.name = name\n\nclass Flower(Plant):\n    def show(self):\n        return f"Flower: {self.name}"\n\nprint(Flower("Rose").show())', 'Flower: Rose', 'class Plant:\n    def __init__(self, name):\n        self.name = name\n\nclass Flower(Plant):\n    def __init__(self):\n        pass\n\nprint(Flower().name)', 'AttributeError', '子で__init__を上書きするなら、必要に応じsuper().__init__で親の初期化を行う。'),
  factory: practice('class Seed:\n    def __init__(self, name):\n        self.name = name\n    @classmethod\n    def anonymous(cls):\n        return cls("unknown")\n\nprint(Seed.anonymous().name)', 'unknown', 'class Seed:\n    def __init__(self, name):\n        self.name = name\n\nSeed()', 'TypeError', '生成時に必要な情報を渡すか、用途が明確な既定値・生成メソッドを用意する。'),
  catch: practice('for raw in ["12", "bad"]:\n    try:\n        print(int(raw))\n    except ValueError:\n        print("invalid")', '12\ninvalid', 'int("bad")', 'ValueError', '失敗する可能性がある処理をtryに置き、対応する例外をexceptで扱う。'),
  custom: practice('class SensorError(Exception):\n    pass\n\ntry:\n    raise SensorError("offline")\nexcept SensorError as error:\n    print(error)', 'offline', 'class SensorError(Exception):\n    pass\n\nraise SensorError("offline")', 'SensorError', '呼び出す側でこの例外を扱い、原因を表示する。例外を作るだけでは捕捉されない。'),
  finally: practice('try:\n    print(int("bad"))\nexcept ValueError:\n    print("invalid")\nfinally:\n    print("cleanup")', 'invalid\ncleanup', 'try:\n    int("bad")\nfinally:\n    print("cleanup")', 'ValueError', 'finallyは後片付けであり、例外を捕まえる処理ではない。必要ならexceptも使う。'),
  args: practice('import sys\nargs = ["tool.py", "mint", "basil"]\nprint(args[1:])', "['mint', 'basil']", 'args = ["tool.py"]\nprint(args[1])', 'IndexError', 'sys.argvも同様に、添字で読む前に個数を確認する。例では入力を固定している。'),
  tuple: practice('import math\npoint = (3, 4)\nx, y = point\nprint(math.sqrt(x*x + y*y))', '5.0', 'x, y = (1, 2, 3)', 'ValueError', '分解する変数の数と要素数をそろえる。座標の次元も確認する。'),
  set: practice('a = {"run", "jump"}\nb = {"jump", "swim"}\nprint(sorted(a & b))', "['jump']", 'items = {[]}\nprint(items)', 'TypeError', 'setの要素にはハッシュ可能な値が必要。リストならtupleへの変換などを検討する。'),
  dict: practice('stock = {"seed": 3}\nstock["seed"] += 2\nprint(stock["seed"])', '5', 'stock = {}\nprint(stock["seed"])', 'KeyError', '存在確認かgetを使い、不在時の扱いを決める。'),
  yield: practice('def numbers():\n    for value in range(3):\n        yield value\n\nprint(list(numbers()))', '[0, 1, 2]', 'it = iter([])\nnext(it)', 'StopIteration', 'forで順に読むか、next(it, 既定値)で終端を扱う。'),
  comprehension: practice('values = [1, 2, 3, 4]\nprint([n*n for n in values if n % 2 == 0])', '[4, 16]', 'values = [1, None]\nprint([n * n for n in values])', 'TypeError', '内包表記でも型確認は省略できない。先に条件で除くか入力を検証する。'),
  read: practice('from io import StringIO\nwith StringIO("first\\nsecond\\n") as stream:\n    print(stream.readline().strip())', 'first', 'from io import StringIO\nstream = StringIO("hello")\nstream.close()\nstream.read()', 'ValueError', '閉じたストリームは使えない。必要な読取をwithの内側で行う。実ファイルはopenを使う。'),
  write: practice('from io import StringIO\nwith StringIO() as stream:\n    stream.write("note\\n")\n    print(stream.getvalue(), end="")', 'note', 'from io import StringIO\nStringIO().write(3)', 'TypeError', 'テキストにはstrを渡す。実ファイルのwモードは既存内容を消すので保存先も確認する。'),
  stream: practice('import sys\nprint("result", file=sys.stdout)\nprint("notice", file=sys.stderr)', '標準出力: result\n標準エラー出力: notice', 'print("hello", file="output.txt")', 'AttributeError', 'fileには名前ではなく、writeを持つファイルオブジェクトを渡す。'),
  env: practice('import sys\nprint(sys.prefix != sys.base_prefix)', '仮想環境内ならTrue、外ならFalse', 'import importlib\nimportlib.import_module("course_missing_demo_package")', 'ModuleNotFoundError', '使用中のPythonと導入先を確認する。必要な依存関係を仮想環境に導入する。'),
  config: practice('settings = {"API_KEY": "demo-value"}\nprint("configured" if settings.get("API_KEY") else "missing")', 'configured', 'settings = {}\nprint(settings["API_KEY"])', 'KeyError', '未設定の場合の表示を決める。実際の秘密値をログやGitに出さない。'),
  imports: practice('import math\nfrom math import sqrt\nprint(math.sqrt(9), sqrt(16))', '3.0 4.0', 'import math\nmath.not_a_function()', 'AttributeError', 'モジュール内に実在する名前を使う。自作パッケージの公開名と内部名は別に確認する。'),
  alias: practice('from math import sqrt as root\nprint(root(25))', '5.0', 'from math import course_missing_function', 'ImportError', 'asは既存の名前に別名を付けるだけ。存在しない名前を作る機能ではない。'),
  circular: practice('def allowed():\n    return {"water", "air"}\n\ndef valid(item):\n    return item in allowed()\n\nprint(valid("water"))', 'True', 'def a():\n    return b()\ndef b():\n    return a()\na()', 'RecursionError', 'これは相互呼出しの失敗例で、循環importのImportErrorとは別。循環importは共通定義を第三のモジュールへ移すなどして依存を整理する。'),
  bits: practice('EAST, WEST = 2, 8\nleft, right = 15, 15\nleft &= ~EAST\nright &= ~WEST\nprint(left, right)', '13 7', 'walls = "F"\nprint(walls & 2)', 'TypeError', '16進数文字列をint(walls, 16)で整数へ変換してからビット演算する。'),
  dfs: practice('stack = [(0, 0)]\nstack.append((1, 0))\nprint(stack.pop())\nprint(stack[-1])', '(1, 0)\n(0, 0)', 'stack = []\nstack.pop()', 'IndexError', 'while stackのように、空ではないことを確認する。'),
  bfs: practice('from collections import deque\nqueue = deque(["start"])\nqueue.append("next")\nprint(queue.popleft())', 'start', 'from collections import deque\ndeque().popleft()', 'IndexError', 'キューが空なら探索終了。未訪問ノードだけ追加する。'),
  pixel: practice('cell_x, cell_y = 2, 1\nsize = 20\nprint(cell_x * size, cell_y * size)', '40 20', 'size = 0\nprint(40 // size)', 'ZeroDivisionError', 'セルの描画サイズを正の整数に制限する。'),
  hex: practice('walls = [15, 13, 7]\nprint("".join(f"{wall:X}" for wall in walls))', 'FD7', 'int("Z", 16)', 'ValueError', '16進数は0〜9とA〜F。読込時にも文字と行の長さを検証する。')
};
// Each exercise has its own goal, implementation steps and acceptance check.
const lesson = (id, title, goal, concepts, steps, check, example) => ({id,title,goal,concepts:concepts.split(' / '),steps:steps.split(' → '),check,example});
const PROJECTS = [
 {id:'00',name:'Python_Module_00',subtitle:'変数・関数・分岐・繰り返し',source:'Growing Code / GitHubのex0〜ex7',lessons:[
 lesson('ex0','Hello Garden｜関数と表示','関数を定義して、呼び出したときにメッセージを表示する。','def / print / ft_hello_garden','表示する文字列を決める → 関数の中にprintを書く → 関数を呼び出して表示を確認する','定義しただけの場合と、呼び出した場合の違いを説明できる。','print'),
 lesson('ex1','Garden Name｜入力と文字列','名前を受け取り、文章に埋め込んで表示する。','input / str / f文字列','inputで名前を読む → 変数へ保存する → f文字列で文章を組み立てる','空文字と通常の名前で、何が表示されるか確かめる。','text'),
 lesson('ex2','Garden Plot Area｜数値変換と計算','幅と高さを数値にして面積を計算する。','int / input / 乗算','文字列を受け取る → 整数へ変換する → 掛け算し結果を表示する','数値文字列と数値でない入力を区別できる。','number'),
 lesson('ex3','Harvest Total｜合計','複数の収穫数を合計して表示する。','int / 加算 / 変数','各値を数値へ変換する → 合計用の変数を用意する → 加算して表示する','2・3・4など手計算できる値で結果を照合する。','total'),
 lesson('ex4','Plant Age Check｜条件分岐','年齢を条件と比較して表示内容を変える。','if / else / 比較演算','境界となる値を確認する → ifとelseに処理を分ける → 境界の前後を試す','境界値・1小さい値・1大きい値の3通りを確認する。','branch'),
 lesson('ex5','Water Reminder｜条件で通知','前回の水やりからの経過に応じた通知を作る。','if / int / print','経過日数を受け取る → 資料の条件に当てはめる → 必要なメッセージを選ぶ','条件を満たす場合と満たさない場合を両方試す。','branch'),
 lesson('ex6','Count to Harvest｜反復と再帰','日数を数える処理を反復と再帰で考える。','for / range / 再帰 / 停止条件','まず反復で1日ずつ数える → 再帰の終了条件を決める → 小さい日数で両方の結果を比較する','0・1・3などを試し、再帰が必ず止まる理由を説明する。','loop'),
 lesson('ex7','Seed Inventory｜引数と型注釈','種の種類・数量・単位を引数として受け取る。','ft_seed_inventory / str / int / None','引数の役割を決める → 単位に応じて表示を分ける → 引数と戻り値に型注釈を書く','型注釈だけでは不正値を防げないことと、単位別の表示を確認する。','hint') ]},
 {id:'01',name:'Python_Module_01',subtitle:'クラス・状態・継承',source:'Code Cultivation / GitHubのex0〜ex6',lessons:[
 lesson('ex0','Planting Your First Seed｜データの表現','名前・高さ・年齢を変数で表し、表示処理をまとめる。','変数 / main / print','必要なデータを列挙する → 値を用意する → mainから表示する','表示のための値と処理を区別できる。','text'),
 lesson('ex1','Garden Data Organizer｜Plant','植物1つ分のデータと表示をクラスにまとめる。','Plant / self / show','Plantに属性を持たせる → showで属性を読む → 複数の植物を作る','別の植物の値が混ざらないことを確認する。','object'),
 lesson('ex2','Plant Growth Simulator｜状態の更新','成長と経過日数をメソッドで更新する。','Plant.grow / Plant.age / self','初期状態を作る → 高さと日数の更新を分ける → 1週間など繰り返して変化を確認する','1回分と複数回分の増加を手計算と比較する。','method'),
 lesson('ex3','Plant Factory｜初期化','必要な情報を受け取って複数の植物を生成する。','__init__ / インスタンス / list','初期値を引数にする → __init__で属性へ保存する → 同じクラスから異なる個体を作る','生成直後に必要な属性がすべてそろっている。','object'),
 lesson('ex4','Garden Security System｜値の保護','不正な高さや年齢が状態に入らないようにする。','set_height / set_age / getter','更新用メソッドを用意する → 代入する前に範囲を検査する → 不正値なら状態を変更しない','負数を渡した後も、以前の正常な値が残っている。','guard'),
 lesson('ex5','Specialized Plant Types｜継承','共通部分をPlantへ置き、植物の種類ごとの振る舞いを追加する。','Plant / Flower / Tree / Vegetable / super','共通属性を親へまとめる → 子で必要な情報を追加する → showなどを必要に応じ上書きする','親の初期化が呼ばれ、共通属性と固有情報を両方表示できる。','inherit'),
 lesson('ex6','Garden Analytics｜メソッドの種類','個体に属する処理と、クラス全体の処理を分ける。','staticmethod / classmethod / cls / Seed','selfを使う処理を整理する → 個体不要の判定をstaticmethodへ分ける → clsから生成するclassmethodを作る','self・cls・どちらも不要の3種類の違いを説明できる。','factory') ]},
 {id:'02',name:'Python_Module_02',subtitle:'例外・検証・後片付け',source:'Garden Guardian / GitHubのex0〜ex4',lessons:[
 lesson('ex0','Agricultural Data Validation｜変換失敗を扱う','入力を整数へ変換し、失敗してもテストを続ける。','input_temperature / int / try / except','変換関数を作る → 正常入力を試す → 呼出側でValueErrorを捕まえる','数値とabcを順に試し、後続処理が実行される。','catch'),
 lesson('ex1','Validation Pipeline｜自分でraiseする','変換に成功しても温度が許容範囲外なら拒否する。','raise / ValueError / 範囲検査','整数へ変換する → 0〜40の範囲を確認する → 範囲外なら例外を送る','0・40は境界、-1・41は範囲外として試す。','guard'),
 lesson('ex2','Different Types of Problems｜例外の区別','原因に応じた例外を分けて扱う。','ValueError / ZeroDivisionError / FileNotFoundError / TypeError','失敗する処理を個別に用意する → 対応するexceptを置く → 例外ごとに原因を表示する','例外名と原因を対応付け、次のテストへ進める。','catch'),
 lesson('ex3','Making Your Own Error Types｜独自例外','庭に固有の失敗を名前付きの例外にする。','GardenError / PlantError / WaterError / Exception','共通の例外を定義する → 種類別に継承する → 個別または親の型で捕まえる','PlantErrorなどをGardenErrorでまとめて扱える。','custom'),
 lesson('ex4','Finally Block｜必ず行う後片付け','成功・失敗のどちらでも後片付けを行う。','try / except / finally / water_plant','処理開始を用意する → 途中で例外が起こる経路を作る → 後片付けをfinallyへ置く','正常時と例外時のどちらでも後片付けが表示される。','finally') ]},
 {id:'03',name:'Python_Module_03',subtitle:'引数・コレクション・ジェネレーター',source:'Data Quest / GitHubのex0〜ex6',lessons:[
 lesson('ex0','Command Quest｜コマンドライン引数','起動時の引数を個数と内容に分けて読む。','sys.argv / len / スライス','argv[0]の意味を確認する → 入力分を取り出す → 引数なしの場合を分ける','引数なし・1個・複数で表示を確認する。','args'),
 lesson('ex1','Score Cruncher｜リスト集計','スコアを集め、合計や平均などを計算する。','list / int / sum / min / max','入力を数値へ変換する → 空リストを先に扱う → 集計して表示する','空入力で平均のゼロ除算やminのエラーを起こさない。','total'),
 lesson('ex2','Position Tracker｜座標','座標を組にして、位置同士の距離を計算する。','tuple / math / get_distance','文字列から各座標を読む → 要素数と型を確認する → 差の二乗和から距離を求める','同じ点の距離が0となり、順番を逆にしても同じ距離になる。','tuple'),
 lesson('ex3','Achievement Hunter｜集合','達成項目の重複や共通部分を調べる。','set / 和集合 / 積集合 / 差集合','各ユーザーの達成を集合にする → 共通項目と固有項目を計算する → 結果を並べて表示する','重複が1つになり、共通項目を正しく取り出せる。','set'),
 lesson('ex4','Inventory Master｜辞書','アイテム名をキーに、数量を参照・更新する。','dict / get / items','名前と数量を辞書へ入れる → 不在のキーを扱う → 追加と集計を行う','未知のアイテムでも落ちず、更新後の数量が正しい。','dict'),
 lesson('ex5','Stream Wizard｜遅延生成','データをまとめて作らず、必要な分ずつ生成する。','yield / generator / next','小さな生成関数を作る → yieldで1件渡す → 受け手がforで順に処理する','生成関数を呼んだだけでは全件の処理が進まないことを確認する。','yield'),
 lesson('ex6','Data Alchemist｜内包表記','絞り込みと変換を内包表記で表す。','リスト内包表記 / 集合内包表記 / 辞書内包表記','まず通常のforで処理を書く → 変換式と条件を分ける → 同じ結果の内包表記にする','元のfor版と結果が同じで、入力を意図せず変更しない。','comprehension') ]},
 {id:'04',name:'Python_Module_04',subtitle:'ファイル・ストリーム・安全な読書き',source:'Data Archivist / GitHubのex0〜ex3',lessons:[
 lesson('ex0','Ancient Text Recovery｜読み込み','ファイルを開いて内容を読み、見つからない場合も扱う。','open / read / read_archive / IO','入力パスを受け取る → 読取モードで開く → 読込・表示・closeを行い失敗も扱う','存在するファイルと存在しないパスを両方試す。','read'),
 lesson('ex1','Archive Creation｜書き込み','保存先とモードを選び、文字列をファイルへ書く。','write / save_archive / transform_content','保存する文字列を作る → 保存先と上書き可否を確認する → 書いた後に読み直す','保存した内容が一致する。wとaの違いを説明できる。','write'),
 lesson('ex2','Stream Management｜入出力の区別','通常の結果とエラーの通知を別の流れへ出す。','sys.stdin / sys.stdout / sys.stderr','入力を読む → 通常結果をstdoutへ出す → 警告をstderrへ出す','標準出力だけを保存しても、警告は混ざらない。','stream'),
 lesson('ex3','Vault Security｜withと例外','読書きの途中で失敗してもファイルを閉じる。','with / secure_archive / OSError','withで開く範囲を決める → 内部に読書きを置く → 呼出側でファイルの例外を扱う','ブロックを出た後にファイルが閉じている。','read') ]},
 {id:'05bis',name:'Python_Module_05bis',subtitle:'環境・依存関係・設定・パッケージ',source:'The Codex (05bis) v1.0 / GitHubのPython_Module_05_bis',lessons:[
 lesson('ex0','The Sealed Laboratory｜環境と依存関係','construct.pyで環境を調べ、loading.pyで依存ライブラリを確認する。','sys.prefix / sys.base_prefix / site / importlib / pip / Poetry','仮想環境内外を判定する → requirements.txtとpyproject.tomlへ依存関係を宣言する → pandas・numpyの有無と版を表示し、不足時の導入方法を案内する','仮想環境内外・依存ありなしを試す。venvはOSやファイル権限の隔離ではない。','env'),
 lesson('ex1','The Oracle｜環境変数と秘密の保護','設定を環境変数と.envから読み、秘密値を表示せず状態を知らせる。','os.getenv / load_dotenv / load_configuration / .env.example','設定キーと既定値を決める → dotenvで読み既存の環境変数を優先する → 未設定を通知し秘密値は伏せる','未設定・開発用・本番用を試す。.envをGitへ含めず、見本にはダミー値だけを書く。','config'),
 lesson('ex2','The Alembic｜パッケージの入口','単体モジュールとalchemyパッケージの読込を比較する。','import / from / __init__.py / elements','elements.pyに小さな関数を作る → alchemy内にも役割を分ける → __init__.pyで公開する名前を選ぶ','importの書き方とアクセスできる名前の違いを確認する。','imports'),
 lesson('ex3','Distillation and Transmutation｜依存と相対import','複数のモジュールを組み合わせ、公開名と内部構成を分ける。','potions / transmutation / recipes / as / 相対import','既存関数を組み合わせる → パッケージ内外のimportを書く → __init__.pyから必要な機能を公開する','プロジェクトのルートから起動し、実行場所でimportが変わる原因を調べる。','alias'),
 lesson('ex4','Avoid the Explosion｜循環import','モジュールが互いの初期化を待つ状態を見つけ、依存を整理する。','light_spellbook / light_validator / dark_spellbook / ImportError','依存関係を矢印で書く → 初期化前の名前を要求する箇所を探す → 共通定義の分離や読込タイミングの整理で循環を解く','失敗版と改善版の違いを説明する。単に全例外を隠して成功扱いにしない。','circular') ]},
 {id:'maze',name:'A-Maze-ing',subtitle:'迷路を機能ごとに組み立てる',source:'GitHubの現在の実装を機能別に整理。下記は課題のex番号ではなく学習用の順序。',lessons:[
 lesson('config','1. 設定を読む','文字列の設定を検証してMazeConfigへまとめる。','MazeConfig / read_settings / read_config / dataclass / pathlib','行をキーと値へ分ける → 必須キー・型・座標範囲を確認する → 検証済みの設定だけを生成処理へ渡す','必須キー欠落・負のサイズ・範囲外の入口を試す。','dict'),
 lesson('walls','2. セルと壁を表す','1セルの4方向の壁を整数のビットで表す。','Maze / has_wall / NORTH / EAST / SOUTH / WEST','方向ごとの値を決める → 全壁のグリッドを作る → 隣接セルの対応する壁を同時に開く','左の東壁と右の西壁の状態が常に一致する。','bits'),
 lesson('generate','3. 迷路を生成する','未訪問セルへ進み、行き止まりで戻る生成処理を作る。','Maze.generate / random / list.append / list.pop','訪問済みとスタックを用意する → 候補から1つ選んで両側の壁を開く → 候補がなければ戻る','全対象セルへ到達でき、境界の外へ進まない。','dfs'),
 lesson('validate','4. 条件と42パターンを検証する','生成結果が壁・到達性・禁止領域などの条件を満たすか調べる。','validate_maze / get_42pattern_cells / set','禁止セルを決める → 生成対象から除く → 壁整合性と到達性を独立して検査する','入口・出口が禁止領域と重ならず、意図しない開放領域がない。','set'),
 lesson('solve','5. 最短経路を探す','幅優先探索で入口から出口までの経路を求める。','Maze.shortest_path / collections.deque / dict','入口をキューへ入れる → 壁が開いた未訪問の隣へ進み親を記録する → 出口から親をたどり逆順にする','各ステップが隣接セルで、壁を通過していない。等コストの経路であることも確認する。','bfs'),
 lesson('draw','6. 画面へ描画する','セルの座標を画面のピクセル座標に変換して壁を描く。','ImageCanvas / ViewerWindow / draw_grid / draw_maze / mlx','空のウィンドウを用意する → 1セルの4辺を描く → 全体と入口・出口・経路を重ねる','縦横を入れ替えず、壁データと表示が一致する。MLXの実行環境は別途必要。','pixel'),
 lesson('controls','7. キー・マウス操作をつなぐ','入力で状態を変え、必要なときに再描画する。','ViewerState / on_key / on_mouse / run_viewer','入力イベントを受け取る → 状態更新と描画を分ける → 再生成・配色変更・終了を接続する','連続操作しても矛盾せず、ウィンドウを正常に閉じられる。','method'),
 lesson('output','8. 出力と再利用をまとめる','迷路を16進数形式で書き出し、ロジックをパッケージとして分ける。','maze_text / write_maze / mazegen / pyproject.toml','壁の値を1文字へ変換する → 出力順序を決め安全に保存する → GUIなしでも生成・検証できる構成にする','行数・列数・座標・経路を読み直して検証し、書込失敗も試す。','hex') ]}
];
if (typeof module !== 'undefined') module.exports = {PROJECTS, PRACTICES};
