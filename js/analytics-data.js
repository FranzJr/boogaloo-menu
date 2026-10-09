/* Datos del panel de Analítica (admin.html). Son DATOS REALES: salen de la
   hoja "Visitas" del Apps Script (acción analiticaResumen), que llena
   js/track.js en cada página pública. Aquí solo se normalizan los nombres de
   página y se generan las recomendaciones a partir de los números. */

// L(es,en,ja,pt) viene de js/menu-data.js (admin.html lo carga antes).
const AN_PAGES = {
  menu: L('Menú', 'Menu', 'メニュー', 'Cardápio'),
  envios: L('Envíos congelados', 'Frozen shipping', '冷凍配送', 'Entregas congeladas'),
  historia: L('Nuestra historia', 'Our story', '私たちの物語', 'Nossa história'),
  blog: L('Blog', 'Blog', 'ブログ', 'Blog'),
  eventos: L('Eventos', 'Events', 'イベント', 'Eventos'),
  reserva: L('Reservar', 'Reservations', '予約', 'Reservas'),
  otra: L('Otra', 'Other', 'その他', 'Outra'),
};

const AN_SOURCES = {
  directo: L('Directo', 'Direct', '直接アクセス', 'Direto'),
  instagram: L('Instagram', 'Instagram', 'Instagram', 'Instagram'),
  google: L('Google', 'Google', 'Google', 'Google'),
  facebook: L('Facebook', 'Facebook', 'Facebook', 'Facebook'),
  x: L('X', 'X', 'X', 'X'),
  line: L('LINE', 'LINE', 'LINE', 'LINE'),
  ubereats: L('Uber Eats', 'Uber Eats', 'Uber Eats', 'Uber Eats'),
  meetup: L('Meetup', 'Meetup', 'Meetup', 'Meetup'),
  otro: L('Otros sitios', 'Other sites', 'その他のサイト', 'Outros sites'),
};

async function fetchAnalyticsData() {
  const raw = await apiCall('analiticaResumen', authParams());
  raw.byPage = raw.byPage.map((p) => ({ ...p, nombre: AN_PAGES[p.id] || AN_PAGES.otra }));
  raw.visitorsToday = raw.visitorsToday.map((v) => ({ ...v, lastPage: { nombre: AN_PAGES[v.lastPageId] || AN_PAGES.otra } }));
  return raw;
}

