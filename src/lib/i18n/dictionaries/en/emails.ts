export const emails = {
  // --- Layout / footer ---
  footerCopyright: "&copy; {{businessName}}",
  footerSentBy: "This email was sent by {{businessName}}.",
  footerUnsubscribe: "To unsubscribe, please click <a href=\"{{unsubscribe_url}}\" style=\"color:#6b7280;text-decoration:underline;\">here</a>.",

  // --- Booking confirmation (to booker) ---
  bookingGreeting: "Dear {{bookerName}},",
  bookingThankYou: "Thank you for booking with {{businessName}}.",
  bookingConfirmed: "Your reservation has been confirmed with the following details.",
  bookingDateLabel: "Date",
  bookingTimeLabel: "Time",
  bookingServiceLabel: "Service",
  bookingNotesLabel: "Notes",
  bookingLookForward: "We look forward to seeing you.",
  bookingContactNote: "If you have any questions, please don't hesitate to contact us.",

  // --- Booking notification (to owner) ---
  bookingNewTitle: "New booking received",
  bookingCustomerNameLabel: "Customer",
  bookingEmailLabel: "Email",
  bookingCheckDashboard: "Please check the booking in your dashboard.",

  // --- Review request ---
  reviewGreeting: "Dear {{customerName}},",
  reviewThankYou: "Thank you for visiting {{businessName}}.",
  reviewAskBody: "How was your experience? We would love to hear your feedback. If you have a moment, please leave us a review.",
  reviewCtaButton: "Write a Review",
  reviewClosing: "Thank you for your time. We appreciate your support.",

  // --- Welcome email ---
  welcomeGreeting: "Dear {{customerName}},",
  welcomeThankYou: "Thank you for registering with {{businessName}}.",
  welcomeBody: "We'll keep you updated with special offers and announcements.",
  welcomeRegards: "Thank you for your support.",
  welcomeSignoff: "The {{businessName}} Team",

  // --- Follow-up email ---
  followUpGreeting: "Dear {{customerName}},",

  // --- Contact notification (to owner) ---
  contactNewTitle: "New inquiry received",
  contactNameLabel: "Name",
  contactEmailLabel: "Email",
  contactMessageLabel: "Message",
  contactReplyNote: "Please reply from the inbox in your dashboard.",
} as const;
