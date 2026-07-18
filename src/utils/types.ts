export type UserRecord = {
  id: string;
  name?: string;
  surname?: string;
  Phone?: string;
  Email?: string;
  Password?: string;
  Role?: "user" | "teacher" | "admin" | string;
  status?: "pending" | "approved" | "rejected";
  tCoins?: number;
  premiumUntil?: string;
  premiumBadge?: boolean;
  certificatesCount?: number;
  completedCourses?: string[];
  totalStudyMinutes?: number;
  lastLoginBonus?: string;
  loginStreak?: number;
  dailySpinDate?: string;
  spinTickets?: number;
  telegramBonusClaimed?: boolean;
};

export type VideoLesson = {
  id: string;
  title: string;
  youtubeUrl: string;
  minutes: number;
  isPreview?: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  videos: VideoLesson[];
};

export type TestOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type TestQuestion = {
  id: string;
  question: string;
  options: TestOption[];
  explanation?: string;
};

export type CourseTest = {
  timeLimitMinutes: number;
  passingPercent: number;
  questions: TestQuestion[];
};

export type CourseRecord = {
  id: string;
  Id?: string | number;
  Lesson?: string;
  title?: string;
  Dec?: string;
  description?: string;
  Day?: string;
  Img?: string;
  Video?: string;
  Count?: string | number;
  Modules?: CourseModule[];
  modules?: CourseModule[];
  Test?: CourseTest;
  test?: CourseTest;
  premium?: boolean;
  category?: string;
  level?: string;
  teacherName?: string;
};

export type CodeRecord = {
  id: string;
  Id?: string | number;
  Code?: string;
  Lesson?: string;
  Dec?: string;
  Day?: string;
  Img?: string;
  Video?: string;
  Count?: string | number;
};

export type CertificateRecord = {
  id: string;
  firstName: string;
  lastName: string;
  courseName: string;
  scorePercent: number;
  issuedAt: string;
  certificateId: string;
  premiumDesign: boolean;
};

export type PlatformPost = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  createdAt: string;
  likes: number;
  comments: string[];
};

export type LearningGame = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  questionCount: number;
  rewardCoins: number;
  timerSeconds: number;
  teacherId: string;
};

export type ThemeMode = "system" | "light" | "dark";
export type LanguageCode = "uz" | "ru" | "en";
