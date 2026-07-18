import { collection, onSnapshot, orderBy, query, type DocumentData } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import type {
  CertificateRecord,
  CourseModule,
  CourseRecord,
  CourseTest,
  LanguageCode,
  LearningGame,
  PlatformPost,
  TestQuestion,
  ThemeMode,
  UserRecord,
  VideoLesson,
} from "./types";

type Wallet = {
  tCoins: number;
  premiumUntil: string;
  premiumBadge: boolean;
  spinTickets: number;
  loginStreak: number;
  lastLoginBonus: string;
  dailySpinDate: string;
  telegramBonusClaimed: boolean;
  rewardedEvents: string[];
  transactions: Array<{ id: string; amount: number; reason: string; createdAt: string }>;
};

type CourseProgress = {
  watchedVideoIds: string[];
  completedAt?: string;
  certificateId?: string;
  bestScore?: number;
  totalStudyMinutes: number;
  lastUpdated: string;
};

export type TestResult = {
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  details: Array<{ questionId: string; correct: boolean; selectedOptionId: string }>;
};

export type SpinResult = {
  ok: boolean;
  label: string;
  coins: number;
  premiumDays: number;
  wallet: Wallet;
};

export const ADMIN_EMAIL_PREFIX = "admin789123@";
export const TELEGRAM_CHANNEL_URL = "https://t.me/MentorUz1";
export const SUPPORT_PHONE = "+998978040728";
export const PREMIUM_PRICE_COINS = 250;
export const PREMIUM_DAYS = 7;
export const PASSING_PERCENT = 70;

const STORAGE_PREFIX = "mentoruz:";
const WALLET_KEY = `${STORAGE_PREFIX}wallet`;
const CERTIFICATES_KEY = `${STORAGE_PREFIX}certificates`;
const PROGRESS_KEY = `${STORAGE_PREFIX}progress`;
const POSTS_KEY = `${STORAGE_PREFIX}posts`;
const GAMES_KEY = `${STORAGE_PREFIX}games`;
const LANGUAGE_KEY = `${STORAGE_PREFIX}language`;
const THEME_KEY = `${STORAGE_PREFIX}theme`;

const defaultWallet: Wallet = {
  tCoins: 40,
  premiumUntil: "",
  premiumBadge: false,
  spinTickets: 0,
  loginStreak: 0,
  lastLoginBonus: "",
  dailySpinDate: "",
  telegramBonusClaimed: false,
  rewardedEvents: [],
  transactions: [],
};

export const demoCourse: CourseRecord = {
  id: "mentoruz-demo-fullstack",
  Lesson: "Mentor.uz Full-stack start",
  Dec: "React, TypeScript, Firebase va real loyiha oqimlari orqali amaliy platforma qurishni o'rganing.",
  Day: "2026-07-18",
  Img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  Video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  Count: 8,
  category: "Frontend",
  level: "Boshlang'ichdan o'rta darajagacha",
  teacherName: "Mentor.uz jamoasi",
  premium: false,
  Modules: [
    {
      id: "module-1",
      title: "Platformaga kirish",
      videos: [
        {
          id: "video-1",
          title: "Mentor.uz workflow va dashboard",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          minutes: 18,
          isPreview: true,
        },
        {
          id: "video-2",
          title: "Auth, role va profil asoslari",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          minutes: 22,
        },
      ],
    },
    {
      id: "module-2",
      title: "Kurs, test va sertifikat oqimi",
      videos: [
        {
          id: "video-3",
          title: "Progressni foizlarda hisoblash",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          minutes: 26,
        },
        {
          id: "video-4",
          title: "Test natijasi va T-Coin mukofotlari",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          minutes: 30,
        },
      ],
    },
  ],
  Test: {
    timeLimitMinutes: 30,
    passingPercent: PASSING_PERCENT,
    questions: [
      {
        id: "q1",
        question: "Kursdan o'tish uchun minimal natija nechchi foiz?",
        options: [
          { id: "q1-a", text: "50%", isCorrect: false },
          { id: "q1-b", text: "70%", isCorrect: true },
          { id: "q1-c", text: "85%", isCorrect: false },
          { id: "q1-d", text: "100%", isCorrect: false },
        ],
        explanation: "Mentor.uz test qoidasi bo'yicha 70% va undan yuqori natija o'tgan hisoblanadi.",
      },
      {
        id: "q2",
        question: "Har bir yangi ko'rilgan video uchun qancha T-Coin beriladi?",
        options: [
          { id: "q2-a", text: "1 T-Coin", isCorrect: true },
          { id: "q2-b", text: "5 T-Coin", isCorrect: false },
          { id: "q2-c", text: "10 T-Coin", isCorrect: false },
          { id: "q2-d", text: "Berilmaydi", isCorrect: false },
        ],
      },
      {
        id: "q3",
        question: "Premium obuna T-Coin orqali necha kunga faollashadi?",
        options: [
          { id: "q3-a", text: "1 kun", isCorrect: false },
          { id: "q3-b", text: "3 kun", isCorrect: false },
          { id: "q3-c", text: "7 kun", isCorrect: true },
          { id: "q3-d", text: "30 kun", isCorrect: false },
        ],
      },
    ],
  },
};

