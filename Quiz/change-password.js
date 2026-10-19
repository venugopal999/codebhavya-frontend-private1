(() => {
  "use strict";
  const client = window.CBQuiz?.client;
  const form = document.getElementById("changePasswordForm");
  const message = document.getElementById("changePasswordMessage");
  const account = document.getElementById("accountEmail");
  const current = document.getElementById("currentPassword");
  const next = document.getElementById("newPassword");
  const confirm = document.getElementById("confirmPassword");
  const code = document.getElementById("verificationCode");
  const step = document.getElementById("verificationStep");
  const save = document.getElementById("changePasswordButton");
  const send = document.getElementById("sendVerificationCode");
  let verifiedUserId = null;
  let finished = false;

  function show(text, bad = false) {
    message.replaceChildren();
    const notice = document.createElement("div");
    notice.className = "notice" + (bad ? " bad" : "");
    notice.textContent = text;
    message.append(notice);
  }

  async function getAccount() {
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user) throw new Error("Your session has ended. Sign in again to change your password.");
    if (verifiedUserId && verifiedUserId !== data.user.id) throw new Error("Your signed-in account changed. Reload this page before updating a password.");
    return data.user;
  }

  async function start() {
    if (!client) { account.textContent = "Account service is unavailable."; return; }
    try {
      // getUser verifies the account with the server, rather than trusting local storage.
      const user = await getAccount();
      verifiedUserId = user.id;
      account.textContent = `Signed in as ${user.email || "your CodeBhavya account"}`;
      form.hidden = false;
    } catch (_) {
      account.textContent = "Sign in to change your password.";
      show("Your session has ended. Sign in again, or reset your password by email.", true);
      const link = document.createElement("a");
      link.href = "signin.html?return=%2FQuiz%2Fchange-password.html";
      link.className = "btn ghost";
      link.textContent = "Sign in";
      message.append(link);
    }
  }

  send.addEventListener("click", async () => {
    send.disabled = true;
    try {
      await getAccount();
      const { error } = await client.auth.reauthenticate();
      if (error) throw error;
      show("Verification code sent. Enter the code from your email, then select Change Password.");
      code.focus();
    } catch (error) {
      show(error?.message || "Could not send the code. Try again.", true);
    } finally { send.disabled = false; }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (finished || !form.reportValidity()) return;
    if (next.value !== confirm.value) {
      show("The new passwords do not match.", true);
      confirm.focus();
      return;
    }
    if (next.value === current.value) {
      show("Choose a password different from your current password.", true);
      next.focus();
      return;
    }
    if (!step.hidden && !code.value.trim()) {
      show("Enter the email verification code first.", true);
      code.focus();
      return;
    }
    save.disabled = true;
    show("Updating your password…");
    try {
      await getAccount();
      const attributes = { password: next.value, current_password: current.value };
      if (code.value.trim()) attributes.nonce = code.value.trim();
      const { error } = await client.auth.updateUser(attributes);
      if (error?.code === "reauthentication_needed") {
        step.hidden = false;
        show("Email verification is required. Select Email verification code, then enter the code and try again.", true);
        return;
      }
      if (error) throw error;
      finished = true;
      form.hidden = true;
      current.value = next.value = confirm.value = code.value = "";
      // A shared browser should not remain logged in after changing its password.
      let signedOut = false;
      try {
        const result = await client.auth.signOut();
        signedOut = !result.error;
      } catch (_) { /* Try a local sign-out below. */ }
      if (!signedOut) {
        try { const result = await client.auth.signOut({ scope: "local" }); signedOut = !result.error; }
        catch (_) { /* Keep the sign-out warning visible below. */ }
      }
      if (signedOut) {
        try {
          sessionStorage.removeItem("codebhavya-placement-tab-auth-v1");
          sessionStorage.removeItem("codebhavya:placement:last-activity");
          sessionStorage.removeItem("cb_quiz_join");
        } catch (_) { /* Password was updated successfully. */ }
        try {
          const prefixes = ["codebhavya-placement-", "codebhavya-interview-", "codebhavya-mcq-revision-", "codebhavya-mock-", "codebhavya-full-", "codebhavya-solve-timer-"];
          for (let index = localStorage.length - 1; index >= 0; index--) {
            const key = localStorage.key(index);
            if (key && (prefixes.some(prefix => key.startsWith(prefix)) || /^codebhavya-[a-z0-9_-]+-draft:/.test(key))) {
              localStorage.removeItem(key);
            }
          }
        } catch (_) { /* Password was updated successfully. */ }
        show("Password changed. You have been signed out of this browser. Sign in with your new password.");
      } else {
        show("Password changed, but automatic sign-out failed. Select Sign out on the Quiz dashboard before leaving this device.", true);
      }
      const link = document.createElement("a");
      link.href = signedOut ? "signin.html" : "./";
      link.className = "btn ghost";
      link.textContent = signedOut ? "Sign in" : "Open Quiz dashboard to sign out";
      message.append(link);
    } catch (error) {
      show(error?.message || "Could not change your password. Try again.", true);
    } finally { save.disabled = false; }
  });
  start();
})();
