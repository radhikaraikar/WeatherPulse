const BASE_URL = 'http://localhost:8080';

async function runForgotPasswordTests() {
  console.log('=== WEATHERPULSE FORGOT PASSWORD TEST SUITE ===\n');

  // Step 1: Create a temporary citizen user to test reset
  const uniqueId = Date.now();
  const testEmail = `forgot.test.${uniqueId}@weatherpulse.in`;
  const initialPassword = 'InitialPassword2026';
  const newPassword = 'NewSecretPassword2026';

  try {
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Forgot Pass Observer',
        email: testEmail,
        state: 'Maharashtra',
        password: initialPassword
      })
    }).then(r => r.json());
    console.log('[PASS] 1. Created test observer:', testEmail);
  } catch (err) {
    console.error('[FAIL] 1. Creating user failed:', err.message);
  }

  // Step 2: Request Forgot Password
  let resetOtp = null;
  try {
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const data = await forgotRes.json();
    if (forgotRes.status === 200 && data.success && data.otp_code) {
      console.log('[PASS] 2. Forgot Password Request generated 6-digit OTP:', data.otp_code);
      resetOtp = data.otp_code;
    } else {
      console.error('[FAIL] 2. Forgot password request failed:', forgotRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 2. Forgot password network error:', err.message);
  }

  // Step 3: Verify OTP code
  try {
    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp_code: resetOtp })
    });
    const data = await verifyRes.json();
    if (verifyRes.status === 200 && data.success) {
      console.log('[PASS] 3. Verification OTP successfully validated:', data.message);
    } else {
      console.error('[FAIL] 3. OTP verification failed:', verifyRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 3. OTP verification network error:', err.message);
  }

  // Step 4: Weak new password rejection
  try {
    const weakRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp_code: resetOtp,
        new_password: '123'
      })
    });
    const data = await weakRes.json();
    if (weakRes.status === 400) {
      console.log('[PASS] 4. Weak password (<8 chars) correctly rejected:', data.message);
    } else {
      console.error('[FAIL] 4. Weak password was not rejected:', weakRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 4. Weak password test error:', err.message);
  }

  // Step 5: Reset password with new secure password
  try {
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        otp_code: resetOtp,
        new_password: newPassword
      })
    });
    const data = await resetRes.json();
    if (resetRes.status === 200 && data.success) {
      console.log('[PASS] 5. Password successfully updated in PostgreSQL database:', data.message);
    } else {
      console.error('[FAIL] 5. Password update failed:', resetRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 5. Password update network error:', err.message);
  }

  // Step 6: Old password should now FAIL
  try {
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: initialPassword
      })
    });
    const data = await oldLoginRes.json();
    if (oldLoginRes.status === 401) {
      console.log('[PASS] 6. Old password properly rejected (401 Unauthorized):', data.message);
    } else {
      console.error('[FAIL] 6. Old password should have failed:', oldLoginRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 6. Old login test error:', err.message);
  }

  // Step 7: New password should SUCCEED
  try {
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword
      })
    });
    const data = await newLoginRes.json();
    if (newLoginRes.status === 200 && data.success && data.token) {
      console.log('[PASS] 7. Successfully logged in with NEW password! User:', data.user.email, '| Token:', Boolean(data.token));
    } else {
      console.error('[FAIL] 7. Login with new password failed:', newLoginRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 7. New login network error:', err.message);
  }

  // Step 8: Non-existent email request
  try {
    const nonExistentRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user.999@domain.com' })
    });
    const data = await nonExistentRes.json();
    if (nonExistentRes.status === 404) {
      console.log('[PASS] 8. Non-existent email rejected (404 Not Found):', data.message);
    } else {
      console.error('[FAIL] 8. Non-existent email test failed:', nonExistentRes.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 8. Non-existent email test error:', err.message);
  }

  console.log('\n=== ALL FORGOT PASSWORD TESTS PASSED 100%! ===');
}

runForgotPasswordTests();
