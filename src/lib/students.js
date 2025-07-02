export const studentNames = [
  "MUHAMMED SINAN V", "MUHAMMED ASLAM KA", "MUHAMMED SINAN C", "MUHAMMED MIDLAJ PK",
  "MUHAMMED SHIBILI CK", "MUHAMMED SAVAD K", "MUHAMMED BISHR PP", "SALMANUL FARIS",
  "ZAYED MK", "MUHAMMED THASLEEH", "MUHAMMED MUBASHIR", "MUHAMMED HISHAM CV",
  "MUHAMMED SWALIH C", "MUHAMMED NAFEEH", "MUHAMMED SAEED", "MISHAB E",
  "HANEEN KT", "ADIL AMEEN", "MUHAMMED SABITH VY", "MUHAMMED SWALIH MT",
  "MUHAMMED SABITH H", "SINAN NELLIKUTH", "MUHAMMED ISMAIL", "MUHAMMED SHAMMAS P",
  "MUHAMMED AFNAN", "MUHAMMED SINAN KP", "SAYYID NIZAMUDHEEN",
  "MUHAMMED", "MUHAMMED THWAYYIB", "ABDULLA KAMIL", "MUHAMMED LUQMAN",
  "ZIYAD BIN MUSTHAFA", "MUHAMME RAZAL AP", "MUHAMMED SUFIYAN", "MUHAMMED SHAFEEH",
  "MUHAMMED SAJEED", "ABDUL KADIRI SINAN", "MUHAMMED THUFAIL", "MUHAMMED SAHL",
  "MUHAMMED SAEED", "MUHAMMED MIDLAJ KS", "SAYYID BISHRUL HAFI", "MUHAMMED ASIM",
  "ZIYAU RAHMAN", "AMAN MUHAMMED", "ABDU SAMAD", "MUHAMMED SHAFI",
  "MUHAMMED ANFAL", "MUHAMMED AYMAN", "MUHAMMED SHAMIL E", "MUHAMMED SWABEEH MK",
  "SINAN K CVR", "MUHAMMED SIRAJ", "MUHAMMED ANWAR",
  "MUHAMMED SHAMVEEL", "NUHMAN NK", "MUHAMMED JAZEEL", "MUHAMMED SINAN K", "NAJMUL ABID",
  "JAWAD P", "ANOOF HASSAN", "MUHAMMED ANSHIF", "MUHAMMED E",
  "MUHAMMED JUNAID", "ANSIL PANG", "MUHAMMED AAHIL", "DANEEN JAWAD",
  "MUHAMMED MIDLAJ PM", "MUHAMMED MALIK", "MUHAMMED SAHAD", "MUHAMMED ASJAD",
  "MUHAMMED ANSHID", "MUHAMMED RABEEH M", "AHMED SINAN", "NASWIH",
  "MUHAMMED MISBAH", "MUHAMMED ANAS VP", "BISHRUL HAFI", "MUHAMMED RABEEH T",
  "AHMAD RAZA KHAN EK", "MUHAMMED SINAN M", "MUHAMMED FAKIH", "MUHAMMED DILSHAD",
  "MUHAMMED QASIM", "MUHAMMED ASAD", "MUHAMMED SINAN N", "MUHAMMED GHAZZALI",
  "MUHAMMED MAJID", "MUHAMMED SHABEER", "AHMED RASHAD", "MUHAMMED SHAHEEM",
  "HAMDAN ORAVIL", "MUHAMMED OMER", "MUHAMMED MISHAL", "SWABEEH KP",
  "MUHAMMED AFNAN E", "MUHAMMED ANAS", "MUHAMMED RAZI", "MUHAMMED RUSLAN",
  "MUHAMMED SWABEEH KK", "MUHAMMED RABEEH", "HAMDAN KT", "MUHAMMED RAZAN"
];

export const masterNames = [
  "SHAFEEQUE RAHMAN MISBAHI", "ABDULLA UVAIS SAQAFI", "AHMED KAMIL SAQAFI",
  "ABDUL KHADER AHSANI", "NOUFAL ADANY"
];

export const mhsUserNamesAndRoles = [
  { name: "President", role: "president" },
  { name: "Secretary", role: "secretary" },
  { name: "Accounter", role: "other", subRole: "accounter" },
  { name: "Seller", role: "other", subRole: "seller" },
  { name: "Computer", role: "other", subRole: "computer" },
  { name: "Library", role: "other", subRole: "library" },
  { name: "Kuthbkhana", role: "other", subRole: "kuthbkhana" },
  { name: "Spiritual", role: "other", subRole: "spiritual" },
  { name: "Other", role: "other", subRole: "general" },
];

