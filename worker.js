import { publicLessonResponse } from './lesson-pages.js';
// Self-contained Worker: no external server module is required.
const testCheckout = (() => {
// Test-only Razorpay checkout. Never accepts live keys or unlocks paid access.
const AMOUNT = 500; // 500 paise = INR 5. Server controls the amount.
const API = 'https://api.razorpay.com/v1';
const encoder = new TextEncoder();
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', ...extra
  } });
}
function ready(env) {
  return /^rzp_test_[A-Za-z0-9]+$/.test(env.RAZORPAY_KEY_ID || '') &&
    typeof env.RAZORPAY_KEY_SECRET === 'string' && Boolean(env.RAZORPAY_KEY_SECRET.trim());
}
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function hex(bytes) { return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join(''); }
async function sign(secret, message) {
  return hex(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(message)));
}
async function validSignature(secret, message, signature) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const bytes = Uint8Array.from(signature.match(/../g), x => parseInt(x, 16));
  return crypto.subtle.verify('HMAC', await hmacKey(secret), bytes, encoder.encode(message));
}
function encodeToken(value) { return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
function decodeToken(value) { return JSON.parse(atob(value.replaceAll('-', '+').replaceAll('_', '/'))); }
async function signedOrderToken(env, order, origin) {
  const payload = encodeToken({ order: order.id, amount: AMOUNT, currency: 'INR', origin,
    expires: Math.floor(Date.now() / 1000) + 3600 });
  return payload + '.' + await sign(env.RAZORPAY_KEY_SECRET, 'cb-test-order:' + payload);
}
async function readOrderToken(env, token, origin) {
  if (typeof token !== 'string' || token.length > 1500) throw new ApiError(400, 'Invalid test order.');
  const parts = token.split('.');
  if (parts.length !== 2 || !await validSignature(env.RAZORPAY_KEY_SECRET, 'cb-test-order:' + parts[0], parts[1]))
    throw new ApiError(400, 'Invalid test order.');
  let data;
  try { data = decodeToken(parts[0]); } catch { throw new ApiError(400, 'Invalid test order.'); }
  if (!/^order_[A-Za-z0-9]+$/.test(data.order) || data.origin !== origin || data.amount !== AMOUNT ||
      data.currency !== 'INR' || !Number.isInteger(data.expires) || data.expires <= Math.floor(Date.now() / 1000))
    throw new ApiError(400, 'This test order is invalid or expired. Start a new test.');
  return data;
}
async function readJson(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json'))
    throw new ApiError(415, 'Send an application/json request.');
  if (!request.body) throw new ApiError(400, 'Missing request body.');
  const reader = request.body.getReader();
  let total = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > 4096) { await reader.cancel(); throw new ApiError(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError(400, 'Invalid JSON request.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, 'Invalid request.');
  return data;
}
async function razorpay(env, path, options = {}) {
  let response;
  try {
    response = await fetch(API + path, { ...options, headers: {
      Authorization: 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET),
      'Content-Type': 'application/json'
    }, signal: AbortSignal.timeout(15000) });
  } catch { throw new ApiError(502, 'Razorpay could not be reached. Please try again shortly.'); }
  if (!response.ok) {
    if (response.status === 401) throw new ApiError(503, 'Razorpay test credentials were rejected. Check that both secrets belong to the same test key pair.');
    throw new ApiError(502, 'Razorpay could not process this test request. Check your Test Mode dashboard and try again.');
  }
  try { return await response.json(); }
  catch { throw new ApiError(502, 'Unexpected response from Razorpay.'); }
}
return {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/runtime-health') {
      if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, HEAD' });
      const response = json({ worker_enabled: true, payments_enabled: false,
        test_checkout_enabled: ready(env), mode: 'test' });
      return request.method === 'HEAD' ? new Response(null, response) : response;
    }
    if (!url.pathname.startsWith('/api/test-payments/')) return env.ASSETS.fetch(request);
    try {
      if (!['/api/test-payments/create-order', '/api/test-payments/verify'].includes(url.pathname))
        throw new ApiError(404, 'Unknown test endpoint.');
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
      if (request.headers.get('Origin') !== url.origin) throw new ApiError(403, 'Use the test checkout on this website.');
      if (!ready(env)) throw new ApiError(503, 'Test checkout is unavailable. Configure matching Razorpay TEST credentials. Live keys are not accepted.');
      const body = await readJson(request);
      if (url.pathname.endsWith('/create-order')) {
        if (body.test_consent !== true) throw new ApiError(400, 'Confirm that you understand this is a simulated payment.');
        const receipt = 'cbtest_' + crypto.randomUUID().replaceAll('-', '').slice(0, 30);
        const order = await razorpay(env, '/orders', { method: 'POST', body: JSON.stringify({
          amount: AMOUNT, currency: 'INR', receipt, partial_payment: false,
          notes: { purpose: 'CodeBhavya test checkout', mode: 'test_only' }
        }) });
        if (!/^order_[A-Za-z0-9]+$/.test(order.id) || order.amount !== AMOUNT || order.currency !== 'INR')
          throw new ApiError(502, 'Unexpected test order.');
        return json({ mode: 'test', key_id: env.RAZORPAY_KEY_ID, order_id: order.id,
          amount: AMOUNT, currency: 'INR', order_token: await signedOrderToken(env, order, url.origin) });
      }
      const order = await readOrderToken(env, body.order_token, url.origin);
      if (body.razorpay_order_id !== order.order || !/^pay_[A-Za-z0-9]+$/.test(body.razorpay_payment_id || ''))
        throw new ApiError(400, 'Payment does not match this test order.');
      if (!await validSignature(env.RAZORPAY_KEY_SECRET,
        order.order + '|' + body.razorpay_payment_id, body.razorpay_signature))
        throw new ApiError(400, 'Payment verification failed. No successful payment was confirmed.');
      const payment = await razorpay(env, '/payments/' + body.razorpay_payment_id);
      if (payment.id !== body.razorpay_payment_id || payment.order_id !== order.order ||
          payment.amount !== AMOUNT || payment.currency !== 'INR')
        throw new ApiError(400, 'Payment details do not match the expected INR 5 test order.');
      if (payment.status === 'captured' && payment.captured === true && !(payment.amount_refunded > 0))
        return json({ status: 'verified', mode: 'test', payment_id: payment.id,
          message: 'Test payment verified. No real money was collected and no access rules were changed.' });
      if (['created', 'authorized'].includes(payment.status))
        return json({ status: 'pending', mode: 'test', message: 'The test payment is not captured yet. Check status again; do not pay a second time for this order.' }, 202);
      return json({ status: 'not_completed', mode: 'test', message: 'This test payment is failed, refunded, or otherwise not completed. No successful payment was confirmed.' });
    } catch (error) {
      return json({ error: error instanceof ApiError ? error.message : 'Test checkout could not complete. Please try again.' },
        error instanceof ApiError ? error.status : 500);
    }
  }
};

})();

