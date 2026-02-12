export const auth: Record<string, string> = {
  // Login page
  loginTitle: "Log In",
  loginDescription: "Sign in to your account",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  passwordLabel: "Password",
  passwordPlaceholder: "••••••••",
  loginButton: "Log In",
  loginLoading: "Logging in...",
  forgotPasswordLink: "Forgot your password?",
  noAccountPrompt: "Don't have an account?",
  signupLink: "Sign Up",

  // Signup page
  signupTitle: "Sign Up",
  signupDescription: "Create your free profile page",
  usernameLabel: "Username",
  usernamePrefix: "folio.jp/",
  usernamePlaceholder: "your-name",
  displayNameLabel: "Display Name",
  displayNamePlaceholder: "Taro Yamada",
  passwordMinLength: "6 characters or more",
  signupButton: "Get Started Free",
  signupLoading: "Signing up...",
  hasAccountPrompt: "Already have an account?",
  loginLink: "Log In",
  usernameValidationError: "Username must be 3-30 characters using only letters, numbers, hyphens, and underscores",
  usernameTakenError: "This username is already taken",
  profileCreateError: "Failed to create profile. Please try again.",

  // Email confirmation (signup success)
  confirmEmailTitle: "Check Your Email",
  confirmEmailDescription: "We sent a confirmation email to {{email}}. Click the link in the email to complete your registration.",
  confirmEmailSpamNote: "If you don't see the email, please check your spam folder.",
  backToLogin: "Back to Login",

  // Forgot password page
  forgotPasswordTitle: "Forgot your password?",
  forgotPasswordDescription: "Enter the email address you registered with. We'll send you a link to reset your password.",
  resetButton: "Send Reset Link",
  resetLoading: "Sending...",
  backToLoginLink: "Back to Login",

  // Reset email sent
  resetSentTitle: "Email Sent",
  resetSentDescription: "We sent a password reset link to {{email}}. Click the link in the email to set a new password.",
  resetSentSpamNote: "If you don't see the email, please check your spam folder.",
};