export const demoPosts: PlatformPost[] = [
  {
    id: "post-1",
    title: "Frontend sprint boshlandi",
    description: "React, Firebase va real dashboard amaliyoti uchun yangi guruh ochildi.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    authorName: "Mentor.uz",
    createdAt: new Date().toISOString(),
    likes: 42,
    comments: ["Zo'r yangilik!", "Dars jadvali qachon chiqadi?"],
  },
];

export const demoGames: LearningGame[] = [
  {
    id: "game-1",
    name: "JS tezkor savollar",
    description: "50 soniya ichida asosiy JavaScript savollariga javob bering.",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    questionCount: 10,
    rewardCoins: 3,
    timerSeconds: 50,
    teacherId: "demo",
  },
];

const translations: Record<LanguageCode, Record<string, string>> = {
  uz: {
    dashboard: "Dashboard",
    courses: "Kurslar",
    certificates: "Sertifikatlar",
    aiTeacher: "AI Ustoz",
    community: "Hamjamiyat",
    premium: "Premium",
    ranking: "Reyting",
  },
  ru: {
    dashboard: "Панель",
    courses: "Курсы",
    certificates: "Сертификаты",
    aiTeacher: "AI Учитель",
    community: "Сообщество",
    premium: "Премиум",
    ranking: "Рейтинг",
  },
  en: {
    dashboard: "Dashboard",
    courses: "Courses",
    certificates: "Certificates",
    aiTeacher: "AI Teacher",
    community: "Community",
    premium: "Premium",
    ranking: "Ranking",
  },
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const parseStoredString = (key: string, fallback = "") => {
  try {
    const value = localStorage.getItem(key);
    return value ? String(JSON.parse(value)) : fallback;
  } catch {
    return localStorage.getItem(key) || fallback;
  }
};

const progressStorageKey = (userId: string) => `${PROGRESS_KEY}:${userId || "guest"}`;

const walletStorageKey = (userId: string) => `${WALLET_KEY}:${userId || "guest"}`;

const daysBetween = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
};

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const isAdminEmail = (email = "") => email.trim().toLowerCase().startsWith(ADMIN_EMAIL_PREFIX);

export const getSessionUser = () => {
  const email = parseStoredString("email");
  const role = isAdminEmail(email) ? "admin" : localStorage.getItem("role") || "user";

  return {
    id: localStorage.getItem("token") || "guest",
    name: parseStoredString("name", "Foydalanuvchi"),
    phone: parseStoredString("phone"),
    email,
    role,
  };
};

export const getLanguage = (): LanguageCode => {
  const language = localStorage.getItem(LANGUAGE_KEY);
  return language === "ru" || language === "en" ? language : "uz";
};

export const setLanguage = (language: LanguageCode) => {
  localStorage.setItem(LANGUAGE_KEY, language);
};

export const translate = (key: string, language: LanguageCode = getLanguage()) =>
  translations[language][key] || translations.uz[key] || key;

export const getThemeMode = (): ThemeMode => {
  const theme = localStorage.getItem(THEME_KEY);
  return theme === "dark" || theme === "light" || theme === "system" ? theme : "system";
};

export const applyThemeMode = (mode: ThemeMode) => {
  localStorage.setItem(THEME_KEY, mode);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
};

export const getWallet = (userId = getSessionUser().id): Wallet => ({
  ...defaultWallet,
  ...readJson<Partial<Wallet>>(walletStorageKey(userId), {}),
});

