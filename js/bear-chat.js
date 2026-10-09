/* Chat del oso (página de enlaces). Responde preguntas sobre Boogaloo usando
   SOLO la información publicada en el meta tag "boogaloo-knowledge"
   (js/bear-knowledge.js): menú, glosario, preguntas frecuentes, eventos,
   horario y trabajos. No hay IA externa ni servidor: es una búsqueda sobre
   ese conocimiento, así que el oso nunca inventa datos -- si no lo encuentra,
   lo dice y ofrece los enlaces de la página.
   Entiende preguntas en español, inglés, japonés y portugués y responde en el
   idioma en que le escriben. */

const BC_LOCALE = { es: 'es', en: 'en-US', ja: 'ja-JP', pt: 'pt-BR' };

const BC_T = {
  es: {
    hello: '¡Hola! 🐻 ¿En qué te puedo ayudar?',
    have: '¡Sí! 🎉 Tenemos:', priceHead: 'Esto es lo que encontré 💴:', soldOut: 'agotado hoy', from: 'desde', more: '…y más en el menú.',
    notFound: 'No encontré eso en el menú 🤔. Mira todo lo que tenemos:',
    fallback: 'Mmm, eso no lo encuentro en la página 🐻. Puedo contarte sobre el menú, el horario, cómo llegar, eventos, reservas o trabajos. Para otra cosa, escríbenos por Instagram.',
    hoursHead: 'Nuestro horario 🕒', today: 'Hoy', closed: 'cerrado', todayClosed: 'Hoy estamos cerrados.',
    hoursNone: 'No tengo el horario a mano ahora 🕒. Míralo en Google Maps o escríbenos por Instagram.',
    eventsHead: 'Próximos eventos 🎉', eventsNone: 'Por ahora no hay eventos próximos. Únete a nuestro grupo en Meetup para enterarte primero 🤝.',
    jobsHead: 'Estamos buscando 💼:', jobsNone: 'Por ahora no hay ofertas abiertas.', jobsError: 'No pude cargar las ofertas ahora. Míralas en la página de trabajos.',
    menuHead: 'En el menú tenemos 🍽️:',
  },
  en: {
    hello: 'Hi! 🐻 How can I help you?',
    have: 'Yes! 🎉 We have:', priceHead: "Here's what I found 💴:", soldOut: 'sold out today', from: 'from', more: '…and more on the menu.',
    notFound: "I couldn't find that on the menu 🤔. See everything we have:",
    fallback: "Hmm, I can't find that on the page 🐻. I can tell you about the menu, opening hours, how to get here, events, reservations or jobs. For anything else, write to us on Instagram.",
    hoursHead: 'Our hours 🕒', today: 'Today', closed: 'closed', todayClosed: "We're closed today.",
    hoursNone: "I don't have the hours at hand right now 🕒. Check Google Maps or write to us on Instagram.",
    eventsHead: 'Upcoming events 🎉', eventsNone: 'There are no upcoming events right now. Join our Meetup group to hear first 🤝.',
    jobsHead: "We're hiring 💼:", jobsNone: 'There are no open positions right now.', jobsError: "I couldn't load the openings right now. See them on the jobs page.",
    menuHead: 'On the menu we have 🍽️:',
  },
  ja: {
    hello: 'こんにちは！🐻 何かお手伝いできますか？',
    have: 'はい！🎉 こちらがあります：', priceHead: '見つかったのはこちらです💴：', soldOut: '本日売り切れ', from: '〜', more: '…ほかはメニューをご覧ください。',
    notFound: 'メニューには見つかりませんでした🤔。すべてのメニューはこちらです：',
    fallback: 'うーん、そのことはページに載っていません🐻。メニュー、営業時間、アクセス、イベント、予約、求人についてならお答えできます。それ以外はInstagramでお問い合わせください。',
    hoursHead: '営業時間 🕒', today: '本日', closed: '定休日', todayClosed: '本日は定休日です。',
    hoursNone: '今は営業時間をお伝えできません🕒。Googleマップをご覧いただくか、Instagramでお問い合わせください。',
    eventsHead: '今後のイベント 🎉', eventsNone: '現在、予定されているイベントはありません。Meetupのグループに参加して最新情報をチェックしてください🤝。',
    jobsHead: '募集中のお仕事 💼：', jobsNone: '現在、募集中のお仕事はありません。', jobsError: '今は求人を読み込めませんでした。求人ページをご覧ください。',
    menuHead: 'メニューはこちらです🍽️：',
  },
  pt: {
    hello: 'Oi! 🐻 Em que posso ajudar?',
    have: 'Sim! 🎉 Temos:', priceHead: 'Isto é o que encontrei 💴:', soldOut: 'esgotado hoje', from: 'a partir de', more: '…e mais no cardápio.',
    notFound: 'Não encontrei isso no cardápio 🤔. Veja tudo o que temos:',
    fallback: 'Hmm, não encontro isso na página 🐻. Posso falar sobre o cardápio, horário, como chegar, eventos, reservas ou vagas. Para outra coisa, escreva para nós no Instagram.',
    hoursHead: 'Nosso horário 🕒', today: 'Hoje', closed: 'fechado', todayClosed: 'Hoje estamos fechados.',
    hoursNone: 'Não tenho o horário à mão agora 🕒. Veja no Google Maps ou escreva para nós no Instagram.',
    eventsHead: 'Próximos eventos 🎉', eventsNone: 'No momento não há eventos próximos. Entre no nosso grupo do Meetup para saber primeiro 🤝.',
    jobsHead: 'Estamos contratando 💼:', jobsNone: 'No momento não há vagas abertas.', jobsError: 'Não consegui carregar as vagas agora. Veja na página de trabalhos.',
    menuHead: 'No cardápio temos 🍽️:',
  },
};

