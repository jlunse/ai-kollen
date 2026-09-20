import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const allowed=new Set(['/index.html','/app.js','/news.json','/style.css','/favicon.svg']);
createServer(async(req,res)=>{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'/index.html':path;if(!allowed.has(file)){res.writeHead(404);res.end();return;}try{const content=await readFile('dist'+file);res.writeHead(200,{'Content-Type':types[file.slice(file.lastIndexOf('.'))]??'application/octet-stream','Cache-Control':'no-store'});res.end(content);}catch{res.writeHead(404);res.end();}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
