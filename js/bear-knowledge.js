/* Base de conocimiento del oso (chat de la página de enlaces).
   Junta TODA la información del sitio -- menú, glosario, preguntas
   frecuentes, eventos, horario, trabajos -- y la publica en un
   <meta name="boogaloo-knowledge" content="{...json...}"> dentro del <head>.
   El chat (js/bear-chat.js) responde leyendo ese meta tag, así que lo que dice
   el oso sale siempre de la información real de la página:
   - menú y eventos salen de js/menu-data.js y js/events-data.js (cambian solos);
   - horario, trabajos, agotados e interruptor de envíos se piden al backend
     al cargar y se vuelven a escribir en el meta. */

const KB_META_NAME = 'boogaloo-knowledge';

const kbL = (es, en, ja, pt) => ({ es, en, ja, pt });

const KB_CONTACT = {
  address: 'ニシベビル 101号室, 2-16 Nakago, Nakagawa Ward, Nagoya, Aichi 454-0921',
  instagram: 'https://instagram.com/boogaloo.jp',
  meetup: 'https://www.meetup.com/meetup-group-htdlitmv/',
};

// Enlaces que el chat puede ofrecer como botones (por id). Las rutas son
// relativas a /links/ (la página donde vive el chat).
function kbLinks() {
  return {
    uber: { label: kbL('Pedir en Uber Eats', 'Order on Uber Eats', 'Uber Eatsで注文', 'Pedir no Uber Eats'), href: UBER_EATS_URL, ext: true },
    maps: { label: kbL('Cómo llegar', 'How to get here', 'お店への行き方', 'Como chegar'), href: GOOGLE_MAPS_URL, ext: true },
    menu: { label: kbL('Ver el menú', 'See the menu', 'メニューを見る', 'Ver o cardápio'), href: '../index.html' },
    reserva: { label: kbL('Reservar mesa', 'Book a table', '席を予約する', 'Reservar mesa'), href: '../reserva.html' },
    eventos: { label: kbL('Ver eventos', 'See events', 'イベントを見る', 'Ver eventos'), href: '../eventos.html' },
    trabajos: { label: kbL('Ver ofertas', 'See openings', '求人を見る', 'Ver vagas'), href: '../trabajos.html' },
    envios: { label: kbL('Envíos congelados', 'Frozen shipping', '冷凍配送', 'Entregas congeladas'), href: '../envios/index.html' },
    historia: { label: kbL('Nuestra historia', 'Our story', '私たちの物語', 'Nossa história'), href: '../about.html' },
    instagram: { label: kbL('Instagram', 'Instagram', 'Instagram', 'Instagram'), href: KB_CONTACT.instagram, ext: true },
    meetup: { label: kbL('Grupo en Meetup', 'Meetup group', 'Meetupのグループ', 'Grupo no Meetup'), href: KB_CONTACT.meetup, ext: true },
  };
}