export const saveWallet = (wallet: Wallet, userId = getSessionUser().id) => {
  writeJson(walletStorageKey(userId), wallet);
  return wallet;
};

export const rewardOnce = (eventId: string, amount: number, reason: string, userId = getSessionUser().id) => {
  const wallet = getWallet(userId);

  if (wallet.rewardedEvents.includes(eventId)) {
    return { wallet, awarded: false };
  }

  const nextWallet: Wallet = {
    ...wallet,
    tCoins: Math.max(0, wallet.tCoins + amount),
    rewardedEvents: [...wallet.rewardedEvents, eventId],
    transactions: [
      { id: makeId("tx"), amount, reason, createdAt: new Date().toISOString() },
      ...wallet.transactions,
    ].slice(0, 80),
  };

  return { wallet: saveWallet(nextWallet, userId), awarded: true };
};

export const spendTCoins = (amount: number, reason: string, userId = getSessionUser().id) => {
  const wallet = getWallet(userId);

  if (wallet.tCoins < amount) {
    return { wallet, ok: false };
  }

  const nextWallet: Wallet = {
    ...wallet,
    tCoins: wallet.tCoins - amount,
    transactions: [
      { id: makeId("tx"), amount: -amount, reason, createdAt: new Date().toISOString() },
      ...wallet.transactions,
    ].slice(0, 80),
  };

  return { wallet: saveWallet(nextWallet, userId), ok: true };
};

export const hasPremium = (wallet = getWallet()) =>
  Boolean(wallet.premiumUntil && new Date(wallet.premiumUntil).getTime() > Date.now());

export const activatePremium = (days: number, reason: string, userId = getSessionUser().id) => {
  const wallet = getWallet(userId);
  const currentEnd = wallet.premiumUntil ? new Date(wallet.premiumUntil).getTime() : 0;
  const start = currentEnd > Date.now() ? currentEnd : Date.now();
  const premiumUntil = new Date(start + days * 86_400_000).toISOString();

  const nextWallet: Wallet = {
    ...wallet,
    premiumUntil,
    premiumBadge: true,
    transactions: [
      { id: makeId("tx"), amount: 0, reason, createdAt: new Date().toISOString() },
      ...wallet.transactions,
    ].slice(0, 80),
  };

  return saveWallet(nextWallet, userId);
};

export const buyPremiumWithCoins = (userId = getSessionUser().id) => {
  const payment = spendTCoins(PREMIUM_PRICE_COINS, "Premium 7 kun", userId);

  if (!payment.ok) {
    return { wallet: payment.wallet, ok: false };
  }

  return { wallet: activatePremium(PREMIUM_DAYS, "Premium faollashtirildi", userId), ok: true };
};

export const claimTelegramBonus = (userId = getSessionUser().id) => {
  const wallet = getWallet(userId);

  if (wallet.telegramBonusClaimed) {
    return { wallet, awarded: false };
  }

  const nextWallet: Wallet = {
    ...wallet,
    telegramBonusClaimed: true,
    tCoins: wallet.tCoins + 200,
    rewardedEvents: [...wallet.rewardedEvents, "telegram-bonus"],
    transactions: [
      { id: makeId("tx"), amount: 200, reason: "Telegram kanal bonusi", createdAt: new Date().toISOString() },
      ...wallet.transactions,
    ].slice(0, 80),
  };

  return { wallet: saveWallet(nextWallet, userId), awarded: true };
};

export const claimDailyBonus = (userId = getSessionUser().id) => {
  const wallet = getWallet(userId);
  const today = todayKey();

  if (wallet.lastLoginBonus === today) {
    return { wallet, claimed: false, message: "Bugungi bonus allaqachon olingan." };
  }

  const streak = wallet.lastLoginBonus && daysBetween(wallet.lastLoginBonus, today) === 1 ? wallet.loginStreak + 1 : 1;
  const day = streak <= 7 ? streak : 8;
  const coinRewardByDay: Record<number, number> = { 1: 5, 2: 10, 4: 10, 5: 10, 6: 15, 7: 20, 8: 5 };
  const spinTicket = day === 3 ? 1 : 0;
  const coinReward = coinRewardByDay[day] || 5;

  const nextWallet: Wallet = {
    ...wallet,
    tCoins: wallet.tCoins + coinReward,
    spinTickets: wallet.spinTickets + spinTicket,
    loginStreak: streak,
    lastLoginBonus: today,
    transactions: [
      {
        id: makeId("tx"),
        amount: coinReward,
        reason: spinTicket ? "Kunlik bonus: 1 Spin Ticket" : `Kunlik bonus: ${coinReward} T-Coin`,
        createdAt: new Date().toISOString(),
      },
      ...wallet.transactions,
    ].slice(0, 80),
  };

  const message = spinTicket ? "1 Spin Ticket qo'shildi." : `${coinReward} T-Coin qo'shildi.`;
  return { wallet: saveWallet(nextWallet, userId), claimed: true, message };
};