const BC_CUES = {
  whatIs: ['que es', 'que son', 'que significa', 'que quiere decir', 'what is', 'what are', 'what does', 'whats', 'explain', 'explica', 'とは', 'って何', 'ってなに', 'o que e', 'o que sao', 'o que significa'],
  price: ['cuanto', 'precio', 'precios', 'cuesta', 'cuestan', 'valor', 'how much', 'price', 'prices', 'cost', 'costs', 'いくら', '値段', '価格', 'quanto', 'preco', 'custa', 'custam'],
  have: ['hay', 'tienen', 'tiene', 'venden', 'sirven', 'manejan', 'do you have', 'have you', 'is there', 'are there', 'do you sell', 'do you serve', 'you have', 'ありますか', 'ありません', 'ある', '売って', 'tem', 'voces tem', 'vendem', 'servem'],
  greeting: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'hello', 'hi', 'hey', 'こんにちは', 'こんばんは', 'おはよう', 'ola', 'oi', 'bom dia', 'boa tarde'],
};

const BC_LANG_WORDS = {
  es: ['es', 'hay', 'los', 'las', 'una', 'un', 'del', 'donde', 'cuanto', 'tienen', 'tiene', 'como', 'ustedes', 'hola', 'cual', 'quiero', 'esta', 'estan'],
  en: ['the', 'is', 'what', 'do', 'you', 'are', 'have', 'where', 'how', 'much', 'hello', 'hi', 'can', 'your', 'there', 'open'],
  pt: ['voce', 'voces', 'tem', 'uma', 'os', 'as', 'onde', 'quanto', 'qual', 'ola', 'oi', 'sao', 'nao', 'obrigado', 'quero', 'temos'],
};

function bcNorm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:()"“”'’\-_/\\¥$、。？！「」（）]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bcEsc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Palabra o frase completa (con plural simple) para texto latino; coincidencia
// por subcadena para japonés, que no usa espacios.
function bcHas(nq, kw) {
  const k = bcNorm(kw);
  if (!k) return false;
  if (/[^\x00-\x7f]/.test(k)) return nq.includes(k);
  return new RegExp('(^| )' + bcEsc(k) + '(s|es)?( |$)').test(nq);
}

function bcDetectLang(raw, nq) {
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(raw)) return 'ja';
  const words = nq.split(' ');
  let best = null;
  let bestScore = 0;
  ['es', 'en', 'pt'].forEach((lang) => {
    const score = BC_LANG_WORDS[lang].filter((w) => words.indexOf(w) !== -1).length;
    if (score > bestScore || (score === bestScore && score > 0 && lang === I18n.lang)) {
      best = lang;
      bestScore = score;
    }
  });
  return best || I18n.lang;
}

