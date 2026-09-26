(function () {
  'use strict';

  const PHASES = window.PHASES || [];
  const LABS = window.LABS || [];
  const LADDER = window.LADDER || [];
  const CAPSTONE = window.CAPSTONE || {};
  const CAREER = window.CAREER || {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const main = $('#main');

  /* ---------- Storage (an toàn khi bị chặn) ---------- */
  const STORE_KEY = 'devpath-progress-v1';
  const store = {
    read(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* chế độ riêng tư */ }
    }
  };
  let progress = store.read(STORE_KEY, {});
  const isDone = (id) => !!progress[id];
  function setDone(id, val) {
    if (val) progress[id] = Date.now(); else delete progress[id];
    store.write(STORE_KEY, progress);
    refreshProgressUI();
  }
  function setValue(id, val) { progress[id] = val; store.write(STORE_KEY, progress); }

  /* ---------- Dữ liệu dẫn xuất ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const pad = (n) => String(n).padStart(2, '0');
  const phaseNum = (p) => pad(PHASES.indexOf(p));
  const findPhase = (id) => PHASES.find((p) => p.id === id);
  const findLab = (id) => LABS.find((l) => l.id === id);
  const lessonId = (pid, mi, ti) => `${pid}.m${mi}.t${ti}`;
  const lessonHref = (pid, mi, ti) => `#/learn/${pid}/${mi}/${ti}`;

  const LESSONS = [];
  PHASES.forEach((p) => p.modules.forEach((m, mi) => m.topics.forEach(([t, d], ti) => LESSONS.push({ p, m, mi, ti, t, d, id: lessonId(p.id, mi, ti) }))));
  const lessonIndex = (pid, mi, ti) => LESSONS.findIndex((l) => l.p.id === pid && l.mi === mi && l.ti === ti);

  function phaseItems(p) {
    const ids = [];
    p.modules.forEach((m, mi) => m.topics.forEach((_, ti) => ids.push(lessonId(p.id, mi, ti))));
    (p.project?.reqs || []).forEach((_, i) => ids.push(`${p.id}.proj.r${i}`));
    (p.checkpoint || []).forEach((_, i) => ids.push(`${p.id}.cp.${i}`));
    return ids;
  }
  function phasePct(p) {
    const ids = phaseItems(p);
    const done = ids.filter(isDone).length;
    return { done, total: ids.length, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  }
  function overall() {
    let done = 0, total = 0;
    PHASES.forEach((p) => { const r = phasePct(p); done += r.done; total += r.total; });
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  const lessonCount = (p) => p.modules.reduce((a, m) => a + m.topics.length, 0);
  const lessonsDone = (p) => LESSONS.filter((l) => l.p === p && isDone(l.id)).length;
  const labDone = (l) => isDone(`${l.id}.done`);
  const totalLessons = LESSONS.length;
  const totalWeeks = PHASES.reduce((a, p) => a + p.weeks, 0);
  const labsForPhase = (pid) => LABS.filter((l) => l.phase === pid);
  const nextLesson = () => LESSONS.find((l) => !isDone(l.id)) || null;
  const nextLessonIn = (p) => LESSONS.find((l) => l.p === p && !isDone(l.id)) || null;

  // Nhóm khóa học trên trang chủ
  const TRACKS = [
    { t: 'Nền tảng lập trình', d: 'Máy tính, mạng, Linux, Git, JavaScript/TypeScript và Frontend hiện đại.', ids: ['p00', 'p01', 'p02'] },
    { t: 'Backend chuyên sâu', d: 'API, database, bảo mật và kiểm thử: phần cốt lõi của một backend engineer.', ids: ['p03', 'p04', 'p05', 'p06'] },
    { t: 'DevOps & CI/CD', d: 'Đóng gói, tự động hoá, đưa lên cloud và vận hành hệ thống thật.', ids: ['p07', 'p08', 'p09', 'p10', 'p11'] },
    { t: 'Kiến trúc & AI', d: 'Thiết kế hệ thống chịu tải lớn và tích hợp AI vào sản phẩm.', ids: ['p12', 'p13'] }
  ];
  // Ảnh bìa: 2 màu gradient + ký hiệu đặc trưng của chương
  const COVER = {
    p00: ['#1d2b64', '#2f80ed', '$ _'], p01: ['#2b2d8f', '#3178c6', 'TS'], p02: ['#0f766e', '#22c1c3', '</>'],
    p03: ['#3a1c71', '#7b4397', 'API'], p04: ['#0b4f6c', '#2a9fd6', 'SQL'], p05: ['#7f1d1d', '#e0533d', 'JWT'],
    p06: ['#14532d', '#22a35a', 'test'], p07: ['#0c4a6e', '#1d9bf0', 'FROM'], p08: ['#4f3ff0', '#a044ff', 'CI/CD'],
    p09: ['#7c2d12', '#f28b30', 'IaC'], p10: ['#1e3a8a', '#326ce5', 'K8s'], p11: ['#3f3a0f', '#b8860b', 'p95'],
    p12: ['#312e81', '#6d28d9', 'scale'], p13: ['#831843', '#db2777', 'AI']
  };
  const SHORT = { p00: 'Nền tảng', p01: 'Lập trình', p02: 'Frontend', p03: 'Backend', p04: 'Database', p05: 'Bảo mật', p06: 'Testing', p07: 'Docker', p08: 'CI/CD', p09: 'Cloud & IaC', p10: 'Kubernetes', p11: 'Giám sát', p12: 'Kiến trúc', p13: 'AI' };
  const LEVEL = (p) => { const i = PHASES.indexOf(p); return i <= 2 ? 'Cơ bản' : i <= 7 ? 'Trung cấp' : 'Nâng cao'; };

  const ICON = {
    check: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    prev: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M8 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg class="acc-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    ext: '<svg class="ext" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><path d="M6 3h7v7M13 3L5 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    doc: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 2.5h7l3.5 3.5v11.5h-10.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.5 10h5M7.5 13h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H10v14H4.5A1.5 1.5 0 0 1 3 15.5zM17 4.5A1.5 1.5 0 0 0 15.5 3H10v14h5.5a1.5 1.5 0 0 0 1.5-1.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 6v4l2.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    lab: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 2h6M8 2v5l-4.5 8A2 2 0 0 0 5.2 18h9.6a2 2 0 0 0 1.7-3L12 7V2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    level: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 16v-4M10 16V8M16 16V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    trophy: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M6 3h8v4a4 4 0 0 1-8 0zM6 5H3.5a2.5 2.5 0 0 0 2.8 3M14 5h2.5a2.5 2.5 0 0 1-2.8 3M10 11v3M7 17h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    list: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/></svg>'
  };

  function ring(pct, size = 40, stroke = 4) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>`;
  }
  const bar = (pct, label, attrs = '') => `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label || 'Tiến độ')}" ${attrs}><span style="width:${pct}%"></span></div>`;

  function check(id, labelHtml, extraClass = '', ariaLabel = '') {
    return `<label class="check ${extraClass} ${isDone(id) ? 'is-done' : ''}">
      <input type="checkbox" data-id="${id}" ${isDone(id) ? 'checked' : ''} ${ariaLabel ? `aria-label="${esc(ariaLabel)}"` : ''}>
      <span class="box" aria-hidden="true">${ICON.check}</span>
      <span class="check-body">${labelHtml}</span>
    </label>`;
  }

  function cover(p, cls = '') {
    const [c1, c2, glyph] = COVER[p.id] || ['#333', '#666', ''];
    return `<div class="cover ${cls}" style="--c1:${c1};--c2:${c2}" aria-hidden="true">
      <span class="cover-glyph">${esc(glyph)}</span>
      <span class="cover-num">Chương ${phaseNum(p)}</span>
      <span class="cover-title">${esc(SHORT[p.id] || p.tag)}</span>
    </div>`;
  }

  /* ---------- Nạp nội dung bài học theo chương (lazy) ---------- */
  window.LESSON_CONTENT = window.LESSON_CONTENT || {};
  const chapterLoads = {};
  function loadChapter(pid) {
    if (!chapterLoads[pid]) {
      chapterLoads[pid] = new Promise((resolve) => {
        const s = document.createElement('script');
        // Bản build gắn phiên bản để trình duyệt không dùng file bài học cũ sau khi deploy
        s.src = `assets/js/data/lessons/${pid}.js` + (window.DEVPATH_VERSION ? `?v=${window.DEVPATH_VERSION}` : '');
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
      });
    }
    return chapterLoads[pid];
  }

  /* ---------- Trang chủ ---------- */
  function courseCard(p) {
    const r = phasePct(p);
    const started = r.done > 0;
    return `<a class="course-card" href="#/phase/${p.id}" data-course="${p.id}">
      ${cover(p)}
      <div class="cc-body">
        <h3>${esc(p.title)}</h3>
        <p class="cc-meta"><span>${ICON.book}${lessonCount(p)} bài học</span><span>${ICON.clock}${p.weeks} tuần</span></p>
        ${started
          ? `<div class="cc-progress">${bar(r.pct, 'Tiến độ ' + p.title, `data-phasebar="${p.id}"`)}<span><span data-pct="${p.id}">${r.pct}%</span></span></div>`
          : `<p class="cc-level">${ICON.level}${LEVEL(p)}</p>`}
      </div>
    </a>`;
  }

  function continueCard() {
    const nx = nextLesson();
    if (!nx || overall().done === 0) return '';
    const p = nx.p, r = phasePct(p);
    return `<section class="continue" aria-labelledby="contTitle">
      ${cover(p, 'cover-sm')}
      <div class="continue-body">
        <p class="continue-kicker">Đang học: ${esc(p.title)}</p>
        <h2 id="contTitle">${esc(nx.t)}</h2>
        <div class="cc-progress">${bar(r.pct, 'Tiến độ chương', `data-phasebar="${p.id}"`)}<span>${lessonsDone(p)}/${lessonCount(p)} bài</span></div>
      </div>
      <a class="btn btn-primary" data-continue href="${lessonHref(p.id, nx.mi, nx.ti)}">Học tiếp</a>
    </section>`;
  }

  function pageHome() {
    const nx = nextLesson();
    const started = overall().done > 0;
    const cta = nx
      ? `<a class="btn btn-white" ${started ? '' : 'data-continue'} href="${lessonHref(nx.p.id, nx.mi, nx.ti)}">${started ? 'Học tiếp' : 'Bắt đầu học miễn phí'}</a>`
      : `<a class="btn btn-white" href="#/projects">Làm dự án Capstone</a>`;
    return `
    <section class="banner">
      <div class="banner-text">
        <h1>Lộ trình Backend & Fullstack Engineer</h1>
        <p>${PHASES.length} khóa học nối tiếp nhau, ${totalLessons} bài học có ví dụ và quiz, ${LABS.length} lab CI/CD. Học xong, bạn tự xây, test, đóng gói, deploy và vận hành được một sản phẩm thật.</p>
        <div class="banner-cta">${cta}<a class="btn btn-outline-white" href="#/roadmap">Xem lộ trình</a></div>
      </div>
      <div class="banner-art" aria-hidden="true">
        <div class="term">
          <div class="term-bar"><i></i><i></i><i></i><span>pipeline · main</span></div>
          <ul>
            <li class="ok"><b>✓</b> lint & test <em>42s</em></li>
            <li class="ok"><b>✓</b> build image <em>1m 08s</em></li>
            <li class="ok"><b>✓</b> trivy scan <em>19s</em></li>
            <li class="run"><b>●</b> deploy staging <em>đang chạy</em></li>
            <li><b>○</b> deploy production</li>
          </ul>
        </div>
      </div>
    </section>

    ${continueCard()}

    ${TRACKS.map((tr) => `<section class="track">
      <div class="track-head">
        <div><h2>${esc(tr.t)}</h2><p>${esc(tr.d)}</p></div>
        <a href="#/roadmap" class="see-all">Xem lộ trình</a>
      </div>
      <div class="course-grid">${tr.ids.map((id) => courseCard(findPhase(id))).join('')}</div>
    </section>`).join('')}

    <section class="track">
      <div class="track-head">
        <div><h2>Labs thực hành CI/CD</h2><p>Làm theo từng bước, code chạy được, có phần kiểm chứng.</p></div>
        <a href="#/labs" class="see-all">Xem tất cả ${LABS.length} lab</a>
      </div>
      <div class="lab-grid">${LABS.slice(0, 4).map(labCard).join('')}</div>
    </section>

    <section class="capstone-teaser">
      <div>
        <h2>Dự án tốt nghiệp: ${esc(CAPSTONE.name.split(':')[0])}</h2>
        <p>${esc(CAPSTONE.pitch)}</p>
      </div>
      <a class="btn btn-white" href="#/projects">Xem đề bài</a>
    </section>`;
  }

  /* ---------- Lộ trình ---------- */
  function pageRoadmap() {
    let week = 1;
    return `
    <header class="page-head">
      <h1>Lộ trình học</h1>
      <p class="lead">${PHASES.length} khóa học, ${totalLessons} bài học, khoảng ${totalWeeks} tuần (${Math.round(totalWeeks / 4.3)} tháng) nếu học 15–20 giờ mỗi tuần. Học theo thứ tự: khóa sau dùng kiến thức của khóa trước.</p>
    </header>
    <ol class="roadmap">
      ${PHASES.map((p) => {
        const from = week, to = week + p.weeks - 1; week += p.weeks;
        const r = phasePct(p);
        return `<li class="rm-item">
          <span class="rm-step ${r.pct === 100 ? 'done' : r.done ? 'run' : ''}">${r.pct === 100 ? ICON.check : PHASES.indexOf(p) + 1}</span>
          <a class="rm-card" href="#/phase/${p.id}">
            ${cover(p, 'cover-sm')}
            <div class="rm-body">
              <p class="rm-meta">Tuần ${from}–${to} <span>${LEVEL(p)}</span></p>
              <h2>${esc(p.title)}</h2>
              <p>${esc(p.summary)}</p>
              <p class="cc-meta"><span>${ICON.book}${lessonCount(p)} bài học</span><span>${ICON.clock}${p.weeks} tuần</span><span data-phasecount="${p.id}">${r.done}/${r.total}</span></p>
            </div>
          </a>
        </li>`;
      }).join('')}
    </ol>`;
  }

  /* ---------- Trang chi tiết chương (kiểu trang khóa học) ---------- */
  function pagePhase(id, query) {
    const p = findPhase(id);
    if (!p) return pageNotFound();
    const idx = PHASES.indexOf(p);
    const prev = PHASES[idx - 1], next = PHASES[idx + 1];
    const r = phasePct(p);
    const labs = labsForPhase(p.id);
    const nx = nextLessonIn(p);
    const doneLessons = lessonsDone(p);
    const cta = nx
      ? `<a class="btn btn-primary btn-block" data-start href="${lessonHref(p.id, nx.mi, nx.ti)}">${doneLessons ? 'Học tiếp' : 'Bắt đầu học'}</a>`
      : `<a class="btn btn-primary btn-block" href="#project">Làm dự án của chương</a>`;
    const learnItems = [...p.outcomes, ...p.modules.map((m) => m.t)];

    const html = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/roadmap">Lộ trình</a><span aria-hidden="true">›</span><span>Chương ${phaseNum(p)}</span></nav>
    <header class="detail-head">
      <h1>${esc(p.title)}</h1>
      <p class="lead">${esc(p.summary)}</p>
    </header>
    <div class="detail">
      <div class="detail-main">

        <section class="learn-box">
          <h2>Bạn sẽ học được gì?</h2>
          <ul class="learn-list">${learnItems.map((o) => `<li>${ICON.check}<span>${rich(o)}</span></li>`).join('')}</ul>
        </section>

        <section class="curriculum">
          <div class="curr-head">
            <h2>Nội dung khóa học</h2>
            <p class="curr-meta"><strong>${p.modules.length}</strong> phần · <strong>${lessonCount(p)}</strong> bài học · <strong>${p.weeks}</strong> tuần</p>
            <div class="curr-actions"><button class="link-btn" data-act="expand">Mở rộng tất cả</button><button class="link-btn" data-act="collapse">Thu gọn</button></div>
          </div>
          ${p.modules.map((m, mi) => {
            const doneCount = m.topics.filter((_, ti) => isDone(lessonId(p.id, mi, ti))).length;
            return `<details class="module" id="m${mi}" ${mi === 0 || query.m == mi ? 'open' : ''}>
              <summary>
                ${ICON.plus}
                <span class="mod-title">${mi + 1}. ${esc(m.t)}</span>
                <span class="mod-count"><span data-modcount="${p.id}.m${mi}">${doneCount}/${m.topics.length}</span> bài học</span>
              </summary>
              <div class="mod-body">
                <ol class="lessons">${m.topics.map(([t, d], ti) => {
                  const lid = lessonId(p.id, mi, ti);
                  return `<li class="lesson-row ${isDone(lid) ? 'is-done' : ''}">
                    <a class="lesson-link" href="${lessonHref(p.id, mi, ti)}">
                      <span class="lesson-ico">${ICON.doc}</span>
                      <span class="lesson-text"><span class="lesson-title">${mi + 1}.${ti + 1}. ${rich(t)}</span><span class="desc">${rich(d)}</span></span>
                    </a>
                    ${check(lid, '', 'topic', 'Đánh dấu đã học: ' + t)}
                  </li>`;
                }).join('')}</ol>
                <div class="mod-extra">
                  ${m.practice?.length ? `<div class="practice"><h3>Thực hành</h3>${m.practice.map((x, xi) => check(`${p.id}.m${mi}.x${xi}`, rich(x), 'small')).join('')}</div>` : ''}
                  ${m.res?.length ? `<div class="resources"><h3>Tài liệu tham khảo</h3><ul>${m.res.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}${ICON.ext}</a></li>`).join('')}</ul></div>` : ''}
                </div>
              </div>
            </details>`;
          }).join('')}
        </section>

        ${prev ? `<section class="requirements"><h2>Yêu cầu</h2><ul><li>Đã học xong <a href="#/phase/${prev.id}">Chương ${phaseNum(prev)}: ${esc(prev.title)}</a> hoặc có kiến thức tương đương.</li><li>Máy tính cài được Docker, Node.js 24 và một trình soạn thảo code.</li></ul></section>` : ''}

        ${labs.length ? `<section class="block"><h2>Lab thực hành</h2><div class="lab-grid">${labs.map(labCard).join('')}</div></section>` : ''}

        <section class="project-card" id="project">
          <p class="kicker">Dự án cuối chương</p>
          <h2>${esc(p.project.title)}</h2>
          <p>${rich(p.project.desc)}</p>
          <h3>Tiêu chí hoàn thành</h3>
          ${p.project.reqs.map((x, i) => check(`${p.id}.proj.r${i}`, rich(x))).join('')}
        </section>

        <section class="checkpoint" id="checkpoint">
          <h2>Checkpoint: tự kiểm tra trước khi sang chương mới</h2>
          ${p.checkpoint.map((x, i) => check(`${p.id}.cp.${i}`, rich(x))).join('')}
        </section>

        <nav class="pager" aria-label="Chuyển chương">
          ${prev ? `<a href="#/phase/${prev.id}" class="pager-prev"><small>Chương trước</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
          ${next ? `<a href="#/phase/${next.id}" class="pager-next"><small>Chương tiếp theo</small><span>${esc(next.title)}</span></a>` : `<a href="#/projects" class="pager-next"><small>Tiếp theo</small><span>Dự án Capstone</span></a>`}
        </nav>
      </div>

      <aside class="detail-side">
        <div class="enroll">
          ${cover(p, 'cover-lg')}
          <div class="enroll-progress">
            ${ring(r.pct, 56, 5)}
            <div><p class="cp-num"><span data-pct="${p.id}">${r.pct}%</span></p><p class="cp-sub"><span data-phasecount="${p.id}">${r.done}/${r.total}</span> mục đã xong</p></div>
          </div>
          ${cta}
          <ul class="enroll-list">
            <li>${ICON.level}<span>Trình độ ${LEVEL(p).toLowerCase()}</span></li>
            <li>${ICON.book}<span>Tổng số <strong>${lessonCount(p)}</strong> bài học</span></li>
            <li>${ICON.clock}<span>Thời lượng khoảng <strong>${p.weeks}</strong> tuần</span></li>
            ${labs.length ? `<li>${ICON.lab}<span><strong>${labs.length}</strong> lab thực hành</span></li>` : ''}
            <li>${ICON.trophy}<span>Dự án: ${esc(p.project.title)}</span></li>
          </ul>
        </div>
      </aside>
    </div>`;
    return {
      html,
      after: () => {
        if (query.m != null) scrollToId('m' + query.m);
        else if (query.s === 'project') scrollToId('project');
      }
    };
  }

  /* ---------- Trang học (kiểu player) ---------- */
  let sideOpen = store.read('devpath-side', true);
  const isNarrow = () => window.matchMedia('(max-width: 900px)').matches;
  const codeStore = [];

  function renderContent(L) {
    const c = window.LESSON_CONTENT[L.id];
    if (!c) return null;
    const blocks = c.sections.map((s) => `<section class="lc-section">
      <h2>${rich(s.h)}</h2>
      ${s.p.map((x) => `<p>${rich(x)}</p>`).join('')}
      ${s.list ? `<ul>${s.list.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>` : ''}
      ${s.code ? codeBlock(s.code) : ''}
    </section>`).join('');
    const quiz = (c.quiz || []).map((q, qi) => {
      const key = `${L.id}.q${qi}`;
      const chosen = progress[key]?.a;
      const answered = chosen != null;
      return `<div class="quiz-q ${answered ? (chosen === q.answer ? 'is-right' : 'is-wrong') : ''}" data-quiz="${key}" data-answer="${q.answer}">
        <p class="quiz-title"><span>Câu ${qi + 1}.</span> ${rich(q.q)}</p>
        <div class="quiz-options" role="group" aria-label="Các lựa chọn câu ${qi + 1}">
          ${shuffled(q.options.length, key).map((oi, pos) => [q.options[oi], oi, pos]).map(([o, oi, pos]) => `<button type="button" class="quiz-opt ${answered && oi === q.answer ? 'correct' : ''} ${answered && oi === chosen && chosen !== q.answer ? 'wrong' : ''}" data-opt="${oi}" ${answered ? 'disabled' : ''}><span class="opt-key">${'ABCDEFG'[pos]}</span><span>${rich(o)}</span></button>`).join('')}
        </div>
        <p class="quiz-explain" ${answered ? '' : 'hidden'}><strong>${answered && chosen === q.answer ? 'Chính xác.' : 'Chưa đúng.'}</strong> ${rich(q.explain)}</p>
      </div>`;
    }).join('');
    return `${videoList(c.videos)}${blocks}
      ${c.summary?.length ? `<section class="lc-box lc-summary"><h2>Tóm tắt</h2><ul>${c.summary.map((x) => `<li>${rich(x)}</li>`).join('')}</ul></section>` : ''}
      ${c.pitfalls?.length ? `<section class="lc-box lc-pitfalls"><h2>Lỗi thường gặp</h2><ul>${c.pitfalls.map((x) => `<li>${rich(x)}</li>`).join('')}</ul></section>` : ''}
      ${quiz ? `<section class="quiz"><h2>Kiểm tra nhanh</h2>${quiz}<button type="button" class="link-btn" data-act="quiz-reset" data-lesson="${L.id}">Làm lại quiz</button></section>` : ''}`;
  }

  // Video tham khảo: link mở YouTube; video cho phép nhúng thì có nút phát ngay trong trang.
  // Khung video (youtube-nocookie) chỉ được tạo khi người học bấm phát.
  const ytWatch = (id) => `https://www.youtube.com/watch?v=${id}`;
  function videoList(videos) {
    if (!videos?.length) return '';
    return `<section class="lc-videos" aria-label="Video tham khảo">
      <h2>Video tham khảo</h2>
      ${videos.map((v) => `<div class="video-card" data-video="${esc(v.id)}">
        <div class="video-media">
          ${v.embed
            ? `<button type="button" class="video-play" data-act="play-video" data-id="${esc(v.id)}" data-title="${esc(v.title)}" aria-label="Phát ngay trong trang: ${esc(v.title)}">
                <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">
                <span class="video-play-icon" aria-hidden="true">${ICON.play}</span>
              </button>`
            : `<a class="video-play" href="${ytWatch(v.id)}" target="_blank" rel="noopener noreferrer" aria-label="Mở trên YouTube: ${esc(v.title)}">
                <img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">
                <span class="video-play-icon" aria-hidden="true">${ICON.play}</span>
              </a>`}
        </div>
        <div class="video-info">
          <p class="video-title">${esc(v.title)}</p>
          <p class="video-meta">${esc(v.channel)} · ${v.minutes} phút · ${v.lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh, có thể bật phụ đề tự động tiếng Việt'}</p>
          <div class="video-actions">
            ${v.embed ? `<button type="button" class="btn btn-sm btn-primary" data-act="play-video" data-id="${esc(v.id)}" data-title="${esc(v.title)}">${ICON.play}<span>Phát ngay</span></button>` : ''}
            <a class="btn btn-sm" href="${ytWatch(v.id)}" target="_blank" rel="noopener noreferrer">Mở trên YouTube${ICON.ext}</a>
          </div>
        </div>
      </div>`).join('')}
    </section>`;
  }
  function playVideo(btn) {
    const card = btn.closest('.video-card');
    const media = card && $('.video-media', card);
    if (!media) return;
    const id = btn.dataset.id;
    media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="${esc(btn.dataset.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    card.classList.add('is-playing');
    $$('[data-act="play-video"]', card).forEach((b) => b.remove());
  }

  // Xáo thứ tự lựa chọn cố định theo từng câu (tránh đoán đáp án theo vị trí)
  function shuffled(n, seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      const j = h % (i + 1);
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }

  function codeBlock(code) {
    const i = codeStore.push(code.src) - 1;
    return `<figure class="code">
      <figcaption><span class="file">${esc(code.file || code.lang)}</span><span class="lang">${esc(code.lang)}</span><button class="copy" data-copy="${i}" aria-label="Sao chép code">Sao chép</button></figcaption>
      <pre><code class="language-${LANG[code.lang] || code.lang || 'plaintext'}">${esc(code.src)}</code></pre>
    </figure>`;
  }

  function pageLearn(pid, mi, ti) {
    const i = lessonIndex(pid, +mi, +ti);
    if (i < 0) return pageNotFound();
    const L = LESSONS[i];
    const p = L.p, m = L.m;
    const prev = LESSONS[i - 1], next = LESSONS[i + 1];
    const lastInChapter = !next || next.p !== p;
    const done = isDone(L.id);
    const labs = labsForPhase(p.id);
    const nextHref = lastInChapter ? `#/phase/${p.id}?s=project` : lessonHref(next.p.id, next.mi, next.ti);
    const nextLabel = lastInChapter ? 'Sang dự án của chương' : 'Bài tiếp theo';
    const dl = lessonsDone(p), total = lessonCount(p);

    let body = renderContent(L);
    let pending = false;
    if (!body) {
      pending = !chapterLoads[p.id];
      body = pending
        ? `<div class="lc-loading" aria-busy="true"><span></span><span></span><span></span></div>`
        : `<p class="muted">Nội dung chi tiết của bài này đang được biên soạn. Trong lúc chờ, hãy làm bài tập và đọc tài liệu bên dưới.</p>`;
    }

    const html = `
    <div class="player ${sideOpen && !isNarrow() ? 'side-open' : ''}" id="player">
      <header class="player-top">
        <a class="pt-back" href="#/phase/${p.id}" aria-label="Quay lại trang chương">${ICON.prev}</a>
        <a class="pt-brand" href="#/" aria-label="DevPath, trang chủ"><span class="brand-mark" aria-hidden="true">&gt;_</span></a>
        <p class="pt-title">${esc(p.title)}</p>
        <div class="pt-progress">${ring(Math.round((dl / total) * 100), 36, 3)}<span><strong>${dl}/${total}</strong> bài học</span></div>
        <button class="pt-icon" data-act="theme" aria-label="Đổi giao diện sáng/tối">${ICON.moon}</button>
      </header>

      <div class="player-body">
        <article class="player-content" id="playerContent">
          <div class="lesson-wrap">
            <p class="lesson-meta">Chương ${phaseNum(p)} › Phần ${L.mi + 1}: ${esc(m.t)}</p>
            <h1>${rich(L.t)}</h1>
            <p class="lesson-intro">${rich(L.d)}</p>
            <div class="lesson-content" data-lesson-content="${L.id}">${body}</div>
            ${m.practice?.length ? `<section class="lc-box"><h2>Bài tập thực hành của phần này</h2>${m.practice.map((x, xi) => check(`${p.id}.m${L.mi}.x${xi}`, rich(x), 'small')).join('')}</section>` : ''}
            ${m.res?.length ? `<section class="lc-box resources"><h2>Đọc thêm</h2><ul>${m.res.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}${ICON.ext}</a></li>`).join('')}</ul></section>` : ''}
            ${labs.length && L.ti === 0 ? `<section class="lc-box"><h2>Lab của chương</h2><ul class="lab-links">${labs.map((l) => `<li><a href="#/lab/${l.id}">${ICON.lab}<span>${esc(l.title)}</span></a></li>`).join('')}</ul></section>` : ''}
            <div class="complete-row">
              <button class="btn ${done ? 'btn-done' : 'btn-primary'}" data-act="complete" data-lesson="${L.id}" data-next="${nextHref}" aria-pressed="${done}">${done ? `${ICON.check}<span>Đã hoàn thành</span>` : '<span>Hoàn thành & học tiếp</span>'}</button>
            </div>
          </div>
        </article>

        <aside class="player-side" id="playerSide" aria-label="Nội dung khóa học">
          <div class="ps-head"><h2>Nội dung khóa học</h2><button class="pt-icon" data-act="side" aria-label="Đóng danh sách bài học">${ICON.close}</button></div>
          <div class="ps-list">
            ${p.modules.map((mm, a) => {
              const dc = mm.topics.filter((_, b) => isDone(lessonId(p.id, a, b))).length;
              return `<details class="ps-section" ${a === L.mi ? 'open' : ''}>
                <summary><span class="ps-sec-title">${a + 1}. ${esc(mm.t)}</span><span class="ps-sec-count">${dc}/${mm.topics.length}</span></summary>
                <ol>${mm.topics.map(([t], b) => {
                  const lid = lessonId(p.id, a, b);
                  const cur = a === L.mi && b === L.ti;
                  return `<li><a href="${lessonHref(p.id, a, b)}" class="ps-lesson ${cur ? 'active' : ''}" ${cur ? 'aria-current="page"' : ''} data-lesson="${lid}">
                    <span class="ps-lesson-title">${a + 1}.${b + 1}. ${esc(t)}</span>
                    <span class="lesson-state ${isDone(lid) ? 'done' : ''}" aria-hidden="true">${ICON.check}</span>
                  </a></li>`;
                }).join('')}</ol>
              </details>`;
            }).join('')}
            <a class="ps-extra" href="#/phase/${p.id}?s=project">${ICON.trophy}Dự án & checkpoint của chương</a>
          </div>
        </aside>
      </div>

      <footer class="player-bar">
        <div class="pb-nav">
          ${prev ? `<a class="pb-btn" href="${lessonHref(prev.p.id, prev.mi, prev.ti)}" data-prev aria-label="Bài trước: ${esc(prev.t)}">${ICON.prev}<span>Bài trước</span></a>` : `<span class="pb-btn is-disabled" aria-hidden="true">${ICON.prev}<span>Bài trước</span></span>`}
          <a class="pb-btn pb-next" href="${nextHref}" data-next-link aria-label="${esc(lastInChapter ? nextLabel : nextLabel + ': ' + next.t)}"><span>${nextLabel}</span>${ICON.next}</a>
        </div>
        <button class="pb-side" data-act="side" aria-label="Danh sách bài học: phần ${L.mi + 1}. ${esc(m.t)}" aria-expanded="${sideOpen && !isNarrow()}" aria-controls="playerSide"><span class="pb-side-label">${L.mi + 1}. ${esc(m.t)}</span>${ICON.list}</button>
      </footer>
    </div>`;

    return {
      html,
      after: () => {
        highlight();
        $('.ps-lesson.active')?.scrollIntoView({ block: 'center' });
        if (pending) loadChapter(p.id).then(() => {
          const box = $(`[data-lesson-content="${L.id}"]`);
          if (!box) return; // người dùng đã chuyển trang
          box.innerHTML = renderContent(L) || `<p class="muted">Nội dung chi tiết của bài này đang được biên soạn. Trong lúc chờ, hãy làm bài tập và đọc tài liệu bên dưới.</p>`;
          highlight();
        });
      }
    };
  }

  /* ---------- Labs ---------- */
  function labCard(l) {
    const p = findPhase(l.phase);
    return `<a class="lab-card ${labDone(l) ? 'is-done' : ''}" href="#/lab/${l.id}">
      <span class="lab-top"><span class="lab-id">Lab ${l.id.slice(3)}</span><span class="level level-${l.level === 'Cơ bản' ? 1 : l.level === 'Trung cấp' ? 2 : 3}">${esc(l.level)}</span></span>
      <h3>${esc(l.title)}</h3>
      <p>${rich(l.goal)}</p>
      <span class="lab-meta"><span>${ICON.clock}${l.minutes} phút</span><span>Chương ${phaseNum(p)}</span>${labDone(l) ? `<span class="ok">${ICON.check} Đã xong</span>` : ''}</span>
    </a>`;
  }

  function pageLabs() {
    const done = LABS.filter(labDone).length;
    return `
    <header class="page-head">
      <h1>Labs thực hành</h1>
      <p class="lead">${LABS.length} bài lab có code chạy được, đi theo đúng thứ tự dựng một pipeline production: Dockerfile, Compose, CI, CD, Terraform, Kubernetes, GitOps và giám sát. Bạn đã xong <strong>${done}/${LABS.length}</strong> lab.</p>
    </header>
    <div class="lab-grid">${LABS.map(labCard).join('')}</div>`;
  }

  const LANG = { yaml: 'yaml', bash: 'bash', dockerfile: 'dockerfile', hcl: 'plaintext', nginx: 'nginx', groovy: 'groovy', typescript: 'typescript', javascript: 'javascript', json: 'json', sql: 'sql', tsx: 'typescript', html: 'xml', css: 'css', python: 'python', go: 'go', promql: 'plaintext', ini: 'ini', text: 'plaintext' };

  function pageLab(id) {
    const l = findLab(id);
    if (!l) return pageNotFound();
    const i = LABS.indexOf(l);
    const prev = LABS[i - 1], next = LABS[i + 1];
    const p = findPhase(l.phase);
    const html = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/labs">Labs</a><span aria-hidden="true">›</span><span>${l.id.toUpperCase()}</span></nav>
    <header class="page-head">
      <h1>${esc(l.title)}</h1>
      <p class="lead">${rich(l.goal)}</p>
      <p class="cc-meta big"><span>${ICON.level}${esc(l.level)}</span><span>${ICON.clock}${l.minutes} phút</span><span>${ICON.list}${l.steps.length} bước</span><span>${ICON.book}<a href="#/phase/${p.id}">Chương ${phaseNum(p)}</a></span></p>
    </header>
    <ol class="steps">
      ${l.steps.map((s, si) => `<li class="step">
        <div class="step-head"><span class="step-n">${si + 1}</span><h2>${esc(s.t)}</h2></div>
        <p>${rich(s.d)}</p>
        ${codeBlock({ lang: s.lang, file: s.file, src: s.code })}
      </li>`).join('')}
    </ol>
    <div class="split lab-end">
      <section class="checkpoint">
        <h2>Kiểm chứng</h2>
        ${l.verify.map((v, vi) => check(`${l.id}.v${vi}`, rich(v))).join('')}
      </section>
      <section class="pitfalls">
        <h2>Lỗi hay gặp</h2>
        <ul>${l.pitfalls.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>
      </section>
    </div>
    <div class="lab-done">${check(`${l.id}.done`, `<strong>Tôi đã hoàn thành lab này</strong>`, 'big')}</div>
    <nav class="pager" aria-label="Chuyển lab">
      ${prev ? `<a href="#/lab/${prev.id}" class="pager-prev"><small>Lab trước</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a href="#/lab/${next.id}" class="pager-next"><small>Lab tiếp theo</small><span>${esc(next.title)}</span></a>` : '<span></span>'}
    </nav>`;
    return { html, after: highlight };
  }

  function highlight() {
    if (window.hljs) $$('pre code:not(.hljs)', main).forEach((el) => { try { window.hljs.highlightElement(el); } catch (e) { /* ngôn ngữ chưa nạp */ } });
  }

  /* ---------- Dự án, Sự nghiệp, Tiến độ ---------- */
  function pageProjects() {
    return `
    <header class="page-head">
      <h1>12 bậc dự án và Capstone</h1>
      <p class="lead">Thang dự án đi theo các checkpoint của roadmap.sh Full Stack. Mỗi bậc thêm một năng lực mới, bậc cuối là hệ thống bạn tự tin trình bày với nhà tuyển dụng.</p>
    </header>
    <ol class="ladder">${LADDER.map((x) => `<li>
      <span class="ld-lv">${x.lv}</span>
      <div><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p><div class="chips">${x.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>
    </li>`).join('')}</ol>

    <section class="capstone">
      <p class="kicker">Capstone</p>
      <h2>${esc(CAPSTONE.name)}</h2>
      <p class="lead">${esc(CAPSTONE.pitch)}</p>
      <div class="arch">${CAPSTONE.architecture.map(([k, v]) => `<div class="arch-box"><span class="arch-k">${esc(k)}</span><span>${esc(v)}</span></div>`).join('')}</div>
      <h3>Các mốc, khoảng 9 tuần</h3>
      <div class="milestones">${CAPSTONE.milestones.map((ms, mi) => `<div class="ms">
        <h4>${esc(ms.t)}</h4>
        ${ms.items.map((it, ii) => check(`cap.m${mi}.${ii}`, rich(it), 'small')).join('')}
      </div>`).join('')}</div>
      <h3>Tiêu chí chấm</h3>
      <table class="rubric"><thead><tr><th scope="col">Hạng mục</th><th scope="col">Đạt khi</th></tr></thead>
      <tbody>${CAPSTONE.rubric.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
    </section>`;
  }

  function pageCareer() {
    return `
    <header class="page-head">
      <h1>Từ học viên tới kỹ sư được tuyển</h1>
      <p class="lead">Nhà tuyển dụng muốn thấy bằng chứng bạn làm được. Dưới đây là checklist năng lực, cách làm portfolio và bộ câu hỏi phỏng vấn thường gặp.</p>
    </header>
    <section class="checkpoint">
      <h2>Checklist năng lực sẵn sàng đi làm</h2>
      ${CAREER.skills.map((s, i) => check(`career.s${i}`, esc(s))).join('')}
    </section>
    <section class="block">
      <h2>Portfolio</h2>
      <div class="portfolio">${CAREER.portfolio.map(([k, v]) => `<div class="aside-note"><h3>${esc(k)}</h3><p>${esc(v)}</p></div>`).join('')}</div>
    </section>
    <section class="block">
      <h2>Câu hỏi phỏng vấn thường gặp</h2>
      <p class="muted">Tự trả lời thành tiếng hoặc viết ra giấy. Nếu không giải thích được một câu trong 2 phút, hãy quay lại chương tương ứng.</p>
      <div class="interview">${CAREER.interview.map((g, gi) => `<details class="module" ${gi === 0 ? 'open' : ''}>
        <summary>${ICON.plus}<span class="mod-title">${esc(g.t)}</span><span class="mod-count">${g.q.length} câu</span></summary>
        <div class="mod-body">${g.q.map((q, qi) => check(`iv.${gi}.${qi}`, esc(q), 'small')).join('')}</div>
      </details>`).join('')}</div>
    </section>`;
  }

  function pageProgress() {
    const o = overall();
    const labsDone = LABS.filter(labDone).length;
    const lessons = LESSONS.filter((l) => isDone(l.id)).length;
    return `
    <header class="page-head">
      <h1>Bạn đã đi được <span data-overall>${o.pct}%</span> lộ trình</h1>
      <p class="lead">${lessons}/${totalLessons} bài học, ${labsDone}/${LABS.length} lab. Tiến độ được lưu trong trình duyệt này. Hãy xuất file để sao lưu hoặc chuyển sang máy khác.</p>
      <div class="bar big" data-overallbar role="progressbar" aria-valuenow="${o.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ tổng"><span style="width:${o.pct}%"></span></div>
    </header>
    <div class="progress-list">${PHASES.map((p) => {
      const r = phasePct(p);
      return `<a class="progress-row" href="#/phase/${p.id}">
        ${ring(r.pct)}
        <span class="pr-title"><span class="pr-num">Chương ${phaseNum(p)}</span>${esc(p.title)}</span>
        <span class="pr-count">${r.done}/${r.total}</span>
      </a>`;
    }).join('')}</div>
    <section class="block data-actions">
      <h2>Sao lưu dữ liệu</h2>
      <div class="btn-row">
        <button class="btn" data-act="export">Xuất tiến độ (.json)</button>
        <label class="btn">Nhập từ file<input type="file" accept="application/json" data-act="import" hidden></label>
        <button class="btn btn-danger" data-act="reset">Xoá toàn bộ tiến độ</button>
      </div>
    </section>`;
  }

  function pageNotFound() {
    return `<header class="page-head"><h1>Không tìm thấy trang</h1><p class="lead">Đường dẫn này không tồn tại hoặc đã đổi. <a href="#/">Về trang chủ</a></p></header>`;
  }

  /* ---------- Cập nhật tiến độ trên trang ---------- */
  function refreshProgressUI() {
    PHASES.forEach((p) => {
      const r = phasePct(p);
      $$(`[data-pct="${p.id}"]`).forEach((el) => { el.textContent = r.pct + '%'; });
      $$(`[data-phasebar="${p.id}"]`).forEach((el) => { el.querySelector('span').style.width = r.pct + '%'; el.setAttribute('aria-valuenow', r.pct); });
      $$(`[data-phasecount="${p.id}"]`).forEach((el) => { el.textContent = `${r.done}/${r.total}`; });
    });
    const o = overall();
    $$('[data-overall]').forEach((el) => { el.textContent = o.pct + '%'; });
    $$('[data-overallbar]').forEach((el) => { el.querySelector('span').style.width = o.pct + '%'; el.setAttribute('aria-valuenow', o.pct); });
    $('#pillRing').innerHTML = ring(o.pct, 26, 3);
  }

  /* ---------- Router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { parts, query };
  }

  function render() {
    const { parts, query } = parseHash();
    const [route, arg, a2, a3] = parts;
    codeStore.length = 0;
    let out;
    switch (route) {
      case undefined: out = pageHome(); break;
      case 'roadmap': out = pageRoadmap(); break;
      case 'phase': out = pagePhase(arg, query); break;
      case 'learn': out = pageLearn(arg, a2, a3); break;
      case 'labs': out = pageLabs(); break;
      case 'lab': out = pageLab(arg); break;
      case 'projects': out = pageProjects(); break;
      case 'career': out = pageCareer(); break;
      case 'progress': out = pageProgress(); break;
      default: out = pageNotFound();
    }
    const page = typeof out === 'string' ? { html: out } : out;
    const isPlayer = route === 'learn' && page.html.includes('id="player"');
    document.body.dataset.route = isPlayer ? 'learn' : (route || 'home');
    main.innerHTML = isPlayer ? page.html
      : `<div class="page">${page.html}</div><footer class="foot"><p>DevPath là khóa học mở. Nội dung tham chiếu <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer">roadmap.sh</a>, OWASP, 12factor.net và Google SRE. Tiến độ chỉ lưu trên trình duyệt của bạn.</p></footer>`;

    const navKey = { phase: 'roadmap', learn: 'roadmap', lab: 'labs' }[route] || route || 'home';
    $$('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === navKey;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    const titles = { roadmap: 'Lộ trình', labs: 'Labs', projects: 'Dự án', career: 'Sự nghiệp', progress: 'Tiến độ' };
    let title = titles[route];
    if (route === 'phase' && findPhase(arg)) title = findPhase(arg).title;
    if (route === 'lab' && findLab(arg)) title = findLab(arg).title;
    if (route === 'learn') { const i = lessonIndex(arg, +a2, +a3); if (i >= 0) title = LESSONS[i].t; }
    document.title = title ? `${title} · DevPath` : 'DevPath: khóa học Backend & Fullstack';

    closeRail();
    window.scrollTo(0, 0);
    $('#playerContent')?.scrollTo(0, 0);
    refreshProgressUI();
    if (page.after) page.after();
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'start' });
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 1600);
    });
  }

  /* ---------- Sự kiện ---------- */
  main.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-id]');
    if (cb) {
      setDone(cb.dataset.id, cb.checked);
      cb.closest('.check')?.classList.toggle('is-done', cb.checked);
      cb.closest('.lesson-row')?.classList.toggle('is-done', cb.checked);
      const mm = cb.dataset.id.match(/^(p\d+)\.m(\d+)\.t\d+$/);
      if (mm) {
        const p = findPhase(mm[1]); const mi = +mm[2];
        const n = p.modules[mi].topics.filter((_, ti) => isDone(lessonId(p.id, mi, ti))).length;
        const el = $(`[data-modcount="${p.id}.m${mi}"]`); if (el) el.textContent = `${n}/${p.modules[mi].topics.length}`;
      }
      if (/\.done$/.test(cb.dataset.id) && cb.checked) toast('Đã đánh dấu hoàn thành lab.');
      return;
    }
    const imp = e.target.closest('[data-act="import"]');
    if (imp && imp.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (typeof data !== 'object' || Array.isArray(data) || data === null) throw new Error('bad');
          progress = data.progress && typeof data.progress === 'object' ? data.progress : data;
          store.write(STORE_KEY, progress);
          render(); toast('Đã nhập tiến độ.');
        } catch (err) { toast('File không hợp lệ. Hãy chọn file .json được xuất từ DevPath.'); }
      };
      reader.readAsText(imp.files[0]);
    }
  });

  main.addEventListener('click', (e) => {
    const opt = e.target.closest('.quiz-opt');
    if (opt && !opt.disabled) { answerQuiz(opt); return; }
    const copy = e.target.closest('[data-copy]');
    if (copy) { copyText(codeStore[+copy.dataset.copy] || '', copy); return; }
    const btn = e.target.closest('[data-act]');
    const act = btn?.dataset.act;
    if (act === 'expand' || act === 'collapse') $$('details.module', main).forEach((d) => { d.open = act === 'expand'; });
    if (act === 'complete') {
      const id = btn.dataset.lesson;
      if (isDone(id)) { setDone(id, false); render(); toast('Đã bỏ đánh dấu hoàn thành.'); }
      else { setDone(id, true); toast('Đã hoàn thành bài học.'); navigate(btn.dataset.next); }
    }
    if (act === 'side') {
      const open = !$('#player').classList.contains('side-open');
      $('#player').classList.toggle('side-open', open);
      $$('.pb-side').forEach((b) => b.setAttribute('aria-expanded', open));
      if (!isNarrow()) { sideOpen = open; store.write('devpath-side', sideOpen); }
    }
    if (act === 'play-video') { playVideo(btn); return; }
    if (act === 'theme') toggleTheme();
    if (act === 'quiz-reset') {
      Object.keys(progress).filter((k) => k.startsWith(btn.dataset.lesson + '.q')).forEach((k) => delete progress[k]);
      store.write(STORE_KEY, progress); render();
    }
    if (act === 'export') {
      const blob = new Blob([JSON.stringify({ app: 'devpath', version: 1, exportedAt: new Date().toISOString(), progress }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'devpath-progress.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    if (act === 'reset' && confirm('Xoá toàn bộ tiến độ? Thao tác này không thể hoàn tác.')) {
      progress = {}; store.write(STORE_KEY, progress); render(); toast('Đã xoá tiến độ.');
    }
  });

  function answerQuiz(opt) {
    const q = opt.closest('.quiz-q');
    const chosen = +opt.dataset.opt, answer = +q.dataset.answer;
    setValue(q.dataset.quiz, { a: chosen });
    q.classList.add(chosen === answer ? 'is-right' : 'is-wrong');
    $$('.quiz-opt', q).forEach((b) => {
      b.disabled = true;
      if (+b.dataset.opt === answer) b.classList.add('correct');
      if (+b.dataset.opt === chosen && chosen !== answer) b.classList.add('wrong');
    });
    const ex = $('.quiz-explain', q);
    ex.hidden = false;
    $('strong', ex).textContent = chosen === answer ? 'Chính xác.' : 'Chưa đúng.';
  }

  function copyText(text, btn) {
    const done = () => { btn.textContent = 'Đã chép'; setTimeout(() => { btn.textContent = 'Sao chép'; }, 1500); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* bỏ qua */ }
    ta.remove(); cb();
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  /* Theme */
  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme() {
    const t = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('devpath-theme', t); } catch (e) { /* bỏ qua */ }
  }
  $('#themeBtn').addEventListener('click', toggleTheme);

  /* Menu mobile */
  const rail = $('#rail'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
  function openRail() { rail.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
  function closeRail() { rail.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => (rail.classList.contains('open') ? closeRail() : openRail()));
  scrim.addEventListener('click', closeRail);

  /* ---------- Tìm kiếm ---------- */
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const INDEX = [];
  PHASES.forEach((p) => {
    INDEX.push({ kind: 'Khóa học', title: p.title, sub: `Chương ${phaseNum(p)}`, href: `#/phase/${p.id}`, text: norm(p.title + ' ' + p.tag + ' ' + p.summary) });
    p.modules.forEach((m, mi) => {
      INDEX.push({ kind: 'Phần', title: m.t, sub: `Chương ${phaseNum(p)}: ${p.title}`, href: `#/phase/${p.id}?m=${mi}`, text: norm(m.t) });
      m.topics.forEach(([t, d], ti) => INDEX.push({ kind: 'Bài học', title: t, sub: `${m.t}, chương ${phaseNum(p)}`, href: lessonHref(p.id, mi, ti), text: norm(t + ' ' + d) }));
    });
  });
  LABS.forEach((l) => INDEX.push({ kind: 'Lab', title: l.title, sub: `Lab ${l.id.slice(3)}`, href: `#/lab/${l.id}`, text: norm(l.title + ' ' + l.goal + ' ' + l.steps.map((s) => s.t + ' ' + s.file).join(' ')) }));

  const palette = $('#palette'), pInput = $('#paletteInput'), pResults = $('#paletteResults');
  let pSel = 0, pItems = [];
  function openPalette() { palette.hidden = false; pInput.value = ''; searchPalette(''); setTimeout(() => pInput.focus(), 0); }
  function closePalette() { palette.hidden = true; }
  function searchPalette(q) {
    const terms = norm(q.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      pItems = INDEX.filter((x) => x.kind === 'Khóa học' || x.kind === 'Lab').slice(0, 30);
    } else {
      pItems = INDEX
        .map((x) => {
          if (!terms.every((t) => x.text.includes(t))) return null;
          const tt = norm(x.title);
          let score = terms.reduce((a, t) => a + (tt.includes(t) ? 10 : 1), 0);
          if (tt.startsWith(terms[0])) score += 5;
          if (x.kind === 'Lab' || x.kind === 'Khóa học') score += 2;
          return { x, score };
        })
        .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 40).map((r) => r.x);
    }
    pSel = 0;
    pResults.innerHTML = pItems.length
      ? pItems.map((x, i) => `<li role="option" id="opt${i}" aria-selected="${i === 0}"><a href="${x.href}"><span class="k">${esc(x.kind)}</span><span class="t">${esc(x.title)}</span><span class="s">${esc(x.sub)}</span></a></li>`).join('')
      : `<li class="empty">Không có kết quả cho “${esc(q)}”. Thử từ khoá ngắn hơn, ví dụ: docker, jwt, index.</li>`;
    pInput.setAttribute('aria-activedescendant', pItems.length ? 'opt0' : '');
  }
  function movePalette(d) {
    if (!pItems.length) return;
    pSel = (pSel + d + pItems.length) % pItems.length;
    $$('li[role="option"]', pResults).forEach((li, i) => li.setAttribute('aria-selected', i === pSel));
    $(`#opt${pSel}`)?.scrollIntoView({ block: 'nearest' });
    pInput.setAttribute('aria-activedescendant', 'opt' + pSel);
  }
  $('#searchBtn').addEventListener('click', openPalette);
  pInput.addEventListener('input', () => searchPalette(pInput.value));
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); movePalette(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); movePalette(-1); }
    else if (e.key === 'Enter' && pItems[pSel]) { e.preventDefault(); closePalette(); navigate(pItems[pSel].href); }
  });
  pResults.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a) { e.preventDefault(); closePalette(); navigate(a.getAttribute('href')); } });
  palette.addEventListener('click', (e) => { if (e.target === palette) closePalette(); });
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.hidden ? openPalette() : closePalette(); }
    else if (e.key === '/' && palette.hidden && !typing) { e.preventDefault(); openPalette(); }
    else if (e.key === 'Escape') { if (!palette.hidden) closePalette(); else closeRail(); }
    else if (palette.hidden && !typing && !e.altKey && !e.ctrlKey && !e.metaKey && document.body.dataset.route === 'learn') {
      if (e.key === 'ArrowLeft') $('[data-prev]', main)?.click();
      if (e.key === 'ArrowRight') $('[data-next-link]', main)?.click();
    }
  });

  function navigate(href) {
    if (location.hash === href) render(); else location.hash = href;
  }

  window.addEventListener('hashchange', render);
  render();
})();