export const spinLuckyWheel = (userId = getSessionUser().id): SpinResult => {
  const sectors = [
    { label: "Hech narsa yo'q", coins: 0, premiumDays: 0 },
    { label: "Hech narsa yo'q", coins: 0, premiumDays: 0 },
    { label: "Hech narsa yo'q", coins: 0, premiumDays: 0 },
    { label: "Hech narsa yo'q", coins: 0, premiumDays: 0 },
    { label: "1 T-Coin", coins: 1, premiumDays: 0 },
    { label: "1 T-Coin", coins: 1, premiumDays: 0 },
    { label: "1 T-Coin", coins: 1, premiumDays: 0 },
    { label: "2 T-Coin", coins: 2, premiumDays: 0 },
    { label: "2 T-Coin", coins: 2, premiumDays: 0 },
    { label: "3 kun Premium", coins: 0, premiumDays: 3 },
  ];
  const wallet = getWallet(userId);
  const today = todayKey();
  const usesTicket = wallet.dailySpinDate === today;

  if (usesTicket && wallet.spinTickets <= 0) {
    return { ok: false, label: "Bugungi bepul spin ishlatilgan.", coins: 0, premiumDays: 0, wallet };
  }

  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const afterCost: Wallet = {
    ...wallet,
    dailySpinDate: usesTicket ? wallet.dailySpinDate : today,
    spinTickets: usesTicket ? Math.max(0, wallet.spinTickets - 1) : wallet.spinTickets,
  };
  const withCoins: Wallet = {
    ...afterCost,
    tCoins: afterCost.tCoins + sector.coins,
    transactions: sector.coins
      ? [
          { id: makeId("tx"), amount: sector.coins, reason: "Lucky Spin", createdAt: new Date().toISOString() },
          ...afterCost.transactions,
        ].slice(0, 80)
      : afterCost.transactions,
  };
  const savedWallet = saveWallet(withCoins, userId);
  const finalWallet = sector.premiumDays ? activatePremium(sector.premiumDays, "Lucky Spin premium", userId) : savedWallet;

  return { ok: true, label: sector.label, coins: sector.coins, premiumDays: sector.premiumDays, wallet: finalWallet };
};

export const normalizeCourseModules = (course: CourseRecord): CourseModule[] => {
  const modules = course.Modules || course.modules;

  if (modules?.length) {
    return modules.map((module, moduleIndex) => ({
      id: module.id || `module-${moduleIndex + 1}`,
      title: module.title || `${moduleIndex + 1}-modul`,
      videos: module.videos.map((video, videoIndex) => ({
        id: video.id || `module-${moduleIndex + 1}-video-${videoIndex + 1}`,
        title: video.title || `${videoIndex + 1}-video`,
        youtubeUrl: video.youtubeUrl,
        minutes: Number(video.minutes) || 15,
        isPreview: video.isPreview,
      })),
    }));
  }

  if (course.Video) {
    return [
      {
        id: `${course.id}-module-1`,
        title: "Kirish moduli",
        videos: [
          {
            id: `${course.id}-video-1`,
            title: course.Lesson || course.title || "Kirish darsi",
            youtubeUrl: course.Video,
            minutes: Number(course.Count) || 20,
            isPreview: true,
          },
        ],
      },
    ];
  }

  return [];
};

export const normalizeCourseTest = (course: CourseRecord): CourseTest | null => course.Test || course.test || null;

export const getCourseTitle = (course: CourseRecord) => course.Lesson || course.title || "Nomsiz kurs";