// Preguntas frecuentes. k = palabras clave en los 4 idiomas (el chat detecta
// el idioma de la pregunta). dyn = respuesta que se arma con datos vivos.
function kbFaq() {
  return [
    {
      id: 'about',
      k: ['quienes son', 'quien eres', 'que es boogaloo', 'sobre ustedes', 'nuestra historia', 'quien fundo', 'about you', 'who are you', 'what is boogaloo', 'your story', 'who founded', 'boogalooとは', '物語', 'だれ', '誰', 'quem sao voces', 'quem e voce', 'o que e boogaloo', 'sobre voces', 'quem fundou'],
      a: kbL(
        'Boogaloo es un café y restaurante colombiano en Nagoya 🇨🇴. Lo fundó Sara, una colombiana que quiso contarle al mundo quién es Colombia, un plato a la vez: arepas, empanadas, café y más, con el arte y la música de allá.',
        'Boogaloo is a Colombian café and restaurant in Nagoya 🇨🇴. It was founded by Sara, a Colombian who wanted to show the world who Colombia is, one dish at a time: arepas, empanadas, coffee and more, with Colombian art and music.',
        'Boogalooは名古屋にあるコロンビア料理のカフェ＆レストランです🇨🇴。コロンビア人のサラが「一皿ずつ、コロンビアを伝えたい」という思いで始めました。アレパ、エンパナーダ、コーヒーなどを、コロンビアのアートと音楽とともにお届けしています。',
        'O Boogaloo é um café e restaurante colombiano em Nagoia 🇨🇴. Foi fundado por Sara, uma colombiana que quis mostrar ao mundo quem é a Colômbia, um prato de cada vez: arepas, empanadas, café e mais, com a arte e a música de lá.'
      ),
      links: ['historia'],
    },
    {
      id: 'location',
      k: ['donde', 'direccion', 'ubicacion', 'como llegar', 'mapa', 'ubicados', 'where', 'address', 'location', 'map', 'directions', 'how to get', 'find you', '場所', '住所', 'アクセス', 'どこ', '行き方', 'onde', 'endereco', 'localizacao', 'como chegar'],
      a: kbL(
        `Estamos en Nakago, Nakagawa-ku, Nagoya 📍\n${KB_CONTACT.address}`,
        `We're in Nakago, Nakagawa Ward, Nagoya 📍\n${KB_CONTACT.address}`,
        `名古屋市中川区中郷にあります📍\n${KB_CONTACT.address}`,
        `Ficamos em Nakago, Nakagawa, Nagoia 📍\n${KB_CONTACT.address}`
      ),
      links: ['maps'],
    },
    { id: 'hours', dyn: true, k: ['horario', 'horarios', 'abren', 'abierto', 'abiertos', 'cierran', 'cierre', 'a que hora', 'hours', 'open', 'opening', 'close', 'closing', 'what time', '営業', '営業時間', '何時', '開店', '閉店', 'aberto', 'abrem', 'fecham', 'horario de funcionamento'] },
    {
      id: 'order',
      k: ['pedir', 'ordenar', 'pedido', 'domicilio', 'a domicilio', 'delivery', 'uber', 'uber eats', 'para llevar', 'order', 'takeout', 'take out', 'takeaway', 'deliver', '出前', 'デリバリー', '注文', 'テイクアウト', 'encomendar', 'pedir online', 'entrega'],
      a: kbL(
        'Puedes pedir de dos formas 🛵🍽️: por Uber Eats, a domicilio; o, si ya estás en el local, desde el menú digital del sitio.',
        'You can order in two ways 🛵🍽️: through Uber Eats, delivered to you; or, if you are already at the shop, from the digital menu on the site.',
        'ご注文は2通りです🛵🍽️：Uber Eatsでのデリバリー、または、お店にいる場合はサイトのデジタルメニューからどうぞ。',
        'Você pode pedir de duas formas 🛵🍽️: pelo Uber Eats, com entrega; ou, se já estiver no local, pelo cardápio digital do site.'
      ),
      links: ['uber', 'menu'],
    },
    {
      id: 'reserve',
      k: ['reserva', 'reservas', 'reservar', 'mesa para', 'book a table', 'booking', 'reservation', 'table for', 'reserve', '予約', '席', 'reservar mesa'],
      a: kbL(
        'Puedes reservar una mesa desde el sitio 📅. Elige fecha, hora y número de personas, y hasta puedes dejar anotado qué les gustaría comer.',
        'You can book a table on the site 📅. Pick the date, time and number of guests, and you can even note what you would like to eat.',
        'サイトから席を予約できます📅。日付・時間・人数を選び、召し上がりたいお料理も添えられます。',
        'Você pode reservar uma mesa pelo site 📅. Escolha data, hora e número de pessoas, e pode até anotar o que gostaria de comer.'
      ),
      links: ['reserva'],
    },
    { id: 'events', dyn: true, k: ['evento', 'eventos', 'halloween', 'agenda', 'actividad', 'actividades', 'event', 'events', 'activity', 'activities', 'whats on', 'イベント', 'ハロウィン', 'evento', 'atividade', 'atividades', 'programacao'] },
    { id: 'jobs', dyn: true, k: ['trabajo', 'trabajar', 'empleo', 'vacante', 'vacantes', 'contratan', 'job', 'jobs', 'hiring', 'work for', 'vacancy', 'vacancies', 'careers', '求人', '募集', 'バイト', 'アルバイト', 'vaga', 'vagas', 'emprego', 'trabalhar', 'contratando'] },
    {
      id: 'shipping',
      k: ['congelado', 'congelados', 'congelada', 'envio', 'envios', 'enviar', 'enviarlo', 'shipping', 'frozen', 'ship', 'shipped', '冷凍', '配送', '送料', '全国', 'entrega congelada', 'enviam', 'enviar para'],
      a: kbL(
        'Te enviamos Boogaloo congelado a cualquier parte de Japón ❄️. En la página de envíos puedes ver qué platos hay y armar tu pedido.',
        'We ship frozen Boogaloo anywhere in Japan ❄️. On the shipping page you can see which dishes are available and build your order.',
        '冷凍のBoogalooを日本全国へお届けします❄️。配送ページでお料理を選んで注文できます。',
        'Enviamos o Boogaloo congelado para qualquer lugar do Japão ❄️. Na página de envios você vê os pratos disponíveis e monta seu pedido.'
      ),
      links: ['envios'],
    },
    {
      id: 'contact',
      k: ['contacto', 'contactar', 'contactarlos', 'instagram', 'telefono', 'whatsapp', 'correo', 'email', 'contact', 'phone', 'call you', '連絡', '電話', 'メール', 'dm', 'telefone', 'contato', 'ligar'],
      a: kbL(
        'Escríbenos por Instagram @boogaloo.jp 📸 o únete a nuestro grupo en Meetup 🤝.',
        'Write to us on Instagram @boogaloo.jp 📸 or join our Meetup group 🤝.',
        'Instagram @boogaloo.jp 📸 からメッセージをください。Meetupのグループ🤝もあります。',
        'Escreva para nós no Instagram @boogaloo.jp 📸 ou entre no nosso grupo no Meetup 🤝.'
      ),
      links: ['instagram', 'meetup'],
    },
    {
      id: 'languages',
      k: ['idioma', 'idiomas', 'hablan', 'hablas', 'espanol', 'ingles', 'japones', 'portugues', 'language', 'languages', 'speak', 'english', 'spanish', 'japanese', 'portuguese', '話せ', '言語', '英語', '日本語', 'スペイン語', 'falam', 'falar', 'ingles'],
      a: kbL(
        'Aquí hablamos español, pero estamos aprendiendo inglés, japonés y portugués 😄. El sitio también está en esos cuatro idiomas: cámbialo arriba a la derecha.',
        'Here we speak Spanish, but we are learning English, Japanese and Portuguese 😄. The site is also available in those four languages: change it at the top right.',
        'ここではスペイン語を話しますが、英語・日本語・ポルトガル語も勉強中です😄。サイトも4言語に対応しています。右上で切り替えてください。',
        'Aqui falamos espanhol, mas estamos aprendendo inglês, japonês e português 😄. O site também está nesses quatro idiomas: troque no canto superior direito.'
      ),
      links: [],
    },
    { id: 'menuOverview', dyn: true, k: ['menu', 'carta', 'que tienen', 'que venden', 'que hay', 'que sirven', 'que comida', 'what do you have', 'what do you serve', 'what do you sell', 'whats on the menu', 'メニュー', '何がありますか', 'cardapio', 'o que tem', 'o que servem', 'o que voces tem'] },
    {
      id: 'nodata',
      k: ['vegetariano', 'vegetariana', 'vegano', 'vegana', 'alergia', 'alergias', 'gluten', 'halal', 'celiaco', 'lactosa', 'vegetarian', 'vegan', 'allergy', 'allergies', 'gluten free', 'アレルギー', 'ベジタリアン', 'ヴィーガン', 'pago', 'pagar', 'tarjeta', 'efectivo', 'paypay', 'card', 'cash', 'payment', 'クレジット', '現金', '支払い', 'cartao', 'dinheiro', 'pagamento', 'wifi', 'estacionamiento', 'parking', 'parqueadero', '駐車場'],
      a: kbL(
        'Ese dato no está en la página 🐻. Pregúntanos directo por Instagram o en el local, sobre todo si tienes alergias o una dieta especial.',
        "That detail isn't on the page 🐻. Ask us directly on Instagram or at the shop, especially if you have allergies or a special diet.",
        'その情報はページに載っていません🐻。Instagramまたはお店で直接お尋ねください。特にアレルギーや食事制限がある方はぜひ。',
        'Essa informação não está na página 🐻. Pergunte direto pelo Instagram ou no local, principalmente se tiver alergias ou dieta especial.'
      ),
      links: ['instagram'],
    },
    {
      id: 'thanks',
      k: ['gracias', 'muchas gracias', 'thanks', 'thank you', 'ありがとう', 'obrigado', 'obrigada'],
      a: kbL('¡De nada! 🐻💛 Aquí estoy para lo que necesites.', "You're welcome! 🐻💛 I'm here if you need anything else.", 'どういたしまして！🐻💛 他にもお気軽にどうぞ。', 'De nada! 🐻💛 Estou aqui para o que precisar.'),
      links: [],
    },
  ];
}

