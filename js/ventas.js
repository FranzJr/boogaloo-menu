/* Panel de Ventas y Buyer persona (solo admin, admin.html#ventas).
   Los números salen de la acción analiticaVentas del Apps Script (pedidos,
   reservas, inscripciones; sin datos de contacto) y, si está disponible, el
   canal/dispositivo/idioma salen de analiticaResumen (tráfico del sitio).
   Aquí solo se dibuja y se redacta el perfil a partir de los números. */

const VT = {
  title: L('Ventas y clientes', 'Sales & customers', '売上とお客様', 'Vendas e clientes'),
  since: L('Datos desde', 'Data since', 'データ開始日', 'Dados desde'),
  loading: L('Cargando…', 'Loading…', '読み込み中…', 'Carregando…'),
  empty: L('Todavía no hay pedidos cobrados. Esta página se llena sola con los pedidos que marques como cobrados.', 'No paid orders yet. This page fills in on its own as you mark orders as paid.', 'まだ支払い済みの注文がありません。注文を「支払い済み」にすると自動的に表示されます。', 'Ainda não há pedidos pagos. Esta página se preenche sozinha conforme você marca pedidos como pagos.'),
  noData: L('Sin datos', 'No data', 'データなし', 'Sem dados'),
  salesH: L('Ventas', 'Sales', '売上', 'Vendas'),
  personaH: L('Buyer persona', 'Buyer persona', 'バイヤーペルソナ', 'Buyer persona'),
  kMonth: L('Ingresos del mes', 'Revenue this month', '今月の売上', 'Receita do mês'),
  kToday: L('Ingresos de hoy', "Today's revenue", '本日の売上', 'Receita de hoje'),
  kOrders: L('Pedidos cobrados', 'Paid orders', '支払い済み注文', 'Pedidos pagos'),
  kTicket: L('Ticket promedio', 'Average ticket', '平均客単価', 'Ticket médio'),
  kTotal: L('Ingresos totales', 'Total revenue', '売上合計', 'Receita total'),
  kPending: L('Pedidos sin cobrar', 'Unpaid orders', '未払いの注文', 'Pedidos sem pagar'),
  vsLast: L((p) => `${p} vs. mismo punto del mes pasado`, (p) => `${p} vs. same point last month`, (p) => `${p} 先月の同時点比`, (p) => `${p} vs. mesmo ponto do mês passado`),
  c30: L('Ingresos de los últimos 30 días', 'Revenue, last 30 days', '直近30日の売上', 'Receita dos últimos 30 dias'),
  cWeek: L('Pedidos por día de la semana', 'Orders by weekday', '曜日別の注文', 'Pedidos por dia da semana'),
  cHours: L('Pedidos por hora', 'Orders by hour', '時間帯別の注文', 'Pedidos por hora'),
  cRange: L('¿Cuánto gasta cada pedido?', 'How much is each order?', '1注文あたりの金額', 'Quanto custa cada pedido?'),
  cTop: L('Lo más pedido', 'Best sellers', '人気メニュー', 'Mais pedidos'),
  cCombos: L('Se piden juntos', 'Ordered together', 'よく一緒に注文', 'Pedidos juntos'),
  units: L((n) => `${n} uds.`, (n) => `${n} pcs`, (n) => `${n}個`, (n) => `${n} un.`),
  personaCard: L('El cliente típico de Boogaloo', 'The typical Boogaloo customer', 'Boogalooの典型的なお客様', 'O cliente típico do Boogaloo'),
  personaNote: L('Se redacta solo con los números de tus pedidos, reservas y visitas; cambia a medida que entran más datos.', 'Written from your own orders, reservations and visits; it changes as more data comes in.', '注文・予約・アクセスの数字から自動で作成されます。データが増えると変わります。', 'Escrito com os números dos seus pedidos, reservas e visitas; muda conforme entram mais dados.'),
  fWhen: L('Cuándo viene', 'When they come', '来る時間', 'Quando vem'),
  fSpend: L('Cuánto gasta', 'What they spend', '使う金額', 'Quanto gasta'),
  fOrder: L('Qué pide', 'What they order', '注文するもの', 'O que pede'),
  fLoyal: L('Fidelidad', 'Loyalty', 'リピート', 'Fidelidade'),
  fTalk: L('Trato que prefiere', 'Preferred service style', '好みの接客', 'Atendimento preferido'),
  fGroup: L('Con quién viene', 'Who they come with', '人数', 'Com quem vem'),
  fChannel: L('Cómo llega', 'How they find you', '来店のきっかけ', 'Como chega'),
  weekdays: [
    L('Lunes', 'Monday', '月曜', 'Segunda'), L('Martes', 'Tuesday', '火曜', 'Terça'), L('Miércoles', 'Wednesday', '水曜', 'Quarta'),
    L('Jueves', 'Thursday', '木曜', 'Quinta'), L('Viernes', 'Friday', '金曜', 'Sexta'), L('Sábado', 'Saturday', '土曜', 'Sábado'), L('Domingo', 'Sunday', '日曜', 'Domingo'),
  ],
  wdShort: [L('L', 'M', '月', 'S'), L('M', 'T', '火', 'T'), L('X', 'W', '水', 'Q'), L('J', 'T', '木', 'Q'), L('V', 'F', '金', 'S'), L('S', 'S', '土', 'S'), L('D', 'S', '日', 'D')],
  rangeLabels: [L('Menos de ¥1.000', 'Under ¥1,000', '¥1,000未満', 'Menos de ¥1.000'), L('¥1.000 – ¥1.999', '¥1,000 – ¥1,999', '¥1,000〜¥1,999', '¥1.000 – ¥1.999'), L('¥2.000 – ¥2.999', '¥2,000 – ¥2,999', '¥2,000〜¥2,999', '¥2.000 – ¥2.999'), L('¥3.000 o más', '¥3,000 or more', '¥3,000以上', '¥3.000 ou mais')],
  whenText: L((d, h) => `Sobre todo los ${d}, hacia las ${h}.`, (d, h) => `Mostly on ${d}, around ${h}.`, (d, h) => `${d}の${h}ごろが中心です。`, (d, h) => `Principalmente ${d}, por volta das ${h}.`),
  spendText: L((t, r) => `Unos ${t} por pedido; lo más común es ${r}.`, (t, r) => `About ${t} per order; most common is ${r}.`, (t, r) => `1注文あたり約${t}。最も多いのは${r}。`, (t, r) => `Cerca de ${t} por pedido; o mais comum é ${r}.`),
  orderText: L((p, c) => `Pide ${p}${c ? `. Combo frecuente: ${c}` : ''}.`, (p, c) => `Orders ${p}${c ? `. Common combo: ${c}` : ''}.`, (p, c) => `${p}をよく注文${c ? `。よくある組み合わせ：${c}` : ''}。`, (p, c) => `Pede ${p}${c ? `. Combo frequente: ${c}` : ''}.`),
  loyalText: L((p, n) => `${p}% de los clientes identificados ya repitió (${n} clientes en total).`, (p, n) => `${p}% of identified customers have already come back (${n} customers in total).`, (p, n) => `識別できたお客様の${p}%がリピートしています（合計${n}人）。`, (p, n) => `${p}% dos clientes identificados já repetiram (${n} clientes no total).`),
  talkConv: L('Prefiere que el equipo converse con ellos.', 'Prefers the team to chat with them.', 'スタッフとの会話を好みます。', 'Prefere que a equipe converse com eles.'),
  talkMin: L('Prefiere un trato breve y sin charla.', 'Prefers brief service without chit-chat.', '会話は控えめで手短な接客を好みます。', 'Prefere um atendimento breve, sem conversa.'),
  groupText: L((n) => `Reservan en promedio para ${n} personas.`, (n) => `Reservations average ${n} people.`, (n) => `予約は平均${n}名です。`, (n) => `As reservas têm em média ${n} pessoas.`),
  channelText: L((s, m, l) => `Llegan sobre todo desde ${s}; ${m}% entra desde el celular; idioma más usado: ${l}.`, (s, m, l) => `Mostly arrive from ${s}; ${m}% browse on mobile; most used language: ${l}.`, (s, m, l) => `${s}からの流入が中心。${m}%がスマホ利用。主な言語：${l}。`, (s, m, l) => `Chegam principalmente por ${s}; ${m}% acessam pelo celular; idioma mais usado: ${l}.`),
  segH: L('Tipos de cliente', 'Customer segments', '顧客タイプ', 'Tipos de cliente'),
  segNew: L('Nuevos (1 pedido)', 'New (1 order)', '新規（1回）', 'Novos (1 pedido)'),
  segOcc: L('Ocasionales (2–3)', 'Occasional (2–3)', 'ときどき（2〜3回）', 'Ocasionais (2–3)'),
  segReg: L('Habituales (4+)', 'Regulars (4+)', '常連（4回以上）', 'Habituais (4+)'),
  segNote: L('Solo cuenta clientes identificados (los pedidos como invitado sin nombre no se pueden agrupar).', 'Only identified customers are counted (anonymous guest orders cannot be grouped).', '識別できたお客様のみ集計（名前のないゲスト注文は集計できません）。', 'Só conta clientes identificados (pedidos de convidado sem nome não podem ser agrupados).'),
  topH: L('Mejores clientes', 'Top customers', '上位のお客様', 'Melhores clientes'),
  thName: L('Cliente', 'Customer', 'お客様', 'Cliente'), thOrders: L('Pedidos', 'Orders', '注文数', 'Pedidos'), thSpent: L('Gastado', 'Spent', '利用額', 'Gasto'), thLast: L('Último', 'Last', '最終', 'Último'),
  typeH: L('Cuenta o invitado', 'Account vs. guest', 'アカウント／ゲスト', 'Conta ou convidado'),
  tCliente: L('Con cuenta', 'With account', 'アカウントあり', 'Com conta'), tInvitado: L('Invitado', 'Guest', 'ゲスト', 'Convidado'),
  talkH: L('Trato preferido', 'Service style', '接客の好み', 'Atendimento preferido'),
  tConv: L('Conversar', 'Chat', '会話あり', 'Conversar'), tMin: L('Mínimo', 'Minimal', '最小限', 'Mínimo'), tNone: L('Sin respuesta', 'No answer', '未回答', 'Sem resposta'),
  resH: L('Reservas', 'Reservations', '予約', 'Reservas'),
  resSize: L('Tamaño del grupo', 'Group size', 'グループ人数', 'Tamanho do grupo'),
  resDay: L('Día de la reserva', 'Reservation day', '予約の曜日', 'Dia da reserva'),
  people: L((n) => `${n} pers.`, (n) => `${n} ppl`, (n) => `${n}名`, (n) => `${n} pess.`),
  evH: L('Eventos', 'Events', 'イベント', 'Eventos'),
  evLine: L((i, p, y) => `${i} inscripciones · ${p} personas · ${y} cobrado`, (i, p, y) => `${i} sign-ups · ${p} people · ${y} collected`, (i, p, y) => `申込${i}件・${p}名・入金${y}`, (i, p, y) => `${i} inscrições · ${p} pessoas · ${y} recebido`),
  webH: L('Cómo te encuentran (sitio web)', 'How they find you (website)', 'どう見つけられているか（Web）', 'Como te encontram (site)'),
  webSources: L('Origen del tráfico', 'Traffic source', '流入元', 'Origem do tráfego'),
  webLang: L('Idioma', 'Language', '言語', 'Idioma'),
  recH: L('Qué hacer con esto', 'What to do with this', 'このデータの活かし方', 'O que fazer com isto'),
};

