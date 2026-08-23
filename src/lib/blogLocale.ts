import { Locale, blogPath } from './i18n'
import type { UnsolvedSerialCase } from './unsolvedSerialCases'

type LocalizedCaseOverride = {
  title: string
  subtitle: string
  location: string
  victims: string
  status: string
  summary: string
}

export const blogUiCopy = {
  es: {
    metaDescription: 'Blog de White Mirror Lab: tecnologia, cultura digital, investigacion y expedientes especiales.',
    eyebrow: 'Blog',
    title: 'Ideas, investigaciones y expedientes especiales.',
    lead:
      'Un archivo editorial para publicar analisis, historias, tecnologia, cultura digital y series documentales. Esta primera coleccion reune expedientes de crimen no resuelto con material descargable cuando existe dossier.',
    stats: ['Articulos', 'Series especiales', 'Dossiers opcionales'],
    indexLabel: 'Indice de articulos',
    introEyebrow: 'Serie destacada',
    introTitle: 'Expedientes criminales: casos cerrados por el tiempo, no por la verdad.',
    introText:
      'La seleccion mezcla casos historicos, expedientes activos y series modernas donde la atribucion sigue siendo discutida. Cuando una conexion no esta confirmada oficialmente, queda marcada como tal.',
    place: 'Lugar',
    status: 'Estado',
    victims: 'Victimas',
    period: 'Periodo',
    archive: 'Archivo',
    readArticle: 'Leer articulo',
    downloadZip: 'Comprar pruebas',
    ageGate: 'Confirmo que tengo 18 anos o mas y acepto acceder a material documental de crimen real.',
    backToBlog: 'Volver al blog',
    downloadHint: 'ZIP con pruebas reales descargadas de fuentes publicas verificables. Pago unico de {price}.',
    archiveIncludes: 'Material del expediente',
    timeline: 'Linea temporal',
    extendedInfo: 'Informacion ampliada',
    victimScenes: 'Victimas y escenas',
    nextCase: 'Siguiente expediente',
    notFoundTitle: 'Articulo no encontrado | White Mirror Lab',
  },
  en: {
    metaDescription: 'White Mirror Lab blog: technology, digital culture, investigations, and special files.',
    eyebrow: 'Blog',
    title: 'Ideas, investigations, and special files.',
    lead:
      'An editorial archive for analysis, stories, technology, digital culture, and documentary series. This first collection gathers unresolved-crime files with downloadable evidence when a dossier exists.',
    stats: ['Articles', 'Special series', 'Optional dossiers'],
    indexLabel: 'Article index',
    introEyebrow: 'Featured series',
    introTitle: 'Crime files: cases closed by time, not by truth.',
    introText:
      'The selection mixes historic cold cases, active files, and modern clusters where attribution remains disputed. When a connection is not officially confirmed, the article says so plainly.',
    place: 'Location',
    status: 'Status',
    victims: 'Victims',
    period: 'Period',
    archive: 'Archive',
    readArticle: 'Read article',
    downloadZip: 'Buy evidence',
    ageGate: 'I confirm I am 18 or older and agree to access real-crime documentary material.',
    backToBlog: 'Back to blog',
    downloadHint: 'ZIP with real evidence downloaded from verifiable public sources. One-time payment of {price}.',
    archiveIncludes: 'Case-file material',
    timeline: 'Timeline',
    extendedInfo: 'Extended information',
    victimScenes: 'Victims and scenes',
    nextCase: 'Next case file',
    notFoundTitle: 'Article not found | White Mirror Lab',
  },
} as const

