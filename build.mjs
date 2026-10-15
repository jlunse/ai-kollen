import {build} from 'esbuild';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/validate-news.mjs'],{stdio:'inherit'});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true});
await build({entryPoints:['src/main.ts'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'dist/app.js',tsconfigRaw:{compilerOptions:{experimentalDecorators:true}},define:{'ngDevMode':'false'}});
const news=JSON.parse(await readFile('public/news.json','utf8'));
const escape=(s)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const content=news.articles.map((a,index)=>`<article><h2>${escape(a.title)}</h2><p>${escape(a.summary)}</p><p>${a.sources.map(s=>`<a href="${escape(s.url)}">${escape(s.name)}</a>`).join(' · ')}</p></article>${index === Math.min(2, news.articles.length - 1) ? `<aside class="altotrail-promo" aria-label="Reklam för AltoTrail">
              <div class="promo-copy"><span class="eyebrow">REKLAM · FRÅN SAJTÄGAREN</span><h2>Upptäck AltoTrail.</h2><p>Nyfiken? Ta en titt på AltoTrail.com.</p></div>
              <a class="promo-link" href="https://altotrail.com" target="_blank" rel="noopener noreferrer">Besök AltoTrail <span aria-hidden="true">↗</span></a>
</aside>` : ''}`).join('');
await writeFile('dist/index.html',`<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI-kollen — avslutat Angular-experiment</title><meta name="description" content="Avslutat experiment med Angular och Codex Sites. Sista sparade nyhetsutgåvan med svenska sammanfattningar och originalkällor. Inga fler uppdateringar."><meta name="theme-color" content="#2c593f"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css"></head><body><ai-kollen><main class="page"><h1>AI-kollen</h1><p>Experimentet avslutades den 15 oktober 2026. Bevakningen är stoppad och sajten uppdateras inte längre. Nyheterna är en historisk utgåva. <a href="https://github.com/jlunse/ai-kollen">Se koden på GitHub</a>. Sista källkontroll ${escape(news.checkedAt)}.</p>${content}</main></ai-kollen><p id="startup-error" hidden>Den interaktiva sidan kunde inte starta. Ladda om sidan för att försöka igen.</p><noscript>JavaScript är avstängt. Den historiska utgåvan och källänkarna är tillgängliga.</noscript><script type="module" src="/app.js"></script></body></html>`);
console.log('Built Angular site with '+news.articles.length+' sourced stories.');
