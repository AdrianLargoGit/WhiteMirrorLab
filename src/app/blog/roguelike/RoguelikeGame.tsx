'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Locale } from '@/lib/i18n'
import styles from './roguelike.module.css'

type Tile = 0 | 1 | 5 | 6 | 7
type Point = { x: number; y: number }
type EnemyKind = 'crawler' | 'sentinel' | 'oracle' | 'warden' | 'duelist' | 'brute' | 'stalker' | 'chemist' | 'mirror' | 'blind'
type ItemKind = 'heart' | 'shard' | 'flare' | 'key'
type UpgradeId = 'edge' | 'heart' | 'shell' | 'flare' | 'sight' | 'vampire' | 'longbow' | 'hammer' | 'rapier' | 'boots' | 'magnet' | 'battery' | 'barrier' | 'executioner'
type Phase = 'playing' | 'upgrade' | 'won' | 'dead'
type Skin = 'mirror' | 'ember' | 'neon' | 'void'
type Weapon = 'blade' | 'spear' | 'staff' | 'hammer' | 'claws'
type Fx = { id: string; kind: 'slash' | 'burst' | 'float'; x: number; y: number; tx?: number; ty?: number; text?: string; color: string; born: number }
type Enemy = Point & { id: string; kind: EnemyKind; hp: number; maxHp: number; damage: number; alert: number }
type Item = Point & { id: string; kind: ItemKind }
type ArticleRoom = { x: number; y: number; w: number; h: number; lines: string[] }
type Player = Point & {
  hp: number
  maxHp: number
  attack: number
  armor: number
  shards: number
  keys: number
  flares: number
  sight: number
  vampire: number
  score: number
  weapon: Weapon
  range: number
  speed: number
  magnet: number
  upgradesTaken: UpgradeId[]
}
type LogLine = { id: number; text: string }
type FloorMemory = {
  level: number
  seed: number
  width: number
  height: number
  tiles: Tile[]
  seen: boolean[]
  enemies: Enemy[]
  items: Item[]
  exit: Point
  backExit: Point | null
  articleRooms: ArticleRoom[]
}
type Game = {
  level: number
  seed: number
  width: number
  height: number
  tiles: Tile[]
  seen: boolean[]
  player: Player
  enemies: Enemy[]
  items: Item[]
  exit: Point
  backExit: Point | null
  phase: Phase
  log: LogLine[]
  turn: number
  secret: boolean
  upgrades: UpgradeId[]
  articleRooms: ArticleRoom[]
  clearedFloors: number[]
  maxLevelReached: number
  floorMemory: Record<string, FloorMemory>
}
type Profile = { id: string; name: string; skin: Skin }
type LeaderboardEntry = { id: string; name: string; points: number; floor: number; at: number }
type RenderState = { vx: number; vy: number; ready: boolean }

const finalLevel = 12
const saveKey = 'wml-mirror-article-roguelike-v1'
const playerIdKey = 'wml-mirror-roguelike-player'
const profileKey = 'wml-mirror-roguelike-profile'
const tileSize = 26
const baseMoveSpeed = 1.75
const moveCooldownMs = 92
const autoAttackMs = 430
const skins: Skin[] = ['mirror', 'ember', 'neon', 'void']

const copy = {
  es: {
    title: 'Mirror Descent',
    subtitle: 'Roguelike tactico online',
    hp: 'vida',
    floor: 'planta',
    points: 'puntos',
    name: 'nombre',
    skin: 'skin',
    ranking: 'ranking',
    shards: 'fragmentos',
    keys: 'llaves',
    flares: 'bengalas',
    attack: 'ataque',
    weapon: 'arma',
    upgrades: 'mejoras',
    armor: 'armadura',
    restart: 'reiniciar',
    newRun: 'nueva partida',
    controls: 'Mantener flechas/WASD o usar tactil: moverte · ataque automatico · Espacio: bengala radial · portal verde avanza · portal azul vuelve.',
    dead: 'Has caido. El laberinto recuerda tus pasos.',
    won: 'Has abierto el espejo final.',
    secret: 'RECOMPENSA FINAL: llegaste al articulo que casi nadie termina. Codigo WML-CAPITAL-ADLESS.',
    choose: 'Elige una mejora',
    dungeon: 'laberinto',
    saveProfile: 'guardar',
    none: 'ninguna',
  },
  en: {
    title: 'Mirror Descent',
    subtitle: 'Online tactical roguelike',
    hp: 'hp',
    floor: 'floor',
    points: 'points',
    name: 'name',
    skin: 'skin',
    ranking: 'ranking',
    shards: 'shards',
    keys: 'keys',
    flares: 'flares',
    attack: 'attack',
    weapon: 'weapon',
    upgrades: 'upgrades',
    armor: 'armor',
    restart: 'restart',
    newRun: 'new run',
    controls: 'Hold arrows/WASD or use touch: move · automatic attack · Space: radial flare · green portal advances · blue portal returns.',
    dead: 'You fell. The labyrinth remembers your steps.',
    won: 'You opened the final mirror.',
    secret: 'FINAL REWARD: you reached the article almost nobody finishes. Code WML-CAPITAL-ADLESS.',
    choose: 'Choose an upgrade',
    dungeon: 'dungeon',
    saveProfile: 'save',
    none: 'none',
  },
} satisfies Record<Locale, Record<string, string>>

const upgrades = {
  edge: { es: ['Filo de vidrio', '+2 ataque permanente'], en: ['Glass edge', '+2 permanent attack'] },
  heart: { es: ['Corazon doble', '+8 vida maxima y cura'], en: ['Double heart', '+8 max hp and heal'] },
  shell: { es: ['Capa opaca', '+1 armadura permanente'], en: ['Opaque shell', '+1 permanent armor'] },
  flare: { es: ['Bolsa de bengalas', '+3 bengalas'], en: ['Flare pouch', '+3 flares'] },
  sight: { es: ['Ojo editorial', '+1 vision permanente'], en: ['Editorial eye', '+1 permanent sight'] },
  vampire: { es: ['Tinta vampira', 'Curacion al derrotar enemigos'], en: ['Vampire ink', 'Heal when defeating enemies'] },
  longbow: { es: ['Arco largo', 'Arma a distancia: rango 4'], en: ['Longbow', 'Ranged weapon: range 4'] },
  hammer: { es: ['Martillo pesado', 'Mucho dano cuerpo a cuerpo'], en: ['Heavy hammer', 'High melee damage'] },
  rapier: { es: ['Estoque vivo', 'Preciso: +2 ataque y critico cercano'], en: ['Living rapier', 'Precise: +2 attack and close crit'] },
  boots: { es: ['Botas de sala', '+1 armadura y +1 vision'], en: ['Room boots', '+1 armor and +1 sight'] },
  magnet: { es: ['Iman de botin', 'Recoge premios cercanos'], en: ['Loot magnet', 'Collect nearby rewards'] },
  battery: { es: ['Bateria de bengala', 'Bengalas hacen mas dano'], en: ['Flare battery', 'Flares deal more damage'] },
  barrier: { es: ['Pantalla rota', '+2 armadura si bajas de media vida'], en: ['Broken screen', '+2 armor under half hp'] },
  executioner: { es: ['Firma final', 'Mas puntos y botin al rematar'], en: ['Final signature', 'More points and loot on kills'] },
} satisfies Record<UpgradeId, Record<Locale, [string, string]>>