const englishOverrides: Record<string, LocalizedCaseOverride> = {
  zodiac: {
    title: 'The Zodiac Killer',
    subtitle: 'The case that turned letters, ciphers, and headlines into a second crime scene.',
    location: 'San Francisco Bay Area, California',
    victims: '5 confirmed; the killer claimed more',
    status: 'Identity unknown',
    summary:
      'The Zodiac Killer attacked couples and motorists in Northern California and maintained notoriety through letters and ciphers sent to newspapers.',
  },
  'jack-the-ripper': {
    title: 'Jack the Ripper',
    subtitle: 'Five canonical murders, thousands of suspicions, and an identity that never reached court.',
    location: 'Whitechapel, London',
    victims: '5 canonical victims; others possible',
    status: 'Never caught',
    summary:
      'The Whitechapel murderer killed vulnerable women in Victorian London and became entangled in press panic, false letters, and social prejudice.',
  },
  'cleveland-torso': {
    title: 'The Cleveland Torso Killer',
    subtitle: 'Unnamed bodies, Depression-era Cleveland, and Eliot Ness without a closed case.',
    location: 'Cleveland, Ohio',
    victims: 'At least 12-13',
    status: 'No official identification',
    summary:
      'The Kingsbury Run murders involved dismembered victims, many of them unidentified, and no person was ever convicted as the killer.',
  },
  'servant-girl-annihilator': {
    title: 'The Servant Girl Annihilator',
    subtitle: 'Austin before modern criminology: axes, public panic, and a series that stopped without explanation.',
    location: 'Austin, Texas',
    victims: '8 killed; several survivors',
    status: 'Unsolved',
    summary:
      'Before Jack the Ripper, Austin suffered a series of nighttime attacks against women, a child, and couples. Responsibility was never proved.',
  },
  'freeway-phantom': {
    title: 'The Freeway Phantom',
    subtitle: 'Six Black girls murdered around Washington, D.C., and a city that looked too late.',
    location: 'Washington, D.C. and Maryland',
    victims: '6 recognized victims',
    status: 'Open case',
    summary:
      'The Freeway Phantom abducted and murdered six Black girls and young women whose bodies were found near roads around Washington, D.C.',
  },
  'the-doodler': {
    title: 'The Doodler',
    subtitle: 'The killer who used sketches to approach gay men in San Francisco.',
    location: 'San Francisco, California',
    victims: '5-6 linked victims',
    status: 'Active investigation',
    summary:
      'The Doodler targeted gay men after meeting them in bars or diners. Survivors helped create sketches, but the case never reached trial.',
  },
  'texarkana-phantom': {
    title: 'The Texarkana Phantom Killer',
    subtitle: 'Night attacks, young couples, and a frightened community before modern serial-killer language existed.',
    location: 'Texarkana, Texas-Arkansas',
    victims: '5 killed; 3 wounded',
    status: 'Never convicted',
    summary:
      'The Phantom Killer attacked mainly young couples in 1946. The FBI preserved files, but no one was convicted.',
  },
  'west-mesa': {
    title: 'The West Mesa Bone Collector',
    subtitle: 'Eleven women buried in Albuquerque and a killer who may have hidden behind social neglect.',
    location: 'Albuquerque, New Mexico',
    victims: '11 women and one fetal victim',
    status: 'Unsolved; active reward',
    summary:
      'In 2009, a mass grave revealed the remains of women who had disappeared years earlier. Police consider the case the work of an unidentified serial killer.',
  },
  'bible-john': {
    title: 'Bible John',
    subtitle: 'Three women left Glasgow’s Barrowland Ballroom; the man in the taxi was never identified.',
    location: 'Glasgow, Scotland',
    victims: '3 attributed victims',
    status: 'Unsolved',
    summary:
      'Bible John is the name given to a suspected serial killer linked to Patricia Docker, Jemima MacDonald, and Helen Puttock after nights out in Glasgow.',
  },
  'monster-of-florence': {
    title: 'The Monster of Florence',
    subtitle: 'Eight double murders, a .22 Beretta, and decades of trials that did not end the doubt.',
    location: 'Tuscany, Italy',
    victims: '16',
    status: 'Disputed; widely considered unresolved',
    summary:
      'The Monster of Florence targeted couples in the Tuscan countryside. There were related convictions, but the full identity and structure of the case remain disputed.',
  },
  'eastbound-strangler': {
    title: 'The Eastbound Strangler',
    subtitle: 'Four women found in an Atlantic City ditch and a spatial signature that still has no name.',
    location: 'Atlantic City and Egg Harbor Township, New Jersey',
    victims: '4',
    status: 'Unsolved',
    summary:
      'In November 2006, Kim Raffo, Barbara Breidor, Molly Dilts, and Tracy Ann Roberts were found near Black Horse Pike. The killer has not been identified.',
  },
  'jeff-davis-8': {
    title: 'The Jeff Davis 8',
    subtitle: 'Eight women dead in a Louisiana parish and a question darker than the bayou.',
    location: 'Jennings, Louisiana',
    victims: '8',
    status: 'Unsolved; single-killer theory disputed',
    summary:
      'Between 2005 and 2009, eight interconnected women were found dead in Jefferson Davis Parish. No one has been convicted for the series.',
  },
  'chicago-strangler': {
    title: 'The Chicago Strangler Pattern',
    subtitle: 'Dozens of women strangled or smothered and a statistical warning police have not closed as one series.',
    location: 'Chicago, Illinois',
    victims: 'Dozens reviewed; serial link not officially confirmed',
    status: 'Unresolved as a possible pattern',
    summary:
      'Data and reporting have highlighted a pattern of women strangled or smothered in Chicago since 2001, with many cases unsolved.',
  },
  'chillicothe-six': {
    title: 'The Chillicothe Six',
    subtitle: 'Women missing or murdered in Ohio and a possible series that resists a single answer.',
    location: 'Chillicothe, Ohio',
    victims: '6 women missing or murdered; serial link unproven',
    status: 'Open cases and partial resolutions',
    summary:
      'Between 2014 and 2015, six women tied to overlapping circles disappeared or were found dead around Chillicothe. The serial theory remains unsettled.',
  },
  'gilgo-beach-unresolved': {
    title: 'Gilgo Beach: What Remains Open',
    subtitle: 'A case with a confessed killer for several deaths, but not a complete answer for every set of remains.',
    location: 'Long Island, New York',
    victims: '11 sets of remains in the wider investigation; several admissions and unresolved questions',
    status: 'Partly resolved; some findings remain debated',
    summary:
      'Rex Heuermann was convicted after admitting multiple Long Island murders, but the wider Gilgo Beach investigation still contains disputed circumstances and remaining questions.',
  },
}

