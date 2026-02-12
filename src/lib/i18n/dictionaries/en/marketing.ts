export const marketing: Record<string, string> = {
  // ─── Stamps page ───

  // Page title & tabs
  stampsAndCoupons: "Stamps & Coupons",
  stampCardTab: "Stamp Cards",
  couponTab: "Coupons",

  // Stamp card toggle
  showStampCardOnPublicPage: "Show stamp cards on public page",
  showStampCardOnPublicPageDesc: "When enabled, the stamp card widget will appear on your profile page",
  enabled: "Enabled",
  disabled: "Disabled",

  // Stamp card list
  newStampCard: "New Stamp Card",
  noStampCardsYet: "No stamp cards yet",
  noStampCardsHint: "Create one with \"New Stamp Card\"",
  stampsForReward: "{{count}} stamps for reward",
  backToStampCardList: "Back to stamp card list",
  confirmDeleteStampCard: "Delete this stamp card?",

  // Stamp card detail
  qrCode: "QR Code",
  qrCodeDesc: "Customers can scan to view their stamp card",
  copied: "Copied",
  copyUrl: "Copy URL",
  download: "Download",
  milestones: "Milestones",
  stampsCount: "{{count}} stamps",
  rewardEarned: "Reward earned!",
  customerList: "Customer List",
  customersCount: "{{count}} customers",
  noCustomersWithStamps: "No customers with stamps yet",
  unknown: "Unknown",
  timesCompleted: "Completed {{count}} times",
  stampButton: "Stamp",
  addStampFailed: "Failed to add stamp",
  stampAdded: "Stamp added",
  cardCompleted: "Card completed! Reward: {{reward}}",
  cardCompletedDefault: "Congratulations!",
  milestoneReached: "Milestone reached! {{reward}}",

  // Create stamp card dialog
  newStampCardDialogTitle: "New Stamp Card",
  newStampCardDialogDesc: "Configure your stamp card settings",
  cardName: "Card Name",
  cardNamePlaceholder: "e.g. Coffee Card",
  requiredStamps: "Required Stamps",
  icon: "Icon",
  themeColor: "Theme Color",
  rewardType: "Reward Type",
  rewardTypeCoupon: "Link Coupon",
  rewardTypeFreeService: "Free Service",
  rewardTypeCustom: "Custom",
  linkedCoupon: "Linked Coupon",
  createCouponFirst: "Please create a coupon in the Coupons tab first",
  selectPlease: "Please select",
  rewardDescription: "Reward Description",
  rewardDescriptionPlaceholder: "e.g. One free drink",
  milestonesIntermediate: "Milestones (Intermediate Rewards)",
  add: "Add",
  milestonesHint: "Add milestones to set rewards at intermediate stages",
  milestonesStampCount: "Count",
  atStamps: "stamps →",
  milestoneRewardPlaceholder: "e.g. 10% off",
  cancel: "Cancel",
  creating: "Creating...",
  create: "Create",
  cardNameRequired: "Please enter a card name",
  minStampsRequired: "Stamps must be 2 or more",
  createFailed: "Failed to create",

  // Coupon section
  enableCouponFeature: "Enable coupon feature",
  enableCouponFeatureDesc: "When enabled, you can create and manage coupons",
  newCoupon: "New Coupon",
  noCouponsYet: "No coupons yet",
  noCouponsHint: "Create one with \"New Coupon\"",
  usageCount: "Used: {{used}}{{limit}} times",
  expiresAt: "Expires: {{date}}",
  deactivate: "Deactivate",
  activate: "Activate",
  confirmDeleteCoupon: "Delete this coupon?",

  // Coupon discount display
  percentOff: "{{value}}% OFF",
  fixedOff: "¥{{value}} OFF",
  freeService: "Free Service",

  // Create coupon dialog
  newCouponDialogTitle: "New Coupon",
  newCouponDialogDesc: "Configure your coupon settings",
  couponTitle: "Title",
  couponTitlePlaceholder: "e.g. First Visit 10% OFF",
  couponCode: "Coupon Code",
  autoGenerate: "Generate",
  couponDescription: "Description (optional)",
  couponDescriptionPlaceholder: "e.g. New customers only",
  discountType: "Discount Type",
  discountTypePercentage: "Percentage (%)",
  discountTypeFixed: "Fixed Amount (¥)",
  discountTypeFreeService: "Free Service",
  discountRate: "Discount Rate",
  discountAmount: "Discount Amount",
  percentUnit: "%",
  yenUnit: "yen",
  expiryOptional: "Expiry Date (optional)",
  usageLimitOptional: "Usage Limit (optional)",
  unlimited: "Unlimited",
  couponTitleRequired: "Please enter a title",
  couponCodeRequired: "Please enter a coupon code",

  // Limit banner label
  stampCardLabel: "Stamp Cards",
  couponLabel: "Coupons",

  // ─── Messages page ───

  messageDelivery: "Message Delivery",
  templatesTab: "Templates",
  sendTab: "Send",
  historyTab: "History",

  // Template types
  templateTypeFollowUp: "Follow Up",
  templateTypeReviewRequest: "Review Request",
  templateTypeCampaign: "Campaign",
  templateTypeReminder: "Reminder",
  templateTypeThankYou: "Thank You",

  // Trigger types
  triggerManual: "Manual",
  triggerAfterBooking: "After Booking",
  triggerAfterDays: "After Days",
  triggerAfterContact: "After Contact",

  // Status
  statusPending: "Pending",
  statusSent: "Sent",
  statusDelivered: "Delivered",
  statusOpened: "Opened",
  statusClicked: "Clicked",
  statusFailed: "Failed",

  // Templates tab
  autoFollowUp: "Auto Follow-up",
  autoFollowUpDesc: "Automatically send messages after bookings or inquiries",
  templateList: "Template List",
  newTemplate: "New Template",
  noTemplatesYet: "No templates yet",
  noTemplatesHint: "Create one with \"New Template\"",
  daysLater: "{{days}} days later",
  hoursLater: "{{hours}} hours later",
  subject: "Subject",

  // Template editor
  editTemplate: "Edit Template",
  newTemplateDialogTitle: "New Template",
  templateEditorDesc: "Configure your message template content",
  startFromTemplate: "Start from a template:",
  startFromBlank: "Start from scratch",
  templateName: "Template Name",
  templateNamePlaceholder: "e.g. Booking Thank You Email",
  type: "Type",
  trigger: "Trigger",
  delayHours: "Delay (hours)",
  sendAfterDays: "Send after approx. {{days}} days",
  sendAfterHours: "Send after {{hours}} hours",
  subjectLabel: "Subject",
  subjectPlaceholder: "Email subject line",
  placeholderChips: "Variables (click to insert into body)",
  bodyLabel: "Body",
  backToEdit: "Back to edit",
  preview: "Preview",
  bodyPlaceholder: "Enter message body...",
  enableTemplate: "Enable template",
  saving: "Saving...",
  update: "Update",
  save: "Save",

  // Review URL notice
  setGoogleReviewUrlFirst: "Please set your Google Review URL in Settings first",

  // Delete template dialog
  deleteTemplateTitle: "Delete Template",
  deleteTemplateConfirm: "Delete \"{{name}}\"? This action cannot be undone.",
  deleteButton: "Delete",

  // Send tab
  emailDelivery: "Email Delivery",
  templateSelection: "Template Selection",
  template: "Template",
  selectTemplate: "Please select a template",
  previewLabel: "Preview",
  recipients: "Recipients",
  allCustomers: "All Customers",
  filterByTag: "Filter by Tag",
  filterByTagLabel: "Filter by Tag",
  manualSelect: "Manual Select",
  tagPlaceholder: "Enter tag name...",
  noCustomers: "No customers",
  recipientCount: "{{count}}",
  sendButton: "Send",

  // Send confirm dialog
  sendConfirmTitle: "Confirm Send",
  sendConfirmDesc: "Send {{count}} messages?",
  sendConfirmTemplate: "Template: ",
  sendConfirmRecipients: "Recipients: ",
  sendConfirmRecipientsCount: "{{count}} people",
  sendConfirmChannel: "Channel: ",
  channelEmail: "Email",
  sending: "Sending...",
  sendAction: "Send",
  sendSuccess: "{{sent}} emails sent successfully",
  sendPartialSuccess: "{{sent}} sent, {{failed}} failed",
  sendFailed: "Failed to send",
  messageSendFailed: "Failed to send messages",

  // History tab
  totalSent: "Total Sent",
  opened: "Opened",
  clicked: "Clicked",
  failed: "Failed",
  statusFilterAll: "All",
  noHistory: "No sending history yet",
  templateLabel: "Template: {{name}}",
  channelEmailBadge: "Email",
  channelLineBadge: "LINE",

  // Toast errors for messages
  templateLoadError: "Failed to load templates",
  historyLoadError: "Failed to load sending history",
  templateSaveError: "Failed to save template",
  templateDeleteError: "Failed to delete template",
  templateUpdateError: "Failed to update template",

  // ─── Automations page ───

  automationsTitle: "Auto Follow-up",
  newRule: "New Rule",
  rulesTab: "Rules",
  logsTab: "Logs",

  // Automation trigger types
  autoTriggerAfterBooking: "After Booking",
  autoTriggerAfterContact: "After Contact",
  autoTriggerAfterSubscribe: "After Email Subscribe",
  autoTriggerAfterStampComplete: "After Stamp Card Complete",
  autoTriggerNoVisit30d: "No Visit for 30 Days",
  autoTriggerNoVisit60d: "No Visit for 60 Days",
  autoTriggerNoVisit90d: "No Visit for 90 Days",
  autoTriggerBirthday: "Birthday",

  // Automation action types
  autoActionSendEmail: "Send Email",
  autoActionSendReviewRequest: "Send Review Request",
  autoActionSendCoupon: "Send Coupon",

  // Automation status
  autoStatusScheduled: "Scheduled",
  autoStatusSent: "Sent",
  autoStatusFailed: "Failed",
  autoStatusSkipped: "Skipped",

  // Quick templates
  recommendedTemplates: "Recommended Templates",
  configured: "Configured",
  enableOneClick: "Enable with One Click",
  customize: "Customize",

  // Rule list
  noAutomationRules: "No automation rules yet",
  noAutomationRulesHint: "Start with a template above or create a new rule",
  hoursAfter: "{{hours}} hours later",
  autoTemplateLabel: "Template: {{name}}",
  autoCouponLabel: "Coupon: {{title}} ({{code}})",
  autoSentCount: "Sent: {{count}}",
  autoScheduledCount: "Scheduled: {{count}}",
  ruleDeactivated: "Rule deactivated",
  ruleActivated: "Rule activated",
  changeFailed: "Failed to save changes",

  // Logs
  noLogs: "No logs",
  ruleDeleted: "Rule deleted",
  all: "All",

  // Create/Edit rule dialog
  editRule: "Edit Rule",
  newRuleDialogTitle: "New Rule",
  editRuleDesc: "Edit automation rule",
  newRuleDesc: "Create a new auto follow-up rule",
  ruleName: "Rule Name *",
  ruleNamePlaceholder: "Booking Thank You Email",
  triggerLabel: "Trigger *",
  actionLabel: "Action *",
  delayLabel: "Delay",
  afterEvent: "After event",
  executeAfterHours: "hours later",
  messageTemplate: "Message Template (optional)",
  customInput: "Custom (enter below)",
  subjectAutoLabel: "Subject",
  subjectAutoPlaceholder: "Thank you for your booking",
  bodyAutoLabel: "Body",
  bodyAutoPlaceholder: "Dear {{customer_name}},\n\nMessage body...",
  placeholderHint: "You can use placeholders like {{customer_name}} and {{business_name}}",
  couponSelectLabel: "Coupon",
  ruleNameRequired: "Please enter a rule name",
  updateFailed: "Failed to update",
  networkError: "A network error occurred",
  ruleUpdated: "Rule updated",
  ruleCreated: "Rule created",
  ruleDeleteSuccess: "Rule deleted",
  ruleDeleteFailed: "Failed to delete rule",
  ruleCreateFailed: "Failed to create rule",
  enabledTemplate: "\"{{name}}\" has been enabled",
  updateAction: "Update",
  createAction: "Create",

  // ─── Referrals page ───

  referralsAndCampaigns: "Referrals & Campaigns",
  referralProgramTab: "Referral Program",
  campaignTab: "Campaigns",

  // Referral settings
  referralSettings: "Referral Settings",
  referralSettingsDesc: "Toggle the referral program on or off",
  enableReferralProgram: "Enable referral program",

  // Referral stats
  referralCodeCount: "Referral Codes",
  referralCount: "Referrals",
  codeUsageRate: "Code Usage Rate",

  // Referral codes list
  referralCodeList: "Referral Code List",
  issueReferralCode: "Issue Referral Code",
  noReferralCodes: "No referral codes yet",
  referralBadge: "{{count}} referrals",
  rewardLabel: "Reward: {{title}}",
  noReferralsYet: "No referrals yet",

  // Referral status
  refStatusSignedUp: "Signed Up",
  refStatusBooked: "Booked",
  refStatusRewarded: "Rewarded",

  // Create referral dialog
  issueReferralDialogTitle: "Issue Referral Code",
  issueReferralDialogDesc: "Issue a referral code to a customer. Counts when referred users sign up.",
  selectCustomer: "Select Customer *",
  referralRewardCoupon: "Reward Coupon (optional)",
  none: "None",
  codeAutoGenerated: "Code is auto-generated (e.g. REF-A3K7P2)",
  issuingCode: "Creating...",
  issueCode: "Issue Code",
  referralCodeCreateFailed: "Failed to create referral code",
  referralCodeDeleteFailed: "Failed to delete referral code",
  referralDataLoadFailed: "Failed to load referral data",

  // ProGate feature names
  referralProgramFeature: "Referral Program",
  campaignPageFeature: "Campaign Pages",

  // ─── Campaigns section ───

  campaignList: "Campaign List",
  newCampaign: "New Campaign",
  noCampaigns: "No campaign pages yet",
  published: "Published",
  draft: "Draft",
  expired: "Expired",
  previewLink: "Preview",
  expiresLabel: "Expires: {{date}}",
  couponLabelCampaign: "Coupon: {{title}}",
  unpublish: "Unpublish",
  publish: "Publish",
  campaignDeleteFailed: "Failed to delete campaign",
  publishToggleFailed: "Failed to change publish status",

  // Campaign dialog
  editCampaign: "Edit Campaign",
  newCampaignDialogTitle: "New Campaign",
  editCampaignDesc: "Edit campaign page content",
  newCampaignDesc: "Create a new campaign landing page",
  campaignTitleLabel: "Title *",
  campaignTitlePlaceholder: "Spring Special Campaign",
  slugLabel: "Slug (URL) *",
  slugUrlPrefix: "URL: /c/{{username}}/{{slug}}",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Enter campaign details...",
  heroImageUrl: "Hero Image URL",
  ctaButtonText: "CTA Button Text",
  ctaButtonPlaceholder: "Book Now",
  ctaLinkUrl: "CTA Link URL (blank for profile page)",
  campaignCouponOptional: "Coupon (optional)",
  expiryDate: "Expiry Date (optional)",
  campaignTemplate: "Template",
  publishToggle: "Publish",
  publishedStatus: "Published",
  draftStatus: "Draft",
  campaignTitleRequired: "Please enter a title",
  slugRequired: "Please enter a slug",

  // Campaign template options
  templateDefault: "Default",
  templateDefaultDesc: "White background, clean layout",
  templateMinimal: "Minimal",
  templateMinimalDesc: "Light gray, simple style",
  templateBold: "Bold",
  templateBoldDesc: "Gradient background, large CTA",
  templateFestive: "Festive",
  templateFestiveDesc: "Celebratory mood, warm colors",

  // ─── LINE page ───

  lineIntegration: "LINE Integration",
  connected: "Connected",
  notConnected: "Not Connected",
  setupGuide: "Setup Guide",
  lineFeature: "LINE Integration",

  // LINE settings
  settings: "Settings",
  lineSettingsDesc: "Configure LINE Messaging API settings",
  webhookUrl: "Webhook URL",
  webhookCopied: "Copied",
  webhookCopy: "Copy",
  webhookHint: "Set this URL in the Messaging API settings on LINE Developers",
  channelId: "Channel ID",
  channelSecret: "Channel Secret",
  channelSecretPlaceholder: "Enter channel secret",
  channelAccessToken: "Channel Access Token",
  channelAccessTokenPlaceholder: "Enter channel access token",
  friendAddLink: "Add Friend Link",
  saveFailed: "Failed to save",
  saveSuccess: "Settings saved",
  lineSaveSuccess: "LINE settings saved",
  savingSettings: "Saving...",
  saveSettingsButton: "Save Settings",

  // LINE contacts
  totalFriends: "Total Friends",
  activeFriends: "Active Friends",
  friendList: "Friend List",
  friendListDesc: "Friends of your LINE Official Account",
  noLineFriends: "No LINE friends yet.",
  noLineFriendsHint: "Set up the add friend link on your profile.",
  friend: "Friend",
  blocked: "Blocked",
  customerNotLinked: "Not Linked",
  customerLabel: "Customer: {{name}}",
  send: "Send",
  lineContactLoadFailed: "Failed to load LINE friends",

  // LINE send dialog
  lineSendTitle: "Send Message",
  messageLabel: "Message",
  messagePlaceholder: "Enter message...",
  lineSendSuccess: "Message sent",
  lineSendFailed: "Failed to send",
  lineMessageSendFailed: "Failed to send message",

  // ─── LINE Setup Guide ───

  lineSetupTitle: "LINE Messaging API Setup",
  close: "Close",
  stepOf: "Step {{current}} / {{total}}",
  step: "Step {{num}}",

  // Step titles
  stepTitle1: "Log in to LINE Developers",
  stepTitle2: "Create a Provider",
  stepTitle3: "Create a Messaging API Channel",
  stepTitle4: "Copy Channel ID and Secret",
  stepTitle5: "Issue Channel Access Token",
  stepTitle6: "Set Webhook URL",
  stepTitle7: "Setup Complete!",

  // Step 1
  step1Instruction1: "Visit",
  step1Instruction2: "Log in with your LINE account (create one if needed)",
  step1Instruction3: "After logging in, the console will appear",
  step1Tip: "You can log in with your regular LINE account. No separate business account is needed.",
  step1LearnMore1: "LINE Developers is the official LINE developer tool. You can create and manage Messaging API channels (official accounts) here.",
  step1LearnMore2: "You can use your personal LINE account to log in. Only the provider name and channel name will be visible to customers.",

  // Step 2
  step2Instruction1Create: "Create",
  step2Instruction1Provider: "Provider",
  step2Instruction2: "your business or service name",
  step2Instruction3Create: "Create",
  step2Tip: "The provider name is visible to customers. We recommend using your business's official name (e.g. \"ABC Salon\", \"XYZ Studio\").",
  step2LearnMore1: "A provider represents the organization or individual providing LINE services. You can create multiple channels (official accounts) under one provider.",
  step2LearnMore2: "If you already have a provider, you can use the existing one instead of creating a new one.",

  // Step 3
  step3Instruction1: "Messaging API",
  step3Instruction1Prefix: "Create New Channel",
  step3Instruction2: "your business name",
  step3Instruction3: "Enter channel description (e.g. \"ABC Salon Official Account\")",
  step3Instruction4: "Select category and subcategory",
  step3Instruction5Create: "Create",
  step3Tip: "The channel name becomes your LINE Official Account name. It will appear when customers search on LINE.",
  step3LearnMoreCategoryTitle: "Category examples:",
  step3LearnMoreCat1: "Beauty Salon → \"Beauty\" → \"Hair Salon\"",
  step3LearnMoreCat2: "Nail Salon → \"Beauty\" → \"Nail\"",
  step3LearnMoreCat3: "Massage → \"Health\" → \"Relaxation\"",
  step3LearnMoreCat4: "Freelancer → Select the relevant category, or \"Other\"",
  step3LearnMoreEmailNote: "Please use a valid email address. Important notifications from LINE will be sent there.",

  // Step 4
  step4Instruction1: "Basic Settings",
  step4Instruction2: "Channel ID",
  step4Instruction3: "Channel Secret",
  step4ChannelIdLabel: "Channel ID",
  step4ChannelSecretLabel: "Channel Secret",
  step4ChannelSecretPlaceholder: "Paste channel secret",
  step4Warning: "If the channel secret is not visible, click the \"Issue\" button.",
  step4LearnMore1: "The Channel ID is a numeric string. It is displayed at the top of the Basic Settings page.",
  step4LearnMore2: "The Channel Secret is an alphanumeric string. It is like a password, so do not share it with others.",

  // Step 5
  step5Instruction1: "Messaging API Settings",
  step5Instruction2: "Channel access token (long-lived)",
  step5Instruction3Issue: "Issue",
  step5Instruction4: "Copy the displayed token and paste it in the field below",
  step5TokenLabel: "Channel Access Token",
  step5TokenPlaceholder: "Paste channel access token",
  step5Tip: "The access token is a very long string. Make sure to copy it entirely.",
  step5LearnMore1: "The channel access token is the authentication credential for accessing LINE's API. Clicking \"Issue\" generates a new token.",
  step5LearnMore2: "If you previously issued a token, reissuing will invalidate the old one.",

  // Step 6
  step6Instruction1: "Messaging API Settings",
  step6Instruction2: "Webhook URL",
  step6Instruction3: "Use Webhook",
  step6Instruction4: "Verify",
  step6Warning: "In the response settings, turn \"Response Messages\" OFF and \"Webhook\" ON.",
  step6WarningImportant: "Important:",
  step6LearnMore1: "The Webhook URL is where message data is sent when a customer sends a message on LINE.",
  step6LearnMore2: "Turning off \"Response Messages\" disables LINE's automatic replies, allowing this system to control responses.",
  step6LearnMore3: "If \"Success\" appears after clicking \"Verify\", the Webhook URL is correctly configured. If an error occurs, verify the URL is correct.",

  // Step 7
  inputConfirmation: "Input Confirmation",
  channelIdStatus: "Channel ID",
  channelSecretStatus: "Channel Secret",
  accessTokenStatus: "Access Token",
  entered: "Entered",
  notEntered: "Not Entered",
  fillAllFields: "Please fill in all fields. You can go back to previous steps to enter them.",
  settingsSaved: "Settings saved!",
  lineAccountConnected: "Your LINE Official Account is now connected.",
  saveAndConnect: "Save & Connect",
  step7Tip: "Display your LINE Official Account QR code on your profile to encourage customers to add you as a friend.",

  // Navigation
  back: "Back",
  next: "Next",
  doneAndClose: "Done",
  learnMoreOpen: "Learn More",
  learnMoreClose: "Close",
  copiedButton: "Copied",
  copyButton: "Copy",
};
