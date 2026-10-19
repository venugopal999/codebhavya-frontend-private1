from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1];rows=json.loads((R/'search-index.json').read_text())['pages'];byurl={x['url']:x for x in rows};paths={}
def title(u):
 t=byurl[u]['title'].removesuffix(' H1 Main Topic');return re.sub(r'^[^A-Za-z0-9]*\s*(?:(?:Topic\s+)?\d+\s*[.·—–-]\s+)?','',t).strip()
def link(u,label=None):
 assert u in byurl,u
 return {'url':u,'label':label or title(u)}
def add(u,before,nxt,practice=None):
 assert u in byurl,u
 groups={}
 for k,items in [('before',before),('next',nxt),('practice',practice or [])]:
  vals=[]
  for item in items:
   obj=link(item) if isinstance(item,str) else item
   assert obj['url']!=u,(u,k)
   if obj not in vals:vals.append(obj)
  if vals:groups[k]=vals[:2]
 paths[u]=groups
C=lambda s:'/C-Programming/'+s+'.html'
D=lambda s:'/Data-Structures/'+s+'.html'
J=lambda n:'/Java/lesson.html?level='+str(n)
F=lambda n:'/Full-Stack/lesson.html?level='+str(n)
L=lambda folder,s:'/Labs/'+folder+'/'+s+'.html'
P=lambda s:'/Python/level-'+s+'.html'
# These lists specify the recommended course order; prerequisite overrides below
# identify earlier concepts that directly support the current topic.
cs='start-here introduction structure variables data-types input-output operators expressions decision-making loops arrays strings functions pointers structures-unions preprocessor file-handling dynamic-memory command-line bitwise enum-typedef precedence storage-classes advanced-preprocessor'.split()
creq={'variables':['structure'],'data-types':['variables'],'input-output':['variables','data-types'],'operators':['data-types'],'expressions':['operators'],'decision-making':['operators','expressions'],'loops':['decision-making'],'arrays':['loops','data-types'],'strings':['arrays'],'functions':['variables','loops'],'pointers':['arrays','functions'],'structures-unions':['data-types','strings'],'preprocessor':['structure','functions'],'file-handling':['input-output','strings'],'dynamic-memory':['pointers','arrays'],'command-line':['pointers','strings'],'bitwise':['operators','data-types'],'enum-typedef':['data-types','structures-unions'],'precedence':['operators','expressions'],'storage-classes':['variables','functions'],'advanced-preprocessor':['preprocessor']}
cp={'input-output':['maximum-minimum-three'],'operators':['simple-compound-interest'],'expressions':['simple-compound-interest'],'decision-making':['maximum-minimum-three','switch-calculator'],'loops':['multiplication-table','prime-number'],'arrays':['array-statistics','linear-search'],'strings':['string-palindrome','substring-insert-delete'],'functions':['matrix-functions'],'pointers':['pointer-array-input','pointer-array-reverse']}
for i,s in enumerate(cs):
 u=C(s);before=[C(x) for x in creq.get(s,cs[max(0,i-1):i])] or [C('index')]
 practice=[L('pps-c',x) for x in cp.get(s,[])]
 if not practice and s in ['file-handling','structures-unions']:practice=['/C-Programming/case-studies/student-record-system.html']
 add(u,before,[C(cs[i+1])] if i+1<len(cs) else [C('practice')],practice)