export function caseHref(locale: Locale, slug: string) {
  return `${blogPath(locale)}/${slug}`
}

export function getLocalizedCase(caseFile: UnsolvedSerialCase, locale: Locale) {
  if (locale === 'es') return caseFile

  const override = englishOverrides[caseFile.slug]
  if (!override) return caseFile

  return {
    ...caseFile,
    ...override,
    article: [
      {
        heading: 'What is known',
        paragraphs: [
          override.summary,
          `The public record places this case in ${override.location}, during ${caseFile.activeYears}. The victim count is listed as ${override.victims}.`,
        ],
      },
      {
        heading: 'Why it remains open',
        paragraphs: [
          `Current status: ${override.status}. The available record does not support a clean final identification for the whole file, so the article treats speculation separately from documented evidence.`,
          'Modern reassessments often depend on preserved evidence, witness memory, jurisdictional cooperation, and whether vulnerable victims were investigated with urgency when the crimes first occurred.',
        ],
      },
      {
        heading: 'How to read the archive',
        paragraphs: [
          'The downloadable ZIP is an original White Mirror Lab dossier. It summarizes the case, lists public sources, and points readers back to the original archives or reporting instead of republishing protected photographs or newspaper scans.',
        ],
      },
    ],
    archiveNotes: [
      'English case summary and key facts.',
      'Timeline and context notes.',
      'Public-source links for further reading.',
      'Clear separation between confirmed facts and disputed theories.',
    ],
  }
}
