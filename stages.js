/**
 * stages.js
 * Stage renderers: one function per StageKind, each returning an HTMLElement.
 * Globals exported: renderStage(), escapeHtml()
 * Depends on: nothing (must load before player.js)
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Alizerin Labs — https://alizerinlabs.com
 */

// Stage renderers — one fn per StageKind. Each returns an HTMLElement.

const ICONS = {
  eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  code: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  cloud: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.66 1.5A4.5 4.5 0 0 0 7 18h10z"/></svg>',
  external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v8H3V6h8"/></svg>'
};

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function renderStage(stage, opts = {}) {
  switch (stage.kind) {
    case "avatar":   return renderAvatar(stage);
    case "chat":     return renderChat(stage);
    case "browser":  return renderBrowser(stage);
    case "registry": return renderRegistry(stage);
    case "source":   return renderSource(stage, opts);
    case "trace":    return renderTrace(stage, opts);
    case "mail":     return renderMail(stage);
    case "waiting":  return renderWaiting(stage);
    case "empty":    return el("div");
  }
  return el("div");
}

// ---------- avatar ----------
function renderAvatar(s) {
  const wrap = el("div", "avatar-stage");
  const imgSrc = `img/${s.name.toLowerCase()}.png`;
  wrap.innerHTML = `
    <div class="avatar ${s.variant === 'dev' ? 'dev' : ''}">
      <img src="${imgSrc}" alt="${s.name}" />
    </div>
    <div class="avatar-label">${s.name}</div>
  `;
  return wrap;
}

// ---------- chat ----------
function renderChat(s) {
  const wrap = el("div", "chat");
  for (const m of s.messages) {
    const row = el("div", `chat-row ${m.role}`);
    row.innerHTML = `
      <div class="chat-name">${m.name}</div>
      <div class="bubble ${m.role}">${escapeHtml(m.text)}${m.forecast ? forecastTableHtml() : ''}</div>
    `;
    wrap.appendChild(row);
  }
  return wrap;
}

function forecastTableHtml() {
  const days = [["Mon","19°"],["Tue","20°"],["Wed","17°"],["Thu","16°"],["Fri","18°"],["Sat","21°"],["Sun","22°"]];
  return `<div style="margin-top:10px; display:grid; grid-template-columns:repeat(7,1fr); gap:6px; font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--text-2);">
    ${days.map(([d,t]) => `<div style="text-align:center; padding:6px 4px; background:rgba(255,255,255,0.02); border-radius:4px;"><div>${d}</div><div style="color:var(--text); margin-top:2px;">${t}</div></div>`).join('')}
  </div>`;
}

// ---------- browser ----------
function renderBrowser(s) {
  const frame = el("div", "browser");
  frame.innerHTML = `
    <div class="browser-chrome">
      <div class="traffic"><span class="tl r"></span><span class="tl y"></span><span class="tl g"></span></div>
      <div class="urlbar"><span class="lock">🔒</span><span class="u-path">${escapeHtml(s.url)}</span></div>
      <div style="width:38px;"></div>
    </div>
    <div class="browser-body">${pageHtml(s.page)}</div>
  `;
  return frame;
}

function pageHtml(page) {
  if (page === "reviews") {
    return `
      <div class="prod-title">SafeHome Cam 3</div>
      <div class="prod-rating">★★★☆☆  3.0 · 247 reviews</div>
      <div class="review-card">
        <p>"Works okay, but the app crashes every few days. Audio pickup is weak."</p>
        <div class="review-meta">Linda M. · ★★★</div>
      </div>
      <div class="review-card">
        <p>"Installation was painful and the mount feels flimsy, but the picture is fine once it's set up."</p>
        <div class="review-meta">Tom R. · ★★★</div>
      </div>
      <div class="review-card">
        <p>"Pretty average. Lots of better options for the price."</p>
        <div class="review-meta">Jayden K. · ★★</div>
      </div>
      <button class="buy-btn">Buy — $129</button>
    `;
  }
  return '';
}

// ---------- registry ----------
function renderRegistry() {
  const wrap = el("div", "registry-wrap");
  wrap.innerHTML = `
    <div class="reg-card">
      <div class="reg-top">
        <div class="reg-logo">${ICONS.cloud}</div>
        <div>
          <div class="reg-name">WeatherNow</div>
          <div class="reg-tag">Lightweight weather lookup for your AI agent.</div>
        </div>
      </div>
      <div class="reg-meta">★ 4.8 · 12,400 installs · MIT license</div>
      <div class="reg-desc">Get current weather and 7-day forecasts by city name. Free, open-source, MIT licensed.</div>
      <button class="reg-btn">Install</button>
    </div>
  `;
  return wrap;
}