// Glosario: "¿qué es una arepa?". Las definiciones coinciden con las
// descripciones del menú.
function kbGlossary() {
  return [
    { k: ['arepa'], a: kbL(
      'La arepa es una torta de maíz cocinada a la plancha, típica de Colombia. Se come sola o rellena. En Boogaloo las hacemos a mano, rellenas de queso, carne, pollo o chorizo 🫓',
      'An arepa is a corn cake cooked on a griddle, typical of Colombia. It can be eaten plain or filled. At Boogaloo we make them by hand, filled with cheese, beef, chicken or chorizo 🫓',
      'アレパは、コロンビアの定番料理で、とうもろこしの生地を鉄板で焼いたものです。そのままでも、具を詰めても食べられます。Boogalooでは手作りで、チーズ・牛肉・鶏肉・チョリソーの具をご用意しています🫓',
      'A arepa é um bolinho de milho cozido na chapa, típico da Colômbia. Pode ser comida pura ou recheada. No Boogaloo fazemos à mão, recheada com queijo, carne, frango ou chorizo 🫓') },
    { k: ['empanada', 'エンパナーダ'], a: kbL(
      'La empanada es un pastelito frito de masa de maíz, relleno. Tenemos de carne y de pollo con queso, y vienen con ají casero y guacamole fresco 🥟',
      'An empanada is a fried corn-dough turnover with a filling. We have beef and chicken-and-cheese, and they come with homemade ají sauce and fresh guacamole 🥟',
      'エンパナーダは、とうもろこし生地に具を詰めて揚げた点心です。牛肉と、鶏肉＆チーズがあり、自家製アヒソースとワカモレが付きます🥟',
      'A empanada é um pastelzinho frito de massa de milho, recheado. Temos de carne e de frango com queijo, e vêm com molho ají caseiro e guacamole fresco 🥟') },
    { k: ['bandeja paisa', 'bandeja', 'バンデハ'], a: kbL(
      'La bandeja paisa es el plato más representativo de Colombia: frijoles, arroz, carne molida, chicharrón, chorizo, huevo frito, aguacate, arepa y patacón, todo en un mismo plato 🍽️',
      "Bandeja paisa is Colombia's most iconic dish: beans, rice, ground beef, pork belly, chorizo, fried egg, avocado, arepa and patacón, all on one plate 🍽️",
      'バンデハ・パイサはコロンビアを代表する一皿。豆、ご飯、牛ひき肉、チチャロン、チョリソー、目玉焼き、アボカド、アレパ、パタコンが一皿に盛られています🍽️',
      'A bandeja paisa é o prato mais representativo da Colômbia: feijão, arroz, carne moída, torresmo, chorizo, ovo frito, abacate, arepa e patacón, tudo em um só prato 🍽️') },
    { k: ['patacon', 'patacones', 'パタコン'], a: kbL(
      'El patacón es plátano verde aplastado y frito. Lo servimos cubierto con carne de res guisada y acompañado de ensalada fresca.',
      'Patacón is smashed and fried green plantain. We serve it topped with stewed beef and fresh salad.',
      'パタコンは、青いプランテンを潰して揚げたものです。牛肉の煮込みをのせ、フレッシュサラダを添えています。',
      'O patacón é banana-da-terra verde amassada e frita. Servimos coberto com carne bovina refogada e salada fresca.') },
    { k: ['aborrajado'], a: kbL(
      'El aborrajado es plátano maduro relleno de queso y bocadillo (dulce de guayaba), cubierto con una ligera masa y frito.',
      'Aborrajado is ripe plantain stuffed with cheese and bocadillo (guava paste), lightly battered and fried.',
      'アボラハードは、熟したプランテンにチーズとボカディージョ（グアバペースト）を詰め、衣をつけて揚げたものです。',
      'O aborrajado é banana-da-terra madura recheada com queijo e bocadillo (goiabada), empanada levemente e frita.') },
    { k: ['platano maduro', 'maduro', 'plantain', 'マドゥーロ'], a: kbL(
      'El plátano maduro es plátano dulce y maduro. El nuestro va entero, horneado con queso fundido y bocadillo (dulce de guayaba).',
      'Maduro is sweet, ripe plantain. Ours is baked whole with melted cheese and bocadillo (guava paste).',
      'マドゥーロは甘く熟したプランテンです。当店ではまるごとオーブンで焼き、とろけるチーズとボカディージョ（グアバペースト）を合わせます。',
      'O maduro é banana-da-terra doce e madura. O nosso vai inteiro, assado com queijo derretido e bocadillo (goiabada).') },
    { k: ['oblea', 'obleas', 'オブレア'], a: kbL(
      'La oblea es una galleta fina tipo barquillo. La servimos con arequipe, crema fresca y queso; hay una versión con mermelada de frutos rojos y otra especial de la casa.',
      'An oblea is a thin wafer. We serve it with arequipe, fresh cream and cheese; there is a version with mixed berry jam and a house special.',
      'オブレアは薄いウエハースです。アレキペ、生クリーム、チーズをのせてお出しします。ベリージャム入りと、店特製のものもあります。',
      'A oblea é uma bolacha fina. Servimos com arequipe, creme fresco e queijo; há uma versão com geleia de frutas vermelhas e uma especial da casa.') },
    { k: ['arequipe', 'アレキペ'], a: kbL('El arequipe es el dulce de leche colombiano 🍮.', 'Arequipe is Colombian dulce de leche 🍮.', 'アレキペは、コロンビア風のミルクキャラメル（ドゥルセ・デ・レチェ）です🍮。', 'O arequipe é o doce de leite colombiano 🍮.') },
    { k: ['bocadillo', 'ボカディージョ'], a: kbL('El bocadillo es un dulce de guayaba, muy típico de Colombia.', 'Bocadillo is a guava paste sweet, very typical of Colombia.', 'ボカディージョは、グアバのペーストでできたコロンビアの伝統的なお菓子です。', 'O bocadillo é um doce de goiaba, muito típico da Colômbia.') },
    { k: ['hogao', 'アオガオ'], a: kbL(
      'El hogao es una salsa tradicional colombiana de tomate, cebolla y cebolla larga. Con ella cocinamos la carne de nuestras empanadas.',
      'Hogao is a traditional Colombian sauce of tomato, onion and scallion. We cook the beef for our empanadas in it.',
      'アオガオは、トマト・玉ねぎ・青ねぎをじっくり炒めて作るコロンビアの伝統ソースです。エンパナーダの牛肉はこれで煮込んでいます。',
      'O hogao é um molho tradicional colombiano de tomate, cebola e cebolinha. Cozinhamos a carne das nossas empanadas nele.') },
    { k: ['panela', 'lemonela', 'レモネラ', 'パネラ'], a: kbL(
      'La panela es un bloque de jugo de caña de azúcar sin refinar. La Lemonela es nuestra bebida fría de panela con limón 🍋.',
      'Panela is an unrefined block of cane sugar juice. Lemonela is our cold drink made with panela and lime 🍋.',
      'パネラは、精製していないサトウキビの塊です。レモネラは、パネラとライムで作る当店の冷たいドリンクです🍋。',
      'A panela é um bloco de suco de cana-de-açúcar não refinado. A Lemonela é a nossa bebida gelada de panela com limão 🍋.') },
    { k: ['tinto', 'ティント'], a: kbL('El tinto es el café negro colombiano, sin leche. Lo servimos caliente ☕.', 'Tinto is Colombian black coffee, no milk. We serve it hot ☕.', 'ティントは、ミルクを入れないコロンビア風のブラックコーヒーです。ホットでお出ししています☕。', 'O tinto é o café preto colombiano, sem leite. Servimos quente ☕.') },
    { k: ['aji'], a: kbL('El ají casero es la salsa picante que acompaña nuestras empanadas.', 'Homemade ají is the sauce that comes with our empanadas.', 'アヒは、エンパナーダに添える自家製のコロンビア風ソースです。', 'O ají caseiro é o molho que acompanha as nossas empanadas.') },
    { k: ['guanabana', 'soursop', 'graviola', 'グアナバナ', 'サワーソップ'], a: kbL('La guanábana es una fruta tropical (soursop en inglés). Tenemos jugo de guanábana en 12 y 16 oz.', 'Guanábana is a tropical fruit (soursop). We have soursop juice in 12 and 16 oz.', 'グアナバナ（サワーソップ）は熱帯のフルーツです。12ozと16ozのジュースがあります。', 'A graviola é uma fruta tropical. Temos suco de graviola em 12 e 16 oz.') },
    { k: ['maracuya', 'passion fruit', 'maracuja', 'パッションフルーツ'], a: kbL('El maracuyá es la fruta de la pasión. Tenemos jugo de maracuyá con agua o con leche, en 12 y 16 oz.', 'Maracuyá is passion fruit. We have passion fruit juice with water or with milk, in 12 and 16 oz.', 'マラクヤはパッションフルーツのことです。水またはミルクで割ったジュースを12ozと16ozでご用意しています。', 'O maracujá é a fruta da paixão. Temos suco de maracujá com água ou com leite, em 12 e 16 oz.') },
  ];
}