export const mhsOtherSubRoles = [
    { value: "accounter", label: "Accounter", icon: "Landmark" },
    { value: "seller", label: "Seller", icon: "Store" },
    { value: "computer", label: "Computer Dept.", icon: "Laptop" },
    { value: "library", label: "Library Admin", icon: "LibraryBig" },
    { value: "kuthbkhana", label: "Kuthbkhana Admin", icon: "BookOpenCheck" },
    { value: "spiritual", label: "Spiritual Leader", icon: "Sparkles" },
    { value: "general", label: "General Staff", icon: "Users" },
];


export const generatePassword = (name, type = 'student', subRole = null) => {
  if (!name) return "";
  const baseName = name.toLowerCase().replace(/\s+/g, '');
  let fullType = type;
  if (type === 'mhs' && subRole) {
    fullType = `mhs-${subRole}`;
  }
  return `${baseName}123`;
};

export const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "hi", label: "Hindi" },
  { value: "ur", label: "Urdu" },
  { value: "ml", label: "Malayalam" },
  { value: "ta", label: "Tamil" },
  { value: "zh", label: "Chinese" },
];

export const libraryCategories = [
    { value: 'islamic', label: 'ISLAMIC' },
    { value: 'biography', label: 'BIOGRAPHY' },
    { value: 'general', label: 'GENERAL' },
    { value: 'history', label: 'HISTORY' },
    { value: 'novel', label: 'NOVEL' },
    { value: 'travelogue', label: 'TRAVELOGUE' },
    { value: 'study', label: 'STUDY' },
    { value: 'science', label: 'SCIENCE' },
    { value: 'autobiography', label: 'AUTOBIOGRAPHY' },
    { value: 'public', label: 'PUBLIC' },
    { value: 'magazine', label: 'MAGAZINE' },
    { value: 'others', label: 'OTHERS' },
];

export const kuthbkhanaCategories = [
    { value: 'tafsir', label: 'التفسير' },
    { value: 'hadith', label: 'الحديث' },
    { value: 'fiqh', label: 'الفقه' },
    { value: 'tarikh', label: 'التاريخ' },
    { value: 'balagha', label: 'البلاغة' },
    { value: 'mantiq', label: 'المنطق' },
    { value: 'nahw', label: 'النحو' },
    { value: 'sarf', label: 'الصرف' },
    { value: 'ukhra', label: 'أُخر' },
];


export const initialBookData = [
    { id: 'bk001', name: 'The Great Gatsby', category: 'novel', author: 'F. Scott Fitzgerald', bookNumber: 'F001', publications: 'Scribner', price: '150', coverImage: null, volume: '1', isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null, isArabic: false },
    { id: 'bk002', name: 'To Kill a Mockingbird', category: 'novel', author: 'Harper Lee', bookNumber: 'F002', publications: 'J. B. Lippincott & Co.', price: '120', coverImage: null, volume: '1', isBorrowed: true, borrower: 'MUHAMMED SINAN V', borrowedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), borrowerPlace: 'Class A', dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), isArabic: false },
    { id: 'bk003', name: '1984', category: 'novel', author: 'George Orwell', bookNumber: 'D001', publications: 'Secker & Warburg', price: '100', coverImage: null, volume: '1', isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null, isArabic: false },
    { id: 'bk004', name: 'Sahih al-Bukhari', category: 'hadith', author: 'Imam Bukhari', bookNumber: 'H001', publications: 'Darussalam', price: '500', coverImage: null, volume: '1-9', isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null, isArabic: true },
    { id: 'bk005', name: 'Al-Risala', category: 'fiqh', author: 'Imam Shafi\'i', bookNumber: 'FQ001', publications: 'Maktaba al-Asriyya', price: '300', coverImage: null, volume: '1', isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null, isArabic: true },
    { id: 'bk006', name: 'Pride and Prejudice', category: 'novel', author: 'Jane Austen', bookNumber: 'R001', publications: 'T. Egerton', price: '90', coverImage: null, volume: '1', isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null, isArabic: false },
    { id: 'bk007', name: 'The Hobbit', category: 'novel', author: 'J.R.R. Tolkien', bookNumber: 'FY001', publications: 'Allen & Unwin', price: '180', coverImage: null, volume: '1', isBorrowed: true, borrower: 'MUHAMMED ASLAM KA', borrowedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), borrowerPlace: 'Class B', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), isArabic: false },
    { id: 'bk008', name: 'Ihya Ulum al-Din', category: 'ukhra', author: 'Imam Ghazali', bookNumber: 'T001', publications: 'Dar al-Kutub al-Ilmiyya', price: '750', coverImage: null, volume: '1-5', isBorrowed: true, borrower: 'SALMANUL FARIS', borrowedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), borrowerPlace: 'Class C', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), isArabic: true },
];

export const spiritualActivities = {
  farl: ["Zuhr", "Asr", "Maghrib", "Isha", "Subh"],
  sunnah: ["Witr", "Tahajjud", "Tarawih", "Tasbeeh"],
  dhikr: ["Asmaul Badr", "Mawlid", "Hisb"],
};
