import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  initializeRecaptchaConfig,
  type ConfirmationResult,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Ensure reCAPTCHA Enterprise config is loaded.
 * Required for Firebase SDK v9.22+ with reCAPTCHA Enterprise.
 */
let recaptchaConfigInitialized = false;
async function ensureRecaptchaConfig() {
  if (!recaptchaConfigInitialized) {
    try {
      await initializeRecaptchaConfig(auth);
      recaptchaConfigInitialized = true;
    } catch (err) {
      console.warn('reCAPTCHA config initialization failed:', err);
    }
  }
}

/**
 * Get or create an invisible reCAPTCHA verifier attached to a container div.
 * Creates a fresh verifier each time to avoid stale state in Next.js.
 */
let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  // Clear previous verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }

  // Clear any existing reCAPTCHA widgets in the container
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });

  return recaptchaVerifier;
}

/**
 * Send OTP to the given phone number.
 * Handles reCAPTCHA setup internally — just pass the container element ID.
 */
export async function sendOtp(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<ConfirmationResult> {
  // Initialize reCAPTCHA Enterprise config before first use
  await ensureRecaptchaConfig();

  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  try {
    await verifier.render();
    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return result;
  } catch (error) {
    // Clear verifier on failure so it can be recreated
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    throw error;
  }
}

/**
 * Listen to auth state changes.
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  return firebaseSignOut(auth);
}

/**
 * Get the current user (snapshot, not reactive).
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export type { User, ConfirmationResult };
