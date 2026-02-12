export const dashboard: Record<string, string> = {
  // ─── Nav: core items ──────────────────────────────────
  "nav.mypage": "マイページ",
  "nav.analytics": "アナリティクス",
  "nav.inbox": "受信トレイ",
  "nav.bookings": "予約管理",
  "nav.customers": "顧客管理",
  "nav.reviews": "レビュー",
  "nav.embed": "埋め込み",

  // ─── Nav: marketing section ───────────────────────────
  "nav.marketing": "マーケティング",
  "nav.stamps": "スタンプ・クーポン",
  "nav.messages": "メッセージ配信",
  "nav.automations": "自動化",
  "nav.referrals": "紹介・キャンペーン",
  "nav.line": "LINE連携",

  // ─── Nav: settings & billing ──────────────────────────
  "nav.settings": "設定",
  "nav.planAndBilling": "プランと請求",
  "nav.upgrade": "アップグレード",

  // ─── Nav: footer ──────────────────────────────────────
  "nav.viewPage": "ページを見る",
  "nav.logout": "ログアウト",

  // ─── Dashboard page ───────────────────────────────────
  "dashboard.editMyPage": "マイページ編集",
  "dashboard.profileLoadError": "プロフィールの読み込みに失敗しました。ページを再読み込みしてください。",
  "dashboard.copied": "コピー済み",
  "dashboard.copy": "コピー",
  "dashboard.preview": "プレビュー",
  "dashboard.embedTipTitle": "自分のウェブサイトをお持ちですか？",
  "dashboard.embedTipDescription": "スクリプトタグ1つで、お問い合わせフォーム・レビュー・アクセス解析などのFolio機能を追加できます。",

  // ─── QR Code card ─────────────────────────────────────
  "dashboard.qrCode": "QRコード",
  "dashboard.qrColor": "カラー",
  "dashboard.qrBlack": "黒",
  "dashboard.qrBrand": "ブランド",
  "dashboard.qrWhite": "白（暗い背景用）",
  "dashboard.qrDownload": "ダウンロード",

  // ─── Customer stats bar ───────────────────────────────
  "dashboard.customers": "顧客",
  "dashboard.newThisWeek": "今週の新規",

  // ─── SEO / social preview card ────────────────────────
  "dashboard.snsSharePreview": "SNSシェアプレビュー",
  "dashboard.snsSharePreviewDesc": "SNSでシェアした時の表示イメージ",

  // ─── Onboarding form (dashboard page) ─────────────────
  "dashboard.welcomeTo": "{{appName}}へようこそ！",
  "dashboard.setupBasicInfo": "まずはプロフィールの基本情報を設定しましょう",
  "dashboard.username": "ユーザー名",
  "dashboard.usernameHelp": "公開ページのURLになります。英数字・ハイフン・アンダースコアが使えます。",
  "dashboard.displayName": "表示名",
  "dashboard.displayNamePlaceholder": "山田 太郎",
  "dashboard.displayNameHelp": "プロフィールページに表示される名前です。後から変更できます。",
  "dashboard.creating": "作成中...",
  "dashboard.createProfile": "プロフィールを作成",
  "dashboard.usernameError": "ユーザー名は3〜30文字の英数字、ハイフン、アンダースコアのみ使用できます",
  "dashboard.displayNameRequired": "表示名を入力してください",
  "dashboard.usernameTaken": "このユーザー名は既に使用されています",
  "dashboard.profileCreateError": "プロフィールの作成に失敗しました: {{message}}",

  // ─── SEO preview component ────────────────────────────
  "seoPreview.defaultDescription": "{{name}}のプロフィール",

  // ─── Onboarding wizard ────────────────────────────────
  "wizard.welcomeTitle": "{{appName}}へようこそ！",
  "wizard.welcomeDescription": "あなたのプロフィールページを数分で作成しましょう。基本情報の設定、リンクの追加、テンプレートの選択を行います。",
  "wizard.letsStart": "始めましょう",
  "wizard.skipLater": "後でやる",
  "wizard.skipConfirm": "セットアップをスキップしますか？後からダッシュボードで設定できます。",
  "wizard.next": "次へ",
  "wizard.saving": "保存中...",

  // ─── Wizard step 2: avatar & basic info ───────────────
  "wizard.profileInfo": "プロフィール情報",
  "wizard.profileInfoDesc": "アバターと基本情報を設定しましょう",
  "wizard.uploading": "アップロード中...",
  "wizard.selectImage": "画像を選択",
  "wizard.displayName": "表示名",
  "wizard.displayNamePlaceholder": "山田 太郎",
  "wizard.title": "肩書き（任意）",
  "wizard.titlePlaceholder": "デザイナー / カフェオーナー",
  "wizard.bio": "自己紹介（任意）",
  "wizard.bioPlaceholder": "簡単な自己紹介を書きましょう",
  "wizard.imageFormatError": "JPEG、PNG、WebP、GIF形式の画像を選択してください",
  "wizard.fileSizeError": "ファイルサイズは5MB以下にしてください",
  "wizard.uploadFailed": "アバターのアップロードに失敗しました",

  // ─── Wizard step 3: add links ─────────────────────────
  "wizard.addLinks": "リンクを追加",
  "wizard.addLinksDesc": "訪問者に見せたいリンクを追加しましょう。SNS、ウェブサイト、ポートフォリオなど。",
  "wizard.linkNumber": "リンク {{n}}",
  "wizard.linkTitlePlaceholder": "タイトル（例：Instagram）",
  "wizard.addAnotherLink": "リンクを追加",

  // ─── Wizard step 4: choose template ───────────────────
  "wizard.chooseTemplate": "テンプレートを選択",
  "wizard.chooseTemplateDesc": "プロフィールページのデザインを選びましょう",

  // ─── Wizard step 5: preview & publish ─────────────────
  "wizard.previewAndPublish": "プレビュー＆公開",
  "wizard.previewAndPublishDesc": "内容を確認して公開しましょう",
  "wizard.moreLinks": "+{{count}} 件のリンク",
  "wizard.publishUrl": "公開URL:",
  "wizard.publishing": "公開中...",
  "wizard.publish": "公開する",

  // ─── Wizard step 6: done ──────────────────────────────
  "wizard.publishedTitle": "プロフィールが公開されました！",
  "wizard.publishedDescription": "おめでとうございます！あなたのプロフィールページが公開されました。リンクをシェアしましょう。",
  "wizard.goToDashboard": "ダッシュボードへ",
  "wizard.viewTutorial": "チュートリアルを見る",

  // ─── Tutorial tour ────────────────────────────────────
  "tour.mypageTitle": "マイページ",
  "tour.mypageBody": "ここでプロフィールの編集、リンクの追加、テンプレートの変更ができます",
  "tour.analyticsTitle": "アナリティクス",
  "tour.analyticsBody": "プロフィールの閲覧数やアクセス元を確認できます",
  "tour.inboxTitle": "受信トレイ",
  "tour.inboxBody": "お問い合わせフォームから届いたメッセージを確認できます",
  "tour.bookingsTitle": "予約管理",
  "tour.bookingsBody": "お客様からの予約を管理・確認できます",
  "tour.customersTitle": "顧客管理",
  "tour.customersBody": "お客様の情報を一元管理。予約やお問い合わせから自動で追加されます",
  "tour.marketingTitle": "マーケティングツール",
  "tour.marketingBody": "スタンプカード、クーポン、メッセージ配信、紹介プログラムなどの集客ツールです",
  "tour.settingsTitle": "設定",
  "tour.settingsBody": "アカウント設定、カスタムドメイン、通知設定などはこちらから",
  "tour.viewPageTitle": "プロフィールを確認",
  "tour.viewPageBody": "公開中のプロフィールページをプレビューできます",
  "tour.skip": "スキップ",
  "tour.done": "完了",
  "tour.next": "次へ",

  // ─── Pro gate ─────────────────────────────────────────
  "proGate.featureProOnly": "{{feature}}はプロプランでご利用いただけます",
  "proGate.upgradeDescription": "プロプランにアップグレードして、すべての機能をご利用ください。",
  "proGate.upgrade": "アップグレード",

  // ─── Social proof embed ───────────────────────────────
  "embed.widgetTitle": "埋め込みウィジェット",
  "embed.displayMode": "表示モード",
  "embed.preview": "プレビュー",
  "embed.widgetPreview": "ウィジェットプレビュー",
  "embed.embedCode": "埋め込みコード",
  "embed.copied": "コピー済み",
  "embed.copy": "コピー",
  "embed.embedHelp": "このコードをあなたのウェブサイトやブログのHTMLに貼り付けてください。",
  "embed.badgeLabel": "バッジ",
  "embed.badgeDesc": "コンパクトなフローティングバッジ。評価・予約数・閲覧数をローテーション表示",
  "embed.reviewsLabel": "レビュー",
  "embed.reviewsDesc": "レビューカルーセル。承認済みレビューを自動スクロール",
  "embed.statsLabel": "統計バー",
  "embed.statsDesc": "横一列の統計バー。評価・レビュー数・予約数を表示",
  "embed.fullLabel": "フル",
  "embed.fullDesc": "総合表示。評価・最新レビュー・閲覧数を縦に配置",

  // ─── Embed config page ──────────────────────────────
  "embed.pageTitle": "ウェブサイトウィジェット",
  "embed.pageDescription": "スクリプトタグひとつで、あなたのウェブサイトにFolioの機能を追加できます。",
  "embed.proFeature": "ウェブサイトウィジェット",
  "embed.trackingLabel": "ページビュー計測",
  "embed.trackingDesc": "ウェブサイトの訪問者を自動で計測します",
  "embed.trackingAlwaysOn": "常に有効",
  "embed.contactLabel": "お問い合わせフォーム",
  "embed.contactDesc": "訪問者からのメッセージを受け取れます",
  "embed.reviewLabel": "レビュー収集",
  "embed.reviewDesc": "サイト上でお客様のレビューを収集します",
  "embed.subscribeLabel": "メール購読",
  "embed.subscribeDesc": "メールリストを拡大します",
  "embed.badgeLabel2": "ソーシャルプルーフバッジ",
  "embed.badgeDesc2": "レビュー評価や訪問者数を表示します",
  "embed.optionFloat": "フローティングボタン",
  "embed.optionInline": "インライン",
  "embed.optionOff": "オフ",
  "embed.optionOn": "オン",
  "embed.settingsTitle": "設定",
  "embed.languageLabel": "ウィジェットの言語",
  "embed.badgePositionLabel": "バッジの位置",
  "embed.positionBottomLeft": "左下",
  "embed.positionBottomRight": "右下",
  "embed.codeTitle": "埋め込みコード",
  "embed.codeDescription": "このコードをウェブサイトの</body>タグの前にペーストしてください。",
  "embed.codeCopied": "コピーしました！",
  "embed.codeCopy": "コードをコピー",
  "embed.inlineDivsTitle": "インラインウィジェットのコンテナ",
  "embed.inlineDivsDesc": "インラインウィジェットを表示したい場所にこのHTML要素を配置してください。",
  "embed.step1": "上のスクリプトコードをコピー",
  "embed.step2": "ウェブサイトの</body>タグの前にペースト",
  "embed.step3": "インラインウィジェットの場合、コンテナdivを配置",

  // ─── Layout ───────────────────────────────────────────
  "layout.tutorialTooltip": "チュートリアルを見る",
};
