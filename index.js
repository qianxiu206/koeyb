const express = require("express");
const app = express();
const axios = require("axios");
const os = require('os');
const fs = require("fs");
const path = require("path");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { execSync } = require('child_process');

// --- 环境变量与配置 ---
const API_ENDPOINT = process.env.API_ENDPOINT || '';
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL || '';
const DATA_DIR = process.env.DATA_DIR || './tmp';
const API_PATH = process.env.API_PATH || 'api/shanli';
const SERVER_PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
const SERVICE_ID = process.env.SERVICE_ID || 'c2fee309-ad5b-4fdb-b19d-f2388d37fc45';
const MONITOR_SERVER = process.env.MONITOR_SERVER || '';
const MONITOR_PORT = process.env.MONITOR_PORT || '';
const MONITOR_KEY = process.env.MONITOR_KEY || '';
const GATEWAY_DOMAIN = process.env.GATEWAY_DOMAIN || 'koyeb2.0407123.xyz';
const GATEWAY_AUTH = process.env.GATEWAY_AUTH || 'eyJhIjoiMTlmOGI1NWVlOGY3NjA4ZmY0YzdmZGY2OTM0YzdmZDciLCJ0IjoiN2MzY2ZlYjMtODJhMS00NzE3LTk3NzUtNzliNTc4NjQxNDcwIiwicyI6Ik5EWmlNakV5TTJNdFkyVXhZUzAwTnpZMkxXSm1aVGt0T1dZeU1EVmpNVEZsT1RRdyJ9';
const GATEWAY_PORT = process.env.GATEWAY_PORT || 8005;
const PROXY_HOST = process.env.PROXY_HOST || 'mfa.gov.ua';
const PROXY_PORT = process.env.PROXY_PORT || 443;
const SERVICE_NAME = process.env.SERVICE_NAME || '';

