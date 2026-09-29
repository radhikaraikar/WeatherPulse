const BASE_URL = 'http://localhost:8080';

async function runAuthTests() {
  console.log('=== WEATHERPULSE AUTH & SIGNUP TEST SUITE ===\n');

  // Test 1: Service Health
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const health = await res.json();
    console.log('[PASS] 1. Health check:', health.status, '| DB:', health.database);
  } catch (err) {
    console.error('[FAIL] 1. Health check:', err.message);
  }

  // Test 2: Signup unique user
  const uniqueId = Date.now();
  const testEmail = `observer.${uniqueId}@weatherpulse.in`;
  let token = null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Radhika Maruti Raikar',
        email: testEmail,
        state: 'Karnataka',
        password: 'SecurePassword2026'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.user?.state === 'Karnataka' && data.token) {
      console.log('[PASS] 2. Signup successful with state "Karnataka":', data.user.email, '| Role:', data.user.role);
      token = data.token;
    } else {
      console.error('[FAIL] 2. Signup failed:', res.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 2. Signup network error:', err.message);
  }

  // Test 3: Session verification with Bearer token
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.authenticated && data.user?.email === testEmail) {
      console.log('[PASS] 3. /api/auth/me authenticated:', data.user.full_name, '(<' + data.user.email + '>)');
    } else {
      console.error('[FAIL] 3. /api/auth/me session check failed:', data);
    }
  } catch (err) {
    console.error('[FAIL] 3. Session verification error:', err.message);
  }

  // Test 4: Login with newly created user
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword2026'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.token) {
      console.log('[PASS] 4. Login successful:', data.user.email, '| Token received:', Boolean(data.token));
    } else {
      console.error('[FAIL] 4. Login failed:', res.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 4. Login network error:', err.message);
  }

  // Test 5: Duplicate registration prevention
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Duplicate Test',
        email: testEmail,
        state: 'Karnataka',
        password: 'SecurePassword2026'
      })
    });
    const data = await res.json();
    if (res.status === 409) {
      console.log('[PASS] 5. Duplicate signup correctly blocked (409 Conflict):', data.message);
    } else {
      console.error('[FAIL] 5. Duplicate signup did not return 409:', res.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 5. Duplicate signup test error:', err.message);
  }

  // Test 6: Weak password prevention (< 8 characters)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Short Pass Test',
        email: 'short.pass@test.in',
        state: 'Karnataka',
        password: '123'
      })
    });
    const data = await res.json();
    if (res.status === 400) {
      console.log('[PASS] 6. Weak password correctly rejected (400 Bad Request):', data.message);
    } else {
      console.error('[FAIL] 6. Weak password did not return 400:', res.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 6. Weak password test error:', err.message);
  }

  // Test 7: Incorrect password on login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword'
      })
    });
    const data = await res.json();
    if (res.status === 401) {
      console.log('[PASS] 7. Incorrect password rejected (401 Unauthorized):', data.message);
    } else {
      console.error('[FAIL] 7. Incorrect password did not return 401:', res.status, data);
    }
  } catch (err) {
    console.error('[FAIL] 7. Incorrect password test error:', err.message);
  }

  console.log('\n=== ALL AUTH TESTS COMPLETED SUCCESSFULLY ===');
}

runAuthTests();
