// build_page.mjs — renders the front page HTML for THE DAY, IN FULL.
// Reads stories.json (same directory) and returns the full HTML string.
// The page is exactly 1024 x 1024; nothing here calls the network or the
// clock, so the screenshot is reproducible from the same stories file.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadStories() {
  return JSON.parse(readFileSync(join(HERE, 'stories.json'), 'utf8'));
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function storyItem(story, roomy, showDeck) {
  const deck = roomy && showDeck && story.deck
    ? `<div class="deck">${esc(story.deck)}</div>`
    : '';
  const place = roomy
    ? `<div class="place">${esc(story.place)}</div>`
    : `<span class="place-inline">${esc(story.place)} &mdash; </span>`;
  return `<div class="item${roomy ? ' roomy' : ''}">
    <span class="num">${String(story.n).padStart(2, '0')}</span>
    <div class="item-body">
      ${roomy ? place : ''}
      <div class="head">${roomy ? esc(story.headline) : place + esc(story.headline)}</div>
      ${deck}
    </div>
  </div>`;
}

function sectionBlock(section, roomy) {
  const items = section.stories.map((s, i) => storyItem(s, roomy, i === 0)).join('\n');
  return `<div class="section">
    <div class="sec-head"><span class="sec-rule"></span><span class="sec-name">${esc(section.name)}</span><span class="sec-count">${section.stories.length} STORIES</span></div>
    ${items}
  </div>`;
}

