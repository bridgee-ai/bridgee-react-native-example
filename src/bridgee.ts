import {
  BridgeeSDK,
  FirebaseAnalyticsProvider,
} from '@bridgee-ai/react-native-sdk';

export async function initBridgee() {
  await BridgeeSDK.configure({
    provider: FirebaseAnalyticsProvider,
    tenantId: 'tenant-id',
    tenantKey: 'tenant-key',
    dryRun: false,
  });
}
