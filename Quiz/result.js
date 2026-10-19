(async()=>{
  const {client,$,requireSession,esc,fmtDuration,toast,enterFullscreen,edgeErrorMessage}=CBQuiz;
  try{await requireSession()}catch{return}
  const attempt=new URLSearchParams(location.search).get("attempt");
  let channel=null,poll=null,lastQuizId=null;

  function summaryHtml(data){
    return `<div class="result-summary-grid">
      <div class="summary-box"><strong>${data.total_questions ?? 0}</strong><span>Total Questions</span></div>
      <div class="summary-box"><strong>${data.answered_count ?? 0}</strong><span>Answered</span></div>
      <div class="summary-box"><strong>${data.unanswered_count ?? 0}</strong><span>Unanswered</span></div>
      <div class="summary-box"><strong>${fmtDuration(data.duration_seconds)}</strong><span>Time Used</span></div>
    </div>`;
  }

  function scoreHtml(data,programOutcomes=[]){
    if(!data.can_show_score) return "";
    const pct=Number(data.percentage||0).toFixed(1);
    const partial=(programOutcomes||[]).filter(x=>x.status==='judged'&&Number(x.passed)>0&&Number(x.total)>Number(x.passed)&&Number(x.marks_awarded)>0&&Number(x.marks_awarded)<Number(x.marks)).length;
    const wrong=Math.max(0,Number(data.wrong_count||0)-partial);
    return `<div class="result-score">${data.score}/${data.max_score}</div>
      <p><strong>${pct}%</strong> · ${data.correct_count ?? 0} correct · ${partial} partial credit · ${wrong} wrong · ${data.unanswered_count ?? 0} unanswered</p>`;
  }
  function programSummaryHtml(outcomes){
    if(!outcomes?.length)return '';
    return `<section class="program-result-summary"><h2>Programming questions</h2>${outcomes.map(x=>{
      const graded=x.status==='judged'&&Number(x.total)>0;
      const label=!graded?'Not submitted':Number(x.passed)===Number(x.total)?'Correct':Number(x.passed)>0&&Number(x.marks_awarded)>0?'Partial credit':'Wrong';
      return `<div><strong>Q${esc(x.position)} · ${x.programming_language==='python3'?'Python 3':x.programming_language==='cpp17'?'C++17':x.programming_language==='java13'?'Java (OpenJDK 13)':x.programming_language==='nodejs12'?'JavaScript (Node.js 12)':x.programming_language==='go113'?'Go (1.13)':'C'} · ${esc(label)}</strong><span>${graded?`${Number(x.passed)} / ${Number(x.total)} tests passed · `:''}${Number(x.marks_awarded||0)} / ${Number(x.marks||0)} marks</span></div>`;
    }).join('')}</section>`;
  }

  function stars(n){
    n=Number(n||0);
    return `<span class="saved-stars">${[1,2,3,4,5].map(i=>`<span class="${i<=n?"on":""}">★</span>`).join("")}</span>`;
  }

  function savedFeedbackHtml(data){
    const f=data.feedback;
    if(!f) return "";
    return `<section class="feedback-card saved-feedback-card">
      <h2>Your Submitted Feedback</h2>
      <div class="saved-feedback-grid">
        <div><strong>Quiz UI / Ease of Use</strong>${stars(f.ui_rating)}<span>${f.ui_rating}/5</span></div>
        <div><strong>Question Quality</strong>${stars(f.question_rating)}<span>${f.question_rating}/5</span></div>
        <div><strong>Overall Experience</strong>${stars(f.overall_rating)}<span>${f.overall_rating}/5</span></div>
        <div><strong>Difficulty</strong><span class="feedback-value">${esc((f.difficulty||"—").replaceAll("_"," "))}</span></div>
      </div>
      ${f.comment ? `<div class="saved-comment"><strong>Your suggestion</strong><p>${esc(f.comment)}</p></div>` : ""}
      <div class="feedback-thanks"><strong>Thank you.</strong> Your saved feedback is shown above exactly as submitted.</div>
    </section>`;
  }

  async function showMandatoryFeedback(data){
    // Safety fallback only: normal v5 flow collects feedback before leaving quiz.html.
    if(!document.fullscreenElement){
      $("resultBox").innerHTML=`
        <div class="fs-lock-icon">★</div>
        <h1>Complete Quiz Feedback</h1>
        <p>Your quiz is already submitted, but classroom feedback is still pending.</p>
        <div class="notice warn">Feedback must be completed in full-screen mode.</div>
        <button class="btn teal" id="enterFeedbackFs">Enter Full Screen</button>`;
      $("enterFeedbackFs").onclick=async()=>{
        const ok=await enterFullscreen();
        if(ok) loadResult();
      };
      return;
    }

    $("resultBox").innerHTML=`
      <h1>Quick Quiz Feedback</h1>
      <p>This feedback does not affect your score.</p>
      <div id="fallbackRatings"></div>
      <label>Difficulty</label>
      <select id="fbDiff">
        <option value="">Select difficulty</option><option value="very_easy">Very Easy</option>
        <option value="easy">Easy</option><option value="balanced">Balanced</option>
        <option value="hard">Hard</option><option value="very_hard">Very Hard</option>
      </select>
      <label>Any issue or suggestion? <span class="muted">(optional)</span></label>
      <textarea id="fbComment" maxlength="1000"></textarea>
      <div class="actions" style="justify-content:center"><button class="btn teal" id="fbSave">Submit Feedback</button></div>`;

    const vals={ui:0,questions:0,overall:0};
    const rows=[["ui","Quiz UI / Ease of Use"],["questions","Question Quality"],["overall","Overall Quiz Experience"]];
    $("fallbackRatings").innerHTML=rows.map(([key,label])=>`<div class="rating-row"><strong>${label}</strong><div class="star-rating" data-rating="${key}">${[1,2,3,4,5].map(n=>`<button type="button" data-value="${n}">★</button>`).join("")}</div></div>`).join("");
    document.querySelectorAll(".star-rating").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      vals[g.dataset.rating]=Number(b.dataset.value);
      g.querySelectorAll("button").forEach(x=>x.classList.toggle("active",Number(x.dataset.value)<=vals[g.dataset.rating]));
    }));
    $("fbSave").onclick=async()=>{
      if(!vals.ui||!vals.questions||!vals.overall||!$("fbDiff").value){toast("Complete all ratings and difficulty.","error");return}
      const {error}=await client.rpc("quiz_submit_feedback_v4",{
        p_attempt_id:attempt,p_ui_rating:vals.ui,p_question_rating:vals.questions,p_overall_rating:vals.overall,
        p_difficulty:$("fbDiff").value,p_comment:$("fbComment").value.trim()||null
      });
      if(error){toast(error.message,"error");return}
      try{if(document.fullscreenElement) await document.exitFullscreen()}catch(e){}
      loadResult();
    };
  }

  function renderResult(data,programOutcomes=[]){
    if(!data.feedback_submitted){
      showMandatoryFeedback(data);
      return;
    }

    const scoreBlock=data.can_show_score
      ? `<span class="badge ${data.quiz_status==="closed"?"closed":"live"}">${esc(data.quiz_status)}</span>
         <h1>${esc(data.title)}</h1><p class="muted">Quiz completed successfully</p>${scoreHtml(data,programOutcomes)}`
      : `<h1>Quiz Submitted Successfully</h1><p>Your responses and feedback have been saved.</p>`;

    let release="";
    if(!data.can_show_score){
      release=data.programming_grading_pending
        ? `<div class="notice warn"><span class="pulse"></span> Your programming submission is still being judged. The final score will appear when judging finishes.</div>${(data.programming_retry||[]).length?'<button type="button" class="btn teal" id="retryProgram">Retry programming judging</button>':''}`
        : data.release_mode==="faculty_only"
        ? `<div class="notice">Your faculty has chosen not to release scores on the student page.</div>`
        : `<div class="notice warn"><span class="pulse"></span> Waiting for faculty to close the quiz and release the score…</div>`;
    }

    $("resultBox").innerHTML=`
      ${scoreBlock}
      ${summaryHtml(data)}
      ${data.can_show_score?programSummaryHtml(programOutcomes):''}
      ${release}
      <p class="muted">Submitted: ${data.submitted_at ? esc(new Date(data.submitted_at).toLocaleString()) : "—"}</p>
      <div class="actions" style="justify-content:center">
        ${!data.can_show_score && data.release_mode!=="faculty_only" ? '<button class="btn ghost" id="checkResult">Check Result Now</button>' : ""}
        <a class="btn primary" href="./">Quiz Home</a>
        ${data.can_show_score && data.quiz_status==="closed" ? `<a class="btn ghost" href="print.html?attempt=${encodeURIComponent(attempt)}">Print / Save PDF</a>` : ""}
      </div>
      ${savedFeedbackHtml(data)}
    `;
    $("checkResult")?.addEventListener("click",loadResult);
    $("retryProgram")?.addEventListener("click",async()=>{const button=$("retryProgram");button.disabled=true;button.textContent="Retrying…";for(const item of data.programming_retry||[]){const {data:judged,error}=await client.functions.invoke('quiz-programming-v19',{body:{attempt_id:attempt,question_id:item.question_id,code:item.code,mode:'submit'}});if(error||judged?.error){toast(await edgeErrorMessage(error,judged),'error');break}}await loadResult();});
  }

  async function loadResult(){
    const {data,error}=await client.rpc("quiz_my_result_v5",{p_attempt_id:attempt});
    if(error){$("resultBox").innerHTML=`<div class="notice bad">${esc(error.message)}</div>`;return}
    const outcomes=data.can_show_score?await client.rpc('quiz_program_outcomes_v19_5',{p_attempt_id:attempt}):{data:[]};
    lastQuizId=data.quiz_id;
    renderResult(data,outcomes.data||[]);

    if(!data.feedback_submitted){
      clearInterval(poll); poll=null; return;
    }
    if(data.can_show_score || (data.release_mode==="faculty_only" && !data.programming_grading_pending)){
      clearInterval(poll); poll=null;
    }else if(!poll){
      poll=setInterval(loadResult,2500);
    }
  }

  await loadResult();
  if(lastQuizId){
    channel=client.channel(`quiz-result-${lastQuizId}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"quizzes",filter:`id=eq.${lastQuizId}`},loadResult)
      .subscribe();
  }
})();