const floorArticles = [
  {
    title: 'Como ganar dinero online sin humo',
    lines: [
      'El dinero online no empieza con una idea brillante, empieza con una oferta concreta.',
      'Vende un resultado pequeno: ahorrar una hora, conseguir un cliente, ordenar un proceso.',
      'El primer negocio digital bueno suele ser feo: servicio manual, precio claro, entrega excelente.',
      'Haz una pagina simple, escribe a veinte personas al dia y mide respuestas, no aplausos.',
      'Cuando tres clientes paguen por lo mismo, convierte tu metodo en plantilla, producto o suscripcion.',
      'La riqueza no llega por perseguir tendencias, llega por repetir un sistema que ya demostro demanda.',
    ],
  },
  {
    title: 'Crear una empresa legalmente',
    lines: [
      'Antes de crear una sociedad, valida si necesitas sociedad o si basta operar como autonomo al inicio.',
      'Separa desde el dia uno la cuenta personal y la cuenta del proyecto.',
      'Define actividad, facturacion prevista, responsabilidad y socios antes de elegir forma legal.',
      'Guarda contratos, facturas, politicas, consentimientos y justificantes como si fueran parte del producto.',
      'Un gestor bueno no es gasto: es seguro contra multas, retrasos y decisiones fiscales improvisadas.',
      'La empresa seria empieza cuando puedes explicar que vendes, a quien cobras y que obligaciones cumples.',
    ],
  },
  {
    title: 'Pagar menos impuestos legalmente',
    lines: [
      'Pagar menos no significa ocultar: significa planificar antes de que termine el trimestre.',
      'Deduce solo gastos reales, necesarios para la actividad y bien documentados.',
      'Anticipa inversiones utiles, revisa amortizaciones y evita mezclar caprichos con operaciones.',
      'Si ganas bien, planifica salario, dividendos, reservas y reinversion con asesoria profesional.',
      'La ventaja fiscal mas poderosa casi siempre es el orden: fechas, facturas y caja prevista.',
      'Lo ilegal puede parecer rentable una semana; lo legal y medido protege anos de crecimiento.',
    ],
  },
  {
    title: 'Trucos sobrios de gente rica',
    lines: [
      'Los millonarios no preguntan solo cuanto cuesta; preguntan que flujo de caja produce.',
      'Compran tiempo cuando el tiempo comprado crea mas valor que el dinero gastado.',
      'Evitan deuda de consumo y aceptan deuda productiva solo cuando entienden el riesgo.',
      'Negocian contratos, no esperanzas: plazos, garantias, salida, propiedad intelectual y penalizaciones.',
      'Hacen menos apuestas, pero las documentan mejor y las revisan con frialdad.',
      'La ventaja no es tener secretos; es ejecutar fundamentos aburridos durante mas tiempo.',
    ],
  },
  {
    title: 'Marca personal que vende',
    lines: [
      'Publicar no es hablar de ti: es demostrar criterio ante un problema especifico.',
      'Elige un enemigo intelectual: caos, perdida de tiempo, mala gestion, promesas falsas.',
      'Cuenta casos, numeros, errores y antes-despues; la autoridad nace de pruebas.',
      'Cada articulo debe terminar en una accion concreta que acerque al lector a comprarte.',
      'La confianza sube cuando dices tambien para quien no es tu producto.',
      'Una marca buena no grita; reduce la duda justo antes de la compra.',
    ],
  },
  {
    title: 'Sistemas para escalar',
    lines: [
      'Escalar no es contratar rapido: es convertir decisiones repetidas en procesos claros.',
      'Documenta como se vende, entrega, cobra, atiende y corrige antes de delegar.',
      'Mide pocas cosas: margen, recurrencia, coste de adquirir cliente, satisfaccion y caja.',
      'Automatiza solo cuando el proceso manual ya funciona y se repite sin drama.',
      'Una empresa escala cuando el fundador deja de ser cuello de botella y sigue subiendo la calidad.',
      'El sistema ideal libera energia para pensar, no para apagar incendios.',
    ],
  },
  {
    title: 'Negociacion de alto nivel',
    lines: [
      'En una negociacion gana quien entiende mejor los miedos de la otra parte.',
      'Prepara tres precios, tres concesiones y una salida digna antes de entrar.',
      'No regales descuento: cambialo por plazo, volumen, testimonio, pago anticipado o menor alcance.',
      'El silencio despues de una propuesta seria vale mas que justificarla de inmediato.',
      'Una oferta premium necesita riesgo reducido: garantia, hitos, entregables y claridad.',
      'Negociar bien es proteger la relacion sin regalar el negocio.',
    ],
  },
  {
    title: 'Activos digitales',
    lines: [
      'Un activo digital es una pieza que trabaja cuando no estas: curso, plantilla, lista, software o comunidad.',
      'Empieza por venderlo como servicio para aprender exactamente que debe contener.',
      'El mejor producto no tiene mas funciones; tiene menos friccion hasta el resultado.',
      'Crea una lista de correo antes de crear cien publicaciones dispersas.',
      'Actualiza el activo con preguntas reales de clientes, no con ansiedad creativa.',
      'La pequena maquina rentable vale mas que el lanzamiento espectacular que muere en dos dias.',
    ],
  },
  {
    title: 'Caja y supervivencia',
    lines: [
      'La caja es oxigeno: una empresa rentable puede morir si cobra tarde y paga pronto.',
      'Pide anticipos cuando entregas valor personalizado o reservas tiempo escaso.',
      'Ten una reserva operativa antes de subir gastos fijos.',
      'El margen pequeno exige volumen excelente; el margen alto exige confianza excelente.',
      'Revisa caja cada semana aunque todo vaya bien.',
      'El fundador tranquilo toma mejores decisiones que el fundador atrapado por urgencias.',
    ],
  },
  {
    title: 'Huecos legales utiles',
    lines: [
      'Los huecos legales sanos no son trampas: son incentivos que la ley ya permite usar.',
      'Busca deducciones, bonificaciones, subvenciones e instrumentos de ahorro con asesor autorizado.',
      'Lee requisitos antes de gastar, porque muchos beneficios dependen de forma, plazo y prueba.',
      'A veces el mejor ahorro es elegir bien jurisdiccion, contrato, calendario y estructura societaria.',
      'Nunca ocultes ingresos ni simules gastos: eso no es estrategia, es riesgo acumulado.',
      'La sofisticacion real consiste en cumplir mejor que otros mientras conservas mas capital.',
    ],
  },
  {
    title: 'Mentalidad de capital',
    lines: [
      'El dinero grande busca asimetria: perdida limitada, aprendizaje alto y opcion de crecer.',
      'Antes de invertir, pregunta que sabes que el mercado aun no ha entendido.',
      'Diversificar protege; concentrar construye, pero solo si sabes exactamente por que.',
      'La paciencia no es pasividad: es esperar con liquidez, informacion y criterio.',
      'No confundas movimiento con avance; muchas fortunas nacen de no tocar una buena decision.',
      'El capital premia al que sobrevive suficiente tiempo para que su ventaja componga.',
    ],
  },
  {
    title: 'La recompensa final',
    lines: [
      'Al final del laberinto, el dinero deja de ser marcador y se vuelve espejo.',
      'Puedes ganar mas, pagar mejor, protegerte mejor y aun asi sentir que falta centro.',
      'Dios, vida o destino: llama como quieras a la pregunta que aparece cuando ya no corres.',
      'La libertad no consiste en no deber nada, sino en elegir que merece tu energia.',
      'El ultimo truco millonario es simple y dificil: construir algo que no te destruya por dentro.',
      'Si llegaste aqui, la recompensa es esta: usa el sistema, pero no dejes que el sistema te use.',
    ],
  },
]

function randomId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function freshProfile(): Profile {
  return { id: `P-${randomId()}`, name: 'Runner', skin: 'mirror' }
}

function skinColor(skin: Skin | undefined) {
  if (skin === 'ember') return '#ff7a3d'
  if (skin === 'neon') return '#d7ff5e'
  if (skin === 'void') return '#9a7cff'
  return '#f5f2ee'
}

function enemyColor(kind: EnemyKind) {
  if (kind === 'blind') return '#716456'
  if (kind === 'mirror') return '#f5f2ee'
  if (kind === 'chemist') return '#57ffb8'
  if (kind === 'stalker') return '#151515'
  if (kind === 'brute') return '#c52f40'
  if (kind === 'warden') return '#e84855'
  if (kind === 'oracle') return '#b68cff'
  if (kind === 'sentinel') return '#ff9c4a'
  if (kind === 'duelist') return '#67d8ff'
  return '#9a5a44'
}

function enemyWeapon(kind: EnemyKind): Weapon {
  if (kind === 'blind') return 'hammer'
  if (kind === 'mirror') return 'blade'
  if (kind === 'chemist') return 'staff'
  if (kind === 'stalker') return 'claws'
  if (kind === 'brute') return 'hammer'
  if (kind === 'warden') return 'hammer'
  if (kind === 'oracle') return 'staff'
  if (kind === 'sentinel') return 'spear'
  if (kind === 'duelist') return 'blade'
  return 'claws'
}

function playerWeapon(player: Player): Weapon {
  if (player.weapon) return player.weapon
  if (player.attack >= 16) return 'hammer'
  if (player.attack >= 12) return 'spear'
  if (player.vampire > 0) return 'claws'
  return 'blade'
}

