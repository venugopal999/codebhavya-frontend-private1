(async()=>{
 const {client,$,requireAdmin,esc,toast}=CBQuiz; try{await requireAdmin()}catch{return}
 let quizId=null, optionCount=4, savedCount=0;
 const selectedCorrect=()=>[...document.querySelectorAll('input[name="correct"]:checked')].map(x=>Number(x.value));
 const currentValues=()=>[...document.querySelectorAll('.opt-text')].map(x=>x.value);
 function previewImage(){const url=$('qImage').value.trim();$('qImagePreview').innerHTML=url?`<div class="question-image-preview"><img src="${esc(url)}" alt="Question image preview"><span>Image preview</span></div>`:'';}
 const imageUpload=CBQuizImageUpload.bind({fileId:'qImageFile',urlId:'qImage',statusId:'qImageUploadStatus',saveId:'saveQuestionBtn',preview:previewImage});
 const isProgramType=type=>['programming_c','programming_python','programming_cpp17','programming_java13','programming_nodejs12','programming_go113'].includes(type);
 function programCases(rows){
   const values=rows&&rows.length?rows:[{input:'',output:'',sample:true},{input:'',output:'',sample:false}];
   $('optionEditor').innerHTML=values.map((c,i)=>`<div class="program-case"><div class="program-case-head"><strong>Test case ${i+1}</strong><label><input type="checkbox" class="case-sample" ${c.sample?'checked':''}> Show as sample</label><button type="button" class="btn ghost case-remove" data-i="${i}">Remove</button></div><div class="two"><div><label>Input (stdin)</label><textarea class="case-input" placeholder="Input sent to the program">${esc(c.input||'')}</textarea></div><div><label>Expected output (stdout)</label><textarea class="case-output" placeholder="Exact expected output">${esc(c.output||'')}</textarea></div></div></div>`).join('');
   $('qToleranceWrap').hidden=true;$('addOptionBtn').hidden=values.length>=8;$('addOptionBtn').textContent='+ Test case';$('qTypeNote').innerHTML=`<div class="notice">Use stdin and stdout as students see them. At least one sample is required. Private test cases and expected outputs stay on the server. Each passing test case contributes an equal share of the marks. ${$('qType').value==='programming_python'?'Write a Python 3 script using input() and print().':$('qType').value==='programming_cpp17'?'Write a full C++17 program including main(). Use cin and cout for input and output.':$('qType').value==='programming_java13'?'Write a Java program with class Main and public static void main(String[] args). Read from System.in and print to System.out.':$('qType').value==='programming_nodejs12'?'Write a Node.js script. Read input from standard input with require(&quot;fs&quot;).readFileSync(0, &quot;utf8&quot;) and print with console.log().':$('qType').value==='programming_go113'?'Write a complete Go program with package main and func main(). Read from standard input with fmt.Scan and print using fmt.Println.':'Write a full C program including main().'}</div>`;
   document.querySelectorAll('.case-remove').forEach(b=>b.onclick=()=>{const v=readCases();v.splice(Number(b.dataset.i),1);programCases(v)});
 }
 function readCases(){return [...document.querySelectorAll('.program-case')].map(row=>({input:row.querySelector('.case-input').value,output:row.querySelector('.case-output').value,sample:row.querySelector('.case-sample').checked}));}
 function drawOptions(values=[],correct=[0]){
   const type=$('qType').value;
   if(isProgramType(type)){programCases();return;}
   if(type==='short_answer'||type==='numerical'){
     optionCount=type==='numerical'?1:Math.max(1,Math.min(8,values.length||1));
     const current=type==='numerical'?[values[0]||'']:Array.from({length:optionCount},(_,i)=>values[i]||'');
     $('optionEditor').innerHTML=current.map((v,i)=>`<div class="option-editor answer-editor ${type==='numerical'?'single-answer':''}"><input class="input opt-text" maxlength="200" placeholder="${type==='numerical'?'Correct number':'Accepted answer '+(i+1)}" value="${esc(v)}">${type==='short_answer'&&current.length>1?`<button type="button" class="btn ghost removeOpt" data-i="${i}">Remove</button>`:''}</div>`).join('');
     $('qToleranceWrap').hidden=type!=='numerical';$('addOptionBtn').hidden=type==='numerical';
     $('addOptionBtn').textContent='Add accepted answer';
     $('qTypeNote').innerHTML=type==='short_answer'?'<div class="notice">Case-insensitive matching; extra spaces are ignored. Use Add accepted answer for alternate correct responses.</div>':'<div class="notice">A response within the allowed ± tolerance earns full marks.</div>';
     document.querySelectorAll('.removeOpt').forEach(b=>b.onclick=()=>{const list=currentValues();list.splice(Number(b.dataset.i),1);drawOptions(list,[])});return;
   }
   $('qToleranceWrap').hidden=true;$('addOptionBtn').textContent='+ Option';
   if(type==='true_false'){values=['True','False'];optionCount=2;if(!correct.length)correct=[0]}
   else{optionCount=Math.max(2,Math.min(8,values.length||optionCount||4));while(values.length<optionCount)values.push('')}
   const inputType=type==='multiple_mcq'?'checkbox':'radio';
   $('optionEditor').innerHTML=Array.from({length:optionCount},(_,i)=>`<div class="option-editor"><input type="${inputType}" name="correct" value="${i}" ${correct.includes(i)?'checked':''}><input class="input opt-text" placeholder="Option ${i+1}" value="${esc(values[i]||'')}" ${type==='true_false'?'readonly':''}>${type!=='true_false'&&optionCount>2?`<button type="button" class="btn ghost removeOpt" data-i="${i}">Remove</button>`:''}</div>`).join('');
   $('addOptionBtn').hidden=type==='true_false';
   $('qTypeNote').innerHTML=type==='multiple_mcq'?'<div class="notice">Select all correct options. Students must choose the exact correct set for full marks.</div>':type==='true_false'?'<div class="notice">True / False uses two fixed options.</div>':'<div class="notice">Select exactly one correct option.</div>';
   document.querySelectorAll('.removeOpt').forEach(b=>b.onclick=()=>{const idx=Number(b.dataset.i),vals=currentValues();let c=selectedCorrect();vals.splice(idx,1);c=c.filter(x=>x!==idx).map(x=>x>idx?x-1:x);if(!c.length)c=[0];optionCount=vals.length;drawOptions(vals,c);});
 }
 function resetQuestion(){$('qType').value='single_mcq';$('qTolerance').value='0';$('qImage').value='';$('qImageUploadStatus').textContent='';$('qImageFile').value='';$('qText').value='';$('qMarks').value='1';$('qNegative').value='0';optionCount=4;previewImage();drawOptions(['','','',''],[0]);}
 $('startMode').onchange=()=>{$('scheduleFields').hidden=$('startMode').value!=='scheduled'};
 $('monitorFocus').onchange=()=>{$('focusMonitorSettings').hidden=!$('monitorFocus').checked};
 $('qType').onchange=()=>{const currentCases=document.querySelector('.program-case')?readCases():null;drawOptions(['short_answer','numerical'].includes($('qType').value)?['']:['','','',''],[0]);if(isProgramType($('qType').value)&&currentCases)programCases(currentCases);$('qNegative').disabled=isProgramType($('qType').value);if(isProgramType($('qType').value))$('qNegative').value=0};
 $('qImage').addEventListener('blur',previewImage);$('qImage').addEventListener('change',previewImage);
 $('addOptionBtn').onclick=()=>{if($('qType').value==='numerical')return;if(isProgramType($('qType').value)){const rows=readCases();if(rows.length<8){rows.push({input:'',output:'',sample:false});programCases(rows)}return}if(optionCount<8){const vals=currentValues(),c=selectedCorrect();optionCount++;vals.push('');drawOptions(vals,c.length?c:[0])}};
 $('createBtn').onclick=async()=>{
   const title=$('title').value.trim(),course=$('course').value.trim(),duration=Math.round(Number($('duration').value)*60),mode=$('startMode').value;let scheduled=null;
   if(mode==='scheduled'){if(!$('scheduledStart').value){$('message').innerHTML='<div class="notice bad">Choose the scheduled start date and time.</div>';return}scheduled=new Date($('scheduledStart').value).toISOString();if(new Date(scheduled).getTime()<=Date.now()+30000){$('message').innerHTML='<div class="notice bad">Scheduled start must be in the future.</div>';return}}
   if(!title||duration<60){$('message').innerHTML='<div class="notice bad">Enter a title and valid duration.</div>';return}
   const {data,error}=await client.rpc('quiz_admin_create_v8',{p_title:title,p_course:course||null,p_duration_seconds:duration,p_show_result:$('showResult').value,p_shuffle_questions:$('shuffleQuestions').checked,p_shuffle_options:$('shuffleOptions').checked,p_start_mode:mode,p_scheduled_start_at:scheduled,p_monitor_focus:$('monitorFocus').checked,p_focus_warning_limit:Math.max(1,Math.min(10,Number($('focusWarningLimit').value)||3))});
   if(error){$('message').innerHTML=`<div class="notice bad">${esc(error.message)}</div>`;return}quizId=data.id;$('questionPanel').hidden=false;$('createBtn').disabled=true;$('message').innerHTML=`<div class="notice">Quiz created. Code: <strong>${esc(data.code)}</strong>.</div>`;$('controlLink').href=`live.html?id=${encodeURIComponent(quizId)}`;if(mode==='scheduled')$('openWaitingBtn').hidden=true;
 };
 $('saveQuestionBtn').onclick=async()=>{if(imageUpload.isUploading())return;
   if(!quizId)return;const type=$('qType').value,text=$('qText').value.trim(),image=$('qImage').value.trim()||null,marks=Number($('qMarks').value)||1,negative=Math.max(0,Number($('qNegative').value)||0),options=currentValues().map(x=>x.trim()),correct=selectedCorrect();
   if(isProgramType(type)){
     const cases=readCases();if(!text||cases.length<1||!cases.some(c=>c.sample)||cases.some(c=>!c.output.trim())){toast('Add a problem statement and test cases with expected output, including at least one sample.','error');return}
     const {error}=await client.rpc('quiz_admin_save_program_v20',{p_quiz_id:quizId,p_question_id:null,p_text:text,p_image_url:image,p_marks:marks,p_cases:cases,p_language:type==='programming_python'?'python3':type==='programming_cpp17'?'cpp17':type==='programming_java13'?'java13':type==='programming_nodejs12'?'nodejs12':type==='programming_go113'?'go113':'c'});if(error){toast(error.message,'error');return}
     savedCount++;resetQuestion();$('questionList').innerHTML=`<div class="notice">${savedCount} question${savedCount===1?'':'s'} saved.</div>`;return;
   }if(['dropdown','short_answer','numerical'].includes(type)){
     if(!text||options.some(x=>!x)||!options.length){toast('Complete the question and answer values.','error');return}
     const tolerance=Number($('qTolerance').value||0);
     if(type==='numerical'&&(!Number.isFinite(tolerance)||tolerance<0||!Number.isFinite(Number(options[0])))){toast('Enter a correct number and a valid tolerance.','error');return}
     const {error}=await client.rpc('quiz_admin_save_format_v18',{p_quiz_id:quizId,p_question_id:null,
       p_format:type,p_question_text:text,p_image_url:image,p_marks:marks,p_negative_marks:negative,
       p_values:options,p_correct_indices:type==='dropdown'?correct:[],p_tolerance:type==='numerical'?tolerance:0});
     if(error){toast(error.message,'error');return}
     savedCount++;resetQuestion();$('questionList').innerHTML=`<div class="notice">${savedCount} question${savedCount===1?'':'s'} saved.</div>`;return;
   }
   if(!text||options.length<2||options.some(x=>!x)){toast('Complete the question and all options.','error');return}if(type==='multiple_mcq'&&correct.length<2){toast('Select at least two correct options.','error');return}if(type!=='multiple_mcq'&&correct.length!==1){toast('Select exactly one correct answer.','error');return}
   const {error}=await client.rpc('quiz_admin_add_question_v8',{p_quiz_id:quizId,p_question_type:type,p_question_text:text,p_image_url:image,p_marks:marks,p_negative_marks:negative,p_options:options,p_correct_indices:correct});if(error){toast(error.message,'error');return}savedCount++;resetQuestion();$('questionList').innerHTML=`<div class="notice">${savedCount} question${savedCount===1?'':'s'} saved.</div>`;
 };
 $('openWaitingBtn').onclick=async()=>{if(!quizId)return;const {error}=await client.rpc('quiz_admin_open_waiting_v1',{p_quiz_id:quizId});if(error){toast(error.message,'error');return}location.href=`live.html?id=${encodeURIComponent(quizId)}`};
 resetQuestion();
})();

/* probe-v18 */
