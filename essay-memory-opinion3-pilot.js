(() => {
  'use strict';
  window.EssayMemoryOpinion3Pilot = {
    init() {
      if (new URLSearchParams(location.search).get('essay') !== 'opinion:3' || document.body.classList.contains('opinion3-terminal')) return;
      const $ = selector => document.querySelector(selector);
      const shell = $('.shell');
      const mission = $('.mission');
      const play = $('.play-area');
      const setup = $('.setup-card');
      const catalogue = $('.memory-catalogue');
      if (!shell || !mission || !play || !setup || !catalogue) return;
      document.body.classList.add('opinion3-terminal');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#272925');

      const siteToggle = document.createElement('button');
      siteToggle.type = 'button';
      siteToggle.className = 'pilot-site-toggle';
      siteToggle.setAttribute('aria-expanded', 'false');
      siteToggle.textContent = 'MENU  ☰';
      $('.memory-header').append(siteToggle);
      siteToggle.addEventListener('click', () => {
        const open = document.body.classList.toggle('pilot-global-open');
        siteToggle.setAttribute('aria-expanded', String(open));
        siteToggle.textContent = open ? 'CLOSE  ×' : 'MENU  ☰';
      });

      const hud = document.createElement('header');
      hud.className = 'pilot-hud';
      hud.innerHTML = `
        <div class="pilot-hud-title"><span class="pilot-hud-kicker">EDMUND EDUCATION / MEMORY PROGRAM</span><h1>MEMORIZATION <em>TERMINAL</em></h1><p>MODEL ESSAY 03 <span>·</span> IELTS OPINION <span>·</span> 博物館與藝術</p></div>
        <div class="pilot-hud-actions"><div class="pilot-hud-meter"><small>PROGRAM / 關卡</small><strong data-pilot-stage>01 / 11</strong></div><div class="pilot-hud-meter"><small>STEPS / 進度</small><strong data-pilot-progress>0 / 0</strong></div><div class="pilot-hud-meter"><small>POINTS / 積分</small><strong data-pilot-points>0</strong></div><button type="button" data-pilot-help aria-label="查看操作說明">?</button></div>`;
      const cockpit = document.createElement('section');
      cockpit.className = 'pilot-cockpit';
      cockpit.setAttribute('aria-label', 'Model Essay 3 記憶訓練介面');
      const programs = document.createElement('aside');
      programs.className = 'pilot-programs';
      programs.innerHTML = '<div class="pilot-panel-tab"><span>01 / PROGRAMS</span><strong>TRAINING FILES</strong></div>';
      const workspace = document.createElement('div');
      workspace.className = 'pilot-workspace';
      const workspaceLabel = document.createElement('div');
      workspaceLabel.className = 'pilot-workspace-label';
      workspaceLabel.innerHTML = '<span>ACTIVE FILE / 03</span><strong>REMEMBER THE ARGUMENT</strong>';
      const dossier = document.createElement('aside');
      dossier.className = 'pilot-dossier';
      dossier.innerHTML = '<div class="pilot-panel-tab"><span>02 / DOSSIER</span><strong>ESSAY EVIDENCE</strong></div>';
      const sourceLabel = document.createElement('div');
      sourceLabel.className = 'pilot-source-label';
      sourceLabel.textContent = 'THE ORIGINAL TASK';
      const tools = document.createElement('details');
      tools.className = 'pilot-tools';
      tools.innerHTML = '<summary><span>SESSION EQUIPMENT</span><strong>字體 · 朗讀 · 錄音 · 進度</strong></summary>';
      const switchEssay = document.createElement('button');
      switchEssay.className = 'pilot-switch-essay';
      switchEssay.type = 'button';
      switchEssay.textContent = 'FILE CABINET / 切換範文 →';
      const library = document.createElement('details');
      library.className = 'pilot-library';
      library.innerHTML = '<summary><span>FILE CABINET / 288 ESSAYS</span><strong>切換範文與題型</strong></summary>';

      shell.prepend(hud, cockpit);
      cockpit.append(programs, workspace, dossier);
      programs.append(mission);
      workspace.append(workspaceLabel, play);
      dossier.append(sourceLabel, setup, switchEssay, tools);
      play.querySelector('#feedback').after(play.querySelector('.step-picker'));
      tools.append(play.querySelector('.reading-controls'), play.querySelector('.progress-actions'), play.querySelector('.score-explanation'), play.querySelector('.utility-row'), $('.pilot-note'));
      cockpit.after(library);
      library.append(catalogue);
      switchEssay.addEventListener('click', () => { library.open = true; library.querySelector('summary').focus(); });
      $('.hero').hidden = true;

      const tutorial = document.createElement('dialog');
      tutorial.className = 'pilot-tutorial';
      tutorial.setAttribute('aria-labelledby', 'pilot-tutorial-title');
      tutorial.innerHTML = '<div class="pilot-tutorial-paper"><span class="pilot-tutorial-kicker">FIELD MANUAL / 03</span><h2 id="pilot-tutorial-title">這份訓練檔怎樣使用？</h2><ol><li><b>左側選關卡。</b>十一項訓練可隨時重溫。</li><li><b>中間完成當前練習。</b>答題、重組與朗讀按原本規則運作。</li><li><b>右側核對題目。</b>字體、語速、錄音和進度工具都在下方。</li></ol><button type="button" data-pilot-close>開始練習 <span aria-hidden="true">→</span></button></div>';
      document.body.append(tutorial);
      hud.querySelector('[data-pilot-help]').addEventListener('click', () => tutorial.showModal());
      tutorial.querySelector('[data-pilot-close]').addEventListener('click', () => tutorial.close());
      tutorial.addEventListener('click', event => { if (event.target === tutorial) tutorial.close(); });
      const dockQuestion = () => {
        const question = $('.learning-question-launcher');
        if (!question) return false;
        question.textContent = '提問';
        hud.querySelector('.pilot-hud-actions').append(question);
        return true;
      };
      if (!dockQuestion()) {
        const questionObserver = new MutationObserver(() => { if (dockQuestion()) questionObserver.disconnect(); });
        questionObserver.observe(document.body, { childList: true });
      }

      const syncHud = () => {
        const active = $('#stage-rail .stage-node.active');
        const number = Number(active?.dataset.stage ?? 0) + 1;
        hud.querySelector('[data-pilot-stage]').textContent = `${String(number).padStart(2, '0')} / 11`;
        hud.querySelector('[data-pilot-progress]').textContent = $('#overall-number').textContent.replace(/^全程\s*/, '');
        hud.querySelector('[data-pilot-points]').textContent = $('#star-count').textContent;
        document.body.dataset.pilotStage = String(number);
      };
      const scheduleSync = () => requestAnimationFrame(syncHud);
      new MutationObserver(scheduleSync).observe($('#stage-rail'), { childList: true });
      new MutationObserver(scheduleSync).observe($('#overall-number'), { childList: true, characterData: true, subtree: true });
      new MutationObserver(scheduleSync).observe($('#star-count'), { childList: true, characterData: true, subtree: true });
      syncHud();

      const card = $('#game-card');
      const pager = document.createElement('nav');
      pager.className = 'pilot-page-controls';
      pager.setAttribute('aria-label', '練習內容分頁');
      pager.innerHTML = '<button type="button" data-pilot-page-prev aria-label="上一頁">◀ 上一頁</button><span data-pilot-page-status aria-live="polite">FILE PAGE 1 / 1</span><button type="button" data-pilot-page-next aria-label="下一頁">下一頁 ▶</button>';
      card.after(pager);
      const pageState = { key: '', positions: [0], index: 0 };
      let pageFrame = 0;
      const pageKey = () => `${$('#stage-kicker').textContent}|${$('#round-number').textContent}`;
      const syncPageButtons = () => {
        pager.hidden = pageState.positions.length < 2;
        pager.querySelector('[data-pilot-page-status]').textContent = `FILE PAGE ${pageState.index + 1} / ${pageState.positions.length}`;
        pager.querySelector('[data-pilot-page-prev]').disabled = pageState.index === 0;
        pager.querySelector('[data-pilot-page-next]').disabled = pageState.index === pageState.positions.length - 1;
      };
      const measurePages = () => {
        pageFrame = 0;
        const key = pageKey();
        if (key !== pageState.key) { pageState.key = key; pageState.index = 0; }
        const max = Math.max(0, card.scrollHeight - card.clientHeight);
        const jump = Math.max(120, card.clientHeight - 36);
        const cardTop = card.getBoundingClientRect().top;
        const anchors = [...card.querySelectorAll(':scope > *, .support-table tr, .choice-card, .sequence-card, .sequence-slot, .concept-card, .translation-list p')]
          .map(node => Math.round(node.getBoundingClientRect().top - cardTop + card.scrollTop))
          .filter(top => top > 0 && top < max)
          .sort((a, b) => a - b);
        const positions = [0];
        while (positions.at(-1) < max - 2 && positions.length < 60) {
          const current = positions.at(-1);
          const target = Math.min(max, current + jump);
          const boundary = anchors.filter(top => top > current + Math.min(80, jump * .38) && top <= target).at(-1);
          const next = boundary && target - boundary < jump * .35 ? boundary : target;
          positions.push(next <= current + 20 ? target : next);
        }
        pageState.positions = positions;
        if (card.classList.contains('is-correct') && card.querySelector('[data-continue]')) pageState.index = positions.length - 1;
        pageState.index = Math.min(pageState.index, positions.length - 1);
        card.scrollTo({ top: positions[pageState.index], behavior: 'instant' });
        syncPageButtons();
      };
      const schedulePages = () => { if (!pageFrame) pageFrame = requestAnimationFrame(measurePages); };
      pager.addEventListener('click', event => {
        const direction = event.target.closest('[data-pilot-page-prev]') ? -1 : event.target.closest('[data-pilot-page-next]') ? 1 : 0;
        if (!direction) return;
        pageState.index = Math.min(pageState.positions.length - 1, Math.max(0, pageState.index + direction));
        card.scrollTo({ top: pageState.positions[pageState.index], behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        syncPageButtons();
      });
      new MutationObserver(records => {
        if (!records.some(record => record.addedNodes.length || record.removedNodes.length)) return;
        card.classList.remove('pilot-panel-in');
        void card.offsetWidth;
        card.classList.add('pilot-panel-in');
        schedulePages();
      }).observe(card, { childList: true });
      new ResizeObserver(schedulePages).observe(card);
      window.addEventListener('resize', schedulePages, { passive: true });
      $('#font-size-button').addEventListener('click', () => setTimeout(schedulePages, 0));
      document.fonts.ready.then(schedulePages);
      schedulePages();
      const openTools = document.createElement('button');
      openTools.type = 'button';
      openTools.className = 'pilot-tools-shortcut';
      openTools.textContent = 'TOOLS / 裝備';
      openTools.addEventListener('click', () => { tools.open = true; if (matchMedia('(max-width:760px)').matches) openDrawer('dossier'); });
      workspaceLabel.append(openTools);
      const openPrograms = document.createElement('button');
      openPrograms.type = 'button';
      openPrograms.className = 'pilot-drawer-shortcut';
      openPrograms.textContent = '關卡';
      const openDossier = document.createElement('button');
      openDossier.type = 'button';
      openDossier.className = 'pilot-drawer-shortcut';
      openDossier.textContent = '題目';
      workspaceLabel.append(openPrograms, openDossier);
      const closeDrawer = () => document.body.classList.remove('pilot-drawer-programs', 'pilot-drawer-dossier');
      const openDrawer = which => { closeDrawer(); document.body.classList.add(`pilot-drawer-${which}`); };
      openPrograms.addEventListener('click', () => openDrawer('programs'));
      openDossier.addEventListener('click', () => openDrawer('dossier'));
      for (const panel of [programs, dossier]) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'pilot-drawer-close';
        close.textContent = '關閉 ×';
        close.addEventListener('click', closeDrawer);
        panel.prepend(close);
      }
      $('#stage-rail').addEventListener('click', closeDrawer);
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });
    }
  };
})();
