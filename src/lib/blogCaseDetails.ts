import type { Locale } from './i18n'

type LocalizedText = {
  es: string
  en: string
}

export type BlogTimelineEvent = {
  date: string
  title: LocalizedText
  body: LocalizedText
}

export type BlogDetailSection = {
  title: LocalizedText
  body: LocalizedText[]
}

export type BlogCaseDetails = {
  timeline: BlogTimelineEvent[]
  sections: BlogDetailSection[]
  dossierOnly: LocalizedText[]
}

const t = (es: string, en: string): LocalizedText => ({ es, en })

const details: Record<string, BlogCaseDetails> = {
  zodiac: {
    timeline: [
      { date: '20 dic 1968', title: t('Lake Herman Road', 'Lake Herman Road'), body: t('David Faraday y Betty Lou Jensen son asesinados cerca de Vallejo.', 'David Faraday and Betty Lou Jensen are murdered near Vallejo.') },
      { date: '4 jul 1969', title: t('Blue Rock Springs', 'Blue Rock Springs'), body: t('Darlene Ferrin muere y Michael Mageau sobrevive al ataque.', 'Darlene Ferrin dies and Michael Mageau survives the attack.') },
      { date: '27 sep 1969', title: t('Lake Berryessa', 'Lake Berryessa'), body: t('Bryan Hartnell sobrevive; Cecelia Shepard muere dias despues.', 'Bryan Hartnell survives; Cecelia Shepard dies days later.') },
      { date: '11 oct 1969', title: t('Paul Stine', 'Paul Stine'), body: t('El asesinato del taxista en San Francisco rompe el patron de parejas.', 'The killing of cab driver Paul Stine breaks the couples pattern.') },
    ],
    sections: [
      {
        title: t('Victimas y contexto', 'Victims and context'),
        body: [
          t('Las victimas confirmadas eran personas corrientes atacadas en espacios de intimidad, carretera o trabajo. La serie no se sostiene por una sola escena, sino por la combinacion de ataques, llamadas, cartas y detalles que el autor aporto a la prensa.', 'The confirmed victims were ordinary people attacked in private, roadside, or work settings. The series is held together not by one scene, but by attacks, calls, letters, and details the killer supplied to the press.'),
          t('La biografia publica del asesino es inexistente: Zodiac es una identidad fabricada por cartas. Lo que se conoce de su personalidad procede de su conducta comunicativa, no de una vida civil confirmada.', 'The killer has no confirmed public biography: Zodiac is an identity built through letters. What is known about his personality comes from his communications, not from a confirmed civilian life.'),
        ],
      },
      {
        title: t('Retrato robot y material visual', 'Composite sketch and visual material'),
        body: [
          t('Existe un retrato robot asociado al asesinato de Paul Stine, elaborado a partir de testigos en Presidio Heights. No se incorpora como imagen copiada en la pagina; el ZIP incluye una ficha descriptiva y enlaces a archivos publicos donde consultarlo.', 'A composite sketch linked to the Paul Stine murder was developed from Presidio Heights witnesses. It is not copied into the page; the ZIP includes a descriptive note and public links where it can be consulted.'),
        ],
      },
      {
        title: t('Sospechosos y limites', 'Suspects and limits'),
        body: [
          t('Arthur Leigh Allen fue investigado intensamente, pero nunca fue acusado. La fuerza del caso esta en lo que no encaja: supervivientes, huellas, escritura, ADN parcial y teorias que no convergen en una prueba judicial unica.', 'Arthur Leigh Allen was heavily investigated, but never charged. The strength and frustration of the case lie in what does not converge: survivors, prints, handwriting, partial DNA, and theories that never become one judicial proof.'),
        ],
      },
    ],
    dossierOnly: [
      t('Comparativa de ataques confirmados, cartas principales, ciphers y sospechosos recurrentes.', 'Comparison of confirmed attacks, major letters, ciphers, and recurring suspects.'),
      t('Nota sobre retrato robot de Presidio Heights y fuentes FBI Vault.', 'Note on the Presidio Heights composite sketch and FBI Vault sources.'),
    ],
  },
  'jack-the-ripper': {
    timeline: [
      { date: '31 ago 1888', title: t('Mary Ann Nichols', 'Mary Ann Nichols'), body: t('Primera victima canonica hallada en Buck’s Row.', 'First canonical victim found in Buck’s Row.') },
      { date: '8 sep 1888', title: t('Annie Chapman', 'Annie Chapman'), body: t('Su asesinato intensifica la presion sobre la policia.', 'Her murder intensifies pressure on police.') },
      { date: '30 sep 1888', title: t('Doble suceso', 'Double event'), body: t('Elizabeth Stride y Catherine Eddowes mueren la misma noche.', 'Elizabeth Stride and Catherine Eddowes die the same night.') },
      { date: '9 nov 1888', title: t('Mary Jane Kelly', 'Mary Jane Kelly'), body: t('Ultima victima canonica y escena mas privada.', 'Final canonical victim and the most private scene.') },
    ],
    sections: [
      {
        title: t('Biografia de las victimas', 'Victims’ biographies'),
        body: [
          t('Las cinco victimas canonicas habian trabajado, tenido familias, relaciones y redes de supervivencia antes de ser reducidas por la prensa a estereotipos de pobreza. Recuperar esa biografia es esencial para no convertir el expediente en simple folklore.', 'The five canonical victims had work histories, families, relationships, and survival networks before the press reduced them to stereotypes of poverty. Recovering that biography is essential to avoid turning the file into folklore.'),
          t('Whitechapel no fue solo un escenario oscuro: fue un entorno de alojamiento precario, alcohol, violencia de genero y vigilancia policial desigual.', 'Whitechapel was not merely a dark setting: it was an environment of insecure lodging, alcohol, gendered violence, and uneven policing.'),
        ],
      },
      {
        title: t('Cartas y retratos', 'Letters and images'),
        body: [
          t('No existe un retrato robot fiable del asesino. Las imagenes famosas son ilustraciones periodisticas posteriores o imaginario cultural. El ZIP separa documentos policiales, cartas conservadas y representaciones no probatorias.', 'There is no reliable composite sketch of the killer. Famous images are later press illustrations or cultural imaginings. The ZIP separates police documents, preserved letters, and non-evidentiary representations.'),
        ],
      },
      {
        title: t('Sospechosos clasicos', 'Classic suspects'),
        body: [
          t('Montague Druitt, Aaron Kosminski y Michael Ostrog aparecen en discusiones historicas, pero ninguno quedo probado. El informe Macnaghten ayuda a entender la investigacion, no a cerrar el caso.', 'Montague Druitt, Aaron Kosminski, and Michael Ostrog appear in historical discussions, but none was proved. The Macnaghten report helps explain the investigation, not close the case.'),
        ],
      },
    ],
    dossierOnly: [
      t('Ficha de las cinco victimas canonicas y advertencia sobre cartas falsas.', 'File on the five canonical victims and warning about hoax letters.'),
      t('Guia de consulta de The National Archives para documentos MEPO/HO.', 'Guide to The National Archives MEPO/HO documents.'),
    ],
  },
  'cleveland-torso': {
    timeline: [
      { date: '1934', title: t('Posible inicio', 'Possible beginning'), body: t('Restos hallados antes de la serie principal son discutidos como posibles victimas.', 'Earlier remains are debated as possible victims.') },
      { date: '23 sep 1935', title: t('Kingsbury Run', 'Kingsbury Run'), body: t('Dos cuerpos son hallados; Edward Andrassy sera identificado.', 'Two bodies are found; Edward Andrassy will be identified.') },
      { date: '1936-1938', title: t('Escalada', 'Escalation'), body: t('Aparecen mas victimas, la mayoria decapitadas y muchas sin nombre.', 'More victims appear, most decapitated and many unnamed.') },
      { date: 'ago 1938', title: t('Intervencion de Ness', 'Ness intervention'), body: t('Eliot Ness ordena destruir campamentos de Kingsbury Run.', 'Eliot Ness orders Kingsbury Run camps destroyed.') },
    ],
    sections: [
      {
        title: t('Victimas sin nombre', 'Unnamed victims'),
        body: [
          t('La biografia mas importante del caso es la ausencia de biografia: muchas victimas eran trabajadores itinerantes, personas pobres o habitantes de asentamientos. Esa invisibilidad dificulto identificarlas y, por tanto, reconstruir sus ultimas horas.', 'The most important biography in this case is the absence of biography: many victims were itinerant workers, poor people, or camp residents. That invisibility made identification and last-hour reconstruction difficult.'),
        ],
      },
      {
        title: t('Sospechas medicas', 'Medical suspicions'),
        body: [
          t('El corte y desmembramiento llevaron a pensar en conocimiento anatomico. Francis E. Sweeney aparece como sospechoso historico frecuente, pero el expediente publico no ofrece una prueba judicial definitiva.', 'The cutting and dismemberment suggested anatomical knowledge. Francis E. Sweeney remains a frequent historical suspect, but the public record does not provide definitive judicial proof.'),
        ],
      },
      {
        title: t('Retratos y mascaras mortuorias', 'Images and death masks'),
        body: [
          t('No hay retrato robot util del asesino. El material visual mas relevante son mascaras mortuorias, fotografias policiales y diagramas de tatuajes usados para identificar victimas. El ZIP los trata como referencias de fuente, no como copias.', 'There is no useful composite sketch of the killer. The key visual material is death masks, police photographs, and tattoo diagrams used to identify victims. The ZIP treats them as source references, not copied assets.'),
        ],
      },
    ],
    dossierOnly: [
      t('Tabla de victimas identificadas/no identificadas y notas sobre mascaras mortuorias.', 'Table of identified/unidentified victims and notes on death masks.'),
      t('Resumen de Dolezal, Sweeney y la perdida de archivos policiales.', 'Summary of Dolezal, Sweeney, and missing police records.'),
    ],
  },
  'servant-girl-annihilator': {
    timeline: [
      { date: '30 dic 1884', title: t('Mollie Smith', 'Mollie Smith'), body: t('Primer asesinato atribuido a la serie de Austin.', 'First murder attributed to the Austin series.') },
      { date: 'may 1885', title: t('Shelley y Cross', 'Shelley and Cross'), body: t('Dos ataques consolidan el miedo a un agresor nocturno.', 'Two attacks consolidate fear of a nighttime offender.') },
      { date: 'ago-sep 1885', title: t('Mary Ramey y Vance/Washington', 'Mary Ramey and Vance/Washington'), body: t('La serie se expande mas alla de empleadas domesticas adultas.', 'The series expands beyond adult domestic workers.') },
      { date: '24 dic 1885', title: t('Nochebuena', 'Christmas Eve'), body: t('Susan Hancock y Eula Phillips son asesinadas en ataques separados.', 'Susan Hancock and Eula Phillips are murdered in separate attacks.') },
    ],
    sections: [
      {
        title: t('Biografia social', 'Social biography'),
        body: [
          t('Las primeras victimas eran mujeres negras trabajadoras en una ciudad que crecia deprisa y documentaba peor a quienes tenian menos poder. Sus vidas aparecen fragmentadas en censos, prensa e inquests.', 'The first victims were Black working women in a fast-growing city that documented the powerless poorly. Their lives appear in fragments through censuses, newspapers, and inquests.'),
        ],
      },
      {
        title: t('Posible retrato del agresor', 'Possible offender image'),
        body: [
          t('No existe un retrato robot moderno. Algunas pistas historicas hablaron de huellas, un posible pie deformado y testigos que asumian un agresor masculino. El ZIP incluye una ficha de esas descripciones con cautela.', 'There is no modern composite sketch. Historical clues included footprints, a possible foot deformity, and witnesses assuming a male offender. The ZIP includes a cautious description sheet.'),
        ],
      },
      {
        title: t('Nathan Elgin y la duda', 'Nathan Elgin and doubt'),
        body: [
          t('Nathan Elgin ha sido propuesto por reconstrucciones modernas, pero murio poco despues y nunca fue probado. La hipotesis ayuda a pensar el caso; no lo convierte en cerrado.', 'Nathan Elgin has been proposed by modern reconstructions, but he died soon after and was never proved. The hypothesis helps frame the case; it does not close it.'),
        ],
      },
    ],
    dossierOnly: [
      t('Cronologia completa de victimas y enlaces a archivos de Travis County.', 'Full victim timeline and links to Travis County archives.'),
      t('Ficha de descripciones fisicas historicas y su debilidad probatoria.', 'Sheet on historical physical descriptions and their evidentiary weakness.'),
    ],
  },
  'freeway-phantom': {
    timeline: [
      { date: '25 abr 1971', title: t('Carol Spinks', 'Carol Spinks'), body: t('Primera victima reconocida desaparece en Washington D.C.', 'First recognized victim disappears in Washington, D.C.') },
      { date: 'jul 1971', title: t('Johnson y Crockett', 'Johnson and Crockett'), body: t('Dos desapariciones amplian el patron.', 'Two disappearances expand the pattern.') },
      { date: 'nov 1971', title: t('Brenda Woodard', 'Brenda Woodard'), body: t('Aparece una nota firmada como Free-way Phantom.', 'A note signed Free-way Phantom appears.') },
      { date: 'sep 1972', title: t('Diane Williams', 'Diane Williams'), body: t('Ultima victima reconocida de la serie publica.', 'Final recognized victim in the public series.') },
    ],
    sections: [
      {
        title: t('Biografia de las victimas', 'Victim biographies'),
        body: [
          t('Eran niñas y adolescentes negras entre 10 y 18 años. El expediente debe leerse desde sus vidas y familias, no solo desde la firma del agresor.', 'They were Black girls and young women between 10 and 18. The file must be read through their lives and families, not only through the offender’s signature.'),
        ],
      },
      {
        title: t('La nota', 'The note'),
        body: [
          t('La nota atribuida al asesino es una de las piezas centrales, pero no identifica al autor. Su valor esta en confirmar una dimension comunicativa y cruel del caso.', 'The note attributed to the killer is central, but it does not identify the author. Its value lies in confirming a communicative and cruel dimension of the case.'),
        ],
      },
      {
        title: t('Retrato robot', 'Composite sketch'),
        body: [
          t('No hay un retrato robot universalmente asociado como prueba fuerte. El ZIP incluye ficha de sospechosos publicos y descripciones disponibles, separadas de afirmaciones no probadas.', 'There is no universally accepted composite sketch as strong evidence. The ZIP includes a sheet on public suspects and available descriptions, separated from unproved claims.'),
        ],
      },
    ],
    dossierOnly: [
      t('Fichas individuales de las seis victimas y mapa de hallazgos.', 'Individual files for the six victims and discovery map notes.'),
      t('Texto contextual sobre cobertura desigual y cooperacion jurisdiccional.', 'Context note on unequal coverage and jurisdictional cooperation.'),
    ],
  },
  'the-doodler': {
    timeline: [
      { date: '27 ene 1974', title: t('Gerald Cavanagh', 'Gerald Cavanagh'), body: t('Primer homicidio confirmado en Ocean Beach.', 'First confirmed homicide at Ocean Beach.') },
      { date: 'jun-jul 1974', title: t('Stevens y Christmann', 'Stevens and Christmann'), body: t('Dos nuevas victimas conectan bares, dibujo y zonas aisladas.', 'Two new victims connect bars, sketching, and isolated locations.') },
      { date: '1975', title: t('Capin, Gullberg y Andrews', 'Capin, Gullberg and Andrews'), body: t('La SFPD ha tratado a Warren Andrews como posible sexta victima.', 'SFPD has treated Warren Andrews as a possible sixth victim.') },
      { date: '2022-2026', title: t('Recompensa y revision', 'Reward and review'), body: t('La investigacion se reactiva con bocetos y recompensa publica.', 'The investigation is renewed with sketches and public reward.') },
    ],
    sections: [
      {
        title: t('Victimas y entorno', 'Victims and environment'),
        body: [
          t('Las victimas eran hombres gays en una epoca en la que salir del armario podia destruir vidas personales y profesionales. Esa presion social influyo directamente en la falta de testimonios publicos.', 'The victims were gay men at a time when being publicly out could destroy personal and professional lives. That social pressure directly affected the lack of public testimony.'),
        ],
      },
      {
        title: t('Retrato robot', 'Composite sketch'),
        body: [
          t('Este caso si tiene bocetos relevantes: uno de 1975 y una progresion de edad publicada por SFPD. El ZIP incluye una ficha sobre esos retratos y enlaces a la publicacion policial.', 'This case does have relevant sketches: a 1975 sketch and an age-progressed image released by SFPD. The ZIP includes a sheet on those images and links to the police release.'),
        ],
      },
      {
        title: t('Por que no hubo juicio', 'Why there was no trial'),
        body: [
          t('Supervivientes habrian podido ayudar a sostener un caso, pero testificar implicaba exponerse. La impunidad se apoyo en la violencia y tambien en el silencio impuesto por la homofobia.', 'Survivors may have helped sustain a case, but testifying meant exposure. Impunity rested on violence and on silence imposed by homophobia.'),
        ],
      },
    ],
    dossierOnly: [
      t('Ficha de retrato de 1975 y progresion de edad de SFPD.', 'File on the 1975 sketch and SFPD age progression.'),
      t('Notas sobre supervivientes, bares y lugares de hallazgo.', 'Notes on survivors, bars, and recovery sites.'),
    ],
  },
  'texarkana-phantom': {
    timeline: [
      { date: '22 feb 1946', title: t('Primer ataque', 'First attack'), body: t('Jimmy Hollis y Mary Jeanne Larey sobreviven.', 'Jimmy Hollis and Mary Jeanne Larey survive.') },
      { date: '24 mar 1946', title: t('Griffin y Moore', 'Griffin and Moore'), body: t('Primer doble homicidio reconocido.', 'First recognized double homicide.') },
      { date: '14 abr 1946', title: t('Martin y Booker', 'Martin and Booker'), body: t('El miedo se dispara en Texarkana.', 'Public fear spikes in Texarkana.') },
      { date: '3 may 1946', title: t('Familia Starks', 'Starks family'), body: t('Ataque domestico contra Virgil y Katie Starks.', 'Home attack against Virgil and Katie Starks.') },
    ],
    sections: [
      {
        title: t('Casos principales', 'Main cases'),
        body: [
          t('La serie mezcla ataques a parejas en zonas apartadas y un ataque dentro de una vivienda. Esa variacion sostiene tanto la hipotesis de un unico agresor versatil como dudas sobre la conexion total.', 'The series mixes attacks on couples in isolated areas with a home attack. That variation supports both a versatile single-offender theory and doubts about total linkage.'),
        ],
      },
      {
        title: t('Retrato y mascara', 'Description and mask'),
        body: [
          t('La iconografia popular del saco o mascara procede de relatos de supervivientes y de adaptaciones culturales. El ZIP incluye una ficha que distingue descripcion testifical, prensa y cine.', 'The popular sack-mask iconography comes from survivor accounts and cultural adaptations. The ZIP includes a sheet separating witness description, press, and film.'),
        ],
      },
      {
        title: t('Sospechoso Swinney', 'Swinney suspect line'),
        body: [
          t('Youell Swinney fue sospechoso relevante, pero el caso no produjo condena por los asesinatos. Las declaraciones indirectas no bastaron para cerrar la serie.', 'Youell Swinney was a significant suspect, but the case produced no murder conviction. Indirect statements were not enough to close the series.'),
        ],
      },
    ],
    dossierOnly: [
      t('Resumen de supervivientes, dobles homicidios y archivo FBI Vault.', 'Summary of survivors, double murders, and FBI Vault archive.'),
      t('Ficha sobre mascara/descripciones y su origen cultural.', 'Sheet on mask/descriptions and their cultural origin.'),
    ],
  },
  'west-mesa': {
    timeline: [
      { date: '2001-2005', title: t('Desapariciones', 'Disappearances'), body: t('Mujeres de Albuquerque desaparecen antes de ser encontradas años despues.', 'Albuquerque women disappear years before discovery.') },
      { date: '2 feb 2009', title: t('Hallazgo inicial', 'Initial discovery'), body: t('Un hueso aparece en West Mesa durante un paseo.', 'A bone is found in West Mesa during a walk.') },
      { date: '2009-2010', title: t('Identificaciones', 'Identifications'), body: t('Se identifican once mujeres y una victima fetal.', 'Eleven women and one fetal victim are identified.') },
      { date: 'Actualidad', title: t('Recompensa', 'Reward'), body: t('Albuquerque mantiene investigacion y recompensa.', 'Albuquerque maintains investigation and reward.') },
    ],
    sections: [
      {
        title: t('Biografia y vulnerabilidad', 'Biography and vulnerability'),
        body: [
          t('Muchas victimas estaban vinculadas a economias de supervivencia, drogas o trabajo sexual. Esos datos explican riesgo; no reducen su identidad. El expediente ampliado incluye nombres, edades y contexto comunitario.', 'Many victims were linked to survival economies, drugs, or sex work. Those facts explain risk; they do not reduce identity. The expanded file includes names, ages, and community context.'),
        ],
      },
      {
        title: t('Sospechosos', 'Suspects'),
        body: [
          t('Lorenzo Montoya, Fred Reynolds y otros nombres han circulado en cobertura publica, pero no existe imputacion que cierre el conjunto. La escena de enterramiento sugiere conocimiento local y control de tiempos.', 'Lorenzo Montoya, Fred Reynolds, and other names have circulated publicly, but no charge closes the whole file. The burial site suggests local knowledge and timing control.'),
        ],
      },
      {
        title: t('Material visual', 'Visual material'),
        body: [
          t('No hay retrato robot central. El ZIP incluye referencias a mapas, fichas de victimas y comunicados publicos de Albuquerque.', 'There is no central composite sketch. The ZIP includes references to maps, victim files, and Albuquerque public releases.'),
        ],
      },
    ],
    dossierOnly: [
      t('Tabla ampliada de victimas y notas de sospechosos.', 'Expanded victim table and suspect notes.'),
      t('Referencias a mapa de la fosa y recompensa oficial.', 'References to burial-site map and official reward.'),
    ],
  },
  'bible-john': {
    timeline: [
      { date: '23 feb 1968', title: t('Patricia Docker', 'Patricia Docker'), body: t('Primera victima vinculada al Barrowland Ballroom.', 'First victim linked to the Barrowland Ballroom.') },
      { date: 'ago 1969', title: t('Jemima MacDonald', 'Jemima MacDonald'), body: t('Segunda victima; aumenta la sospecha de patron.', 'Second victim; pattern suspicion grows.') },
      { date: '31 oct 1969', title: t('Helen Puttock', 'Helen Puttock'), body: t('Jean Langford comparte taxi con Helen y el sospechoso.', 'Jean Langford shares a taxi with Helen and the suspect.') },
      { date: '2000s', title: t('Operation Anagram', 'Operation Anagram'), body: t('Se revisa la posible conexion con Peter Tobin sin confirmarla.', 'Possible Peter Tobin connection is reviewed but not confirmed.') },
    ],
    sections: [
      {
        title: t('Victimas', 'Victims'),
        body: [
          t('Patricia Docker, Jemima MacDonald y Helen Puttock eran mujeres con vidas familiares y sociales que coincidieron en una escena nocturna popular. El Barrowland no explica sus muertes por si solo, pero si el metodo de aproximacion.', 'Patricia Docker, Jemima MacDonald, and Helen Puttock were women with family and social lives who overlapped with a popular nightlife setting. The Barrowland does not explain their deaths by itself, but it does explain approach.'),
        ],
      },
      {
        title: t('Retrato hablado', 'Verbal portrait'),
        body: [
          t('La descripcion mas importante procede de Jean Langford: hombre joven, bien vestido, con referencias religiosas y conducta moralizante. El ZIP incluye una ficha de ese retrato hablado.', 'The most important description came from Jean Langford: a young, well-dressed man with religious references and moralizing behavior. The ZIP includes a sheet on that verbal portrait.'),
        ],
      },
      {
        title: t('Peter Tobin', 'Peter Tobin'),
        body: [
          t('La comparacion con Tobin es atractiva por proximidad y perfil criminal, pero no probada. La pagina evita tratar una coincidencia narrativa como identificacion.', 'The Tobin comparison is attractive because of proximity and criminal profile, but unproved. The page avoids treating narrative coincidence as identification.'),
        ],
      },
    ],
    dossierOnly: [
      t('Ficha de retrato hablado de Jean Langford y linea Tobin.', 'Sheet on Jean Langford’s verbal portrait and the Tobin line.'),
      t('Cronologia Barrowland y notas de Operation Anagram.', 'Barrowland timeline and Operation Anagram notes.'),
    ],
  },
  'monster-of-florence': {
    timeline: [
      { date: '1968', title: t('Signa', 'Signa'), body: t('Doble homicidio luego vinculado por balistica.', 'Double murder later linked by ballistics.') },
      { date: '1974-1982', title: t('Parejas atacadas', 'Couples attacked'), body: t('La serie se consolida alrededor de parejas en espacios apartados.', 'The series consolidates around couples in secluded settings.') },
      { date: '1983-1985', title: t('Ultimos ataques', 'Final attacks'), body: t('Victimas extranjeras y envio de tejido al fiscal intensifican el caso.', 'Foreign victims and tissue sent to a prosecutor intensify the case.') },
      { date: '1994-2000', title: t('Procesos', 'Trials'), body: t('Pacciani, Vanni y Lotti atraviesan condenas, absoluciones y dudas.', 'Pacciani, Vanni, and Lotti pass through convictions, acquittals, and doubts.') },
    ],
    sections: [
      {
        title: t('Arma y patron', 'Weapon and pattern'),
        body: [
          t('La Beretta calibre 22 es la columna vertebral del expediente. La repeticion balistica une escenas separadas por años y geografias rurales alrededor de Florencia.', 'The .22 Beretta is the backbone of the file. Ballistic repetition joins scenes separated by years and rural geography around Florence.'),
        ],
      },
      {
        title: t('Sospechosos y procesos', 'Suspects and trials'),
        body: [
          t('Pacciani fue condenado y absuelto; Vanni y Lotti fueron condenados por complicidad. Las resoluciones judiciales no eliminaron la duda sobre si hubo un unico autor, un grupo o una cadena de encubrimientos.', 'Pacciani was convicted and acquitted; Vanni and Lotti were convicted of complicity. Judicial outcomes did not erase doubt over whether there was one offender, a group, or a chain of coverups.'),
        ],
      },
      {
        title: t('Retrato e imaginario', 'Image and public imagination'),
        body: [
          t('No hay retrato robot definitivo que cierre la identidad. El ZIP incluye mapas cronologicos, lineas de sospechosos y advertencia sobre teorias rituales no probadas.', 'There is no definitive composite sketch closing identity. The ZIP includes chronological maps, suspect lines, and a warning about unproved ritual theories.'),
        ],
      },
    ],
    dossierOnly: [
      t('Cronologia de ocho dobles homicidios y resumen judicial.', 'Timeline of eight double murders and judicial summary.'),
      t('Notas sobre pistas sardas, Pacciani y compagni di merende.', 'Notes on Sardinian leads, Pacciani, and compagni di merende.'),
    ],
  },
  'eastbound-strangler': {
    timeline: [
      { date: 'oct-nov 2006', title: t('Ultimas semanas', 'Final weeks'), body: t('Las victimas desaparecen en un periodo concentrado.', 'Victims disappear over a concentrated period.') },
      { date: '20 nov 2006', title: t('Golden Key Motel', 'Golden Key Motel'), body: t('Kim Raffo es hallada; despues aparecen tres cuerpos mas.', 'Kim Raffo is found; three more bodies are then discovered.') },
      { date: '2007-2010', title: t('Caso frio', 'Cold case'), body: t('Las pistas no producen una imputacion.', 'Leads do not produce a charge.') },
      { date: '2023-2026', title: t('Comparacion Gilgo', 'Gilgo comparison'), body: t('Autoridades descartan conexion aparente con Rex Heuermann.', 'Authorities find no apparent connection to Rex Heuermann.') },
    ],
    sections: [
      {
        title: t('Victimas', 'Victims'),
        body: [
          t('Kim Raffo, Barbara Breidor, Molly Dilts y Tracy Ann Roberts compartian vulnerabilidad en el entorno de Atlantic City. Sus biografias incluyen trabajos, familias, adicciones y trayectorias mas complejas que la etiqueta de prostitucion.', 'Kim Raffo, Barbara Breidor, Molly Dilts, and Tracy Ann Roberts shared vulnerability in Atlantic City. Their biographies include work, families, addiction, and lives more complex than the prostitution label.'),
        ],
      },
      {
        title: t('Firma espacial', 'Spatial signature'),
        body: [
          t('La colocacion de los cuerpos mirando al este hizo que el caso adquiriera nombre propio. El valor de esa firma es interpretativo: sugiere control, pero no identifica por si sola.', 'The east-facing placement gave the case its name. That signature is interpretive: it suggests control, but does not identify the offender by itself.'),
        ],
      },
      {
        title: t('Retrato robot', 'Composite sketch'),
        body: [
          t('No existe un retrato robot publico fuerte. El ZIP incluye fichas de victimas, punto de hallazgo y sospechas descartadas publicamente.', 'There is no strong public composite sketch. The ZIP includes victim sheets, discovery point notes, and publicly rejected suspect links.'),
        ],
      },
    ],
    dossierOnly: [
      t('Resumen de la disposicion de cuerpos y comparacion con Gilgo Beach.', 'Summary of body placement and comparison with Gilgo Beach.'),
      t('Ficha de cada victima y ultimas zonas conocidas.', 'Sheet for each victim and last known areas.'),
    ],
  },
  'jeff-davis-8': {
    timeline: [
      { date: 'may 2005', title: t('Loretta Lewis', 'Loretta Lewis'), body: t('Primer cuerpo hallado en el expediente publico.', 'First body found in the public file.') },
      { date: '2005-2008', title: t('Cadena de muertes', 'Chain of deaths'), body: t('Aparecen mas victimas conectadas por redes sociales locales.', 'More victims appear, connected by local social networks.') },
      { date: '2009', title: t('Octava victima', 'Eighth victim'), body: t('El caso ya se conoce como Jeff Davis 8.', 'The case is known as the Jeff Davis 8.') },
      { date: '2016-2019', title: t('Libro y documental', 'Book and documentary'), body: t('Murder in the Bayou reabre el debate publico.', 'Murder in the Bayou renews public debate.') },
    ],
    sections: [
      {
        title: t('Biografia comunitaria', 'Community biography'),
        body: [
          t('Las victimas se conocian y compartian un circuito pequeño de drogas, sexo, informacion policial y supervivencia. Esa conexion puede indicar un depredador, pero tambien una red de violencia con varios actores.', 'The victims knew one another and shared a small circuit of drugs, sex, police information, and survival. That connection may indicate a predator, but also a violence network with several actors.'),
        ],
      },
      {
        title: t('Corrupcion y sospechas', 'Corruption and suspicion'),
        body: [
          t('La hipotesis mas inquietante no es solo un asesino serial, sino que testigos, informantes o autoridades locales pudieran haber distorsionado la investigacion. Por eso el caso se presenta como serie disputada.', 'The most disturbing hypothesis is not only a serial killer, but that witnesses, informants, or local authorities may have distorted the investigation. That is why the case is presented as disputed.'),
        ],
      },
      {
        title: t('Material visual', 'Visual material'),
        body: [
          t('No hay retrato robot central. El ZIP incluye mapa narrativo, fichas de victimas y fuentes documentales para ampliar.', 'There is no central composite sketch. The ZIP includes a narrative map, victim sheets, and documentary sources for further reading.'),
        ],
      },
    ],
    dossierOnly: [
      t('Tabla de las ocho victimas y conexiones conocidas.', 'Table of the eight victims and known connections.'),
      t('Notas sobre hipotesis de asesino unico frente a red criminal.', 'Notes on single-killer theory versus criminal network.'),
    ],
  },
  'chicago-strangler': {
    timeline: [
      { date: '2001+', title: t('Patron de datos', 'Data pattern'), body: t('Casos de mujeres estranguladas/asfixiadas se acumulan.', 'Cases of strangled/smothered women accumulate.') },
      { date: '2018', title: t('Analisis Tribune/AP', 'Tribune/AP analysis'), body: t('Se publican cifras de decenas de casos y baja resolucion.', 'Figures on dozens of cases and low clearance are published.') },
      { date: '2019', title: t('Algoritmo MAP', 'MAP algorithm'), body: t('Murder Accountability Project senala patrones de alerta.', 'Murder Accountability Project flags warning patterns.') },
      { date: 'Actualidad', title: t('Debate abierto', 'Open debate'), body: t('La policia no confirma un unico asesino serial.', 'Police do not confirm one serial killer.') },
    ],
    sections: [
      {
        title: t('Victimologia', 'Victimology'),
        body: [
          t('El patron afecta sobre todo a mujeres negras y vulnerables. La biografia aqui se lee en agregado: edades, barrios, contextos de explotacion y escenas exteriores.', 'The pattern affects mostly Black and vulnerable women. Biography here is read in aggregate: ages, neighborhoods, exploitation contexts, and outdoor scenes.'),
        ],
      },
      {
        title: t('No es una serie cerrada', 'Not a closed series'),
        body: [
          t('La pagina no afirma que exista un unico Chicago Strangler. Presenta una alarma estadistica: muchos homicidios con metodo parecido, muchos sin resolver y un riesgo de que el volumen urbano oculte patrones.', 'The page does not assert one Chicago Strangler. It presents a statistical warning: many similar-method homicides, many unsolved, and a risk that urban volume hides patterns.'),
        ],
      },
      {
        title: t('Retrato robot', 'Composite sketch'),
        body: [
          t('No hay retrato robot porque no hay un sospechoso unico confirmado. El ZIP incluye metodologia de lectura de datos y fuentes publicas.', 'There is no composite sketch because there is no confirmed single suspect. The ZIP includes data-reading methodology and public sources.'),
        ],
      },
    ],
    dossierOnly: [
      t('Ficha metodologica sobre patrones, limites y sesgos de datos.', 'Methodology sheet on patterns, limits, and data bias.'),
      t('Resumen de cifras publicadas y cautelas policiales.', 'Summary of published figures and police cautions.'),
    ],
  },
  'chillicothe-six': {
    timeline: [
      { date: 'may 2014', title: t('Charlotte Trego', 'Charlotte Trego'), body: t('Desaparicion que inicia la alarma publica.', 'Disappearance that begins public alarm.') },
      { date: '2014-2015', title: t('Otras desapariciones', 'Other disappearances'), body: t('Wanda Lemons y otras mujeres entran en el expediente.', 'Wanda Lemons and other women enter the file.') },
      { date: '2015', title: t('Hallazgos', 'Recoveries'), body: t('Varias mujeres son halladas muertas en la region.', 'Several women are found dead in the region.') },
      { date: 'Posterior', title: t('Resoluciones parciales', 'Partial resolutions'), body: t('Algunos casos tienen avances individuales, no una respuesta global.', 'Some cases have individual progress, not a global answer.') },
    ],
    sections: [
      {
        title: t('Victimas y entorno', 'Victims and environment'),
        body: [
          t('Las mujeres compartian circulos de droga, prostitucion o precariedad. Esa conexion puede ser una pista o una trampa interpretativa: no todo vinculo social prueba un asesino unico.', 'The women shared circles of drugs, sex work, or precarity. That connection can be a clue or an interpretive trap: not every social link proves one killer.'),
        ],
      },
      {
        title: t('Casos distintos', 'Separate cases'),
        body: [
          t('Timberly Claytor tuvo una resolucion individual con condena. Otras desapariciones y muertes siguieron abiertas o discutidas. El articulo separa el conjunto mediatico de cada expediente concreto.', 'Timberly Claytor had an individual resolution with a conviction. Other disappearances and deaths remained open or disputed. The article separates the media cluster from each concrete file.'),
        ],
      },
      {
        title: t('Retrato robot', 'Composite sketch'),
        body: [
          t('No hay retrato robot unico. El ZIP incluye fichas por mujer y notas sobre recompensas/tips de Crime Stoppers.', 'There is no single composite sketch. The ZIP includes per-woman sheets and notes on Crime Stoppers rewards/tips.'),
        ],
      },
    ],
    dossierOnly: [
      t('Tabla de seis mujeres, estado de cada caso y recompensas.', 'Table of six women, each case status, and rewards.'),
      t('Nota sobre teoria serial frente a resoluciones individuales.', 'Note on serial theory versus individual resolutions.'),
    ],
  },
  'gilgo-beach-unresolved': {
    timeline: [
      { date: '1996-2011', title: t('Restos dispersos', 'Scattered remains'), body: t('Se descubren restos en Fire Island, Manorville, Gilgo y Ocean Parkway.', 'Remains are found in Fire Island, Manorville, Gilgo, and Ocean Parkway.') },
      { date: '2010', title: t('Shannan Gilbert', 'Shannan Gilbert'), body: t('Su desaparicion impulsa la busqueda que revela otros cuerpos.', 'Her disappearance triggers the search that reveals other bodies.') },
      { date: '2023-2024', title: t('Arresto y cargos', 'Arrest and charges'), body: t('Rex Heuermann es arrestado y acusado en varios homicidios.', 'Rex Heuermann is arrested and charged in several murders.') },
      { date: '2026', title: t('Resolucion parcial', 'Partial resolution'), body: t('Heuermann admite varios asesinatos; quedan preguntas del expediente amplio.', 'Heuermann admits several murders; questions remain in the wider file.') },
    ],
    sections: [
      {
        title: t('Por que no es simple', 'Why it is not simple'),
        body: [
          t('Gilgo Beach ya no es un caso de asesino desconocido para todas las victimas. Pero el paraguas LISK incluyo restos, identidades y muertes que no encajan todas en una unica respuesta.', 'Gilgo Beach is no longer an unknown-killer case for all victims. But the LISK umbrella included remains, identities, and deaths that do not all fit one answer.'),
        ],
      },
      {
        title: t('Victimas y biografia', 'Victims and biography'),
        body: [
          t('Muchas victimas eran mujeres que anunciaban servicios sexuales o vivian en movilidad. El expediente ampliado debe nombrarlas sin reducirlas a su riesgo.', 'Many victims were women who advertised sexual services or lived mobile lives. The expanded file must name them without reducing them to risk.'),
        ],
      },
      {
        title: t('Material visual', 'Visual material'),
        body: [
          t('Hay reconstrucciones, mapas y fotografias de objetos en archivos publicos, pero no un retrato robot unico que explique toda la serie. El ZIP incluye enlaces y notas de separacion por victima.', 'There are reconstructions, maps, and object photographs in public archives, but no single composite sketch explaining the whole series. The ZIP includes links and per-victim separation notes.'),
        ],
      },
    ],
    dossierOnly: [
      t('Separacion entre victimas admitidas/cargadas y restos aun debatidos.', 'Separation between admitted/charged victims and still-debated remains.'),
      t('Notas sobre task force, ADN y objetos publicos.', 'Notes on task force, DNA, and public objects.'),
    ],
  },
}

