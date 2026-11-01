import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = {window:{}};
vm.createContext(context);
for (const file of ['essay-memory-lessons-data.js', 'essay-memory-new-support.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename:file});
}
const {chromium} = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({reducedMotion:'reduce'});
const base = process.env.MEMORY_QA_URL || 'http://127.0.0.1:8764/essay-memorization.html';
const examples = [
  '播放海外照顧者談工作的影片，',
  '交替安排本地與外國團隊分享，',
  '交替安排本地和國際劇目，',
];

for (const width of [390, 650, 768, 1024, 1440]) {
  await page.setViewportSize({width, height:900});
  for (const scale of [1, 1.15, 1.3]) {
    for (const key of ['opinion:3', 'discuss-both-views:4', 'cause-solution:2']) {
      await page.goto(`${base}?essay=${encodeURIComponent(key)}`);
      await page.evaluate(value => localStorage.setItem('edmund-memory-font-scale', String(value)), scale);
      await page.reload();
      await page.locator('[data-stage="4"]').click();
      const rounds = context.window.ESSAY_MEMORY_LESSONS[key].support.transfer.length;
      for (let index = 0; index < rounds; index++) {
        await page.locator('#step-select').evaluate((select, value) => {
          select.value = String(value);
          select.dispatchEvent(new Event('change'));
        }, index);
        const choices = await page.locator('#game-card .choice-text').evaluateAll(spans => spans.map(span => {
          const lines = new Map();
          const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            for (let i = 0; i < node.textContent.length; i++) {
              const range = document.createRange();
              range.setStart(node, i);
              range.setEnd(node, i + 1);
              const rect = range.getBoundingClientRect();
              if (!rect.width && !rect.height) continue;
              const top = Math.round(rect.top);
              lines.set(top, (lines.get(top) || '') + node.textContent[i]);
            }
          }
          const last = [...lines].sort((a, b) => a[0] - b[0]).at(-1)?.[1]?.trim() || '';
          return {text:span.textContent, last, lineCount:lines.size, forcedBreak:!!span.querySelector('br'), first:span.firstChild?.textContent};
        }));
        assert.equal(choices.length, 4, `${key} round ${index + 1}`);
        for (const choice of choices) {
          assert(!(choice.lineCount > 1 && /^[\u3400-\u9fff]{1,3}[。！？]?$/.test(choice.last)), `${key} ${width}px ${scale}× round ${index + 1}: ${choice.text} / tail ${choice.last}`);
          if (width === 1440 && scale === 1 && examples.some(example => choice.text.startsWith(example))) {
            assert(choice.forcedBreak && choice.first.endsWith('，'), `Expected clause break: ${choice.text}`);
          }
        }
        assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${key} ${width}px ${scale}× round ${index + 1}: horizontal overflow`);
      }
    }
  }
}
await browser.close();
console.log('PASS: no one-to-three-character Chinese tails across all 34 transfer exercises, five widths, and three font sizes.');
