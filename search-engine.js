/* Shared by the browser UI and the local validation checks. */
(function(root){
    'use strict';
    function normalize(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9+#]+/g,' ').trim();}
    function prepare(rows){return rows.map(function(r){return Object.assign({},r,{_title:normalize(r.title),_text:normalize([r.title,r.description,r.keywords,r.course,r.type].join(' '))});});}
    function search(rows,query,course,type){
        const q=normalize(query), words=q.split(/\s+/).filter(Boolean);
        return rows.filter(r=>(!course||r.course===course)&&(!type||r.type===type)).map(function(r){
            if(words.some(w=>!r._text.includes(w)))return null;
            let score=words.reduce((s,w)=>s+(r._title.split(' ').includes(w)?8:r._title.includes(w)?4:1),0);
            if(q&&r._title===q)score+=50;else if(q&&r._title.includes(q))score+=20;
            if(r.type==='Lesson'||r.type==='Lab solution')score+=2;
            return {row:r,score};
        }).filter(Boolean).sort((a,b)=>b.score-a.score||a.row.title.localeCompare(b.row.title)||a.row.url.localeCompare(b.row.url)).map(x=>x.row);
    }
    const api={normalize,prepare,search};
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.CodeBhavyaSearch=api;
})(typeof window==='undefined'?globalThis:window);
