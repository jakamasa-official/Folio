export const api = {
  // --- Common errors (used across many routes) ---
  authRequired: "Authentication required",
  profileNotFound: "Profile not found",
  requestFailed: "Failed to process request",
  invalidRequest: "Invalid request",
  nameTooLong: "Name is too long",
  emailInvalid: "Invalid email address",
  phoneInvalid: "Invalid phone number",
  validEmailRequired: "Please enter a valid email address",
  rateLimitExceeded: "Rate limit exceeded. Please try again later",

  // --- Analytics ---
  invalidRangeParam: "Invalid range parameter",
  analyticsFetchFailed: "Failed to fetch analytics data",
  directAccess: "Direct",

  // --- Analytics track ---
  profileIdRequired: "profile_id is required",
  tooManyRequests: "Too many requests. Please try again later",
  pageViewRecordFailed: "Failed to record page view",

  // --- Automations ---
  logFetchFailed: "Failed to fetch logs",
  customerEmailMissing: "Customer email address is missing",
  emailSendFailed: "Failed to send email",
  rulesFetchFailed: "Failed to fetch rules",
  nameAndTriggerAndActionRequired: "Name, trigger, and action are required",
  invalidTriggerType: "Invalid trigger type",
  invalidActionType: "Invalid action type",
  ruleCreateFailed: "Failed to create rule",
  ruleIdRequired: "Rule ID is required",
  ruleUpdateFailed: "Failed to update rule",
  ruleDeleteFailed: "Failed to delete rule",

  // --- Automations trigger ---
  triggerFieldsRequired: "trigger_type, customer_id, and profile_id are required",

  // --- Bookings ---
  allFieldsRequired: "Please fill in all required fields",
  dateFormatInvalid: "Invalid date format",
  timeFormatInvalid: "Invalid time format",
  noteMaxLength: "Notes must be 2000 characters or less",
  bookingRateLimitExceeded: "Booking limit reached. Please try again later",
  bookingCheckFailed: "Failed to check booking availability",
  slotAlreadyBooked: "This time slot is already booked",
  bookingCreateFailed: "Failed to create booking",
  profileIdAndDateRequired: "profile_id and date are required",
  bookingFetchFailed: "Failed to fetch booking information",

  // --- Campaigns ---
  campaignProRequired: "Campaign pages are available on the Pro plan",
  titleRequired: "Please enter a title (200 characters or less)",
  slugRequired: "Please enter a slug (100 characters or less)",
  slugAlphanumericOnly: "Slug can only contain letters, numbers, and hyphens",
  descriptionMaxLength: "Description must be 5000 characters or less",
  imageUrlInvalid: "Invalid image URL",
  ctaTextMaxLength: "CTA text must be 100 characters or less",
  ctaUrlInvalid: "Invalid CTA link",
  couponNotFound: "Specified coupon not found",
  slugAlreadyUsed: "This slug is already in use",
  campaignCreateFailed: "Failed to create campaign",
  campaignIdRequired: "Campaign ID is required",
  titleMaxLength: "Title must be 200 characters or less",
  slugMaxLength: "Slug must be 100 characters or less",
  noFieldsToUpdate: "No fields to update",
  campaignUpdateFailed: "Failed to update campaign",
  campaignDeleteFailed: "Failed to delete campaign",
  campaignFetchFailed: "Failed to fetch campaigns",

  // --- Contact ---
  allItemsRequired: "Please fill in all fields",
  messageMaxLength: "Message must be 5000 characters or less",
  contactRateLimitExceeded: "Submission limit reached. Please try again later",
  contactSubmitFailed: "Failed to submit inquiry",

  // --- Coupons redeem ---
  couponRedeemRateLimitExceeded: "Request limit reached. Please try again later",
  couponProfileIdRequired: "Profile ID is required",
  couponCodeInvalid: "Invalid coupon code",
  couponSearchFailed: "Coupon not found",
  couponInactive: "This coupon is currently inactive",
  couponExpired: "This coupon has expired",
  couponRedeemFailed: "Failed to process coupon redemption",
  couponUsageLimitReached: "This coupon has reached its usage limit",

  // --- Coupons ---
  couponFreeLimitReached: "Free plan allows up to 3 coupons. Please upgrade.",
  couponTitleCodeTypeRequired: "Title, code, and discount type are required",
  couponCodeDuplicate: "This coupon code is already in use",
  couponCreateFailed: "Failed to create coupon",
  couponFetchFailed: "Failed to fetch coupons",
  couponIdRequired: "Coupon ID is required",
  couponUpdateFailed: "Failed to update coupon",
  couponDeleteFailed: "Failed to delete coupon",

  // --- Customers lookup ---
  customerLookupRateLimitExceeded: "Request limit reached",
  customerProfileIdRequired: "profile_id is required",
  customerEmailRequired: "email is required",
  customerSearchFailed: "Failed to search for customer",

  // --- Customers ---
  customerFreeLimitReached: "Free plan allows up to 50 customers. Please upgrade.",
  customerNameRequired: "Please enter a name (200 characters or less)",
  customerNotesMaxLength: "Notes must be 2000 characters or less",
  customerTagsMaxCount: "Maximum of 20 tags allowed",
  customerCreateFailed: "Failed to create customer",
  customerFetchFailed: "Failed to fetch customer data",
  customerIdRequired: "Customer ID is required",
  customerTagsArrayRequired: "Tags must be an array",
  customerUpdateFailed: "Failed to update customer",
  customerDeleteFailed: "Failed to delete customer",

  // --- Customers sync ---
  syncFailed: "Sync failed",

  // --- LINE contacts ---
  lineContactsFetchFailed: "Failed to fetch LINE contacts",

  // --- LINE send ---
  lineUserIdRequired: "LINE User ID is required",
  lineMessageRequired: "Please enter a message (5000 characters or less)",
  lineTokenNotSet: "LINE channel access token is not configured",
  lineContactNotFound: "This contact was not found",
  lineSendFailed: "Failed to send LINE message",

  // --- LINE settings ---
  lineProRequired: "LINE integration is available on the Pro plan",
  lineChannelIdInvalid: "Invalid channel ID",
  lineChannelSecretInvalid: "Invalid channel secret",
  lineChannelTokenInvalid: "Invalid channel access token",
  lineSettingsSaveFailed: "Failed to save settings",

  // --- Messages history ---
  messageHistoryFetchFailed: "Failed to fetch message history",

  // --- Messages send ---
  messageProRequired: "Email campaigns are available on the Pro plan",
  messageRecipientsRequired: "Please select recipients",
  messageRecipientsMax: "Maximum of 500 recipients per send",
  messageChannelInvalid: "Invalid channel",
  templateNotFound: "Template not found",
  messageSubjectAndBodyRequired: "Subject and body are required",
  noValidCustomers: "No valid customers found",

  // --- Messages templates ---
  templateNameRequired: "Please enter a template name (200 characters or less)",
  templateSubjectRequired: "Please enter a subject (500 characters or less)",
  templateBodyRequired: "Please enter a body (10000 characters or less)",
  templateTypeInvalid: "Invalid template type",
  triggerTypeInvalid: "Invalid trigger type",
  templateCreateFailed: "Failed to create template",
  templateFetchFailed: "Failed to fetch templates",
  templateIdRequired: "Template ID is required",
  templateNameMaxLength: "Template name must be 200 characters or less",
  templateSubjectMaxLength: "Subject must be 500 characters or less",
  templateBodyMaxLength: "Body must be 10000 characters or less",
  templateUpdateFailed: "Failed to update template",
  templateDeleteFailed: "Failed to delete template",

  // --- Profile hash-password ---
  passwordRequired: "Password is required",
  passwordLengthInvalid: "Password must be between 4 and 200 characters",

  // --- Profile status ---
  // (uses authRequired, profileNotFound, requestFailed)

  // --- Profile verify-password ---
  profileIdAndPasswordRequired: "profile_id and password are required",
  verifyRateLimitExceeded: "Too many attempts. Please try again later",
  noPasswordSet: "No password is set for this page",
  passwordIncorrect: "Incorrect password",

  // --- Referrals ---
  referralProRequired: "Referral program is available on the Pro plan",
  referralCodeNotFound: "Referral code not found",
  referralFetchFailed: "Failed to fetch referral data",
  referralCodesFetchFailed: "Failed to fetch referral codes",
  customerNotFoundForProfile: "Specified customer not found",
  referralCodeGenerateFailed: "Failed to generate code. Please try again",
  referralCodeCreateFailed: "Failed to create referral code",
  referralSettingsUpdateFailed: "Failed to update settings",
  referralCodeIdRequired: "Referral code ID is required",
  referralCodeDeleteFailed: "Failed to delete referral code",

  // --- Referrals track ---
  invalidCode: "Invalid code",
  emailFormatInvalid: "Invalid email format",
  referralTrackRateLimitExceeded: "Request limit reached. Please try again later",
  emailAlreadyReferred: "This email has already been referred",
  referralRegistrationFailed: "Registration failed",
  referralRecordFailed: "Failed to record referral",

  // --- Reviews public ---
  reviewProfileIdRequired: "Profile ID is required",
  reviewsFetchFailed: "Failed to fetch reviews",

  // --- Reviews request ---
  reviewProRequired: "Review collection is available on the Pro plan",
  reviewCustomerNotFound: "Customer not found",
  reviewCustomerNoEmail: "This customer does not have an email address",
  reviewRequestCreateFailed: "Failed to create review request",
  reviewEmailSendFailed: "Failed to send email. Please try again later.",

  // --- Reviews ---
  reviewerNameRequired: "Please enter your name (100 characters or less)",
  reviewRatingInvalid: "Rating must be an integer from 1 to 5",
  reviewBodyRequired: "Please enter a review (2000 characters or less)",
  reviewTitleMaxLength: "Title must be 200 characters or less",
  reviewDailyLimitReached: "Daily review limit reached. Please try again tomorrow.",
  reviewCreateFailed: "Failed to submit review",
  reviewIdRequired: "Review ID is required",
  reviewStatusInvalid: "Invalid status",
  reviewResponseStringRequired: "Response must be a string",
  reviewUpdateFailed: "Failed to update review",
  reviewDeleteFailed: "Failed to delete review",

  // --- Review settings ---
  reviewSettingsUpdateFailed: "Failed to update settings",

  // --- Segments init ---
  segmentCheckFailed: "Failed to check segments",
  segmentsAlreadyInitialized: "System segments are already initialized",
  segmentInitFailed: "Failed to create system segments",
  segmentsInitialized: "System segments initialized",

  // --- Segments refresh ---
  segmentFetchFailed: "Failed to fetch segments",

  // --- Segments ---
  segmentProRequired: "Customer segments are available on the Pro plan",
  segmentNameRequired: "Please enter a segment name (100 characters or less)",
  segmentCriteriaRequired: "Please specify valid segment criteria",
  segmentRulesRequired: "At least one rule is required",
  segmentCreateFailed: "Failed to create segment",
  segmentIdRequired: "Segment ID is required",
  segmentNotFound: "Segment not found",
  segmentUpdateFailed: "Failed to update segment",
  systemSegmentCannotDelete: "System segments cannot be deleted",
  segmentDeleteFailed: "Failed to delete segment",

  // --- Stamp cards ---
  stampCardFetchFailed: "Failed to fetch stamp cards",
  stampCardFreeLimitReached: "Free plan allows up to 1 stamp card. Please upgrade.",
  stampCardNameAndCountRequired: "Card name and stamp count are required",
  stampCardCreateFailed: "Failed to create stamp card",
  stampCardIdRequired: "Card ID is required",
  stampCardUpdateFailed: "Failed to update stamp card",
  stampCardDeleteFailed: "Failed to delete stamp card",

  // --- Stamp cards stamp ---
  stampCardAndCustomerIdRequired: "Stamp card ID and customer ID are required",
  stampCardNotFound: "Stamp card not found",
  stampUpdateFailed: "Failed to update stamp",
  stampAddFailed: "Failed to add stamp",
  stampCardIdRequiredGet: "Stamp card ID is required",
  stampFetchFailed: "Failed to fetch stamp information",

  // --- Stripe checkout ---
  stripeNotConfigured: "Stripe configuration is required",
  invalidPlan: "Invalid plan",
  invalidPeriod: "Invalid period",
  priceNotConfigured: "Price not configured for this plan",
  checkoutCreateFailed: "Failed to create checkout session",

  // --- Stripe portal ---
  stripeCustomerNotFound: "Stripe customer information not found",
  portalCreateFailed: "Failed to create customer portal",

  // --- Subscribers export ---
  authTokenInvalid: "Invalid authentication token",
  subscriberFetchFailed: "Failed to fetch subscriber data",

  // --- Subscribers ---
  subscriberFieldsRequired: "Please fill in required fields",
  subscriberRateLimitExceeded: "Subscription limit reached. Please try again later",
  subscriberRegistrationFailed: "Registration failed",

  // --- Widget social-proof ---
  widgetProfileIdRequired: "profile_id is required",

  // --- Wallpaper ---
  wallpaperQrScanText: "Scan QR Code",
} as const;
