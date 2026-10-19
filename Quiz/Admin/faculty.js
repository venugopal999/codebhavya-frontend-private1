(async () => {
  "use strict";
  const {client, $, requireSession, esc, localDate} = CBQuiz;
  let offset = 0, busy = false;
  function message(text) { $("ownerMessage").textContent = text; }
  function link(url) {
    try { const u = new URL(url); if (u.protocol !== "https:" || !u.hostname || u.username || u.password) return esc(url || "Not supplied"); }
    catch { return esc(url || "Not supplied"); }
    return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
  }
  function actions(status) {
    if (status === "pending") return [["approved","Approve teacher"],["needs_changes","Request more details"],["rejected","Reject application"]];
    if (status === "approved") return [["revoked","Revoke hosting access"]];
    if (["revoked","rejected"].includes(status)) return [["needs_changes","Allow revised application"]];
    return [];
  }
  async function load() {
    const {data, error} = await client.rpc("quiz_owner_requests_v29", {p_status:$("requestFilter").value, p_offset:offset});
    if (error) throw error;
    $("requestCount").textContent = `${data.total} application${data.total === 1 ? "" : "s"}`;
    $("previousRequests").disabled = offset === 0;
    $("nextRequests").disabled = offset + 25 >= data.total;
    $("requestRows").innerHTML = (data.rows || []).map(r => `<article class="review-card" data-user="${esc(r.user_id)}" data-revision="${Number(r.revision)}"><h2>${esc(r.full_name)}</h2><span class="badge">${esc(r.status.replaceAll("_"," "))}</span><dl><dt>Sign-in email</dt><dd>${esc(r.account_email)}</dd><dt>Institution</dt><dd>${esc(r.institution)}</dd><dt>Department</dt><dd>${esc(r.department)}</dd><dt>Designation</dt><dd>${esc(r.designation)}</dd><dt>Work email claim</dt><dd>${esc(r.work_email || "Not supplied")}</dd><dt>Institution website</dt><dd>${link(r.institution_url)}</dd><dt>Staff profile</dt><dd>${link(r.staff_url)}</dd><dt>Other details</dt><dd>${esc(r.verification_notes || "None")}</dd><dt>Updated</dt><dd>${esc(localDate(r.updated_at))}</dd><dt>Last review message</dt><dd>${esc(r.review_message || "None")}</dd></dl>${actions(r.status).length ? `<label>Review message (visible to the teacher)<textarea class="review-message" rows="3" minlength="2" maxlength="1000" placeholder="Explain your decision or the information needed." required></textarea></label><div class="actions">${actions(r.status).map(([decision,label])=>`<button type="button" class="btn ${decision === "approved" ? "gold" : decision === "revoked" ? "danger" : "ghost"}" data-decision="${decision}">${label}</button>`).join("")}</div>` : '<p>Waiting for the teacher to update and resubmit.</p>'}</article>`).join("") || '<p>No applications in this category.</p>';
  }
  async function faculty() {
    const {data, error} = await client.rpc("quiz_admin_faculty_list_v2");
    if (error) throw error;
    $("facultyRows").innerHTML = (data || []).map(r => `<tr><td>${esc(r.display_name || "Faculty")}<br>${esc(r.email)}</td><td>${esc(localDate(r.created_at))}</td><td>${r.is_site_owner ? '<span class="badge">Site owner</span>' : `<button type="button" class="btn danger" data-remove="${esc(r.user_id)}">Remove hosting access</button>`}</td></tr>`).join("") || '<tr><td colspan="3">No faculty accounts.</td></tr>';
  }
  async function refresh() { await load(); await faculty(); }
  async function run(action, successMessage = "Applications refreshed.") {
    if (busy) return;
    busy = true;
    $("ownerContent").setAttribute("aria-busy", "true");
    $("ownerContent").querySelectorAll("button,select").forEach(el => el.disabled = true);
    try { await action(); message(successMessage); }
    catch (e) { message(e.message || "Unable to complete the action. Refresh and try again."); }
    finally {
      busy = false;
      $("ownerContent").removeAttribute("aria-busy");
      $("ownerContent").querySelectorAll("button,select").forEach(el => el.disabled = false);
      try { await refresh(); } catch (e) { message(e.message || "Unable to refresh."); }
    }
  }
  try {
    await requireSession();
    const {data, error} = await client.rpc("quiz_is_site_owner_v29");
    if (error) throw error;
    if (data !== true) { message("Only the CodeBhavya site owner can review applications or manage faculty access. You can continue using your faculty dashboard if hosting access is active."); return; }
    await refresh(); $("ownerContent").hidden = false; message("");
    $("refreshRequests").onclick = () => run(async()=>{});
    $("requestFilter").onchange = () => { offset=0; run(async()=>{}); };
    $("previousRequests").onclick = () => { offset=Math.max(0,offset-25); run(async()=>{}); };
    $("nextRequests").onclick = () => { offset+=25; run(async()=>{}); };
    $("requestRows").addEventListener("click", event => {
      const button = event.target.closest("button[data-decision]");
      if (!button || busy) return;
      const card = button.closest(".review-card"), input = card.querySelector("textarea");
      if (input.value.trim().length < 2) { input.focus(); message("Enter a review message before making a decision."); return; }
      if (button.dataset.decision === "approved" && !confirm("Have you independently verified this applicant’s teaching identity? Approve quiz-hosting access for this account?")) return;
      if (button.dataset.decision === "revoked" && !confirm("Revoke this teacher’s hosting access? Their existing quiz data will be retained.")) return;
      const args = {p_user_id:card.dataset.user,p_revision:Number(card.dataset.revision),p_decision:button.dataset.decision,p_message:input.value.trim()};
      run(async()=>{ const {error} = await client.rpc("quiz_owner_review_v29", args); if (error) throw error; }, "Saved. The teacher can check their updated status on Teacher Access.");
    });
    $("facultyRows").addEventListener("click", event => {
      const button = event.target.closest("button[data-remove]");
      if (!button || busy || !confirm("Remove this account’s quiz-hosting access? Quiz data will be retained.")) return;
      run(async()=>{ const {error} = await client.rpc("quiz_admin_remove_faculty_v2", {p_user_id:button.dataset.remove}); if (error) throw error; }, "Saved. The teacher can check their updated status on Teacher Access.");
    });
  } catch (e) { if (e.message !== "Authentication required") message(e.message || "Unable to load teacher review. Check the database setup."); }
})();