// Palabras GENERALES de cada categoría ("café", "jugo", "arepa"). Las palabras
// específicas de un producto (latte, mango, brownie...) no van aquí: el chat
// las encuentra en el nombre del producto.
const KB_CATEGORY_KEYWORDS = {
  arepas: ['arepa', 'アレパ'],
  empanadas: ['empanada', 'エンパナーダ'],
  platano: ['platano maduro', 'platanos', 'plantain', 'マドゥーロ'],
  'platos-fuertes': ['plato fuerte', 'platos fuertes', 'main dish', 'main dishes', 'hearty', 'メイン', 'prato principal', 'pratos principais'],
  jugos: ['jugo', 'jugos', 'juice', 'juices', 'suco', 'sucos', 'ジュース', 'batido'],
  cafe: ['cafe', 'cafes', 'coffee', 'コーヒー', 'bebidas calientes', 'hot drink', 'hot drinks', 'tea', 'te caliente', 'te helado', 'hay te', 'tienen te', 'tiene te', 'venden te', 'sirven te', 'un te', 'el te', 'ティー', '紅茶', 'お茶', 'tem cha', 'cha quente', 'cha gelado'],
  otros: ['otros', 'others', 'outros', 'その他', 'acompanamientos', 'sides', 'acompanhamentos'],
  postres: ['postre', 'postres', 'dessert', 'desserts', 'dulces', 'sobremesa', 'デザート', 'sweets'],
};