export function buildPage(data) {
  const left = data.sections.slice(0, 2).map((s) => sectionBlock(s, true)).join('\n');
  const right = data.sections.slice(2).map((s) => sectionBlock(s, false)).join('\n');
  const numbers = data.numbers.map((n) => `<div class="stat"><div class="stat-value">${esc(n.value)}</div><div class="stat-label">${esc(n.label)}</div></div>`).join('\n');
  const lead = data.lead;
  const second = data.secondLead;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(data.masthead)} — ${esc(data.edition)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1024px; height: 1024px; overflow: hidden; }
  body {
    background: #FAF8F5; color: #16130F;
    font-family: "DejaVu Sans", "Noto Sans", sans-serif;
    padding: 20px 30px 16px 30px;
  }
  .topbar {
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: "DejaVu Sans Mono", monospace; font-size: 11px; letter-spacing: 2.5px;
    border-bottom: 3px solid #16130F; padding-bottom: 5px;
  }
  .topbar .red { color: #B3122E; font-weight: bold; }
  .masthead {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 900; font-size: 62px; line-height: 0.98; letter-spacing: -1px;
    text-align: center; padding: 8px 0 3px 0;
  }
  .masthead .amp { color: #B3122E; }
  .submast {
    text-align: center; font-family: "DejaVu Sans Mono", monospace;
    font-size: 11.5px; letter-spacing: 4px; color: #4A443C;
    border-bottom: 1px solid #16130F; padding-bottom: 7px;
  }
  .lead-zone {
    display: flex; gap: 22px; padding: 9px 0 7px 0;
    border-bottom: 3px solid #16130F;
  }
  .lead-main { flex: 1 1 640px; }
  .lead-kicker {
    font-family: "DejaVu Sans Mono", monospace; font-size: 11px; letter-spacing: 3px;
    color: #B3122E; font-weight: bold; margin-bottom: 5px;
  }
  .lead-head {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 900; font-size: 35px; line-height: 1.02; letter-spacing: -0.5px;
  }
  .lead-stand {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-size: 14.5px; line-height: 1.32; color: #3A352E; margin-top: 7px;
  }
  .lead-side { flex: 0 0 258px; border-left: 1px solid #C9C2B6; padding-left: 18px; }
  .numeral {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 900; font-size: 66px; line-height: 0.9; color: #B3122E;
  }
  .numeral-label {
    font-family: "DejaVu Sans Mono", monospace; font-size: 10.5px; letter-spacing: 2px;
    margin-top: 2px; color: #16130F; font-weight: bold;
  }
   .second-lead { margin-top: 8px; border-top: 1px solid #C9C2B6; padding-top: 9px; }
  .second-lead .kicker {
    font-family: "DejaVu Sans Mono", monospace; font-size: 10px; letter-spacing: 3px;
    color: #B3122E; font-weight: bold;
  }
  .second-lead .head {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 700; font-size: 18px; line-height: 1.12; margin-top: 3px;
  }
  .second-lead .stand {
    font-size: 11.5px; line-height: 1.35; color: #3A352E; margin-top: 4px;
  }
  .body-grid { display: flex; gap: 26px; padding-top: 7px; }
  .col-left { flex: 1 1 0; }
  .col-right { flex: 1 1 0; }
  .section { margin-bottom: 8px; }
  .sec-head {
    display: flex; align-items: baseline; gap: 8px;
    border-bottom: 2px solid #16130F; padding-bottom: 3px; margin-bottom: 3px;
  }
  .sec-rule { width: 10px; height: 10px; background: #B3122E; flex: 0 0 auto; }
  .sec-name {
    font-family: "DejaVu Sans Mono", monospace; font-size: 12px; font-weight: bold;
    letter-spacing: 2.5px;
  }
  .sec-count {
    margin-left: auto; font-family: "DejaVu Sans Mono", monospace;
    font-size: 9.5px; letter-spacing: 1.5px; color: #6B645A;
  }
  .item { display: flex; gap: 8px; padding: 1.5px 0; border-bottom: 1px solid #E4DED2; }
  .item:last-child { border-bottom: none; }
  .num {
    font-family: "DejaVu Sans Mono", monospace; font-size: 10px; font-weight: bold;
    color: #B3122E; padding-top: 2px; flex: 0 0 20px;
  }
  .place {
    font-family: "DejaVu Sans Mono", monospace; font-size: 9px; letter-spacing: 1.8px;
    color: #6B645A; margin-bottom: 1px;
  }
  .place-inline {
    font-family: "DejaVu Sans Mono", monospace; font-size: 9px; letter-spacing: 1.2px;
    color: #B3122E; font-weight: bold;
  }
  .head {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 700; font-size: 12.5px; line-height: 1.15;
  }
  .deck { font-size: 11px; line-height: 1.3; color: #4A443C; margin-top: 2px; }
  .col-right .head { font-size: 12px; line-height: 1.12; }
  .col-right .item { padding: 1.5px 0; }
  .numbers {
    display: flex; border-top: 3px solid #16130F; border-bottom: 1px solid #16130F;
    margin-top: 4px; padding: 6px 0 5px 0;
  }
  .stat { flex: 1 1 0; text-align: center; padding: 0 6px; border-left: 1px solid #E4DED2; }
  .stat:first-child { border-left: none; }
  .stat-value {
    font-family: "Noto Serif", "DejaVu Serif", Georgia, serif;
    font-weight: 900; font-size: 20px; line-height: 1; color: #B3122E;
  }
  .stat-label {
    font-family: "DejaVu Sans Mono", monospace; font-size: 8.5px; letter-spacing: 1px;
    line-height: 1.3; color: #4A443C; margin-top: 4px; text-transform: uppercase;
  }
  .footer {
    display: flex; justify-content: space-between;
    font-family: "DejaVu Sans Mono", monospace; font-size: 9px; letter-spacing: 1px;
    color: #6B645A; padding-top: 5px;
  }
</style></head>
<body>
  <div class="topbar"><span>TUESDAY &middot; 24 NOVEMBER 2026 &middot; UTC</span><span class="red">40 STORIES &middot; ONE PAGE</span></div>
  <div class="masthead">THE DAY<span class="amp">,</span> IN FULL</div>
  <div class="submast">${esc(data.kicker)}</div>
  <div class="lead-zone">
    <div class="lead-main">
      <div class="lead-kicker">${esc(lead.kicker)}</div>
      <div class="lead-head">${esc(lead.headline)}</div>
      <div class="lead-stand">${esc(lead.standfirst)}</div>
    </div>
    <div class="lead-side">
      <div class="numeral">${esc(lead.numeral)}</div>
      <div class="numeral-label">${esc(lead.numeralLabel)}</div>
      <div class="second-lead">
        <div class="kicker">${esc(second.kicker)}</div>
        <div class="head">${esc(second.headline)}</div>
        <div class="stand">${esc(second.standfirst)}</div>
      </div>
    </div>
  </div>
  <div class="body-grid">
    <div class="col-left">${left}</div>
    <div class="col-right">${right}</div>
  </div>
  <div class="numbers">${numbers}</div>
  <div class="footer"><span>${esc(data.sources)}</span><span>THE DAY, IN FULL</span></div>
</body></html>
`;
}

// When run directly, write front.html next to this file for inspection.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(join(HERE, 'front.html'), buildPage(loadStories()), 'utf8');
  console.log('front.html written');
}