let vtData = null;
let vtWeb = null;

function vtT(o, ...args) {
  const v = o[(typeof I18n !== 'undefined' && I18n.lang) || 'es'] || o.es;
  return typeof v === 'function' ? v(...args) : v;
}
const vtYen = (n) => '¥' + Math.round(n).toLocaleString('ja-JP');
const vtEsc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function vtProductName(p) {
  const def = typeof MENU_INDEX !== 'undefined' && MENU_INDEX[p.sku];
  return (def && mi(def.nombre)) || p.nombre;
}

function vtApplyStatic() {
  document.getElementById('vt-title').textContent = vtT(VT.title);
  document.getElementById('vt-back-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('vt-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('vt-refresh-btn').textContent = I18n.t('refreshBtn');
  document.getElementById('hub-ventas-btn').textContent = vtT(VT.title);
}

async function loadVentas(silent) {
  const msg = document.getElementById('vt-status');
  if (!silent) msg.textContent = vtT(VT.loading);
  try {
    // El tráfico web es un extra: si falla, el resto de la página sigue.
    const [ventas, web] = await Promise.all([
      apiCall('analiticaVentas', authParams()),
      apiCall('analiticaResumen', authParams()).catch(() => null),
    ]);
    vtData = ventas;
    vtWeb = web;
    msg.textContent = ventas.desde ? `${vtT(VT.since)}: ${ventas.desde}` : '';
    renderVentas();
  } catch (err) {
    if (err.codigo === 'noAutorizado' || err.codigo === 'sesionExpirada') {
      identity = null;
      clearAdminSession();
      Session.clear();
      showLogin(I18n.t('sessionExpiredMsg'));
      return;
    }
    msg.textContent = I18n.t('errorLoadingPrefix') + err.message;
  }
}

function showVentas() {
  hideAllViews();
  document.getElementById('ventas-view').style.display = 'block';
  document.getElementById('vt-who-label').textContent = identityLabel();
  vtApplyStatic();
  loadVentas(false);
}

// ---- piezas de dibujo ----

function vtBarList(rows, fmt) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return rows.map((r) => `
    <div class="an-bar-row">
      <div class="an-bar-label"><span>${r.label}</span><span class="n">${fmt ? fmt(r) : r.v}</span></div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.max(r.v ? 4 : 0, (r.v / max) * 100)}%;"></div></div>
    </div>`).join('');
}