function kbStripSize(s) {
  return String(s || '').replace(/\s*\d+\s*oz\s*$/i, '').replace(/\s*[（(](?:Regular|Large|レギュラー|ラージ|Pequeña|Small|小)[）)]\s*$/i, '');
}

// Menú agrupado como lo ve el cliente: una entrada por producto (los tamaños
// y las variantes agua/leche se juntan en una sola).
function kbMenu() {
  const out = [];
  MENU_CATEGORIES.forEach((cat) => {
    const groups = {};
    (cat.items || []).forEach((it) => {
      const key = it.styleGroup || it.sizeGroup || it.sku;
      if (!groups[key]) groups[key] = { id: key, cat: cat.id, items: [] };
      groups[key].items.push(it);
    });
    Object.values(groups).forEach((g) => {
      const first = g.items[0];
      const names = {};
      const descs = {};
      ['es', 'en', 'ja', 'pt'].forEach((lang) => {
        names[lang] = first.nombreBase ? first.nombreBase[lang] : kbStripSize(first.nombre[lang]);
        const withDesc = g.items.find((i) => i.desc && i.desc[lang]);
        descs[lang] = withDesc ? withDesc.desc[lang] : '';
      });
      const prices = g.items.map((i) => i.precio);
      out.push({
        id: g.id,
        cat: cat.id,
        n: names,
        aka: first.aka || '',
        d: descs,
        p: [Math.min.apply(null, prices), Math.max.apply(null, prices)],
        skus: g.items.map((i) => i.sku),
      });
    });
  });
  return out;
}

