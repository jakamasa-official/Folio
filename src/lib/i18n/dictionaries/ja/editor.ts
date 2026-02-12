export const editor: Record<string, string> = {
  // profile-editor.tsx — Status bar
  statusPublished: "公開中",
  statusDraft: "非公開",
  unpublishButton: "非公開にする",
  publishButton: "公開する",

  // profile-editor.tsx — Templates
  templateTitle: "テンプレート",
  freeTemplates: "無料テンプレート",
  premiumLabel: "プレミアム",
  premiumProPlan: "（Proプラン）",
  premiumTemplateError: "プレミアムテンプレートはProプランで利用できます",
  otherCategory: "その他",

  // profile-editor.tsx — Custom colors
  customColorTitle: "カスタムカラー",
  customColorDescription: "テンプレートの色をカスタマイズできます",
  accentColor: "アクセント",
  backgroundColor: "背景色",
  textColor: "文字色",
  colorReset: "リセット",

  // profile-editor.tsx — Font
  fontTitle: "フォント",
  fontDefault: "デフォルト",
  fontPreviewText: "あいうえお ABCDabcd 12345",

  // profile-editor.tsx — Video background
  videoBgTitle: "動画背景",
  videoBgDescription: "プロフィールの背景に動画を設定できます",
  videoDelete: "削除",
  videoUploadLabel: "動画をアップロード（MP4/WebM, 最大20MB）",
  videoSizeError: "動画は20MB以下にしてください",
  videoUploadError: "動画のアップロードに失敗しました",

  // profile-editor.tsx — Basic info
  basicInfoTitle: "基本情報",
  profilePhotoLabel: "プロフィール写真",
  selectImage: "画像を選択",
  imageTypeError: "JPEG、PNG、WebP、GIF画像のみアップロードできます",
  imageSizeError: "ファイルサイズは5MB以下にしてください",
  imageUploadError: "画像のアップロードに失敗しました",
  displayNameLabel: "表示名 *",
  displayNamePlaceholder: "山田 太郎",
  titleLabel: "肩書き・タイトル",
  titlePlaceholder: "フリーランスデザイナー / カフェオーナー",
  bioLabel: "自己紹介",
  bioPlaceholder: "あなたについて教えてください...",
  locationLabel: "場所",
  locationPlaceholder: "東京都渋谷区",

  // profile-editor.tsx — Free text / Rich text
  richTextTitle: "フリーテキスト",
  richTextDescription: "自由にフォーマットしたテキストを追加できます",

  // profile-editor.tsx — Slides
  slidesTitle: "スライド",
  slidesDescription: "画像カルーセルまたはコンテンツセクションを追加",

  // profile-editor.tsx — OG / SNS Share
  ogTitle: "SNSシェア設定",
  ogDescription: "SNSでシェアした時に表示される画像やタイトルをカスタマイズ",
  ogShareImageLabel: "シェア画像（推奨: 1200×630px）",
  ogDeleteImage: "削除",
  ogSelectImage: "画像を選択",
  ogImageSizeError: "画像は5MB以下にしてください",
  ogImageUploadError: "画像のアップロードに失敗しました",
  ogCustomTitle: "カスタムタイトル",
  ogCustomDescription: "カスタム説明文",
  ogDefaultDescription: "プロフィールの説明",
  ogPreview: "プレビュー",
  ogFallbackDescription: "{{name}}のプロフィール",

  // profile-editor.tsx — Contact
  contactTitle: "連絡先",
  contactEmailLabel: "メールアドレス（公開）",
  contactPhoneLabel: "電話番号（公開）",
  lineFriendLabel: "LINE友だち追加URL",
  lineFriendHint: "プロフィールに「LINEで友だち追加」ボタンが表示されます",
  googleReviewLabel: "Google口コミURL",
  googleReviewHint: "プロフィールに「Google口コミを書く」ボタンが表示されます",

  // profile-editor.tsx — Links
  linksTitle: "リンク",
  linkLabelPlaceholder: "ラベル",
  addLink: "リンクを追加",

  // profile-editor.tsx — Social links
  socialTitle: "SNS",

  // profile-editor.tsx — Feature toggles
  featureTitle: "機能設定",
  featureDescription: "プロフィールページに表示する機能を選択します",
  featureContactForm: "お問い合わせフォーム",
  featureContactFormDesc: "訪問者からのメッセージを受け取ります",
  featureEmailSubscribe: "メール購読フォーム",
  featureEmailSubscribeDesc: "訪問者のメールアドレスを収集します",
  featureBookingCalendar: "予約カレンダー",
  featureBookingCalendarDesc: "訪問者がオンラインで予約できるようにします",

  // profile-editor.tsx — Password protection
  passwordTitle: "パスワード保護",
  passwordDescription: "ページにパスワードを設定して閲覧を制限します",
  passwordCurrentSet: "パスワードが設定されています",
  passwordRemove: "解除",
  passwordNewLabel: "新しいパスワード",
  passwordLabel: "パスワード",
  passwordChangePlaceholder: "変更する場合のみ入力",
  passwordSetPlaceholder: "パスワードを設定",
  passwordSetError: "パスワードの設定に失敗しました",

  // profile-editor.tsx — Save
  previewLink: "プレビュー",
  saveButton: "保存する",
  savingButton: "保存中...",
  saveSuccess: "保存しました",
  saveError: "保存に失敗しました",

  // slides-editor.tsx
  slideModeImage: "画像カルーセル",
  slideModeContent: "コンテンツセクション",
  slideUploading: "アップロード中...",
  slideAddImage: "画像を追加",
  slideImageCount: "{{count}}/10枚",
  slideSection: "セクション {{index}}",
  slideTitlePlaceholder: "タイトル",
  slideBodyPlaceholder: "本文を入力...",
  slideAddSection: "セクションを追加",
  slideSectionCount: "{{count}}/10セクション",

  // booking-settings.tsx
  bookingDaysLabel: "受付曜日",
  bookingStartLabel: "開始時間",
  bookingEndLabel: "終了時間",
  bookingDurationLabel: "1枠の長さ",
  bookingDayMon: "月",
  bookingDayTue: "火",
  bookingDayWed: "水",
  bookingDayThu: "木",
  bookingDayFri: "金",
  bookingDaySat: "土",
  bookingDaySun: "日",
  bookingDuration30: "30分",
  bookingDuration60: "60分",
  bookingDuration90: "90分",
  bookingDuration120: "120分",
};