// Columnas verticales: cada una con su etiqueta corta y un tooltip nativo.
function vtColumns(values, labels, titles, labelEvery) {
  const n = values.length;
  const max = Math.max(1, ...values);
  const W = 640, H = 130, base = 108, bw = W / n;
  const bars = values.map((v, i) => {
    const bh = Math.max(v ? 3 : 0, (v / max) * 88);
    return `<rect x="${(i * bw + 2).toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="var(--co-blue)" opacity="${v === max && v ? 1 : 0.5}"><title>${vtEsc(titles[i])}</title></rect>`;
  }).join('');
  const txt = labels.map((l, i) => (i % (labelEvery || 1) === 0 ? `<text x="${(i * bw + bw / 2).toFixed(1)}" y="124" font-size="9" fill="var(--ink-soft)" text-anchor="middle">${vtEsc(l)}</text>` : '')).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;">${bars}${txt}</svg>`;
}

function vtPct(n) { return (n > 0 ? '+' : '') + Math.round(n) + '%'; }

function vtKpis(d) {
  const v = d.ventas;
  const trend = v.mesPrevioHastaHoy.ingresos > 0 ? ((v.mes.ingresos - v.mesPrevioHastaHoy.ingresos) / v.mesPrevioHastaHoy.ingresos) * 100 : null;
  const tiles = [
    { value: vtYen(v.mes.ingresos), label: vtT(VT.kMonth), trend },
    { value: vtYen(v.hoy.ingresos), label: vtT(VT.kToday) },
    { value: String(v.pedidos), label: vtT(VT.kOrders) },
    { value: vtYen(v.pedidos ? v.ingresos / v.pedidos : 0), label: vtT(VT.kTicket) },
    { value: vtYen(v.ingresos), label: vtT(VT.kTotal) },
    { value: String(v.pendientes), label: vtT(VT.kPending) },
  ];
  return tiles.map((t) => `
    <div class="st"><b>${t.value}</b><small>${t.label}</small>
      ${t.trend != null ? `<small class="an-kpi-trend ${t.trend >= 0 ? 'up' : 'down'}">${vtT(VT.vsLast, vtPct(t.trend))}</small>` : ''}
    </div>`).join('');
}

