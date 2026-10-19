(async()=>{
  const {client,$,requireAdmin,esc,fmtDuration,localDate}=CBQuiz;
  try{await requireAdmin()}catch{return}
  const attempt=new URLSearchParams(location.search).get("attempt");
  if(!attempt){$("studentSummary").innerHTML='<div class="notice bad">Attempt ID missing.</div>';return}

  const {data,error}=await client.rpc("quiz_admin_attempt_detail_v5",{p_attempt_id:attempt});
  if(error){$("studentSummary").innerHTML=`<div class="notice bad">${esc(error.message)}</div>`;return}

  const qs=data.questions||[];
  const {data:programOutcomes,error:outcomeError}=await client.rpc('quiz_program_outcomes_v19_5',{p_attempt_id:attempt});
  const byQuestion=new Map((programOutcomes||[]).map(x=>[x.question_id,x]));
  const isPartial=q=>q.question_type==='programming_c'&&q.is_correct===false&&Number(q.marks_awarded)>0&&Number(q.marks_awarded)<Number(q.marks);
  const resultClass=q=>isPartial(q)?'partial':q.status_class;
  const resultLabel=q=>isPartial(q)?'Partial credit':q.is_correct===true?'Correct':q.is_correct===false?'Wrong':'Unanswered';
  const testProgress=q=>{const x=byQuestion.get(q.question_id);return x?.status==='judged'&&Number(x.total)>0?`${Number(x.passed)} / ${Number(x.total)} tests passed`:''};
  const questionType=q=>q.question_type==='programming_c'?`${q.programming_language==='python3'?'Python 3':q.programming_language==='cpp17'?'C++17':q.programming_language==='java13'?'Java (OpenJDK 13)':q.programming_language==='nodejs12'?'JavaScript (Node.js 12)':q.programming_language==='go113'?'Go (1.13)':'C'} programming`:(q.question_type||'single_mcq').replaceAll('_',' ');
  const partialCount=qs.filter(isPartial).length;
  $("studentSummary").innerHTML=`
    <div class="student-result-head">
      <div><span class="badge ${data.status==="submitted"?"closed":"waiting"}">${esc(data.status)}</span>
      <h1>${esc(data.student_label)}</h1>
      <p class="muted">${esc(data.quiz_title)}</p></div>
      <a class="btn ghost" href="results.html?id=${encodeURIComponent(data.quiz_id)}">Back to Quiz Results</a>
    </div>

    <div class="student-score-grid">
      <div class="student-score-main"><span>Score</span><strong>${data.programming_grading_pending?"Judging in progress":`${data.score ?? 0} / ${data.max_score}`}</strong></div>
      <div><span>Percentage</span><strong>${data.programming_grading_pending?"—":`${Number(data.percentage||0).toFixed(1)}%`}</strong></div>
      <div><span>Time Used</span><strong>${fmtDuration(data.duration_seconds)}</strong></div>
      <div><span>Correct</span><strong>${data.correct_count}</strong></div>
      <div><span>Wrong</span><strong>${Math.max(0,Number(data.wrong_count||0)-partialCount)}</strong></div>
      ${partialCount?`<div><span>Partial credit</span><strong>${partialCount}</strong></div>`:''}
      <div><span>Unanswered</span><strong>${data.unanswered_count}</strong></div>
      <div><span>Full-screen Warnings</span><strong>${data.fullscreen_exit_count} / 3</strong></div><div><span>Tab/Window/Copy Warnings</span><strong>${data.focus_exit_count} / ${data.focus_warning_limit}</strong></div>
    </div>

    <h2>Question-wise Result</h2>
    <div class="answer-status-grid">
      ${qs.map((q,i)=>`<button class="answer-status ${resultClass(q)}" data-i="${i}">
        <span>Q${i+1}</span><strong>${isPartial(q)?'½':q.is_correct===true?"✓":q.is_correct===false?"✗":"—"}</strong>
      </button>`).join("")}
    </div>

    <div class="tablewrap"><table class="table question-result-table">
      <thead><tr><th>#</th><th>Question</th><th>Student Answer</th><th>Correct Answer</th><th>Result</th><th>Marks</th><th>Time</th></tr></thead>
      <tbody>${qs.map((q,i)=>`<tr class="clickable-result-row" data-i="${i}">
        <td>Q${i+1}</td><td>${q.image_url?`<img class="result-question-thumb" src="${esc(q.image_url)}" alt="">`:""}${esc(q.question_text)}<br><span class="muted">${esc(questionType(q))}${q.topic?` · ${esc(q.topic)}`:""} · ${esc(q.difficulty||"Medium")}${q.question_type==="multiple_mcq"?` · ${esc(q.multiple_scoring_mode||"exact")} scoring`:""}</span></td>
        <td>${q.question_type==="programming_c"?`<pre class="result-program-code">${esc(q.student_answer||"Not answered")}</pre>`:esc(q.student_answer||"Not answered")}</td>
        <td>${esc(q.correct_answer||"—")}</td>
        <td><span class="result-pill ${resultClass(q)}">${resultLabel(q)}</span>${testProgress(q)?`<br><small>${esc(testProgress(q))}</small>`:''}</td>
        <td>${q.marks_awarded ?? 0}/${q.marks}</td><td>${fmtDuration(q.time_spent_seconds||0)}</td>
      </tr>`).join("")}</tbody>
    </table></div>

    <p class="muted">Submitted: ${esc(localDate(data.submitted_at))}</p>${outcomeError&&qs.some(q=>q.question_type==='programming_c')?'<div class="notice warn">Programming test counts are unavailable. Apply the v20 SQL update to show them.</div>':''}`;

  function showQuestion(i){
    const q=qs[i];
    $("questionDetailPanel").hidden=false;
    $("questionDetailPanel").innerHTML=`
      <div class="qmeta"><span>Question ${i+1} of ${qs.length}</span><span>${q.marks} mark${q.marks===1?"":"s"} · ${fmtDuration(q.time_spent_seconds||0)}</span></div>
      <h2>${esc(q.question_text)}</h2>${q.image_url?`<figure class="quiz-question-image"><img src="${esc(q.image_url)}" alt="Question illustration"></figure>`:""}
      <div class="student-answer-detail">
        <div class="answer-detail-box ${resultClass(q)}">
          <span>Student Answer</span>
          ${q.question_type==="programming_c"?`<pre class="result-program-code">${esc(q.student_answer||"Not answered")}</pre>${testProgress(q)?`<p>${esc(testProgress(q))}</p>`:''}`:`<strong>${esc(q.student_answer||"Not answered")}</strong>`}
        </div>
        <div class="answer-detail-box correct">
          <span>Correct Answer</span>
          <strong>${esc(q.correct_answer||"—")}</strong>
        </div>
      </div>
      <div class="notice ${q.is_correct===true?"":"warn"}">
        ${q.is_correct===true
          ? `Correct answer. Marks awarded: ${q.marks_awarded ?? q.marks}/${q.marks}.`
          : isPartial(q)
            ? `Partial credit. Marks awarded: ${q.marks_awarded}/${q.marks}.${testProgress(q)?` ${esc(testProgress(q))}.`:''}`
          : q.is_correct===false
            ? `Wrong answer. Marks awarded: ${q.marks_awarded ?? 0}/${q.marks}.`
            : `This question was not answered. Marks awarded: 0/${q.marks}.`}
      </div>`;
    $("questionDetailPanel").scrollIntoView({behavior:"smooth",block:"start"});
  }

  document.querySelectorAll(".answer-status,.clickable-result-row").forEach(el=>{
    el.addEventListener("click",()=>showQuestion(Number(el.dataset.i)));
  });

  if(qs.length) showQuestion(0);
})();