function rng(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function index(game: Pick<Game, 'width'>, x: number, y: number) {
  return y * game.width + x
}

function inside(game: Pick<Game, 'width' | 'height'>, x: number, y: number) {
  return x >= 0 && y >= 0 && x < game.width && y < game.height
}

function setTile(game: Game, x: number, y: number, tile: Tile) {
  if (inside(game, x, y)) game.tiles[index(game, x, y)] = tile
}

function tileAt(game: Game, x: number, y: number) {
  return inside(game, x, y) ? game.tiles[index(game, x, y)] : 1
}

function pushLog(game: Game, text: string) {
  game.log = [{ id: game.turn, text }, ...game.log].slice(0, 9)
}

function pickUpgrades(seed: number) {
  const pool: UpgradeId[] = ['edge', 'heart', 'shell', 'flare', 'sight', 'vampire', 'longbow', 'hammer', 'rapier', 'boots', 'magnet', 'battery', 'barrier', 'executioner']
  const random = rng(seed)
  return [...pool].sort(() => random() - 0.5).slice(0, 3)
}

function basePlayer(previous?: Game): Player {
  return {
    x: 3,
    y: 3,
    hp: previous?.player.hp ?? 36,
    maxHp: previous?.player.maxHp ?? 36,
    attack: previous?.player.attack ?? 6,
    armor: previous?.player.armor ?? 0,
    shards: previous?.player.shards ?? 0,
    keys: previous?.player.keys ?? 0,
    flares: previous?.player.flares ?? 3,
    sight: previous?.player.sight ?? 7,
    vampire: previous?.player.vampire ?? 0,
    score: previous?.player.score ?? 0,
    weapon: previous?.player.weapon ?? 'blade',
    range: previous?.player.range ?? 1,
    speed: baseMoveSpeed,
    magnet: previous?.player.magnet ?? 0,
    upgradesTaken: previous?.player.upgradesTaken ?? [],
  }
}

function makeEnemy(level: number, id: string, kind: EnemyKind, x: number, y: number): Enemy {
  const scale = kind === 'blind' || kind === 'brute' ? 4 : kind === 'duelist' || kind === 'mirror' ? 3 : kind === 'warden' ? 2 : 1
  const hp = kind === 'blind'
    ? 24 + level * 4
    : kind === 'oracle' || kind === 'chemist'
      ? 11 + level
      : kind === 'stalker'
        ? 7 + Math.floor(level * 1.3)
        : 8 + level * scale
  const damage = kind === 'brute'
    ? 9 + Math.floor(level / 4)
    : kind === 'blind'
      ? 12 + Math.floor(level / 3)
      : kind === 'mirror'
        ? 8 + Math.floor(level / 5)
        : kind === 'stalker'
          ? 5 + Math.floor(level / 8)
          : kind === 'chemist'
            ? 4 + Math.floor(level / 7)
            : kind === 'warden' || kind === 'duelist'
              ? 6 + Math.floor(level / 5)
              : 3 + Math.floor(level / 6)
  return {
    id,
    kind,
    x,
    y,
    hp,
    maxHp: hp,
    damage,
    alert: kind === 'blind' ? 3 : kind === 'stalker' || kind === 'mirror' ? 22 : kind === 'crawler' ? 8 : kind === 'sentinel' || kind === 'brute' ? 12 : 17,
  }
}

function portalOpen(game: Game) {
  return tileAt(game, game.exit.x, game.exit.y) === 5
}

function livingOpponents(game: Game) {
  return game.enemies.length
}

function openPortal(game: Game, x = game.exit.x, y = game.exit.y) {
  const spot = freeDropSpot(game, x, y)
  game.exit = spot
  setTile(game, spot.x, spot.y, 5)
  pushLog(game, 'El ultimo enemigo deja un portal abierto.')
}

function floorIsCleared(game: Game, level = game.level) {
  return game.clearedFloors.includes(level)
}

function cloneFloorMemory(memory: Record<string, FloorMemory> = {}) {
  return Object.fromEntries(
    Object.entries(memory).map(([level, floor]) => [
      level,
      {
        ...floor,
        tiles: [...floor.tiles],
        seen: [...floor.seen],
        enemies: floor.enemies.map((enemy) => ({ ...enemy })),
        items: floor.items.map((item) => ({ ...item })),
        exit: { ...floor.exit },
        backExit: floor.backExit ? { ...floor.backExit } : null,
        articleRooms: floor.articleRooms.map((room) => ({ ...room, lines: [...room.lines] })),
      },
    ]),
  )
}

function rememberFloor(game: Game, cleared = floorIsCleared(game)) {
  game.floorMemory = {
    ...game.floorMemory,
    [game.level]: {
      level: game.level,
      seed: game.seed,
      width: game.width,
      height: game.height,
      tiles: [...game.tiles],
      seen: [...game.seen],
      enemies: cleared ? [] : game.enemies.map((enemy) => ({ ...enemy })),
      items: game.items.map((item) => ({ ...item })),
      exit: { ...game.exit },
      backExit: game.backExit ? { ...game.backExit } : null,
      articleRooms: game.articleRooms.map((room) => ({ ...room, lines: [...room.lines] })),
    },
  }
}

function landingNear(game: Pick<Game, 'width' | 'height' | 'tiles' | 'enemies'>, point: Point, fallback: Point) {
  const options = [
    { x: point.x + 1, y: point.y },
    { x: point.x - 1, y: point.y },
    { x: point.x, y: point.y + 1 },
    { x: point.x, y: point.y - 1 },
    fallback,
  ]
  return options.find((option) => !solid(game as Game, option.x, option.y) && !enemyAt(game as Game, option.x, option.y)) ?? fallback
}

function restoreRememberedFloor(previous: Game, level: number, arrival: 'fromPrevious' | 'fromNext'): Game | null {
  const saved = previous.floorMemory[level]
  if (!saved) return null
  const player = basePlayer(previous)
  const game: Game = {
    level,
    seed: saved.seed,
    width: saved.width,
    height: saved.height,
    tiles: [...saved.tiles],
    seen: [...saved.seen],
    player,
    enemies: floorIsCleared(previous, level) ? [] : saved.enemies.map((enemy) => ({ ...enemy })),
    items: saved.items.map((item) => ({ ...item })),
    exit: { ...saved.exit },
    backExit: saved.backExit ? { ...saved.backExit } : null,
    phase: 'playing',
    log: previous.log.slice(0, 5),
    turn: previous.turn,
    secret: previous.secret,
    upgrades: [],
    articleRooms: saved.articleRooms.map((room) => ({ ...room, lines: [...room.lines] })),
    clearedFloors: [...previous.clearedFloors],
    maxLevelReached: previous.maxLevelReached,
    floorMemory: cloneFloorMemory(previous.floorMemory),
  }
  const target = arrival === 'fromNext' ? game.exit : game.backExit
  const fallback = game.articleRooms[0]
    ? { x: game.articleRooms[0].x + 3, y: game.articleRooms[0].y + Math.floor(game.articleRooms[0].h / 2) }
    : { x: 3, y: 3 }
  const landing = landingNear(game, target ?? fallback, fallback)
  game.player.x = landing.x
  game.player.y = landing.y
  reveal(game, game.player.sight + 3)
  pushLog(game, arrival === 'fromNext' ? `Vuelves a la planta ${level}.` : `Regresas a la planta ${level}.`)
  return game
}

function articleForLevel(level: number) {
  return floorArticles[(level - 1) % floorArticles.length]
}

function wrapWords(text: string, width: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > width && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines
}

function carveRect(game: Game, x: number, y: number, w: number, h: number, tile: Tile = 0) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setTile(game, xx, yy, tile)
  }
}

function carveCorridor(game: Game, from: Point, to: Point) {
  let x = from.x
  let y = from.y
  while (x !== to.x) {
    carveRect(game, x - 1, y - 1, 3, 3)
    x += x < to.x ? 1 : -1
  }
  while (y !== to.y) {
    carveRect(game, x - 1, y - 1, 3, 3)
    y += y < to.y ? 1 : -1
  }
  carveRect(game, to.x - 1, to.y - 1, 3, 3)
}

function enemyPoolForLevel(level: number): EnemyKind[] {
  if (level > 34) return ['crawler', 'sentinel', 'oracle', 'warden', 'duelist', 'brute', 'stalker', 'chemist', 'mirror', 'blind']
  if (level > 21) return ['crawler', 'sentinel', 'oracle', 'warden', 'duelist', 'brute', 'stalker', 'chemist', 'blind']
  if (level > 13) return ['crawler', 'sentinel', 'oracle', 'warden', 'duelist', 'brute', 'blind']
  if (level > 7) return ['crawler', 'sentinel', 'oracle', 'stalker', 'blind']
  return ['crawler', 'sentinel', 'blind']
}

function makeArticleLevel(game: Game, level: number, random: () => number) {
  const article = articleForLevel(level)
  const rooms: ArticleRoom[] = []
  const x = 4
  let y = 4
  const roomWidth = 58
  const phrases = [article.title.toUpperCase(), ...article.lines]

  phrases.forEach((phrase, phraseIndex) => {
    const lines = wrapWords(phrase, phraseIndex === 0 ? 28 : 44)
    const h = Math.max(7, lines.length + 4)
    const w = Math.max(28, Math.min(roomWidth, Math.max(...lines.map((line) => line.length)) + 8))
    const room = { x, y, w, h, lines }
    rooms.push(room)
    y += h + 5
  })

  game.articleRooms = rooms
  game.height = Math.max(44, y + 5)
  game.tiles = Array<Tile>(game.width * game.height).fill(1)
  game.seen = Array<boolean>(game.width * game.height).fill(false)
  rooms.forEach((room, roomIndex) => {
    carveRect(game, room.x, room.y, room.w, room.h)
    if (roomIndex > 0) {
      const previous = rooms[roomIndex - 1]
      carveCorridor(
        game,
        { x: previous.x + Math.floor(previous.w / 2), y: previous.y + previous.h - 1 },
        { x: room.x + Math.floor(room.w / 2), y: room.y },
      )
    }
  })

  const start = rooms[0]
  const end = rooms[rooms.length - 1]
  game.player.x = start.x + 3
  game.player.y = start.y + Math.floor(start.h / 2)
  game.exit = { x: end.x + end.w - 4, y: end.y + Math.floor(end.h / 2) }
  game.backExit = level > 1 ? { x: start.x + 1, y: start.y + Math.floor(start.h / 2) } : null
  if (game.backExit) setTile(game, game.backExit.x, game.backExit.y, 7)

  const pool = enemyPoolForLevel(level)
  rooms.slice(1).forEach((room, roomIndex) => {
    const enemyCount = 1 + (level > 8 && roomIndex % 3 === 0 ? 1 : 0) + (level > 22 && roomIndex % 4 === 0 ? 1 : 0)
    for (let i = 0; i < enemyCount; i += 1) {
      const kind = pool[Math.floor(random() * pool.length)]
      const enemyX = room.x + Math.max(5, Math.min(room.w - 5, Math.floor(room.w * (0.55 + random() * 0.32))))
      const enemyY = room.y + 2 + Math.floor(random() * Math.max(1, room.h - 4))
      game.enemies.push(makeEnemy(level, `a-${level}-${roomIndex}-${i}`, kind, enemyX, enemyY))
    }
    if (roomIndex % 2 === 0) {
      const kind: ItemKind = roomIndex % 6 === 0 ? 'flare' : roomIndex % 5 === 0 ? 'heart' : 'shard'
      game.items.push({ id: `article-i-${level}-${roomIndex}`, kind, x: room.x + 3, y: room.y + room.h - 3 })
    }
  })

  reveal(game, game.player.sight + 3)
  pushLog(game, `Planta ${level}: ${article.title}.`)
  return game
}

