export const guideEmbed = {
  // --- Metadata ---
  metaTitle: "Folioをあなたのウェブサイトに追加する方法",
  metaDescription:
    "Folioウィジェットをウェブサイトに埋め込むためのステップバイステップガイド。WordPress、Wix、Squarespace、Shopify、カスタムHTMLに対応。",

  // --- Nav ---
  dashboard: "ダッシュボード",
  login: "ログイン",
  startFree: "無料で始める",

  // --- Hero ---
  heroTitle: "Folioをあなたのウェブサイトに追加",
  heroDescription:
    "既存のウェブサイトに小さなスクリプトを埋め込むだけで、お問い合わせフォーム、レビュー収集、メール購読、アクセス解析、ソーシャルプルーフバッジをすべて追加できます。すべてFolioプロフィールで管理されます。",

  // --- What You Get ---
  whatYouGetTitle: "追加される機能",
  widgetTrackingTitle: "ページビュー計測",
  widgetTrackingDesc:
    "ウェブサイトの訪問者数を自動的にカウントします。訪問者には見えず、追加設定も不要です。",
  widgetContactTitle: "お問い合わせフォーム",
  widgetContactDesc:
    "フローティングボタンからお問い合わせフォームを表示。訪問者はページを離れることなく連絡できます。",
  widgetReviewTitle: "レビュー収集",
  widgetReviewDesc:
    "フローティングボタンから口コミや星評価を投稿できます。",
  widgetSubscribeTitle: "メール購読",
  widgetSubscribeDesc:
    "訪問者がメールリストに登録できるインラインフォームです。",
  widgetBadgeTitle: "ソーシャルプルーフバッジ",
  widgetBadgeDesc:
    "サイトの隅に表示される小さなバッジで、レビュー評価とFolioプロフィールへのリンクを表示します。",

  // --- Steps Overview ---
  stepsTitle: "設定方法",
  stepsSubtitle:
    "以下の5つのステップに沿って進めてください。全体で約10分で完了します。",

  // --- Step 1 ---
  step1Title: "ステップ1：Folioアカウントを作成",
  step1Desc:
    "まだFolioアカウントをお持ちでない場合は、無料で登録できます。30秒で完了します。",
  step1Link: "こちらから登録",
  step1Detail: "登録後、プロフィール名と基本情報を入力してください。",

  // --- Step 2 ---
  step2Title: "ステップ2：Proプランにアップグレード",
  step2Desc:
    "埋め込みウィジェット機能はProプランでご利用いただけます。料金プランとアップグレードは以下のリンクからご確認いただけます。",
  step2Link: "料金プランを見る",

  // --- Step 3 ---
  step3Title: "ステップ3：ウィジェットを設定",
  step3Desc:
    "ダッシュボードにアクセスし、「埋め込み」ページを開きます。そこで以下の設定ができます：",
  step3Item1: "使用したいウィジェットの切り替え（お問い合わせ、レビューなど）",
  step3Item2: "ウィジェットの言語選択（日本語または英語）",
  step3Item3: "カスタムスクリプトコードが自動的に生成されます",
  step3Link: "埋め込み設定を開く",

  // --- Step 4 ---
  step4Title: "ステップ4：コードをコピー",
  step4Desc:
    "埋め込みページで「コードをコピー」ボタンをクリックします。以下のようなHTMLコードが取得できます：",
  step4Note:
    "実際のコードにはあなたのプロフィールIDが自動的に入力されます。上の例はプレースホルダーを使用しています。",

  // --- Step 5 ---
  step5Title: "ステップ5：ウェブサイトにコードを追加",
  step5Desc:
    "コードをウェブサイトに貼り付けます。手順はお使いのプラットフォームによって異なります。以下からお使いのプラットフォームを選んでください。",

  // --- Platform: HTML ---
  platformHtmlTitle: "カスタムHTMLウェブサイト",
  platformHtmlDesc:
    "HTMLファイルで自分のウェブサイトを作成している場合は、以下の手順に従ってください：",
  platformHtmlStep1:
    "テキストエディタ（メモ帳、VS Codeなど）でHTMLファイルを開きます。",
  platformHtmlStep2: "ファイルの下部にスクロールして、</body>タグを見つけます。",
  platformHtmlStep3: "そのタグの直前にFolioスクリプトを貼り付けます。",
  platformHtmlStep4: "ファイルを保存し、ブラウザを更新します。",
  platformHtmlBefore: "変更前：",
  platformHtmlAfter: "変更後：",

  // --- Platform: WordPress ---
  platformWpTitle: "WordPress",
  platformWpDesc: "WordPressでコードを追加する方法はいくつかあります：",
  platformWpOption1Title: "方法A：プラグインを使用（最も簡単）",
  platformWpOption1Step1:
    "無料プラグイン「Insert Headers and Footers」（WPCode）をインストールします。",
  platformWpOption1Step2:
    "「コードスニペット」から「スニペットを追加」をクリックします。",
  platformWpOption1Step3:
    "Folioスクリプトを貼り付け、配置場所を「サイト全体のフッター」に設定します。",
  platformWpOption1Step4: "保存してスニペットを有効にします。",
  platformWpOption2Title: "方法B：テーマエディター",
  platformWpOption2Step1:
    "外観 > テーマファイルエディターに移動します。",
  platformWpOption2Step2:
    "右サイドバーから「footer.php」ファイルを開きます。",
  platformWpOption2Step3: "</body>タグの直前にFolioスクリプトを貼り付けます。",
  platformWpOption2Step4: "「ファイルを更新」をクリックします。",

  // --- Platform: Wix ---
  platformWixTitle: "Wix",
  platformWixStep1: "Wixダッシュボードの「設定」に移動します。",
  platformWixStep2: "「詳細」の「カスタムコード」をクリックします。",
  platformWixStep3: "「Body - end」セクションで「コードを追加」をクリックします。",
  platformWixStep4: "Folioスクリプトを貼り付けて保存します。",

  // --- Platform: Squarespace ---
  platformSquarespaceTitle: "Squarespace",
  platformSquarespaceStep1:
    "設定 > 詳細 > コードインジェクションに移動します。",
  platformSquarespaceStep2: "「フッター」欄にFolioスクリプトを貼り付けます。",
  platformSquarespaceStep3: "「保存」をクリックします。",

  // --- Platform: Shopify ---
  platformShopifyTitle: "Shopify",
  platformShopifyStep1: "オンラインストア > テーマに移動します。",
  platformShopifyStep2:
    "現在のテーマで「コードを編集」をクリックします。",
  platformShopifyStep3: "「theme.liquid」ファイルを開きます。",
  platformShopifyStep4: "</body>タグの直前にFolioスクリプトを貼り付けます。",
  platformShopifyStep5: "「保存」をクリックします。",

  // --- Platform: Next.js / React ---
  platformReactTitle: "Next.js / React",
  platformReactDesc:
    "ルートレイアウトにスクリプトを追加して、すべてのページで読み込まれるようにします。",
  platformReactStep1:
    "ルートレイアウトファイル（app/layout.tsxまたはpages/_document.tsx）を開きます。",
  platformReactStep2:
    "</body>の直前に<Script>タグ（または通常の<script>）を追加します。",
  platformReactNote:
    "Next.js App Routerを使用している場合は、next/scriptコンポーネントでstrategy=\"afterInteractive\"を使用してください。",

  // --- Inline Widgets ---
  inlineTitle: "インラインウィジェット（上級者向け）",
  inlineDesc:
    "お問い合わせ、レビュー、購読ウィジェットで「インライン」モードを選択した場合、ウィジェットを表示したい場所にコンテナ要素を追加する必要があります。",
  inlineStep1:
    "ページ上のウィジェットを表示したい場所を決めます。",
  inlineStep2:
    "HTMLのその場所に対応する<div>タグを追加します。",
  inlineStep3:
    "Folioスクリプトが自動的にdivを見つけ、その中にウィジェットを表示します。",
  inlineContactDiv: "お問い合わせフォームの場合：",
  inlineReviewDiv: "レビューフォームの場合：",
  inlineSubscribeDiv: "メール購読フォームの場合：",
  inlineExample:
    "例えば、ページの下部に購読フォームを表示したい場合：",

  // --- FAQ ---
  faqTitle: "よくある質問",
  faqSlowQ: "ウェブサイトが遅くなりますか？",
  faqSlowA:
    "いいえ。スクリプトは非常に小さく（約11KB）、「defer」属性で読み込まれるため、ページの読み込みを妨げません。訪問者が違いに気づくことはありません。",
  faqColorsQ: "色をカスタマイズできますか？",
  faqColorsA:
    "ウィジェットはFolioプロフィールのアクセントカラーを自動的に使用します。プロフィールエディターからいつでも変更できます。",
  faqMobileQ: "スマートフォンでも動作しますか？",
  faqMobileA:
    "はい。すべてのウィジェットは完全にレスポンシブ対応で、スマートフォン、タブレット、デスクトップ画面で正しく表示されます。",
  faqRemoveQ: "後から削除できますか？",
  faqRemoveA:
    "はい。ウェブサイトからスクリプトタグを削除するだけで、ウィジェットはすぐに表示されなくなります。",
  faqMultipleQ: "複数のウェブサイトに追加できますか？",
  faqMultipleA:
    "はい。同じスクリプトをいくつでもウェブサイトに貼り付けることができます。すべて同じFolioプロフィールに接続されます。",
  faqNoCodingQ: "プログラミング経験がなくてもできますか？",
  faqNoCodingA:
    "もちろんです。WordPress、Wix、Squarespaceなどのプラットフォームでは、コードを書く必要はありません。上記の手順に従って、適切な場所にスクリプトを貼り付けるだけです。",

  // --- CTA ---
  ctaTitle: "さっそく始めましょう",
  ctaDesc:
    "Folioアカウントを作成し、ウィジェットを設定して、数分でウェブサイトに追加できます。",
  ctaSignup: "無料アカウントを作成",
  ctaLoggedIn: "ダッシュボードへ",
} as const;
