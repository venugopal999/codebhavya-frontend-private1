(function () {
  'use strict';

  const main = document.querySelector('main');
  if (!main || document.getElementById('cb-offline-course-panel')) return;
  const folder = location.pathname.split('/').filter(Boolean)[0];
  if (!folder) return;

  function start() {
    const course = Object.values(window.CodeBhavyaOfflineCourses || {})
      .find(item => new URL(item.url, location.origin).pathname.split('/')[1] === folder);
    if (!course) return;

    const styles = document.createElement('style');
    styles.textContent = `
      #cb-offline-course-panel { box-sizing:border-box; display:flex; align-items:center;
        justify-content:space-between; flex-wrap:wrap; gap:1rem; margin:1.25rem 0 2rem;
        padding:1.1rem 1.35rem; border:1px solid #c8d8e9; border-radius:16px;
        background:#f5f9ff; color:#0b2746; font:inherit; }
      #cb-offline-course-panel * { box-sizing:border-box; }
      #cb-offline-course-panel h2 { margin:0 0 .25rem; color:#0b2746;
        font:700 1.2rem/1.3 system-ui,sans-serif; }
      #cb-offline-course-panel p { margin:0; color:#466079;
        font:400 .92rem/1.5 system-ui,sans-serif; }
      #cb-offline-course-panel .cb-offline-actions { display:flex; align-items:center;
        flex-wrap:wrap; gap:.75rem; }
      #cb-offline-course-panel button { padding:.75rem 1rem; border:0; border-radius:9px;
        background:#087d85; color:#fff; cursor:pointer;
        font:700 .9rem/1.3 system-ui,sans-serif; }
      #cb-offline-course-panel button:hover { background:#08666e; }
      #cb-offline-course-panel button:disabled { opacity:.6; cursor:wait; }
      #cb-offline-course-panel a { color:#075b81; text-decoration:underline;
        font:600 .9rem/1.4 system-ui,sans-serif; }
      #cb-offline-course-panel :is(button,a):focus-visible { outline:3px solid #f5b422;
        outline-offset:3px; }
      @media(max-width:600px) { #cb-offline-course-panel { align-items:stretch; }
        #cb-offline-course-panel .cb-offline-actions { width:100%; }
        #cb-offline-course-panel button { flex:1; } }
    `;
    document.head.append(styles);

    const panel = document.createElement('section');
    panel.id = 'cb-offline-course-panel';
    panel.setAttribute('aria-label', 'Offline reading');
    const summary = document.createElement('div');
    const heading = document.createElement('h2');
    heading.textContent = 'Read this course offline';
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Checking saved lessons…';
    summary.append(heading, status);
    const actions = document.createElement('div');
    actions.className = 'cb-offline-actions';
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = true;
    button.textContent = 'Save for offline';
    const link = document.createElement('a');
    link.href = '/saved-lessons.html#offline-' + course.id;
    link.textContent = 'Manage saved lessons';
    actions.append(button, link);
    panel.append(summary, actions);
    const hero = main.querySelector('section[class*="hero"]');
    if (hero) hero.after(panel);
    else main.prepend(panel);

    async function render() {
      if (!('caches' in window) || !('serviceWorker' in navigator)) {
        status.textContent = 'Offline saving is unavailable in this browser.';
        return;
      }
      const state = await course.status();
      status.textContent = state.complete
        ? `${course.lessonCount} lessons are ready offline on this device.`
        : state.downloaded ? 'Download incomplete. Connect to finish saving.'
          : `${course.lessonCount} lessons · Save while connected to the internet.`;
      button.textContent = state.complete ? 'Refresh offline copy'
        : state.downloaded ? 'Finish download' : 'Save for offline';
      button.disabled = false;
    }

    button.addEventListener('click', async function () {
      button.disabled = true;
      status.textContent = 'Saving lessons… keep this page open.';
      try {
        await course.save((done, total) => {
          status.textContent = `Saving lessons… ${done} of ${total} files.`;
        });
        await render();
      } catch (error) {
        button.disabled = false;
        status.textContent = 'Download interrupted. Connect to the internet and try again.';
      }
    });

    render().catch(() => {
      status.textContent = 'Could not check saved lessons on this device.';
    });
  }

  if (window.CodeBhavyaOfflineCourses) start();
  else {
    const script = document.createElement('script');
    script.src = '/offline-course-catalog.js?v=2';
    script.onload = start;
    script.onerror = () => {};
    document.head.append(script);
  }
})();
