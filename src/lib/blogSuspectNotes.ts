import type { Locale } from './i18n'

type LocalizedText = {
  es: string
  en: string
}

export type SuspectNote = {
  name: string
  status: LocalizedText
  basis: LocalizedText
  limits: LocalizedText
  source?: string
}

const t = (es: string, en: string): LocalizedText => ({ es, en })

const notes: Record<string, SuspectNote[]> = {
  zodiac: [
    { name: 'Arthur Leigh Allen', status: t('Sospechoso recurrente; nunca acusado', 'Recurring suspect; never charged'), basis: t('Fue investigado por policia y aparece en teorias publicas por proximidad, conducta y declaraciones de terceros.', 'Investigated by police and present in public theories because of proximity, behavior, and third-party statements.'), limits: t('Huellas, escritura y ADN parcial no produjeron una identificacion judicial definitiva.', 'Prints, handwriting, and partial DNA did not produce definitive judicial identification.') },
  ],
  'jack-the-ripper': [
    { name: 'Montague John Druitt / Aaron Kosminski / otros nombres historicos', status: t('Sospechosos historicos, ninguno probado', 'Historic suspects, none proved'), basis: t('Aparecen en memorias policiales, documentos posteriores y literatura ripperologica.', 'Appear in police memoirs, later documents, and Ripper literature.'), limits: t('No existe prueba fisica o judicial que cierre la identidad.', 'No physical or judicial proof closes the identity.') },
  ],
  'cleveland-torso': [
    { name: 'Francis E. Sweeney', status: t('Persona de interes historica', 'Historic person of interest'), basis: t('Medico con conocimientos anatomicos, investigado por Eliot Ness segun reconstrucciones historicas.', 'Doctor with anatomical knowledge, investigated by Eliot Ness according to historical reconstructions.'), limits: t('No fue acusado ni condenado; los archivos oficiales se perdieron o desaparecieron.', 'He was not charged or convicted; official files were lost or disappeared.') },
    { name: 'Frank Dolezal', status: t('Acusado discutido; murio bajo custodia', 'Disputed accused man; died in custody'), basis: t('Vinculos con algunas victimas y una confesion cuestionada.', 'Links to some victims and a disputed confession.'), limits: t('La confesion se considera problematica y murio antes de juicio con lesiones bajo custodia.', 'The confession is considered problematic and he died before trial with injuries in custody.') },
  ],
  'servant-girl-annihilator': [
    { name: 'Nathan Elgin', status: t('Sospechoso propuesto por investigaciones modernas', 'Suspect proposed by modern investigations'), basis: t('Proximidad a escenas y coincidencia con una huella descrita en investigaciones modernas.', 'Proximity to scenes and possible match with a footprint described in modern investigations.'), limits: t('Murio en 1886; no existe proceso judicial ni prueba concluyente.', 'Died in 1886; no trial or conclusive proof exists.') },
  ],
  'freeway-phantom': [
    { name: 'Robert Askins', status: t('Sospechoso historico; no acusado por la serie', 'Historic suspect; not charged for the series'), basis: t('Detectives posteriores lo examinaron por historial violento y una palabra inusual de la nota.', 'Later detectives examined him because of violent history and an unusual word in the note.'), limits: t('No hubo cargos; evidencia fisica clave se perdio o destruyo.', 'No charges followed; key physical evidence was lost or destroyed.') },
  ],
  'the-doodler': [
    { name: 'Sospechoso detenido en 1976 no identificado publicamente', status: t('Detenido; no acusado', 'Detained; not charged'), basis: t('Relacionado con descripciones de supervivientes y retratos forenses.', 'Related to survivor descriptions and forensic sketches.'), limits: t('La falta de testimonio publico y pruebas suficientes impidio una acusacion.', 'Lack of public testimony and sufficient evidence prevented charges.') },
  ],
  'texarkana-phantom': [
    { name: 'Youell Swinney', status: t('Sospechoso historico; no condenado como Phantom', 'Historic suspect; not convicted as the Phantom'), basis: t('Sospechas policiales y declaraciones indirectas lo mantuvieron en la historia del caso.', 'Police suspicions and indirect statements kept him in case history.'), limits: t('No hubo condena por los asesinatos; parte de la informacion es indirecta.', 'There was no conviction for the murders; part of the information is indirect.') },
  ],
  'west-mesa': [
    { name: 'Lorenzo Montoya', status: t('Sospechoso fallecido; no acusado', 'Deceased suspect; not charged'), basis: t('Vivio cerca de la zona de enterramiento y fue citado en cobertura publica como una de las lineas mas fuertes por proximidad geografica y antecedentes violentos.', 'Lived near the burial area and was cited in public coverage as one of the stronger lines because of geographic proximity and violent history.'), limits: t('Murio antes del hallazgo de 2009; pruebas posteriores, incluido ADN descrito en cobertura publica, no establecieron un vinculo definitivo con las once victimas.', 'Died before the 2009 discovery; later testing, including DNA described in public coverage, did not establish a definitive link to the eleven victims.'), source: 'Unresolved: West Mesa Bone Collector Part Three' },
    { name: 'Fred Reynolds', status: t('Investigado publicamente; fallecido; no acusado', 'Publicly investigated; deceased; not charged'), basis: t('Fue relacionado publicamente con el entorno de prostitucion/escort de Albuquerque y con algunas mujeres desaparecidas o asesinadas.', 'Was publicly connected to Albuquerque prostitution/escort circles and to some missing or murdered women.'), limits: t('La cobertura publica lo trata como linea revisada, no como autor probado; murio en enero de 2009 y no existe acusacion judicial que cierre la serie.', 'Public coverage treats him as a reviewed line, not a proved offender; he died in January 2009 and no judicial charge closes the series.'), source: 'Unresolved: West Mesa Bone Collector Part Three' },
    { name: 'Ron Erwin', status: t('Investigado por fotografias; descartado en cobertura publica', 'Investigated over photographs; publicly cleared as a lead'), basis: t('La policia reviso fotografias halladas en su coleccion y fechas de viaje que inicialmente parecian relevantes.', 'Police reviewed photographs found in his collection and travel dates that initially appeared relevant.'), limits: t('Segun reconstrucciones publicas, algunas mujeres fotografiadas fueron identificadas con vida o sin relacion con West Mesa, y las coartadas lo situaban lejos de Albuquerque en fechas clave.', 'According to public reconstructions, some photographed women were identified alive or unrelated to West Mesa, and alibis placed him away from Albuquerque on key dates.'), source: 'Unresolved: West Mesa Bone Collector Part Three' },
    { name: 'Joseph Blea', status: t('Sospechoso citado publicamente; no acusado por West Mesa', 'Publicly cited suspect; not charged for West Mesa'), basis: t('Aparece en cobertura publica posterior como uno de los nombres que siguieron en el radar junto a Montoya.', 'Appears in later public coverage as one of the names that remained on the radar alongside Montoya.'), limits: t('No hay acusacion publica que lo vincule judicialmente a las once victimas del enterramiento de 118th Street.', 'No public charge judicially links him to the eleven victims in the 118th Street burial site.'), source: 'Unresolved: West Mesa Bone Collector Part Three' },
  ],
  'bible-john': [
    { name: 'Peter Tobin y otros comparados', status: t('Comparaciones posteriores; no identificacion oficial', 'Later comparisons; no official identification'), basis: t('Similitudes debatidas con crimenes posteriores y reconstrucciones de testigos.', 'Debated similarities with later crimes and witness reconstructions.'), limits: t('No existe cierre oficial que identifique a Bible John.', 'There is no official closure identifying Bible John.') },
  ],
  'monster-of-florence': [
    { name: 'Pietro Pacciani y los “compagni di merende”', status: t('Procesos y condenas discutidas', 'Trials and disputed convictions'), basis: t('Investigacion judicial italiana centro parte del caso en Pacciani y supuestos complices.', 'The Italian judicial investigation centered part of the case on Pacciani and alleged accomplices.'), limits: t('El expediente sigue discutido por autoria completa, arma, movil y terceros.', 'The file remains disputed over full authorship, weapon, motive, and third parties.') },
  ],
  'eastbound-strangler': [
    { name: 'Sin sospechoso publico confirmado', status: t('No identificado', 'Unidentified'), basis: t('El patron de disposicion de cuerpos sugiere control, pero no un nombre probado.', 'The body arrangement suggests control, but not a proved name.'), limits: t('Comparaciones con otros casos no han producido identificacion oficial.', 'Comparisons with other cases have not produced official identification.') },
  ],
  'jeff-davis-8': [
    { name: 'Multiples hipotesis locales', status: t('Sin acusado por la serie', 'No accused person for the series'), basis: t('Las victimas compartian redes y algunas fueron informantes, lo que amplio las teorias.', 'The victims shared networks and some were informants, widening theories.'), limits: t('No hay una version judicial que cierre las ocho muertes.', 'There is no judicial version closing all eight deaths.') },
  ],
  'chicago-strangler': [
    { name: 'Patron no consolidado oficialmente', status: t('No hay sospechoso unico publico', 'No single public suspect'), basis: t('Analisis de metodo, lugar y victimas sugieren posibles agrupaciones.', 'Analysis of method, place, and victims suggests possible clusters.'), limits: t('La policia no une todos los casos como una sola serie.', 'Police do not join all cases as one series.') },
  ],
  'chillicothe-six': [
    { name: 'Sin sospechoso unico nombrado para las seis', status: t('Resoluciones parciales y dudas abiertas', 'Partial resolutions and open doubts'), basis: t('Algunos expedientes tuvieron lineas individuales; el patron completo sigue discutido y las fuentes publicas separan casos abiertos, muertes y desapariciones.', 'Some files had individual lines; the full pattern remains disputed and public sources separate open cases, deaths, and disappearances.'), limits: t('No hay una prueba unica que convierta los seis casos en una sola serie cerrada; fuentes como Charley Project senalan especulacion serial, pero no sospechosos nombrados para todos los casos.', 'No single proof turns the six cases into one closed series; sources such as Charley Project note serial speculation, but no named suspect for all cases.'), source: 'Charley Project / fuentes locales descargadas' },
  ],
  'gilgo-beach-unresolved': [
    { name: 'Rex Heuermann', status: t('Acusado/condenado o admitido en parte del expediente; no explica todo el conjunto', 'Charged/convicted or admitted in part of the file; does not explain the whole set'), basis: t('Telefonia, ADN y objetos sostienen parte del proceso publico.', 'Phone data, DNA, and objects support part of the public case.'), limits: t('El paraguas Gilgo/LISK incluye restos y preguntas no cerradas por una sola respuesta.', 'The Gilgo/LISK umbrella includes remains and questions not closed by one answer.') },
  ],
}

export function getSuspectNotes(slug: string) {
  return notes[slug] ?? []
}

export function localizeSuspectNote(note: SuspectNote, locale: Locale) {
  return {
    name: note.name,
    status: note.status[locale],
    basis: note.basis[locale],
    limits: note.limits[locale],
    source: note.source,
  }
}
