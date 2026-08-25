import { decodeTransferSignal, encodeTransferSignal, type TransferRole } from "@/lib/device-transfer";

export const TRANSFER_CONNECT_TIMEOUT_MS = 30_000;
export const TRANSFER_BUFFER_HIGH_WATER = 512_000;

type Progress = (value: number) => void;

export function createLocalTransferPeer() {
  return new RTCPeerConnection({ iceServers: [] });
}

export async function waitForIceGathering(peer: RTCPeerConnection, timeoutMs = 8_000) {
  if (peer.iceGatheringState === "complete") return;
  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(done, timeoutMs);
    function done() {
      window.clearTimeout(timeout);
      peer.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }
    function onChange() { if (peer.iceGatheringState === "complete") done(); }
    peer.addEventListener("icegatheringstatechange", onChange);
  });
}

export function localDescriptionCode(peer: RTCPeerConnection, role: TransferRole) {
  const description = peer.localDescription;
  if (!description?.sdp || description.type !== role) throw new Error("کد اتصال هنوز آماده نشده است.");
  return encodeTransferSignal({
    format: "poolamco-device-signal", version: 1, role, createdAt: new Date().toISOString(),
    description: { type: role, sdp: description.sdp },
  });
}

export async function applyRemoteDescription(peer: RTCPeerConnection, code: string, role: TransferRole) {
  const packet = decodeTransferSignal(code, role);
  await peer.setRemoteDescription(packet.description);
}

async function waitForBuffer(channel: RTCDataChannel) {
  if (channel.bufferedAmount <= TRANSFER_BUFFER_HIGH_WATER) return;
  channel.bufferedAmountLowThreshold = Math.floor(TRANSFER_BUFFER_HIGH_WATER / 2);
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error("ارسال داده بیش از حد طول کشید.")); }, 15_000);
    function cleanup() { window.clearTimeout(timeout); channel.removeEventListener("bufferedamountlow", onLow); }
    function onLow() { cleanup(); resolve(); }
    channel.addEventListener("bufferedamountlow", onLow, { once: true });
  });
}

export async function sendChannelMessages(channel: RTCDataChannel, messages: string[], onProgress?: Progress) {
  if (channel.readyState !== "open") throw new Error("اتصال مستقیم آماده ارسال نیست.");
  for (let index = 0; index < messages.length; index += 1) {
    await waitForBuffer(channel);
    channel.send(messages[index]);
    onProgress?.(Math.round(((index + 1) / messages.length) * 100));
  }
}

export async function sha256Text(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const bytes = new Uint8Array(digest);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
