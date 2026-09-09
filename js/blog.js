/* Página "Blog": reportajes narrativos que conectan Colombia y Japón,
   cerrando siempre con una invitación a visitar Boogaloo. A diferencia de
   otros textos del sitio, las historias sí se traducen a los 4 idiomas
   (STORY1/STORY2), porque el objetivo es que cada entrada atraiga clientes
   -- y la mayoría de quienes visitan Boogaloo leen japonés o inglés, no
   español. Progressive enhancement: si JS no corre, el contenido queda
   visible desde el inicio (ver css: body.js-ready). */

document.body.classList.add('js-ready');

const revealTargets = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ab-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('ab-visible'));
}

// ---------------- Historias (reportaje) ----------------

const STORY1_PARRAFOS = {
  es: [
    'En las veredas del norte del Tolima -- Líbano, Casabianca, Herveo, donde la cordillera empieza a enfriarse camino al Nevado del Ruiz -- hay una frase que se repite de generación en generación: "esa Toyota no se vende, se hereda". No es una exageración de vendedor. Es, casi literalmente, lo que pasó durante décadas: una misma camioneta, comprada por un abuelo en los años setenta u ochenta, todavía subiendo la misma trocha cuarenta años después, ahora manejada por el nieto.',
    'El campo cafetero colombiano ya tenía su propio ícono motorizado desde antes: el jeep Willys, que llegó después de la Segunda Guerra Mundial y todavía hoy desfila, cargado hasta el absurdo, en las fiestas de los pueblos del Eje Cafetero. Pero en las zonas más altas y más duras -- las trochas de Tolima, Huila, Cauca, donde ni el Willys aguantaba el barro de todo el año -- fue otra marca la que terminó ganándose la confianza de la gente: Toyota. Primero los Land Cruiser rectos, de motor diésel, sin ninguna comodidad; después las camionetas de estacas. Ninguna llegó anunciada por una campaña publicitaria. Llegaron una por una, compradas de segunda o de tercera mano, y se quedaron por una sola razón: no se dañaban, o si se dañaban, cualquier mecánico de pueblo -- sin taller, sin diagnóstico computarizado, muchas veces sin más herramienta que un juego de llaves y paciencia -- las volvía a poner a andar.',
    'Para mucha gente del campo tolimense de esa época, Japón no era un país que apareciera mucho en la conversación. No había televisión en todas las veredas, ni maestros que enseñaran demasiado sobre el otro lado del mundo. Lo japonés que sí se conocía, lo que de verdad se tocaba y se manejaba todos los días, era esa camioneta que aguantaba lo que fuera. Antes de saber dónde quedaba Japón en el mapa, ya se sabía que lo que salía de allá duraba. Esa reputación no la construyó ninguna oficina de mercadeo: la construyeron kilómetros de trocha, ríos que había que cruzar sin puente, y una camioneta que seguía prendiendo cada madrugada.',
    'Esa misma camioneta hacía de todo. Bajaba el café pergamino de la finca hasta el pueblo, en la época de cosecha, con costales apilados hasta donde alcanzara la baranda. Subía mercado, subía gente que no tenía cómo pagar un taxi rural, subía material de construcción. Cuando alguien se enfermaba de gravedad y el puesto de salud del pueblo no bastaba, era la Toyota la que hacía de ambulancia en carretera destapada, así fuera de noche, así estuviera lloviendo. En época de elecciones, era la Toyota la que subía las urnas hasta la escuela veredal. No existía un servicio para cada una de esas necesidades por separado: existía una sola camioneta, y la comunidad entera dependía de que esa camioneta arrancara.',
    'Esa lógica -- algo hecho para durar, que llega hasta donde nadie más llega, y que termina cargando mucho más que su función original -- es la misma que hoy trae el café colombiano hasta una mesa en Nagoya. El grano que se sirve en Boogaloo bajó, en algún momento de su historia, por una trocha parecida a esas, en una camioneta parecida a esas. Si quiere probar ese café -- y entender, en una sola taza, la distancia real que hay entre una vereda del Tolima y una calle de Nagoya -- lo esperamos en Boogaloo.',
  ],
  en: [
    'In the mountain hamlets of northern Tolima -- Líbano, Casabianca, Herveo, where the Andes start to cool off on the way up to the Nevado del Ruiz volcano -- one phrase gets repeated from one generation to the next: "that Toyota isn\'t sold, it\'s inherited." It\'s not a sales pitch. For decades, it was almost literally true: the same pickup, bought by a grandfather sometime in the 1970s or \'80s, still climbing the same dirt road forty years later, now driven by his grandson.',
    "Colombia's coffee country already had its own motorized icon before that: the Willys jeep, which arrived after World War II and still parades today, absurdly overloaded, through the festivals of the Coffee Axis towns. But in the higher, harder terrain -- the dirt roads of Tolima, Huila, Cauca, where not even a Willys could handle the year-round mud -- a different brand ended up earning people's trust: Toyota. First the straight-six diesel Land Cruisers, with zero comfort features; later the flatbed pickups. None of them arrived with an ad campaign. They came one at a time, bought second- or third-hand, and stayed for one simple reason: they didn't break down -- and when they did, any small-town mechanic, with no workshop, no computer diagnostics, often nothing but a wrench set and patience, could get them running again.",
    "For a lot of people in rural Tolima back then, Japan wasn't a country that came up much in conversation. Not every hamlet had television, and not every teacher spent much time on the other side of the world. The one piece of \"Japanese\" that people actually knew, that they touched and drove every single day, was that truck that held up no matter what. Long before anyone knew where Japan was on a map, everyone already knew that whatever came from there lasted. No marketing department built that reputation. Miles of dirt road built it, rivers that had to be forded with no bridge in sight, and a truck that kept starting every single morning.",
    "That same truck did everything. It carried the parchment coffee down from the farm to town at harvest time, sacks stacked as high as the rail would allow. It carried groceries up, carried people who had no way to pay for rural transport, carried construction material. When someone fell seriously ill and the town's health post wasn't enough, it was the Toyota that served as the ambulance on an unpaved road, rain or shine, day or night. On election day, it was the Toyota that carried the ballot boxes up to the rural schoolhouse. There was no separate service for each of those needs -- there was one truck, and the whole community depended on it starting.",
    "That same logic -- something built to last, that reaches places nothing else does, and ends up carrying far more than its original job -- is what brings Colombian coffee to a table in Nagoya today. The beans served at Boogaloo once came down, at some point in their journey, on a dirt road much like those, in a truck much like those. If you want to taste that coffee -- and understand, in a single cup, the real distance between a hamlet in Tolima and a street in Nagoya -- we're waiting for you at Boogaloo.",
  ],
  ja: [
    'トリマ県北部の集落 ―― リバノ、カサビアンカ、エルベオ。ネバド・デル・ルイス火山へと向かうにつれてアンデスの空気が冷たくなっていくこの一帯には、世代を超えて繰り返される言葉がある。「あのトヨタは売るものじゃない、譲るものだ」。これは営業文句ではない。実際、何十年もの間、ほぼ文字通りそうだった。1970年代か80年代に祖父が買った同じピックアップトラックが、40年後も同じ未舗装路を登り続け、今は孫が運転している。',
    'コロンビアのコーヒー産地には、それ以前から独自の象徴的な乗り物があった ―― 第二次世界大戦後にやってきたウィリス・ジープだ。今でもコーヒー地帯（エヘ・カフェテロ）の祭りでは、荷物を山ほど積んで派手に練り歩く姿が見られる。しかし、より標高が高く過酷な地形 ―― ウィリスでさえ一年中のぬかるみに耐えられなかったトリマ、ウイラ、カウカの未舗装路 ―― では、別のブランドが人々の信頼を勝ち取っていった。トヨタだ。最初は快適装備など一切ない直列6気筒ディーゼルのランドクルーザー、後には荷台付きのピックアップ。どれも広告キャンペーンとともにやって来たわけではない。中古で、あるいは三代目の持ち主として一台ずつやって来て、そして居座った。理由はただ一つ ―― 壊れなかったから。壊れても、整備工場も、コンピューター診断も持たない村の整備士が、レンチ一式と根気だけでまた走らせてしまうからだ。',
    '当時のトリマ県の農村に住む多くの人にとって、日本は会話にあまり出てこない国だった。テレビがある集落ばかりではなかったし、地球の反対側について詳しく教える教師もそう多くはなかった。人々が本当に知っていた「日本のもの」、毎日実際に触れて運転していたものといえば、何があっても壊れないあのトラックだった。日本が地図のどこにあるかを知るよりずっと前に、あそこから来るものは長持ちする、ということはすでに知られていた。その評判を作ったのは、どこかのマーケティング部門ではない。何キロも続く未舗装路と、橋のない川を渡らなければならない現実と、毎朝欠かさずエンジンがかかるトラック、それが作ったのだ。',
    'そのトラックは何でもこなした。収穫期には、荷台の柵いっぱいまで積み上げた麻袋とともに、農園から町までパーチメントコーヒーを運び下ろした。食料品を運び上げ、地方の交通手段を払う余裕のない人々を乗せ、建材を運んだ。誰かが重い病気になり、村の診療所だけでは足りないとき、未舗装路を走る救急車の代わりを務めたのもトヨタだった。雨の日も、夜中でも関係なかった。選挙の日には、投票箱を集落の学校まで運び上げたのもトヨタだった。それぞれの用途に別々のサービスがあったわけではない。あったのは一台のトラックであり、地域社会全体が、そのトラックのエンジンがかかることに頼っていた。',
    'それが今日、コロンビア産のコーヒーが名古屋のテーブルに届くまでの道のりと同じ論理だ ―― 何かが長持ちするように作られていて、他の何も届かない場所まで届き、最終的には本来の役割よりずっと多くのものを運ぶことになる。Boogalooで出しているコーヒー豆も、その旅のどこかで、ああした未舗装路を、ああしたトラックに乗って下りてきた。その一杯を味わいながら、トリマの集落と名古屋の通りの間にある本当の距離を感じてみたい方は、ぜひBoogalooへ。',
  ],
  pt: [
    'Nas veredas do norte do Tolima -- Líbano, Casabianca, Herveo, onde a cordilheira começa a esfriar a caminho do vulcão Nevado del Ruiz -- há uma frase que se repete de geração em geração: "essa Toyota não se vende, se herda". Não é exagero de vendedor. Durante décadas, foi quase literalmente isso que aconteceu: a mesma caminhonete, comprada por um avô nos anos setenta ou oitenta, ainda subindo a mesma estrada de terra quarenta anos depois, agora dirigida pelo neto.',
    'O campo cafeeiro colombiano já tinha seu próprio ícone motorizado antes disso: o jipe Willys, que chegou depois da Segunda Guerra Mundial e ainda hoje desfila, carregado de forma exagerada, nas festas das cidades do Eixo Cafeeiro. Mas nas regiões mais altas e mais difíceis -- as estradas de terra do Tolima, Huila, Cauca, onde nem o Willys aguentava a lama do ano inteiro -- foi outra marca que acabou conquistando a confiança das pessoas: a Toyota. Primeiro os Land Cruiser retos, de motor a diesel, sem nenhum conforto; depois as caminhonetes de caçamba com estrado. Nenhuma delas chegou anunciada por uma campanha publicitária. Chegaram uma a uma, compradas de segunda ou terceira mão, e ficaram por um único motivo: não quebravam -- e quando quebravam, qualquer mecânico de cidade pequena, sem oficina, sem diagnóstico computadorizado, muitas vezes sem mais ferramenta que um jogo de chaves e paciência, conseguia colocá-las para funcionar de novo.',
    'Para muita gente do campo tolimense daquela época, o Japão não era um país que aparecesse muito na conversa. Nem toda vereda tinha televisão, nem todo professor ensinava muito sobre o outro lado do mundo. O que se conhecia de "japonês", o que de fato se tocava e se dirigia todos os dias, era aquela caminhonete que aguentava qualquer coisa. Muito antes de saber onde ficava o Japão no mapa, já se sabia que o que vinha de lá durava. Essa reputação não foi construída por nenhum departamento de marketing: foi construída por quilômetros de estrada de terra, rios que precisavam ser atravessados sem ponte, e uma caminhonete que continuava ligando todas as manhãs.',
    'Essa mesma caminhonete fazia de tudo. Descia o café em pergaminho da fazenda até a cidade, na época da colheita, com sacos empilhados até onde a grade aguentasse. Subia mantimentos, subia gente que não tinha como pagar um transporte rural, subia material de construção. Quando alguém ficava gravemente doente e o posto de saúde da cidade não bastava, era a Toyota que fazia o papel de ambulância na estrada de terra, fosse de noite, fosse chovendo. Em dia de eleição, era a Toyota que levava as urnas até a escola rural. Não existia um serviço separado para cada uma dessas necessidades: existia uma única caminhonete, e a comunidade inteira dependia dela pegar no tranco.',
    'Essa mesma lógica -- algo feito para durar, que chega onde mais nada chega, e que acaba carregando muito mais do que sua função original -- é a mesma que hoje traz o café colombiano até uma mesa em Nagoya. O grão servido no Boogaloo desceu, em algum momento de sua história, por uma estrada parecida com essas, numa caminhonete parecida com essas. Se quiser experimentar esse café -- e entender, numa única xícara, a distância real entre uma vereda do Tolima e uma rua de Nagoya -- esperamos por você no Boogaloo.',
  ],
};

