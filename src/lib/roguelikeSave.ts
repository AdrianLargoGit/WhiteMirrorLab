type RecordValue = Record<string, unknown>
const record = (value: unknown): value is RecordValue => value !== null && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const upgrades = new Set(['edge','heart','shell','flare','sight','vampire','longbow','hammer','rapier','boots','magnet','battery','barrier','executioner'])
const point = (value: unknown, width: number, height: number) => record(value) &&
  finite(value.x) && Number.isInteger(value.x) && value.x >= 0 && value.x < width &&
  finite(value.y) && Number.isInteger(value.y) && value.y >= 0 && value.y < height
const upgradeList = (value: unknown) => Array.isArray(value) && value.every(item => typeof item === 'string' && upgrades.has(item))

function validFloor(value: unknown): value is RecordValue {
  if (!record(value)) return false
  const {width, height} = value
  if (!finite(width) || !finite(height) || !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width > 200 || height > 200) return false
  if (!Array.isArray(value.tiles) || value.tiles.length !== width * height || !value.tiles.every(tile => [0,1,5,6,7].includes(tile))) return false
  if (!Array.isArray(value.seen) || value.seen.length !== width * height || !value.seen.every(item => typeof item === 'boolean')) return false
  if (!point(value.exit,width,height) || (value.backExit !== null && !point(value.backExit,width,height))) return false
  if (!Array.isArray(value.enemies) || !value.enemies.every(enemy => record(enemy) && point(enemy,width,height) &&
      typeof enemy.id === 'string' && ['crawler','sentinel','oracle','warden','duelist','brute','stalker','chemist','mirror','blind'].includes(String(enemy.kind)) &&
      ['hp','maxHp','damage','alert'].every(key=>finite(enemy[key])))) return false
  if (!Array.isArray(value.items) || !value.items.every(item => record(item) && point(item,width,height) &&
      typeof item.id === 'string' && ['heart','shard','flare','key'].includes(String(item.kind)))) return false
  if (!Array.isArray(value.articleRooms) || !value.articleRooms.every(room => record(room) &&
      ['x','y','w','h'].every(key=>finite(room[key])) && Array.isArray(room.lines) && room.lines.every(line=>typeof line === 'string'))) return false
  return finite(value.level) && finite(value.seed)
}

/** A parseable JSON value is not necessarily a usable saved game. */
export function isValidRoguelikeSave(value: unknown): boolean {
  if (!validFloor(value) || !record(value.player) || !record(value.floorMemory)) return false
  const player = value.player
  if (!point(player, value.width as number, value.height as number) ||
      !['hp','maxHp','attack','armor','shards','keys','flares','sight','vampire','score','range','speed','magnet'].every(key=>finite(player[key])) ||
      !['blade','spear','staff','hammer','claws'].includes(String(player.weapon)) || !upgradeList(player.upgradesTaken)) return false
  if ((player.sight as number) < 0 || (player.sight as number) > 400) return false
  if (!['playing','upgrade','won','dead'].includes(String(value.phase)) || !upgradeList(value.upgrades)) return false
  if (!Array.isArray(value.log) || !value.log.every(line=>record(line) && finite(line.id) && typeof line.text === 'string')) return false
  if (!Array.isArray(value.clearedFloors) || !value.clearedFloors.every(finite) || !finite(value.maxLevelReached) || !finite(value.turn)) return false
  return Object.values(value.floorMemory).every(validFloor)
}
