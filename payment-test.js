(() => {
  'use strict';
  const form = document.getElementById('testForm');
  const consent = document.getElementById('testConsent');
  const pay = document.getElementById('payTest');
  const check = document.getElementById('checkStatus');
  const status = document.getElementById('testStatus');
  const reference = document.getElementById('testReference');
  let busy = false;
  let proof = null;
  let checkoutLoaded = null;
  function message(text, state = '') { status.textContent = text; status.dataset.state = state; }
  function setBusy(value) {
    busy = value; pay.disabled = value || !consent.checked; check.disabled = value; consent.disabled = value;
    form.setAttribute('aria-busy', String(value));
  }
  async function api(path, body) {
    let response;
    try {
      response = await fetch('/api/test-payments/' + path, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        signal: AbortSignal.timeout(22000)
      });
    } catch { throw new Error('The server could not be reached. Check your connection and try again.'); }
    let data;
    try { data = await response.json(); }
    catch { throw new Error('The payment server is not ready. Confirm the Worker update deployed successfully.'); }
    if (!response.ok) throw new Error(data.error || 'The test request could not complete.');
    return data;
  }
  function loadCheckout() {
    if (typeof window.Razorpay === 'function') return Promise.resolve();
    if (checkoutLoaded) return checkoutLoaded;
    checkoutLoaded = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      const timer = setTimeout(() => { script.remove(); reject(new Error('Razorpay checkout did not load. Check your connection and try again.')); }, 15000);
      script.onload = () => {
        clearTimeout(timer);
        if (typeof window.Razorpay === 'function') resolve();
        else reject(new Error('Razorpay checkout is unavailable.'));
      };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Razorpay checkout could not load.')); };
      document.head.append(script);
    }).catch(error => { checkoutLoaded = null; throw error; });
    return checkoutLoaded;
  }
  async function verify() {
    if (!proof || busy) return;
    setBusy(true); check.hidden = true;
    message('Verifying the test payment with the server…');
    try {
      const data = await api('verify', proof);
      if (data.status === 'verified') {
        message(data.message, 'success');
        reference.textContent = 'Verified test reference: ' + data.payment_id;
        reference.hidden = false; proof = null;
      } else if (data.status === 'pending') {
        message(data.message, 'pending'); check.hidden = false;
      } else { message(data.message || 'The test payment did not complete.', 'error'); proof = null; }
    } catch (error) {
      message('Verification is unresolved. ' + error.message + ' Check this payment again before starting another test.', 'pending');
      check.hidden = false;
    } finally { setBusy(false); }
  }
  consent.addEventListener('change', () => {
    if (!busy) pay.disabled = !consent.checked;
    if (!proof) message(consent.checked ? 'Ready for a simulated ₹5 checkout.' : 'Select the checkbox to begin.');
  });
  check.addEventListener('click', verify);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !consent.checked) return;
    if (proof) { message('A previous test is awaiting verification. Use “Check payment status again” first.', 'pending'); return; }
    setBusy(true); check.hidden = true; reference.hidden = true;
    message('Preparing Razorpay Test Mode checkout…');
    try {
      await loadCheckout();
      const order = await api('create-order', { test_consent: true });
      if (order.mode !== 'test' || !/^rzp_test_/.test(order.key_id) || order.amount !== 500 || order.currency !== 'INR')
        throw new Error('This is not the expected ₹5 test checkout.');
      let paymentReceived = false;
      const checkout = new window.Razorpay({
        key: order.key_id, order_id: order.order_id, amount: order.amount, currency: order.currency,
        name: 'CodeBhavya', description: 'INR 5 simulated test — no paid benefit',
        image: location.origin + '/images/codebhavya-icon-192.png', theme: { color: '#071d35' },
        handler: response => {
          paymentReceived = true;
          proof = { order_token: order.order_token, razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature };
          setBusy(false); verify();
        },
        modal: { ondismiss: () => {
          if (!paymentReceived) { setBusy(false); message('Test checkout closed. No successful payment was confirmed.'); }
        } }
      });
      checkout.on('payment.failed', () => {
        message('The simulated payment failed. You can retry in checkout or close it. No successful payment was confirmed.', 'error');
      });
      message('Test checkout is open. Complete a simulated payment or close it.');
      checkout.open();
    } catch (error) { setBusy(false); message(error.message, 'error'); }
  });
})();
