import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const n=JSON.parse(await readFile('public/news.json','utf8'));
const hosts={'TechCrunch':['techcrunch.com'],'The Verge':['www.theverge.com'],'MIT Technology Review':['www.technologyreview.com']};
assert.equal(n.schemaVersion,1);assert.equal(n.cadenceHours,4);
for(const key of ['updatedAt','checkedAt']) assert.ok(Number.isFinite(Date.parse(n[key])) && Date.parse(n[key])<=Date.now()+60000,`Invalid ${key}`);
assert.ok(n.articles.length>=0 && n.articles.length<=12);
assert.equal(new Set(n.articles.map(a=>a.id)).size,n.articles.length,'Duplicate article ids');
const seen=new Set();
for(const a of n.articles){
 assert.ok(a.id && a.title && a.category && a.summary);
 assert.ok(a.title.length<=160 && a.summary.length<=900,'Article too long');
 assert.ok(Number.isFinite(Date.parse(a.publishedAt)) && Date.parse(a.publishedAt)<=Date.parse(n.checkedAt)+3600000,'Invalid article date');
 assert.ok(a.sources.length>=1 && a.sources.length<=4);
 for(const s of a.sources){const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.ok(hosts[s.name]?.includes(u.hostname),'Unknown source');assert.ok(!u.username && !u.password);assert.ok(s.originalTitle && s.basis==='publisher_feed');assert.ok(!seen.has(s.url),'Duplicate story link');seen.add(s.url);assert.ok(Number.isFinite(Date.parse(s.publishedAt)));}
}
assert.equal(n.sources.length,3);
for(const s of n.sources){assert.ok(hosts[s.name]);assert.ok(['ok','unavailable'].includes(s.status));assert.ok(Number.isFinite(Date.parse(s.checkedAt)));}
console.log('News validation passed.');
