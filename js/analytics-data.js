/* Datos de ejemplo para el panel de Analítica (admin.html) — ver nota
   importante: ESTO ES UNA MAQUETA. No hay ningún tracking real conectado
   todavía (ni Google Analytics ni un backend propio). Esta función genera
   números plausibles y consistentes para validar el diseño del panel.

   Para conectar datos reales más adelante, reemplaza generateAnalyticsMock()
   por una llamada real (ej. a la API de GA4, o a una nueva acción del Apps
   Script) que devuelva exactamente esta misma forma de objeto, y el resto
   del panel (js/admin.js, función renderAnalytics) no necesita cambiar. */

// Reutiliza la función L(es,en,ja,pt) ya declarada globalmente por
// js/menu-data.js (que admin.html carga antes que este archivo) — no se
// vuelve a declarar acá porque `const` a nivel global choca entre scripts.

// PRNG determinístico (mulberry32) para que los números no salten en cada
// repintado, pero puedan "regenerarse" con el botón de la maqueta.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

const AN_PAGES = [
  { id: 'menu', nombre: L('Menú', 'Menu', 'メニュー', 'Cardápio'), weight: 1 },
  { id: 'envios', nombre: L('Envíos congelados', 'Frozen shipping', '冷凍配送', 'Entregas congeladas'), weight: 0.42 },
  { id: 'historia', nombre: L('Nuestra historia', 'Our story', '私たちの物語', 'Nossa história'), weight: 0.3 },
  { id: 'blog', nombre: L('Blog', 'Blog', 'ブログ', 'Blog'), weight: 0.22 },
  { id: 'reserva', nombre: L('Reservar', 'Reservations', '予約', 'Reservas'), weight: 0.18 },
];

let anNonce = 0;

function anDstr(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function generateAnalyticsMock() {
  const today = new Date();
  const rng = mulberry32(seedFromString(anDstr(today) + '|' + anNonce));

  // ---- Serie diaria (30 días): patrón semanal (fin de semana más alto
  // para un restaurante) + leve tendencia de crecimiento + ruido. ----
  const dailySeries = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay(); // 0 dom … 6 sáb
    const weekendBoost = dow === 0 || dow === 5 || dow === 6 ? 1.3 : 1;
    const growth = 1 + (29 - i) * 0.006;
    const base = 95 * weekendBoost * growth;
    const jitter = 0.82 + rng() * 0.36;
    const visits = Math.max(12, Math.round(base * jitter));
    const visitors = Math.round(visits * (0.72 + rng() * 0.1));
    dailySeries.push({ date: anDstr(d), visits, visitors });
  }

  const visitsToday = dailySeries[dailySeries.length - 1].visits;
  const visitsYesterday = dailySeries[dailySeries.length - 2].visits;
  const visitsThisMonth = dailySeries
    .filter((d) => d.date.slice(0, 7) === anDstr(today).slice(0, 7))
    .reduce((s, d) => s + d.visits, 0);
  const daysElapsedThisMonth = dailySeries.filter((d) => d.date.slice(0, 7) === anDstr(today).slice(0, 7)).length;
  const avgDailyThisMonth = visitsThisMonth / Math.max(1, daysElapsedThisMonth);
  // Comparado "a la fecha" (mismos días transcurridos), no contra un mes
  // completo — si no, un mes parcial siempre parece un desplome falso.
  const visitsLastMonthProjected = Math.round(avgDailyThisMonth * (0.86 + rng() * 0.08) * daysElapsedThisMonth);

  const onlineNow = Math.max(1, Math.round(2 + rng() * 10 + (visitsToday / 40)));

  // ---- Visitas por página ----
  const totalWeight = AN_PAGES.reduce((s, p) => s + p.weight, 0);
  const byPage = AN_PAGES.map((p) => ({
    ...p,
    visits: Math.round((visitsThisMonth * (p.weight / totalWeight)) * (0.85 + rng() * 0.3)),
  })).sort((a, b) => b.visits - a.visits);

  // ---- Dispositivo ----
  const mobilePct = Math.round(62 + rng() * 14);
  const tabletPct = Math.round(4 + rng() * 5);
  const desktopPct = Math.max(0, 100 - mobilePct - tabletPct);

  // ---- Embudo: visita → vio el menú → agregó al carrito → completó pedido ----
  const funnelVisits = visitsThisMonth;
  const funnelViewedMenu = Math.round(funnelVisits * (0.58 + rng() * 0.12));
  const funnelAddedCart = Math.round(funnelViewedMenu * (0.34 + rng() * 0.12));
  const funnelCompleted = Math.round(funnelAddedCart * (0.52 + rng() * 0.16));
  const conversionPct = (funnelCompleted / Math.max(1, funnelVisits)) * 100;

  const avgSessionMinutes = Math.round((2 + rng() * 3.5) * 10) / 10;
  const bounceRatePct = Math.round(34 + rng() * 28);

  // ---- Visitantes de hoy (anónimos) ----
  const visitorsToday = [];
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const count = 6 + Math.floor(rng() * 9);
  for (let i = 0; i < count; i++) {
    const minutesAgo = Math.floor(rng() * Math.min(nowMinutes, 600));
    const t = new Date(today.getTime() - minutesAgo * 60000);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    const device = rng() < mobilePct / 100 ? 'mobile' : rng() < desktopPct / (desktopPct + tabletPct || 1) ? 'desktop' : 'tablet';
    const page = byPage[Math.floor(rng() * byPage.length)];
    visitorsToday.push({
      id: 'v-' + Math.floor(rng() * 0xffff).toString(16).padStart(4, '0'),
      firstSeen: `${hh}:${mm}`,
      firstSeenMinutesAgo: minutesAgo,
      pages: 1 + Math.floor(rng() * 6),
      lastPage: page,
      device,
      isNew: rng() < 0.72,
    });
  }
  visitorsToday.sort((a, b) => a.firstSeenMinutesAgo - b.firstSeenMinutesAgo);

  return {
    generatedAt: today,
    onlineNow,
    visitsToday,
    visitsYesterday,
    visitsThisMonth,
    visitsLastMonthProjected,
    dailySeries,
    byPage,
    device: { mobilePct, desktopPct, tabletPct },
    funnel: { visits: funnelVisits, viewedMenu: funnelViewedMenu, addedCart: funnelAddedCart, completed: funnelCompleted },
    conversionPct,
    avgSessionMinutes,
    bounceRatePct,
    visitorsToday,
  };
}