const STORY2_PARRAFOS = {
  es: [
    'Mucho antes de que existiera Colombia como país, los muiscas de los actuales Cundinamarca y Boyacá ya jugaban un juego llamado turmequé: lanzar un disco -- al principio de oro -- hacia un objetivo, en una competencia que combinaba puntería, fuerza y ceremonia. Los españoles lo vieron, lo prohibieron varias veces por las apuestas que generaba, y aun así sobrevivió, cambiando el oro por metal y agregando pólvora al blanco. Hoy se llama tejo, es deporte nacional de Colombia por ley desde el año 2000, y se sigue jugando exactamente donde se jugaba entonces: en canchas de tierra al aire libre, entre cerveza tibia y una mecha que explota cada vez que alguien acierta.',
    'El parqués que reúne familias enteras los fines de semana en el interior andino tiene una historia igual de larga, aunque llegó por otro lado: desciende del pachisi de la India, cruzó a España convertido en parchís, y de ahí a Colombia, donde se volvió juego de sala, de sobremesa, de generaciones sentadas alrededor de un mismo tablero. En la costa Caribe, mientras tanto, el dominó -- de raíces mucho más antiguas y discutidas, entre China, Italia y el mundo árabe -- encontró un lugar particular en las esquinas y los andenes, donde se juega golpeando las fichas contra la mesa con una fuerza que no busca ganar más rápido, sino hacerse escuchar.',
    'Ninguno de estos juegos sobrevivió siglos por casualidad. En un país donde durante décadas la carretera no llegaba a todas partes, donde las noticias tardaban en subir hasta la vereda y bajar hasta el pueblo, el juego de mesa cumplía una función que iba más allá del entretenimiento: era el espacio donde se resolvían deudas, se armaban negocios, se concretaban matrimonios, se discutía política sin que la discusión se volviera pelea -- porque las reglas del juego, a diferencia de las reglas de la vida, todo el mundo las respetaba por igual. La mesa de dominó de la tienda del pueblo cumplía, muchas veces, la misma función que hoy cumple una alcaldía o una junta comunal: ahí se sabía todo, y ahí se resolvía todo.',
    'Japón tiene su propia historia larga con los juegos de mesa como espacio social -- el go y el shogi ya se jugaban en templos y casas de té hace más de mil años, con la misma lógica de fondo: un tablero como excusa legítima para quedarse sentado frente a otra persona el tiempo suficiente para de verdad conocerla. Dos países, en extremos opuestos del mundo, llegaron por caminos completamente distintos a la misma conclusión: que un juego bien jugado no se mide en quién gana, sino en cuánto rato logra que la gente se quede.',
    'Por eso en Boogaloo hay una caja de dominó cerca de las mesas, junto al menú y las servilletas, con la misma naturalidad con la que estaría en la tienda de cualquier pueblo colombiano. La próxima vez que venga, no pida la cuenta apenas termine el plato. Pida el dominó, o pregunte si hay parqués guardado en algún cajón. Lo que pase después con esa mesa -- risas, plata cruzada en broma, una revancha que se promete para la próxima semana -- es exactamente la razón por la que estos juegos llevan siglos vivos.',
  ],
  en: [
    "Long before Colombia existed as a country, the Muisca people of what is now Cundinamarca and Boyacá already played a game called turmequé: throwing a disc -- gold, originally -- at a target, in a contest that combined aim, strength, and ceremony. The Spanish saw it, banned it more than once over the gambling it generated, and it survived anyway, swapping gold for metal and adding gunpowder to the target. Today it's called tejo, it's been Colombia's official national sport by law since 2000, and it's still played exactly where it always was: on open-air dirt courts, over warm beer, with a paper charge that goes off every time someone hits the mark.",
    "The parqués board that gathers whole families together on weekends in the Andean interior has just as long a history, though it arrived from the opposite direction: it descends from India's pachisi, crossed into Spain as parchís, and from there into Colombia, where it became a living-room game, a sit-around-the-table-after-dinner game, generations gathered around the same board. On the Caribbean coast, meanwhile, dominoes -- with much older and more disputed roots, somewhere between China, Italy, and the Arab world -- found a particular home on street corners and sidewalks, played by slamming the tiles down with a force that isn't about winning faster, but about being heard.",
    "None of these games survived for centuries by accident. In a country where, for decades, the road didn't reach everywhere, where news took its time climbing up to the hamlet and back down to the village, the board game served a purpose that went well beyond entertainment: it was where debts got settled, deals got made, marriages got arranged, politics got argued without the argument turning into a fight -- because the rules of the game, unlike the rules of life, applied equally to everyone. The dominoes table at the corner store often did the same job a town hall or a community board does today: everything was known there, and everything got worked out there.",
    "Japan has its own long history of board games as social space -- go and shogi were already being played in temples and teahouses over a thousand years ago, built on the same underlying logic: a board as a legitimate excuse to sit across from another person long enough to actually get to know them. Two countries, on opposite ends of the world, arrived by completely different roads at the same conclusion: that a game well played isn't measured by who wins, but by how long it manages to keep people at the table.",
    "That's why there's a box of dominoes at Boogaloo, kept near the tables, right alongside the menus and the napkins, as naturally as it would sit in any corner store in Colombia. Next time you visit, don't ask for the check the moment you finish your plate. Ask for the dominoes, or ask if there's a parqués board tucked in a drawer somewhere. Whatever happens next at that table -- laughter, small bets made as a joke, a rematch promised for next week -- is exactly why these games have stayed alive for centuries.",
  ],
  ja: [
    'コロンビアという国が存在するよりずっと前、現在のクンディナマルカ県とボヤカ県にあたる地域に暮らしていたムイスカ族は、すでに「トゥルメケ」と呼ばれる遊びに興じていた。的をめがけて円盤 ―― もともとは金製だった ―― を投げるこの競技には、正確さと力、そして儀式的な意味合いが込められていた。スペイン人はこれを目にし、賭博を助長するとして何度も禁止したが、それでも生き残った。金は金属に変わり、的には火薬が加えられた。今日ではテホと呼ばれ、2000年の法律によってコロンビアの公式国技に定められている。今も昔と全く同じ場所 ―― 屋外の土のコートで、ぬるいビールを片手に、命中するたびに火薬が弾ける音とともに ―― プレーされ続けている。',
    'アンデス山間部で週末になると家族全員を集めるボードゲーム「パルケス」にも、同じくらい長い歴史がある。ただしその道のりは正反対だ ―― インドの「パチシ」に始まり、スペインに渡って「パルチス」となり、そこからコロンビアへと伝わって、居間の遊び、食後のひととき、何世代もの家族が同じ盤を囲む遊びになった。一方カリブ海沿岸では、中国、イタリア、アラブ世界のあいだで起源が諸説あるドミノが、街角や歩道に独自の居場所を見つけた。駒をテーブルに叩きつける、その強さは早く勝つためではなく、自分の存在を聞かせるためのものだ。',
    'これらの遊びが何世紀も生き延びたのは偶然ではない。何十年もの間、道路がすべての場所まで届かず、ニュースが集落まで上り、村まで下りてくるのに時間がかかっていたこの国では、ボードゲームは娯楽をはるかに超えた役割を果たしていた。そこで借金が清算され、商談がまとまり、結婚が決まり、政治が議論されても喧嘩にはならなかった ―― なぜなら、人生のルールとは違い、ゲームのルールだけは誰もが等しく守ったからだ。村の商店にあるドミノ台は、今でいう役場や地域評議会と同じ役割を、しばしば果たしていた。そこですべてが知られ、そこですべてが解決された。',
    '日本にも、社会的な空間としてのボードゲームの長い歴史がある。囲碁と将棋は、千年以上前からすでに寺院や茶屋で打たれていた。根底にある論理は同じだ ―― 盤を挟むことは、誰かと向き合って、本当にその人を知るのに十分な時間そこに座っているための、正当な口実になる。地球の正反対に位置する二つの国が、まったく異なる道を通りながら、同じ結論にたどり着いた。よく打たれたゲームとは、誰が勝ったかで測るものではなく、どれだけ長く人をその場に留まらせたかで測るものだ、という結論に。',
    'だからこそBoogalooには、メニューやナプキンのすぐそばに、ドミノの箱が置いてある。コロンビアのどんな街角の商店にもあるのと同じくらい自然に。次にBoogalooに来たときは、料理を食べ終えてすぐにお会計を頼まないでほしい。ドミノを頼むか、どこかの引き出しにパルケスがしまわれていないか聞いてみてほしい。そのあとそのテーブルで起きること ―― 笑い声、冗談交じりの小さな賭け、来週への再戦の約束 ―― それこそが、これらの遊びが何世紀も生き続けてきた理由そのものだ。',
  ],
  pt: [
    'Muito antes de a Colômbia existir como país, os muíscas do que hoje é Cundinamarca e Boyacá já jogavam um jogo chamado turmequé: arremessar um disco -- de ouro, originalmente -- contra um alvo, numa disputa que combinava pontaria, força e cerimônia. Os espanhóis viram aquilo, proibiram várias vezes por causa das apostas que gerava, e mesmo assim o jogo sobreviveu, trocando o ouro por metal e acrescentando pólvora ao alvo. Hoje se chama tejo, é esporte nacional oficial da Colômbia por lei desde 2000, e continua sendo jogado exatamente onde sempre foi: em quadras de terra ao ar livre, com cerveja morna, e uma pólvora que estoura toda vez que alguém acerta.',
    'O parqués que reúne famílias inteiras nos fins de semana no interior andino tem uma história igualmente longa, embora tenha chegado por outro caminho: descende do pachisi indiano, atravessou para a Espanha como parchís, e de lá para a Colômbia, onde virou jogo de sala, de sobremesa, de gerações sentadas ao redor do mesmo tabuleiro. No litoral caribenho, enquanto isso, o dominó -- de raízes bem mais antigas e discutidas, entre a China, a Itália e o mundo árabe -- encontrou um lugar particular nas esquinas e calçadas, jogado batendo as peças na mesa com uma força que não busca ganhar mais rápido, mas sim se fazer ouvir.',
    'Nenhum desses jogos sobreviveu séculos por acaso. Num país onde, durante décadas, a estrada não chegava a todo lugar, onde as notícias demoravam para subir até a vereda e descer até a cidade, o jogo de tabuleiro cumpria uma função que ia muito além do entretenimento: era onde dívidas se resolviam, negócios se fechavam, casamentos se combinavam, política se discutia sem que a discussão virasse briga -- porque as regras do jogo, ao contrário das regras da vida, todo mundo respeitava igualmente. A mesa de dominó da vendinha do bairro cumpria, muitas vezes, a mesma função que hoje cumpre uma prefeitura ou uma junta comunitária: ali se sabia de tudo, e ali se resolvia tudo.',
    'O Japão tem sua própria história longa de jogos de tabuleiro como espaço social -- go e shogi já eram jogados em templos e casas de chá há mais de mil anos, sobre a mesma lógica de fundo: um tabuleiro como desculpa legítima para ficar sentado diante de outra pessoa tempo suficiente para realmente conhecê-la. Dois países, em extremos opostos do mundo, chegaram por caminhos completamente diferentes à mesma conclusão: que um jogo bem jogado não se mede por quem ganha, mas por quanto tempo consegue manter as pessoas à mesa.',
    'Por isso há uma caixa de dominó no Boogaloo, guardada perto das mesas, junto com os cardápios e os guardanapos, com a mesma naturalidade que teria em qualquer vendinha de bairro na Colômbia. Na próxima vez que vier, não peça a conta assim que terminar o prato. Peça o dominó, ou pergunte se há um parqués guardado em alguma gaveta. O que acontecer depois naquela mesa -- risadas, apostas de brincadeira, uma revanche prometida para a semana seguinte -- é exatamente o motivo pelo qual esses jogos continuam vivos há séculos.',
  ],
};