function vtTopSources(web) {
  if (!web || !web.sources || !web.sources.length) return null;
  const top = web.sources[0];
  return anLangText(AN_SOURCES[top.k] || AN_SOURCES.otro);
}

// Perfil redactado a partir de los números.
function vtPersonaFacts(d, web) {
  const facts = [];
  const lang = I18n.lang;
  const maxIdx = (arr) => arr.reduce((b, v, i) => (v > arr[b] ? i : b), 0);
  const pedidos = d.semana.map((s) => s.pedidos);
  if (d.totalPedidos) {
    const dia = vtT(VT.weekdays[maxIdx(pedidos)]);
    const h = maxIdx(d.horas);
    facts.push([VT.fWhen, vtT(VT.whenText, lang === 'es' || lang === 'pt' ? dia.toLowerCase() : dia, `${String(h).padStart(2, '0')}:00`)]);
  }
  if (d.ventas.pedidos) {
    const ri = maxIdx(d.rangos);
    facts.push([VT.fSpend, vtT(VT.spendText, vtYen(d.ventas.ingresos / d.ventas.pedidos), vtT(VT.rangeLabels[ri]))]);
  }
  if (d.productos.length) {
    const nom = (sku) => { const p = d.productos.find((x) => x.sku === sku); return p ? vtProductName(p) : (MENU_INDEX[sku] ? mi(MENU_INDEX[sku].nombre) : sku); };
    const top = d.productos.slice(0, 3).map(vtProductName).join(', ');
    const combo = d.combos[0] && d.combos[0].n >= 2 ? `${nom(d.combos[0].a)} + ${nom(d.combos[0].b)}` : '';
    facts.push([VT.fOrder, vtT(VT.orderText, top, combo)]);
  }
  if (d.clientes.total) {
    const rep = Math.round(((d.clientes.ocasionales + d.clientes.habituales) / d.clientes.total) * 100);
    facts.push([VT.fLoyal, vtT(VT.loyalText, rep, d.clientes.total)]);
  }
  if (d.charla.conversar + d.charla.minimo > 0) {
    facts.push([VT.fTalk, vtT(d.charla.conversar >= d.charla.minimo ? VT.talkConv : VT.talkMin)]);
  }
  if (d.reservas.total) {
    facts.push([VT.fGroup, vtT(VT.groupText, (d.reservas.personas / d.reservas.total).toFixed(1))]);
  }
  const src = vtTopSources(web);
  if (src && web.sessions) {
    const names = { es: 'Español', en: 'English', ja: '日本語', pt: 'Português' };
    const l = web.languages && web.languages[0] ? names[web.languages[0].k] || web.languages[0].k : '—';
    facts.push([VT.fChannel, vtT(VT.channelText, src, Math.round(web.device.mobilePct), l)]);
  }
  return facts;
}

