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
    dates: [{ date: '2026-10-24' }, { date: '2026-10-31' }],
    start: null,
    end: '23:59',
    price: evL(
      '¥1.500 por persona que haga la actividad de arte',
      '¥1,500 per person doing the art activity',
      'アート体験は1名 ¥1,500',
      '¥1.500 por pessoa que fizer a atividade de arte'
    ),
    langs: '',
    title: evL('Sorpresa de Halloween 🎃', 'Halloween Surprise 🎃', 'ハロウィンのサプライズ 🎃', 'Surpresa de Halloween 🎃'),
    tag: evL('Por descubrir 👀', 'To be revealed 👀', 'お楽しみに 👀', 'A descobrir 👀'),
    desc: null,
    activities: null,
  },
];

