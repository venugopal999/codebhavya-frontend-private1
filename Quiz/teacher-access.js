(async () => {
  "use strict";
  const {client, $, requireSession, esc, localDate} = CBQuiz;
  const labels = {pending:"Application under review", needs_changes:"More details requested", approved:"Teacher access approved", rejected:"Application not approved", revoked:"Teacher access revoked"};
  let current = null;
  function message(text) { $("applicationMessage").textContent = text; }
  function render(data) {
    const app = data.application;
    current = app;
    $("applicationStatus").replaceChildren();
    if (data.hosting_access) {
      $("applicationStatus").innerHTML = '<div class="application-state"><h2>Quiz-hosting access is active</h2><p>You can create and manage your classroom quizzes.</p><a class="btn gold" href="/Quiz/Admin/">Open faculty dashboard</a></div>';
      if (data.site_owner) $("applicationStatus").insertAdjacentHTML("beforeend", '<p><a href="/Quiz/Admin/faculty.html">Review teacher applications</a></p>');
      $("applicationContent").hidden = true;
      return;
    }
    $("applicationContent").hidden = app?.status === "revoked" || app?.status === "approved";
    if (app) {
      $("applicationStatus").innerHTML = `<div class="application-state"><h2>${esc(labels[app.status] || "Application status")}</h2><p>Last updated: ${esc(localDate(app.updated_at))}</p><p>${esc(app.review_message || "Your application has been received. Check this page for review updates.")}</p></div>`;
      for (const name of ["full_name","institution","department","designation","work_email","institution_url","staff_url","verification_notes"]) {
        $("teacherForm").elements.namedItem(name).value = app[name] || "";
      }
      $("formHeading").textContent = "Your teacher application";
      $("submitApplication").textContent = app.status === "pending" ? "Update application" : "Resubmit for review";
      if (app.status === "approved") $("applicationStatus").insertAdjacentHTML("beforeend", '<p>Hosting is not active for this account. Contact the site owner.</p>');
    } else $("applicationStatus").textContent = "Complete the application below to request teacher access.";
  }
  async function load() {
    message("");
    const {data, error} = await client.rpc("quiz_teacher_status_v29");
    if (error) throw error;
    render(data);
  }
  try {
    const s = await requireSession();
    $("accountEmail").textContent = s.user.email || "Your CodeBhavya account";
    $("refreshApplication").onclick = async () => { try { await load(); } catch (e) { message(e.message || "Unable to refresh. Please try again."); } };
    $("teacherForm").onsubmit = async event => {
      event.preventDefault();
      if (!$("teacherForm").reportValidity()) return;
      if (current?.status === "revoked") return;
      const p_details = Object.fromEntries(new FormData($("teacherForm")));
      p_details.declaration = $("teacherDeclaration").checked;
      for (const key of ["institution_url", "staff_url"]) {
        if (!p_details[key]) continue;
        try { const url = new URL(p_details[key].trim()); if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error(); }
        catch { message("Use an HTTPS institution/profile link without a username or password."); return; }
      }
      $("applicationFields").disabled = true;
      message("Submitting your application…");
      try {
        const {data, error} = await client.rpc("quiz_teacher_apply_v29", {p_details});
        if (error) throw error;
        render(data);
        message("Application saved for manual review. Hosting access is not yet enabled.");
        $("teacherDeclaration").checked = false;
      } catch (e) { message(e.message || "Unable to submit. Your details remain here so you can retry."); }
      finally { $("applicationFields").disabled = false; }
    };
    await load();
  } catch (e) {
    if (e.message !== "Authentication required") {
      $("applicationStatus").textContent = "Teacher applications are temporarily unavailable. Please try again later or contact CodeBhavya.";
      message(e.message || "Unable to load teacher access.");
    }
  }
})();
