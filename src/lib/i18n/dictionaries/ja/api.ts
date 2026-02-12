export const api = {
  // --- Common errors (used across many routes) ---
  authRequired: "認証が必要です",
  profileNotFound: "プロフィールが見つかりません",
  requestFailed: "リクエストの処理に失敗しました",
  invalidRequest: "無効なリクエストです",
  nameTooLong: "名前が長すぎます",
  emailInvalid: "メールアドレスが無効です",
  phoneInvalid: "電話番号が無効です",
  validEmailRequired: "有効なメールアドレスを入力してください",
  rateLimitExceeded: "リクエスト回数の上限に達しました。しばらくしてからお試しください",

  // --- Analytics ---
  invalidRangeParam: "無効な範囲パラメータです",
  analyticsFetchFailed: "アナリティクスデータの取得に失敗しました",
  directAccess: "直接アクセス",

  // --- Analytics track ---
  profileIdRequired: "profile_id は必須です",
  tooManyRequests: "リクエストが多すぎます。しばらくしてからお試しください",
  pageViewRecordFailed: "ページビューの記録に失敗しました",

  // --- Automations ---
  logFetchFailed: "ログの取得に失敗しました",
  customerEmailMissing: "顧客のメールアドレスがありません",
  emailSendFailed: "メール送信に失敗しました",
  rulesFetchFailed: "ルールの取得に失敗しました",
  nameAndTriggerAndActionRequired: "名前、トリガー、アクションは必須です",
  invalidTriggerType: "無効なトリガータイプです",
  invalidActionType: "無効なアクションタイプです",
  ruleCreateFailed: "ルールの作成に失敗しました",
  ruleIdRequired: "ルールIDは必須です",
  ruleUpdateFailed: "ルールの更新に失敗しました",
  ruleDeleteFailed: "ルールの削除に失敗しました",

  // --- Automations trigger ---
  triggerFieldsRequired: "trigger_type, customer_id, profile_id は必須です",

  // --- Bookings ---
  allFieldsRequired: "必須項目をすべて入力してください",
  dateFormatInvalid: "日付の形式が無効です",
  timeFormatInvalid: "時間の形式が無効です",
  noteMaxLength: "備考は2000文字以内で入力してください",
  bookingRateLimitExceeded: "予約回数の上限に達しました。しばらくしてからお試しください",
  bookingCheckFailed: "予約状況の確認に失敗しました",
  slotAlreadyBooked: "この時間枠はすでに予約されています",
  bookingCreateFailed: "予約の作成に失敗しました",
  profileIdAndDateRequired: "profile_id と date は必須です",
  bookingFetchFailed: "予約情報の取得に失敗しました",

  // --- Campaigns ---
  campaignProRequired: "キャンペーンページはプロプランでご利用いただけます",
  titleRequired: "タイトルを入力してください（200文字以内）",
  slugRequired: "スラッグを入力してください（100文字以内）",
  slugAlphanumericOnly: "スラッグは英数字とハイフンのみ使用できます",
  descriptionMaxLength: "説明は5000文字以内で入力してください",
  imageUrlInvalid: "画像URLが無効です",
  ctaTextMaxLength: "CTAテキストは100文字以内で入力してください",
  ctaUrlInvalid: "CTAリンクが無効です",
  couponNotFound: "指定されたクーポンが見つかりません",
  slugAlreadyUsed: "このスラッグは既に使用されています",
  campaignCreateFailed: "キャンペーンの作成に失敗しました",
  campaignIdRequired: "キャンペーンIDが必要です",
  titleMaxLength: "タイトルは200文字以内で入力してください",
  slugMaxLength: "スラッグは100文字以内で入力してください",
  noFieldsToUpdate: "更新するフィールドがありません",
  campaignUpdateFailed: "キャンペーンの更新に失敗しました",
  campaignDeleteFailed: "キャンペーンの削除に失敗しました",
  campaignFetchFailed: "キャンペーンの取得に失敗しました",

  // --- Contact ---
  allItemsRequired: "すべての項目を入力してください",
  messageMaxLength: "メッセージは5000文字以内で入力してください",
  contactRateLimitExceeded: "送信回数の上限に達しました。しばらくしてからお試しください",
  contactSubmitFailed: "お問い合わせの送信に失敗しました",

  // --- Coupons redeem ---
  couponRedeemRateLimitExceeded: "リクエスト回数の上限に達しました。しばらくしてからお試しください",
  couponProfileIdRequired: "プロフィールIDは必須です",
  couponCodeInvalid: "クーポンコードが無効です",
  couponSearchFailed: "クーポンが見つかりません",
  couponInactive: "このクーポンは現在無効です",
  couponExpired: "このクーポンは期限切れです",
  couponRedeemFailed: "クーポンの利用処理に失敗しました",
  couponUsageLimitReached: "このクーポンは利用上限に達しました",

  // --- Coupons ---
  couponFreeLimitReached: "フリープランではクーポンは3枚までです。アップグレードしてください。",
  couponTitleCodeTypeRequired: "タイトル、コード、割引タイプは必須です",
  couponCodeDuplicate: "このクーポンコードは既に使用されています",
  couponCreateFailed: "クーポンの作成に失敗しました",
  couponFetchFailed: "クーポンの取得に失敗しました",
  couponIdRequired: "クーポンIDは必須です",
  couponUpdateFailed: "クーポンの更新に失敗しました",
  couponDeleteFailed: "クーポンの削除に失敗しました",

  // --- Customers lookup ---
  customerLookupRateLimitExceeded: "リクエスト回数の上限に達しました",
  customerProfileIdRequired: "profile_id は必須です",
  customerEmailRequired: "email は必須です",
  customerSearchFailed: "顧客の検索に失敗しました",

  // --- Customers ---
  customerFreeLimitReached: "フリープランでは顧客は50件までです。アップグレードしてください。",
  customerNameRequired: "名前を入力してください（200文字以内）",
  customerNotesMaxLength: "メモは2000文字以内で入力してください",
  customerTagsMaxCount: "タグは最大20個までです",
  customerCreateFailed: "顧客の作成に失敗しました",
  customerFetchFailed: "顧客データの取得に失敗しました",
  customerIdRequired: "顧客IDが必要です",
  customerTagsArrayRequired: "タグは配列で指定してください",
  customerUpdateFailed: "顧客の更新に失敗しました",
  customerDeleteFailed: "顧客の削除に失敗しました",

  // --- Customers sync ---
  syncFailed: "同期処理に失敗しました",

  // --- LINE contacts ---
  lineContactsFetchFailed: "LINE連絡先の取得に失敗しました",

  // --- LINE send ---
  lineUserIdRequired: "LINE User IDが必要です",
  lineMessageRequired: "メッセージを入力してください（5000文字以内）",
  lineTokenNotSet: "LINEチャネルアクセストークンが設定されていません",
  lineContactNotFound: "この連絡先が見つかりません",
  lineSendFailed: "LINEメッセージの送信に失敗しました",

  // --- LINE settings ---
  lineProRequired: "LINE連携はプロプランでご利用いただけます",
  lineChannelIdInvalid: "チャネルIDが無効です",
  lineChannelSecretInvalid: "チャネルシークレットが無効です",
  lineChannelTokenInvalid: "チャネルアクセストークンが無効です",
  lineSettingsSaveFailed: "設定の保存に失敗しました",

  // --- Messages history ---
  messageHistoryFetchFailed: "送信履歴の取得に失敗しました",

  // --- Messages send ---
  messageProRequired: "メール配信はプロプランでご利用いただけます",
  messageRecipientsRequired: "送信先の顧客を選択してください",
  messageRecipientsMax: "一度に送信できるのは500件までです",
  messageChannelInvalid: "チャンネルが無効です",
  templateNotFound: "テンプレートが見つかりません",
  messageSubjectAndBodyRequired: "件名と本文が必要です",
  noValidCustomers: "有効な顧客が見つかりません",

  // --- Messages templates ---
  templateNameRequired: "テンプレート名を入力してください（200文字以内）",
  templateSubjectRequired: "件名を入力してください（500文字以内）",
  templateBodyRequired: "本文を入力してください（10000文字以内）",
  templateTypeInvalid: "テンプレートタイプが無効です",
  triggerTypeInvalid: "トリガータイプが無効です",
  templateCreateFailed: "テンプレートの作成に失敗しました",
  templateFetchFailed: "テンプレートの取得に失敗しました",
  templateIdRequired: "テンプレートIDが必要です",
  templateNameMaxLength: "テンプレート名は200文字以内で入力してください",
  templateSubjectMaxLength: "件名は500文字以内で入力してください",
  templateBodyMaxLength: "本文は10000文字以内で入力してください",
  templateUpdateFailed: "テンプレートの更新に失敗しました",
  templateDeleteFailed: "テンプレートの削除に失敗しました",

  // --- Profile hash-password ---
  passwordRequired: "パスワードは必須です",
  passwordLengthInvalid: "パスワードは4〜200文字で設定してください",

  // --- Profile status ---
  // (uses authRequired, profileNotFound, requestFailed)

  // --- Profile verify-password ---
  profileIdAndPasswordRequired: "profile_id とパスワードは必須です",
  verifyRateLimitExceeded: "試行回数の上限に達しました。しばらくしてからお試しください",
  noPasswordSet: "このページにはパスワードが設定されていません",
  passwordIncorrect: "パスワードが正しくありません",

  // --- Referrals ---
  referralProRequired: "紹介プログラムはプロプランでご利用いただけます",
  referralCodeNotFound: "紹介コードが見つかりません",
  referralFetchFailed: "紹介データの取得に失敗しました",
  referralCodesFetchFailed: "紹介コードの取得に失敗しました",
  customerNotFoundForProfile: "指定された顧客が見つかりません",
  referralCodeGenerateFailed: "コード生成に失敗しました。再度お試しください",
  referralCodeCreateFailed: "紹介コードの作成に失敗しました",
  referralSettingsUpdateFailed: "設定の更新に失敗しました",
  referralCodeIdRequired: "紹介コードIDが必要です",
  referralCodeDeleteFailed: "紹介コードの削除に失敗しました",

  // --- Referrals track ---
  invalidCode: "無効なコードです",
  emailFormatInvalid: "メールアドレスの形式が無効です",
  referralTrackRateLimitExceeded: "リクエスト回数の上限に達しました。しばらくしてからお試しください",
  emailAlreadyReferred: "このメールアドレスは既に紹介済みです",
  referralRegistrationFailed: "登録に失敗しました",
  referralRecordFailed: "紹介の記録に失敗しました",

  // --- Reviews public ---
  reviewProfileIdRequired: "プロフィールIDが必要です",
  reviewsFetchFailed: "レビューの取得に失敗しました",

  // --- Reviews request ---
  reviewProRequired: "レビュー収集はプロプランでご利用いただけます",
  reviewCustomerNotFound: "顧客が見つかりません",
  reviewCustomerNoEmail: "この顧客にはメールアドレスが設定されていません",
  reviewRequestCreateFailed: "レビューリクエストの作成に失敗しました",
  reviewEmailSendFailed: "メールの送信に失敗しました。しばらくしてからお試しください。",

  // --- Reviews ---
  reviewerNameRequired: "お名前を入力してください（100文字以内）",
  reviewRatingInvalid: "評価は1〜5の整数で指定してください",
  reviewBodyRequired: "レビュー本文を入力してください（2000文字以内）",
  reviewTitleMaxLength: "タイトルは200文字以内で入力してください",
  reviewDailyLimitReached: "1日のレビュー投稿上限に達しました。明日また投稿してください。",
  reviewCreateFailed: "レビューの投稿に失敗しました",
  reviewIdRequired: "レビューIDが必要です",
  reviewStatusInvalid: "無効なステータスです",
  reviewResponseStringRequired: "返信は文字列で指定してください",
  reviewUpdateFailed: "レビューの更新に失敗しました",
  reviewDeleteFailed: "レビューの削除に失敗しました",

  // --- Review settings ---
  reviewSettingsUpdateFailed: "設定の更新に失敗しました",

  // --- Segments init ---
  segmentCheckFailed: "セグメントの確認に失敗しました",
  segmentsAlreadyInitialized: "システムセグメントは既に初期化されています",
  segmentInitFailed: "システムセグメントの作成に失敗しました",
  segmentsInitialized: "システムセグメントを初期化しました",

  // --- Segments refresh ---
  segmentFetchFailed: "セグメントの取得に失敗しました",

  // --- Segments ---
  segmentProRequired: "顧客セグメントはプロプランでご利用いただけます",
  segmentNameRequired: "セグメント名を入力してください（100文字以内）",
  segmentCriteriaRequired: "有効なセグメント条件を指定してください",
  segmentRulesRequired: "少なくとも1つのルールを追加してください",
  segmentCreateFailed: "セグメントの作成に失敗しました",
  segmentIdRequired: "セグメントIDが必要です",
  segmentNotFound: "セグメントが見つかりません",
  segmentUpdateFailed: "セグメントの更新に失敗しました",
  systemSegmentCannotDelete: "システムセグメントは削除できません",
  segmentDeleteFailed: "セグメントの削除に失敗しました",

  // --- Stamp cards ---
  stampCardFetchFailed: "スタンプカードの取得に失敗しました",
  stampCardFreeLimitReached: "フリープランではスタンプカードは1枚までです。アップグレードしてください。",
  stampCardNameAndCountRequired: "カード名とスタンプ数は必須です",
  stampCardCreateFailed: "スタンプカードの作成に失敗しました",
  stampCardIdRequired: "カードIDは必須です",
  stampCardUpdateFailed: "スタンプカードの更新に失敗しました",
  stampCardDeleteFailed: "スタンプカードの削除に失敗しました",

  // --- Stamp cards stamp ---
  stampCardAndCustomerIdRequired: "スタンプカードIDと顧客IDは必須です",
  stampCardNotFound: "スタンプカードが見つかりません",
  stampUpdateFailed: "スタンプの更新に失敗しました",
  stampAddFailed: "スタンプの追加に失敗しました",
  stampCardIdRequiredGet: "スタンプカードIDは必須です",
  stampFetchFailed: "スタンプ情報の取得に失敗しました",

  // --- Stripe checkout ---
  stripeNotConfigured: "Stripe の設定が必要です",
  invalidPlan: "無効なプランです",
  invalidPeriod: "無効な期間です",
  priceNotConfigured: "このプランの価格が設定されていません",
  checkoutCreateFailed: "チェックアウトセッションの作成に失敗しました",

  // --- Stripe portal ---
  stripeCustomerNotFound: "Stripe のカスタマー情報が見つかりません",
  portalCreateFailed: "カスタマーポータルの作成に失敗しました",

  // --- Subscribers export ---
  authTokenInvalid: "認証トークンが無効です",
  subscriberFetchFailed: "購読者データの取得に失敗しました",

  // --- Subscribers ---
  subscriberFieldsRequired: "必須項目を入力してください",
  subscriberRateLimitExceeded: "登録回数の上限に達しました。しばらくしてからお試しください",
  subscriberRegistrationFailed: "登録に失敗しました",

  // --- Widget social-proof ---
  widgetProfileIdRequired: "profile_id は必須です",

  // --- Wallpaper ---
  wallpaperQrScanText: "QRコードをスキャン",
} as const;
