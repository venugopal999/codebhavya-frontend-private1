const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(process.argv[2]||'.');
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
const out=[];
for(const [folder,count] of [['Full-Stack',30],['Java',24]]){
 const template=fs.readFileSync(path.join(root,folder,'lesson.html'),'utf8');
 const scripts=[...template.replace(/<!--[\s\S]*?-->/g,'').matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)].map(x=>x[1].split('?')[0]);
 for(let n=1;n<=count;n++){
  const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',content:'',textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},querySelectorAll(){return[]}});return nodes.get(id)};
  const context={window:{},location:{search:'?level='+n},URLSearchParams,console:{log(){}},localStorage:{getItem(){return null}},document:{title:'',getElementById:node,querySelector(q){return q==='meta[name="description"]'?node('description'):null},querySelectorAll(){return[]},addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},addEventListener(){}};
  context.window=context;vm.createContext(context);
  for(const src of scripts){
   if(src.startsWith('../')||src.startsWith('/')||src==='lesson.js'||src==='course-mobile-sidebar.js')continue;
   vm.runInContext(fs.readFileSync(path.join(root,folder,src),'utf8'),context,{filename:src,timeout:3000});
  }
  let engine=fs.readFileSync(path.join(root,folder,'lesson.js'),'utf8');
  if(folder==='Java')engine=engine.replace(/renderSidebar\(\);renderLesson\(\);initShell\(\);\s*$/,'');
  vm.runInContext(engine,context,{filename:folder+'/lesson.js',timeout:3000});
  vm.runInContext('initTrace=()=>{};initQuiz=()=>{};initCompletion=()=>{};'+(folder==='Java'?'initExamples=()=>{};':'' )+'renderSidebar();renderLesson();',context,{timeout:3000});
  const data=folder==='Java'?context.window.JAVA_LESSONS[n]:context.window.FULLSTACK_LESSONS[n];
  const content=node('lessonMain').innerHTML;
  if(!content.includes('<h1>')||content.length<5000)throw Error('Missing lesson '+folder+n);
  const sections=data.sections||data.concepts||[];
  out.push({folder,n,title:data.title,chars:content.length,explanationStrings:sections.filter(x=>typeof x.explanation==='string').length,sectionKeys:[...new Set(sections.flatMap(x=>Object.keys(x)))]});
  let source=template.replace(/<script>\(function\(\)\{var n=Number\(new URLSearchParams\(location.search\)[\s\S]*?<\/script>/,'');
  source=source.replace(/<title>[\s\S]*?<\/title>/,()=>'<title>'+escapeHTML(context.document.title)+'</title>');
  source=source.replace(/<meta name="description" content="[^"]*">/,()=>'<meta name="description" content="'+escapeHTML(node('description').content)+'">');
  source=source.replace('</head>',`<base href="/${folder}/lesson.html?level=${n}"><link rel="canonical" href="https://codebhavya.com/${folder}/lesson.html?level=${n}"></head>`);
  let reading=content;
  if(folder==='Java'){
   const quiz=data.quiz.map(x=>'<details class="quiz-card"><summary>'+escapeHTML(x.q)+'</summary><ol>'+x.options.map(o=>'<li>'+escapeHTML(o)+'</li>').join('')+'</ol><p><strong>Answer: '+escapeHTML(x.options[x.answer])+'</strong> '+escapeHTML(x.why)+'</p></details>').join('');
   reading=reading.replace(/(<div[^>]*id="quizList"[^>]*>)<\/div>/,(_,open)=>open+quiz+'</div>');
  }
  source=source.replace(/(<main\b[^>]*id="lessonMain"[^>]*>)[\s\S]*?(<\/main>)/,(_,a,b)=>a+reading+'<noscript><p>Lesson reading is available without JavaScript. Enable JavaScript for interactive traces, quiz scoring and progress controls.</p></noscript>'+b);
  const navID=folder==='Java'?'levelNavigation':'levelNav';
  source=source.replace(new RegExp('(<nav\\b[^>]*id="'+navID+'"[^>]*>)[\\s\\S]*?(<\\/nav>)'),(_,a,b)=>a+node(navID).innerHTML+b);
  fs.mkdirSync(path.join(root,'course-snapshots'),{recursive:true});
  fs.writeFileSync(path.join(root,'course-snapshots',`${folder.toLowerCase()}-${String(n).padStart(2,'0')}.txt`),source);

 }
}
console.log('Built',out.length,'lesson snapshots from current source data.');