export const getCourseDescription = (course: CourseRecord) => course.Dec || course.description || "Tavsif mavjud emas.";

export const getCourseImage = (course: CourseRecord) =>
  course.Img || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80";

export const getCourseVideoCount = (course: CourseRecord) =>
  normalizeCourseModules(course).reduce((sum, module) => sum + module.videos.length, 0);

export const getCourseMinutes = (course: CourseRecord) =>
  normalizeCourseModules(course).reduce(
    (sum, module) => sum + module.videos.reduce((videoSum, video) => videoSum + video.minutes, 0),
    0,
  );

export const getAllProgress = (userId = getSessionUser().id) =>
  readJson<Record<string, CourseProgress>>(progressStorageKey(userId), {});

export const saveProgress = (courseId: string, progress: CourseProgress, userId = getSessionUser().id) => {
  const allProgress = getAllProgress(userId);
  const nextProgress = { ...allProgress, [courseId]: progress };
  writeJson(progressStorageKey(userId), nextProgress);
  return progress;
};

export const getCourseProgress = (course: CourseRecord, userId = getSessionUser().id) => {
  const progress = getAllProgress(userId)[course.id] || {
    watchedVideoIds: [],
    totalStudyMinutes: 0,
    lastUpdated: new Date().toISOString(),
  };
  const totalVideos = getCourseVideoCount(course);
  const percent = totalVideos ? Math.round((progress.watchedVideoIds.length / totalVideos) * 100) : 0;

  return {
    ...progress,
    totalVideos,
    completedVideos: progress.watchedVideoIds.length,
    percent: clampNumber(percent, 0, 100),
  };
};

export const markVideoWatched = (course: CourseRecord, video: VideoLesson, userId = getSessionUser().id) => {
  const current = getCourseProgress(course, userId);
  const watched = new Set(current.watchedVideoIds);
  const wasWatched = watched.has(video.id);

  watched.add(video.id);

  const nextProgress = saveProgress(
    course.id,
    {
      watchedVideoIds: Array.from(watched),
      totalStudyMinutes: current.totalStudyMinutes + (wasWatched ? 0 : video.minutes),
      bestScore: current.bestScore,
      completedAt: current.completedAt,
      certificateId: current.certificateId,
      lastUpdated: new Date().toISOString(),
    },
    userId,
  );
  const reward = rewardOnce(`video:${course.id}:${video.id}`, 1, `Video: ${video.title}`, userId);

  return { progress: nextProgress, wallet: reward.wallet, awarded: reward.awarded };
};

export const shuffleQuestionOptions = (question: TestQuestion) => {
  const options = [...question.options];

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }

  return { ...question, options };
};

export const scoreCourseTest = (test: CourseTest, answers: Record<string, string>): TestResult => {
  const details = test.questions.map((question) => {
    const selectedOptionId = answers[question.id] || "";
    const selected = question.options.find((option) => option.id === selectedOptionId);
    return { questionId: question.id, selectedOptionId, correct: Boolean(selected?.isCorrect) };
  });
  const correct = details.filter((detail) => detail.correct).length;
  const percent = test.questions.length ? Math.round((correct / test.questions.length) * 100) : 0;

  return {
    total: test.questions.length,
    correct,
    percent,
    passed: percent >= (test.passingPercent || PASSING_PERCENT),
    details,
  };
};

export const getCertificates = (userId = getSessionUser().id) =>
  readJson<CertificateRecord[]>(`${CERTIFICATES_KEY}:${userId || "guest"}`, []);

export const saveCertificates = (certificates: CertificateRecord[], userId = getSessionUser().id) => {
  writeJson(`${CERTIFICATES_KEY}:${userId || "guest"}`, certificates);
  return certificates;
};

