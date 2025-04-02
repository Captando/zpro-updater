require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');

const app = express();
const PORT = 5656;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const updateLogs = [];
function logUpdate(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  updateLogs.push(line);
}

function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Updater"');
    return res.status(401).send('Auth required');
  }
  const base64 = auth.split(' ')[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
  if (user !== process.env.API_USER || pass !== process.env.API_PASS) {
    return res.status(403).send('Forbidden');
  }
  next();
}

async function downloadFile() {
  const downloadPath = path.resolve(__dirname, 'downloads');
  const fileName = 'zpro_passaporte_shell.zip';
  const filePath = path.join(downloadPath, fileName);

  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  logUpdate('[1] Abrindo navegador...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath });

  logUpdate('[2] Acessando página de login...');
  await page.goto('https://zapdasgalaxiaspassaportezdg.club.hotmart.com/lesson', { waitUntil: 'networkidle2' });
  await page.evaluate(() => { document.body.style.zoom = '75%'; });
  await sleep(4000);
  await page.evaluate(() => {
    const m = document.querySelector('.cookie-alert-container');
    if (m) m.remove();
  });

  logUpdate('[3] Preenchendo login...');
  await page.waitForSelector('form.login-with-password', { timeout: 10000 });
  await page.type('input[data-test="username"]', process.env.HOTMART_EMAIL);
  await page.type('input[data-test="password"]', process.env.HOTMART_PASSWORD);
  await page.click('button[data-test="submit"]');

  logUpdate('[4] Aguardando login...');
  await page.waitForFunction(() => !document.querySelector('form.login-with-password'), { timeout: 30000 });

  logUpdate('[5] Acessando página do ZIP...');
  await page.goto('https://zapdasgalaxiaspassaportezdg.club.hotmart.com/lesson/94JGmMnYeg/z-pro-%252B-instalador-automatico', { waitUntil: 'networkidle2' });
  await page.evaluate(() => { document.body.style.zoom = '75%'; });
  await sleep(8000);

  logUpdate('[6] Baixando ZIP...');
  const downloadSelector = 'a.attachment-card[title="zpro_passaporte_shell.zip"]';
  await page.waitForSelector(downloadSelector, { timeout: 10000 });
  await page.click(downloadSelector);

  for (let i = 0; i < 60; i++) {
    if (fs.existsSync(filePath)) {
      logUpdate('[7] ZIP baixado com sucesso!');
      await browser.close();
      return filePath;
    }
    await sleep(1000);
  }

  await browser.close();
  throw new Error('❌ Timeout ao esperar o ZIP');
}

async function updateSoftware() {
  logUpdate('=== INICIANDO ATUALIZAÇÃO ===');
  const zipFilePath = await downloadFile();

  logUpdate('[8] Descompactando ZIP...');
  await new Promise((resolve, reject) => {
    exec(`unzip -o ${zipFilePath}`, (err, stdout, stderr) => {
      if (err) { logUpdate(`❌ Erro no unzip: ${stderr}`); return reject(err); }
      logUpdate(stdout);
      resolve();
    });
  });

  logUpdate('[9] Dando chmod +x no zpro...');
  await new Promise((resolve, reject) => {
    exec(`chmod +x ./zpro_passaporte_shell/zpro`, (err, stdout, stderr) => {
      if (err) { logUpdate(`❌ Erro no chmod: ${stderr}`); return reject(err); }
      logUpdate(stdout);
      resolve();
    });
  });

  logUpdate('[10] Executando ./zpro e enviando "2"...');
  await new Promise((resolve, reject) => {
    const proc = spawn('./zpro', [], {
      cwd: path.resolve(__dirname, 'zpro_passaporte_shell'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.stdout.on('data', data => logUpdate(`[zpro] ${data}`));
    proc.stderr.on('data', data => logUpdate(`[zpro ERR] ${data}`));
    proc.on('error', err => { logUpdate(`❌ Erro ao executar ./zpro: ${err}`); reject(err); });
    setTimeout(() => { proc.stdin.write('2\n'); }, 1500);
    proc.on('close', async code => {
      logUpdate(`[11] Processo finalizado com código ${code}`);
      logUpdate('[12] Reiniciando a API com PM2...');
      exec(`pm2 restart update-api`, (err, stdout, stderr) => {
        if (err) logUpdate(`❌ Erro ao reiniciar a API: ${stderr}`);
        else logUpdate(stdout);
      });
      resolve();
    });
  });

  return '✅ Atualização concluída com sucesso.\n\n💡 Se esse sistema te ajudou:\n🤝 Apoie no PIX: pix@captando.com.br';
}

app.get('/update', basicAuth, async (req, res) => {
  try {
    const result = await updateSoftware();
    res.send(result);
  } catch (err) {
    logUpdate(`❌ ERRO GERAL: ${err}`);
    res.status(500).send('Erro ao atualizar o sistema. Veja os logs no terminal.');
  }
});

app.get('/update-status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let lastLogIndex = 0;

  const interval = setInterval(() => {
    if (lastLogIndex < updateLogs.length) {
      for (let i = lastLogIndex; i < updateLogs.length; i++) {
        res.write(`data: ${updateLogs[i]}\n\n`);
      }
      lastLogIndex = updateLogs.length;
    }
  }, 1000);

  req.on('close', () => clearInterval(interval));
});

app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'status.html'));
});

app.listen(PORT, () => {
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).flat().forEach((iface) => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`🚀 Servidor rodando em http://${iface.address}:${PORT}/update`);
      console.log(`📺 Status: http://${iface.address}:${PORT}/status`);
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`💡 Se esse sistema te ajudou:`);
  console.log(`🤝 Apoie no PIX: pix@captando.com.br`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