// Recomendaciones: reglas simples sobre los números de la muestra, para
// que el panel explique el KPI en vez de solo graficarlo.
function computeAnRecommendations(data, lang) {
  const t = (obj) => obj[lang] || obj.es;
  const pct = (n) => Math.round(n) + '%';
  const recs = [];

  if (!data.sessions) {
    return [{
      severity: 'opportunity',
      title: t(L('Todavía no hay datos suficientes', 'Not enough data yet', 'まだデータが十分ではありません', 'Ainda não há dados suficientes')),
      body: t(L(
        'El panel empieza a llenarse con las visitas reales de hoy en adelante. Vuelve en unos días: las recomendaciones aparecen solas cuando haya tráfico para interpretar.',
        'The panel starts filling with real visits from today on. Come back in a few days: recommendations appear on their own once there is traffic to interpret.',
        'このパネルは本日以降の実際の訪問データで埋まっていきます。数日後にもう一度ご覧ください。十分なアクセスが集まると、おすすめが自動で表示されます。',
        'O painel começa a se preencher com as visitas reais a partir de hoje. Volte em alguns dias: as recomendações aparecem sozinhas quando houver tráfego para interpretar.'
      )),
    }];
  }

  const trendPct = ((data.visitsToday - data.visitsYesterday) / Math.max(1, data.visitsYesterday)) * 100;
  if (data.visitsYesterday > 0 && trendPct < -10) {
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
  } else if (data.visitsYesterday > 0 && trendPct > 10) {
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

  if (data.sessions >= 20 && data.bounceRatePct > 55) {
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

  if (data.sessions >= 20 && data.conversionPct < 3) {
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
  } else if (data.sessions >= 20) {
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

  // Carritos abandonados: agregaron algo pero no terminaron el pedido.
  if (data.funnel.addedCart >= 5 && data.funnel.completed / data.funnel.addedCart < 0.4) {
    recs.push({
      severity: 'warning',
      title: t(L('Muchos carritos se quedan sin terminar', 'Many carts are left unfinished', '注文が完了しないカートが多いです', 'Muitos carrinhos ficam sem finalizar')),
      body: t(L(
        `${data.funnel.addedCart} sesiones agregaron algo al carrito este mes, pero solo ${data.funnel.completed} terminaron el pedido (${pct((data.funnel.completed / data.funnel.addedCart) * 100)}). Prueba pedir menos datos al confirmar y dejar claro el total y el tiempo de espera antes del último paso.`,
        `${data.funnel.addedCart} sessions added something to the cart this month, but only ${data.funnel.completed} finished the order (${pct((data.funnel.completed / data.funnel.addedCart) * 100)}). Try asking for less information at checkout and showing the total and wait time before the last step.`,
        `今月、${data.funnel.addedCart}件のセッションがカートに商品を入れましたが、注文を完了したのは${data.funnel.completed}件（${pct((data.funnel.completed / data.funnel.addedCart) * 100)}）です。確認時の入力項目を減らし、最後の手順の前に合計金額と待ち時間を分かりやすく表示してみましょう。`,
        `${data.funnel.addedCart} sessões adicionaram algo ao carrinho este mês, mas só ${data.funnel.completed} finalizaram o pedido (${pct((data.funnel.completed / data.funnel.addedCart) * 100)}). Tente pedir menos dados na confirmação e deixar claro o total e o tempo de espera antes da última etapa.`
      )),
    });
  }

  // Hora pico: sugiere publicar un rato antes.
  const maxHour = Math.max(...data.hours);
  if (maxHour >= 5) {
    const h = data.hours.indexOf(maxHour);
    const before = String((h + 23) % 24).padStart(2, '0') + ':00';
    recs.push({
      severity: 'opportunity',
      title: t(L(`Tu hora pico es a las ${String(h).padStart(2, '0')}:00`, `Your peak hour is ${String(h).padStart(2, '0')}:00`, `ピーク時間は${String(h).padStart(2, '0')}:00です`, `Seu horário de pico é ${String(h).padStart(2, '0')}:00`)),
      body: t(L(
        `Es cuando más gente entra al sitio este mes (hora de Japón). Publica en redes alrededor de las ${before}, una hora antes, para que tu mensaje llegue justo cuando hay más gente mirando.`,
        `This is when most people visit the site this month (Japan time). Post on social media around ${before}, an hour earlier, so your message lands when the most people are looking.`,
        `今月、最も多くの人がサイトを訪れる時間帯です（日本時間）。その1時間前の${before}ごろにSNSへ投稿すると、最も見られやすいタイミングに届きます。`,
        `É quando mais gente entra no site este mês (horário do Japão). Publique nas redes por volta das ${before}, uma hora antes, para a mensagem chegar quando há mais gente olhando.`
      )),
    });
  }

  // Fuentes: dependencia de tráfico directo o de una sola red.
  const totalSrc = data.sources.reduce((s, x) => s + x.v, 0);
  if (totalSrc >= 20) {
    const top = data.sources[0];
    const topPct = (top.v / totalSrc) * 100;
    const topName = t(AN_SOURCES[top.k] || AN_SOURCES.otro);
    if (top.k === 'directo' && topPct > 60) {
      recs.push({
        severity: 'opportunity',
        title: t(L('Casi todo el tráfico es directo', 'Almost all traffic is direct', 'ほとんどが直接アクセスです', 'Quase todo o tráfego é direto')),
        body: t(L(
          `${pct(topPct)} de las visitas llegan escribiendo la dirección o desde un enlace sin origen conocido. Pon el enlace del sitio en la biografía de Instagram, en Google Maps y en los códigos QR del local para que más gente llegue desde canales que puedas medir.`,
          `${pct(topPct)} of visits arrive by typing the address or from a link with no known source. Put the site link in your Instagram bio, Google Maps and the QR codes in the shop so more people arrive from channels you can measure.`,
          `訪問の${pct(topPct)}は、アドレスを直接入力したか、参照元不明のリンクからです。InstagramのプロフィールやGoogleマップ、店内のQRコードにサイトのリンクを載せて、計測できる経路からの訪問を増やしましょう。`,
          `${pct(topPct)} das visitas chegam digitando o endereço ou por um link sem origem conhecida. Coloque o link do site na bio do Instagram, no Google Maps e nos QR codes da loja para mais gente chegar por canais que você consegue medir.`
        )),
      });
    } else if (top.k !== 'directo' && topPct > 50) {
      recs.push({
        severity: 'opportunity',
        title: t(L(`Dependes mucho de ${topName}`, `You rely heavily on ${topName}`, `${topName}への依存度が高いです`, `Você depende muito de ${topName}`)),
        body: t(L(
          `${pct(topPct)} de las visitas vienen de ${topName}. Es una buena señal de que funciona, pero conviene abrir un segundo canal (por ejemplo Google Maps o Meetup) para no depender de uno solo.`,
          `${pct(topPct)} of visits come from ${topName}. That is a good sign it works, but it is wise to open a second channel (for example Google Maps or Meetup) so you do not depend on just one.`,
          `訪問の${pct(topPct)}が${topName}経由です。うまく機能している証拠ですが、1つに頼らないよう、GoogleマップやMeetupなど2つ目の経路も開拓しましょう。`,
          `${pct(topPct)} das visitas vêm de ${topName}. É um bom sinal de que funciona, mas vale abrir um segundo canal (por exemplo Google Maps ou Meetup) para não depender de um só.`
        )),
      });
    }
  }

  // Eventos: ven la página pero nadie se inscribe.
  const eventosEntry = data.byPage.find((p) => p.id === 'eventos');
  if (eventosEntry && eventosEntry.visits >= 10 && data.events.inscripcion === 0) {
    recs.push({
      severity: 'warning',
      title: t(L('Ven los eventos pero nadie se inscribe', 'People see the events but nobody signs up', 'イベントは見られていますが申し込みがありません', 'Veem os eventos, mas ninguém se inscreve')),
      body: t(L(
        `La página de eventos tuvo ${eventosEntry.visits} visitas este mes y ninguna inscripción. Revisa que el botón “Inscribirme” se vea bien en el celular y agrega un recordatorio del cupo o la fecha límite para dar urgencia.`,
        `The events page had ${eventosEntry.visits} visits this month and no sign-ups. Check that the “Register” button looks good on mobile and add a reminder of limited spots or a deadline to create urgency.`,
        `イベントページは今月${eventosEntry.visits}回見られましたが、申し込みはありません。スマートフォンで「申し込む」ボタンが見やすいか確認し、定員や締切の案内を加えて、行動を促しましょう。`,
        `A página de eventos teve ${eventosEntry.visits} visitas este mês e nenhuma inscrição. Verifique se o botão “Inscrever-me” aparece bem no celular e acrescente um lembrete de vagas ou prazo para gerar urgência.`
      )),
    });
  }

  return recs;
}
