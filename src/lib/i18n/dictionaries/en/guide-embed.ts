export const guideEmbed = {
  // --- Metadata ---
  metaTitle: "How to Add Folio to Your Website",
  metaDescription:
    "Step-by-step guide to embedding the Folio widget on any website. Works with WordPress, Wix, Squarespace, Shopify, and custom HTML.",

  // --- Nav ---
  dashboard: "Dashboard",
  login: "Log In",
  startFree: "Get Started Free",

  // --- Hero ---
  heroTitle: "Add Folio to Your Website",
  heroDescription:
    "Embed a small script on your existing website to get contact forms, review collection, email subscribe, analytics, and a social proof badge — all powered by your Folio profile.",

  // --- What You Get ---
  whatYouGetTitle: "What You Get",
  widgetTrackingTitle: "Page View Tracking",
  widgetTrackingDesc:
    "Automatically counts how many people visit your website. Invisible to visitors — no extra setup needed.",
  widgetContactTitle: "Contact Form",
  widgetContactDesc:
    "A floating button that opens a contact form. Visitors can reach you without leaving the page.",
  widgetReviewTitle: "Review Collection",
  widgetReviewDesc:
    "A floating button that lets visitors leave reviews and star ratings for your business.",
  widgetSubscribeTitle: "Email Subscribe",
  widgetSubscribeDesc:
    "An inline form visitors can use to subscribe to your email list.",
  widgetBadgeTitle: "Social Proof Badge",
  widgetBadgeDesc:
    "A small badge in the corner of your site that shows your reviews and links to your Folio profile.",

  // --- Steps Overview ---
  stepsTitle: "How to Set It Up",
  stepsSubtitle:
    "Follow these five steps. The whole process takes about 10 minutes.",

  // --- Step 1 ---
  step1Title: "Step 1: Create Your Folio Account",
  step1Desc:
    "If you do not have a Folio account yet, sign up for free. It only takes 30 seconds.",
  step1Link: "Sign up here",
  step1Detail: "After signing up, fill in your profile name and basic info.",

  // --- Step 2 ---
  step2Title: "Step 2: Upgrade to Pro",
  step2Desc:
    "The embeddable widget feature is available on the Pro plan. You can see pricing and upgrade from the link below.",
  step2Link: "View pricing plans",

  // --- Step 3 ---
  step3Title: "Step 3: Configure Your Widgets",
  step3Desc:
    "Go to your Dashboard and open the Embed page. From there you can:",
  step3Item1: "Toggle which widgets you want (contact form, reviews, etc.)",
  step3Item2: "Choose the widget language (Japanese or English)",
  step3Item3: "Your custom script code is generated automatically",
  step3Link: "Open Embed Settings",

  // --- Step 4 ---
  step4Title: 'Step 4: Copy the Code',
  step4Desc:
    'On the Embed page, click the "Copy Code" button. You will get a small piece of HTML code that looks like this:',
  step4Note:
    "Your code will have your own profile ID filled in automatically. The example above uses a placeholder.",

  // --- Step 5 ---
  step5Title: "Step 5: Add the Code to Your Website",
  step5Desc:
    "Paste the code into your website. The instructions are different depending on which platform you use. Find your platform below.",

  // --- Platform: HTML ---
  platformHtmlTitle: "Custom HTML Website",
  platformHtmlDesc:
    "If you built your own website with HTML files, follow these steps:",
  platformHtmlStep1: "Open your HTML file in a text editor (e.g. Notepad, VS Code).",
  platformHtmlStep2: "Scroll to the bottom and find the closing </body> tag.",
  platformHtmlStep3: "Paste the Folio script right before that tag.",
  platformHtmlStep4: "Save the file and refresh your browser.",
  platformHtmlBefore: "Before:",
  platformHtmlAfter: "After:",

  // --- Platform: WordPress ---
  platformWpTitle: "WordPress",
  platformWpDesc: "There are a few ways to add the code in WordPress:",
  platformWpOption1Title: "Option A: Using a Plugin (Easiest)",
  platformWpOption1Step1:
    'Install the free plugin "Insert Headers and Footers" (by WPCode).',
  platformWpOption1Step2: 'Go to Code Snippets and click "Add Snippet".',
  platformWpOption1Step3: 'Paste the Folio script and set the location to "Site Wide Footer".',
  platformWpOption1Step4: "Save and activate the snippet.",
  platformWpOption2Title: "Option B: Theme Editor",
  platformWpOption2Step1:
    "Go to Appearance > Theme File Editor.",
  platformWpOption2Step2: 'Open the "footer.php" file from the right sidebar.',
  platformWpOption2Step3: "Paste the Folio script right before the </body> tag.",
  platformWpOption2Step4: 'Click "Update File".',

  // --- Platform: Wix ---
  platformWixTitle: "Wix",
  platformWixStep1: "In your Wix dashboard, go to Settings.",
  platformWixStep2: 'Click "Custom Code" under Advanced.',
  platformWixStep3: 'Click "Add Code" in the Body - end section.',
  platformWixStep4: "Paste the Folio script and save.",

  // --- Platform: Squarespace ---
  platformSquarespaceTitle: "Squarespace",
  platformSquarespaceStep1: "Go to Settings > Advanced > Code Injection.",
  platformSquarespaceStep2: 'Paste the Folio script in the "Footer" field.',
  platformSquarespaceStep3: "Click Save.",

  // --- Platform: Shopify ---
  platformShopifyTitle: "Shopify",
  platformShopifyStep1:
    "Go to Online Store > Themes.",
  platformShopifyStep2:
    'Click "Edit code" on your current theme.',
  platformShopifyStep3: 'Open the "theme.liquid" file.',
  platformShopifyStep4: "Paste the Folio script right before the </body> tag.",
  platformShopifyStep5: "Click Save.",

  // --- Platform: Next.js / React ---
  platformReactTitle: "Next.js / React",
  platformReactDesc:
    "Add the script to your root layout so it loads on every page.",
  platformReactStep1:
    "Open your root layout file (e.g. app/layout.tsx or pages/_document.tsx).",
  platformReactStep2: "Add a <Script> tag (or a plain <script>) before the closing </body>.",
  platformReactNote:
    "If you are using Next.js App Router, use the next/script component with strategy=\"afterInteractive\".",

  // --- Click Tracking Widget ---
  widgetClickTitle: "Click Tracking",
  widgetClickDesc:
    "Track which links and buttons visitors click on your website. See results in your analytics dashboard.",

  // --- Click Tracking Section ---
  clickTrackingTitle: "Click Tracking",
  clickTrackingDesc:
    "Want to know which links and buttons visitors are clicking on your website? Add a simple attribute to any element and Folio will track it automatically. Results appear in your Analytics dashboard under the Links tab.",
  clickTrackingHowTitle: "How to Add Click Tracking",
  clickTrackingHowDesc:
    "Add data-folio-track=\"Label\" to any link or button you want to track. The label you choose will appear in your analytics dashboard.",
  clickTrackingFullTitle: "Full Example",
  clickTrackingFullDesc:
    "Here is a complete example with multiple tracked elements. Note that the Folio script (with tracking enabled) must be included on the same page.",
  clickTrackingTipTitle: "Tip: Use descriptive labels",
  clickTrackingTipDesc:
    "Choose labels that are easy to recognize in your analytics, like \"Phone Call\", \"View Menu\", or \"Book Now\". You can view all click data in Dashboard > Analytics > Links tab, and filter by \"External Sites\" to see only clicks from your website.",

  // --- Inline Widgets ---
  inlineTitle: "Inline Widgets (Advanced)",
  inlineDesc:
    "If you chose \"inline\" mode for contact, review, or subscribe widgets, you also need to add a container element where you want the widget to appear on your page.",
  inlineStep1:
    "Decide where on your page you want the widget to show up.",
  inlineStep2:
    "Add the matching <div> tag at that location in your HTML.",
  inlineStep3:
    "The Folio script will automatically find the div and render the widget inside it.",
  inlineContactDiv: "For the contact form:",
  inlineReviewDiv: "For the review form:",
  inlineSubscribeDiv: "For the email subscribe form:",
  inlineExample:
    "For example, if you want to show a subscribe form at the bottom of your page:",

  // --- FAQ ---
  faqTitle: "Frequently Asked Questions",
  faqSlowQ: "Will it slow down my website?",
  faqSlowA:
    "No. The script is very small (about 11 KB) and loads with the \"defer\" attribute, which means it will not block your page from loading. Your visitors will not notice any difference.",
  faqColorsQ: "Can I customize the colors?",
  faqColorsA:
    "The widget automatically uses the accent color from your Folio profile. You can change it anytime in your profile editor.",
  faqMobileQ: "Does it work on mobile?",
  faqMobileA:
    "Yes. All widgets are fully responsive and work well on phones, tablets, and desktop screens.",
  faqRemoveQ: "Can I remove it later?",
  faqRemoveA:
    "Yes. Simply remove the script tag from your website and the widgets will stop appearing immediately.",
  faqMultipleQ: "Can I add it to multiple websites?",
  faqMultipleA:
    "Yes. You can paste the same script on as many websites as you like. They all connect to the same Folio profile.",
  faqNoCodingQ: "I have no coding experience. Can I still do this?",
  faqNoCodingA:
    "Absolutely. For platforms like WordPress, Wix, and Squarespace, you do not need to write any code. Just paste the script in the right place using the instructions above.",

  // --- CTA ---
  ctaTitle: "Ready to Get Started?",
  ctaDesc:
    "Create your Folio account, configure your widgets, and add them to your website in minutes.",
  ctaSignup: "Create Free Account",
  ctaLoggedIn: "Go to Dashboard",
} as const;