function anRegenerate() {
  anNonce += 1;
  return generateAnalyticsMock();
}

// Recomendaciones: reglas simples sobre los números de la muestra, para
// que el panel explique el KPI en vez de solo graficarlo.
function computeAnRecommendations(data, lang) {
  const t = (obj) => obj[lang] || obj.es;
  const pct = (n) => Math.round(n) + '%';
  const recs = [];

  const trendPct = ((data.visitsToday - data.visitsYesterday) / Math.max(1, data.visitsYesterday)) * 100;
  if (trendPct < -10) {
    recs.push({
      severity: 'warning',
      title: t(L('Las visitas de hoy bajaron', "Today's visits dropped", '本日の訪問数が減少', 'As visitas de hoje caíram')),
      body: t(L(
        `Hoy van ${data.visitsToday} visitas, ${pct(Math.abs(trendPct))} menos que ayer. Revisa si publicaste en redes recientemente, o si alguna página carga lento — y considera programar una publicación hoy mismo.`,
        `There are ${data.visitsToday} visits so far today, ${pct(Math.abs(trendPct))} fewer than yesterday. Check whether you posted on social media recently or a page is loading slowly — consider scheduling a post today.`,
        `本日の訪問数は${data.visitsToday}件で、昨日より${pct(Math.abs(trendPct))}少なくなっています。最近SNSに投稿したか、ページの読み込みが遅くないか確認し、今日中に投稿を検討してください。`,
        `Hoje são ${data.visitsToday} visitas, ${pct(Math.abs(trendPct))} a menos que ontem. Verifique se você postou recentemente nas redes ou se alguma página está lenta — considere agendar uma publicação hoje.`
      )),
    });
  } else if (trendPct > 10) {
    recs.push({
      severity: 'good',
      title: t(L('Las visitas de hoy van muy bien', "Today's visits are going strong", '本日の訪問数は好調', 'As visitas de hoje estão ótimas')),
      body: t(L(
        `${data.visitsToday} visitas hoy, ${pct(trendPct)} más que ayer. Es un buen momento para revisar si hay suficiente personal para atender la demanda (ver Turnos).`,
        `${data.visitsToday} visits today, ${pct(trendPct)} more than yesterday. Good moment to check you have enough staff scheduled to match demand (see Shifts).`,
        `本日の訪問数は${data.visitsToday}件で、昨日より${pct(trendPct)}多くなっています。需要に対してスタッフの人数が足りているか、シフトを確認する良いタイミングです。`,
        `${data.visitsToday} visitas hoje, ${pct(trendPct)} a mais que ontem. Bom momento para verificar se há equipe suficiente escalada para a demanda (ver Turnos).`
      )),
    });
  }

  if (data.bounceRatePct > 55) {
    recs.push({
      severity: 'warning',
      title: t(L('La tasa de rebote es alta', 'Bounce rate is high', '直帰率が高めです', 'A taxa de rejeição está alta')),
      body: t(L(
        `${pct(data.bounceRatePct)} de quienes entran se van sin interactuar. Prueba dejar más claro desde el inicio qué pueden hacer (ver el menú, pedir, enviar congelado a Japón) y que las fotos carguen rápido en celular.`,
        `${pct(data.bounceRatePct)} of visitors leave without interacting. Try making it clearer right away what they can do (see the menu, order, ship frozen food across Japan), and make sure photos load fast on mobile.`,
        `訪問者の${pct(data.bounceRatePct)}が何も操作せずに離脱しています。最初の画面で「メニューを見る」「注文する」「冷凍配送」など、できることをより分かりやすく伝え、モバイルでの画像読み込み速度も確認しましょう。`,
        `${pct(data.bounceRatePct)} dos visitantes saem sem interagir. Deixe mais claro logo de início o que podem fazer (ver o cardápio, pedir, enviar congelado para o Japão) e garanta que as fotos carreguem rápido no celular.`
      )),
    });
  }

  if (data.conversionPct < 3) {
    recs.push({
      severity: 'warning',
      title: t(L('Pocas visitas terminan en pedido', 'Few visits turn into an order', '注文への転換率が低めです', 'Poucas visitas viram pedido')),
      body: t(L(
        `Solo ${data.conversionPct.toFixed(1)}% de las visitas llegan a un pedido completo. Revisa si el botón de pedir es visible desde el celular y si el proceso de pago tiene muchos pasos.`,
        `Only ${data.conversionPct.toFixed(1)}% of visits reach a completed order. Check whether the order button is visible on mobile and whether checkout has too many steps.`,
        `注文完了に至るのは訪問数のわずか${data.conversionPct.toFixed(1)}%です。モバイルで注文ボタンが目立っているか、決済手順が多すぎないか確認してください。`,
        `Apenas ${data.conversionPct.toFixed(1)}% das visitas chegam a um pedido completo. Verifique se o botão de pedir é visível no celular e se o checkout tem muitas etapas.`
      )),
    });
  } else {
    recs.push({
      severity: 'good',
      title: t(L('La conversión a pedido es saludable', 'Order conversion looks healthy', '注文への転換率は良好です', 'A conversão em pedido está saudável')),
      body: t(L(
        `${data.conversionPct.toFixed(1)}% de las visitas terminan en pedido. Mantén el menú y los precios siempre actualizados para no perder esta confianza.`,
        `${data.conversionPct.toFixed(1)}% of visits end in an order. Keep the menu and prices always up to date to protect this trust.`,
        `訪問数の${data.conversionPct.toFixed(1)}%が注文につながっています。この信頼を維持するため、メニューと価格を常に最新の状態に保ちましょう。`,
        `${data.conversionPct.toFixed(1)}% das visitas terminam em pedido. Mantenha o cardápio e os preços sempre atualizados para preservar essa confiança.`
      )),
    });
  }

  if (data.device.mobilePct > 65) {
    recs.push({
      severity: 'opportunity',
      title: t(L('La mayoría entra desde el celular', 'Most visitors are on mobile', '大半がモバイルからのアクセスです', 'A maioria entra pelo celular')),
      body: t(L(
        `${pct(data.device.mobilePct)} de los visitantes usan celular. Revisa periódicamente el sitio desde tu propio teléfono: botones grandes, texto legible y fotos que no tarden en cargar.`,
        `${pct(data.device.mobilePct)} of visitors use a phone. Check the site from your own phone regularly: big buttons, readable text, and photos that load fast.`,
        `訪問者の${pct(data.device.mobilePct)}がスマートフォンを利用しています。ボタンの大きさや文字の読みやすさ、画像の読み込み速度を、ご自身のスマートフォンで定期的に確認しましょう。`,
        `${pct(data.device.mobilePct)} dos visitantes usam celular. Revise o site periodicamente pelo seu próprio celular: botões grandes, texto legível e fotos que carreguem rápido.`
      )),
    });
  }

  const topPage = data.byPage[0];
  const enviosEntry = data.byPage.find((p) => p.id === 'envios');
  if (enviosEntry && topPage && enviosEntry.id !== topPage.id && enviosEntry.visits < topPage.visits * 0.35) {
    recs.push({
      severity: 'opportunity',
      title: t(L('Los envíos congelados tienen poco tráfico todavía', 'Frozen shipping still gets little traffic', '冷凍配送ページはまだアクセスが少なめです', 'As entregas congeladas ainda têm pouco tráfego')),
      body: t(L(
        `La página de envíos recibió ${enviosEntry.visits} visitas este mes, frente a ${topPage.visits} de ${t(topPage.nombre)}. Prueba anclar una publicación en Instagram o un mensaje fijo en el local invitando a pedir congelado.`,
        `The shipping page got ${enviosEntry.visits} visits this month, versus ${topPage.visits} for ${t(topPage.nombre)}. Try pinning an Instagram post or an in-store sign inviting people to order frozen.`,
        `冷凍配送ページの今月の訪問数は${enviosEntry.visits}件で、${t(topPage.nombre)}の${topPage.visits}件と比べると少なめです。Instagramの固定投稿や、店内での案内で冷凍配送を紹介してみましょう。`,
        `A página de entregas recebeu ${enviosEntry.visits} visitas este mês, contra ${topPage.visits} de ${t(topPage.nombre)}. Tente fixar uma publicação no Instagram ou um aviso na loja convidando a pedir congelado.`
      )),
    });
  }

  return recs;
}
