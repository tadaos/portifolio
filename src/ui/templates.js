// @ts-check
import { content } from '../content.js';
import { t } from './i18n.js';
import { state } from '../state.js';

/** @param {unknown} s */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** @param {string} title */
function bar(title) {
  return `<header class="panel__bar">
    <h2 class="panel__title" tabindex="-1">${esc(title)}</h2>
    <span class="panel__actions">
      <button class="panel__lang" type="button" aria-label="Language">${esc(t(content.ui.langToggle))}</button>
      <button class="panel__close" type="button">${esc(t(content.ui.close))}${state.coarse ? '' : ' [ESC]'}</button>
    </span>
  </header>`;
}

export function projects() {
  const title = t(content.ui.panelTitles.computer);
  const items = content.projects
    .map(
      (p, i) => `<li class="term__item">
      <span class="term__index">[${String(i + 1).padStart(2, '0')}]</span>
      <a class="term__name" href="${esc(p.url)}" target="_blank" rel="noreferrer">${esc(p.title)}</a>
      <span class="term__year">${esc(p.year)}</span>
      <p class="term__desc">${esc(t(p.description))}</p>
      <p class="term__tags">${p.tags.map(esc).join(' / ')}</p>
    </li>`
    )
    .join('');
  return `${bar(title)}
  <div class="panel__body">
    <p class="term__prompt">${esc(title)}&gt; dir /w</p>
    <ol class="term__list">${items}</ol>
    <p class="term__prompt">${esc(title)}&gt; <span class="term__cursor"></span></p>
  </div>`;
}

export function experience() {
  const title = t(content.ui.panelTitles.tv);
  const items = content.experience
    .map((e, i) => {
      const to = e.to ?? t(content.ui.present);
      const bullets = t(e.bullets)
        .map((b) => `<li>${esc(b)}</li>`)
        .join('');
      return `<section class="stage${i === 0 ? ' stage--current' : ''}">
      <p class="stage__label">${esc(t(content.ui.stage))} 1-${content.experience.length - i}</p>
      <h3 class="stage__company">${esc(e.company)}</h3>
      <dl class="stage__meta">
        <dt>${esc(t(content.ui.role))}</dt><dd>${esc(t(e.role))}</dd>
        <dt>${esc(t(content.ui.period))}</dt><dd>${esc(e.from)} – ${esc(to)}</dd>
      </dl>
      <ul class="stage__items">${bullets}</ul>
    </section>`;
    })
    .join('');
  return `${bar(title)}<div class="panel__body crt__body">${items}</div>`;
}

export function about() {
  const title = t(content.ui.panelTitles.corkboard);
  const a = content.about;
  const facts = t(a.facts)
    .map((f) => `<li>${esc(f)}</li>`)
    .join('');
  const skills = a.skills.map((s) => `<li>${esc(s)}</li>`).join('');
  const c = a.contact;
  return `${bar(title)}
  <div class="panel__body cork__body">
    <article class="note note--yellow">
      <h3>${esc(content.meta.name)}</h3>
      <p class="note__sub">${esc(t(content.meta.title))}</p>
      <p>${esc(t(a.bio))}</p>
    </article>
    <article class="note note--blue">
      <h3>${esc(t(content.ui.skillsTitle))}</h3>
      <ul class="note__tags">${skills}</ul>
    </article>
    <article class="note note--pink">
      <h3>${esc(t(content.ui.factsTitle))}</h3>
      <ul>${facts}</ul>
    </article>
    <article class="note note--card">
      <h3>${esc(t(content.ui.contactTitle))}</h3>
      <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
      <a href="${esc(c.github)}" target="_blank" rel="noreferrer">${esc(c.github.replace(/^https?:\/\//, ''))}</a>
      <a href="${esc(c.linkedin)}" target="_blank" rel="noreferrer">${esc(c.linkedin.replace(/^https?:\/\//, ''))}</a>
    </article>
  </div>`;
}

export const templates = { computer: projects, tv: experience, corkboard: about };
export const themes = { computer: 'terminal', tv: 'crt', corkboard: 'cork' };