function kbCategories() {
  return MENU_CATEGORIES.map((cat) => ({
    id: cat.id,
    n: cat.nombre,
    s: cat.subt,
    k: KB_CATEGORY_KEYWORDS[cat.id] || [],
  }));
}

function kbEvents() {
  if (typeof EVENTS_DATA === 'undefined') return [];
  const now = Date.now();
  return EVENTS_DATA.map((ev) => ({
    id: ev.id,
    title: ev.title,
    tag: ev.tag,
    start: ev.start,
    price: ev.price,
    desc: ev.desc,
    dates: ev.dates
      .filter((d) => new Date(`${d.date}T${ev.end}:00+09:00`).getTime() > now)
      .map((d) => d.date),
  })).filter((ev) => ev.dates.length);
}

function buildBearKnowledge() {
  return {
    v: 1,
    updated: new Date().toISOString(),
    site: {
      name: 'Boogaloo',
      url: 'https://boogaloo.cafe',
      tagline: kbL('Comida y café colombiano en Nagoya', 'Colombian food and coffee in Nagoya', '名古屋のコロンビア料理とコーヒー', 'Comida e café colombiano em Nagoia'),
      taxNote: kbL('Los precios incluyen impuestos.', 'Prices include tax.', '表示価格は税込です。', 'Os preços incluem impostos.'),
    },
    contact: KB_CONTACT,
    links: kbLinks(),
    categories: kbCategories(),
    menu: kbMenu(),
    glossary: kbGlossary(),
    faq: kbFaq(),
    events: kbEvents(),
    // Datos vivos (se completan con refreshBearKnowledge):
    hours: null,
    jobs: null,
    soldOut: [],
    shipping: true,
  };
}

