# Exemplo do Bridgee React Native SDK

Um aplicativo React Native completo que demonstra como integrar e usar o **Bridgee SDK** para atribuição de usuários e rastreamento UTM. Este projeto mostra as melhores práticas para implementar o Bridgee SDK em suas aplicações React Native.

É o equivalente em React Native dos projetos [`bridgee-android-example`](../bridgee-android-example) (Java) e [`bridgee-ios-example`](../bridgee-ios-example) (Swift). A funcionalidade é a mesma: uma única tela com um formulário (nome, email, telefone) e um botão que dispara `firstOpen()` e mostra os UTMs retornados.

## 🚀 Principais Funcionalidades

- **Integração completa do Bridgee SDK** (`@bridgee-ai/react-native-sdk`)
- **Integração com Firebase Analytics** via `@react-native-firebase/analytics` (o SDK injeta os UTMs como user properties)
- **Coleta de dados do usuário** — formulário simples com nome, email e telefone
- **Recuperação de dados UTM** — exibe `utm_source`, `utm_medium` e `utm_campaign` em um alerta
- **Tratamento de erros** — o botão captura falhas da chamada assíncrona e mostra a mensagem

## 📋 Requisitos

- **Node.js 18+**
- **npm 9+** (ou Yarn, se preferir)
- **Watchman** (apenas macOS): `brew install watchman`
- **Xcode 15+** e **CocoaPods**: `sudo gem install cocoapods`
- **Android Studio** (Iguana+) com SDK 34 e um emulador (AVD) configurado
- **Conta de dev Apple** (apenas para rodar em iPhone físico)

> ⚠️ **Importante:** este projeto usa Expo com **dev build**. Isso significa que você compila seu próprio APK/IPA com o código nativo do Bridgee SDK embutido. O Expo Go (app da App Store/Play Store) **não funciona aqui**.

## 🛠️ Instruções de Configuração

### 1. Instalar dependências

```bash
cd bridgee-react-native-example
npm install
```

> ℹ️ **Sobre os avisos do `npm audit`:** o install reporta ~29 vulnerabilidades, mas todas vêm de dependências transitivas de dev-time (`@expo/cli`, `prebuild-config`, `tar`, `xmldom`, `undici` via `firebase` web SDK, etc.). Elas **não são embarcadas no APK/IPA** — o app em runtime usa os SDKs nativos do Firebase, não o JS web SDK. Para zerar o audit seria preciso subir Expo 51→55 e `@react-native-firebase` 20→24 (breaking changes em toda a stack), o que está fora do escopo deste exemplo. Pode ignorar os warnings com segurança.

### 2. Configurar credenciais do Bridgee

Abra `src/bridgee.ts` e substitua os valores:

```ts
await BridgeeSDK.configure({
  provider: FirebaseAnalyticsProvider,
  tenantId: 'tenant-id',    // Fornecido pela Bridgee
  tenantKey: 'tenant-key',  // Fornecido pela Bridgee
  dryRun: false,            // true para testes, false para produção
});
```

### 3. Configurar o Firebase

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2. Adicione um app **Android** com package name `ai.bridgee.reactnativeexample`.
3. Baixe o `google-services.json` e substitua o arquivo placeholder na raiz deste projeto.
4. Adicione um app **iOS** com bundle ID `ai.bridgee.reactnativeexample`.
5. Baixe o `GoogleService-Info.plist` e substitua o arquivo placeholder na raiz deste projeto.

> Os arquivos ficam na raiz do projeto (não em subpastas). O Expo, durante o prebuild, os copia automaticamente para os locais corretos dentro dos projetos nativos gerados.

### 4. Gerar os projetos nativos (`prebuild`)

```bash
npx expo prebuild --clean
```

Esse comando materializa as pastas `ios/` e `android/` a partir do `app.json`, aplicando os config plugins do Bridgee, Firebase e expo-dev-client. Rode novamente sempre que mudar `app.json`, `package.json` ou substituir os arquivos do Firebase.

### 5. Rodar no iOS

**Simulador** (mais simples):
```bash
npm run ios
```

**iPhone físico:**
1. Conecte o iPhone via USB e confie no Mac.
2. Abra `ios/BridgeeRnExample.xcworkspace` no Xcode.
3. Em **Signing & Capabilities**, selecione seu Team Apple. Se der erro de bundle ID duplicado, troque para algo único (ex.: `ai.bridgee.reactnativeexample.seuseunome`).
4. No Xcode, selecione seu iPhone no topo e aperte ▶️ (Run).
5. Na primeira execução, no iPhone: **Ajustes > Geral > VPN e Gerenciamento de Dispositivos > [seu perfil] > Confiar**.

### 6. Rodar no Android

**Emulador:**
```bash
npm run android
```

**Dispositivo físico:**
1. No celular, ative **Opções do desenvolvedor** e **Depuração USB** (toque 7× em *Sobre o telefone > Número da versão*).
2. Conecte via USB e autorize a chave do computador.
3. Rode `npm run android` — o Metro escolhe o dispositivo conectado.

## 🧪 Como testar o fluxo end-to-end

1. Abra o app. O `useEffect` do `App.tsx` chama `initBridgee()` uma vez.
2. Preencha nome / email / telefone (ou deixe em branco — o SDK aceita).
3. Toque em **Bridgee First Open**.
4. Aguarde o alerta com `source`, `medium` e `campaign`.
5. No Firebase Analytics (DebugView), confira que os eventos chegaram com os UTMs como user properties.

Para testar sem tenant real, troque `dryRun: false` para `dryRun: true` em `src/bridgee.ts`. Nesse modo o SDK não faz a chamada real, mas o fluxo do app é igual.

## 📁 Estrutura do projeto

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
├── google-services.json       # Placeholder (Firebase Android)
├── GoogleService-Info.plist   # Placeholder (Firebase iOS)
└── README.md
```

**Pastas geradas** (não versionadas):
- `ios/` e `android/` — criadas por `expo prebuild`, podem ser apagadas a qualquer momento.
- `node_modules/` — criada por `npm install`.

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
- **Cache do Metro corrompido** → `npx expo start --clear`.
- **Erro `No Firebase App '[DEFAULT]'`** → os arquivos do Firebase não foram copiados. Confirme o caminho em `app.json` e rode `npx expo prebuild --clean` novamente.
- **`Unable to resolve module @bridgee-ai/react-native-sdk`** → rode `npm install` e depois `npx expo prebuild --clean`.
- **Build iOS falha com erro de `use_frameworks!`** → já tratamos com `expo-build-properties`. Se persistir, apague `ios/` e rode `npx expo prebuild --clean`.
- **Emulador Android não é detectado** → rode `adb devices`. Se vazio, abra o AVD no Android Studio primeiro.

## 📚 Referências

- SDK: [`@bridgee-ai/react-native-sdk`](../bridgee-react-native-sdk)
- Expo (dev build): https://docs.expo.dev/develop/development-builds/introduction/
- React Native Firebase: https://rnfirebase.io/