// --- 移植后的高级伪装页面 HTML ---
const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Personal Dashboard</title>
    <style>
        :root {
            --bg-top: #1a2a6c;
            --bg-mid: #b21f1f;
            --bg-bottom: #fdbb2d;
            --glass: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --text: #ffffff;
        }
        * { box-sizing: border-box; transition: all 0.3s ease; }
        body {
            margin: 0; padding: 0; min-height: 100vh;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            background-attachment: fixed;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: var(--text);
            display: flex; justify-content: center; overflow-x: hidden;
        }
        #star-container {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 0; pointer-events: none;
        }
        .star {
            position: absolute; background: white; border-radius: 50%;
            opacity: 0.5; animation: pulse 3s infinite ease-in-out;
        }
        .wrapper {
            position: relative; z-index: 1; width: 100%; max-width: 1000px;
            padding: 40px 20px; display: flex; flex-direction: column; gap: 30px;
        }
        .top-section { display: grid; grid-template-columns: 320px 1fr; gap: 25px; }
        .weather-card {
            background: rgba(0, 0, 0, 0.25); backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border);
            border-radius: 30px; padding: 25px; text-align: center;
        }
        .loc-info { font-size: 14px; opacity: 0.8; margin-bottom: 10px; display: flex; justify-content: space-between; }
        .temp-main { font-size: 64px; font-weight: 200; margin: 15px 0; }
        .weather-desc { font-size: 18px; letter-spacing: 2px; margin-bottom: 20px; }
        .weather-meta {
            display: flex; justify-content: space-around;
            background: rgba(255,255,255,0.05); border-radius: 15px; padding: 10px; font-size: 12px;
        }
        .search-area { display: flex; flex-direction: column; justify-content: center; padding: 0 20px; }
        #clock { font-size: 80px; font-weight: 100; margin-bottom: 15px; font-variant-numeric: tabular-nums; }
        .search-box {
            background: var(--glass); border: 1px solid var(--glass-border);
            border-radius: 50px; padding: 5px 25px; display: flex; align-items: center;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .search-box:focus-within { background: rgba(255,255,255,0.15); transform: scale(1.02); }
        .search-box input {
            background: transparent; border: none; outline: none;
            color: white; font-size: 18px; padding: 12px; width: 100%;
        }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 20px; }
        .nav-item {
            background: var(--glass); border: 1px solid var(--glass-border);
            border-radius: 20px; padding: 20px 10px; text-decoration: none;
            color: white; display: flex; flex-direction: column; align-items: center;
            gap: 10px; backdrop-filter: blur(10px);
        }
        .nav-item:hover { background: rgba(255,255,255,0.2); transform: translateY(-5px); border-color: #fdbb2d; }
        .nav-item .icon {
            width: 45px; height: 45px; border-radius: 12px; display: flex;
            align-items: center; justify-content: center; font-size: 20px;
            font-weight: bold; background: rgba(255,255,255,0.1);
        }
        .nav-item span { font-size: 13px; opacity: 0.9; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        @media (max-width: 768px) {
            .top-section { grid-template-columns: 1fr; }
            #clock { font-size: 60px; text-align: center; }
            .weather-card { order: 2; }
        }
    </style>
</head>
<body>
    <div id="star-container"></div>
    <div class="wrapper">
        <div class="top-section">
            <div class="weather-card">
                <div class="loc-info">
                    <span id="city-name">正在定位...</span>
                    <span id="current-date">Date</span>
                </div>
                <div class="temp-main" id="temp">--°</div>
                <div class="weather-desc" id="weather-text">Loading...</div>
                <div class="weather-meta">
                    <div>湿度 <span id="humidity">--</span>%</div>
                    <div>风速 <span id="windspeed">--</span> km/h</div>
                </div>
            </div>
            <div class="search-area">
                <div id="clock">00:00:00</div>
                <div class="search-box">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input type="text" id="search-input" placeholder="Search Google..." autocomplete="off">
                </div>
            </div>
        </div>
        <div class="nav-grid">
            <a href="https://www.google.com" target="_blank" class="nav-item"><div class="icon" style="background: #4285F4">G</div><span>Google</span></a>
            <a href="https://github.com" target="_blank" class="nav-item"><div class="icon" style="background: #333">Git</div><span>GitHub</span></a>
            <a href="https://www.bilibili.com" target="_blank" class="nav-item"><div class="icon" style="background: #fb7299">B</div><span>Bilibili</span></a>
            <a href="https://www.zhihu.com" target="_blank" class="nav-item"><div class="icon" style="background: #0084ff">知</div><span>知乎</span></a>
            <a href="https://chat.openai.com" target="_blank" class="nav-item"><div class="icon" style="background: #10a37f">AI</div><span>ChatGPT</span></a>
            <a href="https://www.youtube.com" target="_blank" class="nav-item"><div class="icon" style="background: #ff0000">Y</div><span>YouTube</span></a>
            <a href="https://v2ex.com" target="_blank" class="nav-item"><div class="icon" style="background: #333">V</div><span>V2EX</span></a>
            <a href="https://www.notion.so" target="_blank" class="nav-item"><div class="icon" style="background: #000">N</div><span>Notion</span></a>
        </div>
    </div>
    <script>
        function updateClock() {
            const now = new Date();
            document.getElementById('clock').textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
            document.getElementById('current-date').textContent = now.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' });
        }
        setInterval(updateClock, 1000);
        updateClock();

        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = e.target.value;
                if (q) window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
            }
        });

        const weatherCodes = { 0: "晴朗", 1: "大部晴朗", 2: "多云", 3: "阴天", 45: "雾", 48: "雾", 51: "细雨", 61: "小雨", 71: "小雪", 80: "阵雨", 95: "雷阵雨" };
        async function fetchWeather() {
            try {
                const locRes = await fetch('https://ipapi.co/json/');
                const locData = await locRes.json();
                document.getElementById('city-name').textContent = locData.city + ', ' + locData.country_code;
                const wRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + locData.latitude + '&longitude=' + locData.longitude + '&current_weather=true&hourly=relativehumidity_2m');
                const wData = await wRes.json();
                const cur = wData.current_weather;
                document.getElementById('temp').textContent = Math.round(cur.temperature) + '°';
                document.getElementById('weather-text').textContent = weatherCodes[cur.weathercode] || "清爽";
                document.getElementById('windspeed').textContent = cur.windspeed;
                document.getElementById('humidity').textContent = wData.hourly.relativehumidity_2m[0];
            } catch (err) {
                document.getElementById('weather-text').textContent = "网络异常";
            }
        }
        fetchWeather();

        const container = document.getElementById('star-container');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(star);
        }
    </script>
