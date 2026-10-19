"""Rebuild public topic metadata. Run: python3 maintenance/rebuild-search-index.py
No student/account data is read. Existing lesson text is not rewritten.
"""
from html.parser import HTMLParser
from pathlib import Path
import json,re,sys
ROOT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
COURSES={'C-Programming':'C Programming','Data-Structures':'Data Structures','Python':'Python','Java':'Java','Full-Stack':'Full Stack','Computer-Networks':'Computer Networks','AI-ML':'AI & Machine Learning','DBMS':'DBMS & SQL','Maths':'Mathematics','Operating-Systems':'Operating Systems','Web-Technologies':'Web Technologies','Advanced-Data-Structures':'Advanced Data Structures','Labs':'Lab Programs','Programs':'Programs'}
LABS={'pps-c':'PPS C Lab','ds-c':'Data Structures Lab','ads-c':'Advanced Data Structures Lab','oop-java':'OOP Java Lab'}
class Metadata(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.title=[];self.h1=[];self.headings=[];self.description='';self.tags=[];self.has_main=False;self.noindex=False;self.redirect=False;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append(tag) if tag not in ['meta','link','br','hr','img','input','source','wbr'] else None
  if tag=='main':self.has_main=True
  if tag=='meta':
   if a.get('name','').lower()=='description':self.description=a.get('content','')
   if a.get('name','').lower()=='robots' and 'noindex' in a.get('content','').lower():self.noindex=True
   if a.get('http-equiv','').lower()=='refresh':self.redirect=True
 def handle_endtag(self,tag):
  if tag in self.tags:self.tags=self.tags[:len(self.tags)-1-self.tags[::-1].index(tag)]
 def handle_data(self,text):
  if 'script' in self.tags or 'style' in self.tags:return
  if 'title' in self.tags:self.title.append(text)
  if 'h1' in self.tags:self.h1.append(text)
  if any(x in self.tags for x in ['h1','h2','h3']):self.headings.append(text)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def record(path,url=None,course=None,kind=None):
 m=Metadata(path.read_text(encoding='utf-8'))
 if not m.has_main or m.noindex or m.redirect:return
 rel=path.relative_to(ROOT);folder=rel.parts[0]
 title=clean(' '.join(m.h1) or ' '.join(m.title))
 title=re.sub(r'\s*[|·]\s*Code\s?Bhavya.*$','',title,flags=re.I)
 if not title:return
 course=course or COURSES.get(folder,folder)
 if folder=='Programs':
  raw=' '.join(m.title)
  for fragment,label in [('C++','C++'),('Python','Python'),('JavaScript','JavaScript'),('Java','Java'),('C Programming','C Programming')]:
   if fragment in raw:course=label;break
 if folder=='Labs' and len(rel.parts)>2:course=LABS.get(rel.parts[1],course)
 kind=kind or ('Course guide' if path.name=='index.html' or 'syllabus' in path.name else 'Case study' if 'case-studies' in rel.parts else 'Lab solution' if folder=='Labs' else 'Program' if folder=='Programs' else 'Learning tool' if 'tracer' in str(rel) else 'Lesson')
 desc=clean(m.description)
 if not desc:desc='Explore '+title+' with CodeBhavya learning resources.'
 return {'title':title[:200],'url':url or '/'+rel.as_posix(),'course':course,'type':kind,'description':desc[:260],'keywords':clean(' '.join(m.headings))[:1500]}
pages=[]
for folder in COURSES:
 for path in sorted((ROOT/folder).rglob('*.html')):
  if path.name in ['header.html','footer.html','sidebar.html','integration-snippet.html']:continue
  if folder in ['Java','Full-Stack'] and path.name=='lesson.html':continue
  row=record(path)
  if row:pages.append(row)
for folder,prefix,count in [('Java','java',24),('Full-Stack','full-stack',30)]:
 for level in range(1,count+1):
  p=ROOT/'course-snapshots'/f'{prefix}-{level:02}.txt'
  row=record(p,url=f'/{folder}/lesson.html?level={level}',course=COURSES[folder],kind='Lesson')
  if row:pages.append(row)
# One public URL per result. Account, payment, quiz and internal snapshot routes
# never appear as destination URLs.
guide=ROOT/'learning-guide.html'
if guide.exists():
 row=record(guide,course='Getting started',kind='Course guide')
 if row:pages.append(row)
unique={p['url']:p for p in pages}
(ROOT/'search-index.json').write_text(json.dumps({'version':1,'pages':list(unique.values())},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'Indexed {len(unique)} public learning pages.')
