export const marketing: Record<string, string> = {
  // ─── Stamps page ───

  // Page title & tabs
  stampsAndCoupons: "スタンプ & クーポン",
  stampCardTab: "スタンプカード",
  couponTab: "クーポン",

  // Stamp card toggle
  showStampCardOnPublicPage: "スタンプカードを公開ページに表示",
  showStampCardOnPublicPageDesc: "有効にすると、プロフィールページにスタンプカードウィジェットが表示されます",
  enabled: "有効",
  disabled: "無効",

  // Stamp card list
  newStampCard: "新規スタンプカード",
  noStampCardsYet: "スタンプカードはまだありません",
  noStampCardsHint: "「新規スタンプカード」から作成しましょう",
  stampsForReward: "{{count}}スタンプで特典",
  backToStampCardList: "スタンプカード一覧に戻る",
  confirmDeleteStampCard: "このスタンプカードを削除しますか？",

  // Stamp card detail
  qrCode: "QRコード",
  qrCodeDesc: "お客様がスキャンしてスタンプカードを確認できます",
  copied: "コピー済み",
  copyUrl: "URLをコピー",
  download: "ダウンロード",
  milestones: "マイルストーン",
  stampsCount: "{{count}}スタンプ",
  rewardEarned: "特典獲得！",
  customerList: "顧客一覧",
  customersCount: "{{count}}名のお客様",
  noCustomersWithStamps: "まだスタンプを持つお客様はいません",
  unknown: "不明",
  timesCompleted: "{{count}}回達成",
  stampButton: "スタンプ",
  addStampFailed: "スタンプの追加に失敗しました",
  stampAdded: "スタンプを追加しました",
  cardCompleted: "カード完了！特典: {{reward}}",
  cardCompletedDefault: "おめでとうございます！",
  milestoneReached: "マイルストーン達成！{{reward}}",

  // Create stamp card dialog
  newStampCardDialogTitle: "新規スタンプカード",
  newStampCardDialogDesc: "スタンプカードの設定を入力してください",
  cardName: "カード名",
  cardNamePlaceholder: "例: コーヒーカード",
  requiredStamps: "必要スタンプ数",
  icon: "アイコン",
  themeColor: "テーマカラー",
  rewardType: "特典タイプ",
  rewardTypeCoupon: "クーポン連携",
  rewardTypeFreeService: "無料サービス",
  rewardTypeCustom: "カスタム",
  linkedCoupon: "連携クーポン",
  createCouponFirst: "まずクーポンタブでクーポンを作成してください",
  selectPlease: "選択してください",
  rewardDescription: "特典の説明",
  rewardDescriptionPlaceholder: "例: ドリンク1杯無料",
  milestonesIntermediate: "マイルストーン（中間特典）",
  add: "追加",
  milestonesHint: "マイルストーンを追加すると、途中段階で特典を設定できます",
  milestonesStampCount: "数",
  atStamps: "スタンプで",
  milestoneRewardPlaceholder: "例: 10%オフ",
  cancel: "キャンセル",
  creating: "作成中...",
  create: "作成する",
  cardNameRequired: "カード名を入力してください",
  minStampsRequired: "スタンプ数は2以上にしてください",
  createFailed: "作成に失敗しました",

  // Coupon section
  enableCouponFeature: "クーポン機能を有効にする",
  enableCouponFeatureDesc: "有効にすると、クーポンを作成・管理できます",
  newCoupon: "新規クーポン",
  noCouponsYet: "クーポンはまだありません",
  noCouponsHint: "「新規クーポン」から作成しましょう",
  usageCount: "利用: {{used}}{{limit}}回",
  expiresAt: "期限: {{date}}",
  deactivate: "無効にする",
  activate: "有効にする",
  confirmDeleteCoupon: "このクーポンを削除しますか？",

  // Coupon discount display
  percentOff: "{{value}}%OFF",
  fixedOff: "¥{{value}}OFF",
  freeService: "無料サービス",

  // Create coupon dialog
  newCouponDialogTitle: "新規クーポン",
  newCouponDialogDesc: "クーポンの設定を入力してください",
  couponTitle: "タイトル",
  couponTitlePlaceholder: "例: 初回10%OFF",
  couponCode: "クーポンコード",
  autoGenerate: "自動生成",
  couponDescription: "説明（任意）",
  couponDescriptionPlaceholder: "例: 新規のお客様限定",
  discountType: "割引タイプ",
  discountTypePercentage: "割引率（%）",
  discountTypeFixed: "固定額（¥）",
  discountTypeFreeService: "無料サービス",
  discountRate: "割引率",
  discountAmount: "割引額",
  percentUnit: "%",
  yenUnit: "円",
  expiryOptional: "有効期限（任意）",
  usageLimitOptional: "利用回数上限（任意）",
  unlimited: "無制限",
  couponTitleRequired: "タイトルを入力してください",
  couponCodeRequired: "クーポンコードを入力してください",

  // Limit banner label
  stampCardLabel: "スタンプカード",
  couponLabel: "クーポン",

  // ─── Messages page ───

  messageDelivery: "メッセージ配信",
  templatesTab: "テンプレート",
  sendTab: "送信",
  historyTab: "送信履歴",

  // Template types
  templateTypeFollowUp: "フォローアップ",
  templateTypeReviewRequest: "レビュー依頼",
  templateTypeCampaign: "キャンペーン",
  templateTypeReminder: "リマインダー",
  templateTypeThankYou: "お礼",

  // Trigger types
  triggerManual: "手動",
  triggerAfterBooking: "予約後",
  triggerAfterDays: "日数経過後",
  triggerAfterContact: "お問い合わせ後",

  // Status
  statusPending: "送信待ち",
  statusSent: "送信済み",
  statusDelivered: "配信済み",
  statusOpened: "開封済み",
  statusClicked: "クリック済み",
  statusFailed: "失敗",

  // Templates tab
  autoFollowUp: "自動フォローアップ",
  autoFollowUpDesc: "予約やお問い合わせ後に自動でメッセージを送信します",
  templateList: "テンプレート一覧",
  newTemplate: "新規テンプレート",
  noTemplatesYet: "テンプレートはまだありません",
  noTemplatesHint: "「新規テンプレート」から作成してください",
  daysLater: "{{days}}日後",
  hoursLater: "{{hours}}時間後",
  subject: "件名",

  // Template editor
  editTemplate: "テンプレートを編集",
  newTemplateDialogTitle: "新規テンプレート",
  templateEditorDesc: "メッセージテンプレートの内容を設定します",
  startFromTemplate: "テンプレートから始める：",
  startFromBlank: "白紙から作成",
  templateName: "テンプレート名",
  templateNamePlaceholder: "例: 予約お礼メール",
  type: "タイプ",
  trigger: "トリガー",
  delayHours: "遅延時間（時間）",
  sendAfterDays: "約{{days}}日後に送信",
  sendAfterHours: "{{hours}}時間後に送信",
  subjectLabel: "件名",
  subjectPlaceholder: "メールの件名",
  placeholderChips: "差し込み変数（クリックで本文に挿入）",
  bodyLabel: "本文",
  backToEdit: "編集に戻る",
  preview: "プレビュー",
  bodyPlaceholder: "メッセージ本文を入力...",
  enableTemplate: "テンプレートを有効にする",
  saving: "保存中...",
  update: "更新",
  save: "保存",

  // Review URL notice
  setGoogleReviewUrlFirst: "設定 > GoogleレビューURLを先に設定してください",

  // Delete template dialog
  deleteTemplateTitle: "テンプレートを削除",
  deleteTemplateConfirm: "「{{name}}」を削除しますか？この操作は取り消せません。",
  deleteButton: "削除する",

  // Send tab
  emailDelivery: "メール配信",
  templateSelection: "テンプレート選択",
  template: "テンプレート",
  selectTemplate: "テンプレートを選択してください",
  previewLabel: "プレビュー",
  recipients: "送信先",
  allCustomers: "全顧客",
  filterByTag: "タグで絞り込み",
  filterByTagLabel: "タグで絞り込み",
  manualSelect: "個別選択",
  tagPlaceholder: "タグ名を入力...",
  noCustomers: "顧客がいません",
  recipientCount: "{{count}}件",
  sendButton: "送信する",

  // Send confirm dialog
  sendConfirmTitle: "メッセージ送信確認",
  sendConfirmDesc: "{{count}}件のメッセージを送信しますか？",
  sendConfirmTemplate: "テンプレート: ",
  sendConfirmRecipients: "送信先: ",
  sendConfirmRecipientsCount: "{{count}}名",
  sendConfirmChannel: "チャンネル: ",
  channelEmail: "メール",
  sending: "送信中...",
  sendAction: "送信する",
  sendSuccess: "{{sent}}件のメールを送信しました",
  sendPartialSuccess: "{{sent}}件送信成功、{{failed}}件送信失敗",
  sendFailed: "送信に失敗しました",
  messageSendFailed: "メッセージの送信に失敗しました",

  // History tab
  totalSent: "合計送信",
  opened: "開封",
  clicked: "クリック",
  failed: "失敗",
  statusFilterAll: "すべて",
  noHistory: "送信履歴はまだありません",
  templateLabel: "テンプレート: {{name}}",
  channelEmailBadge: "メール",
  channelLineBadge: "LINE",

  // Toast errors for messages
  templateLoadError: "テンプレートの読み込みに失敗しました",
  historyLoadError: "送信履歴の読み込みに失敗しました",
  templateSaveError: "テンプレートの保存に失敗しました",
  templateDeleteError: "テンプレートの削除に失敗しました",
  templateUpdateError: "テンプレートの更新に失敗しました",

  // ─── Automations page ───

  automationsTitle: "自動フォローアップ",
  newRule: "新規ルール作成",
  rulesTab: "ルール",
  logsTab: "送信ログ",

  // Automation trigger types
  autoTriggerAfterBooking: "予約後",
  autoTriggerAfterContact: "お問い合わせ後",
  autoTriggerAfterSubscribe: "メール購読後",
  autoTriggerAfterStampComplete: "スタンプカード完了後",
  autoTriggerNoVisit30d: "30日間来店なし",
  autoTriggerNoVisit60d: "60日間来店なし",
  autoTriggerNoVisit90d: "90日間来店なし",
  autoTriggerBirthday: "誕生日",

  // Automation action types
  autoActionSendEmail: "メール送信",
  autoActionSendReviewRequest: "レビュー依頼",
  autoActionSendCoupon: "クーポン送付",

  // Automation status
  autoStatusScheduled: "予定",
  autoStatusSent: "送信済み",
  autoStatusFailed: "失敗",
  autoStatusSkipped: "スキップ",

  // Quick templates
  recommendedTemplates: "おすすめテンプレート",
  configured: "設定済み",
  enableOneClick: "ワンクリックで有効化",
  customize: "カスタマイズ",

  // Rule list
  noAutomationRules: "自動化ルールがまだありません",
  noAutomationRulesHint: "上のテンプレートから始めるか、新規ルールを作成してください",
  hoursAfter: "{{hours}}時間後",
  autoTemplateLabel: "テンプレート: {{name}}",
  autoCouponLabel: "クーポン: {{title}} ({{code}})",
  autoSentCount: "送信済み: {{count}}件",
  autoScheduledCount: "予定: {{count}}件",
  ruleDeactivated: "ルールを無効にしました",
  ruleActivated: "ルールを有効にしました",
  changeFailed: "変更に失敗しました",

  // Logs
  noLogs: "ログがありません",
  ruleDeleted: "ルール削除済み",
  all: "すべて",

  // Create/Edit rule dialog
  editRule: "ルール編集",
  newRuleDialogTitle: "新規ルール作成",
  editRuleDesc: "自動化ルールを編集します",
  newRuleDesc: "新しい自動フォローアップルールを作成します",
  ruleName: "ルール名 *",
  ruleNamePlaceholder: "予約後のお礼メール",
  triggerLabel: "トリガー *",
  actionLabel: "アクション *",
  delayLabel: "遅延時間",
  afterEvent: "イベント後",
  executeAfterHours: "時間後に実行",
  messageTemplate: "メッセージテンプレート（任意）",
  customInput: "カスタム（下記入力）",
  subjectAutoLabel: "件名",
  subjectAutoPlaceholder: "ご予約ありがとうございます",
  bodyAutoLabel: "本文",
  bodyAutoPlaceholder: "{{customer_name}}様\n\nメッセージ本文...",
  placeholderHint: "{{customer_name}} {{business_name}} などのプレースホルダーが使えます",
  couponSelectLabel: "クーポン",
  ruleNameRequired: "ルール名を入力してください",
  updateFailed: "更新に失敗しました",
  networkError: "ネットワークエラーが発生しました",
  ruleUpdated: "ルールを更新しました",
  ruleCreated: "ルールを作成しました",
  ruleDeleteSuccess: "ルールを削除しました",
  ruleDeleteFailed: "ルールの削除に失敗しました",
  ruleCreateFailed: "ルールの作成に失敗しました",
  enabledTemplate: "「{{name}}」を有効にしました",
  updateAction: "更新する",
  createAction: "作成する",

  // ─── Referrals page ───

  referralsAndCampaigns: "紹介・キャンペーン",
  referralProgramTab: "紹介プログラム",
  campaignTab: "キャンペーン",

  // Referral settings
  referralSettings: "紹介設定",
  referralSettingsDesc: "紹介プログラムの有効/無効を切り替えます",
  enableReferralProgram: "紹介プログラムを有効にする",

  // Referral stats
  referralCodeCount: "紹介コード数",
  referralCount: "紹介数",
  codeUsageRate: "コード利用率",

  // Referral codes list
  referralCodeList: "紹介コード一覧",
  issueReferralCode: "紹介コード発行",
  noReferralCodes: "紹介プログラムのコードがまだありません",
  referralBadge: "紹介 {{count}}件",
  rewardLabel: "特典: {{title}}",
  noReferralsYet: "紹介はまだありません",

  // Referral status
  refStatusSignedUp: "登録済み",
  refStatusBooked: "予約済み",
  refStatusRewarded: "特典付与",

  // Create referral dialog
  issueReferralDialogTitle: "紹介コード発行",
  issueReferralDialogDesc: "顧客に紹介コードを発行します。紹介された方が登録するとカウントされます。",
  selectCustomer: "顧客を選択 *",
  referralRewardCoupon: "紹介特典クーポン（任意）",
  none: "なし",
  codeAutoGenerated: "コードは自動生成されます（例: REF-A3K7P2）",
  issuingCode: "作成中...",
  issueCode: "コードを発行",
  referralCodeCreateFailed: "紹介コードの作成に失敗しました",
  referralCodeDeleteFailed: "紹介コードの削除に失敗しました",
  referralDataLoadFailed: "紹介データの取得に失敗しました",

  // ProGate feature names
  referralProgramFeature: "紹介プログラム",
  campaignPageFeature: "キャンペーンページ",

  // ─── Campaigns section ───

  campaignList: "キャンペーン一覧",
  newCampaign: "新規キャンペーン",
  noCampaigns: "キャンペーンページがまだありません",
  published: "公開中",
  draft: "下書き",
  expired: "期限切れ",
  previewLink: "プレビュー",
  expiresLabel: "期限: {{date}}",
  couponLabelCampaign: "クーポン: {{title}}",
  unpublish: "非公開にする",
  publish: "公開する",
  campaignDeleteFailed: "キャンペーンの削除に失敗しました",
  publishToggleFailed: "公開状態の変更に失敗しました",

  // Campaign dialog
  editCampaign: "キャンペーン編集",
  newCampaignDialogTitle: "新規キャンペーン",
  editCampaignDesc: "キャンペーンページの内容を編集します",
  newCampaignDesc: "新しいキャンペーンランディングページを作成します",
  campaignTitleLabel: "タイトル *",
  campaignTitlePlaceholder: "春の特別キャンペーン",
  slugLabel: "スラッグ（URL） *",
  slugUrlPrefix: "URL: /c/{{username}}/{{slug}}",
  descriptionLabel: "説明",
  descriptionPlaceholder: "キャンペーンの詳細を入力...",
  heroImageUrl: "ヒーロー画像URL",
  ctaButtonText: "CTAボタンのテキスト",
  ctaButtonPlaceholder: "予約する",
  ctaLinkUrl: "CTAリンク先URL（空欄でプロフィールページ）",
  campaignCouponOptional: "クーポン（任意）",
  expiryDate: "期限日（任意）",
  campaignTemplate: "テンプレート",
  publishToggle: "公開する",
  publishedStatus: "公開",
  draftStatus: "下書き",
  campaignTitleRequired: "タイトルを入力してください",
  slugRequired: "スラッグを入力してください",

  // Campaign template options
  templateDefault: "デフォルト",
  templateDefaultDesc: "白背景、クリーンなレイアウト",
  templateMinimal: "ミニマル",
  templateMinimalDesc: "薄グレー、シンプルなスタイル",
  templateBold: "ボールド",
  templateBoldDesc: "グラデーション背景、大きなCTA",
  templateFestive: "フェスティブ",
  templateFestiveDesc: "お祝いムード、暖色系",

  // ─── LINE page ───

  lineIntegration: "LINE連携",
  connected: "接続済み",
  notConnected: "未接続",
  setupGuide: "セットアップガイド",
  lineFeature: "LINE連携",

  // LINE settings
  settings: "設定",
  lineSettingsDesc: "LINE Messaging APIの設定を行います",
  webhookUrl: "Webhook URL",
  webhookCopied: "コピー済み",
  webhookCopy: "コピー",
  webhookHint: "LINE DevelopersのMessaging API設定でこのURLを設定してください",
  channelId: "チャネルID",
  channelSecret: "チャネルシークレット",
  channelSecretPlaceholder: "チャネルシークレットを入力",
  channelAccessToken: "チャネルアクセストークン",
  channelAccessTokenPlaceholder: "チャネルアクセストークンを入力",
  friendAddLink: "友だち追加リンク",
  saveFailed: "保存に失敗しました",
  saveSuccess: "設定を保存しました",
  lineSaveSuccess: "LINE設定を保存しました",
  savingSettings: "保存中...",
  saveSettingsButton: "設定を保存",

  // LINE contacts
  totalFriends: "トータル友だち",
  activeFriends: "アクティブ友だち",
  friendList: "友だちリスト",
  friendListDesc: "LINE公式アカウントの友だち一覧",
  noLineFriends: "LINE友だちがまだいません。",
  noLineFriendsHint: "友だち追加リンクをプロフィールに設定しましょう。",
  friend: "友だち",
  blocked: "ブロック",
  customerNotLinked: "顧客未リンク",
  customerLabel: "顧客: {{name}}",
  send: "送信",
  lineContactLoadFailed: "LINE友だちの読み込みに失敗しました",

  // LINE send dialog
  lineSendTitle: "メッセージ送信",
  messageLabel: "メッセージ",
  messagePlaceholder: "メッセージを入力...",
  lineSendSuccess: "メッセージを送信しました",
  lineSendFailed: "送信に失敗しました",
  lineMessageSendFailed: "メッセージの送信に失敗しました",

  // ─── LINE Setup Guide ───

  lineSetupTitle: "LINE Messaging API セットアップ",
  close: "閉じる",
  stepOf: "ステップ {{current}} / {{total}}",
  step: "ステップ {{num}}",

  // Step titles
  stepTitle1: "LINE Developersにログイン",
  stepTitle2: "プロバイダーを作成",
  stepTitle3: "Messaging APIチャネルを作成",
  stepTitle4: "チャネルIDとシークレットをコピー",
  stepTitle5: "チャネルアクセストークンを発行",
  stepTitle6: "Webhook URLを設定",
  stepTitle7: "設定完了！",

  // Step 1
  step1Instruction1: "にアクセス",
  step1Instruction2: "LINEアカウントでログイン（お持ちでない場合は新規作成）",
  step1Instruction3: "ログイン後、コンソールが表示されます",
  step1Tip: "普段お使いのLINEアカウントでログインできます。ビジネス用の別アカウントは不要です。",
  step1LearnMore1: "LINE Developersは、LINEの公式開発者ツールです。ここでMessaging APIのチャネル（公式アカウント）を作成・管理できます。",
  step1LearnMore2: "ログインに使用するLINEアカウントは、個人のアカウントで構いません。お客様に公開されるのはプロバイダー名とチャネル名のみです。",

  // Step 2
  step2Instruction1Create: "作成",
  step2Instruction1Provider: "プロバイダー",
  step2Instruction2: "お店やサービスの名前",
  step2Instruction3Create: "作成",
  step2Tip: "プロバイダー名はお客様に表示されます。お店やサービスの正式名称をおすすめします。（例：「○○サロン」「△△スタジオ」）",
  step2LearnMore1: "プロバイダーは、LINEサービスを提供する組織や個人を表します。1つのプロバイダーの中に複数のチャネル（公式アカウント）を作成できます。",
  step2LearnMore2: "既にプロバイダーをお持ちの場合は、新しく作成せずに既存のプロバイダーを使用しても構いません。",

  // Step 3
  step3Instruction1: "Messaging API",
  step3Instruction1Prefix: "新規チャネル作成",
  step3Instruction2: "お店の名前",
  step3Instruction3: "チャネル説明を入力（例：「○○サロンの公式アカウント」）",
  step3Instruction4: "カテゴリとサブカテゴリを選択",
  step3Instruction5Create: "作成",
  step3Tip: "チャネル名がLINE公式アカウントの名前になります。お客様がLINEで検索したときに表示されます。",
  step3LearnMoreCategoryTitle: "カテゴリの選択例：",
  step3LearnMoreCat1: "美容サロン → 「ビューティー」→「ヘアサロン」",
  step3LearnMoreCat2: "ネイルサロン → 「ビューティー」→「ネイル」",
  step3LearnMoreCat3: "整体・マッサージ → 「ヘルス」→「リラクゼーション」",
  step3LearnMoreCat4: "フリーランス → 該当するカテゴリを選択、なければ「その他」",
  step3LearnMoreEmailNote: "メールアドレスは受信可能なものを設定してください。LINE側からの重要な通知が届きます。",

  // Step 4
  step4Instruction1: "チャネル基本設定",
  step4Instruction2: "チャネルID",
  step4Instruction3: "チャネルシークレット",
  step4ChannelIdLabel: "チャネルID",
  step4ChannelSecretLabel: "チャネルシークレット",
  step4ChannelSecretPlaceholder: "チャネルシークレットを貼り付け",
  step4Warning: "チャネルシークレットが表示されていない場合は、「発行」ボタンを押してください。",
  step4LearnMore1: "チャネルIDは数字のみの文字列です。チャネル基本設定ページの上部に表示されています。",
  step4LearnMore2: "チャネルシークレットは英数字の文字列です。これはパスワードのようなものなので、他の人と共有しないでください。",

  // Step 5
  step5Instruction1: "Messaging API設定",
  step5Instruction2: "チャネルアクセストークン（長期）",
  step5Instruction3Issue: "発行",
  step5Instruction4: "表示されたトークンをコピーして、下のフィールドに貼り付け",
  step5TokenLabel: "チャネルアクセストークン",
  step5TokenPlaceholder: "チャネルアクセストークンを貼り付け",
  step5Tip: "アクセストークンは非常に長い文字列です。必ず全体をコピーしてください。",
  step5LearnMore1: "チャネルアクセストークンは、LINEのAPIにアクセスするための認証情報です。「発行」ボタンを押すと新しいトークンが生成されます。",
  step5LearnMore2: "以前発行したトークンがある場合、再発行すると古いトークンは無効になります。",

  // Step 6
  step6Instruction1: "Messaging API設定",
  step6Instruction2: "Webhook URL",
  step6Instruction3: "Webhookの利用",
  step6Instruction4: "検証",
  step6Warning: "応答メッセージの設定で「応答メッセージ」をオフに、「Webhook」をオンにしてください。",
  step6WarningImportant: "重要：",
  step6LearnMore1: "Webhook URLは、お客様がLINEでメッセージを送信した際に、そのメッセージの情報が送られる先のURLです。",
  step6LearnMore2: "「応答メッセージ」をオフにすると、LINE側の自動応答が無効になり、こちらのシステムで応答を制御できるようになります。",
  step6LearnMore3: "「検証」ボタンを押して「成功」と表示されれば、Webhook URLの設定は正常です。エラーが出る場合は、URLが正しいか確認してください。",

  // Step 7
  inputConfirmation: "入力内容の確認",
  channelIdStatus: "チャネルID",
  channelSecretStatus: "チャネルシークレット",
  accessTokenStatus: "アクセストークン",
  entered: "入力済み",
  notEntered: "未入力",
  fillAllFields: "すべての項目を入力してください。前のステップに戻って入力できます。",
  settingsSaved: "設定を保存しました！",
  lineAccountConnected: "LINE公式アカウントが接続されました。",
  saveAndConnect: "保存して接続",
  step7Tip: "LINE公式アカウントのQRコードを友だち追加ページに表示して、お客様に友だち登録してもらいましょう。",

  // Navigation
  back: "戻る",
  next: "次へ",
  doneAndClose: "完了して閉じる",
  learnMoreOpen: "詳しく見る",
  learnMoreClose: "閉じる",
  copiedButton: "コピー済み",
  copyButton: "コピー",
};
