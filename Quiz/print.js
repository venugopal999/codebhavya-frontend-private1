(async () => {
  'use strict';
  const { client, requireSession, esc, fmtDuration } = CBQuiz;
  let session;
  try { session = await requireSession(); } catch { return; }

  const target = document.getElementById('printContent');
  const printButton = document.getElementById('printQuiz');
  const attempt = new URLSearchParams(location.search).get('attempt');
  if (!attempt) {
    target.textContent = 'No quiz attempt was selected. Open a submitted quiz from your history.';
    return;
  }

  const { data, error } = await client.rpc('quiz_student_print_v17', { p_attempt_id: attempt });
  if (error || !data || !Array.isArray(data.questions)) {
    target.innerHTML = `<h1>Quiz review unavailable</h1><p>${esc(error?.message || 'Could not load the quiz review.')}</p><p><a href="./">Back to Quiz History</a></p>`;
    return;
  }
  const { data: programOutcomes } = await client.rpc('quiz_program_outcomes_v19_5', { p_attempt_id: attempt });
  const byPosition = new Map((programOutcomes || []).map(x => [Number(x.position), x]));
  const isPartial = q => q.question_type === 'programming_c' && q.is_correct === false && Number(q.marks_awarded) > 0 && Number(q.marks_awarded) < Number(q.marks);
  const partialCount = data.questions.filter(isPartial).length;

  function safeImage(raw) {
    try {
      const url = new URL(raw, location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null;
    } catch { return null; }
  }

  function number(value) { return Number(value || 0).toFixed(1); }
  const date = data.submitted_at ? new Date(data.submitted_at).toLocaleString() : '—';
  target.removeAttribute('role');
  target.innerHTML = `
    <div class="review-head">
      <div class="review-brand">Code<span>Bhavya</span> <small>QUIZ ARENA</small></div>
      <h1>${esc(data.title)}</h1>
      <p class="review-subtitle">Student quiz review · ${esc(data.course || 'Classroom quiz')}</p>
      <div class="review-meta"><span><strong>Student:</strong> ${esc(session.user.email || '—')}</span>
        <span><strong>Submitted:</strong> ${esc(date)}</span></div>
    </div>
    <div class="review-summary">
      <div><strong>${number(data.score)} / ${number(data.max_score)}</strong><span>Score</span></div>
      <div><strong>${number(data.percentage)}%</strong><span>Percentage</span></div>
      <div><strong>${esc(data.correct_count ?? 0)} / ${esc(data.total_questions ?? 0)}</strong><span>Correct / Questions</span></div>
      <div><strong>${esc(fmtDuration(data.duration_seconds))}</strong><span>Time used</span></div>
    </div>
    <div class="review-counts">Answered: ${esc(data.answered_count ?? 0)} · Partial credit: ${partialCount} · Wrong: ${Math.max(0,Number(data.wrong_count||0)-partialCount)} · Unanswered: ${esc(data.unanswered_count ?? 0)}</div>
    <h2 class="review-section-title">Questions and answers</h2>
    ${data.questions.map((q, index) => {
      const image = q.image_url && safeImage(q.image_url);
      const outcome = isPartial(q) ? 'Partial credit' : q.is_correct === true ? 'Correct' : q.is_correct === false ? 'Incorrect' : 'Unanswered';
      const c = byPosition.get(Number(q.position));
      const tests = q.question_type === 'programming_c' && c?.status === 'judged' && Number(c.total) > 0 ? `${Number(c.passed)} / ${Number(c.total)} tests passed` : '';
      return `<section class="review-question">
        <div class="review-question-head"><span>Question ${index + 1}${q.question_type==='programming_c'?` · ${q.programming_language==='python3'?'Python 3':q.programming_language==='cpp17'?'C++17':q.programming_language==='java13'?'Java (OpenJDK 13)':q.programming_language==='nodejs12'?'JavaScript (Node.js 12)':q.programming_language==='go113'?'Go (1.13)':'C'}`:''}</span><span>${esc(outcome)} · ${number(q.marks_awarded)} / ${number(q.marks)} marks${tests?` · ${esc(tests)}`:''}</span></div>
        <h3>${esc(q.question_text)}</h3>
        ${image ? `<img class="review-question-image" src="${esc(image)}" alt="Question illustration">` : ''}
        ${Array.isArray(q.options) && q.question_type!=='programming_c' ? `<ol class="review-options" type="A">${q.options.map(o => `<li class="${o.correct ? 'correct-option' : ''}">${esc(o.text)}${o.selected ? ' <strong>(Your choice)</strong>' : ''}${o.correct ? ' <strong>(Correct)</strong>' : ''}</li>`).join('')}</ol>` : ''}
        <div class="review-answers"><p><strong>Your response:</strong> ${q.question_type==='programming_c'?`<pre class="review-program-code">${esc(q.student_answer || 'Not answered')}</pre>`:esc(q.student_answer || 'Not answered')}</p>
          <p><strong>Correct answer:</strong> ${esc(q.correct_answer || '—')}</p></div>
      </section>`;
    }).join('')}
    <footer class="review-footer">CodeBhavya Quiz Arena · Personal study copy</footer>`;

  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
})();
