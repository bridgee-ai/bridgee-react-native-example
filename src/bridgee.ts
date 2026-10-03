import { BridgeeSDK, FirebaseAnalyticsProvider, type AnalyticsProvider } from '@bridgee-ai/react-native-sdk';

let consentGranted = false;
let preserveNativeGoogle = false;
let configuration: Promise<void> | undefined;

export function setAttributionPolicy(consent: boolean, nativeGoogle: boolean) {
  consentGranted = consent;
  preserveNativeGoogle = nativeGoogle;
}
export function canResolveAttribution() { return consentGranted && !preserveNativeGoogle; }

const provider: AnalyticsProvider = {
  logEvent(name, params) {
    if (!canResolveAttribution() || name === 'first_open' || name === 'tenant_id_first_open' || name === 'purchase') return;
    FirebaseAnalyticsProvider.logEvent(name, params);
  },
  setUserProperty(name, value) {
    if (canResolveAttribution()) FirebaseAnalyticsProvider.setUserProperty(name, value);
  },
};

export function initBridgee() {
  if (!configuration) configuration = BridgeeSDK.configure({ provider, tenantId: 'tenant-id', tenantKey: 'tenant-key', dryRun: true });
  return configuration;
}