// Optional INR 5 live contribution. No account, course or assessment access changes.
const AMOUNT = 500; // 500 paise = INR 5. Server controls the amount.
const API = 'https://api.razorpay.com/v1';
const encoder = new TextEncoder();
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', ...extra
  } });
}
function ready(env) {
  return /^rzp_live_[A-Za-z0-9]+$/.test(env.RAZORPAY_KEY_ID || '') &&
    typeof env.RAZORPAY_KEY_SECRET === 'string' && Boolean(env.RAZORPAY_KEY_SECRET.trim());
}
async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function hex(bytes) { return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join(''); }
async function sign(secret, message) {
  return hex(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(message)));
}
async function validSignature(secret, message, signature) {
  if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const bytes = Uint8Array.from(signature.match(/../g), x => parseInt(x, 16));
  return crypto.subtle.verify('HMAC', await hmacKey(secret), bytes, encoder.encode(message));
}
function encodeToken(value) { return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, ''); }
function decodeToken(value) { return JSON.parse(atob(value.replaceAll('-', '+').replaceAll('_', '/'))); }
async function signedOrderToken(env, order, origin) {
  const payload = encodeToken({ order: order.id, amount: AMOUNT, currency: 'INR', origin,
    expires: Math.floor(Date.now() / 1000) + 604800 });
  return payload + '.' + await sign(env.RAZORPAY_KEY_SECRET, 'cb-live-support:' + payload);
}
async function readOrderToken(env, token, origin) {
  if (typeof token !== 'string' || token.length > 1500) throw new ApiError(400, 'Invalid support order.');
  const parts = token.split('.');
  if (parts.length !== 2 || !await validSignature(env.RAZORPAY_KEY_SECRET, 'cb-live-support:' + parts[0], parts[1]))
    throw new ApiError(400, 'Invalid support order.');
  let data;
  try { data = decodeToken(parts[0]); } catch { throw new ApiError(400, 'Invalid support order.'); }
  if (!/^order_[A-Za-z0-9]+$/.test(data.order) || data.origin !== origin || data.amount !== AMOUNT ||
      data.currency !== 'INR' || !Number.isInteger(data.expires) || data.expires <= Math.floor(Date.now() / 1000))
    throw new ApiError(400, 'This order reference has expired. Contact support before paying again if money was debited.');
  return data;
}
async function readJson(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json'))
    throw new ApiError(415, 'Send an application/json request.');
  if (!request.body) throw new ApiError(400, 'Missing request body.');
  const reader = request.body.getReader();
  let total = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > 4096) { await reader.cancel(); throw new ApiError(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError(400, 'Invalid JSON request.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, 'Invalid request.');
  return data;
}
async function razorpay(env, path, options = {}) {
  let response;
  try {
    response = await fetch(API + path, { ...options, headers: {
      Authorization: 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET),
      'Content-Type': 'application/json'
    }, signal: AbortSignal.timeout(15000) });
  } catch { throw new ApiError(502, 'Razorpay could not be reached. Please try again shortly.'); }
  if (!response.ok) {
    if (response.status === 401) throw new ApiError(503, 'Razorpay live credentials were rejected. Contact CodeBhavya support.');
    throw new ApiError(502, 'Razorpay could not process this request. Please check payment status before trying again.');
  }
  try { return await response.json(); }
  catch { throw new ApiError(502, 'Unexpected response from Razorpay.'); }
}

const ORIGINS = new Set(['https://codebhavya.com', 'https://www.codebhavya.com']);
function enabled(env) { return env.PAYMENTS_ENABLED === 'true' && ready(env); }
function matches(payment, order) {
  return /^pay_[A-Za-z0-9]+$/.test(payment.id || '') && payment.order_id === order.order &&
    payment.amount === AMOUNT && payment.currency === 'INR';
}
function paymentStatus(payment, order) {
  if (!matches(payment, order)) throw new ApiError(400, 'Payment details do not match this INR 5 order.');
  const common = { mode: 'live', amount: AMOUNT, currency: 'INR', order_id: order.order, payment_id: payment.id };
  if (payment.amount_refunded > 0 || payment.status === 'refunded')
    return { ...common, status: 'refunded', message: 'A refund is recorded for this payment. Contact support if you need help.' };
  if (payment.status === 'captured' && payment.captured === true)
    return { ...common, status: 'verified', message: 'Thank you! Your ₹5 contribution has been verified. Your learning access stays the same.' };
  if (['created','authorized'].includes(payment.status))
    return { ...common, status: 'pending', message: 'Payment is awaiting confirmation. Check again before making another payment.' };
  return { ...common, status: 'not_paid', message: 'No completed payment was confirmed for this attempt. If your bank shows a debit, contact support before retrying.' };
}
export default {
  async fetch(request, env) {
    const lessonResponse = await publicLessonResponse(request, env);
    if (lessonResponse) return lessonResponse;
    const url = new URL(request.url);
    const testEnv = { ...env,
      RAZORPAY_KEY_ID: env.RAZORPAY_TEST_KEY_ID || (String(env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_') ? env.RAZORPAY_KEY_ID : ''),
      RAZORPAY_KEY_SECRET: env.RAZORPAY_TEST_KEY_SECRET || (String(env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_') ? env.RAZORPAY_KEY_SECRET : '')
    };
    if (url.pathname.startsWith('/api/test-payments/')) return testCheckout.fetch(request, testEnv);
    if (url.pathname === '/api/runtime-health') {
      if (!['GET','HEAD'].includes(request.method)) return json({error:'Method not allowed'},405,{Allow:'GET, HEAD'});
      const response = json({worker_enabled:true, payments_enabled:enabled(env) && ORIGINS.has(url.origin),
        mode: enabled(env) ? 'live' : 'disabled', test_checkout_enabled:/^rzp_test_[A-Za-z0-9]+$/.test(testEnv.RAZORPAY_KEY_ID || '') && Boolean(testEnv.RAZORPAY_KEY_SECRET)});
      return request.method === 'HEAD' ? new Response(null,response) : response;
    }
    if (!url.pathname.startsWith('/api/support-payments/')) return env.ASSETS.fetch(request);
    try {
      if (!ORIGINS.has(url.origin)) throw new ApiError(403,'Live support is available only on codebhavya.com.');
      if (url.pathname === '/api/support-payments/config') {
        if (request.method !== 'GET') return json({error:'Method not allowed'},405,{Allow:'GET'});
        return json({enabled:enabled(env),mode:enabled(env)?'live':'disabled',amount:AMOUNT,currency:'INR'});
      }
      if (!['/api/support-payments/create-order','/api/support-payments/verify','/api/support-payments/status'].includes(url.pathname))
        throw new ApiError(404,'Unknown payment endpoint.');
      if (request.method !== 'POST') return json({error:'Method not allowed'},405,{Allow:'POST'});
      if (request.headers.get('Origin') !== url.origin) throw new ApiError(403,'Use the support page on this website.');
      if (!ready(env)) throw new ApiError(503,'Support checkout is temporarily unavailable.');
      const body = await readJson(request);
      if (url.pathname.endsWith('/create-order')) {
        if (!enabled(env)) throw new ApiError(503,'New support payments are currently paused.');
        if (body.support_consent !== true) throw new ApiError(400,'Confirm the optional one-time ₹5 contribution before continuing.');
        const receipt = 'cbsupport_' + crypto.randomUUID().replaceAll('-','').slice(0,28);
        const order = await razorpay(env,'/orders',{method:'POST',body:JSON.stringify({amount:AMOUNT,currency:'INR',receipt,partial_payment:false,
          notes:{purpose:'Optional CodeBhavya website development support',benefit:'No paid access or subscription'}})});
        if (!/^order_[A-Za-z0-9]+$/.test(order.id || '') || order.amount !== AMOUNT || order.currency !== 'INR')
          throw new ApiError(502,'Unexpected order response. Contact support if you were charged.');
        return json({mode:'live',key_id:env.RAZORPAY_KEY_ID,order_id:order.id,amount:AMOUNT,currency:'INR',
          order_token:await signedOrderToken(env,order,url.origin)});
      }
      const order = await readOrderToken(env,body.order_token,url.origin);
      if (url.pathname.endsWith('/verify')) {
        if (body.razorpay_order_id !== order.order || !/^pay_[A-Za-z0-9]+$/.test(body.razorpay_payment_id || ''))
          throw new ApiError(400,'Payment does not match this support order.');
        if (!await validSignature(env.RAZORPAY_KEY_SECRET,order.order+'|'+body.razorpay_payment_id,body.razorpay_signature))
          throw new ApiError(400,'Payment verification failed. Check payment status before paying again.');
        return json(paymentStatus(await razorpay(env,'/payments/'+body.razorpay_payment_id),order));
      }
      // Recovery after page reload or a missing browser callback. The server-signed order
      // token is required; order IDs alone do not grant access to payment status.
      const list = await razorpay(env,'/orders/'+order.order+'/payments');
      if (!Array.isArray(list.items)) throw new ApiError(502,'Unexpected payment status response.');
      const payments = list.items.filter(p=>matches(p,order));
      const captured = payments.find(p=>p.status==='captured' && p.captured===true && !(p.amount_refunded>0));
      if (captured) return json(paymentStatus(captured,order));
      const pending = payments.find(p=>['created','authorized'].includes(p.status));
      if (pending) return json(paymentStatus(pending,order));
      const refunded = payments.find(p=>p.amount_refunded>0 || p.status==='refunded');
      if (refunded) return json(paymentStatus(refunded,order));
      return json({status:'not_paid',mode:'live',order_id:order.order,
        message:'No completed payment is recorded yet. If your bank shows a debit, contact support before retrying.'});
    } catch (error) {
      return json({error:error instanceof ApiError?error.message:'Payment status could not be confirmed. Contact support if money was debited.'},
        error instanceof ApiError?error.status:500);
    }
  }
};