function makeLevel(level: number, previous?: Game, phase: Phase = level === 1 && !previous ? 'upgrade' : 'playing'): Game {
  const seed = 90210 + level * 7789 + (previous?.turn ?? 0)
  const random = rng(seed)
  const width = 70
  const height = 44
  const game: Game = {
    level,
    seed,
    width,
    height,
    tiles: Array<Tile>(width * height).fill(1),
    seen: Array<boolean>(width * height).fill(false),
    player: basePlayer(previous),
    enemies: [],
    items: [],
    exit: { x: width - 4, y: height - 4 },
    backExit: null,
    phase,
    log: previous?.log.slice(0, 5) ?? [],
    turn: previous?.turn ?? 0,
    secret: false,
    upgrades: phase === 'upgrade' ? pickUpgrades(seed) : [],
    articleRooms: [],
    clearedFloors: previous?.clearedFloors ? [...previous.clearedFloors] : [],
    maxLevelReached: Math.max(previous?.maxLevelReached ?? level, level),
    floorMemory: cloneFloorMemory(previous?.floorMemory),
  }

  return makeArticleLevel(game, level, random)
}

function reveal(game: Game, radius = game.player.sight) {
  for (let y = game.player.y - radius; y <= game.player.y + radius; y += 1) {
    for (let x = game.player.x - radius; x <= game.player.x + radius; x += 1) {
      if (inside(game, x, y) && Math.hypot(game.player.x - x, game.player.y - y) <= radius) game.seen[index(game, x, y)] = true
    }
  }
}

function cloneGame(game: Game): Game {
  return {
    ...game,
    tiles: [...game.tiles],
    seen: [...game.seen],
    player: { ...game.player },
    enemies: game.enemies.map((enemy) => ({ ...enemy })),
    items: game.items.map((item) => ({ ...item })),
    exit: { ...game.exit },
    backExit: game.backExit ? { ...game.backExit } : null,
    log: [...game.log],
    upgrades: [...game.upgrades],
    articleRooms: game.articleRooms.map((room) => ({ ...room, lines: [...room.lines] })),
    clearedFloors: [...game.clearedFloors],
    maxLevelReached: game.maxLevelReached,
    floorMemory: cloneFloorMemory(game.floorMemory),
  }
}

function solid(game: Game, x: number, y: number) {
  return tileAt(game, x, y) === 1 || tileAt(game, x, y) === 6
}

function enemyAt(game: Game, x: number, y: number) {
  return game.enemies.find((enemy) => enemy.x === x && enemy.y === y)
}

function targetInLine(game: Game, dx: number, dy: number) {
  for (let distance = 1; distance <= game.player.range; distance += 1) {
    const x = game.player.x + dx * distance
    const y = game.player.y + dy * distance
    if (solid(game, x, y)) return null
    const enemy = enemyAt(game, x, y)
    if (enemy) return { enemy, x, y }
  }
  return null
}

function occupied(game: Game, x: number, y: number) {
  return enemyAt(game, x, y)
}

function freeDropSpot(game: Game, x: number, y: number) {
  for (let radius = 0; radius <= 4; radius += 1) {
    for (let yy = y - radius; yy <= y + radius; yy += 1) {
      for (let xx = x - radius; xx <= x + radius; xx += 1) {
        const hasItem = game.items.some((item) => item.x === xx && item.y === yy)
        if (!solid(game, xx, yy) && !occupied(game, xx, yy) && !hasItem) return { x: xx, y: yy }
      }
    }
  }
  return { x: game.player.x, y: game.player.y }
}

function damagePlayer(game: Game, damage: number) {
  game.player.hp -= Math.max(1, damage - game.player.armor)
}

function collectItem(game: Game) {
  const item = game.items.find((candidate) => Math.hypot(candidate.x - game.player.x, candidate.y - game.player.y) <= Math.max(0.4, game.player.magnet))
  if (!item) return
  game.items = game.items.filter((candidate) => candidate.id !== item.id)
  if (item.kind === 'heart') {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + 10)
    game.player.score += 25
    pushLog(game, 'Botiquin: +10 vida.')
  }
  if (item.kind === 'shard') {
    game.player.shards += 1
    game.player.score += 80
    if (game.player.shards % 4 === 0) game.player.attack += 1
    pushLog(game, 'Fragmento: cada 4 sube ataque.')
  }
  if (item.kind === 'flare') {
    game.player.flares += 1
    game.player.score += 40
    pushLog(game, 'Bengala recuperada.')
  }
  if (item.kind === 'key') {
    game.player.keys += 1
    game.player.armor += 1
    game.player.score += 220
    pushLog(game, 'Llave negra: +1 armadura.')
  }
}

function lineClear(game: Game, from: Point, to: Point) {
  const dx = Math.sign(to.x - from.x)
  const dy = Math.sign(to.y - from.y)
  if (dx !== 0 && dy !== 0) return false
  let x = from.x + dx
  let y = from.y + dy
  while (x !== to.x || y !== to.y) {
    if (solid(game, x, y)) return false
    x += dx
    y += dy
  }
  return true
}

function nearestAutoTarget(game: Game) {
  const targets = [
    ...game.enemies.map((enemy) => ({ enemy, x: enemy.x, y: enemy.y })),
  ]
  return targets
    .filter((target) => {
      const dist = Math.abs(target.x - game.player.x) + Math.abs(target.y - game.player.y)
      return dist <= game.player.range && (target.x === game.player.x || target.y === game.player.y) && lineClear(game, game.player, target)
    })
    .sort((a, b) => Math.abs(a.x - game.player.x) + Math.abs(a.y - game.player.y) - (Math.abs(b.x - game.player.x) + Math.abs(b.y - game.player.y)))[0]
}

function playerDamage(game: Game, target: Enemy) {
  const heavy = game.player.weapon === 'hammer' ? 4 : 0
  const closeBonus = Math.abs(target.x - game.player.x) + Math.abs(target.y - game.player.y) <= 1 ? 1 : 0
  return game.player.attack + Math.floor(game.player.shards / 5) + heavy + closeBonus
}

function moveChasers(game: Game) {
  game.enemies.forEach((enemy) => {
    const repeats = enemy.kind === 'stalker' ? 2 : enemy.kind === 'mirror' && game.level > 40 ? 2 : 1
    for (let step = 0; step < repeats; step += 1) {
      const dx = game.player.x - enemy.x
      const dy = game.player.y - enemy.y
      const dist = Math.abs(dx) + Math.abs(dy)
      if (enemy.kind === 'blind' && dist > enemy.alert) return
      if (dist === 1) {
        damagePlayer(game, enemy.damage)
        pushLog(game, `${enemy.kind} golpea.`)
        return
      }
      if ((enemy.kind === 'oracle' || enemy.kind === 'chemist') && dist <= 4 && (enemy.x === game.player.x || enemy.y === game.player.y) && lineClear(game, enemy, game.player)) {
        damagePlayer(game, enemy.damage + (enemy.kind === 'chemist' ? 2 : 0))
        pushLog(game, `${enemy.kind} dispara desde lejos.`)
        return
      }
      if (dist > enemy.alert) return
      const prefersAxis = enemy.kind === 'brute' || enemy.kind === 'sentinel'
      const options = [
        { x: enemy.x + Math.sign(dx), y: enemy.y },
        { x: enemy.x, y: enemy.y + Math.sign(dy) },
        ...(prefersAxis ? [] : [{ x: enemy.x + Math.sign(dx), y: enemy.y + Math.sign(dy) }]),
      ].sort((a, b) => Math.hypot(game.player.x - a.x, game.player.y - a.y) - Math.hypot(game.player.x - b.x, game.player.y - b.y))
      const next = options.find((point) => !solid(game, point.x, point.y) && !occupied(game, point.x, point.y) && !(game.player.x === point.x && game.player.y === point.y))
      if (next) {
        enemy.x = next.x
        enemy.y = next.y
      }
    }
  })
}

function dropFromDefeat(game: Game, name: string, x: number, y: number) {
  const kind: ItemKind = name === 'warden' || name === 'brute' || name === 'mirror' || name === 'blind' ? 'key' : game.player.hp <= game.player.maxHp / 2 ? 'heart' : game.turn % 3 === 0 ? 'flare' : 'shard'
  const spot = freeDropSpot(game, x, y)
  game.player.score += (game.player.upgradesTaken.includes('executioner') ? 190 : 120) + game.level * 8
  game.items.push({ id: `drop-${game.level}-${game.turn}-${name}`, kind, x: spot.x, y: spot.y })
  if (game.player.upgradesTaken.includes('executioner') && kind !== 'key') {
    const bonusSpot = freeDropSpot(game, spot.x + 1, spot.y)
    game.items.push({ id: `bonus-${game.level}-${game.turn}-${name}`, kind: 'shard', x: bonusSpot.x, y: bonusSpot.y })
  }
  if (game.player.vampire > 0) {
    const lifeSpot = freeDropSpot(game, spot.x - 1, spot.y)
    game.items.push({ id: `life-${game.level}-${game.turn}-${name}`, kind: 'heart', x: lifeSpot.x, y: lifeSpot.y })
  }
  pushLog(game, `${name} cae.`)
  if (livingOpponents(game) === 0 && !portalOpen(game)) openPortal(game, x, y)
}

function passFloor(game: Game): Game {
  const alreadyCleared = floorIsCleared(game)
  if (!alreadyCleared) {
    game.player.score += 350 + game.level * 30
    game.clearedFloors = [...new Set([...game.clearedFloors, game.level])]
  }
  rememberFloor(game, true)
  if (game.level >= finalLevel) {
    game.phase = 'won'
    game.secret = true
    pushLog(game, 'El espejo final se abre por detras.')
    return game
  }
  const nextLevel = game.level + 1
  const remembered = restoreRememberedFloor(game, nextLevel, 'fromPrevious')
  if (remembered) return remembered
  game.maxLevelReached = Math.max(game.maxLevelReached, nextLevel)
  return makeLevel(nextLevel, game, alreadyCleared ? 'playing' : 'upgrade')
}

