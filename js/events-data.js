/* Eventos del sitio (fuente única): los usan la página de eventos
   (js/eventos.js) y el chat del oso (js/bear-knowledge.js). Cuando pasa la
   fecha de un evento deja de mostrarse solo. Para agregar uno, añade un
   objeto a EVENTS_DATA (o una fecha a una serie) con su enlace de Meetup. */

const evL = (es, en, ja, pt) => ({ es, en, ja, pt });
const ART_PRICE = 1500; // por persona que haga la actividad de arte (el servidor valida el total)

const EVENTS_DATA = [
  {
    id: 'halloween-arte',
    registration: true,
    dates: [
      { date: '2026-10-10', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/316632366/' },
      { date: '2026-10-17', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/316731171/' },
    ],
    start: '15:00',
    end: '17:00',
    price: evL(
      '¥1.500 por persona que haga la actividad de arte (incluye materiales y una bebida)',
      '¥1,500 per person doing the art activity (materials and one drink included)',
      'アート体験は1名 ¥1,500（材料とワンドリンク込み）',
      '¥1.500 por pessoa que fizer a atividade de arte (materiais e uma bebida incluídos)'
    ),
    langs: 'EN',
    title: evL(
      'Arte y Café Club — Especial Halloween 🎃',
      'Art & Coffee Club — Halloween Special 🎃',
      'アート＆コーヒークラブ ～ハロウィンスペシャル～ 🎃',
      'Clube de Arte e Café — Especial de Halloween 🎃'
    ),
    tag: evL('Halloween 👻', 'Halloween 👻', 'ハロウィン 👻', 'Halloween 👻'),
    desc: evL(
      'Actividad de arte de Halloween: elige entre pintar cerámica o hacer un retrato de fantasma. Se hace en inglés y es necesario inscribirse con anticipación.',
      'A Halloween art activity: choose between pottery painting or a ghost portrait. Held in English, and advance registration is required.',
      'ハロウィンのアート体験。陶器の絵付けか、ゴーストの肖像画のどちらかを選べます。英語で進行し、事前のお申し込みが必要です。',
      'Uma atividade de arte de Halloween: escolha entre pintar cerâmica ou fazer um retrato de fantasma. Em inglês, com inscrição prévia obrigatória.'
    ),
    activities: [
      { value: 'Pintura de cerámica', label: evL('Pintura de cerámica', 'Pottery painting', '陶器の絵付け', 'Pintura de cerâmica') },
      { value: 'Retrato fantasma', label: evL('Retrato fantasma', 'Ghost portrait', 'ゴーストの肖像画', 'Retrato de fantasma') },
    ],
  },
  {
    id: 'halloween-sorpresa',
    registration: true,
    // El precio es por edad (gratis / niño / adulto), no una tarifa fija por
    // persona como el evento de arte: con esto el formulario de inscripción
    // muestra el desglose de precio en vez de un total mal calculado.
    customPricing: true,
    peopleLabel: evL('Número de personas (indícanos las edades en las notas)', 'Number of people (tell us the ages in the notes)', '人数（年齢はメモ欄にご記入ください）', 'Número de pessoas (informe as idades nas observações)'),
    dates: [{ date: '2026-10-24' }, { date: '2026-10-31' }],
    start: '14:00',
    end: '17:00',
    price: evL(
      '0–2 años: gratis · 3+ años: ¥1.000 · Adultos: ¥2.500',
      'Ages 0–2: free · Ages 3+: ¥1,000 · Adults: ¥2,500',
      '0〜2歳：無料・3歳以上：¥1,000・大人：¥2,500',
      '0–2 anos: grátis · 3+ anos: ¥1.000 · Adultos: ¥2.500'
    ),
    langs: '',
    title: evL('Kids Halloween Party 🎃', 'Kids Halloween Party 🎃', 'キッズハロウィンパーティー 🎃', 'Kids Halloween Party 🎃'),
    tag: evL('Para niños 🎃', 'For kids 🎃', 'お子様向け 🎃', 'Para crianças 🎃'),
    desc: evL(
      'Buffet especial de Halloween con un Monster Milkshake por persona y té ilimitado, Halloween Trick-or-Treat y concurso de disfraces para niños, música y una piñata sorpresa, y un rincón infantil de dibujo y manualidades. Cupo limitado, reserva con anticipación.',
      'A special Halloween buffet with one Monster Milkshake per person and unlimited tea, Halloween trick-or-treat and a kids costume contest, music and a surprise piñata, and a kids corner for drawing and crafts. Limited capacity, reserve ahead.',
      'ハロウィン特別ビュッフェ（お一人様モンスターミルクシェイク1杯付き、お茶飲み放題）、ハロウィントリックオアトリート＆キッズ仮装コンテスト、音楽とサプライズピニャータ、お絵かき＆クラフトのキッズコーナーをご用意。定員に限りがありますので、お早めにご予約ください。',
      'Um buffet especial de Halloween com um Monster Milkshake por pessoa e chá à vontade, Halloween Trick-or-Treat e concurso de fantasias infantil, música e uma piñata surpresa, e um cantinho infantil de desenho e artesanato. Vagas limitadas, reserve com antecedência.'
    ),
    activities: null,
    img: 'img/eventos/halloween-kids-flyer.jpg',
    menuImg: {
      src: 'img/eventos/halloween-kids-menu.jpg',
      alt: evL(
        'Menú especial de Halloween: nachos, pizza de calavera, sándwiches, postres y bebidas temáticas',
        'Special Halloween menu: nachos, skull pizza, sandwiches, desserts and themed drinks',
        'ハロウィン特別メニュー：ナチョス、ドクロピザ、サンドイッチ、デザート、テーマドリンク',
        'Menu especial de Halloween: nachos, pizza de caveira, sanduíches, sobremesas e bebidas temáticas'
      ),
    },
    gallery: [
      { src: 'img/eventos/halloween-kids-ambiente.jpg', alt: evL('Monster Milkshakes de Halloween', 'Halloween Monster Milkshakes', 'ハロウィンのモンスターミルクシェイク', 'Monster Milkshakes de Halloween') },
      { src: 'img/eventos/halloween-kids-osito.jpg', alt: evL('Rincón infantil decorado para Halloween', 'Kids corner decorated for Halloween', 'ハロウィン仕様のキッズコーナー', 'Cantinho infantil decorado para o Halloween') },
      { src: 'img/eventos/halloween-kids-sombreros.jpg', alt: evL('El local de Boogaloo decorado para Halloween', 'Boogaloo decorated for Halloween', 'ハロウィン仕様に飾り付けられた店内', 'O espaço do Boogaloo decorado para o Halloween') },
      { src: 'img/eventos/halloween-kids-decoracion.jpg', alt: evL('Mesa decorada con calabazas y fantasmas', 'Table decorated with pumpkins and ghosts', 'かぼちゃとお化けで飾られたテーブル', 'Mesa decorada com abóboras e fantasmas') },
      { src: 'img/eventos/halloween-kids-salon.jpg', alt: evL('El salón de Boogaloo decorado para Halloween', "Boogaloo's dining room decorated for Halloween", 'ハロウィン仕様に飾り付けられた店内', 'O salão do Boogaloo decorado para o Halloween') },
      { src: 'img/eventos/halloween-kids-ventana.jpg', alt: evL('Ventana decorada con sombreros de bruja y murciélagos', 'Window decorated with witch hats and bats', '魔女帽子とコウモリで飾られた窓', 'Janela decorada com chapéus de bruxa e morcegos') },
    ],
  },
];

