/* 添付のコマンドリファレンス・評価手順書・apt比較資料をもとに構成。 */
const B2B_COMMANDS = [
  {
    "name": "systemctl",
    "group": "基本確認",
    "role": "systemdのmanagerへ問い合わせ、unitの稼働状態・自動起動設定を確認または操作する",
    "code": "systemctl get-default\nsystemctl is-active ssh\nsystemctl is-enabled ssh",
    "parts": [
      [
        "get-default",
        "既定の起動先を表示"
      ],
      [
        "is-active",
        "現在の稼働状態を表示"
      ],
      [
        "is-enabled",
        "自動起動などの有効化状態を表示"
      ],
      [
        "ssh",
        "DebianのSSHサービス名"
      ]
    ],
    "result": "CLI向けの既定起動先はmulti-user.target。SSHが動作中ならactive、自動起動設定ならenabledが目安です。",
    "note": "activeとenabledは別です。起動先だけでGUI未導入とは断定できません。display-managerの状態と導入パッケージも合わせます。ufw・cron・apparmorも同様に確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "cat",
    "group": "ファイル・文字列",
    "role": "ファイル内容を標準出力へ連続して表示する",
    "code": "cat /etc/os-release\ncat /etc/debian_version",
    "parts": [
      [
        "cat",
        "内容をそのまま表示"
      ],
      [
        "/etc/os-release",
        "OSの識別情報"
      ],
      [
        "/etc/debian_version",
        "Debianのリリース情報"
      ]
    ],
    "result": "PRETTY_NAMEなどでディストリビューション名と版を確認できます。",
    "note": "OSの版とkernelの版は別です。監視スクリプトの内容確認にも使います。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "uname",
    "group": "ストレージ・情報",
    "role": "kernel名、バージョン、マシンアーキテクチャなどを表示する",
    "code": "uname -a\nuname -m",
    "parts": [
      [
        "-a",
        "kernelなどの情報をまとめて表示"
      ],
      [
        "-m",
        "マシンのアーキテクチャを表示"
      ]
    ],
    "result": "x86_64などが表示されます。Linuxはkernel名で、Debianというディストリビューション名とは違います。",
    "note": "OS名はcat /etc/os-releaseと合わせて確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "sudo",
    "group": "基本確認",
    "role": "許可されたコマンドを、通常はrootの権限で実行する",
    "code": "sudo -l\nsudo -l -U evaluationuser\nsudo id",
    "parts": [
      [
        "-l",
        "許可された操作と適用設定を表示"
      ],
      [
        "-U",
        "調べるユーザーを指定（必要な権限がある場合）"
      ],
      [
        "id",
        "root権限で実効ユーザーを確認"
      ]
    ],
    "result": "sudo idではuid=0(root)が表示されます。-lでは許可ルールやDefaultsを読みます。",
    "note": "sudoは後ろのコマンド1つに作用します。パイプの右側やシェルのリダイレクトまでrootになるわけではありません。sudo利用はログに記録され得ます。",
    "effect": "後続コマンドによる",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "reboot",
    "group": "基本確認",
    "role": "OSを安全に再起動する",
    "code": "sudo reboot",
    "parts": [
      [
        "sudo",
        "管理者権限を使う"
      ],
      [
        "reboot",
        "OSを再起動する"
      ]
    ],
    "result": "接続が切れ、VMが再起動します。再接続後にhostnamectl --staticなどで確認します。",
    "note": "作業を保存し、VMのコンソールへ戻れる状態で実施します。署名照合前の元VDIを起動する手順ではありません。",
    "effect": "再起動・接続切断",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "apt",
    "group": "パッケージ",
    "role": "Debianのリポジトリを使い、依存関係を解決しながらパッケージを検索・導入・更新・削除する",
    "code": "apt --version\napt list --upgradable\napt install --simulate tree",
    "parts": [
      [
        "--version",
        "導入済みaptの版を表示"
      ],
      [
        "list --upgradable",
        "更新候補を一覧表示"
      ],
      [
        "install",
        "指定パッケージを導入する操作"
      ],
      [
        "--simulate",
        "変更せず予定だけ表示"
      ]
    ],
    "result": "シミュレーションでは導入・更新・削除の予定が表示されます。パッケージが見つからない場合は情報源や取得済み一覧を確認します。",
    "note": "sudo apt updateは一覧情報を更新し、upgradeはパッケージ本体を更新します。-yは確認に自動承諾する指定で、シミュレーションではありません。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "aptitude",
    "group": "パッケージ",
    "role": "DebianパッケージをCLIまたは対話画面で管理し、依存関係の解決候補も提示する",
    "code": "aptitude --version\naptitude why aptitude-common\naptitude --simulate install tree",
    "parts": [
      [
        "why",
        "依存関係の経路をたどる"
      ],
      [
        "aptitude-common",
        "調べるパッケージの例"
      ],
      [
        "--simulate",
        "変更予定だけ表示"
      ]
    ],
    "result": "whyの行が「aptitude 依存 aptitude-common」なら前者が後者を必要としています。iは導入済み、pは痕跡なし、cは設定残り、vは仮想パッケージです。",
    "note": "引数なしのaptitudeは文字画面を開きます。競合時に複数の解決案を比較できます。whyは導入日時の履歴ではありません。新しいaptにもwhyがある版があり、aptitudeだけの機能とは断定しません。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "dpkg",
    "group": "パッケージ",
    "role": "Debianの低レベルなパッケージ管理コマンド。ローカルの`.deb`を導入・削除・設定し、導入状態も照会できる",
    "code": "dpkg -l sudo\ndpkg -s sudo",
    "parts": [
      [
        "-l",
        "導入状態を一覧表示"
      ],
      [
        "-s",
        "詳細な状態を表示"
      ],
      [
        "sudo",
        "調べるパッケージ名"
      ]
    ],
    "result": "ii、またはStatus: install ok installedなら導入済みの目安です。",
    "note": "dpkg -i file.debは導入操作です。aptのようにリポジトリから依存パッケージを取得して解決する機能とは区別します。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "dpkg-query",
    "group": "パッケージ",
    "role": "Debianのパッケージデータベースから導入状態やパッケージ情報を取得する",
    "code": "dpkg-query -W -f='${Status}\\n' sudo ufw openssh-server",
    "parts": [
      [
        "-W",
        "パッケージ情報を表示"
      ],
      [
        "-f",
        "出力書式を指定"
      ],
      [
        "${Status}",
        "パッケージの状態フィールド"
      ],
      [
        "\\n",
        "改行"
      ]
    ],
    "result": "各パッケージの状態が行ごとに表示されます。install ok installedなら導入済みです。",
    "note": "シングルクォートは${Status}をシェルに展開させずdpkg-queryへ渡すためです。packageがない場合はエラーになり得ます。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "man",
    "group": "基本確認",
    "role": "システムに導入されたmanual pageから、コマンド・設定ファイル・仕組みの説明を表示する",
    "code": "man systemctl\nman 5 crontab",
    "parts": [
      [
        "man",
        "マニュアルを開く"
      ],
      [
        "5",
        "設定ファイル形式などを扱う章番号"
      ],
      [
        "crontab",
        "調べる項目"
      ]
    ],
    "result": "矢印やPageDownで移動し、/で検索、qで終了します（通常のページャーの場合）。",
    "note": "man 1 crontabは操作コマンド、man 5 crontabは予定表の書式です。導入済みの版の説明を確認できます。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "bash",
    "group": "監視・ログ",
    "role": "Bash shellとしてスクリプトを実行、または構文を検査する",
    "code": "sudo bash -n /usr/local/bin/monitoring.sh",
    "parts": [
      [
        "-n",
        "構文を検査し、スクリプトの処理は実行しない"
      ],
      [
        "/usr/local/bin/monitoring.sh",
        "検査対象"
      ]
    ],
    "result": "構文が正しければ通常は無表示で終了状態0。構文に問題があれば行番号などが表示されます。",
    "note": "構文成功だけでは計算結果や11項目の実装が正しい証明にはなりません。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "getent",
    "group": "ユーザー・権限",
    "role": "`/etc/nsswitch.conf`のNSS設定に従い、`passwd`や`group`などのデータベースから指定した名前の項目を取得する",
    "code": "getent passwd evaluationuser\ngetent group sudo\ngetent group user42",
    "parts": [
      [
        "passwd",
        "ユーザー情報のデータベース"
      ],
      [
        "group",
        "グループ情報のデータベース"
      ],
      [
        "evaluationuser",
        "対象ユーザー名の例"
      ]
    ],
    "result": "passwdは名前:パスワード欄:UID:GID:説明:ホーム:シェル。キーがなければ無表示で終了状態2です。",
    "note": "NSSの設定に従って検索します。groupの末尾は補助メンバーなので、プライマリグループはidでも確認します。正式ユーザーの確認では実際の名前へ置き換えます。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "id",
    "group": "ユーザー・権限",
    "role": "ユーザーのUID、プライマリグループ、補助グループを表示する",
    "code": "id\nid evaluationuser",
    "parts": [
      [
        "引数なし",
        "現在のユーザーの実効IDや所属を表示"
      ],
      [
        "evaluationuser",
        "指定ユーザーのIDと所属を表示"
      ]
    ],
    "result": "uidがユーザーID、gidが主グループ、groupsが所属グループです。",
    "note": "usermod後に既存ログインの所属が古いままなら再ログインが必要です。id ユーザー名と現在セッションのidを区別します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "adduser",
    "group": "ユーザー・権限",
    "role": "ホームディレクトリやパスワード設定を含め、新しいユーザーを対話形式で作成する",
    "code": "getent passwd evaluationuser\n# 未作成だと確認してから実行\nsudo adduser evaluationuser",
    "parts": [
      [
        "adduser",
        "対話形式でユーザーを作成"
      ],
      [
        "evaluationuser",
        "評価用のユーザー名の例"
      ]
    ],
    "result": "パスワードなどの入力を求められます。作成後にidとchage -lで確認します。",
    "note": "既存ユーザーと重複していないことを先に確認します。パスワードは画面や教材に掲載しません。",
    "effect": "ユーザー・ホームを作成",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "groupadd",
    "group": "ユーザー・権限",
    "role": "新しいグループを作成する",
    "code": "getent group evaluating\n# 未作成だと確認してから実行\nsudo groupadd evaluating",
    "parts": [
      [
        "groupadd",
        "グループを作成"
      ],
      [
        "evaluating",
        "評価用グループ名"
      ]
    ],
    "result": "成功時は通常無表示。getent group evaluatingで登録を確認します。",
    "note": "すでに存在するグループを作り直す必要はありません。",
    "effect": "グループを作成",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "usermod",
    "group": "ユーザー・権限",
    "role": "既存ユーザーのグループ所属などのアカウント設定を変更する",
    "code": "sudo usermod -aG evaluating evaluationuser\nid evaluationuser",
    "parts": [
      [
        "-a",
        "現在の補助グループを残して追加"
      ],
      [
        "-G",
        "補助グループを指定"
      ],
      [
        "evaluating",
        "追加先"
      ],
      [
        "evaluationuser",
        "対象ユーザー"
      ]
    ],
    "result": "idのgroupsにevaluatingが加わります。sudo所属を追加する実演では追加先をsudoにします。",
    "note": "-Gだけでは補助グループ一覧を置き換えます。新しいログインにも所属が反映されることを確認します。",
    "effect": "ユーザーの所属を変更",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "chage",
    "group": "ユーザー・権限",
    "role": "`/etc/shadow`に保存されるパスワード変更日・最短日数・最長日数・警告期間などを表示・変更する",
    "code": "sudo chage -l root\nsudo chage -l evaluationuser",
    "parts": [
      [
        "-l",
        "パスワードの経過日数設定を表示"
      ],
      [
        "root / evaluationuser",
        "対象ユーザー"
      ]
    ],
    "result": "最短変更日数・最長有効日数・警告日数を読みます。資料の例では2日・30日・7日です。",
    "note": "/etc/login.defsの初期値だけで既存ユーザーの設定は証明できません。文字数や文字種の制約はpwqualityとPAMで確認します。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "visudo",
    "group": "ユーザー・権限",
    "role": "sudoers本体と読み込み先を構文解析し、編集時は排他ロックを使って破損や同時編集を防ぐ",
    "code": "sudo visudo -c",
    "parts": [
      [
        "-c",
        "sudoersと読み込み先の構文を検査"
      ]
    ],
    "result": "正常なら解析成功の表示と終了状態0。構文エラーではファイル名と行番号を確認します。",
    "note": "編集するときはsudo visudo、個別ファイルなら-fを使います。構文が正しくても課題のルールを満たすかは別途sudo -lで確認します。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "sudoreplay",
    "group": "監視・ログ",
    "role": "sudoのI/Oログセッションを検索・一覧表示・再生する",
    "code": "sudo sudoreplay -d /var/log/sudo -l",
    "parts": [
      [
        "-d",
        "I/Oログの保存先"
      ],
      [
        "-l",
        "記録済みセッションを一覧表示"
      ]
    ],
    "result": "日時・実行ユーザー・コマンド・セッションIDを確認できます。",
    "note": "保存先はsudoersのiolog_dirに合わせます。通常のsudo.logと画面入出力ログは別です。再生は-lの代わりに一覧にあるセッションIDを指定します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "whoami",
    "group": "ユーザー・権限",
    "role": "現在の実効ユーザー名を表示する",
    "code": "whoami",
    "parts": [
      [
        "whoami",
        "現在の実効ユーザー名を表示"
      ]
    ],
    "result": "SSH接続後は接続先のユーザー名が表示されます。",
    "note": "現在どのユーザー権限で操作しているかを確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "exit",
    "group": "ユーザー・権限",
    "role": "現在のshellまたはSSHセッションを終了する",
    "code": "exit",
    "parts": [
      [
        "exit",
        "現在のシェルを終了"
      ]
    ],
    "result": "SSH中なら接続元の端末へ戻ります。",
    "note": "VMの電源を切るコマンドではありません。入れ子のシェルでは1段戻ります。",
    "effect": "セッション終了",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "grep",
    "group": "ファイル・文字列",
    "role": "入力やファイルから、パターンに一致する行を検索・抽出する",
    "code": "grep -E '^(PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE)' /etc/login.defs\ngrep -n 'pam_pwquality.so' /etc/pam.d/common-password",
    "parts": [
      [
        "-E",
        "拡張正規表現を使う"
      ],
      [
        "^",
        "行の先頭"
      ],
      [
        "|",
        "正規表現では候補の区切り"
      ],
      [
        "-n",
        "行番号を表示"
      ]
    ],
    "result": "期限設定とPAMのpwquality行を確認します。一致なしは通常無表示で終了状態1、読込エラーなどは2です。",
    "note": "コメント行か有効な設定かも読みます。pwquality.confだけでなくpam_pwqualityの引数や追加設定ファイルによる上書きも確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "awk",
    "group": "ファイル・文字列",
    "role": "入力を行とフィールドに分け、条件に一致する行の抽出・列計算・整形を行う",
    "code": "free -m | awk '/^Mem:/ {printf \"%s/%s MiB (%.2f%%)\\n\", $3, $2, $3/$2*100}'",
    "parts": [
      [
        "|",
        "左の出力を渡す"
      ],
      [
        "/^Mem:/",
        "Mem:で始まる行だけ処理"
      ],
      [
        "$2 / $3",
        "2列目の総量と3列目の使用量"
      ],
      [
        "printf",
        "書式を指定して表示"
      ]
    ],
    "result": "使用量/総量と使用率を表示します。例：400/2048 MiB (19.53%)。数値は環境依存です。",
    "note": "このawkプログラムは表示のみです。awk言語自体にはファイル出力や外部コマンド実行もあり、常に参照専用という意味ではありません。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "sed",
    "group": "ファイル・文字列",
    "role": "文字列を行単位で表示・置換・編集する",
    "code": "sudo sed -n '1,240p' /usr/local/bin/monitoring.sh",
    "parts": [
      [
        "-n",
        "自動表示を抑える"
      ],
      [
        "1,240p",
        "1〜240行を表示"
      ]
    ],
    "result": "監視スクリプトの内容を実行せず確認できます。240行を超える場合は続きを表示します。",
    "note": "この指定は表示のみ。-iはファイルを直接変更する指定です。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "cp",
    "group": "ファイル・文字列",
    "role": "ファイルやディレクトリを別の場所へコピーする",
    "code": "sudo cp -ai /etc/hosts /etc/hosts.before-evaluation",
    "parts": [
      [
        "-a",
        "属性を保ちながらコピー"
      ],
      [
        "-i",
        "上書き前に確認"
      ],
      [
        "1つ目のパス",
        "コピー元"
      ],
      [
        "2つ目のパス",
        "コピー先"
      ]
    ],
    "result": "バックアップファイルができます。成功時は通常無表示です。",
    "note": "既存のバックアップを再利用して上書きすると元の状態を失います。復元後は内容を確認してから、今回作ったバックアップだけを整理します。",
    "effect": "ファイルを作成・上書き",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "rm",
    "group": "ファイル・文字列",
    "role": "ファイルやディレクトリエントリを削除する",
    "code": "rm -i /tmp/born2beroot_evaluation.pub",
    "parts": [
      [
        "-i",
        "削除前に確認"
      ],
      [
        ".pub",
        "今回転送した公開鍵の一時ファイル"
      ]
    ],
    "result": "確認に同意したファイルが削除されます。",
    "note": "登録先と指紋を確認し、今回作った一時ファイルだけを対象にします。rmはごみ箱へ移動しません。",
    "effect": "ファイルを削除",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "install",
    "group": "ファイル・文字列",
    "role": "ディレクトリやファイルを作成・配置し、同時にパーミッションを指定する",
    "code": "install -d -m 700 ~/.ssh",
    "parts": [
      [
        "-d",
        "ディレクトリを作成"
      ],
      [
        "-m 700",
        "所有者だけ読み書き・出入り可能"
      ],
      [
        "~",
        "現在のユーザーのホーム"
      ]
    ],
    "result": "~/.sshが作られ、指定した権限になります。statで確認できます。",
    "note": "公開鍵を登録する対象ユーザーとして実行します。パッケージ管理のapt installとは別のコマンドです。",
    "effect": "ディレクトリ・権限を変更",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "chmod",
    "group": "ファイル・文字列",
    "role": "ファイルやディレクトリのパーミッションを変更する",
    "code": "chmod 600 ~/.ssh/authorized_keys",
    "parts": [
      [
        "600",
        "所有者だけ読み書き可能、ほかは権限なし"
      ],
      [
        "authorized_keys",
        "ログインを許可する公開鍵の登録先"
      ]
    ],
    "result": "成功時は通常無表示。statで-rw-------相当か確認します。",
    "note": "所有者も正しい必要があります。対象ユーザーのホームで実行します。",
    "effect": "権限を変更",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "find",
    "group": "ファイル・文字列",
    "role": "指定ディレクトリ以下を条件に従って再帰的に検索する",
    "code": "sudo find /var/log/sudo -type f -print",
    "parts": [
      [
        "-type f",
        "通常ファイルだけに絞る"
      ],
      [
        "-print",
        "パスを表示"
      ]
    ],
    "result": "保存先の通常ログとI/Oログのファイルパスを表示します。",
    "note": "ここでは検索のみ。findは-deleteや-execを付けると変更操作もできます。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "test",
    "group": "ファイル・文字列",
    "role": "ファイル種類や条件を判定し、終了ステータスで結果を返す",
    "code": "sudo test -d /var/log/sudo && echo \"ログディレクトリあり\"",
    "parts": [
      [
        "-d",
        "ディレクトリか判定"
      ],
      [
        "&&",
        "左側が成功した場合だけ右側を実行"
      ]
    ],
    "result": "存在すればメッセージを表示。test自体は結果を表示せず、成立0・不成立1の終了状態を返します。",
    "note": "無表示だからコマンドが実行されていないとは限りません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "echo",
    "group": "ファイル・文字列",
    "role": "指定した文字列を標準出力へ表示する",
    "code": "echo \"----- IPv4 -----\"",
    "parts": [
      [
        "echo",
        "文字列を標準出力へ表示"
      ]
    ],
    "result": "----- IPv4 -----と表示されます。",
    "note": "区切りや説明の表示に使います。情報を検査する機能ではありません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "tail",
    "group": "監視・ログ",
    "role": "ファイルの末尾部分を表示する",
    "code": "sudo tail -n 20 /var/log/sudo/sudo.log",
    "parts": [
      [
        "-n 20",
        "末尾20行を表示"
      ]
    ],
    "result": "直近のsudo利用日時、実行ユーザー、COMMANDなどを確認します。",
    "note": "実際のパスはsudoersのlogfile設定に合わせます。ログには操作内容が含まれるため公開転載はしません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "wc",
    "group": "ファイル・文字列",
    "role": "入力の行数・単語数・byte数などを数える",
    "code": "users | wc -w",
    "parts": [
      [
        "-w",
        "空白で区切られた単語を数える"
      ],
      [
        "users",
        "ログインセッションごとのユーザー名"
      ]
    ],
    "result": "ログインセッション数に対応する数が表示されます。",
    "note": "同じ人の複数セッションも数えます。異なるユーザーの人数とは限りません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "stat",
    "group": "ファイル・文字列",
    "role": "ファイルの所有者、グループ、パーミッション、サイズなどのメタデータを表示する",
    "code": "sudo stat -c '%U %G %a %n' /usr/local/bin/monitoring.sh",
    "parts": [
      [
        "-c",
        "表示書式を指定"
      ],
      [
        "%U / %G",
        "所有者名・グループ名"
      ],
      [
        "%a",
        "8進数の権限"
      ],
      [
        "%n",
        "ファイル名"
      ]
    ],
    "result": "root root 755 /usr/local/bin/monitoring.shなどと表示されます。実際の権限を読みます。",
    "note": "所有者・書込権限・実行方法を合わせて確認します。構文や処理内容までは検査しません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "tee",
    "group": "ファイル・文字列",
    "role": "標準入力をファイルと標準出力の両方へ複製する",
    "code": "sudo crontab -l | sudo tee /root/crontab.before-monitoring-test >/dev/null",
    "parts": [
      [
        "tee",
        "入力をファイルと画面へ複製"
      ],
      [
        "sudo tee",
        "rootの権限で保存"
      ],
      [
        ">/dev/null",
        "画面への出力を捨てる"
      ]
    ],
    "result": "バックアップファイルに予定表が保存されます。上流のcrontab -lが成功した場合に限ります。",
    "note": "事前にsudo crontab -lで予定表が存在することを確認します。パイプの左が失敗しても右が空ファイルを作り得ます。既存バックアップを上書きしないでください。",
    "effect": "ファイルを作成・上書き",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "sha256sum",
    "group": "ファイル・文字列",
    "role": "ファイルのSHA-256計算、または保存済みハッシュとの照合を行う",
    "code": "sudo sha256sum /usr/local/bin/monitoring.sh\nsudo sha256sum -c /root/monitoring.sha256.before",
    "parts": [
      [
        "引数がファイル",
        "SHA-256を計算"
      ],
      [
        "-c",
        "事前に保存したハッシュ一覧と照合"
      ]
    ],
    "result": "内容が一致すればファイル名: OKが表示されます。-cはチェック用の一覧が必要です。",
    "note": "監視スクリプトが変わっていないことを確認する用途です。提出VDIのSHA-1署名とは別です。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "lsblk",
    "group": "ストレージ・情報",
    "role": "ブロックデバイス、パーティション、LVM、マウント先を階層表示する",
    "code": "lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS",
    "parts": [
      [
        "-o",
        "表示する列を指定"
      ],
      [
        "TYPE",
        "disk・part・crypt・lvmなどの種類"
      ],
      [
        "FSTYPE",
        "ファイルシステム"
      ],
      [
        "MOUNTPOINTS",
        "マウント先"
      ]
    ],
    "result": "ディスク→パーティション→暗号化→LVM→マウント先の関係を実際の出力から読みます。",
    "note": "構成はVMごとに異なります。見た目だけでなくpvs・vgs・lvsと照合します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "pvs",
    "group": "ストレージ・情報",
    "role": "LVMのPhysical Volume情報を表示する",
    "code": "sudo pvs",
    "parts": [
      [
        "pvs",
        "LVMのPV（Physical Volume）一覧"
      ]
    ],
    "result": "PV名、所属VG、サイズ、空き容量などが表示されます。",
    "note": "PVはLVMが使う実体側の領域です。暗号化mappingがPVになっている構成もあります。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "vgs",
    "group": "ストレージ・情報",
    "role": "LVMのVolume Group情報を表示する",
    "code": "sudo vgs",
    "parts": [
      [
        "vgs",
        "LVMのVG（Volume Group）一覧"
      ]
    ],
    "result": "VG名、PV数、LV数、総容量、空き容量などを確認します。",
    "note": "VGはPVをまとめた容量の入れ物です。ファイルシステムの空き容量とは違います。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "lvs",
    "group": "ストレージ・情報",
    "role": "LVMのLogical Volume情報を表示する",
    "code": "sudo lvs",
    "parts": [
      [
        "lvs",
        "LVMのLV（Logical Volume）一覧"
      ]
    ],
    "result": "rootやswapなどのLV名、所属VG、容量などを確認します。",
    "note": "LVがどこへマウントされているかはlsblkやdfでも確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "cryptsetup",
    "group": "ストレージ・情報",
    "role": "LUKSなどの暗号化デバイスを管理・確認する",
    "code": "sudo cryptsetup status sda2_crypt",
    "parts": [
      [
        "status",
        "開いている暗号化mappingの状態を確認"
      ],
      [
        "sda2_crypt",
        "mapping名の例"
      ]
    ],
    "result": "type、cipher、deviceなどが表示されます。名前が違う場合はlsblkで調べます。",
    "note": "ここではstatusだけを使います。luksFormatは初期化操作で、確認用コマンドではありません。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "free",
    "group": "ストレージ・情報",
    "role": "物理メモリとswapの総量・使用量・空き容量を表示する",
    "code": "free -m",
    "parts": [
      [
        "-m",
        "MiB単位で表示"
      ]
    ],
    "result": "totalは総量、usedは使用量、availableは新しい処理に利用できる目安です。",
    "note": "freeとavailableは意味が違います。監視表示と同じ単位で比べます。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "df",
    "group": "ストレージ・情報",
    "role": "マウント済みファイルシステムの容量と使用状況を表示する",
    "code": "df -BM -x tmpfs -x devtmpfs --total",
    "parts": [
      [
        "-BM",
        "容量をMiB単位のM表記で表示"
      ],
      [
        "-x",
        "指定種類を除外"
      ],
      [
        "--total",
        "合計行を追加"
      ]
    ],
    "result": "マウント済みファイルシステムの容量・使用量・空きを確認します。",
    "note": "-BMは100万byteのMBではなく1024×1024byte単位です。物理ディスクの総容量と同じとは限りません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "uptime",
    "group": "ストレージ・情報",
    "role": "稼働時間、起動時刻、load averageなどを表示する",
    "code": "uptime -s\nuptime",
    "parts": [
      [
        "-s",
        "起動日時を表示"
      ],
      [
        "引数なし",
        "稼働時間と負荷平均を表示"
      ]
    ],
    "result": "起動日時、または稼働時間・ログイン数・load averageが表示されます。",
    "note": "load averageはCPU使用率ではありません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "nproc",
    "group": "ストレージ・情報",
    "role": "現在のプロセスが利用できるCPU処理単位数を表示する",
    "code": "nproc",
    "parts": [
      [
        "nproc",
        "現在のプロセスが使える処理単位の数を表示"
      ]
    ],
    "result": "VMに割り当てられたCPUや制限に応じた数が表示されます。",
    "note": "物理CPUの個数ではありません。CPU affinityなどで全論理CPU数と異なる場合があります。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "vmstat",
    "group": "ストレージ・情報",
    "role": "CPU、process、memory、paging、I/Oなどの統計を表示する",
    "code": "vmstat 1 2",
    "parts": [
      [
        "1",
        "1秒間隔"
      ],
      [
        "2",
        "2回表示"
      ],
      [
        "id",
        "CPUのアイドル割合"
      ]
    ],
    "result": "1回目は通常起動以降の平均、2回目は直近1秒の統計です。",
    "note": "監視スクリプトのCPU値と比較するときは採取期間を合わせます。100-idはアイドル以外で、待ち時間なども含みます。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "hostname",
    "group": "ストレージ・情報",
    "role": "現在のホスト名やネットワークアドレス情報を表示する",
    "code": "hostname -I",
    "parts": [
      [
        "-I",
        "ホストに割り当てられたIPアドレスを表示"
      ]
    ],
    "result": "IPv4やIPv6が複数表示される場合があります。",
    "note": "接続に使うIPはホストから届くものを選びます。NATのポート転送なら接続先とゲストIPは異なります。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "hostnamectl",
    "group": "ストレージ・情報",
    "role": "systemd環境のホスト名情報を表示・変更する",
    "code": "hostnamectl --static",
    "parts": [
      [
        "--static",
        "永続的なホスト名を表示"
      ]
    ],
    "result": "設定されたホスト名が1行で表示されます。",
    "note": "set-hostnameは変更操作です。下の実演手順で元のホスト名と/etc/hostsの保存・復元を確認します。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "ufw",
    "group": "ネットワーク・保護",
    "role": "ホスト型ファイアウォールのルールと有効状態を管理・表示する",
    "code": "sudo ufw status verbose\nsudo ufw status numbered",
    "parts": [
      [
        "status",
        "有効状態とルールを表示"
      ],
      [
        "verbose",
        "既定方針なども表示"
      ],
      [
        "numbered",
        "ルール番号を表示"
      ]
    ],
    "result": "Status: active、4242/tcpの許可などを確認します。IPv6を有効にしていれば(v6)のルールも読みます。",
    "note": "systemctlのactiveだけではUFWのルール適用を証明できません。8080の追加・削除は下の変更実演に分けています。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "aa-status",
    "group": "ネットワーク・保護",
    "role": "AppArmor kernel module、読み込み済みprofile数、enforce・complain状態を表示する",
    "code": "sudo aa-status",
    "parts": [
      [
        "aa-status",
        "AppArmorの適用状況を表示"
      ]
    ],
    "result": "moduleが有効か、読み込まれたprofile数、enforceとcomplainの内訳を確認します。",
    "note": "サービスがactiveでも個々のprofileがenforceとは限りません。complainは記録中心で、enforceとは異なります。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "sshd",
    "group": "ネットワーク・保護",
    "role": "OpenSSH server process。`-t`や`-T`では設定を検査・表示する",
    "code": "sudo sshd -t\nsudo sshd -T | grep -E '^(port|permitrootlogin) '",
    "parts": [
      [
        "-t",
        "設定構文と鍵の妥当性を検査"
      ],
      [
        "-T",
        "有効な設定を表示"
      ],
      [
        "port / permitrootlogin",
        "ポートとrootログイン設定"
      ]
    ],
    "result": "-tは正常時無表示。資料の構成では-Tにport 4242とpermitrootlogin noが出ることを確認します。",
    "note": "Match条件がある場合は-T -C user=...,host=...,addr=...で接続条件も指定して確認します。設定表示と実際の待受は別で、ssも使います。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "ssh",
    "group": "ネットワーク・保護",
    "role": "SSH protocolでリモートホストへ暗号化接続するクライアント",
    "code": "ssh -p 4242 evaluationuser@VM_IP",
    "parts": [
      [
        "-p 4242",
        "接続先ポート"
      ],
      [
        "evaluationuser",
        "接続先のユーザー"
      ],
      [
        "VM_IP",
        "到達可能な接続先IPに置き換える"
      ]
    ],
    "result": "認証後、接続先の端末になります。whoamiとidで接続先ユーザーを確認します。",
    "note": "接続元のPCで実行します。root拒否の確認は同じ経路で一般ユーザーの接続が成功した後に行います。通信できないだけではroot拒否の証明になりません。",
    "effect": "接続・認証ログが発生",
    "where": "接続元のLinux/macOS端末（Debian VMの外）"
  },
  {
    "name": "ssh-keygen",
    "group": "ネットワーク・保護",
    "role": "SSH認証に使うprivate keyとpublic keyのpairを生成・管理する",
    "code": "ssh-keygen -lf /tmp/born2beroot_evaluation.pub",
    "parts": [
      [
        "-l",
        "鍵のfingerprintを表示"
      ],
      [
        "-f",
        "調べる鍵ファイル"
      ],
      [
        ".pub",
        "公開鍵"
      ]
    ],
    "result": "SHA256:…などの指紋を転送元の公開鍵の指紋と比べます。",
    "note": "鍵生成は-t ed25519などを指定する別操作です。この例は転送された公開鍵の確認だけです。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "scp",
    "group": "ネットワーク・保護",
    "role": "SSHを利用してホスト間でファイルを暗号化転送する",
    "code": "scp -P 4242 ~/.ssh/born2beroot_evaluation.pub evaluationuser@VM_IP:/tmp/born2beroot_evaluation.pub",
    "parts": [
      [
        "-P",
        "ポート（sshの-pとは大文字小文字が違う）"
      ],
      [
        "1つ目のパス",
        "コピー元の公開鍵"
      ],
      [
        "user@host:path",
        "接続先と保存先"
      ]
    ],
    "result": "VMの/tmpへ公開鍵が転送されます。VM側でssh-keygen -lfにより照合します。",
    "note": "例の公開鍵が接続元に作成済みであることが前提です。秘密鍵のファイルは転送しません。",
    "effect": "転送先へファイルを作成",
    "where": "接続元のLinux/macOS端末"
  },
  {
    "name": "ss",
    "group": "ネットワーク・保護",
    "role": "ネットワークソケット、接続状態、待受ポート、プロセスを表示する",
    "code": "sudo ss -4 -lntp\nsudo ss -6 -lntp",
    "parts": [
      [
        "-4 / -6",
        "IPv4 / IPv6に限定"
      ],
      [
        "-l",
        "待受だけ"
      ],
      [
        "-n",
        "名前に変換せず数値表示"
      ],
      [
        "-t",
        "TCPだけ"
      ],
      [
        "-p",
        "プロセス情報"
      ]
    ],
    "result": "Local Address:Portの4242とsshdの対応を見ます。ほかのSSH待受ポートがないかも一覧で確認します。",
    "note": "4242だけをgrepしても、別ポートでの待受がない証明にはなりません。ss -taは待受以外のTCP状態も表示します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "ip",
    "group": "ネットワーク・保護",
    "role": "network interface、IP address、route、link情報を表示・変更する",
    "code": "ip -br address\nip link",
    "parts": [
      [
        "-br",
        "短い一覧形式"
      ],
      [
        "address",
        "IPアドレス情報"
      ],
      [
        "link",
        "インターフェースとMACアドレスなど"
      ]
    ],
    "result": "lo以外の接続に使うインターフェース、IP、link/etherのMACを確認します。",
    "note": "表示例だけなら設定は変わりません。ip address addやip link setは変更操作です。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "journalctl",
    "group": "監視・ログ",
    "role": "systemd journalに保存されたサービス・システムログを検索・表示する",
    "code": "sudo journalctl -u cron -b --since '-3 minutes' --no-pager",
    "parts": [
      [
        "-u cron",
        "cronサービスに限定"
      ],
      [
        "-b",
        "現在の起動に限定"
      ],
      [
        "--since",
        "指定時点以降"
      ],
      [
        "--no-pager",
        "ページャーを使わず表示"
      ]
    ],
    "result": "監視スクリプトの呼出し時刻とコマンドを確認します。",
    "note": "呼出し記録だけではスクリプトが最後まで正常終了した証明になりません。ログがないときは対象unit・時刻・ログ保存設定も確認します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "last",
    "group": "監視・ログ",
    "role": "login履歴databaseを読み、user loginやsystem rebootの履歴を表示する",
    "code": "last -n 5\nlast reboot",
    "parts": [
      [
        "-n 5",
        "直近5件"
      ],
      [
        "reboot",
        "再起動記録を抽出"
      ]
    ],
    "result": "ログインや再起動履歴が表示されます。",
    "note": "記録ファイルの有無やローテーションに依存します。空の結果だけで一度も起動していないとは判断できません。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "users",
    "group": "監視・ログ",
    "role": "現在ログイン中のユーザー名をセッションごとに表示する",
    "code": "users",
    "parts": [
      [
        "users",
        "ログインセッションごとのユーザー名を表示"
      ]
    ],
    "result": "同じユーザー名が複数回出ることがあります。",
    "note": "ログインしている別人の数とセッション数を区別します。",
    "effect": "確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "crontab",
    "group": "監視・ログ",
    "role": "ユーザーごとのcron scheduleを表示・編集・登録する",
    "code": "sudo crontab -l",
    "parts": [
      [
        "sudo",
        "rootの予定表を対象にする"
      ],
      [
        "-l",
        "予定表を表示"
      ]
    ],
    "result": "資料の例は*/10 * * * * /usr/local/bin/monitoring.sh。@rebootの行がある場合は起動時の実行も確認します。",
    "note": "*/10は毎時0・10・20…分で、起動後から10分間隔という意味ではありません。-eは編集、crontab ファイルは予定表全体の置換です。",
    "effect": "この例は確認のみ",
    "where": "Debian VM・一般ユーザーの端末"
  },
  {
    "name": "wall",
    "group": "監視・ログ",
    "role": "ログイン中の全ターミナルへメッセージを一斉送信する",
    "code": "printf '%s\\n' 'Born2beRoot monitoring test' | wall",
    "parts": [
      [
        "printf",
        "改行付きのメッセージを出す"
      ],
      [
        "|",
        "標準入力へ渡す"
      ],
      [
        "wall",
        "ログイン中の端末へ送信"
      ]
    ],
    "result": "受信可能なログイン端末にメッセージが表示されます。",
    "note": "ファイル設定は変えませんが、ほかの端末にも表示されます。監視スクリプトでは集めた値をこの仕組みで表示します。",
    "effect": "端末へメッセージを送信",
    "where": "Debian VM・一般ユーザーの端末"
  }
];
const B2B_ACTIONS = {
  "ufw": {
    "demo": "ufw-toggle",
    "actions": [
      [
        "有効化",
        "sudo ufw enable",
        "保存済みルールを適用し、起動時にも有効にします。接続に必要な許可ルールを先に確認します。",
        "sudo ufw status verbose → Status: active"
      ],
      [
        "無効化",
        "sudo ufw disable",
        "現在のUFWによる制御を解除し、起動時も無効にします。保存したルールを初期化するresetとは別です。",
        "sudo ufw status → Status: inactive"
      ],
      [
        "ルールを再読込",
        "sudo ufw reload",
        "有効なUFWへルールを読み直させます。inactiveからの有効化にはenableを使います。",
        "sudo ufw status verboseで有効状態とルールを再確認"
      ],
      [
        "許可ルールの追加",
        "sudo ufw allow 8080/tcp",
        "TCPの8080番への受信を許可します。元からないルールを実演用に追加する例です。",
        "sudo ufw status numberedで8080/tcpの追加を確認"
      ],
      [
        "今回の許可ルールを削除",
        "sudo ufw delete allow 8080/tcp",
        "今回追加したルールだけを取り除きます。既存ルールを消す操作には使いません。",
        "8080の追加分が消え、4242など既存ルールが残ることを確認"
      ]
    ]
  },
  "systemctl": {
    "demo": "service-control",
    "actions": [
      [
        "今すぐ起動",
        "sudo systemctl start cron",
        "cronを今起動します。次回起動時の自動起動設定は変えません。",
        "systemctl is-active cron → active"
      ],
      [
        "今すぐ停止",
        "sudo systemctl stop cron",
        "cronサービスを今停止します。監視以外のcronジョブも実行されなくなるため、サービス操作の練習用VMで行います。",
        "systemctl is-active cron → inactive（通常、終了状態は非0）"
      ],
      [
        "自動起動を有効",
        "sudo systemctl enable cron",
        "通常の起動時にcronを起動する設定にします。今停止中のサービスはこれだけでは起動しません。",
        "systemctl is-enabled cron → enabled"
      ],
      [
        "自動起動を無効",
        "sudo systemctl disable cron",
        "通常の自動起動設定を解除します。現在動いているcronはこれだけでは停止しません。",
        "systemctl is-enabled cron → disabled。is-activeは別に確認"
      ],
      [
        "自動起動を有効にして今も起動",
        "sudo systemctl enable --now cron",
        "enableが自動起動設定、--nowが現在の起動も行う指定です。",
        "is-enabledがenabled、is-activeがactive"
      ],
      [
        "自動起動を無効にして今も停止",
        "sudo systemctl disable --now cron",
        "disableが自動起動設定の解除、--nowが現在の停止も行う指定です。",
        "is-enabledがdisabled、is-activeがinactive"
      ],
      [
        "再起動",
        "sudo systemctl restart cron",
        "サービスを停止してから起動します。OS全体を再起動するrebootとは別です。",
        "systemctl status cron --no-pagerで状態を確認"
      ]
    ]
  },
  "sshd": {
    "demo": "ssh-reload",
    "actions": [
      [
        "設定検査後に再読込",
        "sudo sshd -t && sudo systemctl reload ssh",
        "sshd -tで設定を検査し、成功した場合だけSSHサービスへ再読込を要求します。systemctlは別の管理コマンドです。",
        "sudo sshd -Tとsudo ss -lntp、別端末からの新しいSSH接続で確認"
      ]
    ]
  },
  "usermod": {
    "demo": "group-demo",
    "actions": [
      [
        "評価用グループへ追加",
        "sudo usermod -aG evaluating evaluationuser",
        "-aは現在の補助グループを残して追加、-Gは追加先の補助グループ、末尾が対象ユーザーです。",
        "id evaluationuserとgetent group evaluatingで確認"
      ],
      [
        "sudoグループへ追加",
        "sudo usermod -aG sudo evaluationuser",
        "評価用ユーザーをsudoグループへ追加します。実際の許可はsudoersのルールに従います。",
        "sudo -l -U evaluationuserで許可を確認。評価用ユーザーは再ログイン"
      ],
      [
        "今回の追加所属を戻す（gpasswd）",
        "sudo gpasswd -d evaluationuser evaluating",
        "gpasswdは別コマンドです。-dで補助メンバー登録を削除します。元から所属していた場合は削除しません。",
        "id evaluationuserで今回の追加だけが消えたことを確認"
      ]
    ]
  },
  "chage": {
    "demo": "password-days",
    "actions": [
      [
        "期限の設定",
        "sudo chage -m 2 -M 30 -W 7 evaluationuser",
        "-mは最短変更間隔、-Mは最長有効期間、-Wは期限前警告の日数です。資料の2・30・7を設定する例です。",
        "sudo chage -l evaluationuserで3項目を確認"
      ]
    ]
  },
  "crontab": {
    "demo": "cron-demo",
    "actions": [
      [
        "rootの予定表を編集",
        "sudo crontab -e",
        "監視の行だけを変更します。毎分なら先頭を*、10分ごとなら*/10にします。",
        "sudo crontab -lで保存した行を確認"
      ],
      [
        "保存した予定表へ復元",
        "sudo crontab /root/crontab.before-monitoring-test",
        "保存ファイルでrootの予定表全体を置き換えます。バックアップ成功と内容の確認が前提です。",
        "sudo crontab -lで元の予定表へ戻ったことを確認"
      ]
    ]
  },
  "hostnamectl": {
    "demo": "hostname-demo",
    "actions": [
      [
        "ホスト名を変更",
        "sudo hostnamectl set-hostname evaluator42",
        "set-hostnameが変更操作、evaluator42が新しい名前の例です。元の名前を記録してから変更します。",
        "hostnamectl --staticで表示、再起動後も同じ名前か確認"
      ]
    ]
  }
};
for (const item of B2B_COMMANDS) {
  if (B2B_ACTIONS[item.name]) Object.assign(item, B2B_ACTIONS[item.name], {effect: "確認・設定変更"});
}
if (typeof module !== "undefined") module.exports = B2B_COMMANDS;
