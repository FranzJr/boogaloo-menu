/* Página "Blog": reportajes narrativos que conectan Colombia y Japón,
   cerrando siempre con una invitación a visitar Boogaloo. A diferencia de
   otros textos del sitio, las historias sí se traducen a los 4 idiomas
   (STORY1/STORY2), porque el objetivo es que cada entrada atraiga clientes
   -- y la mayoría de quienes visitan Boogaloo leen japonés o inglés, no
   español. Progressive enhancement: si JS no corre, el contenido queda
   visible desde el inicio (ver css: body.js-ready). */

document.body.classList.add('js-ready');

function setupReveal() {
  const revealTargets = document.querySelectorAll('[data-reveal]:not([data-reveal-bound])');
  revealTargets.forEach((el) => el.setAttribute('data-reveal-bound', '1'));
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

const STORY4_PARRAFOS = {
  es: [
    'En los mismos municipios del norte del Tolima donde antes solo se hablaba de café -- Herveo, Casabianca, el propio Líbano -- en las últimas dos décadas empezó a aparecer otro cultivo en las laderas: el aguacate Hass. Fincas que durante generaciones solo conocieron cafetales o potreros de ganado hoy tienen hileras de árboles cargados de esa fruta oscura y rugosa que hace apenas veinte años casi nadie sembraba allí en serio.',
    'Colombia se convirtió, casi sin proponérselo al principio, en uno de los grandes exportadores de aguacate Hass del mundo. El clima de la cordillera -- la misma altura y la misma tierra que sirvieron para el café -- resultó ser, con algunos ajustes, igual de generoso con el aguacate. Familias enteras que vivían de la cosecha cafetera empezaron a diversificar, o directamente a cambiar de cultivo, siguiendo una fruta que de pronto el mundo entero quería comprar.',
    'En Japón el aguacate tiene una historia distinta pero igual de reciente: no es un ingrediente tradicional de la cocina japonesa, y durante buena parte del siglo veinte casi no se consumía. Fue ganando terreno poco a poco, primero como curiosidad importada, hasta que alguien le puso un nombre que se quedó: 森のバター, mori no batā, "la mantequilla del bosque". El apodo describe exactamente lo que la fruta le pareció a un país que no la conocía -- algo untuoso, rico, que crece en un árbol en vez de salir de una vaca -- y hoy el aguacate es un ingrediente habitual en supermercados y restaurantes japoneses, sin que nadie recuerde ya que hace pocas décadas era una rareza.',
    'Tolima y Japón adoptaron el aguacate casi al mismo tiempo, por razones opuestas: allá porque de repente había un cultivo nuevo que la tierra recibía bien, acá porque una fruta extranjera encontró, contra todo pronóstico, un lugar permanente en la mesa. Ninguno de los dos lugares creció con el aguacate como herencia -- los dos lo aprendieron a querer ya de grandes, y en ambos casos terminó quedándose.',
    'En Boogaloo esa fruta llega en forma de guacamole casero, hecho el mismo día, para acompañar las arepas y las empanadas como se acostumbra en cualquier mesa colombiana. Si quiere probar esa misma mantequilla del bosque que ahora crece en las laderas del Tolima, lo esperamos en Boogaloo.',
  ],
  en: [
    "In the same northern Tolima towns that used to talk about nothing but coffee -- Herveo, Casabianca, Líbano itself -- a different crop started showing up on the hillsides over the last two decades: Hass avocado. Farms that for generations knew only coffee groves or cattle pasture now have rows of trees loaded with that dark, rough-skinned fruit that almost nobody planted seriously there twenty years ago.",
    "Colombia became, almost without setting out to, one of the world's major Hass avocado exporters. The mountain climate -- the same altitude and soil that had always served coffee -- turned out, with some adjustment, to be just as generous to avocado. Whole families who had lived off the coffee harvest started diversifying, or switching crops outright, following a fruit the whole world suddenly wanted to buy.",
    'In Japan, the avocado has a different but equally recent story: it isn\'t a traditional ingredient in Japanese cooking, and for most of the twentieth century it was barely eaten at all. It gained ground slowly, first as an imported curiosity, until someone gave it a name that stuck: 森のバター, mori no batā, "butter of the forest." The nickname captures exactly what the fruit looked like to a country that didn\'t grow up with it -- something rich and buttery that comes off a tree instead of out of a cow -- and today avocado is a routine ingredient in Japanese supermarkets and restaurants, with barely anyone remembering it was a rarity just a few decades ago.',
    "Tolima and Japan adopted the avocado at almost the same time, for opposite reasons: there, because a new crop suddenly took to the land; here, because a foreign fruit found, against the odds, a permanent place at the table. Neither place grew up with avocado as an inheritance -- both learned to love it as adults, and in both cases it stayed.",
    "At Boogaloo, that fruit arrives as homemade guacamole, made fresh the same day, to go with arepas and empanadas the way it would at any Colombian table. If you want to taste that same butter of the forest now growing on the hillsides of Tolima, we're waiting for you at Boogaloo.",
  ],
  ja: [
    'かつてはコーヒーの話しか出てこなかったトリマ県北部の町々 ―― エルベオ、カサビアンカ、リバノそのもの ―― では、ここ二十年ほどで山の斜面に別の作物が現れ始めた。ハス種のアボカドだ。何世代にもわたってコーヒー畑か牧草地しか知らなかった農園に、二十年前にはほとんど誰も本気で植えていなかった、あの黒くごつごつした果実がなる木が、今では何列も並んでいる。',
    'コロンビアは、最初はそうなるつもりもなかったのに、世界有数のハス種アボカド輸出国になった。コーヒーをずっと支えてきたのと同じ標高、同じ土壌のアンデスの気候が、多少の工夫を加えるだけでアボカドにも同じくらい適していることが分かったのだ。コーヒー収穫で生計を立てていた家族が、世界中が急に欲しがるようになったこの果物を追いかけて、栽培を多角化したり、思い切って作物を切り替えたりし始めた。',
    '日本におけるアボカドの歴史はまったく違うが、同じくらい新しい。日本料理の伝統的な食材ではなく、二十世紀の大半、ほとんど食べられていなかった。最初は輸入の珍しい食べ物として少しずつ広まり、やがて定着する呼び名がついた ―― 森のバター。この呼び名は、育った経験のない国にとってこの果物がどう見えたかを的確に表している ―― 牛からではなく木から採れる、濃厚でクリーミーなもの。今では日本のスーパーやレストランでアボカドはごく普通の食材となり、数十年前まで珍しかったことを覚えている人はほとんどいない。',
    'トリマと日本は、ほぼ同時期に、正反対の理由でアボカドを受け入れた。トリマでは、新しい作物が突然その土地に合ったから。日本では、外国の果物が思いがけず食卓に定着したから。どちらの土地も、アボカドを受け継いだわけではない ―― どちらも大人になってから好きになり、そしてどちらの場合も、それが根付いた。',
    'Boogalooでは、その果物は自家製ワカモレとして、その日のうちに作られ、コロンビアのどんな食卓でもそうするようにアレパやエンパナーダに添えられる。今トリマの山の斜面で育っているのと同じ「森のバター」を味わってみたい方は、ぜひBoogalooへ。',
  ],
  pt: [
    'Nas mesmas cidades do norte do Tolima onde antes só se falava de café -- Herveo, Casabianca, o próprio Líbano -- nas últimas duas décadas começou a aparecer outra cultura nas encostas: o abacate Hass. Fazendas que por gerações só conheceram cafezais ou pastos de gado hoje têm fileiras de árvores carregadas dessa fruta escura e de casca áspera que, há apenas vinte anos, quase ninguém plantava a sério ali.',
    'A Colômbia se tornou, quase sem se propor a isso no início, uma das grandes exportadoras de abacate Hass do mundo. O clima da cordilheira -- a mesma altitude e a mesma terra que sempre serviram ao café -- mostrou-se, com alguns ajustes, igualmente generoso com o abacate. Famílias inteiras que viviam da colheita do café começaram a diversificar, ou simplesmente a trocar de cultura, seguindo uma fruta que, de repente, o mundo inteiro queria comprar.',
    'No Japão, o abacate tem uma história diferente, mas igualmente recente: não é um ingrediente tradicional da culinária japonesa, e durante boa parte do século vinte quase não era consumido. Foi ganhando espaço aos poucos, primeiro como uma curiosidade importada, até que alguém lhe deu um nome que pegou: 森のバター, mori no batā, "a manteiga da floresta". O apelido descreve exatamente o que a fruta pareceu ser para um país que não a conhecia -- algo untuoso e rico, que cresce numa árvore em vez de vir de uma vaca -- e hoje o abacate é um ingrediente comum em supermercados e restaurantes japoneses, sem que quase ninguém lembre que, poucas décadas atrás, era uma raridade.',
    'Tolima e Japão adotaram o abacate quase ao mesmo tempo, por razões opostas: lá, porque uma nova cultura de repente se adaptou bem à terra; aqui, porque uma fruta estrangeira encontrou, contra todas as expectativas, um lugar permanente à mesa. Nenhum dos dois lugares cresceu com o abacate como herança -- os dois aprenderam a gostar dele já adultos, e em ambos os casos ele ficou.',
    'No Boogaloo, essa fruta chega em forma de guacamole caseiro, feito no mesmo dia, para acompanhar as arepas e os pastéis como se costuma fazer em qualquer mesa colombiana. Se quiser provar essa mesma manteiga da floresta que agora cresce nas encostas do Tolima, esperamos por você no Boogaloo.',
  ],
};

const STORY5_PARRAFOS = {
  es: [
    'En Falan, en las estribaciones del norte del Tolima, hay una reserva natural que se anuncia con un letrero rústico a la entrada del pueblo: senderismo, torrentismo, zona de camping. Ciudad Perdida de Falan no tiene nada que ver con la famosa Ciudad Perdida de la Sierra Nevada de Santa Marta -- es un nombre local, más humilde, para un bosque de niebla al que la gente sube porque sabe, sin necesidad de que se lo explique nadie, que hace bien.',
    'En los últimos años, reservas como esta se han multiplicado en las zonas rurales de Colombia: bosques privados o comunitarios que alguien decidió no talar ni sembrar, sino abrir para que la gente camine entre los árboles. No hace falta un objetivo deportivo ni una meta que cumplir -- basta con entrar, seguir el sendero, y dejar que el ruido de la ciudad se quede atrás.',
    'Japón le puso nombre a esa misma costumbre hace más de cuarenta años: shinrin-yoku, 森林浴, literalmente "baño de bosque". El término lo acuñó el gobierno japonés en 1982, como parte de una campaña para animar a la gente a caminar entre árboles sin ningún propósito más que estar ahí. Con el tiempo, universidades japonesas empezaron a medir lo que ya se sospechaba: caminar despacio en un bosque baja la presión arterial y el cortisol, de forma medible, sin que haga falta ni un remedio ni una receta.',
    'Colombia nunca necesitó ponerle un nombre en japonés a la costumbre de subir al monte a despejarse -- siempre se hizo, en cualquier finca, en cualquier vereda con un camino hacia arriba. Pero los dos países, cada uno a su manera, llegaron a la misma conclusión: que caminar entre árboles, sin apuro y sin agenda, es una de las pocas medicinas que no se compran en ninguna farmacia.',
    'El café que se sirve en Boogaloo, de hecho, crece exactamente en ese tipo de bosque: bajo sombra, entre otros árboles, en las mismas laderas donde la gente sube a caminar. Si alguna vez sube a un sendero como el de Falan, o simplemente necesita un rato sin apuro, en Boogaloo lo esperamos con un café que también salió de ahí.',
  ],
  en: [
    'In Falan, on the northern foothills of Tolima, there\'s a nature reserve advertised with a rustic sign at the edge of town: hiking, canyoning, camping grounds. Ciudad Perdida de Falan has nothing to do with the famous Ciudad Perdida in the Sierra Nevada de Santa Marta -- it\'s a local, humbler name for a cloud forest that people climb up to because they already know, without anyone needing to explain it, that it does them good.',
    "In recent years, reserves like this one have multiplied across rural Colombia: private or community-owned forests that someone decided not to cut down or plant over, but to open up so people can walk among the trees. There's no athletic goal required, no box to check -- you just walk in, follow the trail, and let the noise of the city fall behind.",
    'Japan gave that same habit a name more than forty years ago: shinrin-yoku, 森林浴, literally "forest bathing." The term was coined by the Japanese government in 1982, part of a campaign to encourage people to walk among trees with no purpose other than being there. Over time, Japanese universities began measuring what people already suspected: walking slowly through a forest measurably lowers blood pressure and cortisol, with no prescription required.',
    "Colombia never needed a Japanese name for the habit of heading up into the hills to clear your head -- it was always just something people did, on any farm, on any hamlet road that led uphill. But both countries, each in their own way, arrived at the same conclusion: that walking among trees, unhurried and without an agenda, is one of the few medicines that can't be bought at a pharmacy.",
    "The coffee served at Boogaloo, in fact, grows in exactly that kind of forest: shade-grown, among other trees, on the same hillsides where people climb up to walk. If you ever hike a trail like the one in Falan, or simply need some unhurried time, at Boogaloo we're waiting with a coffee that came from there too.",
  ],
  ja: [
    'トリマ県北部の麓、ファランという町には、町はずれに素朴な看板を掲げた自然保護区がある ―― ハイキング、キャニオニング、キャンプ場。「シウダー・ペルディーダ・デ・ファラン」は、シエラ・ネバダ・デ・サンタマルタにある有名な「シウダー・ペルディーダ」とは何の関係もない。誰かに説明されなくても、そこに登れば体にいいと分かっている雲霧林につけられた、もっと素朴な地元の名前だ。',
    '近年、コロンビアの農村部ではこうした保護区が次々と生まれている ―― 誰かが伐採も植林もせず、そのままにしておくことを選び、人々が木々の間を歩けるように開放した私有地や共同体所有の森だ。達成すべきスポーツの目標も、こなすべきノルマもいらない。ただ入って、道をたどり、都市の喧騒を後ろに置いていくだけでいい。',
    '日本は四十年以上前、まさに同じ習慣に名前をつけた ―― 森林浴だ。この言葉は1982年に日本政府が作った造語で、人々に、ただそこにいる以外に目的を持たずに木々の間を歩くことを勧めるキャンペーンの一部だった。やがて日本の大学は、すでに多くの人が感じていたことを測定し始めた ―― 森の中をゆっくり歩くと、処方箋も薬も要らずに、血圧とコルチゾールが測定可能なレベルで下がる、ということを。',
    'コロンビアは、頭を整理するために山に登るという習慣に、日本語の名前をつける必要など一度もなかった ―― どんな農園でも、上へ続く道のあるどんな集落でも、昔からずっとやってきたことだからだ。しかし両国は、それぞれ違う道を通りながら、同じ結論にたどり着いた ―― 急がず、予定も立てずに木々の間を歩くことは、どんな薬局でも買えない数少ない薬の一つだ、という結論に。',
    '実はBoogalooで出しているコーヒーも、まさにそうした森 ―― 他の木々の陰で育つシェードグロウン・コーヒー ―― で、人々が歩きに登るのと同じ山の斜面で栽培されている。ファランのような山道を歩いた後も、ただ急がない時間が必要なときも、Boogalooでは、そこから生まれたコーヒーと一緒にお待ちしている。',
  ],
  pt: [
    'Em Falan, no sopé norte do Tolima, há uma reserva natural anunciada por uma placa rústica na entrada da cidade: trilhas, canyoning, área de camping. Ciudad Perdida de Falan não tem nada a ver com a famosa Ciudad Perdida da Sierra Nevada de Santa Marta -- é um nome local, mais humilde, para uma floresta de neblina para onde as pessoas sobem porque já sabem, sem que ninguém precise explicar, que faz bem.',
    'Nos últimos anos, reservas como essa se multiplicaram pelo interior da Colômbia: florestas privadas ou comunitárias que alguém decidiu não derrubar nem plantar, mas abrir para que as pessoas caminhem entre as árvores. Não é preciso nenhuma meta esportiva nem objetivo a cumprir -- basta entrar, seguir a trilha e deixar o barulho da cidade para trás.',
    'O Japão deu nome a esse mesmo hábito há mais de quarenta anos: shinrin-yoku, 森林浴, literalmente "banho de floresta". O termo foi criado pelo governo japonês em 1982, parte de uma campanha para incentivar as pessoas a caminhar entre árvores sem outro propósito além de estar ali. Com o tempo, universidades japonesas começaram a medir o que já se suspeitava: caminhar devagar numa floresta baixa a pressão arterial e o cortisol de forma mensurável, sem receita nem remédio.',
    'A Colômbia nunca precisou de um nome em japonês para o hábito de subir ao mato para clarear a cabeça -- sempre foi algo que se fazia, em qualquer fazenda, em qualquer vereda com um caminho subindo. Mas os dois países, cada um à sua maneira, chegaram à mesma conclusão: que caminhar entre árvores, sem pressa e sem agenda, é um dos poucos remédios que não se compram em nenhuma farmácia.',
    'O café servido no Boogaloo, aliás, cresce exatamente nesse tipo de floresta: cultivado à sombra, entre outras árvores, nas mesmas encostas onde as pessoas sobem para caminhar. Se um dia você fizer uma trilha como a de Falan, ou simplesmente precisar de um tempo sem pressa, no Boogaloo esperamos por você com um café que também veio de lá.',
  ],
};

const STORY6_PARRAFOS = {
  es: [
    'En casi cualquier plaza principal de un pueblo o ciudad colombiana hay una catedral o una iglesia con dos torres, y en esas torres hay campanas que llevan sonando desde antes de que la mayoría de la gente del pueblo naciera. No hace falta reloj ni altavoz: durante décadas, las misas, los entierros, las fiestas patronales y hasta las alarmas de incendio se anunciaron con un patrón de campanadas que todo el mundo en el pueblo sabía interpretar sin que se lo explicaran.',
    'Cada ocasión tenía su propio toque: no sonaba igual la campana que llamaba a misa de ocho que la que anunciaba una muerte, y todavía en Nochebuena, a la medianoche, las campanas repican distinto para marcar la Misa de Gallo. El campanario no solo daba la hora -- daba el motivo.',
    'Japón tiene su propia versión de esto, aunque limitada a una sola noche del año: joya no kane, el repique de las campanas de los templos budistas la noche del 31 de diciembre. Se tocan exactamente 108 veces -- un número que, según la tradición budista, representa los 108 deseos o apegos terrenales que atormentan a una persona -- y cada campanada busca disolver uno de ellos antes de que empiece el año nuevo. La costumbre no viene de una sola ciudad ni de un solo templo: se repite, cada 31 de diciembre, en templos de todo el país, y mucha gente se queda despierta hasta la medianoche solo para escucharla.',
    'Colombia nunca contó sus campanadas ni les puso un número exacto -- pero en ambos países una campana grande, de metal, colgada en lo alto de un edificio religioso, sigue cumpliendo la misma función que cumplía antes de que existiera cualquier reloj o altavoz: marcarle a todo un pueblo, al mismo tiempo, que algo importante está pasando.',
    'En Boogaloo el sonido también importa -- el nombre del restaurante es, de hecho, un género musical, y la música seleccionada suena todo el tiempo como parte de la experiencia. No hay campanas, pero sí hay una idea parecida: un sonido que anuncia que es momento de sentarse, comer despacio y compartir la mesa. Si quiere escucharlo, lo esperamos en Boogaloo.',
  ],
  en: [
    "In almost any main square of a Colombian town or city there's a cathedral or church with two towers, and in those towers there are bells that have been ringing since before most of the town's residents were born. No clock or loudspeaker was needed: for decades, masses, funerals, patron saint festivals, and even fire alarms were announced through a pattern of bell tolls that everyone in town knew how to read without anyone explaining it.",
    "Each occasion had its own ring: the bell that called people to eight o'clock mass didn't sound the same as the one announcing a death, and to this day, at midnight on Christmas Eve, the bells ring differently to mark Misa de Gallo, the midnight mass. The bell tower didn't just tell the time -- it told the reason.",
    "Japan has its own version of this, though limited to a single night of the year: joya no kane, the ringing of Buddhist temple bells on the night of December 31st. They're rung exactly 108 times -- a number that, in Buddhist tradition, represents the 108 earthly desires or attachments that torment a person -- and each toll is meant to dissolve one of them before the new year begins. The custom isn't tied to one city or one temple: it repeats, every December 31st, at temples all across the country, and many people stay up until midnight just to hear it.",
    "Colombia never counted its bell tolls or gave them an exact number -- but in both countries, a large metal bell hung high on a religious building still does the same job it did before any clock or loudspeaker existed: letting an entire town know, all at once, that something important is happening.",
    "Sound matters at Boogaloo too -- the restaurant's name is, in fact, a music genre, and curated music plays throughout as part of the experience. There are no bells, but there's a similar idea: a sound that announces it's time to sit down, eat slowly, and share the table. If you want to hear it, we're waiting for you at Boogaloo.",
  ],
  ja: [
    'コロンビアの町や都市の中心広場には、たいてい二つの塔を持つ大聖堂か教会があり、その塔には、町の住民の多くが生まれるずっと前から鳴り続けてきた鐘がある。時計もスピーカーも要らなかった ―― 何十年もの間、ミサも、葬式も、守護聖人の祭りも、さらには火事の警報までも、誰に説明されなくても町の誰もが読み取れる鐘の鳴らし方のパターンで知らされてきた。',
    'それぞれの機会には、それぞれの鳴らし方があった。八時のミサを知らせる鐘と、誰かの死を知らせる鐘は同じ音ではなく、今でもクリスマスイブの真夜中には、深夜ミサ「ミサ・デ・ガジョ」を告げるために鐘は違う鳴り方をする。鐘楼は時刻を告げるだけでなく、理由も告げていたのだ。',
    '日本にも、一年のうち一晩だけに限られた、同じような習慣がある ―― 除夜の鐘、12月31日の夜に仏教寺院の鐘を鳴らす行事だ。ちょうど108回鳴らされる ―― この数字は仏教の伝統で、人を苦しめる108の煩悩を表すとされ、鐘を一つ鳴らすごとに、新年が始まる前にその一つを消し去ろうとする。この習慣は特定の一つの都市や寺院に限られたものではなく、毎年12月31日、日本全国の寺院で繰り返され、多くの人がそれを聞くためだけに真夜中まで起きている。',
    'コロンビアは鐘の音を数えたことも、正確な回数を決めたこともない ―― しかし両国とも、宗教建築の高いところに吊るされた大きな金属の鐘は、時計もスピーカーもなかった時代に果たしていたのと同じ役割を今も果たしている ―― 町全体に、同時に、何か大事なことが起きていると知らせる役割だ。',
    'Boogalooでも音は大切にされている ―― この店の名前は実は音楽のジャンルの名前で、選び抜かれた音楽が常に流れ、体験の一部になっている。鐘はないが、似た考えはある ―― 座って、ゆっくり食べて、テーブルを囲む時間だと知らせる音だ。それを聞きに、ぜひBoogalooへ。',
  ],
  pt: [
    'Em quase qualquer praça principal de uma cidade colombiana há uma catedral ou igreja com duas torres, e nessas torres há sinos que tocam desde antes de a maioria dos moradores da cidade nascer. Não era preciso relógio nem alto-falante: durante décadas, missas, funerais, festas do padroeiro e até alarmes de incêndio eram anunciados por um padrão de badaladas que todo mundo na cidade sabia interpretar sem que ninguém precisasse explicar.',
    'Cada ocasião tinha seu próprio toque: o sino que chamava para a missa das oito não soava igual ao que anunciava uma morte, e até hoje, na meia-noite da véspera de Natal, os sinos tocam diferente para marcar a Missa do Galo. O campanário não dizia só a hora -- dizia o motivo.',
    'O Japão tem sua própria versão disso, embora limitada a uma única noite do ano: joya no kane, o toque dos sinos dos templos budistas na noite de 31 de dezembro. Tocam exatamente 108 vezes -- um número que, na tradição budista, representa os 108 desejos ou apegos terrenos que atormentam uma pessoa -- e cada badalada busca dissolver um deles antes que o ano novo comece. O costume não pertence a uma única cidade ou templo: se repete, todo 31 de dezembro, em templos por todo o país, e muita gente fica acordada até a meia-noite só para ouvi-lo.',
    'A Colômbia nunca contou suas badaladas nem lhes deu um número exato -- mas nos dois países um sino grande, de metal, pendurado no alto de um prédio religioso, ainda cumpre a mesma função que cumpria antes de existir qualquer relógio ou alto-falante: avisar a uma cidade inteira, ao mesmo tempo, que algo importante está acontecendo.',
    'O som também importa no Boogaloo -- o nome do restaurante é, na verdade, um gênero musical, e a música selecionada toca o tempo todo como parte da experiência. Não há sinos, mas há uma ideia parecida: um som que anuncia que é hora de sentar, comer devagar e compartilhar a mesa. Se quiser ouvi-lo, esperamos por você no Boogaloo.',
  ],
};

// Cada nueva entrada del blog solo necesita: un bloque STORYn_PARRAFOS arriba,
// la clave blogStoryNTitle en i18n.js, y un objeto nuevo aquí (color rota entre
// red/blue/gold; credit es null para fotos propias, o {name,url,source} para
// una foto de banco externa). No hace falta tocar blog.html: el <article> de
// cada entrada se genera solo, y siempre se muestra la más nueva primero.
const STORY7_PARRAFOS = {
  es: [
    'La arepa es, en su forma más simple, maíz molido, agua y sal, cocinado sobre una plancha caliente. Nada más. Esa sencillez tiene siglos: el maíz ya se molía y se cocinaba en tortas planas entre los pueblos indígenas de lo que hoy es Colombia mucho antes de la llegada de los españoles, y desde entonces la arepa no ha dejado de estar en la mesa de casi todas las regiones del país -- gruesa o delgada, asada o frita, sola o rellena, según a qué valle o a qué montaña se llegue.',
    'Lo que la hace especial no es un ingrediente raro, sino el gesto: la masa se amasa con las manos, se aplana con las palmas, se voltea en la plancha con los dedos. Es una comida que se hace tocándola. Y por eso mismo es una comida portátil, de las que caben en una mano: se le lleva al trabajo, al campo, a la escuela, se come de pie o caminando, con queso derretido adentro si hay, y sola si no hay.',
    'En Japón existe una comida que nace del mismo gesto: el onigiri. Arroz cocido, todavía tibio, que se moldea con las manos -- con un poco de sal en las palmas -- hasta darle forma de triángulo o de bola, muchas veces con un relleno en el centro y una tira de alga nori alrededor. Igual que la arepa, es alimento de viaje, de jornada larga, de lonchera; igual que la arepa, es tan cotidiano que casi nadie lo piensa como "receta", y sin embargo cada casa tiene su manera de hacerlo.',
    'Son dos cereales distintos, en dos extremos del planeta, que llegaron a una idea parecida: que la comida más reconfortante es la que se puede sostener con una mano, la que se hace sin cubiertos y sin ceremonia, con lo que hay a la mano y con las manos de quien cocina. En ambos casos el ingrediente principal es humilde; lo que lo convierte en algo memorable es quién lo prepara y con qué cuidado.',
    'En Boogaloo las arepas se hacen así, a mano y sobre la plancha, rellenas de queso fundido, de carne o de pollo desmechado. Si algún día extraña su onigiri de la tienda de la esquina, venga a probar la arepa colombiana: no es el mismo plato, pero vienen de la misma idea. Lo esperamos en Boogaloo.',
  ],
  en: [
    "In its simplest form, the arepa is ground corn, water and salt, cooked on a hot griddle. Nothing more. That simplicity is centuries old: the Indigenous peoples of what is now Colombia were grinding corn and cooking it into flat cakes long before the Spanish arrived, and the arepa has never left the table in almost any region of the country since -- thick or thin, grilled or fried, plain or filled, depending on which valley or mountain you're in.",
    "What makes it special isn't a rare ingredient but the gesture: the dough is kneaded by hand, flattened with the palms, flipped on the griddle with the fingers. It's food you make by touching it. And for that very reason it's portable food, the kind that fits in one hand: taken to work, to the fields, to school, eaten standing up or on the move, with melted cheese inside if there is any, and plain if there isn't.",
    "Japan has a food born of the same gesture: the onigiri. Cooked rice, still warm, shaped by hand -- with a little salt on the palms -- into a triangle or a ball, often with a filling in the center and a strip of nori seaweed around it. Like the arepa, it's food for travel, for long days, for lunch boxes; like the arepa, it's so everyday that hardly anyone thinks of it as a recipe, and yet every household has its own way of making it.",
    "Two different grains, on opposite sides of the planet, arrived at a similar idea: that the most comforting food is the kind you can hold in one hand, made without cutlery and without ceremony, with what's at hand and with the hands of whoever is cooking. In both cases the main ingredient is humble; what makes it memorable is who prepares it and how carefully.",
    "At Boogaloo, arepas are made just like that, by hand and on the griddle, filled with melted cheese, beef or shredded chicken. If you ever miss the onigiri from your corner store, come try the Colombian arepa: it's not the same dish, but it comes from the same idea. We're waiting for you at Boogaloo.",
  ],
  ja: [
    'アレパを最もシンプルな形で言えば、挽いたトウモロコシと水と塩を、熱した鉄板で焼いたものだ。それだけである。このシンプルさには何世紀もの歴史がある。現在のコロンビアにあたる土地の先住民は、スペイン人が到来するはるか前からトウモロコシを挽いて平たい生地にして焼いていた。それ以来、アレパは国内のほぼどの地域の食卓からも消えたことがない ―― 厚いものも薄いものも、焼いたものも揚げたものも、具なしも具入りも、どの谷、どの山にいるかによって違う。',
    'アレパを特別にしているのは珍しい材料ではなく、手の動きだ。生地は手でこね、手のひらで平たくし、指で鉄板の上で裏返す。触れながら作る食べ物である。だからこそ、片手で持てる携帯食でもある。仕事へ、畑へ、学校へ持って行き、立ったまま、あるいは歩きながら食べる。あればとろけるチーズを中に入れ、なければそのまま。',
    '日本にも、同じ手の動きから生まれた食べ物がある。おにぎりだ。炊きたてで温かいご飯を、手のひらに少し塩をつけて、三角や丸に握る。中央に具を入れ、周りに海苔を巻くことも多い。アレパと同じく、旅や長い一日、お弁当のための食べ物であり、アレパと同じく、あまりに日常的で「レシピ」と考える人はほとんどいないのに、家ごとに握り方がある。',
    '異なる二つの穀物が、地球の反対側どうしで、似た考えにたどり着いた。いちばん心を温めてくれる食べ物は、片手で持てるもの、カトラリーも儀式もいらず、そこにあるものと、作る人の手だけで作れるものだ、という考えである。どちらも主役は素朴な食材で、それを忘れがたいものにするのは、誰が、どれだけ丁寧に作るかだ。',
    'Boogalooのアレパも、まさにそうして作られる。手で成形し、鉄板で焼き、とろけるチーズ、牛肉、ほぐした鶏肉を詰めている。近所のお店のおにぎりが恋しくなったら、コロンビアのアレパを食べに来てほしい。同じ料理ではないけれど、同じ発想から生まれた食べ物だ。Boogalooでお待ちしています。',
  ],
  pt: [
    'Na sua forma mais simples, a arepa é milho moído, água e sal, cozido numa chapa quente. Nada mais. Essa simplicidade tem séculos: os povos indígenas do que hoje é a Colômbia já moíam o milho e o cozinhavam em bolos achatados muito antes da chegada dos espanhóis, e desde então a arepa não deixou de estar na mesa de quase todas as regiões do país -- grossa ou fina, assada ou frita, simples ou recheada, dependendo do vale ou da montanha.',
    'O que a torna especial não é um ingrediente raro, e sim o gesto: a massa é sovada com as mãos, achatada com as palmas, virada na chapa com os dedos. É comida que se faz tocando. E por isso mesmo é comida portátil, das que cabem numa mão: leva-se ao trabalho, ao campo, à escola, come-se em pé ou andando, com queijo derretido dentro se houver, e sem nada se não houver.',
    'O Japão tem uma comida que nasce do mesmo gesto: o onigiri. Arroz cozido, ainda morno, modelado à mão -- com um pouco de sal nas palmas -- em forma de triângulo ou de bola, muitas vezes com um recheio no centro e uma tira de alga nori em volta. Assim como a arepa, é alimento de viagem, de jornada longa, de lancheira; assim como a arepa, é tão cotidiano que quase ninguém pensa nele como "receita", e mesmo assim cada casa tem seu jeito de fazer.',
    'São dois cereais diferentes, em extremos opostos do planeta, que chegaram a uma ideia parecida: que a comida mais reconfortante é a que se segura com uma mão, feita sem talheres e sem cerimônia, com o que se tem à mão e com as mãos de quem cozinha. Nos dois casos o ingrediente principal é humilde; o que o torna memorável é quem o prepara e com quanto cuidado.',
    'No Boogaloo as arepas são feitas assim, à mão e na chapa, recheadas com queijo derretido, carne ou frango desfiado. Se um dia sentir falta do onigiri da lojinha da esquina, venha experimentar a arepa colombiana: não é o mesmo prato, mas vem da mesma ideia. Esperamos você no Boogaloo.',
  ],
};

const STORIES = [
  {
    key: 'story1',
    date: '2026-09-08',
    parrafos: STORY1_PARRAFOS,
    titleKey: 'blogStory1Title',
    color: 'red',
    image: 'img/blog/tolima-valle.jpg',
    imageAlt: 'Valle visto desde una montaña del Tolima, Colombia',
    credit: null,
  },
  {
    key: 'story2',
    date: '2026-09-08',
    parrafos: STORY2_PARRAFOS,
    titleKey: 'blogStory2Title',
    color: 'blue',
    image: 'img/blog/tolima-mirador.jpg',
    imageAlt: 'Mirador con mesa y sillas en las montañas del Tolima, Colombia',
    credit: null,
  },
  {
    key: 'story3',
    date: '2026-09-09',
    parrafos: STORY3_PARRAFOS,
    titleKey: 'blogStory3Title',
    color: 'gold',
    image: 'img/blog/tolima-arcoiris.jpg',
    imageAlt: 'Arcoíris sobre las montañas verdes del Tolima, Colombia',
    credit: null,
  },
  {
    key: 'story4',
    date: '2026-09-11',
    parrafos: STORY4_PARRAFOS,
    titleKey: 'blogStory4Title',
    color: 'red',
    image: 'img/blog/tolima-aguacates.jpg',
    imageAlt: 'Cosecha de aguacates apilados en un almacén, Tolima, Colombia',
    credit: null,
  },
  {
    key: 'story5',
    date: '2026-09-14',
    parrafos: STORY5_PARRAFOS,
    titleKey: 'blogStory5Title',
    color: 'blue',
    image: 'img/blog/tolima-reserva-falan.jpg',
    imageAlt: 'Letrero de entrada de la Reserva Natural Ciudad Perdida de Falan, Tolima, Colombia',
    credit: null,
  },
  {
    key: 'story6',
    date: '2026-09-16',
    parrafos: STORY6_PARRAFOS,
    titleKey: 'blogStory6Title',
    color: 'gold',
    image: 'img/blog/catedral-plaza.jpg',
    imageAlt: 'Catedral con dos torres en una plaza principal de Colombia',
    credit: null,
  },
  {
    key: 'story7',
    date: '2026-09-19',
    parrafos: STORY7_PARRAFOS,
    titleKey: 'blogStory7Title',
    color: 'red',
    image: 'img/blog/tolima-ladera.jpg',
    imageAlt: 'Ladera verde con plantas de hojas rojizas al atardecer, Tolima, Colombia',
    credit: null,
  },
];

function ctaRowHtml(idPrefix) {
  return `
    <div class="blog-cta-row">
      <a class="primary-btn" href="reserva.html" id="${idPrefix}-cta-reserve"></a>
      <a class="ghost-btn" href="index.html" id="${idPrefix}-cta-menu"></a>
    </div>
  `;
}

function creditHtml(credit) {
  if (!credit) return '';
  return `<figcaption>Foto: <a href="${credit.url}" target="_blank" rel="noopener">${credit.name}</a> / ${credit.source}</figcaption>`;
}

// ---------------- Render con URL por post + carga perezosa ----------------
// El blog completo se sigue viendo en blog.html, pero cada post tiene su
// propia URL para compartir (blog.html#storyN): al abrirla se garantiza que
// ese post esté renderizado (aunque sea viejo y aún no le tocara cargar) y la
// página baja directo a él. Sin ancla, solo se renderiza un primer lote y el
// resto entra solo, en lotes, a medida que se hace scroll.
const PAGE_SIZE = 3;
const ORDERED_STORIES = STORIES.slice().reverse(); // más nueva primero, orden fijo
let renderedCount = 0;
let loadMoreObserver = null;

function hashStoryKey() {
  const raw = (location.hash || '').replace('#', '');
  return ORDERED_STORIES.some((s) => s.key === raw) ? raw : null;
}

function postHtml(story) {
  const idPrefix = `blog-${story.key}`;
  return `
    <article class="ab-section blog-post blog-post-${story.color}" data-reveal id="${idPrefix}">
      <h2 id="${idPrefix}-title" class="blog-post-title"></h2>
      <p class="blog-byline" id="${idPrefix}-byline"></p>
      <button type="button" class="blog-share-btn" id="${idPrefix}-share" data-key="${story.key}"></button>
      <figure class="blog-post-figure">
        <img src="${story.image}" alt="${story.imageAlt}" loading="lazy" />
        ${creditHtml(story.credit)}
      </figure>
      <div class="blog-post-body" id="${idPrefix}-body"></div>
    </article>
  `;
}

function formatStoryDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  const locale = { es: 'es', en: 'en-US', ja: 'ja-JP', pt: 'pt-BR' }[lang] || 'es';
  return new Date(y, m - 1, d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

function applyStaticI18nToStory({ key, parrafos, titleKey, date }) {
  const lang = STORY1_PARRAFOS[I18n.lang] ? I18n.lang : 'es';
  const idPrefix = `blog-${key}`;
  const titleEl = document.getElementById(`${idPrefix}-title`);
  if (titleEl) titleEl.textContent = I18n.t(titleKey);
  const bylineEl = document.getElementById(`${idPrefix}-byline`);
  if (bylineEl) bylineEl.textContent = '— Joseph de Boogaloo' + (date ? ' · ' + formatStoryDate(date, lang) : '');
  const shareBtn = document.getElementById(`${idPrefix}-share`);
  if (shareBtn) shareBtn.textContent = I18n.t('blogShareLabel');
  const body = document.getElementById(`${idPrefix}-body`);
  if (!body) return;
  body.innerHTML = parrafos[lang].map((p) => `<p>${p}</p>`).join('') + ctaRowHtml(idPrefix);
  document.getElementById(`${idPrefix}-cta-reserve`).textContent = I18n.t('gateReserveBtn');
  document.getElementById(`${idPrefix}-cta-menu`).textContent = I18n.t('abVerMenuBtn');
}

// ---------------- Compartir (enlace, Facebook, Instagram) ----------------
// Instagram no tiene URL de "compartir" para la web: el estándar es subir una
// imagen. Se genera en un canvas con el formato oficial (post 4:5 = 1080x1350,
// historia 9:16 = 1080x1920), se descarga y se copia el texto de la publicación.
// Facebook sí acepta un enlace (sharer.php).

const STORY_COLORS = { red: '#ce1126', blue: '#003893', gold: '#a8701c' };

function storyUrl(key) {
  return `${location.origin}${location.pathname}#${key}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth) {
  // Parte por palabras; si no hay espacios (japonés) parte por caracteres.
  const tokens = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
  const lines = [];
  let line = '';
  tokens.forEach((t) => {
    if (ctx.measureText(line + t).width > maxWidth && line.trim()) {
      lines.push(line.trim());
      line = t.trim() ? t : '';
    } else {
      line += t;
    }
  });
  if (line.trim()) lines.push(line.trim());
  return lines;
}

async function makeShareImage(story, W, H) {
  const lang = STORY1_PARRAFOS[I18n.lang] ? I18n.lang : 'es';
  const color = STORY_COLORS[story.color] || '#003893';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const font = '"Helvetica Neue", Arial, "Hiragino Sans", "Noto Sans JP", sans-serif';

  ctx.fillStyle = '#fbf7ef';
  ctx.fillRect(0, 0, W, H);

  // Franja de bandera colombiana arriba
  const bandH = 16;
  ctx.fillStyle = '#ffcd00'; ctx.fillRect(0, 0, W / 2, bandH);
  ctx.fillStyle = '#003893'; ctx.fillRect(W / 2, 0, W / 4, bandH);
  ctx.fillStyle = '#ce1126'; ctx.fillRect(W * 0.75, 0, W / 4, bandH);

  // Foto (cover) en la parte superior
  const photoTop = bandH;
  const photoH = Math.round(H * (H > 1500 ? 0.5 : 0.56));
  const photo = await loadImage(story.image);
  const scale = Math.max(W / photo.width, photoH / photo.height);
  const dw = photo.width * scale, dh = photo.height * scale;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, photoTop, W, photoH); ctx.clip();
  ctx.drawImage(photo, (W - dw) / 2, photoTop + (photoH - dh) / 2, dw, dh);
  ctx.restore();

  // Título
  const pad = 72;
  let y = photoTop + photoH + 40;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  let size = 76;
  let lines;
  do {
    ctx.font = `800 ${size}px ${font}`;
    lines = wrapLines(ctx, I18n.t(story.titleKey), W - pad * 2);
    size -= 4;
  } while (lines.length > 3 && size > 44);
  const lh = (size + 4) * 1.18;
  lines.forEach((l) => { ctx.fillText(l, pad, y); y += lh; });

  // Firma + fecha
  y += 10;
  ctx.fillStyle = '#6b5f57';
  ctx.font = `italic 34px ${font}`;
  ctx.fillText('— Joseph de Boogaloo' + (story.date ? ' · ' + formatStoryDate(story.date, lang) : ''), pad, y);

  // Pie: logo + dominio
  const logo = await loadImage('img/logo/logo-web.png').catch(() => null);
  const footY = H - 130;
  if (logo) {
    const lh2 = 90, lw2 = logo.width * (lh2 / logo.height);
    ctx.drawImage(logo, pad, footY, lw2, lh2);
  }
  ctx.fillStyle = color;
  ctx.font = `700 40px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText('boogaloo.cafe', W - pad, footY + 24);
  ctx.textAlign = 'left';

  return new Promise((res) => canvas.toBlob(res, 'image/png'));
}

function buildCaption(story) {
  const lang = STORY1_PARRAFOS[I18n.lang] ? I18n.lang : 'es';
  const first = story.parrafos[lang][0];
  const excerpt = first.length > 220 ? first.slice(0, 220).replace(/\s+\S*$/, '') + '…' : first;
  return `${I18n.t(story.titleKey)}\n\n${excerpt}\n\n${I18n.t('blogShareCaptionRead')}\n\n#Boogaloo #Nagoya #Colombia #ComidaColombiana #カフェ #名古屋`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const shareModal = document.getElementById('share-modal');
const shareModalBody = document.getElementById('share-modal-body');
shareModal.addEventListener('click', (e) => {
  if (e.target === shareModal) shareModal.classList.remove('open');
});

let lastSelection = '';

function storySentences(story) {
  const lang = STORY1_PARRAFOS[I18n.lang] ? I18n.lang : 'es';
  return story.parrafos[lang]
    .join(' ')
    .split(/(?<=[.!?。])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 200);
}

// X cuenta cada enlace como 23 caracteres, sin importar su largo real.
const X_LIMIT = 280;
const X_URL_LEN = 23;

function openShareModal(key) {
  const story = STORIES.find((s) => s.key === key);
  if (!story) return;
  shareModalBody.innerHTML = `
    <h2>${I18n.t('blogShareModalTitle')}</h2>
    <p class="subt">${I18n.t(story.titleKey)}</p>
    <div class="share-options">
      <button class="ghost-btn" data-share="link" type="button">${I18n.t('blogShareCopyLink')}</button>
      <button class="ghost-btn" data-share="facebook" type="button">${I18n.t('blogShareFacebook')}</button>
      <button class="ghost-btn" data-share="ig-post" type="button">${I18n.t('blogShareInstagramPost')}</button>
      <button class="ghost-btn" data-share="ig-story" type="button">${I18n.t('blogShareInstagramStory')}</button>
    </div>
    <p class="subt" style="margin-top:12px;">${I18n.t('blogShareInstagramNote')}</p>
    <h3 style="margin:14px 0 6px; font-size:0.95rem;">${I18n.t('blogShareXTitle')}</h3>
    <textarea id="share-x-text" rows="4" style="width:100%; padding:10px; border-radius:10px; border:1px solid var(--border); font:inherit;"></textarea>
    <div class="subt" id="share-x-count" style="margin:4px 0 8px;"></div>
    <div class="share-options">
      <button class="ghost-btn" data-share="x-next" type="button">${I18n.t('blogShareXNext')}</button>
      <button class="primary-btn" data-share="x-post" type="button">${I18n.t('blogShareXPost')}</button>
    </div>
    <p class="subt" style="margin-top:8px;">${I18n.t('blogShareXHint')}</p>
    <button class="link-btn" data-share="close" type="button" style="width:100%;">${I18n.t('blogShareClose')}</button>
  `;
  shareModal.classList.add('open');

  const sentences = storySentences(story);
  let sIdx = 0;
  const xText = document.getElementById('share-x-text');
  const xCount = document.getElementById('share-x-count');
  const updateXCount = () => {
    const left = X_LIMIT - X_URL_LEN - 1 - xText.value.length;
    xCount.textContent = left + ' / ' + (X_LIMIT - X_URL_LEN - 1);
    xCount.style.color = left < 0 ? 'var(--co-red)' : '';
  };
  xText.value = lastSelection ? '\u201c' + lastSelection.slice(0, 230) + '\u201d' : sentences.length ? '\u201c' + sentences[0] + '\u201d' : I18n.t(story.titleKey);
  xText.addEventListener('input', updateXCount);
  updateXCount();

  shareModalBody.onclick = async (e) => {
    const btn = e.target.closest('[data-share]');
    if (!btn) return;
    const kind = btn.dataset.share;
    const original = btn.textContent;
    if (kind === 'close') return shareModal.classList.remove('open');
    if (kind === 'x-next') {
      if (sentences.length) {
        sIdx = (sIdx + 1) % sentences.length;
        xText.value = '\u201c' + sentences[sIdx] + '\u201d';
        updateXCount();
      }
      return;
    }
    if (kind === 'x-post') {
      window.open(
        'https://twitter.com/intent/tweet?text=' + encodeURIComponent(xText.value.trim()) + '&url=' + encodeURIComponent(storyUrl(key)),
        '_blank',
        'noopener,width=600,height=500'
      );
      return;
    }
    if (kind === 'link') {
      const ok = await copyText(storyUrl(key));
      if (!ok) window.prompt(I18n.t('blogShareLabel'), storyUrl(key));
      btn.textContent = I18n.t('blogShareCopied');
    } else if (kind === 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(storyUrl(key)), '_blank', 'noopener,width=640,height=560');
    } else {
      const [w, h] = kind === 'ig-story' ? [1080, 1920] : [1080, 1350];
      btn.disabled = true;
      try {
        const blob = await makeShareImage(story, w, h);
        const caption = buildCaption(story);
        const file = new File([blob], `boogaloo-${key}-${w}x${h}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: caption }).catch(() => {});
        } else {
          downloadBlob(blob, file.name);
          await copyText(caption);
        }
        btn.textContent = I18n.t('blogShareCopied');
      } catch (err) {
        alert(err.message);
      }
      btn.disabled = false;
    }
    setTimeout(() => { btn.textContent = original; }, 1800);
  };
}

function setupShareButtons(stories) {
  stories.forEach(({ key }) => {
    const btn = document.getElementById(`blog-${key}-share`);
    if (!btn) return;
    // La selección se toma antes del clic: así se conserva la frase elegida.
    btn.addEventListener('mousedown', () => {
      lastSelection = (window.getSelection().toString() || '').trim();
    });
    btn.addEventListener('click', () => {
      openShareModal(key);
      lastSelection = '';
    });
  });
}

function updateSentinel() {
  const sentinel = document.getElementById('blog-load-sentinel');
  if (!sentinel) return;
  if (renderedCount >= ORDERED_STORIES.length) {
    if (loadMoreObserver) loadMoreObserver.disconnect();
    sentinel.style.display = 'none';
  }
}

function renderMore(count) {
  const mount = document.getElementById('blog-posts-mount');
  if (!mount) return;
  const next = ORDERED_STORIES.slice(renderedCount, renderedCount + count);
  if (!next.length) return;
  mount.insertAdjacentHTML('beforeend', next.map(postHtml).join(''));
  renderedCount += next.length;
  next.forEach(applyStaticI18nToStory);
  setupReveal();
  setupShareButtons(next);
  updateSentinel();
}

function setupLazyLoad() {
  const sentinel = document.getElementById('blog-load-sentinel');
  if (!sentinel || !('IntersectionObserver' in window)) {
    // Sin soporte: no tiene sentido paginar, se muestra todo de una vez.
    renderMore(ORDERED_STORIES.length);
    return;
  }
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) renderMore(PAGE_SIZE);
      });
    },
    { rootMargin: '400px' }
  );
  loadMoreObserver.observe(sentinel);
}

// ---------------- Idioma ----------------

function renderHistorias() {
  // Solo actualiza los posts ya renderizados -- no vuelve a crear el DOM,
  // para no perder el estado ab-visible de los que ya se revelaron.
  ORDERED_STORIES.slice(0, renderedCount).forEach(applyStaticI18nToStory);
}

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('blogPageLabel');
  document.getElementById('blog-hero-title').textContent = I18n.t('blogHeroTitle');
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

// Si la URL trae #storyN, ese post entra sí o sí en el primer lote (aunque
// sea viejo), y la página baja directo a él.
const targetKey = hashStoryKey();
const targetIndex = targetKey ? ORDERED_STORIES.findIndex((s) => s.key === targetKey) : -1;
const firstBatch = targetIndex === -1 ? PAGE_SIZE : Math.max(PAGE_SIZE, targetIndex + 1);
renderMore(firstBatch);
applyStaticI18n();
setupLazyLoad();
setupReveal();
if (targetKey) {
  const el = document.getElementById(`blog-${targetKey}`);
  if (el) el.scrollIntoView({ block: 'start' });
}