</body>
</html>
`;

// --- 目录与文件名初始化 ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function generateRandomName() {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}

const serviceA = generateRandomName(), serviceB = generateRandomName(), gatewayService = generateRandomName(), monitorService = generateRandomName();
let serviceAPath = path.join(DATA_DIR, serviceA), monitorServicePath = path.join(DATA_DIR, monitorService);
let serviceBPath = path.join(DATA_DIR, serviceB), gatewayServicePath = path.join(DATA_DIR, gatewayService);
let endpointsPath = path.join(DATA_DIR, 'endpoints.txt'), serviceLogPath = path.join(DATA_DIR, 'service.log'), gatewayConfigPath = path.join(DATA_DIR, 'gateway.json');

// --- 路由设置 ---
app.get("/", function(req, res) {
  res.set('Content-Type', 'text/html');
  res.send(LANDING_PAGE_HTML);
});

// --- 功能函数 ---
function cleanupEndpoints() {
  try {
    if (!API_ENDPOINT || !fs.existsSync(endpointsPath)) return;
    let fileContent = fs.readFileSync(endpointsPath, 'utf-8');
    const decoded = Buffer.from(fileContent, 'base64').toString('utf-8');
    const nodes = decoded.split('\n').filter(line => /(vless|vmess|trojan|hysteria2|tuic):\/\//.test(line));
    if (nodes.length > 0) axios.post(`${API_ENDPOINT}/api/delete-nodes`, JSON.stringify({ nodes }), { headers: { 'Content-Type': 'application/json' } }).catch(() => null);
  } catch (err) { }
}

function cleanupData() {
  try {
    fs.readdirSync(DATA_DIR).forEach(file => {
      try { fs.unlinkSync(path.join(DATA_DIR, file)); } catch (e) {}
    });
  } catch (err) { }
}

async function buildServiceConfig() {
  const config = {
    log: { access: '/dev/null', error: '/dev/null', loglevel: 'none' },
    inbounds: [
      { port: GATEWAY_PORT, protocol: 'vless', settings: { clients: [{ id: SERVICE_ID, flow: 'xtls-rprx-vision' }], decryption: 'none', fallbacks: [{ dest: 3001 }, { path: "/api/v1/stream", dest: 3002 }, { path: "/api/v1/channel", dest: 3003 }, { path: "/api/v1/pipe", dest: 3004 }] }, streamSettings: { network: 'tcp' } },
      { port: 3001, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: SERVICE_ID }], decryption: "none" }, streamSettings: { network: "tcp", security: "none" } },
      { port: 3002, listen: "127.0.0.1", protocol: "vless", settings: { clients: [{ id: SERVICE_ID, level: 0 }], decryption: "none" }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/api/v1/stream" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"] } },
      { port: 3003, listen: "127.0.0.1", protocol: "vmess", settings: { clients: [{ id: SERVICE_ID, alterId: 0 }] }, streamSettings: { network: "ws", wsSettings: { path: "/api/v1/channel" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"] } },
      { port: 3004, listen: "127.0.0.1", protocol: "trojan", settings: { clients: [{ password: SERVICE_ID }] }, streamSettings: { network: "ws", security: "none", wsSettings: { path: "/api/v1/pipe" } }, sniffing: { enabled: true, destOverride: ["http", "tls", "quic"] } },
    ],
    outbounds: [{ protocol: "freedom", tag: "direct" }]
  };
  fs.writeFileSync(gatewayConfigPath, JSON.stringify(config, null, 2));
}

function getArch() {
  const arch = os.arch();
  return (arch === 'arm' || arch === 'arm64' || arch === 'aarch64') ? 'arm' : 'amd';
}

function fetchFile(fileName, fileUrl, callback) {
  const writer = fs.createWriteStream(fileName);
  axios({ method: 'get', url: fileUrl, responseType: 'stream' }).then(response => {
    response.data.pipe(writer);
    writer.on('finish', () => { writer.close(); callback(null, fileName); });
    writer.on('error', err => { fs.unlink(fileName, () => {}); callback(err.message); });
  }).catch(err => callback(err.message));
}

async function fetchAndStartServices() {  
  const arch = getArch();
  const files = [
    { fileName: serviceBPath, fileUrl: `https://${arch === 'arm' ? 'arm64' : 'amd64'}.ssss.nyc.mn/web` },
    { fileName: gatewayServicePath, fileUrl: `https://${arch === 'arm' ? 'arm64' : 'amd64'}.ssss.nyc.mn/bot` }
  ];
  if (MONITOR_SERVER && MONITOR_KEY) {
    const type = MONITOR_PORT ? 'agent' : 'v1';
    files.unshift({ fileName: MONITOR_PORT ? serviceAPath : monitorServicePath, fileUrl: `https://${arch === 'arm' ? 'arm64' : 'amd64'}.ssss.nyc.mn/${type}` });
  }

  for (const f of files) {
    await new Promise((res, rej) => fetchFile(f.fileName, f.fileUrl, (err) => err ? rej(err) : res()));
    if (fs.existsSync(f.fileName)) fs.chmodSync(f.fileName, 0o775);
  }

  if (MONITOR_SERVER && MONITOR_KEY) {
    if (!MONITOR_PORT) {
        const port = MONITOR_SERVER.includes(':') ? MONITOR_SERVER.split(':').pop() : '';
        const nezhatls = ['443', '8443', '2096', '2087', '2083', '2053'].includes(port) ? 'true' : 'false';
        fs.writeFileSync(path.join(DATA_DIR, 'config.yaml'), `client_secret: ${MONITOR_KEY}\nserver: ${MONITOR_SERVER}\ntls: ${nezhatls}\nuuid: ${SERVICE_ID}`);
        exec(`nohup ${monitorServicePath} -c "${DATA_DIR}/config.yaml" >/dev/null 2>&1 &`);
    } else {
        let tls = ['443', '8443', '2096', '2087', '2083', '2053'].includes(MONITOR_PORT) ? '--tls' : '';
        exec(`nohup ${serviceAPath} -s ${MONITOR_SERVER}:${MONITOR_PORT} -p ${MONITOR_KEY} ${tls} --disable-auto-update >/dev/null 2>&1 &`);
    }
  }
  await exec(`nohup ${serviceBPath} -c ${gatewayConfigPath} >/dev/null 2>&1 &`);
  if (fs.existsSync(gatewayServicePath)) {
    let args = GATEWAY_AUTH.match(/^[A-Z0-9a-z=]{120,250}$/) ? `tunnel --no-autoupdate --protocol http2 run --token ${GATEWAY_AUTH}` :
               GATEWAY_AUTH.match(/TunnelSecret/) ? `tunnel --config ${DATA_DIR}/tunnel.yml run` :
               `tunnel --no-autoupdate --protocol http2 --logfile ${serviceLogPath} --url http://localhost:${GATEWAY_PORT}`;
    exec(`nohup ${gatewayServicePath} ${args} >/dev/null 2>&1 &`);
  }
}

