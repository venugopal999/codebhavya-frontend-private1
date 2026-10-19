/* Shared presentation helpers. No account, payment, storage or quiz API calls. */
(() => {
  'use strict';
  if (window.CodeBhavyaTheme) return;
  const api = window.CodeBhavyaTheme = {version: '20261019-1'};
  const themeLink = document.querySelector('link[data-cb-shared-theme]');
  let serial = 0;
  function arrangeStyles() {
    if (!themeLink) return;
    const styles = [...document.head.querySelectorAll('link[rel="stylesheet"],style')];
    if (styles.at(-1) !== themeLink) document.head.append(themeLink);
  }
  function tables(root) {
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const list = [...root.querySelectorAll('table')];
    if (root.matches?.('table')) list.unshift(root);
    list.forEach(table => {
      if (table.closest('.cb-table-scroll,[data-cb-theme-table="off"],.CodeMirror,.monaco-editor,[contenteditable="true"],.mermaid,svg')) return;
      if (!table.closest('main,.main-content,.content,.page,.container,.shell,.lesson-layout,.compiler-page,.page-shell')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'cb-table-scroll';wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', table.querySelector('caption')?.textContent.trim() || 'Scrollable table');
      const hint = document.createElement('div');hint.className = 'cb-table-hint';
      do { hint.id = 'cb-theme-table-hint-' + (++serial); } while(document.getElementById(hint.id));
      hint.textContent = '↔ Swipe table horizontally if needed';
      wrapper.setAttribute('aria-describedby',hint.id);
      table.before(hint,wrapper);wrapper.append(table);
    });
  }
  function drawer() {
    if (document.querySelector('.cb-mobile-course-toggle,.wt-mobile-course-toggle,.cb-theme-drawer-toggle')) return;
    const selectors = ['.docs-layout>.sidebar','.program-page-layout>.example-sidebar','.lab-solution-layout>.lab-page-nav','.os-layout>.os-sidebar','.cn-layout>.cn-nav','.lesson-layout>.lesson-sidebar','.lesson-layout>aside#sidebar'];
    const side = document.querySelector(selectors.join(','));if (!side) return;
    const layout = side.parentElement;
    const button=document.createElement('button');button.type='button';button.className='cb-theme-drawer-toggle';button.textContent='☰ Browse this section';button.setAttribute('aria-expanded','false');
    if(!side.id)side.id='cb-theme-sidebar';button.setAttribute('aria-controls',side.id);
    const shade=document.createElement('div');shade.className='cb-theme-drawer-backdrop';shade.hidden=true;
    const closeButton=document.createElement('button');closeButton.type='button';closeButton.className='cb-theme-drawer-close';closeButton.textContent='Close menu ×';
    side.prepend(closeButton);side.classList.add('cb-theme-active-sidebar');layout.before(button);document.body.append(shade);document.body.classList.add('cb-theme-drawer-ready');
    const mobile=matchMedia('(max-width: 820px)');
    let wasInert=false;
    function close(restore=false){document.body.classList.remove('cb-theme-drawer-open');button.setAttribute('aria-expanded','false');shade.hidden=true;if(mobile.matches)side.setAttribute('inert','');else if(!wasInert)side.removeAttribute('inert');if(restore)button.focus()}
    function open(){if(!mobile.matches)return;wasInert=side.hasAttribute('inert');side.removeAttribute('inert');document.body.classList.add('cb-theme-drawer-open');button.setAttribute('aria-expanded','true');shade.hidden=false;closeButton.focus()}
    button.addEventListener('click',()=>document.body.classList.contains('cb-theme-drawer-open')?close(true):open());closeButton.addEventListener('click',()=>close(true));shade.addEventListener('click',()=>close(true));
    side.addEventListener('click',e=>{if(e.target.closest('a[href]'))close()});
    document.addEventListener('keydown',e=>{if(!document.body.classList.contains('cb-theme-drawer-open'))return;if(e.key==='Escape'){e.preventDefault();close(true)}else if(e.key==='Tab'){const nodes=[...side.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(n=>!n.disabled&&!n.hidden&&!n.closest('[hidden]'));const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
    const change=()=>close();if(mobile.addEventListener)mobile.addEventListener('change',change);else mobile.addListener(change);close();
  }
  function start() {
    arrangeStyles();tables(document);drawer();
    new MutationObserver(records=>{for(const record of records)for(const n of record.addedNodes)if(n.nodeType===1)tables(n);drawer()}).observe(document.body,{childList:true,subtree:true});
    new MutationObserver(arrangeStyles).observe(document.head,{childList:true});
  }
  api.enhanceTables=tables;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