const STORY3_PARRAFOS = {
  es: [
    'En los pueblos paneleros de Santander y Boyacá, la molienda todavía empieza antes de que salga el sol. El trapiche machaca la caña, el jugo verde se cuela, y durante horas alguien tiene que quedarse removiendo la miel en las pailas de cobre para que no se pegue ni se queme, mientras el vapor dulce se mete por toda la casa y por toda la ropa de quien está removiendo. Al final del día, esa miel se vierte en moldes de madera y se deja enfriar hasta volverse un bloque sólido, oscuro, con la forma exacta del molde que la recibió: panela.',
    'Colombia es uno de los mayores consumidores de panela per cápita del mundo, y en no pocas veredas sigue siendo, después del café, el segundo motivo por el que existe un pueblo. La panela no es azúcar a medio hacer: es una decisión deliberada de no refinarla, de dejarle todos los minerales y la melaza que el proceso industrial normalmente separa. Se disuelve en agua caliente para el resfriado, se usa para curar carnes, se le da a los trabajadores del campo como fuente rápida de energía, y hasta hoy sigue produciéndose casi exactamente como se producía hace dos siglos: fuego directo, pailas de cobre, y alguien que no se despega de la miel mientras hierve.',
    'A más de 13.000 kilómetros de distancia, en las islas de Okinawa, existe un azúcar que sigue el mismo principio exacto: el kokuto. Hecho de la misma manera -- caña molida, jugo hervido en pailas grandes, sin refinar, vertido en moldes y dejado enfriar hasta endurecer en bloques oscuros -- el kokuto sobrevive como una especie de excepción dentro de un país que, como el resto del mundo industrializado, migró casi por completo al azúcar blanco refinado. En Okinawa se usa en el awamori (licor local) y en dulces tradicionales, y se vende todavía en los mismos bloques irregulares con los que salió de la paila, exactamente como la panela.',
    'Ni Colombia ni Okinawa se pusieron de acuerdo para seguir haciendo las cosas de la manera más lenta. Lo que tienen en común es algo más simple: en ambos lugares, alguien decidió que un azúcar con sabor a la tierra de donde salió valía más que uno más blanco, más fino, más fácil de producir en masa. Esa terquedad -- llamémosla así -- es la misma que mantiene viva una receta de generación en generación cuando ya existe una versión más rápida y más barata.',
    'En Boogaloo esa panela no es solo un ingrediente de fondo: es la base de la Lemonela, agua de panela con limón, la misma bebida que se toma en cualquier tienda de pueblo colombiano un día de calor. La próxima vez que la pida, sabrá que ese color oscuro y ese sabor que no es azúcar normal vienen de una decisión que se sigue tomando, todos los días, en un trapiche en algún pueblo de Colombia -- y que, del otro lado del mundo, alguien en Okinawa está tomando exactamente la misma decisión.',
  ],
  en: [
    "In the panela-producing towns of Santander and Boyacá, Colombia, the cane pressing starts before sunrise. The trapiche crushes the cane, the green juice gets filtered, and for hours someone has to keep stirring the syrup in copper pans so it doesn't stick or burn, while sweet steam fills the whole house and everyone's clothes. By the end of the day, that syrup gets poured into wooden molds and left to cool into a solid, dark block shaped exactly like the mold that held it: panela.",
    "Colombia is one of the world's highest per-capita consumers of panela, and in more than a few hamlets it's still, after coffee, the second reason a town exists at all. Panela isn't sugar that never finished being made -- it's a deliberate decision not to refine it, to leave in all the minerals and molasses that industrial processing normally strips out. It's dissolved in hot water for a cold, used to cure meat, handed to farm workers as a quick source of energy, and to this day it's still produced almost exactly as it was two centuries ago: open flame, copper pans, and someone who never steps away from the boiling syrup.",
    "Over 13,000 kilometers away, on the islands of Okinawa, there's a sugar that follows the exact same principle: kokuto. Made the same way -- crushed cane, juice boiled down in large pans, left unrefined, poured into molds and left to harden into dark blocks -- kokuto survives as a kind of exception inside a country that, like most of the industrialized world, moved almost entirely to refined white sugar. In Okinawa it goes into awamori (the local liquor) and traditional sweets, and it's still sold in the same irregular blocks it came out of the pan in, exactly like panela.",
    "Colombia and Okinawa never compared notes on staying slow. What they share is simpler than that: in both places, someone decided that a sugar which still tastes like the land it came from was worth more than one that's whiter, finer, easier to mass-produce. That stubbornness -- call it that -- is the same thing that keeps a recipe alive generation after generation, even once a faster, cheaper version already exists.",
    "At Boogaloo, that panela isn't just a background ingredient -- it's the base of Lemonela, panela water with lime, the same drink people order at any small-town tienda in Colombia on a hot day. Next time you order it, you'll know that dark color and that not-quite-sugar flavor come from a decision that's still being made, every day, at some trapiche in a Colombian town -- and that, on the other side of the world, someone in Okinawa is making that exact same decision.",
  ],
  ja: [
    'コロンビアのサンタンデール県やボヤカ県にあるパネラ（未精製の固形サトウキビ糖）の産地では、日が昇る前からサトウキビ搾りが始まる。トラピチェ（製糖機）がサトウキビを砕き、緑がかった搾り汁が濾され、何時間も誰かが銅製の大鍋の前を離れずに、焦げ付かないよう蜜をかき混ぜ続ける。甘い湯気が家中に、そして作業する人の服にまで染み込む。一日の終わりには、その蜜を木型に流し込み、型の形そのままに固まるまで冷ます。それがパネラだ。',
    'コロンビアは一人当たりのパネラ消費量が世界でも指折りの国で、多くの集落ではコーヒーに次いで、その村が存在する二番目の理由になっている。パネラは「作りかけの砂糖」ではない。工業的な精製過程で普通取り除かれるミネラルや糖蜜を、あえて残すという意図的な選択なのだ。風邪をひいたときにお湯に溶かして飲み、肉の保存に使い、農作業をする人にすばやいエネルギー源として渡す。そして今も二百年前とほとんど変わらない方法 ―― 直火、銅の大鍋、そして煮立つ蜜のそばを離れない誰か ―― で作られ続けている。',
    '1万3千キロ以上離れた沖縄の島々にも、まったく同じ原理に基づく砂糖がある。黒糖だ。作り方も同じ ―― サトウキビを搾り、大きな鍋で汁を煮詰め、精製せずに型に流し込み、固まるまで冷まして黒っぽい塊にする。世界の工業化した国々の多くと同様、ほぼ完全に精製された白砂糖に移行した日本の中で、黒糖はある種の例外として生き残っている。沖縄では泡盛（地元の酒）や伝統的な菓子に使われ、今も鍋から出てきたときと同じ不揃いな塊のまま、パネラとまったく同じように売られている。',
    'コロンビアと沖縄が示し合わせてゆっくりしたやり方を続けてきたわけではない。両者に共通しているのはもっと単純なことだ ―― どちらの土地でも、誰かが「生まれた土地の味がする砂糖」の方が、より白く、より精製されていて、大量生産しやすい砂糖よりも価値があると判断した、ということ。その頑固さこそが、もっと速くて安いやり方がすでに存在していても、レシピを世代を超えて生かし続けているものなのだ。',
    'Boogalooでは、そのパネラは単なる裏方の材料ではない。「レモネラ」、パネラとライムの水、コロンビアのどんな田舎町の商店でも暑い日に頼まれる、あの飲み物のベースになっている。次に頼むときは、あの濃い色と、ただの砂糖とは違う味が、コロンビアのどこかの町のトラピチェで今日も下されている決断からきていることを、そして地球の反対側の沖縄でも、誰かが今まさに同じ決断を下していることを、知っておいてほしい。',
  ],
  pt: [
    'Nas cidades produtoras de panela de Santander e Boyacá, na Colômbia, a moagem da cana começa antes do amanhecer. O trapiche esmaga a cana, o caldo verde é coado, e por horas alguém precisa ficar mexendo o mel nas tachas de cobre para não grudar nem queimar, enquanto o vapor doce toma conta da casa inteira e da roupa de quem está mexendo. No fim do dia, esse mel é despejado em formas de madeira e deixado esfriar até virar um bloco sólido e escuro, com o formato exato da forma que o recebeu: a panela.',
    'A Colômbia é uma das maiores consumidoras de panela per capita do mundo, e em muitas veredas ela ainda é, depois do café, o segundo motivo pelo qual uma cidade existe. Panela não é açúcar que ficou pela metade -- é uma decisão deliberada de não refiná-la, de deixar nela todos os minerais e o melaço que o processo industrial normalmente separa. É dissolvida em água quente para resfriados, usada para curar carnes, dada a trabalhadores rurais como fonte rápida de energia, e até hoje continua sendo produzida quase exatamente como há dois séculos: fogo direto, tachas de cobre, e alguém que não sai de perto do mel fervendo.',
    'A mais de 13.000 quilômetros de distância, nas ilhas de Okinawa, existe um açúcar que segue exatamente o mesmo princípio: o kokuto. Feito da mesma forma -- cana moída, caldo fervido em tachas grandes, sem refinar, despejado em formas e deixado endurecer em blocos escuros -- o kokuto sobrevive como uma espécie de exceção dentro de um país que, como quase todo o mundo industrializado, migrou quase totalmente para o açúcar branco refinado. Em Okinawa ele vai no awamori (a bebida local) e em doces tradicionais, e ainda é vendido nos mesmos blocos irregulares com que saiu da tacha, exatamente como a panela.',
    'Colômbia e Okinawa nunca combinaram continuar fazendo as coisas do jeito mais lento. O que os dois lugares têm em comum é mais simples que isso: em ambos, alguém decidiu que um açúcar com gosto da terra de onde veio valia mais do que um mais branco, mais fino, mais fácil de produzir em massa. Essa teimosia -- vamos chamar assim -- é a mesma coisa que mantém uma receita viva de geração em geração, mesmo quando já existe uma versão mais rápida e mais barata.',
    'No Boogaloo, essa panela não é só um ingrediente de fundo -- é a base da Lemonela, água de panela com limão, a mesma bebida que se pede em qualquer vendinha de cidade pequena na Colômbia num dia quente. Na próxima vez que pedir, saberá que aquela cor escura e aquele sabor que não é bem açúcar vêm de uma decisão que continua sendo tomada, todos os dias, em algum trapiche de uma cidade colombiana -- e que, do outro lado do mundo, alguém em Okinawa está tomando exatamente essa mesma decisão.',
  ],
};

