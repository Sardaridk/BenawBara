/**
 * Central UI copy for BenawBara — Kurdish (Sorani / کوردیی ناوەندی).
 *
 * The whole app is Sorani + right-to-left. Keeping every user-facing string in
 * one place keeps translations consistent and avoids scattering RTL text (and
 * its quote-escaping quirks) across JSX.
 */

export const CATEGORY_LABELS: Record<string, string> = {
  electronics: "ئەلیکترۆنی",
  furniture: "کەلوپەلی ناوماڵ",
  vehicles: "ئۆتۆمبێل",
  realestate: "خانووبەرە",
  fashion: "جلوبەرگ",
  jobs: "کار",
  other: "هیتر",
};

export const t = {
  // Brand
  brand: "BenawBara",
  tagline: "کڕین و فرۆشتن لە نزیکەوە",

  // Header / nav
  signOut: "چوونەدەرەوە",
  searchPlaceholder: "گەڕان بۆ ڕاگەیەنراوەکان…",
  categoryAll: "هەموو",
  backToMarket: "گەڕانەوە بۆ بازاڕ",
  cancel: "پاشگەزبوونەوە",
  close: "داخستن",
  myListings: "ڕاگەیەنراوەکانم",
  myAccount: "هەژماری من",
  editProfile: "دەستکاریکردنی پرۆفایل",

  // Sorting
  sort: "ڕیزبەندی",
  sortNewest: "نوێترین",
  sortPriceAsc: "نرخ: کەمترین",
  sortPriceDesc: "نرخ: بەرزترین",

  // Feed
  listingsNearby: (n: number) => `${n} ڕاگەیەنراو لە نزیکەوە`,
  emptyTitle: "هێشتا هیچ شتێک لێرە نییە",
  emptyBody: "یەکەم کەس بە بۆ بڵاوکردنەوە لەم پۆلە.",

  // Listing card / detail
  sold: "فرۆشرا",
  currency: "دینار",
  description: "وەسف",
  noDescription: "هیچ وەسفێک دانەنراوە.",
  seller: "فرۆشیار",
  chatWhatsapp: "پەیوەندی بە واتساپ",
  share: "هاوبەشکردن",
  shareWhatsApp: "هاوبەشکردن لە واتساپ",
  copyLink: "کۆپیکردنی بەستەر",
  linkCopied: "بەستەر کۆپیکرا!",
  editListing: "دەستکاری ڕاگەیەنراو",
  markAvailable: "نیشانکردن وەک بەردەست",
  markSold: "نیشانکردن وەک فرۆشراو",
  deleteListing: "سڕینەوەی ڕاگەیەنراو",
  whatsappMessage: (title: string) => `سڵاو، ئایا «${title}» هێشتا بەردەستە؟`,
  shareMessage: (title: string, price: string) =>
    `سەیری ئەم کاڵایە بکە لە بەناوبارا:\n«${title}» بە نرخی ${price}`,

  // Timeago
  justNow: "ئێستا",
  minutesAgo: (n: number) => `${n} خولەک لەمەوپێش`,
  hoursAgo: (n: number) => `${n} کاتژمێر لەمەوپێش`,
  daysAgo: (n: number) => `${n} ڕۆژ لەمەوپێش`,

  // Auth
  signInTitle: "چوونەژوورەوە",
  signUpTitle: "دروستکردنی هەژمار",
  signInSubtitle: "زانیارییەکانت بنووسە بۆ چوونەژوورەوە بۆ هەژمارەکەت.",
  signUpSubtitle: "خۆت تۆمار بکە بۆ دەستپێکردنی بڵاوکردنەوەی ڕاگەیەنراو لە گەڕەکەکەت.",
  emailLabel: "ناونیشانی ئیمەیڵ",
  passwordLabel: "وشەی نهێنی",
  signingIn: "چوونەژوورەوە…",
  creatingAccount: "دروستکردنی هەژمار…",
  signIn: "چوونەژوورەوە",
  createAccount: "دروستکردنی هەژمار",
  toSignUp: "هەژمارت نییە؟ خۆت تۆمار بکە",
  toSignIn: "پێشتر هەژمارت هەیە؟ بچۆ ژوورەوە",
  loginHelp: "بازاڕێکی خۆجێیی و متمانەپێکراو بۆ گەڕەکەکەت.",
  loginHelpSub: "بە چوونەژوورەوە، ڕازیبوونت بە مەرجەکانی بەکارهێنان دەردەبڕیت.",

  // Password reset + email verification
  forgotPassword: "وشەی نهێنیت لەبیرچووە؟",
  forgotTitle: "ڕێکخستنەوەی وشەی نهێنی",
  forgotSubtitle: "ناونیشانی ئیمەیڵەکەت بنووسە، بەستەرێکی ڕێکخستنەوەت بۆ دەنێرین.",
  sendResetLink: "ناردنی بەستەری ڕێکخستنەوە",
  sendingResetLink: "ناردن…",
  checkInboxTitle: "ئیمەیڵەکەت بپشکنە",
  checkInboxSignup:
    "بەستەرێکی پشتڕاستکردنەوەمان بۆ ناردیت. کلیکی لێبکە بۆ چالاککردنی هەژمارەکەت.",
  checkInboxReset:
    "ئەگەر هەژمارێک بەم ئیمەیڵە هەبێت، بەستەرێکی ڕێکخستنەوەمان بۆ ناردووە.",
  backToSignIn: "گەڕانەوە بۆ چوونەژوورەوە",
  resetPasswordTitle: "وشەی نهێنی نوێ دابنێ",
  resetPasswordSubtitle: "وشەیەکی نهێنی نوێ بۆ هەژمارەکەت دابنێ.",
  newPasswordLabel: "وشەی نهێنی نوێ",
  confirmPasswordLabel: "دووبارەکردنەوەی وشەی نهێنی",
  updatePassword: "نوێکردنەوەی وشەی نهێنی",
  updatingPassword: "نوێکردنەوە…",
  showPassword: "پیشاندانی وشەی نهێنی",
  hidePassword: "شاردنەوەی وشەی نهێنی",
  requestNewResetLink: "داواکردنی بەستەری نوێ",
  noResetSession:
    "هیچ بەستەر یان دانیشتنێکی کارا بۆ ڕێکخستنەوەی وشەی نهێنی نەدۆزرایەوە.",

  // Profile setup
  profileTitle: "هەژمارەکەت تەواو بکە",
  profileSubtitle:
    "بەناوبارا بازاڕی گەڕەکە. با خەڵک بزانن تۆ کێیت و لەکوێ دەفرۆشیت.",
  fullNameLabel: "ناوی تەواو",
  fullNamePlaceholder: "بۆ نموونە: ئاری ئەحمەد",
  fullNameHelp: "بە ئاشکرا لەسەر ڕاگەیەنراوەکانت پیشان دەدرێت.",
  locationLabel: "گەڕەک / شوێن",
  locationPlaceholder: "بۆ نموونە: ئازادی، هەولێر",
  locationHelp: "یارمەتی کڕیاران دەدات کاڵا لە نزیکەوە بدۆزنەوە.",
  whatsappLabel: "ژمارەی واتساپ",
  whatsappPlaceholder: "بۆ نموونە: ‎+964 750 123 4567",
  whatsappHelp:
    "تەنها بەکاردێت کاتێک کڕیار کلیک لە «پەیوەندی بە واتساپ» دەکات. بە پارێزراوی دەمێنێتەوە.",
  savingProfile: "پاشەکەوتکردنی هەژمار…",
  saveAndContinue: "پاشەکەوت و بەردەوامبوون",

  // Listing form (create + edit)
  postListingTitle: "بڵاوکردنەوەی ڕاگەیەنراو",
  editListingTitle: "دەستکاری ڕاگەیەنراو",
  titleLabel: "ناونیشانی ڕاگەیەنراو",
  titlePlaceholder: "بۆ نموونە: ئایفۆن ١٣ پرۆ، ١٢٨ گیگابایت",
  categoryLabel: "پۆل",
  selectIcon: "ئایکۆنێک هەڵبژێرە",
  photoLabel: "وێنە",
  photoOptional: "(ئارەزوومەندانە)",
  photoHint: "تەنها وێنە ڕێگەپێدراوە، خۆکارانە بۆ کەمتر لە ١ مێگابایت کەمدەکرێتەوە.",
  onlyImagesAllowed: "تەنها پەڕگەی وێنە ڕێگەپێدراوە (JPG, PNG, WebP).",
  addPhoto: "وێنەیەک زیاد بکە",
  uploading: "بارکردن…",
  compressingImage: "کەمکردنەوەی قەبارە و بارکردن…",
  removePhoto: "لابردن",
  photoPreviewAlt: "پێشبینینی وێنەی ڕاگەیەنراو",
  priceLabel: "نرخ (دینار)",
  pricePlaceholder: "120000",
  neighborhoodLabel: "گەڕەک",
  neighborhoodPlaceholder: "بۆ نموونە: ئازادی",
  descriptionPlaceholder: "بارودۆخ، وردەکاری، هۆکاری فرۆشتن…",
  creatingListing: "دروستکردنی ڕاگەیەنراو…",
  waitingForPhoto: "چاوەڕوانی وێنە…",
  postListing: "بڵاوکردنەوە",
  savingChanges: "پاشەکەوتکردنی گۆڕانکارییەکان…",
  saveChanges: "پاشەکەوتکردنی گۆڕانکارییەکان",

  // My listings dashboard
  activeListings: "بەردەستەکان",
  soldListings: "فرۆشراوەکان",
  noMyListings: "هێشتا هیچ ڕاگەیەنراوێکت بڵاونەکردووەتەوە.",
  noSoldListings: "هیچ ڕاگەیەنراوێکی فرۆشراوت نییە.",
  postFirstListing: "یەکەم ڕاگەیەنراوت بڵاوبکەرەوە",

  // Reporting / Moderation
  reportListing: "سکاڵا لەسەر ڕاگەیەنراو",
  reportTitle: "تۆمارکردنی سکاڵا",
  reportSubtitle: "ئەگەر ئەم ڕاگەیەنراوە گوماناوییە یان پێشێلکاری تێدایە، تکایە ئاگادارمان بکەرەوە.",
  reportReasonLabel: "هۆکاری سکاڵا",
  reportReasonPlaceholder: "هۆکارێک هەڵبژێرە…",
  reportDetailsLabel: "ڕوونکردنەوەی زیاتر (ئارەزوومەندانە)",
  reportDetailsPlaceholder: "وردەکاری زیاتر بنووسە…",
  submitReport: "ناردنی سکاڵا",
  submittingReport: "ناردن…",
  reportSuccess: "سوپاس، سکاڵاکەت بە سەرکەوتوویی تۆمارکرا و پێداچوونەوەی بۆ دەکرێت.",
  reasonScam: "فێڵکردن یان ساختە",
  reasonSold: "کاڵاکە پێشتر فرۆشراوە",
  reasonInappropriate: "ناوەڕۆکی نەشیاو",
  reasonWrongInfo: "نرخ یان زانیاری هەڵە",
  reasonOther: "هۆکاری تر",

  // Metadata
  metaTitle: "بەناوبارا — بازاڕی گەڕەکەکەت",
  metaDescription:
    "کڕین و فرۆشتن بە شێوەیەکی خۆجێیی لە گەڕەکەکەت. بازاڕێکی پاک و متمانەپێکراو.",

  // Upload errors (client-side)
  uploadSessionExpired: "دانیشتنەکەت بەسەرچووە. تکایە دووبارە بچۆ ژوورەوە.",
  uploadFailed: "بارکردن سەرکەوتوو نەبوو. تکایە وێنەیەکی تر تاقی بکەرەوە.",
  uploadProcessFailed: "نەتوانرا ئەو وێنەیە پرۆسێس بکرێت. فایلێکی تر تاقی بکەرەوە.",
} as const;