function returnToPreviousFloor(game: Game): Game {
  if (game.level <= 1) return game
  rememberFloor(game, floorIsCleared(game))
  const previous = restoreRememberedFloor(game, game.level - 1, 'fromNext')
  return previous ?? game
}

function stepGame(current: Game, dx: number, dy: number): Game {
  if (current.phase !== 'playing') return current
  const game = cloneGame(current)
  game.turn += 1
  const nx = game.player.x + dx
  const ny = game.player.y + dy
  const target = targetInLine(game, dx, dy)
  const enemy = target?.enemy

  if (enemy) {
    const hit = playerDamage(game, enemy)
    enemy.hp -= hit
    pushLog(game, `${enemy.kind} recibe ${hit}.`)
    if (enemy.hp <= 0) {
      game.enemies = game.enemies.filter((candidate) => candidate.id !== enemy.id)
      dropFromDefeat(game, enemy.kind, enemy.x, enemy.y)
    }
  } else if (!solid(game, nx, ny)) {
    game.player.x = nx
    game.player.y = ny
    collectItem(game)
  }

  if (game.player.x === game.exit.x && game.player.y === game.exit.y) {
    if (!portalOpen(game) || livingOpponents(game) > 0) {
      pushLog(game, 'El portal no existe hasta limpiar la planta.')
    } else {
      return passFloor(game)
    }
  }

  if (game.backExit && game.player.x === game.backExit.x && game.player.y === game.backExit.y) {
    return returnToPreviousFloor(game)
  }

  moveChasers(game)
  if (game.player.hp <= 0) {
    game.player.hp = 0
    game.phase = 'dead'
  }
  if (livingOpponents(game) === 0 && !portalOpen(game)) openPortal(game)
  reveal(game)
  return game
}

function flareGame(current: Game): Game {
  if (current.phase !== 'playing') return current
  if (current.player.flares <= 0) {
    const game = cloneGame(current)
    game.turn += 1
    pushLog(game, 'No quedan bengalas.')
    return game
  }
  const game = cloneGame(current)
  game.turn += 1
  game.player.flares -= 1
  const flareDamage = game.player.upgradesTaken.includes('battery') ? 28 + Math.floor(game.player.attack / 2) : 18 + Math.floor(game.player.attack / 2)
  const flareRadius = game.player.upgradesTaken.includes('battery') ? 11 : 9
  let portalDropX: number | undefined
  let portalDropY: number | undefined
  reveal(game, Math.max(game.player.sight + 7, flareRadius + 3))
  game.enemies.forEach((enemy) => {
    if (Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y) <= flareRadius) {
      enemy.hp -= flareDamage
      if (enemy.hp <= 0) {
        portalDropX = enemy.x
        portalDropY = enemy.y
        dropFromDefeat(game, enemy.kind, enemy.x, enemy.y)
      }
    }
  })
  game.enemies = game.enemies.filter((enemy) => enemy.hp > 0)
  if (livingOpponents(game) === 0 && !portalOpen(game)) openPortal(game, portalDropX, portalDropY)
  collectItem(game)
  pushLog(game, `Bengala: ${flareDamage} de dano radial y vision abierta.`)
  return game
}

function enemyTick(current: Game): Game {
  if (current.phase !== 'playing') return current
  const game = cloneGame(current)
  game.turn += 1
  moveChasers(game)
  collectItem(game)
  if (livingOpponents(game) === 0 && !portalOpen(game)) openPortal(game)
  if (game.player.hp <= 0) {
    game.player.hp = 0
    game.phase = 'dead'
  }
  reveal(game)
  return game
}

function autoAttackGame(current: Game): Game {
  if (current.phase !== 'playing') return current
  const game = cloneGame(current)
  const target = nearestAutoTarget(game)
  if (!target) return current
  game.turn += 1
  const hit = playerDamage(game, target.enemy)
  target.enemy.hp -= hit
  pushLog(game, `${target.enemy.kind} recibe ${hit} automaticamente.`)
  if (target.enemy.hp <= 0) {
    game.enemies = game.enemies.filter((enemy) => enemy.id !== target.enemy.id)
    dropFromDefeat(game, target.enemy.kind, target.enemy.x, target.enemy.y)
  }
  collectItem(game)
  reveal(game)
  return game
}

function applyUpgrade(current: Game, upgrade: UpgradeId): Game {
  const game = cloneGame(current)
  game.phase = 'playing'
  game.upgrades = []
  game.player.upgradesTaken = [...game.player.upgradesTaken, upgrade]
  if (upgrade === 'edge') game.player.attack += 2
  if (upgrade === 'heart') {
    game.player.maxHp += 8
    game.player.hp = game.player.maxHp
  }
  if (upgrade === 'shell') game.player.armor += 1
  if (upgrade === 'flare') game.player.flares += 3
  if (upgrade === 'sight') game.player.sight += 1
  if (upgrade === 'vampire') game.player.vampire += 3
  if (upgrade === 'longbow') {
    game.player.weapon = 'spear'
    game.player.range = Math.max(game.player.range, 4)
    game.player.attack += 1
  }
  if (upgrade === 'hammer') {
    game.player.weapon = 'hammer'
    game.player.range = 1
    game.player.attack += 5
  }
  if (upgrade === 'rapier') {
    game.player.weapon = 'blade'
    game.player.attack += 2
  }
  if (upgrade === 'boots') {
    game.player.armor += 1
    game.player.sight += 1
  }
  if (upgrade === 'magnet') game.player.magnet += 1.25
  if (upgrade === 'battery') game.player.flares += 2
  if (upgrade === 'barrier') game.player.armor += game.player.hp <= game.player.maxHp / 2 ? 2 : 1
  if (upgrade === 'executioner') game.player.attack += 3
  pushLog(game, `Mejora elegida: ${upgrade}.`)
  reveal(game)
  return game
}

function screenPoint(x: number, y: number, cameraX: number, cameraY: number) {
  return { cx: x * tileSize + tileSize / 2 - cameraX, cy: y * tileSize + tileSize / 2 - cameraY }
}

function drawWeapon(context: CanvasRenderingContext2D, x: number, y: number, weapon: Weapon, tint = '#f5f2ee', swing = 0) {
  context.save()
  context.translate(x + 9, y + 1)
  context.rotate(-0.58 + swing)
  context.strokeStyle = tint
  context.fillStyle = tint
  context.lineWidth = 3
  context.lineCap = 'round'
  if (weapon === 'blade') {
    context.beginPath()
    context.moveTo(-2, 10)
    context.lineTo(14, -8)
    context.stroke()
    context.fillRect(12, -10, 4, 8)
  }
  if (weapon === 'spear') {
    context.beginPath()
    context.moveTo(-5, 14)
    context.lineTo(18, -13)
    context.stroke()
    context.beginPath()
    context.moveTo(18, -13)
    context.lineTo(15, -3)
    context.lineTo(8, -10)
    context.closePath()
    context.fill()
  }
  if (weapon === 'staff') {
    context.strokeStyle = '#b68cff'
    context.beginPath()
    context.moveTo(-5, 14)
    context.lineTo(16, -10)
    context.stroke()
    context.beginPath()
    context.arc(18, -12, 5, 0, Math.PI * 2)
    context.fill()
  }
  if (weapon === 'hammer') {
    context.beginPath()
    context.moveTo(-5, 14)
    context.lineTo(13, -8)
    context.stroke()
    context.fillRect(8, -15, 15, 9)
  }
  if (weapon === 'claws') {
    for (let i = 0; i < 3; i += 1) {
      context.beginPath()
      context.moveTo(0, 5 + i * 4)
      context.lineTo(14, -2 + i * 4)
      context.stroke()
    }
  }
  context.restore()
}

function drawHealth(context: CanvasRenderingContext2D, x: number, y: number, hp: number, maxHp: number) {
  const ratio = Math.max(0, Math.min(1, hp / maxHp))
  context.fillStyle = 'rgba(0,0,0,0.62)'
  context.fillRect(x - 12, y - 21, 24, 4)
  context.fillStyle = ratio > 0.5 ? '#d7ff5e' : ratio > 0.25 ? '#ffba4d' : '#ff5f77'
  context.fillRect(x - 12, y - 21, 24 * ratio, 4)
}

