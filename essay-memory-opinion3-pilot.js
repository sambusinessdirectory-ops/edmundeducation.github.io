(() => {
  'use strict';
  const terminal = {
    cleanup: null,
    destroy() {
      this.cleanup?.();
      this.cleanup = null;
      document.querySelector('.pilot-site-toggle')?.remove();
      document.querySelector('.pilot-tutorial')?.remove();
      document.body.classList.remove('memory-terminal', 'opinion3-terminal', 'pilot-global-open', 'pilot-library-open', 'pilot-drawer-programs', 'pilot-drawer-dossier');
      delete document.body.dataset.pilotReaderSize;
      delete document.body.dataset.pilotStage;
    },
    init() {
      const lessonKey = new URLSearchParams(location.search).get('essay');
      if (!lessonKey || document.body.classList.contains('memory-terminal')) return;
      const $ = selector => document.querySelector(selector);
      const shell = $('.shell');
      const mission = $('.mission');
      const play = $('.play-area');
      const setup = $('.setup-card');
      const catalogue = $('.memory-catalogue');
      if (!shell || !mission || !play || !setup || !catalogue) return;
      const controller = new AbortController();
      const observers = [];
      const watch = (callback, target, options) => {
        const observer = new MutationObserver(callback);
        observer.observe(target, options);
        observers.push(observer);
        return observer;
      };
      const meta = window.ESSAY_MEMORY_CATALOG?.find(item => item.key === lessonKey);
      const lesson = window.ESSAY_MEMORY_LESSONS?.[lessonKey] || (lessonKey === 'opinion:80' ? window.ESSAY_80_MEMORY_DATA : null);
      const number = meta?.title?.match(/^Model Essay\s+(\d+)/i)?.[1] || lessonKey.split(':').at(-1) || '—';
      const taskType = (meta?.taskType || lesson?.taskType || lessonKey.split(':')[0]).replaceAll('-', ' ').toUpperCase();
      const topic = lesson?.meta?.topic || '';
      document.body.classList.add('memory-terminal', 'opinion3-terminal');
      const makeArrow = direction => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'pilot-arrow-svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', direction === 'up-right' ? 'M5 19 19 5M10 5h9v9' : 'M4 12h15m-6-6 6 6-6 6');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'square');
        path.setAttribute('stroke-linejoin', 'miter');
        svg.append(path);
        return svg;
      };
      const replaceUIArrows = root => {
        for (const holder of root.querySelectorAll('.choice-arrow, [aria-hidden="true"]')) {
          const glyph = holder.textContent.trim();
          if (glyph === '↗' || glyph === '→') holder.replaceChildren(makeArrow(glyph === '↗' ? 'up-right' : 'right'));
        }
        for (const control of root.querySelectorAll('button, a')) {
          const tail = control.lastChild;
          if (tail?.nodeType !== Node.TEXT_NODE) continue;
          const match = tail.textContent.match(/([↗→])\s*$/u);
          if (!match) continue;
          tail.textContent = tail.textContent.slice(0, match.index);
          control.append(makeArrow(match[1] === '↗' ? 'up-right' : 'right'));
        }
      };
      const syncReaderSize = () => { document.body.dataset.pilotReaderSize = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-scale')) > 1 ? 'enlarged' : 'standard'; };
      watch(syncReaderSize, document.documentElement, { attributes:true, attributeFilter:['style'] });
      syncReaderSize();
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
        <div class="pilot-hud-title"><span class="pilot-hud-kicker">EDMUND EDUCATION / MEMORY PROGRAM</span><h1>MEMORIZATION <em>TERMINAL</em></h1><p>MODEL ESSAY ${String(number).padStart(2, '0')} <span>·</span> ${taskType}${topic ? ` <span>·</span> ${topic}` : ''}</p></div>
        <div class="pilot-hud-actions"><div class="pilot-hud-meter"><small>PROGRAM / 關卡</small><strong data-pilot-stage>01 / 11</strong></div><div class="pilot-hud-meter"><small>STEPS / 進度</small><strong data-pilot-progress>0 / 0</strong></div><div class="pilot-hud-meter"><small>POINTS / 積分</small><strong data-pilot-points>0</strong></div><button type="button" data-pilot-help aria-label="查看操作說明">?</button></div>`;
      const cockpit = document.createElement('section');
      cockpit.className = 'pilot-cockpit';
      cockpit.setAttribute('aria-label', `Model Essay ${number} 記憶訓練介面`);
      const programs = document.createElement('aside');
      programs.className = 'pilot-programs';
      programs.innerHTML = '<div class="pilot-panel-tab"><span>01 / PROGRAMS</span><strong>TRAINING FILES</strong></div>';
      const workspace = document.createElement('div');
      workspace.className = 'pilot-workspace';
      const workspaceLabel = document.createElement('div');
      workspaceLabel.className = 'pilot-workspace-label';
      workspaceLabel.innerHTML = `<span>ACTIVE FILE / ${String(number).padStart(2, '0')}</span><strong>REMEMBER THE ARGUMENT</strong>`;
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
      const cabinetTypes = {
        'Opinion': {index:'01',code:'OP',formula:'立場＋兩項核心理由'},
        'Discuss Both Views': {index:'02',code:'DV',formula:'雙方觀點＋個人立場'},
        'Cause / Solution': {index:'03',code:'CS',formula:'問題／原因＋解決方法'},
        'Advantages / Disadvantages': {index:'04',code:'AD',formula:'優點＋缺點'},
        'Direct Question': {index:'05',code:'DQ',formula:'逐一回答指定問題'}
      };
      const cabinetTasks = {'task-1':{index:'01',code:'T1'},'task-2':{index:'02',code:'T2'}};
      let cabinetFrame = 0;
      const decorateCabinet = () => {
        cancelAnimationFrame(cabinetFrame);
        cabinetFrame = requestAnimationFrame(() => {
          const typeRows = [...catalogue.querySelectorAll('[data-memory-pathway-type]')];
          const taskRows = [...catalogue.querySelectorAll('[data-memory-pathway-task]')];
          catalogue.dataset.pilotCabinetLevel = typeRows.length ? 'types' : taskRows.length ? 'tasks' : 'essays';
          const kicker = catalogue.querySelector('.memory-catalogue-kicker');
          if (kicker) kicker.textContent = typeRows.length ? 'IELTS TASK 2 ARCHIVE' : taskRows.length ? 'IELTS WRITING ARCHIVE' : 'MODEL ESSAY FILE INDEX';
          const heading = catalogue.querySelector('#memory-pathway-title');
          if (heading) heading.dataset.pilotArchiveTitle = typeRows.length ? 'QUESTION TYPE INDEX' : taskRows.length ? 'IELTS WRITING ARCHIVE' : 'MODEL ESSAY FILES';
          for (const row of [...taskRows, ...typeRows]) {
            const meta = typeRows.includes(row) ? cabinetTypes[row.dataset.memoryPathwayType] : cabinetTasks[row.dataset.memoryPathwayTask];
            if (!meta) continue;
            row.style.setProperty('--pilot-file-index', String(Number(meta.index) - 1));
            row.dataset.pilotFileCode = meta.code;
            const symbol = row.querySelector('.memory-pathway-symbol');
            if (symbol && !symbol.querySelector('small')) {
              const number = document.createElement('small');
              number.textContent = meta.index;
              const code = document.createElement('strong');
              code.textContent = meta.code;
              symbol.replaceChildren(number, code);
            }
            const copy = row.querySelector('.memory-pathway-row-copy');
            if (meta.formula && copy && !copy.querySelector('.pilot-file-formula')) {
              const formula = document.createElement('em');
              formula.className = 'pilot-file-formula';
              formula.textContent = meta.formula;
              copy.querySelector(':scope > span')?.before(formula);
            }
            const total = copy?.querySelector(':scope > span');
            if (total && !total.dataset.pilotFileCount) {
              total.dataset.pilotFileCount = '';
              total.textContent = `${total.textContent.match(/\d+/)?.[0] || '0'} FILES`;
            }
          }
          replaceUIArrows(catalogue);
          for (const arrow of catalogue.querySelectorAll('.memory-pathway-arrow')) {
            if (arrow.querySelector('.pilot-open-copy')) continue;
            const label = document.createElement('span');
            label.className = 'pilot-open-copy';
            label.textContent = 'OPEN FILE';
            arrow.prepend(label);
          }
        });
      };
      watch(decorateCabinet, catalogue, {childList:true, subtree:true});
      decorateCabinet();
      library.addEventListener('toggle', () => document.body.classList.toggle('pilot-library-open', library.open));
      switchEssay.addEventListener('click', () => { library.open = true; library.querySelector('summary').focus(); });
      $('.hero').hidden = true;

      const tutorial = document.createElement('dialog');
      tutorial.className = 'pilot-tutorial';
      tutorial.setAttribute('aria-labelledby', 'pilot-tutorial-title');
      tutorial.innerHTML = `<div class="pilot-tutorial-paper"><span class="pilot-tutorial-kicker">FIELD MANUAL / ${String(number).padStart(2, '0')}</span><h2 id="pilot-tutorial-title">這份訓練檔怎樣使用？</h2><ol><li><b>左側選關卡。</b>十一項訓練可隨時重溫。</li><li><b>中間完成當前練習。</b>答題、重組與朗讀按原本規則運作。</li><li><b>右側核對題目。</b>字體、語速、錄音和進度工具都在下方。</li></ol><button type="button" data-pilot-close>開始練習 <span aria-hidden="true">→</span></button></div>`;
      document.body.append(tutorial);
      replaceUIArrows(dossier);
      replaceUIArrows(tutorial);
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
        observers.push(questionObserver);
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
      watch(scheduleSync, $('#stage-rail'), { childList: true });
      watch(scheduleSync, $('#overall-number'), { childList: true, characterData: true, subtree: true });
      watch(scheduleSync, $('#star-count'), { childList: true, characterData: true, subtree: true });
      syncHud();

      const card = $('#game-card');
      const sentences = lesson?.sentences || [];
      const opinion3Cues = [
        '博物館塑造文化理解','有人主張只展本地作品','本文反對這項限制','國際館藏有兩項益處',
        '外國作品提高教育價值','缺少比較會令理解狹窄','並列作品可看見文化共通點','國際藝術深化社會理解',
        '作品呈現不同社會經驗','排除外國藝術削弱館藏價值','國際藝術也有益本地創作者','陌生技法促進藝術家進步',
        '外來影響打破創作重複','年輕藝術家帶回新視角','多元展覽吸引更多觀眾','交替展覽也讓觀眾發現本地人才',
        '結論：不應只展本地作品','重申反對立場','國際藝術有益公眾與本地藝術'
      ];
      const meaningCues = lessonKey === 'opinion:3'
        ? opinion3Cues
        : sentences.map(() => '');
      const cueBySentence = new Map(sentences.map((sentence, index) => [sentence.english.trim().toLowerCase(), meaningCues[index]]));
      const reference = document.createElement('details');
      reference.className = 'pilot-phrase-reference';
      reference.innerHTML = '<summary>完整字詞與小節表</summary>';
      const answerReference = document.createElement('details');
      answerReference.className = 'pilot-answer-reference';
      answerReference.innerHTML = '<summary>範文論證對照</summary>';
      let lastLead = null;
      let fitFrame = 0;
      const fitRound = () => {
        cancelAnimationFrame(fitFrame);
        fitFrame = requestAnimationFrame(() => {
          if (!card.isConnected) return;
          card.classList.remove('pilot-brief');
          if (innerWidth <= 1150) { card.style.removeProperty('--pilot-type-scale'); return; }
          const readerScale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-scale')) || 1;
          let scale = Math.min(2.05, Math.max(1.4, innerHeight / 570));
          card.style.setProperty('--pilot-type-scale', scale.toFixed(2));
          if (readerScale === 1) {
            while (scale > 1.01 && card.scrollHeight > card.clientHeight + 3) {
              scale = Math.max(1, scale - 0.04);
              card.style.setProperty('--pilot-type-scale', scale.toFixed(2));
            }
          }
          if (card.querySelector(':scope > .question-intro') && card.querySelector(':scope > .choice-grid') && !card.classList.contains('structure-card')) {
            const box = card.getBoundingClientRect();
            const lastBottom = Math.max(...[...card.children].filter(child => getComputedStyle(child).display !== 'none').map(child => child.getBoundingClientRect().bottom));
            if (lastBottom - box.top < box.height * .63) {
              card.classList.add('pilot-brief');
              if (card.scrollHeight > card.clientHeight + 3) card.classList.remove('pilot-brief');
            }
          }
        });
      };
      const presentRound = () => {
        const lead = card.firstElementChild;
        if (!lead || lead === lastLead) return;
        lastLead = lead;
        replaceUIArrows(card);
        card.scrollTop = 0;
        reference.remove();
        reference.open = false;
        answerReference.remove();
        answerReference.open = false;
        if (card.classList.contains('structure-card')) {
          const parts = card.querySelector('.structure-parts');
          if (parts) {
            const pieces = [...parts.children];
            const weights = pieces.map(piece => Math.max(2.6, Math.sqrt(piece.firstChild?.textContent?.trim().length || 10)));
            parts.style.gridTemplateColumns = weights.map(weight => `minmax(0,${weight.toFixed(2)}fr)`).join(' ');
            const source = card.querySelector(':scope > .support-source');
            const segments = pieces.map(piece => ({text:piece.firstChild?.textContent || '',label:piece.querySelector('small')?.textContent || '',fixed:!piece.classList.contains('slot')}));
            if (source && segments.map(segment => segment.text).join('').trim() === source.textContent.trim()) {
              source.classList.add('pilot-annotated-source');
              source.replaceChildren(...segments.map(segment => {
                const mark = document.createElement('span');
                mark.className = segment.fixed ? 'pilot-source-fixed' : 'pilot-source-slot';
                mark.textContent = segment.text;
                mark.title = segment.label;
                return mark;
              }));
            }
          }
        }
        if (card.classList.contains('simple-build') || card.classList.contains('exact-build')) {
          card.querySelector(':scope > h3 + p')?.classList.add('pilot-build-instruction');
          const table = card.querySelector('.support-table:not(.word-bank)');
          if (table) {
            const glossary = document.createElement('div');
            glossary.className = 'pilot-glossary';
            glossary.setAttribute('aria-label', '原文字詞、簡單說法與意思');
            const rows = [...table.querySelectorAll('tbody tr')];
            const activeChunk = card.querySelector('[data-build="0"]')?.textContent?.trim().toLowerCase() || '';
            const relevant = rows.filter(row => [...row.cells].slice(0,2).some(cell => activeChunk.includes(cell.textContent.trim().toLowerCase())));
            const visible = new Set((relevant.length ? relevant : rows).slice(0,4));
            for (const row of rows) {
              const cells = [...row.cells].map(cell => cell.textContent.trim());
              const entry = document.createElement('div');
              entry.className = `pilot-glossary-entry${visible.has(row) ? '' : ' pilot-glossary-optional'}`;
              for (const [index, value] of cells.entries()) {
                const part = document.createElement(index === 0 ? 'strong' : 'span');
                part.className = `pilot-glossary-part pilot-glossary-part-${index}`;
                part.textContent = value;
                entry.append(part);
              }
              glossary.append(entry);
            }
            const fullTable = table.closest('.table-scroll');
            fullTable.replaceWith(glossary);
            reference.append(fullTable);
          }
          const bank = card.querySelector('.word-bank')?.closest('.table-scroll');
          if (bank) reference.append(bank);
          if (reference.children.length > 1) tools.append(reference);
        }
        if (card.classList.contains('sentence-map')) {
          const paragraph = Number($('#step-select').value);
          const paragraphSentences = sentences.filter(sentence => sentence.paragraph === paragraph);
          for (const button of card.querySelectorAll('[data-sequence]')) {
            const cue = meaningCues[sentences.indexOf(paragraphSentences[Number(button.dataset.sequence)])];
            const strong = button.querySelector('strong');
            if (cue && strong) { strong.textContent = cue; button.setAttribute('aria-label', cue); }
            button.querySelector('small')?.remove();
          }
          for (const slot of card.querySelectorAll('.sequence-slot.filled span')) {
            slot.textContent = cueBySentence.get(slot.textContent.trim().toLowerCase()) || slot.textContent;
          }
        }
        card.querySelector('.sequence-slot:not(.filled)')?.classList.add('pilot-next-slot');
        card.classList.remove('pilot-panel-in');
        void card.offsetWidth;
        card.classList.add('pilot-panel-in');
        fitRound();
      };
      const presentSuccess = () => {
        if (!card.classList.contains('is-correct')) return;
        const connection = card.querySelector(':scope > .model-connection');
        if (connection) {
          answerReference.append(connection);
          tools.append(answerReference);
          const review = document.createElement('button');
          review.type = 'button';
          review.className = 'pilot-review-link';
          review.dataset.pilotReview = '';
          review.textContent = '範文論證對照 ↗';
          card.querySelector('[data-continue]')?.before(review);
          replaceUIArrows(card);
        }
      };
      watch(records => {
        if (records.some(record => record.addedNodes.length || record.removedNodes.length)) { presentRound(); presentSuccess(); fitRound(); }
      }, card, { childList: true });
      presentRound();
      window.addEventListener('resize', fitRound, {signal:controller.signal});
      watch(fitRound, document.documentElement, { attributes:true, attributeFilter:['style'] });
      document.fonts?.ready.then(fitRound);
      card.addEventListener('click', event => {
        if (!event.target.closest('[data-pilot-review]')) return;
        tools.open = true;
        answerReference.open = true;
        if (matchMedia('(max-width:1150px)').matches) openDrawer('dossier');
      });
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
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); }, {signal:controller.signal});
      this.cleanup = () => {
        controller.abort();
        observers.forEach(observer => observer.disconnect());
        cancelAnimationFrame(cabinetFrame);
        cancelAnimationFrame(fitFrame);
      };
    }
  };
  window.EssayMemoryTerminalHUD = terminal;
  window.EssayMemoryOpinion3Pilot = terminal;
})();