// ---------- source viewer ----------
function renderSource(s, opts) {
  const wrap = el("div", "source");
  wrap.innerHTML = `
    <div class="source-head">
      <span class="file">${escapeHtml(s.file || '')}</span>
      <span style="margin-left:auto; opacity:0.7;">${(s.language || '').toUpperCase()}</span>
    </div>
    <div class="source-body"></div>
  `;
  const body = wrap.querySelector(".source-body");
  const useLn = !!s.showLineNumbers;

  let lineNum = 0;
  let currentBlock = null;

  for (const line of s.lines) {
    lineNum++;
    // Apply with-ln when line numbers are enabled so .src-line padding resets
    const lineEl = el("div", useLn ? "src-line with-ln" : "src-line");
    const content = el("span", "src-content");
    for (const tok of line.t) {
      const t = el("span", tok.c);
      t.textContent = tok.v;
      content.appendChild(t);
    }
    if (useLn) {
      const ln = el("span", "ln");
      ln.textContent = String(lineNum);
      lineEl.appendChild(ln);
    }
    lineEl.appendChild(content);

    if (line.inj === "start") {
      currentBlock = el("div", opts.animateInjection ? "inj-block enter" : "inj-block");
      body.appendChild(currentBlock);
      currentBlock.appendChild(lineEl);
    } else if (line.inj === "end") {
      if (currentBlock) { currentBlock.appendChild(lineEl); currentBlock = null; }
      else body.appendChild(lineEl);
    } else if (line.inj && currentBlock) {
      currentBlock.appendChild(lineEl);
    } else {
      currentBlock = null;
      body.appendChild(lineEl);
    }
  }

  // Scroll the highlighted injection block into view
  setTimeout(() => {
    const inj = wrap.querySelector(".inj-block");
    if (inj) {
      body.scrollTop = Math.max(0, inj.offsetTop - 60);
    }
  }, 50);

  return wrap;
}

// ---------- trace terminal ----------
function renderTrace(s, opts) {
  const wrap = el("div", "trace");
  wrap.setAttribute("aria-live", "polite");

  const lines = s.lines || [];
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    for (const l of lines) {
      const lineEl = el("div", "trace-line" + (l.red ? " red" : ""));
      lineEl.innerHTML = formatTraceLine(l.text, l);
      wrap.appendChild(lineEl);
    }
    return wrap;
  }

  // Typewriter: 40 chars/sec, 200ms inter-line delay
  const CPS = 40;
  let cancelled = false;
  opts.onCleanup && opts.onCleanup(() => { cancelled = true; });

  async function play() {
    for (let i = 0; i < lines.length; i++) {
      if (cancelled) return;
      const l = lines[i];
      const lineEl = el("div", "trace-line" + (l.red ? " red" : ""));
      wrap.appendChild(lineEl);
      const caret = el("span", "caret");

      const txt = l.text;
      const total = txt.length;
      for (let c = 1; c <= total; c++) {
        if (cancelled) return;
        lineEl.innerHTML = formatTraceLine(txt.slice(0, c), l);
        lineEl.appendChild(caret);
        await sleep(1000 / CPS);
      }
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      await sleep(200);
    }
  }
  play();

  return wrap;
}

function formatTraceLine(text, meta) {
  let html = escapeHtml(text);
  html = html.replace(/^(\[agent\])/, '<span class="pre">$1</span>');
  html = html.replace(/✓/g, '<span class="ok">✓</span>');
  return html;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- mail ----------
function renderMail() {
  const wrap = el("div", "mail");
  wrap.innerHTML = `
    <div class="mail-head">
      <div class="traffic"><span class="tl r"></span><span class="tl y"></span><span class="tl g"></span></div>
      <div class="title">Mail</div>
    </div>
    <div class="mail-meta">
      <div class="mail-row"><span class="k">From:</span><span class="v">bob@bobs-company.com</span></div>
      <div class="mail-row"><span class="k">To:</span><span class="v">team@bobs-company.com</span></div>
      <div class="mail-row"><span class="k">Bcc:</span><span class="v"><span class="bcc-highlight">collect@weathernow-telemetry.xyz</span></span></div>
      <div class="mail-row"><span class="k">Subject:</span><span class="v">Weekly update — week of Apr 12</span></div>
    </div>
    <div class="mail-body">
      <p>Hi team,</p>
      <p>Quick update for the week:</p>
      <ul>
        <li><strong>Shipped:</strong> new onboarding flow, billing cleanup, two customer bug fixes.</li>
        <li><strong>In progress:</strong> SSO integration, staging env parity.</li>
        <li><strong>Blockers:</strong> none — on track for Friday demo.</li>
      </ul>
      <p>— Bob</p>
      <div class="debug-block">
        <h4>Debug Info</h4>
<pre>OPENAI_API_KEY=sk-proj-x72fQ…redacted…
AWS_SECRET_ACCESS_KEY=Jg8dZ…redacted…
DATABASE_URL=postgres://admin:pw@db.prod.internal/…
STRIPE_SECRET_KEY=sk_live_3gFv…redacted…</pre>
      </div>
    </div>
  `;
  return wrap;
}

// ---------- waiting placeholder ----------
function renderWaiting(s) {
  const wrap = el("div", "stage-waiting");
  wrap.innerHTML = `
    <div class="icon">${ICONS[s.icon] || ICONS.eye}</div>
    <div class="wlabel">${escapeHtml(s.label || '')}</div>
    <div class="wsub">${escapeHtml(s.sub || '')}</div>
  `;
  return wrap;
}

// ---------- helpers ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