ds='searching sorting linked-list stack queue trees graphs'.split()
dreq={'searching':[C('arrays'),C('loops')],'sorting':[C('arrays'),C('functions')],'linked-list':[C('pointers'),C('dynamic-memory')],'stack':[C('arrays'),C('functions')],'queue':[D('stack'),C('arrays')],'trees':[C('pointers'),C('functions')],'graphs':[D('queue'),D('trees')]}
dp={'searching':[L('pps-c','linear-search'),L('pps-c','binary-search')],'sorting':[L('pps-c','bubble-sort-ascending'),L('pps-c','insertion-sort-ascending')],'linked-list':[L('ds-c','singly-linked-list'),L('ds-c','doubly-linked-list')],'stack':[L('ds-c','stack-array'),L('ds-c','stack-adt')],'queue':[L('ds-c','queue-array'),L('ds-c','queue-adt')],'trees':[L('ds-c','binary-search-tree'),L('ds-c','tree-traversals-recursive')],'graphs':[L('ds-c','graph-dfs'),L('ds-c','graph-bfs')]}
for i,s in enumerate(ds):add(D(s),dreq[s],[D(ds[i+1])] if i+1<len(ds) else ['/Advanced-Data-Structures/level-08-performance-analysis.html'],dp[s])
# Numbered curricula retain their published next-topic order; background choices
# use exact level numbers rather than guessing from URL keywords at runtime.
reqs={
'Python':{1:[],2:[1],3:[2],4:[3],5:[4],6:[2,5],7:[5],8:[7],9:[4,5],10:[6,9],11:[8,9],12:[9,11]},
'Java':{1:[],2:[1],3:[2],4:[3],5:[4],6:[2,5],7:[5,6],8:[2,5],9:[8],10:[9],11:[9,10],12:[11],13:[9,12],14:[4,8],15:[9,12],16:[6,15],17:[8,12],18:[16,17],19:[7,14],20:[9,14],21:[9,20],22:[7,9],23:[14,19],24:[14,16]},
'Full Stack':{1:[],2:[1],3:[2],4:[2],5:[4],6:[2,4],7:[6],8:[2],9:[8],10:[9],11:[2,10],12:[9,11],13:[9,12],14:[10,11],15:[14],16:[12,15],17:[16],18:[15,16],19:[9,12],20:[19],21:[20],22:[21],23:[21,22],24:[10,20],25:[24],26:[24,25],27:[17,26],28:[18,23],29:[23,28],30:[27,29]},
'Computer Networks':{1:[],2:[1],3:[1],4:[2,3],5:[2,4],6:[5],7:[2,6],8:[5,7],9:[7,8],10:[4,9],11:[5,8],12:[9,11]},
'DBMS & SQL':{1:[],2:[1],3:[1,2],4:[3],5:[4],6:[4],7:[6],8:[7],9:[4,5],10:[9],11:[10],12:[9,11],13:[12],14:[4,12],15:[12,14],16:[12,14],17:[11,16],18:[10,17]},
'Operating Systems':{1:[],2:[1],3:[2],4:[3],5:[3],6:[4],7:[6],8:[3],9:[8],10:[2,8],11:[5,10],12:[2,10],13:[2,3],14:[8,12],15:[6,13]},
'AI & Machine Learning':{1:[],2:[1],3:[2],4:[1],5:[2,4],6:[3,5],7:[4,6],8:[4,5],9:[5,7],10:[3,7],11:[9],12:[5,7],13:[3,5],14:[3,5],15:[12,13],16:[3,12],17:[3,6],18:[17],19:[5,17],20:[2,17],21:[17,20],22:[12,21],23:[1],24:[4,17],25:[5,12],26:[12,25]},
'Advanced Data Structures':{8:[],9:[8],10:[8],11:[8],12:[8],13:[8],14:[8],15:[8],16:[14],17:[8],18:[8],19:[18],20:[9,17],21:[12,20]}}
arenas={'Python':'/Python/practice.html','Java':'/Java/practice.html','AI & Machine Learning':'/AI-ML/practice.html','Advanced Data Structures':'/Advanced-Data-Structures/practice.html'}
java_labs={2:['division-catches'],3:['atm-pin'],4:['atm-pin'],5:['atm-pin'],6:['student-results'],7:['library-books'],8:['scientific-calculator'],9:['bank-accounts'],10:['patient-records','library-books'],11:['vehicle-rental','payroll-overriding'],12:['shape-areas','payment-interfaces'],13:['scientific-calculator'],14:['division-catches','atm-custom-exception'],15:['generic-billing'],16:['marks-collections','quiz-leaderboard'],17:['generic-billing'],20:['alternate-threads','producer-consumer']}
# Avoid recommending exception-heavy code before basic Java exception handling.
for n in [2,3,4,5,7,8]:java_labs.pop(n,None)
ads_labs={9:['disjoint-sets'],11:['kmp','boyer-moore'],12:['merge-sort','quick-sort'],13:['jump-search','fibonacci-search'],14:['avl-tree'],15:['binary-trie','standard-trie'],16:['two-three-tree'],17:['binary-heap','binomial-heap'],18:['division-hash','linear-probing']}
for course,requirements in reqs.items():
 numbered={}
 for row in rows:
  if row['course']!=course or row['type']!='Lesson':continue
  m=re.search(r'(?:level-|[?&]level=)(\d+)',row['url'])
  if m:numbered[int(m.group(1))]=row['url']
 assert set(requirements)==set(numbered),(course, set(requirements)^set(numbered))
 nums=sorted(numbered)
 for i,n in enumerate(nums):
  u=numbered[n];before=[numbered[k] for k in requirements[n]]
  if not before:
   folder=u.split('/')[1];overview='/'+folder+'/index.html';before=[overview]
  nxt=[numbered[nums[i+1]]] if i+1<len(nums) else []
  practice=[]
  if course=='Java' and n in java_labs:practice=[L('oop-java',s) for s in java_labs[n]]
  elif course=='Advanced Data Structures' and n in ads_labs:practice=[L('ads-c',s) for s in ads_labs[n]]
  elif course in arenas:practice=[arenas[course]]
  elif course=='DBMS & SQL':
   s='college-management-database' if n<=8 else 'library-database' if n<=15 else 'placement-management-system';practice=['/DBMS/case-studies/'+s+'.html']
  elif course=='Full Stack':pass # Existing .practice-section is linked at runtime.
  elif course=='Computer Networks':pass # Existing .cn-check is linked at runtime.
  elif course=='Operating Systems':pass # Existing exercise block, if identifiable.
  add(u,before,nxt,practice)
