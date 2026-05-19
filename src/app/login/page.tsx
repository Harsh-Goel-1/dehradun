'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Suspense } from 'react';
import { type ConfirmationResult } from '@/lib/firebase/auth';
import { RecaptchaVerifier, signInWithPhoneNumber, initializeRecaptchaConfig } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullPhone, setFullPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  // Setup invisible reCAPTCHA on mount
  const setupRecaptcha = useCallback(async () => {
    setCaptchaReady(false);

    // Clear any previous verifier
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch {}
      recaptchaVerifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    try {
      await initializeRecaptchaConfig(auth);
    } catch {
      // Non-critical — invisible reCAPTCHA still works
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });

    try {
      await verifier.render();
      recaptchaVerifierRef.current = verifier;
      setCaptchaReady(true);
    } catch (err) {
      console.error('reCAPTCHA render failed:', err);
    }
  }, []);

  useEffect(() => {
    setupRecaptcha();
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, [setupRecaptcha]);

  // Helper: wait for captcha to be ready (up to 8 seconds)
  async function waitForCaptcha(): Promise<boolean> {
    if (recaptchaVerifierRef.current) return true;
    // Poll every 200ms for up to 8 seconds
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      if (recaptchaVerifierRef.current) return true;
    }
    return false;
  }

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const cleaned = phone.replace(/\s+/g, '').replace(/^0+/, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    const formattedPhone = cleaned.startsWith('+91')
      ? cleaned
      : cleaned.startsWith('91')
        ? `+${cleaned}`
        : `+91${cleaned}`;
    setFullPhone(formattedPhone);

    try {
      // Wait for captcha instead of erroring immediately
      if (!recaptchaVerifierRef.current) {
        const ready = await waitForCaptcha();
        if (!ready) {
          // Try one more setup
          await setupRecaptcha();
          const retryReady = await waitForCaptcha();
          if (!retryReady) {
            throw new Error('Verification setup failed. Please refresh the page.');
          }
        }
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current!);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP.';
      if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (msg.includes('invalid-phone-number')) {
        setError('Invalid phone number. Please check and try again.');
      } else if (msg.includes('app-not-authorized')) {
        setError('Phone auth is not enabled. Please check Firebase Console.');
      } else {
        setError(msg);
      }
      // Reset reCAPTCHA after failure so it can be used again
      await setupRecaptcha();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP.');
      setLoading(false);
      return;
    }

    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      setStep('phone');
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      router.push(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('invalid-verification-code')) {
        setError('Incorrect OTP. Please try again.');
      } else if (msg.includes('code-expired')) {
        setError('OTP expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChangePhone() {
    setStep('phone');
    setOtp('');
    setError('');
    setConfirmationResult(null);
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Breadcrumbs items={[{ label: step === 'phone' ? 'Log In' : 'Verify OTP' }]} />
          <h1>{step === 'phone' ? 'Log In or Sign Up' : 'Enter OTP'}</h1>
          <p>{step === 'phone' ? 'Use your phone number to continue' : `OTP sent to ${fullPhone}`}</p>
        </div>
      </div>
      <section className="content-page">
        <div className="container">
          <div className="admin-login">
            {error && (
              <p style={{ color: '#b91c1c', fontSize: '.85rem', marginBottom: '1rem', padding: '.5rem .75rem', background: '#fef2f2', borderRadius: 6 }}>
                {error}
              </p>
            )}

            {/* Invisible reCAPTCHA container — must always be in the DOM */}
            <div id="recaptcha-container" />


            {step === 'phone' ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label htmlFor="login-phone" className="form-label">Phone Number</label>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 .75rem', background: '#f3f4f6', borderRadius: 6, fontSize: '.9rem', color: '#666', fontWeight: 600 }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      id="login-phone"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      required
                      maxLength={10}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
                  {loading
                    ? (captchaReady ? 'Sending OTP...' : 'Setting up, please wait...')
                    : 'Send OTP'}
                </button>
                {!captchaReady && !loading && (
                  <p style={{ textAlign: 'center', marginTop: '.5rem', fontSize: '.75rem', color: '#d97706' }}>
                    Verification is loading... you can still type your number.
                  </p>
                )}
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.8rem', color: '#999' }}>
                  We&apos;ll send a one-time password to verify your number.
                  <br />New users are automatically registered.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a5632" strokeWidth="1.5" style={{ marginBottom: '.5rem' }}>
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div className="form-group">
                  <label htmlFor="login-otp" className="form-label">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    id="login-otp"
                    className="form-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '.75rem', fontWeight: 700 }}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" onClick={handleChangePhone} style={{ background: 'none', border: 'none', color: '#1a5632', cursor: 'pointer', fontSize: '.85rem' }}>
                    ← Change number
                  </button>
                  <button type="button" onClick={() => handleSendOtp()} disabled={loading} style={{ background: 'none', border: 'none', color: '#1a5632', cursor: 'pointer', fontSize: '.85rem' }}>
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="content-page"><div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><p>Loading...</p></div></section>}>
      <LoginForm />
    </Suspense>
  );
}