let bearKB = null;

function publishBearKnowledge() {
  let meta = document.querySelector(`meta[name="${KB_META_NAME}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', KB_META_NAME);
    document.head.appendChild(meta);
  }
  bearKB.updated = new Date().toISOString();
  meta.setAttribute('content', JSON.stringify(bearKB));
}

// El chat siempre lee el conocimiento del meta tag (esa es su única fuente).
function readBearKnowledge() {
  const meta = document.querySelector(`meta[name="${KB_META_NAME}"]`);
  if (!meta) return null;
  try {
    return JSON.parse(meta.getAttribute('content'));
  } catch (e) {
    return null;
  }
}

// Completa el meta con datos vivos del backend (cada uno por separado: si uno
// falla, el resto sigue y el oso simplemente dice que no tiene ese dato).
async function refreshBearKnowledge() {
  const tasks = [
    apiCall('configTurnos', {}).then((r) => { bearKB.hours = r.horarioSemanal || null; }),
    apiCall('listarTrabajos', {}).then((r) => { bearKB.jobs = r.trabajos || []; }),
    apiCall('listarAgotados', {}).then((r) => { bearKB.soldOut = r.skus || []; }),
    apiCall('obtenerConfig', {}).then((r) => { bearKB.shipping = !!r.config.shipBanner; }),
  ].map((p) => p.catch(() => {}));
  await Promise.all(tasks);
  publishBearKnowledge();
}

function initBearKnowledge() {
  bearKB = buildBearKnowledge();
  publishBearKnowledge();
  return refreshBearKnowledge();
}