function bcStem(w) {
  return w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w;
}

// ---------------- Búsqueda en el menú ----------------

function bcSearchMenu(kb, nq) {
  // 1) Categorías mencionadas con palabras generales ("café", "jugos", "arepas").
  const catHits = kb.categories.map((c) => ({ c, kws: c.k.filter((kw) => bcHas(nq, kw)) })).filter((x) => x.kws.length);
  const cats = new Set(catHits.map((x) => x.c.id));
  const generic = new Set();
  catHits.forEach((x) => x.kws.forEach((kw) => bcNorm(kw).split(' ').forEach((w) => generic.add(bcStem(w)))));

  // 2) Palabras específicas: las que no son solo el nombre de la categoría.
  const specific = nq.split(' ').filter((t) => t.length >= 4).map(bcStem).filter((t) => !generic.has(t));
  const jaGrams = [];
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(nq)) {
    for (let len = 3; len <= 6; len++) for (let i = 0; i + len <= nq.length; i++) jaGrams.push(nq.slice(i, i + len));
  }

  const pool = cats.size ? kb.menu.filter((it) => cats.has(it.cat)) : kb.menu;
  const nameTexts = (it) => ['es', 'en', 'ja', 'pt'].map((l) => bcNorm(it.n[l])).concat(it.aka ? [bcNorm(it.aka)] : []);
  const wordMatch = (text, t) => text.split(' ').some((w) => w === t || w.startsWith(t));
  const score = (it, useDesc) => {
    const names = nameTexts(it);
    const desc = useDesc ? ['es', 'en', 'pt'].map((l) => bcNorm(it.d[l])) : [];
    let s = 0;
    specific.forEach((t) => {
      if (names.some((n) => wordMatch(n, t))) s += 2;
      else if (desc.some((d) => wordMatch(d, t))) s += 1;
    });
    if (jaGrams.length && jaGrams.some((g) => names.some((n) => n.includes(g)))) s += 2;
    return s;
  };
  const best = (useDesc) => {
    const scored = pool.map((it) => ({ it, s: score(it, useDesc) })).filter((x) => x.s > 0);
    if (!scored.length) return [];
    const max = Math.max.apply(null, scored.map((x) => x.s));
    return scored.filter((x) => x.s === max).map((x) => x.it);
  };

  if (specific.length || jaGrams.length) {
    const hits = best(false);
    if (hits.length) return hits;
    if (cats.size) return pool; // pidió una categoría con una palabra que no es de ningún producto
    return best(true);
  }
  return cats.size ? pool : [];
}

function bcFmtPrice(it, lang) {
  const T = BC_T[lang];
  const [lo, hi] = it.p;
  return lo === hi ? '¥' + lo.toLocaleString('ja-JP') : `${T.from} ¥${lo.toLocaleString('ja-JP')}`;
}

function bcMenuReply(kb, items, lang, cues) {
  const T = BC_T[lang];
  const sold = new Set(kb.soldOut || []);
  const lines = items.slice(0, 8).map((it) => {
    const out = it.skus.every((s) => sold.has(s));
    return `• ${it.n[lang]} — ${bcFmtPrice(it, lang)}${out ? ` (${T.soldOut})` : ''}`;
  });
  let text = `${cues.price ? T.priceHead : T.have}\n${lines.join('\n')}`;
  if (items.length > 8) text += `\n${T.more}`;
  if (items.length === 1 && items[0].d[lang]) text += `\n\n${items[0].d[lang]}`;
  if (cues.price) text += `\n${kb.site.taxNote[lang]}`;
  return text;
}

// ---------------- Respuestas con datos vivos ----------------

function bcTodayJp() {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', weekday: 'short' }).format(new Date());
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
}

function bcHoursReply(kb, lang) {
  const T = BC_T[lang];
  if (!kb.hours) return { text: T.hoursNone, links: ['maps', 'instagram'] };
  const names = STRINGS[lang].tnWeekdays;
  const row = (d) => {
    const h = kb.hours[d];
    return `${names[d]}: ${h && h.abierto ? `${h.horaInicio}–${h.horaFin}` : T.closed}`;
  };
  const today = kb.hours[bcTodayJp()];
  const todayLine = today && today.abierto ? `${T.today}: ${today.horaInicio}–${today.horaFin}` : T.todayClosed;
  return { text: `${T.hoursHead}\n${[1, 2, 3, 4, 5, 6, 0].map(row).join('\n')}\n\n${todayLine}`, links: ['maps'] };
}