function drawActor(context: CanvasRenderingContext2D, x: number, y: number, color: string, weapon: Weapon, hp: number, maxHp: number, kind: 'player' | 'enemy', pulse: number) {
  const bob = Math.sin(pulse / 160) * 1.8
  context.save()
  context.translate(x, y + bob)
  drawWeapon(context, 0, 0, weapon, kind === 'enemy' ? '#2b0d10' : '#f5f2ee', Math.sin(pulse / 110) * 0.1)
  context.fillStyle = 'rgba(0,0,0,0.35)'
  context.beginPath()
  context.ellipse(0, 12, 12, 4, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = color
  if (kind === 'enemy') {
    context.beginPath()
    context.moveTo(0, -14)
    context.lineTo(13, -4)
    context.lineTo(9, 13)
    context.lineTo(-9, 13)
    context.lineTo(-13, -4)
    context.closePath()
    context.fill()
  } else {
    context.beginPath()
    context.arc(0, 0, 12, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#050505'
    context.fillRect(-5, -4, 3, 3)
    context.fillRect(3, -4, 3, 3)
  }
  context.restore()
  drawHealth(context, x, y, hp, maxHp)
}

function drawEnemy(context: CanvasRenderingContext2D, enemy: Enemy, cameraX: number, cameraY: number, pulse: number) {
  const { cx, cy } = screenPoint(enemy.x, enemy.y, cameraX, cameraY)
  const bob = Math.sin(pulse / 150 + enemy.x) * 1.4
  context.save()
  context.translate(cx, cy + bob)
  drawWeapon(context, 0, 0, enemyWeapon(enemy.kind), enemy.kind === 'oracle' ? '#d7ff5e' : '#2b0d10', Math.sin(pulse / 105) * 0.12)
  context.fillStyle = 'rgba(0,0,0,0.36)'
  context.beginPath()
  context.ellipse(0, 12, 13, 4, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = enemyColor(enemy.kind)
  if (enemy.kind === 'crawler') {
    context.beginPath()
    context.ellipse(0, 5, 14, 8, 0, 0, Math.PI * 2)
    context.fill()
    context.fillRect(-12, 5, 5, 8)
    context.fillRect(7, 5, 5, 8)
  }
  if (enemy.kind === 'sentinel') {
    context.fillRect(-9, -11, 18, 24)
    context.fillStyle = '#24150f'
    context.fillRect(-13, -14, 26, 7)
  }
  if (enemy.kind === 'oracle') {
    context.beginPath()
    context.arc(0, -2, 13, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = '#d7ff5e'
    context.lineWidth = 2
    context.beginPath()
    context.arc(0, -3, 19, 0, Math.PI * 2)
    context.stroke()
  }
  if (enemy.kind === 'warden') {
    context.fillRect(-14, -13, 28, 27)
    context.fillStyle = '#6f1720'
    context.fillRect(-9, -19, 18, 8)
  }
  if (enemy.kind === 'duelist') {
    context.beginPath()
    context.moveTo(0, -16)
    context.lineTo(12, -3)
    context.lineTo(7, 15)
    context.lineTo(-7, 15)
    context.lineTo(-12, -3)
    context.closePath()
    context.fill()
  }
  if (enemy.kind === 'brute') {
    context.fillRect(-16, -16, 32, 31)
    context.fillStyle = '#64111b'
    context.beginPath()
    context.arc(-9, -18, 6, 0, Math.PI * 2)
    context.arc(9, -18, 6, 0, Math.PI * 2)
    context.fill()
  }
  if (enemy.kind === 'stalker') {
    context.strokeStyle = '#d7ff5e'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(0, -17)
    context.lineTo(13, 14)
    context.lineTo(-13, 14)
    context.closePath()
    context.stroke()
    context.fillStyle = 'rgba(215,255,94,0.18)'
    context.fill()
  }
  if (enemy.kind === 'chemist') {
    context.beginPath()
    context.arc(0, -3, 12, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#073d31'
    context.fillRect(-10, 4, 20, 11)
    context.fillStyle = '#d7ff5e'
    context.beginPath()
    context.arc(-6, 8, 3, 0, Math.PI * 2)
    context.arc(6, 8, 3, 0, Math.PI * 2)
    context.fill()
  }
  if (enemy.kind === 'mirror') {
    context.fillStyle = '#f5f2ee'
    context.fillRect(-11, -15, 22, 30)
    context.strokeStyle = '#9ee7ff'
    context.lineWidth = 3
    context.strokeRect(-14, -18, 28, 36)
  }
  if (enemy.kind === 'blind') {
    context.fillStyle = '#716456'
    context.beginPath()
    context.roundRect(-16, -14, 32, 30, 7)
    context.fill()
    context.strokeStyle = '#2b0d10'
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(-11, -7)
    context.lineTo(11, -1)
    context.moveTo(-10, -1)
    context.lineTo(12, -7)
    context.stroke()
    context.fillStyle = '#d7ff5e'
    context.fillRect(-13, 9, 26, 4)
  }
  context.fillStyle = '#050505'
  context.fillRect(-5, -4, 3, 3)
  context.fillRect(3, -4, 3, 3)
  context.restore()
  drawHealth(context, cx, cy, enemy.hp, enemy.maxHp)
}

function drawItem(context: CanvasRenderingContext2D, item: Item, cameraX: number, cameraY: number, pulse: number) {
  const { cx, cy } = screenPoint(item.x, item.y, cameraX, cameraY)
  const float = Math.sin(pulse / 220 + item.x) * 2
  context.save()
  context.translate(cx, cy + float)
  context.fillStyle = 'rgba(0,0,0,0.35)'
  context.beginPath()
  context.ellipse(0, 11, 10, 3, 0, 0, Math.PI * 2)
  context.fill()
  if (item.kind === 'heart') {
    context.fillStyle = '#ff5f77'
    context.fillRect(-10, -8, 20, 16)
    context.fillStyle = '#f5f2ee'
    context.fillRect(-2, -11, 4, 22)
    context.fillRect(-9, -2, 18, 4)
  }
  if (item.kind === 'key') {
    context.strokeStyle = '#ffe16a'
    context.lineWidth = 4
    context.beginPath()
    context.arc(-5, -2, 6, 0, Math.PI * 2)
    context.moveTo(1, -2)
    context.lineTo(13, -2)
    context.lineTo(13, 5)
    context.moveTo(7, -2)
    context.lineTo(7, 4)
    context.stroke()
  }
  if (item.kind === 'flare') {
    context.fillStyle = '#ff914d'
    context.fillRect(-4, -11, 8, 22)
    context.fillStyle = '#ffd45a'
    context.beginPath()
    context.moveTo(0, -18)
    context.lineTo(7, -8)
    context.lineTo(-7, -8)
    context.closePath()
    context.fill()
  }
  if (item.kind === 'shard') {
    context.fillStyle = '#9ee7ff'
    context.beginPath()
    context.moveTo(0, -14)
    context.lineTo(10, -2)
    context.lineTo(2, 14)
    context.lineTo(-9, 4)
    context.closePath()
    context.fill()
    context.strokeStyle = '#f5f2ee'
    context.lineWidth = 1
    context.stroke()
  }
  context.restore()
}

function drawFx(context: CanvasRenderingContext2D, fx: Fx, cameraX: number, cameraY: number, now: number) {
  const age = now - fx.born
  if (age > 620) return
  const life = 1 - age / 620
  const from = screenPoint(fx.x, fx.y, cameraX, cameraY)
  const to = screenPoint(fx.tx ?? fx.x, fx.ty ?? fx.y, cameraX, cameraY)
  context.save()
  context.globalAlpha = life
  if (fx.kind === 'slash') {
    context.strokeStyle = fx.color
    context.lineWidth = 5
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(from.cx, from.cy)
    context.quadraticCurveTo((from.cx + to.cx) / 2, (from.cy + to.cy) / 2 - 18, to.cx, to.cy)
    context.stroke()
    context.fillStyle = '#f5f2ee'
    context.beginPath()
    context.arc(to.cx, to.cy, 12 * life, 0, Math.PI * 2)
    context.fill()
  }
  if (fx.kind === 'burst') {
    context.strokeStyle = fx.color
    context.lineWidth = 3
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8
      context.beginPath()
      context.moveTo(from.cx + Math.cos(angle) * 6, from.cy + Math.sin(angle) * 6)
      context.lineTo(from.cx + Math.cos(angle) * 24 * (1 - life + 0.2), from.cy + Math.sin(angle) * 24 * (1 - life + 0.2))
      context.stroke()
    }
  }
  if (fx.kind === 'float' && fx.text) {
    context.fillStyle = fx.color
    context.font = '900 14px monospace'
    context.textAlign = 'center'
    context.fillText(fx.text, from.cx, from.cy - 22 - age / 18)
  }
  context.restore()
}

function drawGame(canvas: HTMLCanvasElement, game: Game, skin: Skin, effects: Fx[], now: number, renderState: RenderState) {
  const context = canvas.getContext('2d')
  if (!context) return
  const scale = window.devicePixelRatio || 1
  const parent = canvas.parentElement
  const viewWidth = Math.max(320, parent?.clientWidth ?? window.innerWidth)
  const viewHeight = Math.max(320, parent?.clientHeight ?? window.innerHeight)
  const worldWidth = game.width * tileSize
  const worldHeight = game.height * tileSize
  if (!renderState.ready || Math.hypot(renderState.vx - game.player.x, renderState.vy - game.player.y) > 5) {
    renderState.vx = game.player.x
    renderState.vy = game.player.y
    renderState.ready = true
  }
  renderState.vx += (game.player.x - renderState.vx) * 0.34
  renderState.vy += (game.player.y - renderState.vy) * 0.34
  if (Math.abs(renderState.vx - game.player.x) < 0.02) renderState.vx = game.player.x
  if (Math.abs(renderState.vy - game.player.y) < 0.02) renderState.vy = game.player.y
  const cameraX = Math.min(Math.max(renderState.vx * tileSize + tileSize / 2 - viewWidth / 2, 0), Math.max(0, worldWidth - viewWidth))
  const cameraY = Math.min(Math.max(renderState.vy * tileSize + tileSize / 2 - viewHeight / 2, 0), Math.max(0, worldHeight - viewHeight))
  canvas.width = viewWidth * scale
  canvas.height = viewHeight * scale
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  context.setTransform(scale, 0, 0, scale, 0, 0)
  const bg = context.createLinearGradient(0, 0, viewWidth, viewHeight)
  bg.addColorStop(0, '#030303')
  bg.addColorStop(0.42, '#0d0b09')
  bg.addColorStop(1, '#050507')
  context.fillStyle = bg
  context.fillRect(0, 0, viewWidth, viewHeight)
  context.globalAlpha = 0.16
  for (let i = 0; i < 90; i += 1) {
    const px = (Math.sin(i * 99.77 + game.seed) * 0.5 + 0.5) * viewWidth
    const py = (Math.cos(i * 41.13 + game.seed) * 0.5 + 0.5) * viewHeight
    context.fillStyle = i % 6 === 0 ? '#d7ff5e' : '#f5f2ee'
    context.fillRect(px, py, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1)
  }
  context.globalAlpha = 1

  for (let y = 0; y < game.height; y += 1) {
    for (let x = 0; x < game.width; x += 1) {
      const seen = game.seen[index(game, x, y)]
      const visible = Math.hypot(game.player.x - x, game.player.y - y) <= game.player.sight
      if (!seen) continue
      const tile = tileAt(game, x, y)
      context.globalAlpha = visible ? 1 : 0.3
      const sx = x * tileSize - cameraX
      const sy = y * tileSize - cameraY
      context.fillStyle = tile === 1 ? '#121111' : tile === 5 ? '#d7ff5e' : tile === 7 ? '#67d8ff' : tile === 6 ? '#332832' : '#2b261f'
      if (tile === 0) {
        const floor = context.createLinearGradient(sx, sy, sx + tileSize, sy + tileSize)
        floor.addColorStop(0, '#332d24')
        floor.addColorStop(1, (x + y + game.level) % 5 === 0 ? '#1d2220' : '#211e19')
        context.fillStyle = floor
      }
      context.fillRect(sx, sy, tileSize - 1, tileSize - 1)
      if (tile === 5) {
        context.strokeStyle = `rgba(215,255,94,${0.35 + Math.sin(now / 180) * 0.22})`
        context.lineWidth = 3
        context.strokeRect(sx + 3, sy + 3, tileSize - 7, tileSize - 7)
        context.beginPath()
        context.arc(sx + tileSize / 2, sy + tileSize / 2, 7 + Math.sin(now / 150) * 3, 0, Math.PI * 2)
        context.stroke()
      }
      if (tile === 7) {
        context.strokeStyle = `rgba(103,216,255,${0.35 + Math.sin(now / 190) * 0.22})`
        context.lineWidth = 3
        context.strokeRect(sx + 4, sy + 4, tileSize - 9, tileSize - 9)
        context.beginPath()
        context.arc(sx + tileSize / 2, sy + tileSize / 2, 6 + Math.sin(now / 170) * 3, 0, Math.PI * 2)
        context.stroke()
      }
      if (tile === 0 && (x + y) % 8 === 0) {
        context.fillStyle = '#3c362f'
        context.fillRect(sx + 10, sy + 10, 4, 4)
      }
    }
  }

  context.globalAlpha = 1
  game.articleRooms.forEach((room, roomIndex) => {
    const roomVisible = room.lines.some((line, lineIndex) => {
      const y = room.y + 2 + lineIndex
      return line.split('').some((_, charIndex) => {
        const x = room.x + 3 + charIndex
        return inside(game, x, y) && game.seen[index(game, x, y)]
      })
    })
    if (!roomVisible) return
    const roomX = room.x * tileSize - cameraX
    const roomY = room.y * tileSize - cameraY
    context.save()
    context.globalAlpha = 0.92
    context.strokeStyle = roomIndex === 0 ? 'rgba(215,255,94,0.72)' : 'rgba(245,242,238,0.2)'
    context.lineWidth = roomIndex === 0 ? 3 : 1
    context.strokeRect(roomX + 3, roomY + 3, room.w * tileSize - 7, room.h * tileSize - 7)
    context.font = roomIndex === 0 ? '900 18px monospace' : '900 15px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    room.lines.forEach((line, lineIndex) => {
      const y = room.y + 2 + lineIndex
      line.split('').forEach((character, charIndex) => {
        const x = room.x + 3 + charIndex
        if (!inside(game, x, y) || !game.seen[index(game, x, y)]) return
        const visible = Math.hypot(game.player.x - x, game.player.y - y) <= game.player.sight
        context.globalAlpha = visible ? 0.98 : 0.36
        context.fillStyle = roomIndex === 0 ? '#d7ff5e' : visible ? '#fff7df' : '#b8ab91'
        context.fillText(character, x * tileSize + tileSize / 2 - cameraX, y * tileSize + tileSize / 2 - cameraY)
      })
    })
    context.restore()
  })
  context.globalAlpha = 1
  game.items.forEach((item) => {
    if (!game.seen[index(game, item.x, item.y)]) return
    drawItem(context, item, cameraX, cameraY, now)
  })
  game.enemies.forEach((enemy) => {
    if (Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y) > game.player.sight + 1) return
    drawEnemy(context, enemy, cameraX, cameraY, now + enemy.x * 19)
  })
  const hero = {
    cx: renderState.vx * tileSize + tileSize / 2 - cameraX,
    cy: renderState.vy * tileSize + tileSize / 2 - cameraY,
  }
  drawActor(context, hero.cx, hero.cy, skinColor(skin), playerWeapon(game.player), game.player.hp, game.player.maxHp, 'player', now)
  effects.forEach((fx) => drawFx(context, fx, cameraX, cameraY, now))

  const playerScreenX = renderState.vx * tileSize + 13 - cameraX
  const playerScreenY = renderState.vy * tileSize + 13 - cameraY
  const gradient = context.createRadialGradient(playerScreenX, playerScreenY, game.player.sight * 14, playerScreenX, playerScreenY, game.player.sight * 48)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.84)')
  context.fillStyle = gradient
  context.fillRect(0, 0, viewWidth, viewHeight)
}