// Cada nueva entrada del blog solo necesita: un bloque STORYn_PARRAFOS arriba,
// las claves blogStoryNTitle en i18n.js, su <article id="blog-storyN-..."> en
// blog.html, y una línea aquí. Así la rutina diaria solo agrega, no reescribe.
const STORIES = [
  { key: 'story1', parrafos: STORY1_PARRAFOS, titleKey: 'blogStory1Title' },
  { key: 'story2', parrafos: STORY2_PARRAFOS, titleKey: 'blogStory2Title' },
  { key: 'story3', parrafos: STORY3_PARRAFOS, titleKey: 'blogStory3Title' },
];

function ctaRowHtml(idPrefix) {
  return `
    <div class="blog-cta-row">
      <a class="primary-btn" href="reserva.html" id="${idPrefix}-cta-reserve"></a>
      <a class="ghost-btn" href="index.html" id="${idPrefix}-cta-menu"></a>
    </div>
  `;
}

function renderHistorias() {
  const lang = STORY1_PARRAFOS[I18n.lang] ? I18n.lang : 'es';
  STORIES.forEach(({ key, parrafos }) => {
    const idPrefix = `blog-${key}`;
    const body = document.getElementById(`${idPrefix}-body`);
    if (!body) return;
    body.innerHTML = parrafos[lang].map((p) => `<p>${p}</p>`).join('') + ctaRowHtml(idPrefix);
    document.getElementById(`${idPrefix}-cta-reserve`).textContent = I18n.t('gateReserveBtn');
    document.getElementById(`${idPrefix}-cta-menu`).textContent = I18n.t('abVerMenuBtn');
  });
}

// ---------------- Idioma ----------------

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('blogPageLabel');
  document.getElementById('blog-hero-title').textContent = I18n.t('blogHeroTitle');
  STORIES.forEach(({ key, titleKey }) => {
    const titleEl = document.getElementById(`blog-${key}-title`);
    if (titleEl) titleEl.textContent = I18n.t(titleKey);
    const bylineEl = document.getElementById(`blog-${key}-byline`);
    if (bylineEl) bylineEl.textContent = '— Boogaloo';
  });
  document.getElementById('blog-menu-link').textContent = I18n.t('abVerMenuBtn');
  renderHistorias();
}

function onLangChange() {
  applyStaticI18n();
}

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <a class="cart-btn" href="index.html" id="blog-menu-link" style="text-decoration:none;"></a>
`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));

applyStaticI18n();