// Server-action error messages, kept separate so actions don't import UI copy.
export const errors = {
  invalidEmail: "ناونیشانێکی ئیمەیڵی دروست بنووسە.",
  passwordTooShort: "وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت.",
  enterPassword: "وشەی نهێنیەکەت بنووسە.",
  wrongCredentials: "ئیمەیڵ یان وشەی نهێنی هەڵەیە.",
  emailAlreadyRegistered: "ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە.",
  emailNotConfirmed: "تکایە سەرەتا ئیمەیڵەکەت پشتڕاست بکەرەوە. ئیمەیڵەکەت بپشکنە.",
  passwordsDoNotMatch: "وشەکانی نهێنی وەک یەک نین.",
  samePassword: "وشەی نهێنی نوێ دەبێت جیاواز بێت لە وشەی نهێنی پێشوو.",
  sessionExpired:
    "بەستەری ڕێکخستنەوە بەسەرچووە یان نادروستە. تکایە دووبارە داوای بەستەرێکی نوێ بکە.",
  authGeneric: "هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.",
  nameTooShort: "ناو دەبێت لانیکەم ٢ پیت بێت.",
  locationTooShort: "شوێنی گەڕەک دەبێت لانیکەم ٢ پیت بێت.",
  invalidPhone: "ژمارەیەکی دروستی واتساپ بنووسە (بۆ نموونە: ‎+964 7xx xxx xxxx).",
  noSession: "دانیشتنی چوونەژوورەوە نەدۆزرایەوە.",
  titleTooShort: "ناونیشان دەبێت لانیکەم ٣ پیت بێت.",
  neighborhoodTooShort: "گەڕەک دەبێت لانیکەم ٢ پیت بێت.",
  invalidPrice: "نرخێکی دروستی ئەرێنی بنووسە.",
  invalidCategory: "پۆلێکی دروست هەڵبژێرە.",
  invalidPhoto: "ئاماژەی وێنە نادروستە.",
  listingNotFound: "ڕاگەیەنراو نەدۆزرایەوە یان مۆڵەتت نییە بۆ دەستکاریکردنی.",
  reportReasonRequired: "تکایە هۆکاری سکاڵاکە دیاری بکە.",
  reportFailed: "تۆمارکردنی سکاڵا سەرکەوتوو نەبوو. تکایە دووبارە هەوڵبدەرەوە.",
} as const;