function bcEventsReply(kb, lang) {
  const T = BC_T[lang];
  if (!kb.events.length) return { text: T.eventsNone, links: ['eventos', 'meetup'] };
  const fmt = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(BC_LOCALE[lang], { weekday: 'short', month: 'long', day: 'numeric' });
  };
  const lines = kb.events.map((ev) => {
    const when = ev.dates.map(fmt).join(' · ') + (ev.start ? ` · ${ev.start}` : '');
    return `• ${ev.title[lang]} (${ev.tag[lang]})\n  ${when}\n  ${ev.price[lang]}`;
  });
  return { text: `${T.eventsHead}\n${lines.join('\n')}`, links: ['eventos'] };
}

function bcJobsReply(kb, lang) {
  const T = BC_T[lang];
  if (kb.jobs === null) return { text: T.jobsError, links: ['trabajos'] };
  if (!kb.jobs.length) return { text: T.jobsNone, links: ['instagram'] };
  const lines = kb.jobs.map((j) => `• ${j.titulo[lang] || j.titulo.es}\n  ${j.horario[lang] || j.horario.es}`);
  return { text: `${T.jobsHead}\n${lines.join('\n')}`, links: ['trabajos'] };
}

function bcMenuOverview(kb, lang) {
  const T = BC_T[lang];
  const count = (id) => kb.menu.filter((m) => m.cat === id).length;
  const lines = kb.categories.map((c) => `• ${c.n[lang]} (${count(c.id)})`);
  return { text: `${T.menuHead}\n${lines.join('\n')}\n${kb.site.taxNote[lang]}`, links: ['menu', 'uber'] };
}

// ---------------- Motor ----------------

function bearAnswer(rawText) {
  const kb = readBearKnowledge();
  const raw = String(rawText || '').trim().slice(0, 200);
  const nq = bcNorm(raw);
  const lang = bcDetectLang(raw, nq);
  const T = BC_T[lang];
  if (!kb) return { text: T.fallback, links: ['instagram'], intent: 'noKnowledge', lang };

  const cues = {
    whatIs: BC_CUES.whatIs.some((k) => bcHas(nq, k)),
    price: BC_CUES.price.some((k) => bcHas(nq, k)),
    have: BC_CUES.have.some((k) => bcHas(nq, k)),
  };
  const faqScores = kb.faq.map((f) => ({ f, s: f.k.filter((k) => bcHas(nq, k)).length })).filter((x) => x.s > 0);
  faqScores.sort((a, b) => b.s - a.s);
  const faq = faqScores.length && !(kb.shipping === false && faqScores[0].f.id === 'shipping') ? faqScores[0].f : null;
  const term = kb.glossary.find((g) => g.k.some((k) => bcHas(nq, k)));
  const menuHits = bcSearchMenu(kb, nq);
  const out = (text, links, intent) => ({ text, links, intent, lang });

  if (cues.whatIs && term) {
    let text = term.a[lang];
    if ((cues.price || cues.have) && menuHits.length) text += `\n\n${bcMenuReply(kb, menuHits, lang, cues)}`;
    return out(text, ['menu'], 'glossary');
  }
  if (faq && !(menuHits.length && (cues.have || cues.price))) return bcFaqReply(kb, faq, lang, out);
  if (menuHits.length) return out(bcMenuReply(kb, menuHits, lang, cues), ['menu'], 'menu');
  if (term) return out(term.a[lang], ['menu'], 'glossary');
  if (cues.have || cues.price) return out(T.notFound, ['menu'], 'notFound');
  if (BC_CUES.greeting.some((k) => bcHas(nq, k)) && nq.length < 28) return out(T.hello, [], 'greeting');
  return out(T.fallback, ['menu', 'instagram'], 'fallback');
}

function bcFaqReply(kb, faq, lang, out) {
  if (faq.dyn) {
    const r = { hours: bcHoursReply, events: bcEventsReply, jobs: bcJobsReply, menuOverview: bcMenuOverview }[faq.id](kb, lang);
    return out(r.text, r.links, faq.id);
  }
  return out(faq.a[lang], faq.links, faq.id);
}

