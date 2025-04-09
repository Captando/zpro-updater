# 🚀 ZPRO Passaporte Shell - API de Atualização Automática

![Captando Technologies](https://img.shields.io/badge/Feito%20por-Captando-8A2BE2?style=for-the-badge)
![Version](https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge)

## 📋 Visão Geral

Esta API permite atualizar automaticamente o ZPRO Passaporte Shell através de um endpoint web com autenticação, eliminando a necessidade de fazer atualizações manuais.

O sistema funciona como um serviço web que:
1. Faz login na plataforma Hotmart automaticamente
2. Baixa a versão mais recente do ZPRO Passaporte Shell
3. Extrai e instala a atualização
4. Reinicia o serviço automaticamente

---

## ✨ Funcionalidades

- **🔐 Automação completa**: Login, download e instalação automáticos
- **🛡️ Endpoint seguro**: Autenticação básica protege o acesso à API
- **📊 Monitoramento em tempo real**: Acompanhe o status da atualização via browser
- **⚡ Inicialização automática**: Serviço configurado para iniciar com o sistema
- **🤖 Robustez**: Reinicia automaticamente após atualizações ou falhas

---

## 🔧 Requisitos

- Node.js (v12 ou superior)
- NPM
- Sistema Linux (testado no Ubuntu e Debian)
- Conexão com internet
- Conta Hotmart com acesso ao produto ZPRO Passaporte
- ZPRO Instalado em Ubuntu 22.04 ou +

---

## 🚀 Instalação

1. Clone este repositório ou baixe os arquivos
2. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
HOTMART_EMAIL=seu-email@exemplo.com
HOTMART_PASSWORD=sua-senha-da-hotmart
API_USER=usuario-da-api
API_PASS=senha-da-api
```

3. Execute o script de instalação:

```bash
chmod +x instalar_api_atualiza.sh
./instalar_api_atualiza.sh
```

---

## 🛠️ Como Usar

### Atualizar o ZPRO

Para atualizar o ZPRO, acesse o endpoint de atualização:

```
http://seu-ip:5656/update
```

Será solicitado um nome de usuário e senha - use os valores definidos em `API_USER` e `API_PASS` no arquivo `.env`.

### Monitorar o Processo

Para acompanhar o status da atualização em tempo real:

```
http://seu-ip:5656/status
```

---

## 📁 Estrutura do Projeto

- `update.js` - Código principal da API
- `status.html` - Página de monitoramento em tempo real
- `instalar_api_atualiza.sh` - Script de instalação
- `.env` - Configurações e credenciais

---

## 🔄 Ciclo de Atualização

1. **Autenticação** - Verifica as credenciais de API
2. **Login na Hotmart** - Acessa a conta automaticamente
3. **Download do ZIP** - Obtém a versão mais recente
4. **Descompactação** - Extrai os arquivos
5. **Execução** - Roda o instalador com a opção 2 (atualização)
6. **Reinício** - Reinicia o serviço automaticamente

---

## 🛑 Solução de Problemas

Se encontrar problemas durante a atualização:

1. Verifique se suas credenciais da Hotmart estão corretas no arquivo `.env`
2. Confirme se o servidor tem acesso à internet
3. Verifique os logs do PM2: `pm2 logs update-api`
4. Reinicie o serviço manualmente: `pm2 restart update-api`

---

## 💡 Suporte o Projeto

Este sistema foi desenvolvido por Captando Technologies para facilitar o processo de atualização do ZPRO Passaporte Shell.

Se este sistema te ajudou:
- 🤝 Apoie via PIX: `pix@captando.com.br`

---

## 📜 Licença

MIT © Captando Technologies

*Esta ferramenta é para uso exclusivo de membros do Passaporte ZDG com acesso legítimo ao produto.*