# Mathematics has no numbered level URLs: define the learning sequence explicitly.
maths='mathematical-thinking number-system base-conversions logic-and-truth-tables sets-and-venn-diagrams algebra-ap-gp ratios percentages averages profit-loss-discount time-and-work time-speed-distance permutations-combinations probability matrices mathematical-patterns-for-coding'.split();maths[6]='ratio-and-proportion'
mreq={'number-system':['mathematical-thinking'],'base-conversions':['number-system'],'logic-and-truth-tables':['mathematical-thinking'],'sets-and-venn-diagrams':['logic-and-truth-tables'],'algebra-ap-gp':['number-system'],'ratio-and-proportion':['number-system'],'percentages':['ratio-and-proportion'],'averages':['number-system'],'profit-loss-discount':['percentages'],'time-and-work':['ratio-and-proportion'],'time-speed-distance':['ratio-and-proportion'],'permutations-combinations':['number-system'],'probability':['sets-and-venn-diagrams','permutations-combinations'],'matrices':['algebra-ap-gp'],'mathematical-patterns-for-coding':['algebra-ap-gp']}
for i,s in enumerate(maths):
 u='/Maths/'+s+'.html';before=['/Maths/'+x+'.html' for x in mreq.get(s,[])] or ['/Maths/index.html'];pr='/Maths/practice/'+s+'-practice.html'
 add(u,before,['/Maths/'+maths[i+1]+'.html'] if i+1<len(maths) else [],[pr] if pr in byurl else [])
