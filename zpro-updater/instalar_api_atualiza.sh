#!/bin/bash

# Cores ANSI
GREEN='\033[1;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
PURPLE='\033[1;35m'
BOLD='\033[1m'
RESET='\033[0m'

# Cria package.json mínimo se não existir
if [ ! -f package.json ]; then
  echo '{"name": "update-script", "version": "1.0.0", "main": "update.js", "license": "MIT"}' > package.json
fi

# Instala dependências (usando Playwright em vez de Puppeteer e incluindo tesseract.js)
npm install express playwright dotenv unzip tesseract.js

# Instala PM2 globalmente se não existir
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# Inicia com PM2 e salva a configuração
pm2 start update.js --name update-api
pm2 save
eval "$(pm2 startup | grep sudo)"

# Obtém IP do servidor
IP=$(hostname -I | awk '{print $1}')

# Carrega dados do .env
HOTMART_EMAIL=$(grep HOTMART_EMAIL .env | cut -d '=' -f2)
API_USER=$(grep API_USER .env | cut -d '=' -f2)
API_PASS=$(grep API_PASS .env | cut -d '=' -f2)

# Mensagem final
echo -e "${GREEN}✅ API de atualização iniciada com sucesso!${RESET}\n"

echo -e "${YELLOW}🔧 Endpoint de atualização:${RESET}"
echo -e "   ${BLUE}http://$IP:5656/update${RESET}"

echo -e "${YELLOW}🔑 Login via Basic Auth:${RESET}"
echo -e "   Usuário: ${BOLD}$API_USER${RESET}"
echo -e "   Senha:   ${BOLD}$API_PASS${RESET}\n"

echo -e "${YELLOW}📧 E-mail da Hotmart usado para login:${RESET}"
echo -e "   ${PURPLE}$HOTMART_EMAIL${RESET}\n"

echo -e "${YELLOW}📺 Para acompanhar em tempo real:${RESET}"
echo -e "   ${BLUE}http://$IP:5656/status${RESET}\n"

echo -e "${PURPLE}💡 Se esse sistema te ajudou:"
echo -e "🤝 Apoie no PIX: ${BOLD}pix@captando.com.br${RESET}\n"

echo -e "${GREEN}🔁 A API será reiniciada automaticamente após cada atualização.${RESET}\n"
