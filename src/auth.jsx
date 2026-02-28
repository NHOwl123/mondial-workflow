// ─── auth.js ─────────────────────────────────────────────────────────────────
// User authentication, session management, and user store.
// Passwords are hashed with SHA-256 via the Web Crypto API.
// User data is persisted via window.storage (shared, so all users see the same store).
// Sessions are stored in sessionStorage (clears on browser/tab close).
// ─────────────────────────────────────────────────────────────────────────────

const USERS_KEY   = "mondial-users-v1";
const SESSION_KEY = "mondial-session";

// ─── Password hashing ─────────────────────────────────────────────────────────
export async function hashPassword(password) {
  const enc  = new TextEncoder();
  const buf  = await crypto.subtle.digest("SHA-256", enc.encode(password));
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
    role:         "administrator",   // "administrator" | "user"
    active:       true,
    testFeatures: true,              // can see Period-End Close, Reports, Adjustments, Setup
    isConsultant: true,              // appears in the Consultants list
    createdAt:    new Date().toISOString(),
    lastLogin:    null,
  };
}

// ─── User store ───────────────────────────────────────────────────────────────
export async function loadUsers() {
  try {
    const res = await window.storage.get(USERS_KEY, true);
    if (res) return JSON.parse(res.value);
  } catch { /* fall through */ }

  // First run — create seed admin
  const seed = [await buildSeedAdmin()];
  await saveUsers(seed);
  return seed;
}

export async function saveUsers(users) {
  try {
    await window.storage.set(USERS_KEY, JSON.stringify(users), true);
  } catch (e) {
    console.error("Failed to save users", e);
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────
// Session is kept in sessionStorage so it clears when the browser tab is closed.
// We only store the user id; we re-derive the full user object from the store.

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

/**
 * Attempt login. Returns { ok: true, user } or { ok: false, error: string }.
 */
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

/**
 * Resolve the currently logged-in user from the user store.
 * Returns null if no valid session.
 */
export function resolveSession(users) {
  const session = getSession();
  if (!session) return null;
  return users.find(u => u.id === session.userId && u.active) || null;
}

// ─── User management (admin only) ────────────────────────────────────────────

/**
 * Create a new user. Returns updated users array.
 */
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

/**
 * Update an existing user (non-password fields). Returns updated users array.
 */
export function updateUser(users, id, fields) {
  return users.map(u => u.id === id ? { ...u, ...fields } : u);
}

/**
 * Reset a user's password. Returns updated users array.
 */
export async function resetPassword(users, id, newPassword) {
  const hash = await hashPassword(newPassword);
  return users.map(u => u.id === id ? { ...u, passwordHash: hash } : u);
}

/**
 * Toggle a user's active status. Returns updated users array.
 * Prevents deactivating the last active administrator.
 */
export function toggleUserActive(users, id) {
  const user = users.find(u => u.id === id);
  if (!user) return users;

  // Guard: cannot deactivate the last active admin
  if (user.active && user.role === "administrator") {
    const activeAdmins = users.filter(u => u.role === "administrator" && u.active);
    if (activeAdmins.length <= 1) {
      throw new Error("Cannot deactivate the last active administrator.");
    }
  }
  return users.map(u => u.id === id ? { ...u, active: !u.active } : u);
}

/**
 * Delete a user permanently. Returns updated users array.
 * Prevents deleting the last active administrator.
 */
export function deleteUser(users, id) {
  const user = users.find(u => u.id === id);
  if (!user) return users;

  if (user.role === "administrator") {
    const activeAdmins = users.filter(u => u.role === "administrator" && u.active);
    if (activeAdmins.length <= 1) {
      throw new Error("Cannot delete the last active administrator.");
    }
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
