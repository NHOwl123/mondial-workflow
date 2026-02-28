// ─── auth.js ─────────────────────────────────────────────────────────────────
// User authentication, session management, and user store.
// Passwords are hashed with SHA-256 via the Web Crypto API.
// User data is persisted in Firestore (shared across all users/devices).
// Sessions are stored in sessionStorage (clears on browser/tab close).
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const USERS_DOC   = "app-data/users";   // single Firestore document holding all users
const SESSION_KEY = "mondial-session";

// ─── Password hashing ─────────────────────────────────────────────────────────
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── Seed admin account ───────────────────────────────────────────────────────
async function buildSeedAdmin() {
  return {
    id:           "usr-admin-1",
    email:        "mark.richardson@mondialsoftware.com",
    passwordHash: await hashPassword("Mondial2026!"),
    firstName:    "Mark",
    lastName:     "Richardson",
    role:         "administrator",
    active:       true,
    testFeatures: true,
    isConsultant: true,
    createdAt:    new Date().toISOString(),
    lastLogin:    null,
  };
}

// ─── User store ───────────────────────────────────────────────────────────────
export async function loadUsers() {
  try {
    const ref  = doc(db, "app-data", "users");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().list || [];
    }
  } catch (e) {
    console.error("Failed to load users from Firestore", e);
  }

  // First run — seed the admin account
  const seed = [await buildSeedAdmin()];
  await saveUsers(seed);
  return seed;
}

export async function saveUsers(users) {
  try {
    const ref = doc(db, "app-data", "users");
    await setDoc(ref, { list: users });
  } catch (e) {
    console.error("Failed to save users to Firestore", e);
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(userId) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, at: Date.now() }));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Auth actions ─────────────────────────────────────────────────────────────
export async function login(email, password, users) {
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user)        return { ok: false, error: "No account found with that email address." };
  if (!user.active) return { ok: false, error: "Your account has been deactivated. Please contact your administrator." };

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: "Incorrect password." };

  setSession(user.id);
  return { ok: true, user };
}

export function logout() {
  clearSession();
}

export function resolveSession(users) {
  const session = getSession();
  if (!session) return null;
  return users.find(u => u.id === session.userId && u.active) || null;
}

// ─── User management (admin only) ────────────────────────────────────────────
export async function createUser(users, fields) {
  const { email, password, firstName, lastName, role, testFeatures, isConsultant } = fields;
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error("A user with that email address already exists.");
  }
  const newUser = {
    id:           "usr-" + Date.now(),
    email:        email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    firstName:    firstName.trim(),
    lastName:     lastName.trim(),
    role:         role || "user",
    active:       true,
    testFeatures: testFeatures || false,
    isConsultant: isConsultant || false,
    createdAt:    new Date().toISOString(),
    lastLogin:    null,
  };
  return [...users, newUser];
}

export function updateUser(users, id, fields) {
  return users.map(u => u.id === id ? { ...u, ...fields } : u);
}

export async function resetPassword(users, id, newPassword) {
  const hash = await hashPassword(newPassword);
  return users.map(u => u.id === id ? { ...u, passwordHash: hash } : u);
}

export function toggleUserActive(users, id) {
  const user = users.find(u => u.id === id);
  if (!user) return users;
  if (user.active && user.role === "administrator") {
    const activeAdmins = users.filter(u => u.role === "administrator" && u.active);
    if (activeAdmins.length <= 1) throw new Error("Cannot deactivate the last active administrator.");
  }
  return users.map(u => u.id === id ? { ...u, active: !u.active } : u);
}

export function deleteUser(users, id) {
  const user = users.find(u => u.id === id);
  if (!user) return users;
  if (user.role === "administrator") {
    const activeAdmins = users.filter(u => u.role === "administrator" && u.active);
    if (activeAdmins.length <= 1) throw new Error("Cannot delete the last active administrator.");
  }
  return users.filter(u => u.id !== id);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function fullName(user) {
  return user ? `${user.firstName} ${user.lastName}` : "";
}

export function initials(user) {
  if (!user) return "?";
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
}
