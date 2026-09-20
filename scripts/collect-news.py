"""Fetch bounded public RSS/Atom candidates; never calls a paid AI API."""
import concurrent.futures
import datetime as dt
import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [
    ('TechCrunch', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'https://techcrunch.com/category/artificial-intelligence/'),
    ('The Verge', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'https://www.theverge.com/ai-artificial-intelligence'),
    ('MIT Technology Review', 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', 'https://www.technologyreview.com/topic/artificial-intelligence/'),
]
NOW = dt.datetime.now(dt.timezone.utc)

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()

def collect(source):
    name, feed, homepage = source
    status = {'name': name, 'url': homepage, 'feed': feed, 'checkedAt': NOW.isoformat(), 'status': 'ok'}
    try:
        req = urllib.request.Request(feed, headers={'User-Agent': 'AI-kollen/1.0 RSS reader'})
        with urllib.request.urlopen(req, timeout=20) as response:
            raw = response.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ValueError('feed_too_large')
        root = ET.fromstring(raw)
        entries = root.findall('./channel/item') or root.findall('{http://www.w3.org/2005/Atom}entry')
        articles = []
        for entry in entries[:35]:
            fields = {child.tag.split('}')[-1]: child for child in entry}
            def get(tag):
                el = fields.get(tag)
                return ''.join(el.itertext()) if el is not None else ''
            links = [el for el in entry if el.tag.split('}')[-1] == 'link']
            url = next((el.attrib.get('href', '') or (el.text or '') for el in links if el.attrib.get('rel', 'alternate') == 'alternate'), '')
            if not url.startswith('https://'):
                continue
            stamp = get('pubDate') or get('published') or get('updated')
            try:
                published = email.utils.parsedate_to_datetime(stamp) if ',' in stamp else dt.datetime.fromisoformat(stamp.replace('Z', '+00:00'))
                published = published.replace(tzinfo=dt.timezone.utc) if published.tzinfo is None else published
            except (ValueError, TypeError):
                continue
            if not dt.timedelta(hours=-1) <= NOW - published <= dt.timedelta(days=7):
                continue
            description = plain(get('description') or get('summary') or get('content'))[:2200]
            articles.append({'source': name, 'title': plain(get('title')), 'url': url, 'publishedAt': published.isoformat(), 'excerpt': description, 'basis': 'publisher_feed'})
        status['candidateCount'] = len(articles)
        return status, articles
    except Exception as error:
        status.update(status='unavailable', reason=type(error).__name__, candidateCount=0)
        return status, []

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(collect, SOURCES))
articles = sorted([a for _, items in results for a in items], key=lambda a:a['publishedAt'], reverse=True)
result = {'checkedAt': NOW.isoformat(), 'sources': [s for s, _ in results], 'candidates': articles}
target = ROOT / '.sites-runtime' / 'candidates.json'
target.parent.mkdir(exist_ok=True)
tmp = target.with_suffix('.tmp')
tmp.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
tmp.replace(target)
print(json.dumps({'sources': result['sources'], 'candidateCount': len(articles)}, ensure_ascii=False))
if not articles:
    raise SystemExit(1)