function sanitizeSavedGame(saved: Game) {
  return {
    ...saved,
    player: { ...basePlayer(), ...saved.player, sight: saved.player.sight ?? 7, vampire: saved.player.vampire ?? 0, score: saved.player.score ?? 0 },
    upgrades: saved.upgrades ?? [],
    articleRooms: saved.articleRooms ?? [],
    backExit: saved.backExit ?? null,
    clearedFloors: saved.clearedFloors ?? [],
    maxLevelReached: saved.maxLevelReached ?? saved.level ?? 1,
    floorMemory: cloneFloorMemory(saved.floorMemory),
  }
}

export default function RoguelikeGame({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const gameRef = useRef<Game | null>(null)
  const profileRef = useRef<Profile | null>(null)
  const effectsRef = useRef<Fx[]>([])
  const renderStateRef = useRef<RenderState>({ vx: 0, vy: 0, ready: false })
  const lastMoveRef = useRef(0)
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const [profile, setProfile] = useState<Profile>(() => freshProfile())
  const [draftName, setDraftName] = useState('Runner')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [game, setGame] = useState(() => makeLevel(1))
  const [effects, setEffects] = useState<Fx[]>([])

  const points = game.player.score + game.level * 100 + game.player.shards * 20 + game.player.keys * 120

  const persist = useCallback((next: Game) => {
    if (next.phase === 'dead') {
      window.localStorage.removeItem(saveKey)
    } else {
      window.localStorage.setItem(saveKey, JSON.stringify(next))
    }
    setGame(next)
  }, [])

  const addFx = useCallback((items: Fx[]) => {
    setEffects((current) => [...current, ...items].slice(-14))
  }, [])

  const start = useCallback(() => {
    window.localStorage.removeItem(saveKey)
    renderStateRef.current.ready = false
    setGame(makeLevel(1))
  }, [])

  const move = useCallback((dx: number, dy: number) => {
    const now = performance.now()
    if (now - lastMoveRef.current < moveCooldownMs) return
    lastMoveRef.current = now
    const targetLine = targetInLine(game, dx, dy)
    const localEnemy = targetLine?.enemy
    const item = game.items.find((candidate) => candidate.x === game.player.x + dx && candidate.y === game.player.y + dy)
    if (localEnemy) {
      const born = performance.now()
      const hit = game.player.attack + Math.floor(game.player.shards / 5)
      const lethal = localEnemy.hp <= hit
      addFx([
        { id: `slash-${born}`, kind: 'slash', x: game.player.x, y: game.player.y, tx: localEnemy.x, ty: localEnemy.y, color: '#f5f2ee', born },
        { id: `hit-${born}`, kind: 'float', x: localEnemy.x, y: localEnemy.y, text: `-${hit}`, color: '#ff5f77', born },
        ...(lethal ? [{ id: `dropfx-${born}`, kind: 'burst' as const, x: localEnemy.x, y: localEnemy.y, color: '#9ee7ff', born }] : []),
      ])
    }
    if (item && !solid(game, item.x, item.y)) {
      const born = performance.now()
      const reward = item.kind === 'heart' ? '+vida' : item.kind === 'key' ? '+llave' : item.kind === 'flare' ? '+bengala' : '+fragmento'
      addFx([
        { id: `pickup-${born}`, kind: 'burst', x: item.x, y: item.y, color: '#d7ff5e', born },
        { id: `loot-${born}`, kind: 'float', x: item.x, y: item.y, text: reward, color: '#d7ff5e', born },
      ])
    }
    const next = stepGame(game, dx, dy)
    if (next.player.hp < game.player.hp) {
      const born = performance.now()
      addFx([{ id: `ouch-${born}`, kind: 'float', x: next.player.x, y: next.player.y, text: `-${game.player.hp - next.player.hp}`, color: '#ff914d', born }])
    }
    persist(next)
  }, [addFx, game, persist])

  const flare = useCallback(() => {
    if (game.phase !== 'playing') return
    const born = performance.now()
    addFx([
      { id: `flare-${born}`, kind: 'burst', x: game.player.x, y: game.player.y, color: '#ff914d', born },
      { id: `flare-text-${born}`, kind: 'float', x: game.player.x, y: game.player.y, text: game.player.flares > 0 ? 'BENGALA' : 'SIN BENGALAS', color: game.player.flares > 0 ? '#ff914d' : '#ff5f77', born },
    ])
    persist(flareGame(game))
  }, [addFx, game, persist])

  const chooseUpgrade = useCallback((upgrade: UpgradeId) => {
    persist(applyUpgrade(game, upgrade))
  }, [game, persist])

  const moveFromStage = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 1 : -1, 0)
    } else {
      move(0, dy > 0 ? 1 : -1)
    }
  }, [move])

  const saveProfile = useCallback(() => {
    const cleanName = draftName.trim().slice(0, 20) || 'Runner'
    const next = { ...profile, name: cleanName }
    window.localStorage.setItem(profileKey, JSON.stringify(next))
    setProfile(next)
    setDraftName(cleanName)
  }, [draftName, profile])

  const changeSkin = useCallback((skin: Skin) => {
    const next = { ...profile, skin }
    window.localStorage.setItem(profileKey, JSON.stringify(next))
    setProfile(next)
  }, [profile])

  const submitScore = useCallback((targetGame = game) => {
    const score = targetGame.player.score + targetGame.level * 100 + targetGame.player.shards * 20 + targetGame.player.keys * 120
    fetch('/api/blog/roguelike-score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'score', score: { id: profile.id, name: profile.name, points: score, floor: targetGame.level } }),
    })
      .then((response) => response.ok ? response.json() as Promise<{ leaderboard: LeaderboardEntry[] }> : null)
      .then((data) => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard)
      })
      .catch(() => undefined)
  }, [game, profile.id, profile.name])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fallbackId = window.localStorage.getItem(playerIdKey) ?? `P-${randomId()}`
      window.localStorage.setItem(playerIdKey, fallbackId)
      const rawProfile = window.localStorage.getItem(profileKey)
      if (rawProfile) {
        try {
          const savedProfile = JSON.parse(rawProfile) as Partial<Profile>
          const cleanSkin = skins.includes(savedProfile.skin as Skin) ? savedProfile.skin as Skin : 'mirror'
          const next = { id: savedProfile.id ?? fallbackId, name: savedProfile.name?.slice(0, 20) || 'Runner', skin: cleanSkin }
          setProfile(next)
          setDraftName(next.name)
        } catch {
          window.localStorage.removeItem(profileKey)
        }
      } else {
        const next = { id: fallbackId, name: 'Runner', skin: 'mirror' as Skin }
        window.localStorage.setItem(profileKey, JSON.stringify(next))
        setProfile(next)
      }
      const raw = window.localStorage.getItem(saveKey)
      if (!raw) return
      try {
        const saved = JSON.parse(raw) as Game
        if (saved?.tiles?.length && saved?.player) setGame(sanitizeSavedGame(saved))
      } catch {
        window.localStorage.removeItem(saveKey)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    submitScore(game)
  }, [game.level, game.phase, submitScore, game])

  useEffect(() => {
    if (game.phase !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        const next = enemyTick(current)
        if (next === current) return current
        window.localStorage.setItem(saveKey, JSON.stringify(next))
        return next
      })
    }, Math.max(720, 1450 - game.level * 12))
    return () => window.clearInterval(timer)
  }, [game.level, game.phase])

  useEffect(() => {
    if (game.phase !== 'playing') return
    const timer = window.setInterval(() => {
      setGame((current) => {
        const target = nearestAutoTarget(current)
        if (!target) return current
        const born = performance.now()
        const victim = target.enemy
        const hit = playerDamage(current, victim)
        addFx([
          { id: `auto-slash-${born}`, kind: 'slash', x: current.player.x, y: current.player.y, tx: victim.x, ty: victim.y, color: current.player.weapon === 'staff' ? '#b68cff' : '#d7ff5e', born },
          { id: `auto-hit-${born}`, kind: 'float', x: victim.x, y: victim.y, text: `-${hit}`, color: '#ff5f77', born },
        ])
        const next = autoAttackGame(current)
        if (next !== current) window.localStorage.setItem(saveKey, JSON.stringify(next))
        return next
      })
    }, autoAttackMs)
    return () => window.clearInterval(timer)
  }, [addFx, game.phase])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) event.preventDefault()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) pressedKeysRef.current.add(key)
      if (key === ' ') flare()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key.toLowerCase())
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [flare])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const keys = pressedKeysRef.current
      if (keys.has('arrowup') || keys.has('w')) move(0, -1)
      else if (keys.has('arrowdown') || keys.has('s')) move(0, 1)
      else if (keys.has('arrowleft') || keys.has('a')) move(-1, 0)
      else if (keys.has('arrowright') || keys.has('d')) move(1, 0)
    }, 28)
    return () => window.clearInterval(timer)
  }, [move])

  useEffect(() => {
    if (game.phase !== 'dead') return
    submitScore(game)
    window.localStorage.removeItem(saveKey)
    pressedKeysRef.current.clear()
    const timer = window.setTimeout(() => {
      renderStateRef.current.ready = false
      setGame(makeLevel(1))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [game, submitScore])

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    effectsRef.current = effects
  }, [effects])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now()
      setEffects((current) => current.filter((fx) => now - fx.born < 680))
    }, 180)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let frame = 0
    const render = (time: number) => {
      const activeGame = gameRef.current
      const activeProfile = profileRef.current
      if (canvasRef.current && activeGame && activeProfile) {
        drawGame(canvasRef.current, activeGame, activeProfile.skin, effectsRef.current, time, renderStateRef.current)
      }
      frame = window.requestAnimationFrame(render)
    }
    frame = window.requestAnimationFrame(render)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const modeLabel = t.dungeon

  return (
    <section className={styles.shell}>
      <div className={styles.hud}>
        <div>
          <strong>{t.title}</strong>
          <span>{t.subtitle} · {modeLabel}</span>
        </div>
        <div className={styles.stats}>
          <span>{t.floor} {game.level}</span>
          <span>{t.hp} {game.player.hp}/{game.player.maxHp}</span>
          <span>{t.points} {points}</span>
          <span>{t.weapon} {playerWeapon(game.player)}</span>
          <span>{t.attack} {game.player.attack}</span>
          <span>R{game.player.range}</span>
          <span>{t.armor} {game.player.armor}</span>
          <span>{t.shards} {game.player.shards}</span>
          <span>{t.keys} {game.player.keys}</span>
          <span>{t.flares} {game.player.flares}</span>
        </div>
      </div>

      <div className={styles.stage} onPointerDown={moveFromStage}>
        <canvas ref={canvasRef} aria-label={t.title} />
      </div>

      <aside className={styles.panel}>
        <div className={styles.profileBox}>
          <label>
            <span>{t.name}</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={20} />
          </label>
          <button type="button" onClick={saveProfile}>{t.saveProfile}</button>
          <div className={styles.skinGrid} aria-label={t.skin}>
            {skins.map((skin) => (
              <button
                type="button"
                key={skin}
                className={profile.skin === skin ? styles.activeSkin : ''}
                onClick={() => changeSkin(skin)}
              >
                <i style={{ background: skinColor(skin) }} />
                {skin}
              </button>
            ))}
          </div>
          <small>{profile.id}</small>
        </div>
        <p>{game.phase === 'dead' ? t.dead : game.phase === 'won' ? t.won : t.controls}</p>
        <div className={styles.upgradeList}>
          <strong>{t.upgrades}</strong>
          <span>
            {game.player.upgradesTaken.length
              ? game.player.upgradesTaken.map((upgrade) => upgrades[upgrade][locale][0]).join(' · ')
              : t.none}
          </span>
        </div>
        {game.phase === 'won' && game.secret ? <strong>{t.secret}</strong> : null}
        {game.phase === 'won' && !game.secret ? <strong>Faltaban 3 llaves y 14 fragmentos para ver lo que habia detras.</strong> : null}
        <div className={styles.ranking}>
          <strong>{t.ranking}</strong>
          {leaderboard.slice(0, 10).map((entry, index) => (
            <span key={entry.id}>
              {index + 1}. {entry.name} · {entry.id} · {entry.points} · F{entry.floor}
            </span>
          ))}
        </div>
        <div className={styles.log}>
          {game.log.map((item) => <span key={`${item.id}-${item.text}`}>{item.text}</span>)}
        </div>
        <button type="button" onClick={start}>{game.phase === 'playing' ? t.restart : t.newRun}</button>
      </aside>

      {game.phase === 'upgrade' ? (
        <div className={styles.upgradeOverlay}>
          <div className={styles.upgradePanel}>
            <span>{t.choose}</span>
            <div className={styles.upgradeGrid}>
              {game.upgrades.map((upgrade) => (
                <button type="button" key={upgrade} onClick={() => chooseUpgrade(upgrade)}>
                  <strong>{upgrades[upgrade][locale][0]}</strong>
                  <small>{upgrades[upgrade][locale][1]}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className={styles.touch}>
        <button type="button" onClick={() => move(0, -1)}>↑</button>
        <button type="button" onClick={() => move(-1, 0)}>←</button>
        <button type="button" onClick={() => move(1, 0)}>→</button>
        <button type="button" onClick={() => move(0, 1)}>↓</button>
        <button type="button" onClick={flare}>*</button>
      </nav>
    </section>
  )
}