const supplementalTimeline: Record<string, BlogTimelineEvent[]> = {
  zodiac: [
    { date: '1966', title: t('Posible antecedente discutido', 'Disputed possible precursor'), body: t('El asesinato de Cheri Jo Bates en Riverside entra en debates posteriores, aunque no queda probado como crimen de Zodiac.', 'The Cheri Jo Bates murder in Riverside later enters Zodiac debates, although it is not proved as a Zodiac crime.') },
    { date: '31 jul 1969', title: t('Cartas a periodicos', 'Letters to newspapers'), body: t('Tres periodicos reciben cartas y partes de un criptograma; el autor exige publicacion.', 'Three newspapers receive letters and parts of a cipher; the author demands publication.') },
    { date: 'ago 1969', title: t('Primer cifrado resuelto', 'First cipher solved'), body: t('El Z408 se resuelve y confirma el interes del asesino por controlar el relato publico.', 'The Z408 is solved and confirms the killer interest in controlling public narrative.') },
    { date: '1970-1974', title: t('Nueva correspondencia', 'Further correspondence'), body: t('Llegan mas cartas atribuidas o discutidas, con amenazas, simbolos y reclamaciones variables.', 'More attributed or disputed letters arrive, with threats, symbols, and changing claims.') },
    { date: '2020', title: t('Z340 descifrado', 'Z340 deciphered'), body: t('Un criptograma historico es resuelto sin revelar la identidad del asesino.', 'A historic cipher is solved without revealing the killer identity.') },
  ],
  'jack-the-ripper': [
    { date: 'abr 1888', title: t('Emma Smith', 'Emma Smith'), body: t('Ataque incluido en el expediente amplio de Whitechapel, aunque no es victima canonica de Jack.', 'An attack included in the wider Whitechapel file, though not a canonical Ripper victim.') },
    { date: '7 ago 1888', title: t('Martha Tabram', 'Martha Tabram'), body: t('Su muerte precede a las canonicas y sigue siendo debatida dentro del patron.', 'Her death precedes the canonical murders and remains debated within the pattern.') },
    { date: '27 sep 1888', title: t('Carta Dear Boss', 'Dear Boss letter'), body: t('La carta populariza el nombre Jack the Ripper, aunque su autoria real es discutida.', 'The letter popularizes the name Jack the Ripper, although its true authorship is disputed.') },
    { date: '16 oct 1888', title: t('Carta From Hell', 'From Hell letter'), body: t('Una carta con medio rinon llega a George Lusk; su autenticidad nunca queda cerrada.', 'A letter with half a kidney reaches George Lusk; its authenticity is never settled.') },
    { date: '1891', title: t('Cierre gradual del expediente', 'Gradual closing of the file'), body: t('El archivo se diluye entre sospechosos, memorias policiales y ausencia de prueba final.', 'The file fades into suspects, police memoirs, and the absence of final proof.') },
  ],
  'cleveland-torso': [
    { date: 'sep 1934', title: t('Lady of the Lake', 'Lady of the Lake'), body: t('Un torso femenino hallado cerca del lago Erie se asocia a veces como posible antecedente.', 'A female torso found near Lake Erie is sometimes treated as a possible precursor.') },
    { date: '1935', title: t('Kingsbury Run', 'Kingsbury Run'), body: t('Aparecen cuerpos desmembrados y la zona se convierte en foco de busquedas.', 'Dismembered bodies appear and the area becomes the center of searches.') },
    { date: '1936', title: t('Presion de Eliot Ness', 'Eliot Ness under pressure'), body: t('La investigacion municipal crece bajo presion publica y politica.', 'The municipal investigation grows under public and political pressure.') },
    { date: '1938', title: t('Incendio de asentamientos', 'Shantytown fires'), body: t('Ness ordena quemar asentamientos de Kingsbury Run, una medida aun criticada.', 'Ness orders Kingsbury Run shantytowns burned, a measure still criticized.') },
    { date: '1940', title: t('Sospechas sin juicio', 'Suspicions without trial'), body: t('Sospechosos como Francis Sweeney quedan en la historia, pero no en una condena.', 'Suspects such as Francis Sweeney remain in the history, but not in a conviction.') },
  ],
  'servant-girl-annihilator': [
    { date: '1884', title: t('Primeros ataques nocturnos', 'First night attacks'), body: t('Austin registra agresiones contra mujeres en domicilios antes de que la prensa consolide el patron.', 'Austin records home attacks against women before the press consolidates the pattern.') },
    { date: '1885', title: t('Escalada publica', 'Public escalation'), body: t('Los ataques cruzan lineas raciales y de clase, aumentando panico y vigilancia.', 'The attacks cross racial and class lines, increasing panic and patrols.') },
    { date: '24 dic 1885', title: t('Doble asesinato de Navidad', 'Christmas double murder'), body: t('Los asesinatos de Susan Hancock y Eula Phillips sacuden a la ciudad.', 'The murders of Susan Hancock and Eula Phillips shake the city.') },
    { date: '1886', title: t('Detenciones fallidas', 'Failed arrests'), body: t('Varias detenciones y acusaciones no producen una identificacion fiable del asesino.', 'Several arrests and accusations fail to produce a reliable identification.') },
    { date: 'Despues', title: t('Parada sin explicacion', 'Unexplained stop'), body: t('La serie cesa sin confesion, muerte probada del autor ni sentencia definitiva.', 'The series stops without confession, proven death of the offender, or definitive sentence.') },
  ],
  'freeway-phantom': [
    { date: 'abr 1971', title: t('Carol Spinks', 'Carol Spinks'), body: t('Primera victima reconocida, hallada junto a una carretera.', 'First recognized victim, found near a road.') },
    { date: 'jul 1971', title: t('Darrelenia Johnson', 'Darrelenia Johnson'), body: t('El patron de abandono cerca de vias rapidas gana consistencia.', 'The pattern of disposal near major roads gains consistency.') },
    { date: 'sep-oct 1971', title: t('Brenda Crockett', 'Brenda Crockett'), body: t('Llamadas atribuidas a la victima y una nota firmada elevan la alarma publica.', 'Calls attributed to the victim and a signed note raise public alarm.') },
    { date: '1972', title: t('Tres victimas mas', 'Three more victims'), body: t('Nenomoshia Yates, Brenda Woodard y Diane Williams completan la serie reconocida.', 'Nenomoshia Yates, Brenda Woodard, and Diane Williams complete the recognized series.') },
    { date: 'Decadas posteriores', title: t('Caso abierto', 'Open case'), body: t('La investigacion continua marcada por perdida de evidencia, sesgos iniciales y memoria comunitaria.', 'The investigation continues under the weight of lost evidence, early biases, and community memory.') },
  ],
  'the-doodler': [
    { date: '1974', title: t('Primeros cuerpos vinculados', 'First linked bodies'), body: t('Hombres gays aparecen muertos en playas y espacios abiertos de San Francisco.', 'Gay men are found dead on beaches and open spaces in San Francisco.') },
    { date: '1974-1975', title: t('Metodo de aproximacion', 'Approach method'), body: t('Testigos describen a un hombre que dibujaba retratos antes de aislar a sus victimas.', 'Witnesses describe a man who drew portraits before isolating victims.') },
    { date: '1975', title: t('Supervivientes', 'Survivors'), body: t('Varios supervivientes aportan descripciones, pero el miedo a ser expuestos limita declaraciones publicas.', 'Several survivors provide descriptions, but fear of exposure limits public testimony.') },
    { date: '2018-2019', title: t('Reactivacion publica', 'Public reactivation'), body: t('La policia difunde nuevo material y recompensa para estimular pistas.', 'Police release renewed material and reward information to generate tips.') },
    { date: '2020s', title: t('Investigacion activa', 'Active investigation'), body: t('El caso sigue abierto con revision de evidencias y llamadas a testigos.', 'The case remains open with evidence review and calls for witnesses.') },
  ],
  'texarkana-phantom': [
    { date: '22 feb 1946', title: t('Primer ataque', 'First attack'), body: t('Jimmy Hollis y Mary Jeanne Larey sobreviven a una agresion nocturna.', 'Jimmy Hollis and Mary Jeanne Larey survive a night attack.') },
    { date: '24 mar 1946', title: t('Primer doble homicidio', 'First double murder'), body: t('Richard Griffin y Polly Ann Moore son asesinados.', 'Richard Griffin and Polly Ann Moore are murdered.') },
    { date: '14 abr 1946', title: t('Segundo doble homicidio', 'Second double murder'), body: t('Paul Martin y Betty Jo Booker son hallados muertos.', 'Paul Martin and Betty Jo Booker are found dead.') },
    { date: '3 may 1946', title: t('Ataque Stark', 'Stark attack'), body: t('Virgil Stark muere y Katie Stark sobrevive herida.', 'Virgil Stark dies and Katie Stark survives wounded.') },
    { date: '1946-1948', title: t('Sospechosos sin condena', 'Suspects without conviction'), body: t('Youell Swinney y otros nombres aparecen, pero nadie es condenado como Phantom.', 'Youell Swinney and other names appear, but no one is convicted as the Phantom.') },
  ],
  'west-mesa': [
    { date: '2001-2005', title: t('Desapariciones', 'Disappearances'), body: t('Varias mujeres desaparecen en Albuquerque en contextos de vulnerabilidad y movilidad.', 'Several women disappear in Albuquerque amid vulnerability and mobility.') },
    { date: '2006', title: t('Terreno en transformacion', 'Changing land'), body: t('El crecimiento urbano empieza a alterar el area donde estaban enterrados los restos.', 'Urban growth begins to alter the area where the remains were buried.') },
    { date: 'feb 2009', title: t('Hallazgo de restos', 'Discovery of remains'), body: t('Un vecino encuentra un hueso; la busqueda revela una fosa con once mujeres y un feto.', 'A resident finds a bone; the search reveals a grave with eleven women and a fetus.') },
    { date: '2009-2010', title: t('Identificaciones', 'Identifications'), body: t('Forenses identifican victimas y conectan desapariciones previas.', 'Forensic teams identify victims and connect prior disappearances.') },
    { date: 'Actualidad', title: t('Recompensa y caso abierto', 'Reward and open case'), body: t('La investigacion sigue activa con recompensas y sospechosos descartados o fallecidos.', 'The investigation remains active with rewards and suspects ruled out or deceased.') },
  ],
  'bible-john': [
    { date: '1968', title: t('Patricia Docker', 'Patricia Docker'), body: t('Primera victima vinculada al entorno de baile de Glasgow.', 'First victim linked to Glasgow nightlife.') },
    { date: '1969', title: t('Jemima MacDonald', 'Jemima MacDonald'), body: t('Segunda muerte atribuida dentro del patron.', 'Second death attributed within the pattern.') },
    { date: 'oct 1969', title: t('Helen Puttock', 'Helen Puttock'), body: t('El testimonio de su hermana aporta la descripcion mas conocida del sospechoso.', 'Her sister testimony provides the best-known description of the suspect.') },
    { date: '1970s', title: t('Nombre y mito', 'Name and myth'), body: t('El apodo Bible John se consolida alrededor de los comentarios religiosos atribuidos al hombre.', 'The Bible John name forms around religious comments attributed to the man.') },
    { date: '1990s-2000s', title: t('Revision ADN', 'DNA review'), body: t('Nuevas tecnicas revisan conexiones, pero no cierran la identidad.', 'New techniques review connections but do not close the identity.') },
  ],
  'monster-of-florence': [
    { date: '1968', title: t('Primer doble asesinato debatido', 'First debated double murder'), body: t('El arma se conecta despues al patron de parejas asesinadas en Toscana.', 'The weapon is later connected to the pattern of couples murdered in Tuscany.') },
    { date: '1974-1981', title: t('Reaparicion del patron', 'Pattern reappears'), body: t('Ataques a parejas consolidan la hipotesis de una misma pistola y autor.', 'Attacks on couples consolidate the same-gun and same-offender hypothesis.') },
    { date: '1982-1985', title: t('Escalada y mutilaciones', 'Escalation and mutilations'), body: t('Los crimenes incorporan mutilaciones y generan presion nacional.', 'The crimes include mutilations and generate national pressure.') },
    { date: '1990s', title: t('Juicios y piste', 'Trials and piste'), body: t('La investigacion deriva hacia teorias de autores multiples y complices.', 'The investigation turns toward theories of multiple offenders and accomplices.') },
    { date: 'Despues', title: t('Controversia persistente', 'Persistent controversy'), body: t('Condenas parciales no eliminan dudas sobre autoria completa y motivacion.', 'Partial convictions do not remove doubts about full authorship and motive.') },
  ],
  'eastbound-strangler': [
    { date: '2006', title: t('Desapariciones en Atlantic City', 'Atlantic City disappearances'), body: t('Cuatro mujeres desaparecen en un periodo breve.', 'Four women disappear within a brief period.') },
    { date: '20 nov 2006', title: t('Hallazgo conjunto', 'Joint discovery'), body: t('Los cuerpos aparecen alineados en una zanja cerca de Black Horse Pike.', 'The bodies are found aligned in a drainage ditch near Black Horse Pike.') },
    { date: '2006-2007', title: t('Perfil y escena', 'Profile and scene'), body: t('La disposicion de los cuerpos impulsa hipotesis de autor serial.', 'The arrangement of bodies drives serial-offender hypotheses.') },
    { date: 'Anios posteriores', title: t('Comparaciones regionales', 'Regional comparisons'), body: t('Se comparan casos con otras series, pero sin identificacion probatoria.', 'Cases are compared with other series, but without evidentiary identification.') },
    { date: 'Actualidad', title: t('Sin nombre publico', 'No public name'), body: t('El responsable no ha sido identificado oficialmente.', 'The offender has not been officially identified.') },
  ],
  'jeff-davis-8': [
    { date: '2005', title: t('Loretta Chaisson', 'Loretta Chaisson'), body: t('Primer cuerpo del conjunto hallado en Jefferson Davis Parish.', 'First body in the cluster found in Jefferson Davis Parish.') },
    { date: '2005-2007', title: t('Nuevas victimas', 'More victims'), body: t('La serie crece con mujeres conectadas por redes sociales, drogas, trabajo sexual o informacion policial.', 'The series grows with women connected through social networks, drugs, sex work, or police information.') },
    { date: '2008-2009', title: t('Ultimos hallazgos', 'Final discoveries'), body: t('Los ultimos cuerpos refuerzan la idea de patron, aunque no todos aceptan un unico asesino.', 'The last bodies reinforce the pattern idea, though not everyone accepts one killer.') },
    { date: 'Investigacion', title: t('Task force y conflicto', 'Task force and conflict'), body: t('El caso queda atravesado por rumores de corrupcion, informantes y errores institucionales.', 'The case is crossed by rumors of corruption, informants, and institutional failures.') },
    { date: 'Actualidad', title: t('Sin condenas por la serie', 'No convictions for the series'), body: t('No hay una condena que explique las ocho muertes como expediente cerrado.', 'There is no conviction explaining the eight deaths as a closed file.') },
  ],
  'chicago-strangler': [
    { date: '2001', title: t('Inicio del periodo revisado', 'Start of reviewed period'), body: t('Analisis publicos situan desde 2001 numerosos homicidios de mujeres por estrangulamiento o asfixia.', 'Public analyses place many strangulation or asphyxiation murders of women from 2001 onward.') },
    { date: '2000s', title: t('Victimas vulnerables', 'Vulnerable victims'), body: t('Muchas victimas son mujeres negras o trabajadoras sexuales, con investigaciones desiguales.', 'Many victims are Black women or sex workers, with uneven investigations.') },
    { date: '2010s', title: t('Patron estadistico', 'Statistical pattern'), body: t('Periodistas y analistas detectan agrupaciones por metodo, zona y perfil.', 'Journalists and analysts detect clusters by method, area, and profile.') },
    { date: '2019', title: t('Atencion publica', 'Public attention'), body: t('La posibilidad de uno o varios asesinos seriales recibe cobertura nacional.', 'The possibility of one or several serial killers receives national coverage.') },
    { date: 'Actualidad', title: t('No consolidado oficialmente', 'Not officially consolidated'), body: t('La policia no presenta todo el patron como un unico caso cerrado.', 'Police do not present the whole pattern as one closed case.') },
  ],
  'chillicothe-six': [
    { date: '2014', title: t('Primeras desapariciones', 'First disappearances'), body: t('Mujeres vinculadas a circulos comunes empiezan a desaparecer en Ross County.', 'Women linked through overlapping circles begin disappearing in Ross County.') },
    { date: '2014-2015', title: t('Hallazgos y muertes', 'Discoveries and deaths'), body: t('Algunas mujeres son halladas muertas y otras permanecen desaparecidas.', 'Some women are found dead and others remain missing.') },
    { date: '2015', title: t('Presion comunitaria', 'Community pressure'), body: t('Familias y medios locales piden respuestas ante el patron percibido.', 'Families and local media demand answers over the perceived pattern.') },
    { date: '2016+', title: t('Resoluciones parciales', 'Partial resolutions'), body: t('Algunos expedientes avanzan individualmente, sin cerrar la teoria de conjunto.', 'Some files progress individually without closing the broader theory.') },
    { date: 'Actualidad', title: t('Lectura caso por caso', 'Case-by-case reading'), body: t('La interpretacion mas prudente separa cada muerte de una afirmacion serial unica.', 'The most careful reading separates each death from a single serial claim.') },
  ],
  'gilgo-beach-unresolved': [
    { date: '1996', title: t('Fire Island', 'Fire Island'), body: t('El hallazgo parcial de restos abre una linea que despues se relaciona con el expediente amplio.', 'Partial remains open a line later related to the wider file.') },
    { date: '2000s', title: t('Manorville y Ocean Parkway', 'Manorville and Ocean Parkway'), body: t('Restos e identidades aparecen fragmentados en distintos lugares de Long Island.', 'Remains and identities appear fragmented across Long Island locations.') },
    { date: 'dic 2010', title: t('Gilgo Four', 'Gilgo Four'), body: t('La busqueda de Shannan Gilbert revela cuatro cuerpos cerca de Ocean Parkway.', 'The search for Shannan Gilbert reveals four bodies near Ocean Parkway.') },
    { date: '2011', title: t('Mas restos', 'More remains'), body: t('Se localizan mas restos, ampliando la complejidad del expediente.', 'More remains are located, widening the complexity of the file.') },
    { date: '2023+', title: t('Arresto y proceso', 'Arrest and process'), body: t('El proceso contra Rex Heuermann resuelve parte de la investigacion, pero no toda la constelacion de restos.', 'The case against Rex Heuermann resolves part of the investigation, but not the entire constellation of remains.') },
  ],
}

export function getCaseDetails(slug: string) {
  return details[slug]
}

export function getCaseTimeline(slug: string) {
  return [...(details[slug]?.timeline ?? []), ...(supplementalTimeline[slug] ?? [])]
}

export function localizeText(text: LocalizedText, locale: Locale) {
  return text[locale]
}