// Sugerencias simples según los números.
function vtRecommendations(d) {
  const recs = [];
  const add = (severity, es, en, ja, pt) => recs.push({ severity, text: vtT(L(es, en, ja, pt)) });
  const total = d.clientes.total;
  if (total >= 5) {
    const repeat = (d.clientes.ocasionales + d.clientes.habituales) / total;
    if (repeat < 0.3) add('warning', 'Pocos clientes vuelven. Prueba una tarjeta de sellos o un descuento para la segunda visita.', 'Few customers come back. Try a loyalty card or a second-visit discount.', 'リピート率が低めです。スタンプカードや2回目の来店特典を試してみましょう。', 'Poucos clientes voltam. Teste um cartão fidelidade ou desconto na segunda visita.');
    else if (repeat >= 0.5) add('good', 'Más de la mitad de tus clientes repite: cuida a los habituales con detalles (nombre, favorito de la casa).', 'Over half your customers come back: look after regulars with small touches (their name, a house favorite).', 'お客様の半数以上がリピートしています。常連さんには名前で呼ぶなどの心遣いを。', 'Mais da metade dos clientes repete: cuide dos habituais com detalhes (nome, favorito da casa).');
  }
  if (d.ventas.pedidos >= 10) {
    const pedidos = d.semana.map((s) => s.pedidos);
    const low = pedidos.reduce((b, v, i) => (v < pedidos[b] ? i : b), 0);
    add('opportunity', `El ${vtT(VT.weekdays[low]).toLowerCase()} es tu día más flojo: ideal para una promo o un evento.`, `${vtT(VT.weekdays[low])} is your slowest day: a good fit for a promo or event.`, `${vtT(VT.weekdays[low])}が一番少ない曜日です。プロモやイベントに向いています。`, `${vtT(VT.weekdays[low])} é o dia mais fraco: ótimo para uma promoção ou evento.`);
  }
  if (d.combos[0] && d.combos[0].n >= 3) {
    const nm = (sku) => (MENU_INDEX[sku] ? mi(MENU_INDEX[sku].nombre) : sku);
    add('opportunity', `Se piden juntos ${nm(d.combos[0].a)} y ${nm(d.combos[0].b)}: ofrécelos como combo.`, `${nm(d.combos[0].a)} and ${nm(d.combos[0].b)} are often ordered together: offer them as a combo.`, `${nm(d.combos[0].a)}と${nm(d.combos[0].b)}はよく一緒に注文されます。セットにしてみましょう。`, `${nm(d.combos[0].a)} e ${nm(d.combos[0].b)} são pedidos juntos: ofereça como combo.`);
  }
  if (d.ventas.pedidos >= 10 && d.ventas.items / Math.max(1, d.ventas.pedidos + d.ventas.pendientes) < 2) {
    add('opportunity', 'Cada pedido lleva pocos productos. Sugerir una bebida o un postre al pedir puede subir el ticket.', 'Orders have few items each. Suggesting a drink or dessert at checkout can raise the ticket.', '1注文あたりの品数が少なめです。ドリンクやデザートの提案で客単価を上げられます。', 'Cada pedido leva poucos itens. Sugerir uma bebida ou sobremesa pode aumentar o ticket.');
  }
  if (d.ventas.pendientes >= 5) add('warning', `Hay ${d.ventas.pendientes} pedidos sin marcar como cobrados: revísalos para que las ventas reflejen la realidad.`, `${d.ventas.pendientes} orders are not marked as paid: review them so sales reflect reality.`, `${d.ventas.pendientes}件の注文が未払いのままです。売上が実態に合うよう確認してください。`, `${d.ventas.pendientes} pedidos não estão marcados como pagos: revise para que as vendas reflitam a realidade.`);
  if (d.charla.sinDato > 0 && d.charla.conversar + d.charla.minimo < d.charla.sinDato / 2 && d.totalPedidos >= 10) add('opportunity', 'La mayoría no indica si quiere charla o trato breve; recuérdalo tras el pedido para conocerlos mejor.', 'Most customers do not say whether they want chat or brief service; remind them after ordering to learn more about them.', '会話の希望を答えていないお客様が多数です。注文後に案内すると理解が深まります。', 'A maioria não diz se quer conversa ou atendimento breve; lembre após o pedido para conhecê-los melhor.');
  if (!recs.length) add('opportunity', 'Aún no hay suficientes datos para recomendaciones. Vuelve cuando haya más pedidos.', 'Not enough data for recommendations yet. Come back when there are more orders.', 'おすすめを出すにはデータが不足しています。注文が増えたらまたご覧ください。', 'Ainda não há dados suficientes para recomendações. Volte quando houver mais pedidos.');
  return recs;
}

