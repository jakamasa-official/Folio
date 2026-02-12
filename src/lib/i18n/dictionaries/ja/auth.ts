export const auth: Record<string, string> = {
  // Login page
  loginTitle: "ログイン",
  loginDescription: "アカウントにログインしてください",
  emailLabel: "メールアドレス",
  emailPlaceholder: "you@example.com",
  passwordLabel: "パスワード",
  passwordPlaceholder: "••••••••",
  loginButton: "ログイン",
  loginLoading: "ログイン中...",
  forgotPasswordLink: "パスワードをお忘れですか？",
  noAccountPrompt: "アカウントをお持ちでないですか？",
  signupLink: "新規登録",

  // Signup page
  signupTitle: "新規登録",
  signupDescription: "無料でプロフィールページを作成しましょう",
  usernameLabel: "ユーザー名",
  usernamePrefix: "folio.jp/",
  usernamePlaceholder: "your-name",
  displayNameLabel: "表示名",
  displayNamePlaceholder: "山田 太郎",
  passwordMinLength: "6文字以上",
  signupButton: "無料で始める",
  signupLoading: "登録中...",
  hasAccountPrompt: "既にアカウントをお持ちですか？",
  loginLink: "ログイン",
  usernameValidationError: "ユーザー名は3〜30文字の英数字、ハイフン、アンダースコアのみ使用できます",
  usernameTakenError: "このユーザー名は既に使用されています",
  profileCreateError: "プロフィールの作成に失敗しました。もう一度お試しください。",

  // Email confirmation (signup success)
  confirmEmailTitle: "メールを確認してください",
  confirmEmailDescription: "{{email}} に確認メールを送信しました。メール内のリンクをクリックして、登録を完了してください。",
  confirmEmailSpamNote: "メールが届かない場合は、迷惑メールフォルダをご確認ください。",
  backToLogin: "ログインページに戻る",

  // Forgot password page
  forgotPasswordTitle: "パスワードをお忘れですか？",
  forgotPasswordDescription: "登録済みのメールアドレスを入力してください。パスワードリセットのリンクをお送りします。",
  resetButton: "リセットリンクを送信",
  resetLoading: "送信中...",
  backToLoginLink: "ログインに戻る",

  // Reset email sent
  resetSentTitle: "メールを送信しました",
  resetSentDescription: "{{email}} にパスワードリセットのリンクを送信しました。メール内のリンクをクリックして、パスワードを再設定してください。",
  resetSentSpamNote: "メールが届かない場合は、迷惑メールフォルダをご確認ください。",
};
