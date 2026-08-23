export type ArchiveSource = {
  label: string
  url: string
}

export type UnsolvedSerialCase = {
  slug: string
  title: string
  subtitle: string
  location: string
  activeYears: string
  victims: string
  status: string
  dossierCode: string
  hasEvidenceArchive?: boolean
  summary: string
  article: {
    heading: string
    paragraphs: string[]
  }[]
  archiveNotes: string[]
  sources: ArchiveSource[]
}

export const unsolvedSerialCases: UnsolvedSerialCase[] = [
  {
    slug: 'zodiac',
    title: 'El Asesino del Zodiaco',
    subtitle: 'El caso que convirtió cartas, cifrados y titulares en una escena del crimen paralela.',
    location: 'Bahía de San Francisco, California',
    activeYears: '1968-1969',
    victims: '5 confirmadas; el autor afirmó muchas más',
    status: 'Identidad desconocida',
    dossierCode: 'WML-CASE-ZODIAC-1968',
    summary:
      'El Zodiaco fue un asesino no identificado que atacó a parejas y conductores en el norte de California y sostuvo su notoriedad enviando cartas y criptogramas a periódicos.',
    article: [
      {
        heading: 'Lo que se sabe',
        paragraphs: [
          'La serie confirmada se concentra entre diciembre de 1968 y octubre de 1969, con escenas en Lake Herman Road, Blue Rock Springs, Lake Berryessa y San Francisco. El patrón no fue puramente mecánico: unas veces disparó desde cerca, otra vez atacó con arma blanca en un espacio abierto y en el caso de Paul Stine rompió el patrón atacando a un taxista en la ciudad.',
          'El asesino se autodenominó Zodiac en cartas a la prensa. Esas cartas no solo reclamaban autoría: incluían detalles que apuntaban a conocimiento directo de los crímenes, amenazas públicas y criptogramas diseñados para ocupar a la policía, los periódicos y la ciudadanía. Parte de la fuerza cultural del caso viene de esa doble escena: la violencia física y la manipulación mediática.',
        ],
      },
      {
        heading: 'Investigación y límites',
        paragraphs: [
          'El FBI conserva expedientes por apoyo técnico y documental, aunque los asesinatos no fueron una investigación federal principal. La identidad sigue sin confirmarse. Arthur Leigh Allen fue el sospechoso más famoso, pero las pruebas disponibles nunca bastaron para acusarlo. Otros nombres han aparecido durante décadas, casi siempre con más narrativa que evidencia.',
          'El caso muestra una tensión clásica de los expedientes antiguos: hay huellas, documentos, cartas y muestras, pero no siempre una cadena perfecta para la genética moderna. Algunos cifrados se han resuelto; otros alimentaron el mito durante años. Ningún descifrado ha identificado de forma judicial al asesino.',
        ],
      },
      {
        heading: 'Por qué sigue importando',
        paragraphs: [
          'Zodiac transformó la relación entre asesino, prensa e investigadores. Su explotación de los medios anticipó una forma de criminalidad espectacularizada: no bastaba con matar, había que controlar el relato. Esa es también la razón por la que el expediente exige prudencia. Cada teoría nueva debe separarse de la fascinación estética por sus símbolos.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología de ataques confirmados.',
      'Mapa de cartas y cifrados documentados.',
      'Listado de fuentes públicas y expedientes FBI disponibles.',
      'Resumen de sospechosos recurrentes sin atribuciones no probadas.',
    ],
    sources: [
      { label: 'FBI: The Zodiac Killer', url: 'https://archives.fbi.gov/archives/news/stories/2007/march/zodiac_030207' },
      { label: 'FBI Vault: Zodiac Killer files', url: 'https://vault.fbi.gov/The%20Zodiac%20Killer/' },
      { label: 'FBI Forensic Science Communications', url: 'https://archives.fbi.gov/archives/about-us/lab/forensic-science-communications/fsc/april2006/research/2006_04_research01.htm' },
    ],
  },
  {
    slug: 'jack-the-ripper',
    title: 'Jack el Destripador',
    subtitle: 'Cinco asesinatos canónicos, miles de sospechas y una identidad que nunca entró en un tribunal.',
    location: 'Whitechapel, Londres',
    activeYears: '1888',
    victims: '5 canónicas; otras posibles',
    status: 'Nunca capturado',
    dossierCode: 'WML-CASE-RIPPER-1888',
    summary:
      'El asesino de Whitechapel mató a mujeres pobres en el East End victoriano y quedó envuelto en una tormenta de prensa, cartas falsas y prejuicios sociales.',
    article: [
      {
        heading: 'El contexto',
        paragraphs: [
          'Whitechapel era una zona marcada por pobreza extrema, alojamientos inestables y violencia cotidiana contra mujeres vulnerables. Mary Ann Nichols, Annie Chapman, Elizabeth Stride, Catherine Eddowes y Mary Jane Kelly suelen considerarse las cinco víctimas canónicas. Sus muertes ocurrieron en pocos meses y bajo una presión pública inédita para la policía metropolitana.',
          'El nombre Jack the Ripper se consolidó por cartas enviadas a autoridades y periódicos. Muchas fueron bromas crueles o fraudes. Esa confusión documental importa: el personaje público de Jack fue construido tanto por el asesino, si escribió alguna carta, como por quienes explotaron el pánico.',
        ],
      },
      {
        heading: 'La investigación',
        paragraphs: [
          'La policía victoriana trabajaba antes de la huella dactilar moderna en Reino Unido y antes de perfiles criminales sistemáticos. Hubo vigilancia, interrogatorios, recompensas discutidas y memorandos internos. El informe Macnaghten de 1894 citó sospechosos, pero no resolvió el caso.',
          'La investigación posterior ha generado cientos de teorías: médicos, carniceros, miembros de la realeza, inmigrantes, artistas y policías. La mayoría se derrumba por falta de prueba directa. La distancia temporal ha convertido indicios débiles en mitología, y eso hace que el caso sea más famoso que concluyente.',
        ],
      },
      {
        heading: 'Lectura crítica',
        paragraphs: [
          'Hoy el enfoque más responsable devuelve el centro a las víctimas y al entorno que permitió su vulnerabilidad. El misterio sigue abierto, pero la obsesión con el nombre del asesino no debería borrar la estructura social que dejó a esas mujeres expuestas y luego reducidas a estereotipos.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología de los asesinatos canónicos.',
      'Guía de documentos de The National Archives.',
      'Resumen de cartas y advertencia sobre hoaxes.',
      'Ficha de sospechosos históricos citados por documentos policiales.',
    ],
    sources: [
      { label: 'The National Archives: Jack the Ripper letter', url: 'https://www.nationalarchives.gov.uk/explore-the-collection/stories/hoax-letter-signed-by-jack-the-ripper/' },
      { label: 'The National Archives image record HO 144/221', url: 'https://images.nationalarchives.gov.uk/asset/41074/' },
      { label: 'Metropolitan Police timeline', url: 'https://www.met.police.uk/police-forces/metropolitan-police/areas/about-us/about-the-met/met-museums-archives/timeline/' },
    ],
  },
  {
    slug: 'cleveland-torso',
    title: 'El Carnicero de Kingsbury Run',
    subtitle: 'La gran sombra de Cleveland: cuerpos sin nombre, una ciudad en depresión y Eliot Ness sin caso cerrado.',
    location: 'Cleveland, Ohio',
    activeYears: '1934-1938',
    victims: 'Al menos 12-13',
    status: 'Sin identificación oficial',
    dossierCode: 'WML-CASE-KINGSBURY-1935',
    summary:
      'El asesino de los torso murders dejó víctimas desmembradas en la zona de Kingsbury Run. La mayoría nunca fue identificada y nadie fue condenado.',
    article: [
      {
        heading: 'La serie',
        paragraphs: [
          'Entre mediados de los años treinta y 1938 aparecieron restos humanos en Kingsbury Run y áreas cercanas de Cleveland. El patrón de decapitación y desmembramiento llevó a pensar en un único agresor con conocimiento anatómico o, al menos, con una frialdad técnica inusual. Muchas víctimas eran personas pobres, trabajadores itinerantes o habitantes de asentamientos precarios.',
          'Solo algunas víctimas fueron identificadas, como Edward Andrassy y Florence Polillo. La despersonalización del caso es una de sus heridas centrales: durante décadas, parte de la investigación ha sido averiguar quiénes eran los muertos antes incluso de poder saber quién los mató.',
        ],
      },
      {
        heading: 'Eliot Ness y las hipótesis',
        paragraphs: [
          'Eliot Ness, entonces director de seguridad pública, quedó ligado al caso por su autoridad y por una medida polémica: la quema de campamentos en Kingsbury Run. Frank Dolezal confesó un asesinato, pero su confesión fue muy cuestionada y murió bajo custodia antes del juicio. La sospecha histórica se desplazó hacia Francis E. Sweeney, médico y veterano, pero nunca hubo prueba judicial suficiente.',
          'La historia oficial conserva una paradoja: muchos investigadores posteriores creen que Ness tenía un sospechoso fuerte, pero el expediente legal nunca se cerró. La pérdida o desaparición de registros policiales ha agravado esa niebla.',
        ],
      },
      {
        heading: 'Estado actual',
        paragraphs: [
          'El interés moderno se ha movido hacia la identificación de víctimas mediante genealogía genética. Resolver nombres no equivale automáticamente a resolver al asesino, pero repara una parte esencial del daño: devuelve historia y familia a personas reducidas durante décadas a números de expediente.',
        ],
      },
    ],
    archiveNotes: [
      'Lista de víctimas conocidas e identificaciones.',
      'Resumen de la investigación de Cleveland.',
      'Notas sobre Frank Dolezal, Eliot Ness y Francis E. Sweeney.',
      'Fuentes de museo y enciclopedia local.',
    ],
    sources: [
      { label: 'Encyclopedia of Cleveland History: Torso Murders', url: 'https://case.edu/ech/articles/t/torso-murders' },
      { label: 'Cleveland Police Museum: Torso Murders', url: 'https://www.clevelandpolicemuseum.org/collections/torso-murders/' },
      { label: 'Cleveland Police Museum: Identifying the Victims', url: 'https://www.clevelandpolicemuseum.org/torso-murders/torso-murders-identifying-the-victims/' },
      { label: 'Cleveland Police Museum: Plaster Masks', url: 'https://www.clevelandpolicemuseum.org/torso-murders/criminal-identification-plaster-masks/' },
    ],
  },
  {
    slug: 'servant-girl-annihilator',
    title: 'El Servant Girl Annihilator',
    subtitle: 'Austin antes de la criminologia moderna: hachas, miedo urbano y una serie que se detuvo sin explicación.',
    location: 'Austin, Texas',
    activeYears: '1884-1885',
    victims: '8 asesinadas; varias supervivientes',
    status: 'No resuelto',
    dossierCode: 'WML-CASE-AUSTIN-1885',
    summary:
      'Antes de Jack el Destripador, Austin vivió una serie de ataques nocturnos contra mujeres, niñas y parejas. El responsable nunca fue probado.',
    article: [
      {
        heading: 'Una ciudad en pánico',
        paragraphs: [
          'La serie comenzó a finales de 1884 y alcanzó su punto de terror en 1885. Las primeras víctimas eran mayoritariamente mujeres negras empleadas como trabajadoras domésticas. Después el agresor atacó también a una niña, a un hombre y, en Nochebuena, a dos mujeres blancas en puntos distintos de la ciudad. Ese cambio amplificó una reacción pública ya atravesada por racismo, clase social y miedo.',
          'La etiqueta Servant Girl Annihilator procede del imaginario periodístico y literario de la época. No describe con precisión a todas las víctimas, pero sí revela cómo Austin procesó el crimen: como una amenaza nocturna contra hogares que se suponían privados y seguros.',
        ],
      },
      {
        heading: 'Pistas y sospechosos',
        paragraphs: [
          'Las escenas incluían armas abandonadas, huellas y perros rastreadores, pero no existían técnicas modernas de huellas dactilares o sangre. La policía detuvo sospechosos y contrató investigadores privados. Nada cerró el caso. Nathan Elgin ha sido propuesto por análisis modernos, pero murió en 1886 y la atribución no puede probarse judicialmente.',
          'También se ha discutido si hubo un único asesino. Algunos ataques tienen firmas parecidas; otros presentan diferencias. En una ciudad con prensa ansiosa y herramientas limitadas, separar patrón real de pánico colectivo es parte del problema.',
        ],
      },
      {
        heading: 'Memoria',
        paragraphs: [
          'El caso permaneció relativamente hundido en archivos locales durante casi un siglo. Recuperarlo exige nombrar a las víctimas, especialmente a mujeres negras que la prensa de la época describió con sesgos brutales. La pregunta no es solo quién mató, sino por qué unas muertes tardaron tanto en ser consideradas historia central de la ciudad.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología de ataques de Austin.',
      'Notas de contexto social y racial.',
      'Enlaces a archivos de Travis County y Austin History Center.',
      'Resumen de hipótesis modernas sin cierre judicial.',
    ],
    sources: [
      { label: 'Travis County Archives: Mysteries of Travis County', url: 'https://traviscountyhistory.org/online-exhibits/mysteries-of-travis-county/' },
      { label: 'Servant Girl Murders: About the crimes', url: 'https://www.servantgirlmurders.com/' },
      { label: 'PBS History Detectives: Texas Servant Girl Murders', url: 'https://www.pbs.org/opb/historydetectives/investigation/texas-servant-girl-murders/index.html' },
    ],
  },
  {
    slug: 'freeway-phantom',
    title: 'El Freeway Phantom',
    subtitle: 'Seis niñas negras asesinadas alrededor de Washington D.C. y una ciudad que tardó demasiado en mirar.',
    location: 'Washington D.C. y Maryland',
    activeYears: '1971-1972',
    victims: '6 reconocidas',
    status: 'Caso abierto',
    dossierCode: 'WML-CASE-FREEWAY-1971',
    summary:
      'El Freeway Phantom secuestró y asesinó a seis niñas y adolescentes negras. Sus cuerpos aparecieron cerca de carreteras y nadie fue condenado.',
    article: [
      {
        heading: 'Las víctimas',
        paragraphs: [
          'Carol Spinks, Darlenia Johnson, Brenda Crockett, Nenomoshia Yates, Brenda Woodard y Diane Williams desaparecieron entre abril de 1971 y septiembre de 1972. Tenían entre 10 y 18 años. Sus cuerpos fueron hallados en zonas del Distrito de Columbia y Prince George’s County, lo que dio origen al nombre mediático Freeway Phantom.',
          'El caso contiene una dimensión institucional dolorosa: eran niñas negras en una época en la que la cobertura mediática y la presión policial no se distribuían de forma equitativa. Sus familias denunciaron durante décadas la falta de atención proporcional.',
        ],
      },
      {
        heading: 'La carta y la investigación',
        paragraphs: [
          'Una nota encontrada con Brenda Woodard decía, en esencia, que era insensible a que la gente creyera que había matado a las otras, e incluía la firma Free-way Phantom. La carta se volvió pieza central del mito, pero no resolvió la autoría.',
          'Hubo sospechosos, líneas sobre conocidos violentos y revisiones posteriores. La investigación cruzó jurisdicciones, un factor que suele complicar series de este tipo. La policía metropolitana mantiene la petición pública de información.',
        ],
      },
      {
        heading: 'Lo que revela',
        paragraphs: [
          'El Freeway Phantom es un expediente sobre homicidio serial y también sobre desigualdad de atención. La pregunta por el asesino convive con otra: qué habría pasado si el mismo patrón hubiera afectado a niñas de otro barrio, otra clase o otro color.',
        ],
      },
    ],
    archiveNotes: [
      'Fichas de las seis víctimas reconocidas.',
      'Resumen de lugares y fechas de hallazgo.',
      'Nota sobre la carta atribuida al asesino.',
      'Fuentes oficiales de MPDC y material de investigación pública.',
    ],
    sources: [
      { label: 'MPDC: Freeway Phantom Homicide Victims', url: 'https://mpdc.dc.gov/publication/%E2%80%9Cfreeway-phantom%E2%80%9D-homicide-victims' },
      { label: 'MPDC: Freeway Phantom FOIA Records', url: 'https://mpdc.dc.gov/publication/freeway-phantom-foia-records' },
      { label: 'MPDC: Major Case/Unsolved Homicides 1971-1990', url: 'https://mpdc.dc.gov/page/major-caseunsolved-homicides-1971-1990' },
      { label: 'Maryland State Police: Diane Williams cold case', url: 'https://mdsp.maryland.gov/community-services/cold-cases/williams-diane?CCID=55' },
      { label: 'Freeway Phantom investigative series', url: 'https://freeway-phantom.com/' },
      { label: 'Freeway Phantom victim map', url: 'https://freeway-phantom.com/victim-map/' },
    ],
  },
  {
    slug: 'the-doodler',
    title: 'The Doodler',
    subtitle: 'El asesino que usaba dibujos para acercarse a hombres gays en San Francisco.',
    location: 'San Francisco, California',
    activeYears: '1974-1975',
    victims: '5-6 vinculadas',
    status: 'Investigación activa',
    dossierCode: 'WML-CASE-DOODLER-1974',
    summary:
      'The Doodler atacó a hombres gays tras conocerlos en bares o restaurantes. Supervivientes ayudaron a crear retratos, pero el caso nunca llegó a juicio.',
    article: [
      {
        heading: 'Modo de acercamiento',
        paragraphs: [
          'El agresor decía ser dibujante o caricaturista. Conversaba con hombres en espacios de vida nocturna gay, hacía bocetos y los convencía para ir a zonas aisladas como Ocean Beach, Golden Gate Park o Land’s End. Allí los atacaba con violencia.',
          'Las víctimas confirmadas o vinculadas incluyen a Gerald Cavanagh, Joseph Stevens, Klaus Christmann, Frederick Capin, Harald Gullberg y Warren Andrews, este último añadido como posible sexta víctima por la revisión moderna de la policía de San Francisco.',
        ],
      },
      {
        heading: 'Por qué no prosperó',
        paragraphs: [
          'El caso está atravesado por la homofobia de la época. Se ha informado que supervivientes pudieron identificar a un sospechoso, pero testificar habría significado exponerse públicamente como hombres gays en un contexto de riesgo personal, laboral y social. Sin esos testimonios, el caso no avanzó.',
          'La SFPD reactivó públicamente la investigación, publicó bocetos y elevó recompensas por información. Aun así, no hay identificación judicial. La posibilidad de ADN y de nuevos testigos mantiene viva la investigación.',
        ],
      },
      {
        heading: 'Lectura actual',
        paragraphs: [
          'The Doodler recuerda que un asesino puede aprovechar no solo un lugar físico, sino un sistema de silencios. Su impunidad dependió en parte de que las víctimas sobrevivientes tenían demasiado que perder si hablaban. Ese contexto es parte del expediente.',
        ],
      },
    ],
    archiveNotes: [
      'Victimología y lugares de hallazgo.',
      'Bocetos policiales publicados por SFPD enlazados como fuente.',
      'Resumen del impacto de la homofobia en el caso.',
      'Notas de recompensas e investigación activa.',
    ],
    sources: [
      { label: 'SFPD: Doodler Cold Case Update', url: 'https://www.sanfranciscopolice.org/news/sfpd-provides-update-doodler-cold-case-investigation-19-014' },
      { label: 'CBS San Francisco: Doodler sketch released', url: 'https://www.cbsnews.com/sanfrancisco/news/doodler-serial-killer-suspect-sketch-age-progression-san-francisco-cold-case/' },
      { label: 'San Francisco Standard: Doodler cold case reward', url: 'https://sfstandard.com/2026/06/16/the-doodler-sf-serial-killer-cold-case-east-bay/' },
      { label: 'ABC7: SFPD links sixth death', url: 'https://abc7news.com/sfpd-links-6th-death-to-the-doodler-increase-reward-to-%24200k/11514910/' },
      { label: 'ABC News: police link possible sixth victim', url: 'https://abcnews.com/US/police-link-6th-victim-1970s-serial-killer-reward/story?id=82520045' },
      { label: 'NBC Bay Area: Doodler reward update', url: 'https://www.nbcbayarea.com/news/local/police-offer-reward-info-doodler-murders/4097457/' },
      { label: 'SF News: SFPD reward notice', url: 'https://www.thesfnews.com/sfpd-offers-reward-for-information-on-the-doodler-murders/102056' },
    ],
  },
  {
    slug: 'texarkana-phantom',
    title: 'El Phantom Killer de Texarkana',
    subtitle: 'Ataques nocturnos, parejas jóvenes y una comunidad encerrada antes de que existiera el lenguaje moderno del asesino serial.',
    location: 'Texarkana, Texas-Arkansas',
    activeYears: '1946',
    victims: '5 muertas; 3 heridas',
    status: 'Nunca condenado',
    dossierCode: 'WML-CASE-TEXARKANA-1946',
    summary:
      'El Phantom Killer atacó principalmente a parejas en zonas apartadas durante 1946. El expediente llegó al FBI, pero nadie fue condenado.',
    article: [
      {
        heading: 'La primavera del miedo',
        paragraphs: [
          'En 1946, Texarkana vivió una ola de ataques nocturnos contra parejas jóvenes. El agresor golpeó y disparó, generando una reacción comunitaria extrema: armas en casa, patrullas improvisadas y una prensa que convirtió al desconocido en Phantom Killer.',
          'Los casos más recordados incluyen a Jimmy Hollis y Mary Jeanne Larey, supervivientes del primer ataque; Richard Griffin y Polly Ann Moore; Paul Martin y Betty Jo Booker; y Virgil y Katie Starks, atacados en su casa. La variedad de escenarios complica la interpretación estricta del patrón.',
        ],
      },
      {
        heading: 'Sospechosos',
        paragraphs: [
          'Youell Swinney fue señalado por investigadores y por declaraciones de su esposa, pero no hubo condena por los asesinatos. La falta de una prueba física definitiva y los problemas de credibilidad dejaron el caso en suspensión.',
          'El FBI conserva material del caso en The Vault. Es un ejemplo temprano de cooperación federal en una investigación local altamente mediática, pero esa cooperación no bastó para producir una sentencia.',
        ],
      },
      {
        heading: 'Mito y expediente',
        paragraphs: [
          'Texarkana quedó atrapada entre archivo policial y folclore. La película The Town That Dreaded Sundown popularizó el caso, pero la memoria audiovisual simplificó una investigación mucho más incierta. El asesino, si fue uno solo, nunca fue identificado judicialmente.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología de ataques de 1946.',
      'Listado de víctimas y supervivientes.',
      'Guía de archivos FBI Vault.',
      'Resumen de sospechosos sin condena.',
    ],
    sources: [
      { label: 'FBI Vault: Texarkana Phantom Moonlight Murders', url: 'https://vault.fbi.gov/texarkana-phantom-moonlight-murders' },
    ],
  },
  {
    slug: 'west-mesa',
    title: 'El West Mesa Bone Collector',
    subtitle: 'Once mujeres enterradas en Albuquerque y un asesino que quizá se escondió detrás del desprecio social.',
    location: 'Albuquerque, Nuevo México',
    activeYears: 'Probablemente 2001-2005',
    victims: '11 mujeres y una víctima fetal',
    status: 'No resuelto; recompensa activa',
    dossierCode: 'WML-CASE-WEST-MESA-2009',
    summary:
      'En 2009 se descubrió una fosa con restos de mujeres desaparecidas años antes. La policía considera el caso obra de un asesino serial no identificado.',
    article: [
      {
        heading: 'El hallazgo',
        paragraphs: [
          'El 2 de febrero de 2009, una mujer que paseaba a su perro encontró un hueso en un terreno de West Mesa. La excavación reveló restos de once mujeres y una víctima fetal. Muchas habían desaparecido años antes y estaban vinculadas a contextos de prostitución, drogas o alta vulnerabilidad, etiquetas que a menudo redujeron la urgencia institucional de buscarlas.',
          'La magnitud del enterramiento cambió la lectura pública: no eran desapariciones aisladas. Eran una serie. El lugar funcionó como depósito deliberado, y su descubrimiento tardío sugiere que el autor conocía bien los vacíos urbanos de Albuquerque.',
        ],
      },
      {
        heading: 'Investigación',
        paragraphs: [
          'El Departamento de Policía de Albuquerque mantiene una recompensa por información. Han circulado sospechosos como Lorenzo Montoya, Fred Reynolds o otros hombres conectados al ambiente donde desaparecieron las víctimas, pero ninguno ha sido acusado judicialmente como responsable de toda la serie.',
          'La dificultad central es doble: muchas desapariciones no fueron investigadas con intensidad en tiempo real, y el enterramiento expuso restos años después, cuando pruebas, testigos y escenas originales estaban deteriorados.',
        ],
      },
      {
        heading: 'La clave ética',
        paragraphs: [
          'El caso West Mesa obliga a mirar cómo se construye la categoría de víctima digna. El asesino pudo beneficiarse de que sus objetivos eran mujeres a las que el sistema ya había aprendido a ignorar. Es una investigación criminal y, a la vez, un retrato de abandono.',
        ],
      },
    ],
    archiveNotes: [
      'Lista de víctimas identificadas.',
      'Resumen del descubrimiento de 2009.',
      'Notas sobre sospechosos citados públicamente.',
      'Fuentes oficiales de Albuquerque.',
    ],
    sources: [
      { label: 'City of Albuquerque: West Mesa Homicide Investigation', url: 'https://www.cabq.gov/police/contact-the-police/west-mesa-homicide-investigation' },
      { label: 'Albuquerque Police/ArcGIS: West Mesa Bone Collector', url: 'https://storymaps.arcgis.com/stories/614b3008f52142fea25c880014852287' },
      { label: 'Unresolved: West Mesa Bone Collector', url: 'https://unresolved.me/west-mesa-bone-collector-part-one-the-pit' },
    ],
  },
  {
    slug: 'bible-john',
    title: 'Bible John',
    subtitle: 'Tres mujeres salieron del Barrowland Ballroom de Glasgow; el hombre del taxi nunca fue identificado.',
    location: 'Glasgow, Escocia',
    activeYears: '1968-1969',
    victims: '3 atribuidas',
    status: 'No resuelto',
    dossierCode: 'WML-CASE-BIBLE-JOHN-1968',
    summary:
      'Bible John es el apodo de un presunto asesino serial que mató a Patricia Docker, Jemima MacDonald y Helen Puttock tras noches de baile en Glasgow.',
    article: [
      {
        heading: 'El patrón',
        paragraphs: [
          'Patricia Docker, Jemima MacDonald y Helen Puttock fueron asesinadas entre 1968 y 1969. Las tres habían asistido al Barrowland Ballroom, un local de baile fundamental en la vida nocturna de Glasgow. La conexión pública del caso se consolidó tras el asesinato de Helen Puttock, porque su hermana Jean compartió taxi con Helen y con el hombre que luego sería conocido como Bible John.',
          'El apodo procede de los comentarios moralistas y referencias religiosas que Jean atribuyó al hombre durante el trayecto. Esa descripción permitió elaborar un retrato: joven, bien vestido, pelirrojo o castaño rojizo, con acento de Glasgow y una conducta controladora.',
        ],
      },
      {
        heading: 'Sospechas posteriores',
        paragraphs: [
          'Peter Tobin, asesino condenado, fue comparado durante años con Bible John por edad, zona y violencia contra mujeres. La Operación Anagram examinó esa posibilidad, pero no encontró base suficiente para confirmarla. La hipótesis sigue siendo popular, no cerrada.',
          'Como en otros expedientes de finales de los sesenta, el caso depende de memoria, reconstrucciones y material físico limitado. La última persona que habló extensamente con el sospechoso no pudo darle nombre. Ese vacío sostiene el misterio.',
        ],
      },
      {
        heading: 'Lo que permanece',
        paragraphs: [
          'Bible John resume una forma de miedo urbano: un hombre aparentemente integrado en espacios sociales comunes que se vuelve invisible al salir de ellos. El caso sigue abierto porque ninguna teoría ha cruzado el umbral de la prueba.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología Patricia Docker, Jemima MacDonald y Helen Puttock.',
      'Resumen del testimonio de Jean Langford.',
      'Notas sobre Peter Tobin y Operation Anagram.',
      'Fuentes de caso abierto.',
    ],
    sources: [
      { label: 'Solve the Case: Bible John', url: 'https://www.solvethecase.org/case/1969-2/bible-john' },
      { label: 'Crime Library: Bible John', url: 'https://crimelibrary.org/serial_killers/unsolved/bible_john/' },
    ],
  },
  {
    slug: 'monster-of-florence',
    title: 'El Monstruo de Florencia',
    subtitle: 'Ocho dobles homicidios, una Beretta calibre 22 y décadas de procesos que no apagaron la duda.',
    location: 'Toscana, Italia',
    activeYears: '1968-1985',
    victims: '16',
    status: 'Disputado; ampliamente considerado sin resolver',
    dossierCode: 'WML-CASE-FLORENCE-1968',
    summary:
      'El Monstruo de Florencia atacó a parejas en zonas apartadas de Toscana. Hubo condenas relacionadas, pero la identidad y estructura real del caso siguen discutidas.',
    article: [
      {
        heading: 'La serie balística',
        paragraphs: [
          'Entre 1968 y 1985, ocho parejas fueron asesinadas en la provincia de Florencia y alrededores. La conexión más fuerte fue balística: la misma Beretta calibre 22 se asoció a varios ataques. En los crímenes contra mujeres aparecieron mutilaciones post mortem que dieron al caso una violencia simbólica específica.',
          'La cronología incluye Signa, Borgo San Lorenzo, Scandicci, Calenzano, Montespertoli, Giogoli, Vicchio y Scopeti. En varios ataques las víctimas eran parejas jóvenes en coches o tiendas, lo que generó pánico en espacios de intimidad rural.',
        ],
      },
      {
        heading: 'Procesos y dudas',
        paragraphs: [
          'Pietro Pacciani fue condenado en 1994 y absuelto en apelación en 1996; murió antes de un nuevo juicio. Mario Vanni y Giancarlo Lotti fueron condenados por complicidad en algunos crímenes. Aun así, una parte importante de la opinión pública y de investigadores considera que el caso no explica de forma satisfactoria la totalidad de la serie.',
          'El expediente se contaminó con teorías de grupos, rituales, encubrimientos y pistas sardas. Algunas líneas fueron judiciales; otras, especulativas. El resultado es un caso con condenas parciales, pero sin consenso sobre quién fue el monstruo o si hubo un único monstruo.',
        ],
      },
      {
        heading: 'Por qué encaja aquí',
        paragraphs: [
          'A diferencia de otros casos de esta lista, no está simplemente vacío de nombres. Está lleno de nombres y aun así no queda resuelto. Esa es su complejidad: la justicia produjo respuestas, pero no una verdad suficientemente estable para cerrar el archivo social.',
        ],
      },
    ],
    archiveNotes: [
      'Cronología de los ocho dobles homicidios.',
      'Resumen de procesos contra Pacciani, Vanni y Lotti.',
      'Mapa de líneas investigativas principales.',
      'Fuentes italianas y síntesis documental.',
    ],
    sources: [
      { label: 'Corriere Fiorentino: cronología del Mostro', url: 'https://corrierefiorentino.corriere.it/cronaca/cards/mostro-di-firenze-la-storia-i-delitti-e-i-misteri-irrisolti-tutto-quello-che-sappiamo-fino-ad-oggi/la-cronologia-dei-delitti.shtml' },
      { label: 'Netflix Tudum: Monster of Florence background', url: 'https://www.netflix.com/tudum/articles/the-monster-of-florence-release-date-news' },
      { label: 'Crime by Region: Monster of Florence case file', url: 'https://crimebyregion.com/cases/monster-of-florence.html' },
    ],
  },
  {
    slug: 'eastbound-strangler',
    title: 'El Eastbound Strangler',
    subtitle: 'Cuatro mujeres halladas en una zanja de Atlantic City y una firma espacial que sigue sin nombre.',
    location: 'Atlantic City y Egg Harbor Township, Nueva Jersey',
    activeYears: '2006',
    victims: '4',
    status: 'No resuelto',
    dossierCode: 'WML-CASE-EASTBOUND-2006',
    summary:
      'En noviembre de 2006 aparecieron los cuerpos de Kim Raffo, Barbara Breidor, Molly Dilts y Tracy Ann Roberts cerca del Black Horse Pike. El responsable nunca ha sido identificado.',
    article: [
      {
        heading: 'La escena',
        paragraphs: [
          'El 20 de noviembre de 2006, dos mujeres encontraron un cuerpo en una zanja de drenaje junto al antiguo Golden Key Motel. La busqueda posterior revelo tres cuerpos mas. Las victimas eran mujeres vinculadas al trabajo sexual o a entornos de adiccion en Atlantic City, una vulnerabilidad que probablemente facilito el contacto inicial con el asesino.',
          'El detalle que dio nombre al caso fue la posicion de los cuerpos: alineados en la zanja, separados por distancia regular y con la cabeza orientada hacia el este, en direccion a Atlantic City. Esa puesta en escena hizo pensar en un unico autor, aunque la degradacion de los cuerpos limito la evidencia recuperable.',
        ],
      },
      {
        heading: 'Sospechas modernas',
        paragraphs: [
          'Tras el arresto de Rex Heuermann por los homicidios de Gilgo Beach, investigadores de Nueva Jersey y Nueva York compararon datos por las similitudes superficiales entre victimas y escenarios. La fiscalia de Atlantic County ha indicado publicamente que no parecia existir conexion con Heuermann.',
          'La investigacion permanece fria. Los perfiles publicos apuntan a un agresor que conocia tanto el circuito de Atlantic City como el punto de descarte en Egg Harbor Township. Pero no hay imputacion, confesion ni identificacion judicial.',
        ],
      },
      {
        heading: 'El factor invisible',
        paragraphs: [
          'Como ocurre en varios casos recientes, el asesino pudo apoyarse en la desproteccion social de sus victimas. Que las mujeres estuvieran en economias de supervivencia hizo mas facil acercarse a ellas y mas dificil reconstruir sus ultimas horas con precision.',
        ],
      },
    ],
    archiveNotes: [
      'Cronologia de hallazgo del 20 de noviembre de 2006.',
      'Resumen de las cuatro victimas identificadas.',
      'Notas sobre la comparacion descartada con Gilgo Beach.',
      'Fuentes periodisticas actualizadas hasta 2026.',
    ],
    sources: [
      { label: 'A&E: Eastbound Strangler overview', url: 'https://www.aetv.com/articles/who-is-eastbound-strangler' },
      { label: 'CBS Philadelphia: Heuermann not connected', url: 'https://www.cbsnews.com/philadelphia/news/gilgo-beach-serial-killer-rex-heuermann-atlantic-city-murders/' },
    ],
  },
  {
    slug: 'jeff-davis-8',
    title: 'Jeff Davis 8',
    subtitle: 'Ocho mujeres muertas en una parroquia de Luisiana y una pregunta que quema mas que el pantano.',
    location: 'Jennings, Luisiana',
    activeYears: '2005-2009',
    victims: '8',
    status: 'No resuelto; posible serie disputada',
    dossierCode: 'WML-CASE-JEFF-DAVIS-2005',
    summary:
      'Entre 2005 y 2009, ocho mujeres relacionadas entre si fueron halladas muertas en Jefferson Davis Parish. Nadie ha sido condenado por la serie.',
    article: [
      {
        heading: 'Una red pequena',
        paragraphs: [
          'Las victimas conocidas como Jeff Davis 8 eran mujeres jovenes de Jennings y alrededores, muchas atrapadas en drogas, pobreza, trabajo sexual o redes informales de informacion policial. Se conocian entre ellas y algunas fueron vistas con personas comunes en sus ultimas horas.',
          'Los cuerpos aparecieron en canales, caminos rurales y zonas apartadas. Esa repeticion impulso la hipotesis de un asesino serial, aunque algunos periodistas e investigadores han defendido una lectura distinta: varios agresores, corrupcion local y violencia conectada por el mismo ecosistema criminal.',
        ],
      },
      {
        heading: 'Por que sigue abierto',
        paragraphs: [
          'Hubo sospechosos y relatos contradictorios, pero ninguna acusacion cerro los ocho homicidios. El caso se volvio aun mas complejo por denuncias de mala praxis, destruccion o contaminacion de pruebas y posibles conflictos entre testigos, informantes y autoridades.',
          'La lectura mas prudente no afirma que exista un unico asesino probado. Afirma algo igual de inquietante: ocho mujeres murieron dentro de una misma red social y geografica, y el sistema no ha producido una verdad judicial.',
        ],
      },
      {
        heading: 'La herida publica',
        paragraphs: [
          'Jeff Davis 8 es un caso moderno porque no depende de nieblas victorianas ni de tecnicas forenses primitivas. Ocurrio en pleno siglo XXI. Su persistencia sin resolver habla de otro tipo de oscuridad: vulnerabilidad extrema, corrupcion percibida y una comunidad donde demasiada gente sabia algo, pero no lo bastante como para llevarlo a juicio.',
        ],
      },
    ],
    archiveNotes: [
      'Lista de las ocho victimas y periodo 2005-2009.',
      'Resumen de hipotesis de asesino unico frente a red de violencia.',
      'Notas sobre el libro Murder in the Bayou y documentales derivados.',
      'Fuentes periodisticas y editoriales actualizadas.',
    ],
    sources: [
      { label: 'Simon & Schuster: Murder in the Bayou', url: 'https://www.simonandschuster.com/books/Murder-in-the-Bayou/Ethan-Brown/9781476793276' },
      { label: 'A&E: Jeff Davis 8 interview', url: 'https://www.aetv.com/articles/jeff-davis-8-interview-ethan-brown-murder-in-the-bayou' },
      { label: 'KATC: Jennings 8 coverage', url: 'https://www.katc.com/news/jeff-davis-parish/investigators-hope-continued-coverage-of-jennings-8-can-lead-to-solving-murders' },
    ],
  },
  {
    slug: 'chicago-strangler',
    title: 'El Chicago Strangler',
    subtitle: 'Decenas de mujeres estranguladas o asfixiadas y una pregunta estadistica que la policia no ha cerrado como serie.',
    location: 'Chicago, Illinois',
    activeYears: '2001-presente en revisiones publicas',
    victims: 'Decenas de casos revisados; vinculo serial no confirmado oficialmente',
    status: 'No resuelto como posible patron',
    dossierCode: 'WML-CASE-CHICAGO-2001',
    summary:
      'Analisis periodisticos y de datos han senalado un patron de mujeres estranguladas o asfixiadas en Chicago desde 2001, con una proporcion alta de casos sin resolver.',
    article: [
      {
        heading: 'El patron de datos',
        paragraphs: [
          'A diferencia de un expediente tradicional con una lista cerrada de victimas, el llamado Chicago Strangler nace del analisis agregado: mujeres asesinadas por estrangulamiento o asfixia, muchas halladas en espacios exteriores, edificios vacios, contenedores o solares. La mayoria eran mujeres negras y varias estaban vinculadas a drogas, prostitucion o vulnerabilidad habitacional.',
          'El Murder Accountability Project y trabajos periodisticos senalaron que la tasa de resolucion era inusualmente baja. La policia de Chicago ha dicho en distintos momentos que no tenia evidencia concluyente de un unico asesino serial, pero tambien reviso casos y derivo algunos a detectives de casos frios.',
        ],
      },
      {
        heading: 'Por que entra en esta lista',
        paragraphs: [
          'El caso no debe presentarse como una serie cerrada con un unico autor probado. Su importancia esta en el riesgo de que patrones dispersos pasen inadvertidos cuando las victimas pertenecen a grupos socialmente ignorados. Si hubo uno o varios agresores, muchos no fueron descubiertos.',
          'La tension entre algoritmo, policia y comunidad define el expediente: los datos sugieren una alarma; la prueba penal exige mucho mas. Entre ambas cosas quedan familias sin respuesta.',
        ],
      },
      {
        heading: 'La pregunta actual',
        paragraphs: [
          'El punto critico no es solo si existio un Chicago Strangler, sino cuantas muertes de mujeres fueron tratadas como casos aislados por defecto. La posibilidad serial sigue siendo una advertencia sobre como las ciudades grandes pierden patrones dentro del volumen.',
        ],
      },
    ],
    archiveNotes: [
      'Resumen del patron de estrangulamiento/asfixia desde 2001.',
      'Advertencia sobre vinculo serial no confirmado oficialmente.',
      'Notas sobre Murder Accountability Project y cobertura AP/NPR.',
      'Fuentes de datos publicos de Chicago.',
    ],
    sources: [
      { label: 'Associated Press/KSL: 75 women strangled or smothered', url: 'https://www.ksl.com/article/46235223' },
      { label: 'NPR/CapRadio: algorithm and possible serial killer', url: 'https://www.capradio.org/news/npr/story?storyid=714413411' },
      { label: 'City of Chicago Data Portal: Murders since 2001', url: 'https://data.cityofchicago.org/Public-Safety/Murders-since-2001/ndfz-ruip/about' },
    ],
  },
  {
    slug: 'chillicothe-six',
    title: 'Las seis de Chillicothe',
    subtitle: 'Mujeres desaparecidas o asesinadas en Ohio y una posible serie que sigue resistiendose a una respuesta unica.',
    location: 'Chillicothe, Ohio',
    activeYears: '2014-2015',
    victims: '6 mujeres desaparecidas o asesinadas; vinculo serial no probado',
    status: 'Casos abiertos y resoluciones parciales',
    dossierCode: 'WML-CASE-CHILLICOTHE-2014',
    summary:
      'Entre 2014 y 2015, seis mujeres vinculadas a entornos comunes desaparecieron o fueron halladas muertas alrededor de Chillicothe. La teoria serial no esta cerrada.',
    article: [
      {
        heading: 'La alarma local',
        paragraphs: [
          'Charlotte Trego, Wanda Lemons, Tameka Lynch, Tiffany Sayre, Shasta Himelrick y Timberly Claytor se convirtieron en el centro de una alarma publica en el sur de Ohio. Algunas fueron encontradas muertas y otras siguieron desaparecidas durante las revisiones publicas mas conocidas.',
          'Las mujeres compartian circulos sociales donde habia consumo de drogas, prostitucion o alta vulnerabilidad. Ese solapamiento alimento la pregunta de si habia un depredador unico, una red de violencia o varios hechos conectados por el mismo entorno.',
        ],
      },
      {
        heading: 'Lo confirmado y lo pendiente',
        paragraphs: [
          'La policia de Chillicothe y Crime Stoppers mantuvieron recompensas y vias de informacion. En al menos uno de los casos hubo una condena individual, pero eso no resolvio el conjunto de desapariciones y muertes que hizo famoso el expediente.',
          'Por eso conviene formularlo con cuidado: no es un asesino serial oficialmente identificado; es una agrupacion moderna de casos donde la posibilidad serial fue investigada o debatida y donde varias preguntas siguen abiertas.',
        ],
      },
      {
        heading: 'El mismo patron social',
        paragraphs: [
          'Chillicothe se parece a otros expedientes recientes en una cosa: el peligro crece donde la sociedad mira menos. Las victimas no desaparecieron en el vacio; desaparecieron en una red de precariedad, dependencia, rumores y miedo.',
        ],
      },
    ],
    archiveNotes: [
      'Resumen de las seis mujeres asociadas al expediente publico.',
      'Distincion entre casos abiertos, hallazgos y resoluciones parciales.',
      'Notas sobre recompensas de Crime Stoppers.',
      'Fuentes policiales locales y cobertura nacional.',
    ],
    sources: [
      { label: 'Chillicothe Police Department: Missing Persons', url: 'https://chillicothepolice.com/?page_id=5022' },
      { label: 'CBS News: missing Chillicothe women', url: 'https://www.cbsnews.com/news/new-push-to-resolve-disappearances-deaths-of-chillicothe-ohio-women/' },
      { label: 'WCPO: Forgotten Women of Ohio', url: 'https://www.wcpo.com/news/crime/missing-women-of-chillicothe-new-documentary-series-looks-at-cases-of-six-dead-missing-ohio-women' },
    ],
  },
  {
    slug: 'gilgo-beach-unresolved',
    title: 'Gilgo Beach: lo que aun queda abierto',
    subtitle: 'Un caso que ya tiene culpable confeso para varias muertes, pero no una respuesta completa para todos los restos hallados.',
    location: 'Long Island, Nueva York',
    activeYears: '1993-2011',
    victims: '11 restos hallados en la investigacion amplia; varias condenas/culpabilidad y preguntas pendientes',
    status: 'Resuelto parcialmente; restos y muertes aun debatidos',
    dossierCode: 'WML-CASE-GILGO-2010',
    summary:
      'Rex Heuermann fue condenado tras declararse culpable de varios asesinatos de Long Island, pero la investigacion amplia de Gilgo dejo restos y circunstancias que aun no encajan del todo.',
    article: [
      {
        heading: 'Cambio crucial',
        paragraphs: [
          'Este caso ya no puede contarse como si el asesino nunca hubiera sido descubierto. Desde 2023, Rex Heuermann fue arrestado y posteriormente se declaro culpable de varios asesinatos vinculados a Long Island. En 2026 fue sentenciado a cadena perpetua, segun cobertura judicial reciente.',
          'Aun asi, la busqueda iniciada por la desaparicion de Shannan Gilbert revelo once conjuntos de restos en torno a Gilgo Beach y Ocean Parkway. Algunas identidades fueron resueltas con ADN; otras circunstancias quedaron separadas o discutidas.',
        ],
      },
      {
        heading: 'Lo que no cierra del todo',
        paragraphs: [
          'La fiscalia de Suffolk County documento cargos contra Heuermann por varias victimas. Pero el paraguas popular Long Island Serial Killer siempre mezclo casos oficialmente vinculados, restos no identificados y muertes debatidas. Esa amplitud hace que la verdad judicial y la verdad publica no coincidan al cien por cien.',
          'La muerte de Shannan Gilbert, que impulso la busqueda, sigue siendo discutida publicamente. Otros restos fueron tratados como no necesariamente atribuibles al mismo autor. En 2026, algunas fuentes senalaban que quedaban preguntas sobre al menos un conjunto de restos y sobre el alcance completo de la serie.',
        ],
      },
      {
        heading: 'Por que incluirlo con cuidado',
        paragraphs: [
          'Gilgo Beach es el ejemplo actual de como un caso puede pasar de mito no resuelto a resolucion parcial sin volverse simple. Hay un culpable para una parte esencial del expediente, pero tambien hay victimas y hallazgos que obligan a no cerrar la carpeta con una frase comoda.',
        ],
      },
    ],
    archiveNotes: [
      'Resumen de la evolucion 2010-2026.',
      'Separacion entre victimas confesadas/cargadas y restos aun debatidos.',
      'Notas sobre la Gilgo Beach Homicide Task Force.',
      'Fuentes oficiales de Suffolk County y cobertura 2026.',
    ],
    sources: [
      { label: 'Suffolk County DA: People v. Rex Heuermann', url: 'https://www.suffolkcountyda.org/gilgo/' },
      { label: 'ABC: Heuermann sentenced and remaining questions', url: 'https://www.abc.net.au/news/2026-06-21/rex-heuermann-long-island-serial-killer/106804594' },
      { label: 'Gilgo Case public case archive', url: 'https://www.gilgocase.com/' },
    ],
  },
]

export function findUnsolvedSerialCase(slug: string | null) {
  return unsolvedSerialCases.find((item) => item.slug === slug)
}