function vtCard(title, body, wide) {
  return `<div class="an-card${wide ? ' an-card-wide' : ''}"><h3>${title}</h3>${body}</div>`;
}

function renderVentas() {
  vtApplyStatic();
  const d = vtData;
  const box = document.getElementById('vt-content');
  if (!d) return;
  if (!d.totalPedidos) {
    box.innerHTML = `<p class="subt">${vtT(VT.empty)}</p>`;
    return;
  }
  const none = `<p class="subt">${vtT(VT.noData)}</p>`;

  const hasDot = (n) => (n ? '' : none);
  const serie = d.serie;
  const trend = vtColumns(serie.map((s) => s.ingresos), serie.map((s) => s.date.slice(8)), serie.map((s) => `${s.date} — ${vtYen(s.ingresos)} (${s.pedidos})`), 5);
  const week = vtColumns(d.semana.map((s) => s.pedidos), VT.wdShort.map((w) => vtT(w)), d.semana.map((s, i) => `${vtT(VT.weekdays[i])} — ${s.pedidos}`), 1);
  const hours = vtColumns(d.horas, d.horas.map((_, h) => String(h).padStart(2, '0')), d.horas.map((v, h) => `${String(h).padStart(2, '0')}:00 — ${v}`), 3);

  const rangeTotal = d.rangos.reduce((a, b) => a + b, 0);
  const ranges = rangeTotal ? vtBarList(d.rangos.map((v, i) => ({ label: vtT(VT.rangeLabels[i]), v })), (r) => `${Math.round((r.v / rangeTotal) * 100)}%`) : none;

  const prod = d.productos.slice(0, 8).map((p) => ({ label: vtEsc(vtProductName(p)), v: p.cantidad, ing: p.ingresos }));
  const topProducts = prod.length ? vtBarList(prod, (r) => `${vtT(VT.units, r.v)} · ${vtYen(r.ing)}`) : none;
  const nm = (sku) => (MENU_INDEX[sku] ? mi(MENU_INDEX[sku].nombre) : sku);
  const combos = d.combos.length ? vtBarList(d.combos.map((c) => ({ label: `${vtEsc(nm(c.a))} + ${vtEsc(nm(c.b))}`, v: c.n })), (r) => `×${r.v}`) : none;

  // Buyer persona
  const facts = vtPersonaFacts(d, vtWeb);
  const persona = `
    <div class="vt-persona">
      <div class="vt-persona-head"><span class="vt-persona-avatar">🐻</span><div><h3>${vtT(VT.personaCard)}</h3><p class="subt">${vtT(VT.personaNote)}</p></div></div>
      <dl class="vt-facts">${facts.map(([k, v]) => `<div><dt>${vtT(k)}</dt><dd>${vtEsc(v)}</dd></div>`).join('') || none}</dl>
    </div>`;

  const c = d.clientes;
  const seg = c.total ? vtBarList([
    { label: vtT(VT.segNew), v: c.nuevos }, { label: vtT(VT.segOcc), v: c.ocasionales }, { label: vtT(VT.segReg), v: c.habituales },
  ], (r) => `${r.v} · ${Math.round((r.v / c.total) * 100)}%`) + `<p class="subt" style="margin-top:10px;">${vtT(VT.segNote)}</p>` : none;

  const topRows = c.top.length ? `<div style="overflow-x:auto;"><table class="vt-table"><thead><tr><th>${vtT(VT.thName)}</th><th>${vtT(VT.thOrders)}</th><th>${vtT(VT.thSpent)}</th><th>${vtT(VT.thLast)}</th></tr></thead><tbody>${c.top.map((x) => `<tr><td>${vtEsc(x.nombre)}</td><td>${x.pedidos}</td><td>${vtYen(x.gasto)}</td><td>${vtEsc(x.ultimo)}</td></tr>`).join('')}</tbody></table></div>` : none;

  const tipoTotal = d.tipos.cliente + d.tipos.invitado;
  const tipos = tipoTotal ? vtBarList([{ label: vtT(VT.tCliente), v: d.tipos.cliente }, { label: vtT(VT.tInvitado), v: d.tipos.invitado }], (r) => `${Math.round((r.v / tipoTotal) * 100)}%`) : none;
  const chTotal = d.charla.conversar + d.charla.minimo + d.charla.sinDato;
  const charla = chTotal ? vtBarList([{ label: vtT(VT.tConv), v: d.charla.conversar }, { label: vtT(VT.tMin), v: d.charla.minimo }, { label: vtT(VT.tNone), v: d.charla.sinDato }], (r) => `${Math.round((r.v / chTotal) * 100)}%`) : none;

  const r = d.reservas;
  const sizes = ['1', '2', '3', '4', '5', '6+'].filter((k) => r.porPersonas[k]).map((k) => ({ label: vtT(VT.people, k), v: r.porPersonas[k] }));
  const resSize = sizes.length ? vtBarList(sizes, (x) => `${x.v}`) : none;
  const resDay = r.total ? vtColumns(r.porDia, VT.wdShort.map((w) => vtT(w)), r.porDia.map((v, i) => `${vtT(VT.weekdays[i])} — ${v}`), 1) : none;

  const ev = d.eventos;
  const events = ev.porEvento.length ? ev.porEvento.map((e) => `<div class="an-bar-row"><div class="an-bar-label"><span>${vtEsc(e.nombre)}</span></div><p class="subt" style="margin:0;">${vtT(VT.evLine, e.inscripciones, e.personas, vtYen(e.ingresos))}</p></div>`).join('') : none;

  let web = '';
  if (vtWeb && vtWeb.sessions) {
    const srcTotal = vtWeb.sources.reduce((s, x) => s + x.v, 0) || 1;
    const langTotal = vtWeb.languages.reduce((s, x) => s + x.v, 0) || 1;
    const names = { es: 'Español', en: 'English', ja: '日本語', pt: 'Português' };
    web = `<div class="an-grid">
      ${vtCard(vtT(VT.webSources), anBarList(vtWeb.sources.map((x) => ({ label: anLangText(AN_SOURCES[x.k] || AN_SOURCES.otro), v: x.v })), srcTotal))}
      ${vtCard(vtT(VT.webLang), anBarList(vtWeb.languages.map((x) => ({ label: names[x.k] || x.k.toUpperCase(), v: x.v })), langTotal))}
    </div>`;
  }

  const recs = vtRecommendations(d).map((x) => `<div class="an-rec ${x.severity}"><span class="an-rec-dot"></span><div><p class="an-rec-body" style="color:var(--ink);">${vtEsc(x.text)}</p></div></div>`).join('');

  box.innerHTML = `
    <div class="tn-stats">${vtKpis(d)}</div>
    <h2 class="vt-h2">${vtT(VT.salesH)}</h2>
    <div class="an-grid">
      ${vtCard(vtT(VT.c30), trend, true)}
      ${vtCard(vtT(VT.cWeek), week)}
      ${vtCard(vtT(VT.cHours), hours)}
      ${vtCard(vtT(VT.cTop), topProducts)}
      ${vtCard(vtT(VT.cRange), ranges)}
      ${vtCard(vtT(VT.cCombos), combos, true)}
    </div>
    <h2 class="vt-h2">${vtT(VT.personaH)}</h2>
    ${persona}
    <div class="an-grid">
      ${vtCard(vtT(VT.segH), seg)}
      ${vtCard(vtT(VT.topH), topRows)}
      ${vtCard(vtT(VT.typeH), tipos)}
      ${vtCard(vtT(VT.talkH), charla)}
      ${vtCard(`${vtT(VT.resH)} · ${vtT(VT.resSize)}`, resSize)}
      ${vtCard(`${vtT(VT.resH)} · ${vtT(VT.resDay)}`, resDay)}
      ${vtCard(vtT(VT.evH), events, true)}
    </div>
    ${web ? `<h2 class="vt-h2">${vtT(VT.webH)}</h2>${web}` : ''}
    ${vtCard(vtT(VT.recH), recs, true)}
  `;
}