web='introduction internet-web-architecture browsers-and-web-servers urls-http-https web-application-architecture web-development-tools-and-workflow html-fundamentals html-text-links-media html-lists-tables-forms semantic-html-accessibility css-fundamentals css-box-model-layout flexbox-grid-responsive-design javascript-fundamentals javascript-arrays-objects-logic dom-browser-programming javascript-events-forms browser-storage-web-apis asynchronous-javascript-apis web-apis-rest server-side-web-programming php-fundamentals databases-sql-web-applications java-web-technologies java-servlets jsp-java-server-pages jdbc-database-connectivity web-security web-performance-deployment web-technologies-capstone-placement'.split()
wreq={7:[1],8:[7],9:[7,8],10:[7,9],11:[7],12:[11],13:[12],14:[7],15:[14],16:[7,15],17:[9,16],18:[15,16],19:[15,16],20:[4,19],21:[5,20],22:[21],23:[21],24:[21],25:[24],26:[25],27:[23,24],28:[9,21],29:[13,21],30:[20,28]}
for i,s in enumerate(web,1):
 before=['/Web-Technologies/'+web[n-1]+'.html' for n in wreq.get(i,[i-1] if i>1 else [])] or ['/Web-Technologies/index.html']
 add('/Web-Technologies/'+s+'.html',before,['/Web-Technologies/'+web[i]+'.html'] if i<len(web) else [],[])
# Legacy lesson URL remains supported without creating a second public lesson.
paths['/Web-Technologies/level-08-html-text-links-media.html']=paths['/Web-Technologies/html-text-links-media.html']
# Lab pages point back to the exact concepts their implementations use.
labgroups={
'pps-c':{
'array-statistics':['arrays','loops'],'binary-search':['arrays','functions'],'bubble-sort-ascending':['arrays','loops'],'character-position':['strings','loops'],'digit-sum-palindrome':['operators','loops'],'eight-bit-binary':['operators','loops'],'fibonacci-sequence':['loops'],'insertion-sort-ascending':['arrays','loops'],'linear-search':['arrays','functions'],'matrix-functions':['arrays','functions'],'maximum-minimum-three':['input-output','decision-making'],'multiplication-table':['input-output','loops'],'pointer-array-input':['arrays','pointers'],'pointer-array-reverse':['arrays','pointers'],'prime-number':['operators','loops'],'selection-sort-descending':['arrays','loops'],'simple-compound-interest':['data-types','expressions'],'sort-names':['strings','arrays'],'string-palindrome':['strings','loops'],'substring-insert-delete':['strings','functions'],'switch-calculator':['operators','decision-making'],'text-counts':['strings','loops']},
'ds-c':{'binary-search-tree':['trees'],'circular-linked-list':['linked-list'],'doubly-linked-list':['linked-list'],'graph-bfs':['graphs','queue'],'graph-dfs':['graphs','stack'],'queue-adt':['queue'],'queue-array':['queue'],'singly-linked-list':['linked-list'],'stack-adt':['stack'],'stack-array':['stack'],'tree-traversals-iterative':['trees','stack'],'tree-traversals-recursive':['trees']}}
pps_related={'binary-search':['linear-search'],'linear-search':['binary-search'],'bubble-sort-ascending':['selection-sort-descending','insertion-sort-ascending'],'selection-sort-descending':['bubble-sort-ascending'],'insertion-sort-ascending':['bubble-sort-ascending'],'pointer-array-input':['pointer-array-reverse'],'pointer-array-reverse':['pointer-array-input'],'string-palindrome':['character-position'],'substring-insert-delete':['string-palindrome'],'maximum-minimum-three':['switch-calculator'],'multiplication-table':['fibonacci-sequence'],'prime-number':['digit-sum-palindrome']}
ds_related={'singly-linked-list':['doubly-linked-list'],'doubly-linked-list':['circular-linked-list'],'circular-linked-list':['singly-linked-list'],'stack-array':['stack-adt'],'stack-adt':['stack-array'],'queue-array':['queue-adt'],'queue-adt':['queue-array'],'tree-traversals-recursive':['tree-traversals-iterative'],'tree-traversals-iterative':['tree-traversals-recursive'],'graph-dfs':['graph-bfs'],'graph-bfs':['graph-dfs'],'binary-search-tree':['tree-traversals-recursive']}
for folder,mapping in labgroups.items():
 for slug,concepts in mapping.items():
  u=L(folder,slug);before=[(C if folder=='pps-c' else D)(s) for s in concepts]
  theory=D('searching') if slug in ['binary-search','linear-search'] else D('sorting') if 'sort' in slug else before[-1]
  related=(pps_related if folder=='pps-c' else ds_related).get(slug,[])
  add(u,before,[theory] if theory not in before else [('/Labs/'+folder+'/index.html')],[L(folder,x) for x in related])
