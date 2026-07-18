import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type AuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "user" | "teacher" | "admin";
export type SocialProviderName = "google" | "microsoft" | "apple";

type SessionUser = {
  id: string;
  name?: string;
  Phone?: string;
  phone?: string;
  Email?: string;
  email?: string;
  Role?: string;
};

type ProfileInput = {
  name?: string;
  Phone?: string;
  Email?: string;
  Role?: UserRole;
};

const isAdminEmail = (email?: string) => (email || "").trim().toLowerCase().startsWith("admin789123@");

const isUserRole = (value: string | null | undefined): value is UserRole =>
  value === "user" || value === "teacher" || value === "admin";

const providerMap: Record<SocialProviderName, () => AuthProvider> = {
  google: () => new GoogleAuthProvider(),
  microsoft: () => new OAuthProvider("microsoft.com"),
  apple: () => new OAuthProvider("apple.com"),
};

export const getCurrentRole = (): UserRole | null => {
  try {
    const email = JSON.parse(localStorage.getItem("email") || "\"\"");
    if (isAdminEmail(email)) {
      return "admin";
    }
  } catch {
    if (isAdminEmail(localStorage.getItem("email") || "")) {
      return "admin";
    }
  }

  const role = localStorage.getItem("role");
  return isUserRole(role) ? role : null;
};

export const getCurrentUserId = () => localStorage.getItem("token") || "";

export const requireRole = (allowed: UserRole | UserRole[]) => {
  const role = getCurrentRole();
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return Boolean(role && getCurrentUserId() && roles.includes(role));
};

export const saveSession = (user: SessionUser) => {
  const role = isAdminEmail(user.Email || user.email) ? "admin" : isUserRole(user.Role) ? user.Role : "user";

  localStorage.setItem("login", "ha");
  localStorage.setItem("token", user.id);
  localStorage.setItem("role", role);
  localStorage.setItem("name", JSON.stringify(user.name || ""));
  localStorage.setItem("phone", JSON.stringify(user.Phone || user.phone || ""));
  localStorage.setItem("email", JSON.stringify(user.Email || user.email || ""));
};

export const clearSession = () => {
  localStorage.clear();
};

const normalizeFirebaseUser = (firebaseUser: User, input?: ProfileInput) => ({
  name: input?.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Foydalanuvchi",
  Phone: input?.Phone || firebaseUser.phoneNumber || "",
  Email: input?.Email || firebaseUser.email || "",
  Role: isAdminEmail(input?.Email || firebaseUser.email || "") ? "admin" : input?.Role || "user",
});

export const ensureUserProfile = async (firebaseUser: User, input?: ProfileInput) => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const profile = { ...snapshot.data(), id: snapshot.id } as SessionUser;
    saveSession(profile);
    return profile;
  }

  const profile = normalizeFirebaseUser(firebaseUser, input);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    provider: firebaseUser.providerData[0]?.providerId || "password",
  });

  const sessionProfile = { ...profile, id: firebaseUser.uid };
  saveSession(sessionProfile);
  return sessionProfile;
};

export const registerWithEmail = async (input: Required<ProfileInput> & { Password: string }) => {
  const credential = await createUserWithEmailAndPassword(auth, input.Email, input.Password);

  if (input.name) {
    await updateProfile(credential.user, { displayName: input.name });
  }

  return ensureUserProfile(credential.user, input);
};

export const loginWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return ensureUserProfile(credential.user);
};

export const loginWithSocialProvider = async (providerName: SocialProviderName, role: UserRole = "user") => {
  const credential = await signInWithPopup(auth, providerMap[providerName]());
  return ensureUserProfile(credential.user, { Role: role });
};

export const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code.includes("auth/email-already-in-use")) {
    return "Bu email bilan hisob mavjud. Sign In sahifasidan kiring.";
  }

  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
    return "Email yoki parol noto'g'ri.";
  }

  if (code.includes("auth/popup-closed-by-user")) {
    return "Kirish oynasi yopildi. Qayta urinib ko'ring.";
  }

  if (code.includes("auth/account-exists-with-different-credential")) {
    return "Bu email boshqa login usuli bilan ulangan. O'sha usul orqali kiring.";
  }

  if (code.includes("auth/operation-not-allowed")) {
    return "Bu login provayderi Firebase Console ichida yoqilmagan.";
  }

  return "Firebase bilan bog'lanishda xatolik yuz berdi. Ruxsatlar va provider sozlamalarini tekshiring.";
};
