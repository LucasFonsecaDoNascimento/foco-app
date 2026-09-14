# FocoApp — v0.1 (primeira versão Android)

App de foco/estudos criado com Lucas e o primo Enzo. Feito em React Native + Expo (TypeScript).

## Gerar o APK pelo GitHub (jeito mais simples)

Este projeto já vem com um workflow do GitHub Actions (`.github/workflows/build-apk.yml`) que
gera o APK automaticamente, sem precisar instalar Android Studio nem configurar conta na Expo.

1. Crie um repositório novo (vazio) no GitHub, ex: `foco-app`.
2. Suba este projeto pra ele:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do FocoApp"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/foco-app.git
   git push -u origin main
   ```
3. No GitHub, vá na aba **Actions** do repositório — o build começa sozinho assim que você faz o
   push (leva uns 3-5 minutos).
4. Quando terminar, o APK fica disponível em dois lugares:
   - Aba **Actions** → clique no workflow que rodou → baixe o artefato `foco-app-apk`.
   - Aba **Releases** (barra lateral direita do repositório) → o APK já vem anexado, pronto pra
     baixar direto no celular e instalar.

Toda vez que você der `git push` de novo (depois de alterar o código), um novo APK é gerado
automaticamente. Não precisa fazer nada manual.

> Esse build usa uma assinatura "debug" automática do Android — funciona perfeitamente pra
> instalar e testar no seu celular, mas não é a assinatura de produção que a Play Store exige.
> Quando for publicar na loja de verdade, aí sim vale configurar uma assinatura de release (posso
> te ajudar nessa etapa quando chegar a hora).

## O que já funciona nesta versão

- Timer de sessão de foco e de procrastinação (`Foco`)
- Painel inicial com resumo da semana e sequência de dias em foco (`Início`)
- Grupos locais: criar grupo, gerar código de convite, entrar em grupo por código (`Grupos`)
- FocoRank: Ranking do Bem (mais estudou na semana), Ranking da Vergonha (mais procrastinou na
  semana) e Campeonato Geral (pontos acumulados, nunca reinicia) (`Ranking`)
- Perfil simples com nome do usuário (`Perfil`)
- Sem criação de chats, como definido
- Dados salvos localmente no aparelho (AsyncStorage) — funciona offline

## O que ainda NÃO está nesta versão (próximos passos)

1. **Bloqueio real de outros apps.** No Android, bloquear/impedir o uso de outros apps exige
   permissões nativas (Serviço de Acessibilidade ou `UsageStatsManager` + overlay), que não
   existem no Expo Go e exigem um "custom dev client" (`expo prebuild` + módulo nativo) testado
   direto num aparelho Android real. A versão atual tem a tela de foco funcionando como timer,
   mas não impede fisicamente o uso de outros apps ainda.
2. **Sincronização entre participantes reais de um grupo.** Hoje os grupos existem localmente no
   aparelho — para o ranking mostrar dados de várias pessoas de verdade, é preciso um backend
   (ex.: Firebase, Supabase, ou API própria) que sincronize as sessões de cada membro. A estrutura
   de dados (`src/types/index.ts`) já foi pensada para isso: é só trocar a camada de storage local
   por chamadas de API.
3. **Validação por foto ao vivo** para confirmar início da sessão de foco (ideia registrada, ainda
   não implementada).
4. **Assinatura/paywall** para a feature paga de grupos com exposição de tempo de estudo.

## Como rodar e testar

Pré-requisitos: Node.js 18+, e o app **Expo Go** instalado no celular Android (ou um emulador
Android configurado no Android Studio).

```bash
npm install
npx expo start
```

Isso abre um QR code no terminal — escaneie com o app Expo Go no celular (mesma rede Wi-Fi) para
rodar o app instantaneamente, sem precisar compilar um APK.

## Como gerar um APK/AAB para instalar de verdade

A forma mais simples, sem precisar configurar Android Studio localmente, é usar o **EAS Build** da
própria Expo (tem plano gratuito):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Isso gera um link para baixar o APK direto no celular. Para gerar o pacote final (`.aab`) que vai
na Play Store, use `--profile production` (é preciso configurar `eas.json`, o `eas build:configure`
já cria um padrão).

## Estrutura do projeto

```
App.tsx                     -> ponto de entrada, monta o Provider e a navegação
src/
  types/index.ts             -> modelos de dados (sessão, grupo, membro, etc.)
  context/AppContext.tsx     -> estado global do app (sessões, grupos, pontos) + persistência
  utils/ranking.ts           -> regras do FocoRank (pontuação, rankings semanais, campeonato)
  utils/storage.ts           -> leitura/gravação no AsyncStorage
  utils/id.ts                -> geração de ids e códigos de convite
  navigation/RootNavigator.tsx-> abas: Início, Foco, Grupos, Ranking, Perfil
  screens/                   -> uma tela por arquivo
```

## Sobre a fórmula do Campeonato Geral

```
pontos = (horas de foco × 10) + (bônus por sequência de dias em foco)
       − (horas de procrastinação × 15)
```

A penalidade por procrastinação pesa mais que o ganho por estudo (15 vs. 10 por hora), então uma
semana ruim custa caro no acumulado — decisão registrada por Lucas. Os pesos estão centralizados no
topo de `src/utils/ranking.ts`, então dá pra ajustar fácil enquanto testa o equilíbrio do jogo.
