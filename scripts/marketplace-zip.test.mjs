import {test} from 'node:test'
import assert from 'node:assert/strict'
import {loadTypescript} from './test-helpers.mjs'
const {summarizeMarketplaceZip}=loadTypescript('src/lib/marketplaceZipSummary.ts')
function zip(names) {
 const locals=[],entries=[];let position=0
 for(const name of names) {
  const file=Buffer.from(name), data=Buffer.from('test')
  const local=Buffer.alloc(30+file.length+data.length)
  local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(file.length,26);file.copy(local,30);data.copy(local,30+file.length)
  const entry=Buffer.alloc(46+file.length)
  entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,6);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(file.length,28);entry.writeUInt32LE(position,42);file.copy(entry,46)
  locals.push(local);entries.push(entry);position+=local.length
 }
 const directory=Buffer.concat(entries), end=Buffer.alloc(22)
 end.writeUInt32LE(0x06054b50);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(position,16)
 return Buffer.concat([...locals,directory,end])
}
test('ZIP summaries preserve package counts and work with typed-array offsets',()=>{
 const archive=zip(['pack/pet.PET','pack/hat.clothes','readme.txt'])
 const padded=Buffer.concat([Buffer.alloc(17),archive,Buffer.alloc(5)])
 assert.deepEqual(summarizeMarketplaceZip(padded.subarray(17,17+archive.length)),{petCount:1,clothesCount:1,entries:['pack/pet.PET','pack/hat.clothes','readme.txt']})
 assert.deepEqual(summarizeMarketplaceZip(zip([])),{petCount:0,clothesCount:0,entries:[]})
})
test('ZIP rejects traversal, drive-relative paths, null bytes and absolute paths',()=>{
 for(const name of ['../a.pet','folder/../a.pet','folder\\..\\a.pet','C:a.pet','/a.pet','a\0.pet'])assert.throws(()=>summarizeMarketplaceZip(zip([name])),/unsafe/)
})
test('ZIP rejects duplicate paths across case and separator aliases',()=>{
 for(const names of [['a.pet','a.pet'],['Pack/Pet.pet','pack/pet.pet'],['pack/pet.pet','pack\\pet.pet']]) {
  assert.throws(()=>summarizeMarketplaceZip(zip(names)),/duplicate/)
 }
})
test('ZIP rejects ambiguous paths that collide during extraction',()=>{
 for(const name of ['pack/./pet.pet','pack//pet.pet','pack/stream:alternate.pet']) {
  assert.throws(()=>summarizeMarketplaceZip(zip([name])),/unsafe/)
 }
 for(const names of [['pack','pack/pet.pet'],['pack/pet.pet','pack']]) {
  assert.throws(()=>summarizeMarketplaceZip(zip(names)),/conflicting/)
 }
})
test('ZIP rejects corrupt/truncated directories and mismatched local filenames',()=>{
 const archive=zip(['a.pet']), end=archive.length-22, directory=archive.readUInt32LE(end+16)
 assert.throws(()=>summarizeMarketplaceZip(archive.subarray(0,archive.length-1)))
 const extra=Buffer.from(archive);extra.writeUInt16LE(65535,directory+30);assert.throws(()=>summarizeMarketplaceZip(extra))
 const local=Buffer.from(archive);local[30]=98;assert.throws(()=>summarizeMarketplaceZip(local),/Inconsistent/)
 const count=Buffer.from(archive);count.writeUInt16LE(2,end+10);assert.throws(()=>summarizeMarketplaceZip(count))
})
test('ZIP rejects decompression bombs, symbolic links and unsupported encryption',()=>{
 const archive=zip(['a.pet']), directory=archive.readUInt32LE(archive.length-6)
 const bomb=Buffer.from(archive);bomb.writeUInt32LE(800*1024*1024,directory+24);assert.throws(()=>summarizeMarketplaceZip(bomb),/expands/)
 const link=Buffer.from(archive);link.writeUInt32LE(0xa0000000,directory+38);assert.throws(()=>summarizeMarketplaceZip(link),/symbolic/)
 const encrypted=Buffer.from(archive);encrypted.writeUInt16LE(1,directory+8);assert.throws(()=>summarizeMarketplaceZip(encrypted),/Unsupported/)
})