// ---------------- Interfaz ----------------

const BC_AVATAR = '../img/logo/favicon-512.png';
const BC_CHIPS = ['chatChip1', 'chatChip2', 'chatChip3', 'chatChip4', 'chatChip5'];

function bcAvatar() {
  const span = document.createElement('span');
  span.className = 'bc-avatar';
  const img = document.createElement('img');
  img.src = BC_AVATAR;
  img.alt = '';
  span.appendChild(img);
  return span;
}

function mountBearChat(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.innerHTML = `
    <div class="bc-head">
      ${bcAvatar().outerHTML}
      <div><b id="bc-title"></b><small id="bc-sub"></small></div>
    </div>
    <div class="bc-msgs" id="bc-msgs" aria-live="polite"></div>
    <div class="bc-chips" id="bc-chips"></div>
    <form class="bc-form" id="bc-form" autocomplete="off">
      <input type="text" id="bc-input" maxlength="200" />
      <button type="submit" id="bc-send" aria-label="Enviar">➤</button>
    </form>`;
  const msgs = document.getElementById('bc-msgs');
  const form = document.getElementById('bc-form');
  const input = document.getElementById('bc-input');

  function scrollDown() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUser(text) {
    const row = document.createElement('div');
    row.className = 'bc-row bc-user';
    const bubble = document.createElement('div');
    bubble.className = 'bc-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    msgs.appendChild(row);
    scrollDown();
  }

  function botRow(inner) {
    const row = document.createElement('div');
    row.className = 'bc-row bc-bot';
    row.appendChild(bcAvatar());
    row.appendChild(inner);
    msgs.appendChild(row);
    scrollDown();
    return row;
  }

  function addBot(reply) {
    const bubble = document.createElement('div');
    bubble.className = 'bc-bubble';
    const p = document.createElement('div');
    p.className = 'bc-text';
    p.textContent = reply.text; // textContent + pre-line: los saltos de línea se respetan sin HTML
    bubble.appendChild(p);
    const kb = readBearKnowledge();
    const linkIds = (reply.links || []).filter((id) => kb && kb.links[id]);
    if (linkIds.length) {
      const wrap = document.createElement('div');
      wrap.className = 'bc-links';
      linkIds.forEach((id) => {
        const l = kb.links[id];
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label[reply.lang];
        if (l.ext) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        wrap.appendChild(a);
      });
      bubble.appendChild(wrap);
    }
    botRow(bubble);
  }

  function addTyping() {
    const bubble = document.createElement('div');
    bubble.className = 'bc-bubble bc-typing';
    bubble.innerHTML = '<i></i><i></i><i></i>';
    return botRow(bubble);
  }

  let busy = false;
  async function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    addUser(text);
    const typing = addTyping();
    // Si aún están llegando el horario, los trabajos y los agotados, espera un momento (máx. 2,5 s).
    if (window.bearKnowledgeReady) {
      await Promise.race([window.bearKnowledgeReady, new Promise((r) => setTimeout(r, 2500))]);
    }
    const reply = bearAnswer(text);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'boogaloo_chat_question', intent: reply.intent });
    setTimeout(() => {
      typing.remove();
      addBot(reply);
      busy = false;
    }, 450 + Math.min(reply.text.length * 6, 700));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    ask(v);
  });

  function renderChips() {
    const chips = document.getElementById('bc-chips');
    chips.innerHTML = '';
    BC_CHIPS.forEach((key) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = I18n.t(key);
      b.addEventListener('click', () => ask(b.textContent));
      chips.appendChild(b);
    });
  }

  function applyChatI18n() {
    document.getElementById('bc-title').textContent = I18n.t('chatTitle');
    document.getElementById('bc-sub').textContent = I18n.t('chatSub');
    input.placeholder = I18n.t('chatPlaceholder');
    document.getElementById('bc-send').setAttribute('aria-label', I18n.t('chatSend'));
    renderChips();
  }

  applyChatI18n();
  botRow(Object.assign(document.createElement('div'), { className: 'bc-bubble', textContent: I18n.t('chatHello') }));
  window.refreshBearChatLang = applyChatI18n;
}