function configureGateway() {
  if (!GATEWAY_AUTH || !GATEWAY_DOMAIN || !GATEWAY_AUTH.includes('TunnelSecret')) return;
  fs.writeFileSync(path.join(DATA_DIR, 'tunnel.json'), GATEWAY_AUTH);
  const yaml = `tunnel: ${GATEWAY_AUTH.split('"')[11]}\ncredentials-file: ${path.join(DATA_DIR, 'tunnel.json')}\nprotocol: http2\ningress:\n  - hostname: ${GATEWAY_DOMAIN}\n    service: http://localhost:${GATEWAY_PORT}\n  - service: http_status:404`;
  fs.writeFileSync(path.join(DATA_DIR, 'tunnel.yml'), yaml);
}

async function extractHostnames() {
  if (GATEWAY_AUTH && GATEWAY_DOMAIN) return generateServiceEndpoints(GATEWAY_DOMAIN);
  try {
    if (!fs.existsSync(serviceLogPath)) return setTimeout(extractHostnames, 3000);
    const match = fs.readFileSync(serviceLogPath, 'utf-8').match(/https?:\/\/([^ ]*trycloudflare\.com)\/?/);
    if (match) await generateServiceEndpoints(match[1]); else setTimeout(extractHostnames, 3000);
  } catch (err) { setTimeout(extractHostnames, 3000); }
}

async function generateServiceEndpoints(argoDomain) {
  let ISP = 'Unknown';
  try { const res = await axios.get('https://ipapi.co/json/', { timeout: 3000 }); ISP = `${res.data.country_code}_${res.data.org}`; } catch (e) {}
  const nodeName = SERVICE_NAME ? `${SERVICE_NAME}-${ISP}` : ISP;
  const VMESS = { v: '2', ps: nodeName, add: PROXY_HOST, port: PROXY_PORT, id: SERVICE_ID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: argoDomain, path: '/api/v1/channel?ed=2560', tls: 'tls', sni: argoDomain, fp: 'firefox'};
  const subTxt = `vless://${SERVICE_ID}@${PROXY_HOST}:${PROXY_PORT}?encryption=none&security=tls&sni=${argoDomain}&fp=firefox&type=ws&host=${argoDomain}&path=%2Fapi%2Fv1%2Fstream%3Fed%3D2560#${nodeName}\n\nvmess://${Buffer.from(JSON.stringify(VMESS)).toString('base64')}\n\ntrojan://${SERVICE_ID}@${PROXY_HOST}:${PROXY_PORT}?security=tls&sni=${argoDomain}&fp=firefox&type=ws&host=${argoDomain}&path=%2Fapi%2Fv1%2Fpipe%3Fed%3D2560#${nodeName}`;
  fs.writeFileSync(endpointsPath, Buffer.from(subTxt).toString('base64'));
  app.get(`/${API_PATH}`, (req, res) => { res.set('Content-Type', 'text/plain; charset=utf-8'); res.send(Buffer.from(subTxt).toString('base64')); });
  if (API_ENDPOINT && SERVICE_BASE_URL) axios.post(`${API_ENDPOINT}/api/add-subscriptions`, { subscription: [`${SERVICE_BASE_URL}/${API_PATH}`] }).catch(() => null);
}

async function initializeService() {
  configureGateway();
  cleanupEndpoints();
  cleanupData();
  await buildServiceConfig();
  await fetchAndStartServices();
  await extractHostnames();
  setTimeout(() => {
    [serviceLogPath, gatewayConfigPath, serviceBPath, gatewayServicePath, serviceAPath, monitorServicePath].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
  }, 60000);
}

initializeService().catch(console.error);
app.listen(SERVER_PORT, () => console.log(`Server is running on port:${SERVER_PORT}`));