for n,slugs in ads_labs.items():
 for slug in slugs:
  u=L('ads-c',slug);concept='/Advanced-Data-Structures/'+next(x['url'].split('/')[-1] for x in rows if x['course']=='Advanced Data Structures' and re.search(r'/level-0?'+str(n)+r'-',x['url']))
  add(u,[concept,C('pointers') if n in [9,14,15,16,17] else C('arrays')],[L('ads-c',x) for x in slugs if x!=slug] or [D('trees') if n in [14,16] else D('searching')],[])
# Remaining hash/sort experiments share their corresponding theory lesson.
for row in rows:
 if row['type']!='Lab solution' or row['url'] in paths:continue
 u=row['url'];slug=Path(u).stem
 if row['course']=='Advanced Data Structures Lab':
  n=12 if slug in ['radix-sort','bucket-sort'] else 18
  theory=next(x['url'] for x in rows if x['course']=='Advanced Data Structures' and f'/level-{n}-' in x['url'])
  add(u,[theory,C('arrays')],[L('ads-c','quick-sort') if n==12 else L('ads-c','division-hash')],[])
 elif row['course']=='OOP Java Lab':
  if slug in ['alternate-threads','producer-consumer','thread-chat','job-scheduling']:levels=[20,14]
  elif 'exception' in slug or slug in ['division-catches','swing-integer-division']:levels=[14,8]
  elif slug in ['generic-billing']:levels=[15,17]
  elif slug in ['marks-collections','quiz-leaderboard']:levels=[16,8]
  elif slug in ['vehicle-rental','payroll-overriding']:levels=[11,12]
  elif slug in ['payment-interfaces','media-player','shape-areas']:levels=[12,9]
  elif slug=='atm-pin':levels=[4,5]
  elif slug=='student-results':levels=[6,9]
  else:levels=[9,10]
  if slug.startswith('swing-') or slug in ['student-registration','traffic-light','course-feedback','mouse-events']:levels=[9,12]
  peers={'alternate-threads':'thread-chat','thread-chat':'producer-consumer','producer-consumer':'alternate-threads','job-scheduling':'quiz-leaderboard','atm-custom-exception':'marks-custom-exceptions','marks-custom-exceptions':'atm-custom-exception','division-catches':'swing-integer-division','swing-integer-division':'division-catches','generic-billing':'marks-collections','marks-collections':'quiz-leaderboard','quiz-leaderboard':'marks-collections','vehicle-rental':'payroll-overriding','payroll-overriding':'vehicle-rental','payment-interfaces':'shape-areas','shape-areas':'media-player','media-player':'payment-interfaces','atm-pin':'bank-accounts','student-results':'library-books','bank-accounts':'patient-records','patient-records':'library-books','library-books':'bank-accounts','salary-inner-class':'patient-records','scientific-calculator':'payment-interfaces','student-registration':'course-feedback','course-feedback':'student-registration','traffic-light':'swing-calculator','swing-calculator':'traffic-light','mouse-events':'course-feedback'}
  add(u,[J(n) for n in levels],[L('oop-java',peers[slug])],['/Java/practice.html'])
# Limit duplicates within one block. A background link need not be repeated as
# the next destination; every displayed link must have a distinct purpose.
for u,g in paths.items():
 seen=set()
 for key in ['before','next','practice']:
  g[key]=[x for x in g.get(key,[]) if x['url'] not in seen and not seen.add(x['url'])]
  if not g[key]:g.pop(key,None)
(R/'learning-paths-data.json').write_text(json.dumps({'version':1,'pages':paths},ensure_ascii=False,separators=(',',':')))
print('Curated learning paths:',len(paths))