export const issueCertificate = (course: CourseRecord, result: TestResult, userId = getSessionUser().id) => {
  const session = getSessionUser();
  const [firstName, ...restName] = session.name.split(" ").filter(Boolean);
  const certificate: CertificateRecord = {
    id: makeId("certificate"),
    firstName: firstName || session.name || "Student",
    lastName: restName.join(" ") || "Mentor.uz",
    courseName: getCourseTitle(course),
    scorePercent: result.percent,
    issuedAt: new Date().toISOString(),
    certificateId: `MUZ-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    premiumDesign: hasPremium(getWallet(userId)),
  };
  const certificates = getCertificates(userId);
  const exists = certificates.find((item) => item.courseName === certificate.courseName);
  const savedCertificate = exists || certificate;

  if (!exists) {
    saveCertificates([certificate, ...certificates], userId);
  }

  const current = getCourseProgress(course, userId);
  saveProgress(
    course.id,
    {
      watchedVideoIds: current.watchedVideoIds,
      totalStudyMinutes: current.totalStudyMinutes,
      bestScore: Math.max(current.bestScore || 0, result.percent),
      completedAt: new Date().toISOString(),
      certificateId: savedCertificate.certificateId,
      lastUpdated: new Date().toISOString(),
    },
    userId,
  );
  rewardOnce(`course-complete:${course.id}`, 20, `Kurs tugatildi: ${getCourseTitle(course)}`, userId);

  if (result.percent >= 90) {
    rewardOnce(`test-90:${course.id}`, 10, `90%+ test natijasi: ${getCourseTitle(course)}`, userId);
  }

  return savedCertificate;
};

export const downloadCertificatePdf = (certificate: CertificateRecord) => {
  const printable = window.open("", "_blank", "width=900,height=700");

  if (!printable) {
    return;
  }

  printable.document.write(`
    <!doctype html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <title>${certificate.certificateId}</title>
        <style>
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #102033; background: #eef3f9; }
          .certificate { margin: 40px auto; width: 900px; min-height: 620px; padding: 56px; box-sizing: border-box; background: linear-gradient(135deg, #ffffff, #f8fbff); border: 10px solid #11284a; position: relative; }
          .certificate::after { content: ""; position: absolute; inset: 24px; border: 1px solid #d8b25b; pointer-events: none; }
          .brand { color: #11284a; font-weight: 900; font-size: 28px; letter-spacing: .08em; text-transform: uppercase; }
          .eyebrow { margin-top: 50px; color: #c4942e; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
          h1 { font-size: 58px; margin: 14px 0; }
          .name { font-size: 40px; font-weight: 800; color: #0f766e; margin: 32px 0 8px; }
          .course { font-size: 28px; font-weight: 800; margin: 12px 0 28px; }
          .meta { display: flex; gap: 16px; justify-content: space-between; margin-top: 56px; color: #536276; }
          .seal { position: absolute; right: 70px; bottom: 70px; width: 118px; height: 118px; border-radius: 999px; border: 4px solid #d8b25b; display: grid; place-items: center; color: #11284a; font-weight: 900; }
          @media print { body { background: white; } .certificate { margin: 0; width: 100%; min-height: 100vh; } }
        </style>
      </head>
      <body>
        <section class="certificate">
          <div class="brand">Mentor.uz</div>
          <div class="eyebrow">Certificate of Completion</div>
          <h1>Sertifikat</h1>
          <p>Ushbu sertifikat quyidagi o'quvchiga berildi:</p>
          <div class="name">${certificate.firstName} ${certificate.lastName}</div>
          <p>Kursni muvaffaqiyatli yakunlagani uchun</p>
          <div class="course">${certificate.courseName}</div>
          <p>Natija: <strong>${certificate.scorePercent}%</strong></p>
          <div class="meta">
            <span>Sana: ${new Date(certificate.issuedAt).toLocaleDateString("uz-UZ")}</span>
            <span>ID: ${certificate.certificateId}</span>
          </div>
          <div class="seal">${certificate.premiumDesign ? "PREMIUM" : "MUZ"}</div>
        </section>
        <script>window.print();</script>
      </body>
    </html>
  `);
  printable.document.close();
};

export const getDashboardStats = (courses: CourseRecord[], userId = getSessionUser().id) => {
  const wallet = getWallet(userId);
  const progress = courses.map((course) => getCourseProgress(course, userId));
  const certificates = getCertificates(userId);
  const totalStudyMinutes = progress.reduce((sum, item) => sum + item.totalStudyMinutes, 0);
  const completedCourses = progress.filter((item) => item.completedAt).length;
  const weeklyPercent = progress.length
    ? Math.round(progress.reduce((sum, item) => sum + item.percent, 0) / progress.length)
    : 0;

  return {
    dailyMinutes: Math.min(180, Math.round(totalStudyMinutes / 7) || 25),
    weeklyPercent,
    monthlyPercent: Math.min(100, weeklyPercent + 12),
    totalStudyHours: Number((totalStudyMinutes / 60).toFixed(1)),
    completedCourses,
    certificatesCount: certificates.length,
    tCoins: wallet.tCoins,
    rank: 1,
  };
};

export const getRanking = (users: UserRecord[], currentUserId = getSessionUser().id) => {
  const currentWallet = getWallet(currentUserId);
  const session = getSessionUser();
  const normalizedUsers = users.length
    ? users
    : [
        { id: currentUserId, name: session.name, Email: session.email, Role: session.role, tCoins: currentWallet.tCoins },
        { id: "demo-1", name: "Aziza Karimova", tCoins: 420, Role: "user" },
        { id: "demo-2", name: "Javohir Aliyev", tCoins: 310, Role: "user" },
        { id: "demo-3", name: "Madina Sobirova", tCoins: 265, Role: "user" },
      ];

  return normalizedUsers
    .map((user) => ({
      id: user.id,
      name: user.name || user.Email || "Foydalanuvchi",
      role: user.Role || "user",
      tCoins: user.id === currentUserId ? currentWallet.tCoins : Number(user.tCoins || 0),
      isCurrent: user.id === currentUserId,
    }))
    .sort((first, second) => second.tCoins - first.tCoins)
    .slice(0, 100)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
};

export const getPosts = () => readJson<PlatformPost[]>(POSTS_KEY, demoPosts);

export const savePost = (post: Omit<PlatformPost, "id" | "createdAt" | "likes" | "comments">) => {
  const posts = getPosts();
  const nextPost: PlatformPost = {
    ...post,
    id: makeId("post"),
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [],
  };
  writeJson(POSTS_KEY, [nextPost, ...posts]);
  return nextPost;
};

export const likePost = (postId: string) => {
  const posts = getPosts().map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  writeJson(POSTS_KEY, posts);
  return posts;
};

export const commentPost = (postId: string, comment: string) => {
  const posts = getPosts().map((post) =>
    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
  );
  writeJson(POSTS_KEY, posts);
  return posts;
};

export const getGames = () => readJson<LearningGame[]>(GAMES_KEY, demoGames);

export const saveGame = (game: Omit<LearningGame, "id">) => {
  const games = getGames();
  const nextGame = { ...game, id: makeId("game") };
  writeJson(GAMES_KEY, [nextGame, ...games]);
  return nextGame;
};

export const generateAiTeacherAnswer = (question: string, language: LanguageCode = getLanguage()) => {
  const normalized = question.toLowerCase();
  const prefix =
    language === "ru"
      ? "Короткий ответ"
      : language === "en"
        ? "Short answer"
        : "Qisqa javob";

  if (normalized.includes("react") || normalized.includes("component")) {
    return `${prefix}: Reactda komponentni kichik, qayta ishlatiladigan UI bo'lagi sifatida o'ylang. State faqat kerak joyda tursin, data oqimi esa yuqoridan pastga tushsin.`;
  }

  if (normalized.includes("firebase") || normalized.includes("firestore")) {
    return `${prefix}: Firestore uchun collection va document nomlarini barqaror saqlang, write qoidalarini role bo'yicha ajrating va real-time listenerlarni cleanup bilan yopib boring.`;
  }

  if (normalized.includes("test")) {
    return `${prefix}: test tizimida variantlarni ko'rsatishda shuffle qiling, lekin javobning isCorrect qiymatini o'zgartirmang. Natija correct / total * 100 formulasi bilan chiqadi.`;
  }

  return `${prefix}: savolni kichik bo'laklarga ajrating, avval maqsadni, keyin data modelni, undan keyin UI holatlarini yozing. Xohlasangiz shu savolingiz uchun 3 bosqichli yechim ham tuzib beraman.`;
};

export const subscribeToCollection = <T extends DocumentData>(
  collectionName: string,
  callback: (items: Array<T & { id: string }>) => void,
  onError?: (error: Error) => void,
) =>
  onSnapshot(
    query(collection(db, collectionName), orderBy("createdAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map((item) => ({ ...(item.data() as T), id: item.id })));
    },
    (error) => onError?.(error),
  );

export const uploadPlatformAsset = async (folder: "courses" | "posts" | "games" | "certificates", file: File) => {
  const fileRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};
