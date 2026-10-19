(() => {
  'use strict';
  const form = document.getElementById('supportForm');
  const consent = document.getElementById('supportConsent');
  const pay = document.getElementById('paySupport');
  const check = document.getElementById('checkStatus');
  const status = document.getElementById('supportStatus');
  const reference = document.getElementById('supportReference');
  const storageKey = 'codebhavya:support-order:v1';
  let order = null, busy = false, live = false, verified = false, uncertain = false, loader = null;
  function message(text, state = '') { status.textContent = text; status.dataset.state = state; }
  function update() {
    pay.disabled = busy || !live || !consent.checked || verified || uncertain;
    consent.disabled = busy || verified;
    check.hidden = !order || verified;
    check.disabled = busy;
    pay.textContent = verified ? 'Contribution verified — thank you' : order ? 'Resume ₹5 checkout' : 'Support with ₹5';
    form.setAttribute('aria-busy', String(busy));
  }
  function save() { try { sessionStorage.setItem(storageKey, JSON.stringify(order)); } catch { /* Reference is also shown on screen. */ } }
  function showReference(payment) {
    if (!order) return;
    reference.textContent = 'Order: ' + order.order_id + (payment ? ' · Payment: ' + payment : '') + ' · Amount: ₹5';
    reference.hidden = false;
  }
  async function api(path, body) {
    let response;
    try { response = await fetch('/api/support-payments/' + path, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(22000)
    }); } catch { throw new Error('The server could not be reached. Check your connection. If money was debited, check status or contact support before paying again.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error('Payment confirmation is unavailable. Contact support if money was debited.'); }
    if (!response.ok) throw new Error(data.error || 'Payment status could not be confirmed.');
    return data;
  }
  function loadCheckout() {
    if (typeof window.Razorpay === 'function') return Promise.resolve();
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true;
      const timer = setTimeout(() => { script.remove(); reject(new Error('Checkout did not load. Please try again.')); }, 15000);
      script.onload = () => { clearTimeout(timer); typeof window.Razorpay === 'function' ? resolve() : reject(new Error('Checkout is unavailable.')); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Checkout could not load.')); };
      document.head.append(script);
    }).catch(error => { loader = null; throw error; });
    return loader;
  }
  function applyResult(data) {
    showReference(data.payment_id);
    if (data.status === 'verified') { verified = true; uncertain = false; message(data.message, 'success'); }
    else if (data.status === 'pending') { uncertain = true; message(data.message, 'pending'); }
    else if (data.status === 'refunded') { uncertain = true; message(data.message, 'pending'); }
    else if (data.status === 'not_paid') { uncertain = false; message(data.message, 'pending'); }
    else { uncertain = true; throw new Error('Unexpected payment status. Contact support before paying again.'); }
    update();
  }
  async function statusCheck() {
    if (!order || busy) return;
    busy = true; update(); message('Checking the payment with Razorpay…');
    try { applyResult(await api('status', { order_token: order.order_token })); }
    catch (error) { uncertain = true; message(error.message, 'pending'); }
    finally { busy = false; update(); }
  }
  async function verify(proof) {
    busy = true; uncertain = true; update(); message('Verifying your contribution with Razorpay…');
    try { applyResult(await api('verify', { order_token: order.order_token, ...proof })); }
    catch (error) { message(error.message + ' Use “Check payment status” before paying again.', 'pending'); }
    finally { busy = false; update(); }
  }
  consent.addEventListener('change', update);
  check.addEventListener('click', statusCheck);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !live || !consent.checked || verified || uncertain) return;
    busy = true; update(); message('Preparing your one-time ₹5 contribution…');
    try {
      await loadCheckout();
      if (order) {
        const result = await api('status', { order_token: order.order_token });
        if (result.status !== 'not_paid') { applyResult(result); busy = false; update(); return; }
      } else {
        order = await api('create-order', { support_consent: true });
        if (order.mode !== 'live' || !/^rzp_live_[A-Za-z0-9]+$/.test(order.key_id || '') || order.amount !== 500 || order.currency !== 'INR') {
          order = null; throw new Error('Unexpected checkout configuration. No payment was started.');
        }
        save(); showReference();
      }
      let received = false;
      const checkout = new window.Razorpay({
        key: order.key_id, order_id: order.order_id, amount: 500, currency: 'INR',
        name: 'CodeBhavya', description: 'Optional one-time website development support',
        image: location.origin + '/images/codebhavya-icon-192.png', theme: { color: '#071d35' },
        handler: result => { received = true; verify({ razorpay_order_id: result.razorpay_order_id,
          razorpay_payment_id: result.razorpay_payment_id, razorpay_signature: result.razorpay_signature }); },
        modal: { ondismiss: () => {
          if (!received) { busy = false; uncertain = true; update(); message('Checkout closed. Check payment status before retrying, especially if your bank shows a debit.', 'pending'); statusCheck(); }
        } }
      });
      checkout.on('payment.failed', () => message('This attempt failed. You may retry within checkout. If money was debited, close checkout and check the payment status first.', 'pending'));
      message('Checkout is open. This is a real one-time ₹5 payment.'); checkout.open();
    } catch (error) { if (order) uncertain = true; busy = false; update(); message(error.message, 'pending'); }
  });
  async function init() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && saved.mode === 'live' && saved.amount === 500 && /^order_[A-Za-z0-9]+$/.test(saved.order_id || '') && typeof saved.order_token === 'string') {
        order = saved; uncertain = true; showReference();
      }
    } catch { /* Continue without stored state. */ }
    try {
      const config = await api('config'); live = config.enabled === true && config.mode === 'live' && config.amount === 500 && config.currency === 'INR';
      message(live ? 'Select the checkbox to continue with a real one-time ₹5 contribution.' : 'Support payments are not available right now. You can continue learning as usual.');
    } catch (error) { message(error.message, 'pending'); }
    update();
    if (order) await statusCheck();
  }
  init();
})();
