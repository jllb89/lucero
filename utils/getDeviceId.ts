// utils/getDeviceId.ts
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export async function getDeviceId() {
  const fp = await FingerprintJS.load();
  return (await fp.get()).visitorId;
}
