# コードとコマンドの辞典

スマートフォンですぐに引ける、日本語のコマンド・Macコマンド・Python・C辞典です。入口で分野を選び、同じサイト内で確認できます。

- 入口: `./`
- コマンド: `./commands.html`（既存の項目・検索・お気に入りを継承）
- Macコマンド: `./mac/`（基本・ファイル・クリップボード・システム・電源・ネットワーク・開発・検索・設定・画像音声の28項目）
- Python: `./python/`（モジュール索引と詳細学習項目）
- C: `./c/`（基本6項目。実行例・間違いの例・修正例）

Pythonの出典と権利表記は `python/legal.html`、`python/THIRD_PARTY_NOTICES.md`、`python/LICENSE.md` にあります。新しい公開先は作らず、このリポジトリで各分野を管理します。

学習クイズや進捗管理は行わず、必要なコマンドを検索して意味・書式・引数・使用例・注意点を確認することに特化しています。

## 公開ページ

**[Linux コマンド辞典を開く](https://moludou.github.io/linux-command-dictionary/)**

## 主な機能

- コマンド名・説明・用途から検索
- コマンドをアルファベット順に表示
- 最初に「内部コマンド」カテゴリを表示
- Git、仮想環境、SSH、Codex CLI、セキュリティ、Python、pipなどをカテゴリ別に確認
- 書式や使用例をワンタップでコピー
- よく使うコマンドをお気に入りへ登録
- スマートフォン向けの画面表示
- PWA対応によるホーム画面への追加とオフライン閲覧

## スマートフォンで使う

### iPhone / iPad

1. Safariで[公開ページ](https://moludou.github.io/linux-command-dictionary/)を開きます。
2. 共有ボタンを押します。
3. 「ホーム画面に追加」を選びます。

### Android

1. Chromeで[公開ページ](https://moludou.github.io/linux-command-dictionary/)を開きます。
2. 右上のメニューを開きます。
3. 「アプリをインストール」または「ホーム画面に追加」を選びます。

## 収録内容

- 内部コマンド
- Git
- Python仮想環境
- SSHと公開鍵・秘密鍵
- Codex CLIのインストール・確認・SSH先でのデバイス認証
- curl・wget、パイプ、sh、exec、zshによるインストール処理の分解
- パッケージ管理とインストール
- ファイル・権限・プロセス・ネットワーク
- セキュリティ関連コマンド

今後も、実際に使用したコマンドや説明が必要になったコマンドを追加していきます。

## 注意

このアプリはコマンドの説明とコピーを行う辞典です。端末上でコマンドを直接実行する機能はありません。

実行前に、対象のファイル、ディレクトリ、ユーザー、接続先を必ず確認してください。特に削除・上書き・権限変更・管理者権限を伴うコマンドには注意が必要です。

## ファイル構成

```text
index.html            分野を選ぶ入口
commands.html         コマンド辞典本体
hub.css / hub.js      入口・C辞典の共通表示とPWA登録
python/               Python辞典
c/                    C辞典
mac/                  Macコマンド辞典（検索・分類・お気に入り・コピー）
manifest.webmanifest  PWA設定
service-worker.js     オフライン表示
icons/                アプリアイコン
```
# Pythonの学習解説と索引の区別

`python/api-lessons.js`、`core-lessons.js`、`csv-lessons.js` に独自の日本語学習解説を管理しています。現在はカタログ収録の `typing` 43項目、`json` 7項目、`csv` 21項目、`pathlib` 6項目、`math` 56項目、合計133項目に用途・書き方・実行例・出力・注意点を掲載しています。今回追加した90項目はエラーコード・例外の種類・修正コードも実行テストしています。参考仕様はPython 3.12公式資料（[typing](https://docs.python.org/3.12/library/typing.html)、[json](https://docs.python.org/3.12/library/json.html)、[csv](https://docs.python.org/3.12/library/csv.html)、[pathlib](https://docs.python.org/3.12/library/pathlib.html)、[math](https://docs.python.org/3.12/library/math.html)）です。

モジュールカタログ全5,890項目の解説が完成したわけではありません。未解説項目は「索引のみ」と明記し、自動収集した表記を実行例とは呼びません。公式資料への参照を解説の代わりにしません。追加する解説には具体的な用途・意味・動く例・結果・誤用への対処を必須とします。

回帰確認：`node python/check-api-lessons.cjs`（Python 3.12以降も必要）。これはサンプルの実行結果を確認するテストであり、各型検査ツールの診断をテストするものではありません。

検索確認：`node python/check-search.cjs`。トップ検索は入門記事だけでなく全モジュール・全5,890 APIと掲載済み解説を対象にします。検索結果は検索欄の直下に表示し、60件ずつ追加表示できます。完全一致を優先し、全角英数字、複数語、`pd.read_csv`の略記にも対応します。
