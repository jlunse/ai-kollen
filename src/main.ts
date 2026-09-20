import '@angular/compiler';
import { Component, signal, computed, enableProdMode, OnDestroy } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import initialNews from '../public/news.json';

type News = typeof initialNews;
@Component({
  selector: 'ai-kollen',
  standalone: true,
  template: `
    <a class="skip" href="#nyheter">Hoppa till nyheterna</a>
    <div class="page">
      <header class="masthead">
        <a href="#" class="brand" aria-label="AI-kollen, startsida"><span class="brand-mark" aria-hidden="true">✳</span>AI<span class="brand-light">-kollen</span><span class="brand-dot">.</span></a>
        <nav aria-label="Huvudmeny"><a href="#nyheter">Nyheter</a><a href="#kallor">Källor & urval <span aria-hidden="true">↗</span></a></nav>
      </header>
      <main id="nyheter">
        <div class="edition"><span class="eyebrow">AI-VÄRLDEN, I KORTHET</span><span>{{ editionDate() }}</span></div>
        <div class="section-heading"><h1>Det senaste som är värt att veta.</h1><p>Utvalda AI-nyheter. Sammanfattade på svenska.</p></div>
        <div class="update-line"><span class="update-dot" [class.old]="stale()" aria-hidden="true"></span><span>Senast kontrollerat {{ date(news().checkedAt, true) }}</span><span class="cadence">Planerat intervall: 4 timmar</span></div>
        @if (stale()) { <p class="notice" role="status">Uppdateringen är försenad. Här visas den senaste tillgängliga utgåvan.</p> }
        @if (loadError()) { <p class="notice" role="status">Det gick inte att kontrollera en ny utgåva. Senast hämtade nyheter visas.</p> }
        @if (news().articles.length) {
          <section class="top-stories" aria-label="I fokus">
            <article class="lead">
              <div class="story-meta"><span class="tag">{{ news().articles[0].category }}</span><span class="focus-label">I FOKUS</span></div>
              <h2><a [href]="news().articles[0].sources[0].url" target="_blank" rel="noopener noreferrer">{{ news().articles[0].title }} <span class="inline-arrow" aria-hidden="true">↗</span></a></h2>
              <p class="lead-summary">{{ news().articles[0].summary }}</p>
              <div class="byline"><time [attr.datetime]="news().articles[0].publishedAt">{{ date(news().articles[0].publishedAt) }}</time><span>·</span><span>Sammanfattad källnotis</span></div>
              <div class="source-links">@for (source of news().articles[0].sources; track source.url) {<a [href]="source.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Läs originalet hos ' + source.name + ': ' + source.originalTitle">{{ source.name }} <span aria-hidden="true">↗</span></a>}</div>
            </article>
            <div class="briefs">
              @for (article of news().articles.slice(1,3); track article.id) {
                <article class="brief"><div class="story-meta"><span class="tag">{{article.category}}</span><time [attr.datetime]="article.publishedAt">{{date(article.publishedAt)}}</time></div><h2><a [href]="article.sources[0].url" target="_blank" rel="noopener noreferrer">{{article.title}}</a></h2><p>{{article.summary}}</p><div class="source-links">@for (source of article.sources; track source.url) {<a [href]="source.url" target="_blank" rel="noopener noreferrer">{{source.name}} <span aria-hidden="true">↗</span></a>}</div></article>
              }
            </div>
          </section>
          <div class="section-divider"><h2>Mer att ha koll på</h2><span>{{Math.max(0, news().articles.length - 3)}} nyheter</span></div>
          <section class="news-grid" aria-label="Fler AI-nyheter">
            @for (article of news().articles.slice(3); track article.id; let index = $index) {
              <article class="news-card"><div class="story-meta"><span class="tag">{{article.category}}</span><span class="number" aria-hidden="true">{{(index + 4).toString().padStart(2, '0')}}</span></div><h3><a [href]="article.sources[0].url" target="_blank" rel="noopener noreferrer">{{article.title}}</a></h3><p>{{article.summary}}</p><div class="card-bottom"><time [attr.datetime]="article.publishedAt">{{date(article.publishedAt)}}</time><div class="source-links">@for (source of article.sources; track source.url) {<a [href]="source.url" target="_blank" rel="noopener noreferrer">{{source.name}} <span aria-hidden="true">↗</span></a>}</div></div></article>
            }
          </section>
        } @else { <p class="notice">Det finns inga verifierade nyheter att visa just nu.</p> }
        <section class="sources-section" id="kallor" aria-labelledby="sources-title">
          <div><span class="eyebrow">BAKOM RUBRIKERNA</span><h2 id="sources-title">Källorna först.<br>Alltid.</h2><p>Varje notis länkar till originalet, där du kan läsa hela sammanhanget.</p></div>
          <div class="source-details"><h3>Så görs urvalet</h3><p>Med en schemalagd Codex-uppgift kan etablerade teknikmediers AI-flöden kontrolleras var fjärde timme. Uppgiften behöver konfigureras separat. Nyheter väljs efter aktualitet och betydelse för teknik, forskning och samhälle. Det är ett redaktionellt urval, inte en mätning av popularitet.</p><p>Sammanfattningarna skrivs av AI utifrån källornas publicerade nyhetsnotiser. De ersätter inte originalartiklarna och kan innehålla fel. Uppgifter och bedömningar tillskrivs respektive källa. Originalen kan vara på engelska eller kräva abonnemang.</p><ul class="source-list">@for (source of news().sources; track source.name) {<li><a [href]="source.url" target="_blank" rel="noopener noreferrer">{{source.name}} <span aria-hidden="true">↗</span></a><span [class.source-failed]="source.status !== 'ok'">{{source.status === 'ok' ? 'Hämtad vid senaste kontrollen' : 'Kunde inte hämtas'}}</span></li>}</ul></div>
        </section>
      </main>
      <footer><a class="footer-brand" href="#">✳ AI-kollen</a><span>En kortare väg till nyhetsläget.</span><a href="#nyheter">Till toppen ↑</a></footer>
    </div>`
})
class App implements OnDestroy {
  readonly Math = Math;
  news = signal<News>(initialNews);
  now = signal(Date.now());
  loadError = signal(false);
  stale = computed(() => this.now() - Date.parse(this.news().checkedAt) > 6*60*60*1000);
  private timer = window.setInterval(() => { this.now.set(Date.now()); if(!document.hidden) void this.refresh(); }, 300000);
  private onFocus = () => { this.now.set(Date.now()); void this.refresh(); };
  constructor(){ window.addEventListener('focus',this.onFocus); void this.refresh(); }
  ngOnDestroy(){ clearInterval(this.timer); window.removeEventListener('focus',this.onFocus); }
  date(value:string, time=false){ return new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',year:'numeric',...(time?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(value)); }
  editionDate(){return new Intl.DateTimeFormat('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(this.news().checkedAt));}
  async refresh(){
    try {
      const response=await fetch('/news.json',{cache:'no-store',signal:AbortSignal.timeout(12000)});
      if(!response.ok) throw new Error('Unavailable');
      const data=await response.json();
      if(data.schemaVersion!==1 || !Array.isArray(data.articles) || !Number.isFinite(Date.parse(data.checkedAt))) throw new Error('Invalid edition');
      if(Date.parse(data.checkedAt)>=Date.parse(this.news().checkedAt)) this.news.set(data);
      this.loadError.set(false);
    }catch{this.loadError.set(true);}
  }
}
enableProdMode();
bootstrapApplication(App).catch(()=>{document.getElementById('startup-error')?.removeAttribute('hidden');});
