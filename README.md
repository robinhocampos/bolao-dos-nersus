# Bolão dos Nersus ⚽

App de bolão da Copa do Mundo 2026, com palpites, ranking, grupos, mural e painel administrativo.

## Antes de publicar: configurar o Firebase

Este app guarda os dados do bolão (jogos, palpites, ranking, mensagens) no
Firebase Realtime Database, para que todos os participantes vejam os mesmos
dados em tempo real.

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto gratuito.
2. No menu lateral, vá em **Build → Realtime Database** → **Criar banco de dados**.
3. Na aba **Regras**, cole:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
   (Isso libera leitura e escrita para qualquer pessoa com o link do site — adequado para um bolão entre amigos.)
4. Vá em **⚙️ Configurações do projeto → Seus apps → </> (Web)** e registre um app.
5. Copie o objeto `firebaseConfig` que aparece.
6. Abra o arquivo `src/firebase.js` neste projeto e cole os valores no lugar de `"COLE_AQUI"`.

## Rodar localmente (opcional, para testar antes de publicar)

```bash
npm install
npm run dev
```

## Publicar no Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. O Vercel detecta automaticamente que é um projeto Vite — não precisa mudar nada nas configurações de build.
4. Clique em **Deploy**.

Pronto: o link gerado (algo como `bolao-dos-nersus.vercel.app`) já pode ser
compartilhado com todos os participantes.

## Como funciona o login

O primeiro participante a se cadastrar no app vira automaticamente o
administrador. O admin pode promover outras pessoas a administradoras pela
aba **Admin**, registrar resultados dos jogos, adicionar novas partidas e
marcar quem já pagou a cota.
