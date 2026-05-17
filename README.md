# Exemplo do Bridgee React Native SDK

Um aplicativo React Native completo que demonstra como integrar e usar o **Bridgee SDK** para atribuição de usuários e rastreamento UTM. Este projeto mostra as melhores práticas para implementar o Bridgee SDK em suas aplicações React Native.

É o equivalente em React Native dos projetos [`bridgee-android-example`](https://github.com/bridgee-ai/bridgee-android-example) (Java) e [`bridgee-ios-example`](https://github.com/bridgee-ai/bridgee-ios-example) (Swift). A funcionalidade é a mesma: uma única tela com um formulário (nome, email, telefone) e um botão que dispara `firstOpen()` e mostra os UTMs retornados.

## 🚀 Principais Funcionalidades

- **Integração Completa do Bridgee SDK** - Mostra configuração e inicialização adequada do SDK via `@bridgee-ai/react-native-sdk`
- **Integração com Firebase Analytics** - Demonstra o uso do Firebase como provedor de analytics (o SDK cuida da comunicação para associar a sessão ao canal de aquisição)
- **Coleta de Dados do Usuário** - Interface de formulário para coletar informações do usuário (nome, email, telefone)
- **Recuperação de Dados UTM** - Exibe parâmetros UTM (source, medium, campaign) de matches bem-sucedidos
- **Tratamento de Erros** - Manipulação adequada de Promises para cenários de sucesso e erro
- **Expo Dev Build** - Usa Expo com dev client para embarcar o código nativo do SDK

## 📋 Requisitos

- **Node.js 18+** e **npm 9+** (ou Yarn)
- **Watchman** (apenas macOS): `brew install watchman`
- **Xcode 15+** e **CocoaPods**: `sudo gem install cocoapods`
- **Android Studio** (Iguana+) com SDK 34 e um emulador (AVD) configurado
- **Projeto Firebase** (para provedor de analytics)
- **Conta de dev Apple** (apenas para rodar em iPhone físico)

> ⚠️ **Importante:** este projeto usa Expo com **dev build**. Isso significa que você compila seu próprio APK/IPA com o código nativo do Bridgee SDK embutido. O Expo Go (app da App Store/Play Store) **não funciona aqui**.

## 🛠️ Instruções de Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/bridgee-ai/bridgee-react-native-example.git
cd bridgee-react-native-example
```

### 2. Instalar Dependências
```bash
npm install
```

> ℹ️ **Sobre os avisos do `npm audit`:** o install reporta ~29 vulnerabilidades, mas todas vêm de dependências transitivas de dev-time (`@expo/cli`, `prebuild-config`, `tar`, `xmldom`, `undici` via `firebase` web SDK, etc.). Elas **não são embarcadas no APK/IPA** — o app em runtime usa os SDKs nativos do Firebase, não o JS web SDK. Para zerar o audit seria preciso subir Expo 51→55 e `@react-native-firebase` 20→24 (breaking changes em toda a stack), o que está fora do escopo deste exemplo. Pode ignorar os warnings com segurança.

### 3. Configuração do Firebase
1. Crie um projeto Firebase no [Console do Firebase](https://console.firebase.google.com/)
2. Adicione um app **Android** com package name: `ai.bridgee.reactnativeexample`
3. Adicione um app **iOS** com bundle ID: `ai.bridgee.reactnativeexample`
4. Baixe os arquivos `google-services.json` e `GoogleService-Info.plist`
5. Substitua os arquivos placeholder na **raiz** deste projeto (não em subpastas — o Expo copia para os lugares certos durante o prebuild)

### 4. Configuração do Bridgee SDK
Atualize a configuração em `src/bridgee.ts`:

```ts
await BridgeeSDK.configure({
  provider: FirebaseAnalyticsProvider,
  tenantId: 'your-tenant-id',    // Fornecido pela Bridgee
  tenantKey: 'your-tenant-key',  // Fornecido pela Bridgee
  dryRun: false,                 // true para testes, false para produção
});
```

### 5. Gerar os Projetos Nativos (`prebuild`)
```bash
npx expo prebuild --clean
```

Esse comando materializa as pastas `ios/` e `android/` a partir do `app.json`, aplicando os config plugins do Bridgee, Firebase e expo-dev-client. Rode novamente sempre que mudar `app.json`, `package.json` ou substituir os arquivos do Firebase.

### 6. Executar o Projeto

**iOS (simulador):**
```bash
npm run ios
```

**iOS (iPhone físico):**
1. Conecte o iPhone via USB e confie no Mac
2. Abra `ios/BridgeeRnExample.xcworkspace` no Xcode
3. Em **Signing & Capabilities**, selecione seu Team Apple. Se der erro de bundle ID duplicado, troque para algo único (ex.: `ai.bridgee.reactnativeexample.seunome`)
4. Selecione seu iPhone no topo do Xcode e aperte ▶️ (Run)
5. Na primeira execução, no iPhone: **Ajustes > Geral > VPN e Gerenciamento de Dispositivos > [seu perfil] > Confiar**

**Android (emulador ou físico):**
```bash
npm run android
```
Para dispositivo físico: ative **Opções do desenvolvedor** e **Depuração USB** no Android, conecte via USB e autorize a chave.

## 📱 Como Funciona

### Fluxo do Usuário
1. **Inicialização automática** - O `useEffect` do `App.tsx` chama `initBridgee()` uma vez ao abrir o app
2. **Inserir Dados do Usuário** - Preencha nome, email e/ou número de telefone (ou deixe em branco)
3. **Tocar em "Bridgee First Open"** - Aciona o método `firstOpen` do SDK
4. **Ver Resultados** - Veja os dados UTM (sucesso) ou mensagem de erro em um `Alert`

### Resposta de Sucesso
Quando um match é encontrado, o app exibe:
```
Atribuição recebida

source: google
medium: cpc
campaign: summer_sale
```

### Resposta de Erro
Quando nenhum match é encontrado ou ocorre uma falha:
```
Erro
First Open without Match - No UTM Data
```

## 🏗️ Guia de Implementação

### 1. Adicionar Dependência do Bridgee SDK
No seu projeto React Native (Expo dev build recomendado):
```bash
npm install @bridgee-ai/react-native-sdk
```

Adicione o plugin em `app.json`:
```json
{
  "expo": {
    "plugins": [
      "@bridgee-ai/react-native-sdk"
    ]
  }
}
```

> ⚠️ O SDK exige **iOS 14.0+** como deployment target. Garanta via `expo-build-properties`:
> ```json
> ["expo-build-properties", { "ios": { "deploymentTarget": "14.0" } }]
> ```

### 2. Configurar o SDK
Crie um módulo de inicialização (ex.: `src/bridgee.ts`):
```ts
import {
  BridgeeSDK,
  FirebaseAnalyticsProvider,
} from '@bridgee-ai/react-native-sdk';

export async function initBridgee() {
  await BridgeeSDK.configure({
    provider: FirebaseAnalyticsProvider,
    tenantId: 'your-tenant-id',
    tenantKey: 'your-tenant-key',
    dryRun: false,
  });
}
```

Chame `initBridgee()` uma vez na inicialização do app:
```tsx
import { useEffect } from 'react';
import { initBridgee } from './src/bridgee';

export default function App() {
  useEffect(() => {
    initBridgee().catch((e) => console.error('Bridgee init failed', e));
  }, []);
  // ...
}
```

### 3. Provider de Analytics
O SDK já oferece o `FirebaseAnalyticsProvider` pronto, que delega para `@react-native-firebase/analytics`. Se quiser um provider customizado, implemente a interface `AnalyticsProvider`:

```ts
import type { AnalyticsProvider } from '@bridgee-ai/react-native-sdk';

const MyAnalyticsProvider: AnalyticsProvider = {
  logEvent(name, params) {
    // delegue para seu analytics
  },
  setUserProperty(name, value) {
    // delegue para seu analytics
  },
};
```

### 4. Usar o SDK
Chame `firstOpen` com os dados do usuário (todos opcionais):
```ts
import { BridgeeSDK, MatchBundle } from '@bridgee-ai/react-native-sdk';

async function sendFirstOpen() {
  const bundle = new MatchBundle()
    .withName('João Silva')
    .withEmail('joao@exemplo.com')
    .withPhone('+5511999999999');

  try {
    const utm = await BridgeeSDK.firstOpen(bundle);
    console.log('UTM Source:', utm.utm_source);
    console.log('UTM Medium:', utm.utm_medium);
    console.log('UTM Campaign:', utm.utm_campaign);
  } catch (e) {
    // Erro ou nenhum match encontrado
    console.error('Bridgee error:', e);
  }
}
```

## 📁 Estrutura do Projeto

```
bridgee-react-native-example/
├── App.tsx                    # Tela única: formulário + botão + alerta
├── src/
│   └── bridgee.ts             # Inicialização do SDK (configure)
├── index.ts                   # Entry point do Expo
├── app.json                   # Config do Expo + plugins nativos
├── package.json
├── tsconfig.json
├── babel.config.js
├── google-services.json       # Configuração do Firebase Android (placeholder)
├── GoogleService-Info.plist   # Configuração do Firebase iOS (placeholder)
└── README.md
```

**Pastas geradas** (não versionadas):
- `ios/` e `android/` — criadas por `expo prebuild`, podem ser apagadas a qualquer momento
- `node_modules/` — criada por `npm install`

## 🔧 Componentes Principais

### Configuração do BridgeeSDK
Parâmetros de `BridgeeSDK.configure({ ... })`:
- **provider**: Provedor de analytics (use `FirebaseAnalyticsProvider` pronto ou implemente o seu)
- **tenantId**: Seu identificador único de tenant da Bridgee
- **tenantKey**: Sua chave de autenticação da Bridgee
- **dryRun**: Defina como `true` para testes (não faz chamada real), `false` para produção

### MatchBundle
Builder para passar dados do usuário ao SDK (API fluente). **Todos os campos são opcionais** — o SDK resolve atribuição mesmo com um bundle vazio, mas mais dados = maior confiança no match:
- `.withName(string)` — Nome do usuário
- `.withEmail(string)` — Email do usuário
- `.withPhone(string)` — Telefone do usuário
- `.withGclid(string)` — Google Click ID
- `.withCustomParam(key, value)` — Parâmetros customizados

> 🔗 **Importante:** os mesmos parâmetros enviados aqui devem ser propagados nas URLs de captura (os **blinks**, ex.: `https://ios.seuapp.com.br/?email=...&phone=...&utm_source=...`). O servidor Bridgee compara os sinais dos dois lados (clique vs. instalação) — quanto maior a interseção, mais eficiente e preciso o match.

### Resposta `UTMData`
`BridgeeSDK.firstOpen(bundle)` retorna uma `Promise<UTMData>`:
- `utm_source` — Fonte de tráfego (ex: "google", "facebook")
- `utm_medium` — Meio de marketing (ex: "cpc", "email")
- `utm_campaign` — Nome da campanha (ex: "promocao_verao")

Em caso de falha ou ausência de match, a Promise é **rejeitada** — use `try/catch` ou `.catch()`.

## 🧩 Analogias com Android / iOS

Se você já olhou os outros exemplos, os equivalentes são:

| Android (Java) | iOS (Swift) | React Native (este projeto) |
|---|---|---|
| `MainActivity.initializeBridgeeSDK()` | `BridgeeIOSExampleApp.init()` | `src/bridgee.ts → initBridgee()` |
| `activity_main.xml` (layout) | `ContentView.swift` (body) | `App.tsx` (JSX) |
| `AnalyticsProvider` anônimo | `FirebaseAnalyticsProvider` classe | `FirebaseAnalyticsProvider` pronto no SDK |
| `bridgeeSDK.firstOpen(bundle, callback)` | `BridgeeSDK.shared.firstOpen(with: bundle) { ... }` | `await BridgeeSDK.firstOpen(bundle)` (Promise) |

## 🆘 Troubleshooting

- **`pod install` falhou no iOS** → apague `ios/Pods` e `ios/Podfile.lock`, rode `cd ios && pod install` de novo.
- **`CocoaPods could not find compatible versions` com deployment target** → o SDK exige iOS 14.0. Confirme que `expo-build-properties` está com `deploymentTarget: "14.0"` em `app.json` e rode `npx expo prebuild --clean`.
- **Cache do Metro corrompido** → `npx expo start --clear`.
- **`EMFILE: too many open files, watch`** → instale o Watchman: `brew install watchman`.
- **Erro `No Firebase App '[DEFAULT]'`** → os arquivos do Firebase não foram copiados. Confirme o caminho em `app.json` e rode `npx expo prebuild --clean` novamente.
- **`Unable to resolve module @bridgee-ai/react-native-sdk`** → rode `npm install` e depois `npx expo prebuild --clean`.
- **Build iOS falha com erro de `use_frameworks!`** → já tratamos com `expo-build-properties`. Se persistir, apague `ios/` e rode `npx expo prebuild --clean`.
- **Emulador Android não é detectado** → rode `adb devices`. Se vazio, abra o AVD no Android Studio primeiro.
- **App abre no "Development Servers" mas não conecta** → o Metro não está rodando ou está em outra porta. Rode `npx expo start --dev-client` em um terminal e use `http://localhost:8081` no campo manual.

## 🔒 Notas de Segurança

- Nunca faça commit dos arquivos reais `google-services.json` ou `GoogleService-Info.plist` no controle de versão
- Mantenha suas credenciais de tenant da Bridgee seguras
- Use variáveis de ambiente ou configuração segura para apps de produção

## 📚 Recursos Adicionais

- [Documentação do Bridgee React Native SDK](https://github.com/bridgee-ai/bridgee-react-native-sdk)
- [Bridgee Android Example](https://github.com/bridgee-ai/bridgee-android-example)
- [Bridgee iOS Example](https://github.com/bridgee-ai/bridgee-ios-example)
- [Expo Dev Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native Firebase](https://rnfirebase.io/)

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça suas alterações
4. Envie um pull request
