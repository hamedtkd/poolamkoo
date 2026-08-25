"use client";

import { useEffect, useRef, useState } from "react";
import { createBackupEnvelope, openBackupEnvelope } from "@/lib/crypto";
import { createTransferPin, splitTransferText, validateTransferData, validateTransferEnvelope, type TransferPreview } from "@/lib/device-transfer";
import { exportDatabaseObject, importDatabaseObject } from "@/lib/db";
import { createRecoverySnapshot } from "@/lib/recovery";
import { TRANSFER_CONNECT_TIMEOUT_MS, applyRemoteDescription, createLocalTransferPeer, localDescriptionCode, sendChannelMessages, sha256Text, waitForIceGathering } from "@/lib/webrtc-transfer";
import type { BackupEnvelope } from "@/lib/types";

type TransferMode = "sender" | "receiver";
type TransferStatus = "idle" | "pairing" | "connected" | "sending" | "receiving" | "locked" | "ready" | "importing" | "complete" | "error";
type TransferMeta = { type: "meta"; chunks: number; digest: string; exportedAt: string };
type TransferChunk = { type: "chunk"; index: number; data: string };
type TransferControl = { type: "done" } | { type: "ack"; stage: "received" | "imported" };

export function useDeviceTransfer() {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const incomingRef = useRef<string | null>(null);
  const incomingDataRef = useRef<Record<string, unknown> | null>(null);
  const chunksRef = useRef<string[]>([]);
  const metaRef = useRef<TransferMeta | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const [mode, setMode] = useState<TransferMode | null>(null);
  const [status, setStatus] = useState<TransferStatus>("idle");
  const statusRef = useRef<TransferStatus>("idle");
  const [offerCode, setOfferCode] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [pin, setPin] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const supported = typeof window !== "undefined" && "RTCPeerConnection" in window && Boolean(globalThis.crypto?.subtle);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => () => {
    try { channelRef.current?.close(); } catch { /* noop */ }
    try { peerRef.current?.close(); } catch { /* noop */ }
    if (connectionTimeoutRef.current) window.clearTimeout(connectionTimeoutRef.current);
  }, []);

  function clearConnectionTimeout() {
    if (connectionTimeoutRef.current) window.clearTimeout(connectionTimeoutRef.current);
    connectionTimeoutRef.current = null;
  }

  function closeTransport() {
    clearConnectionTimeout();
    try { channelRef.current?.close(); } catch { /* noop */ }
    try { peerRef.current?.close(); } catch { /* noop */ }
    channelRef.current = null;
    peerRef.current = null;
  }

  function armConnectionTimeout() {
    clearConnectionTimeout();
    connectionTimeoutRef.current = window.setTimeout(() => fail("اتصال مستقیم در زمان مناسب برقرار نشد. هر دو دستگاه را روی یک Wi‑Fi نگه دار و دوباره تلاش کن."), TRANSFER_CONNECT_TIMEOUT_MS);
  }

  function fail(reason: unknown) {
    clearConnectionTimeout();
    const message = reason instanceof Error ? reason.message : "انتقال مستقیم ناموفق بود.";
    setError(message); setStatus("error");
  }

  function reset() {
    closeTransport(); incomingRef.current = null; incomingDataRef.current = null; chunksRef.current = []; metaRef.current = null;
    setMode(null); setStatus("idle"); setOfferCode(""); setAnswerCode(""); setPin(""); setProgress(0); setPreview(null); setError(null); setAcknowledged(false);
  }

  function watchPeer(peer: RTCPeerConnection) {
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected" && statusRef.current !== "sending" && statusRef.current !== "receiving") setStatus("connected");
      if (["failed", "disconnected"].includes(peer.connectionState) && !["complete", "ready", "locked"].includes(statusRef.current)) fail("اتصال بین دو دستگاه قطع شد. دوباره تلاش کن.");
    };
  }

  function bindSenderChannel(channel: RTCDataChannel) {
    channelRef.current = channel;
    channel.onopen = () => { clearConnectionTimeout(); setStatus("connected"); };
    channel.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as TransferControl;
        if (message.type === "ack" && message.stage === "received") setStatus("connected");
        if (message.type === "ack" && message.stage === "imported") { setAcknowledged(true); setStatus("complete"); }
      } catch { /* ignore unrelated frames */ }
    };
  }

  async function startSender() {
    if (!supported) { fail("مرورگر این دستگاه WebRTC موردنیاز انتقال مستقیم را پشتیبانی نمی‌کند."); return; }
    try {
      reset(); setMode("sender"); setStatus("pairing"); const transferPin = createTransferPin(); setPin(transferPin);
      const peer = createLocalTransferPeer(); peerRef.current = peer; watchPeer(peer);
      bindSenderChannel(peer.createDataChannel("poolamco-transfer", { ordered: true }));
      await peer.setLocalDescription(await peer.createOffer()); await waitForIceGathering(peer); setOfferCode(localDescriptionCode(peer, "offer"));
    } catch (reason) { fail(reason); }
  }

  async function acceptAnswer(code: string) {
    try { if (!peerRef.current) throw new Error("ابتدا انتقال را از دستگاه فرستنده شروع کن."); await applyRemoteDescription(peerRef.current, code, "answer"); setStatus("pairing"); armConnectionTimeout(); }
    catch (reason) { fail(reason); }
  }

  async function startReceiver(code: string) {
    if (!supported) { fail("مرورگر این دستگاه WebRTC موردنیاز انتقال مستقیم را پشتیبانی نمی‌کند."); return; }
    try {
      reset(); setMode("receiver"); setStatus("pairing"); const peer = createLocalTransferPeer(); peerRef.current = peer; watchPeer(peer);
      peer.ondatachannel = (event) => bindReceiverChannel(event.channel);
      await applyRemoteDescription(peer, code, "offer"); await peer.setLocalDescription(await peer.createAnswer()); await waitForIceGathering(peer); setAnswerCode(localDescriptionCode(peer, "answer"));
    } catch (reason) { fail(reason); }
  }

  function bindReceiverChannel(channel: RTCDataChannel) {
    channelRef.current = channel; channel.onopen = () => { clearConnectionTimeout(); setStatus("connected"); };
    channel.onmessage = (event) => { void receiveFrame(String(event.data)); };
  }

  async function receiveFrame(raw: string) {
    try {
      const message = JSON.parse(raw) as TransferMeta | TransferChunk | TransferControl;
      if (message.type === "meta") {
        if (!Number.isInteger(message.chunks) || message.chunks < 1 || message.chunks > 2_000 || typeof message.digest !== "string") throw new Error("مشخصات بسته انتقال معتبر نیست.");
        metaRef.current = message; chunksRef.current = new Array(message.chunks); setProgress(0); setStatus("receiving"); return;
      }
      if (message.type === "chunk") {
        const total = metaRef.current?.chunks ?? 0;
        if (!Number.isInteger(message.index) || message.index < 0 || message.index >= total || typeof message.data !== "string") throw new Error("یک قطعه نامعتبر در انتقال دریافت شد.");
        chunksRef.current[message.index] = message.data; const received = chunksRef.current.filter((chunk) => typeof chunk === "string").length; setProgress(Math.round((received / Math.max(total, 1)) * 100)); return;
      }
      if (message.type === "done") await finishReceive();
    } catch (reason) { fail(reason); }
  }

  async function finishReceive() {
    const meta = metaRef.current; const received = chunksRef.current.filter((chunk) => typeof chunk === "string").length;
    if (!meta || received !== meta.chunks) throw new Error("داده انتقال کامل دریافت نشد.");
    const text = chunksRef.current.join(""); if (await sha256Text(text) !== meta.digest) throw new Error("صحت داده انتقال تأیید نشد؛ دوباره تلاش کن.");
    const envelope = validateTransferEnvelope(JSON.parse(text) as BackupEnvelope); incomingRef.current = JSON.stringify(envelope); setProgress(100); setStatus("locked");
    try { if (channelRef.current?.readyState === "open") channelRef.current.send(JSON.stringify({ type: "ack", stage: "received" } satisfies TransferControl)); } catch { /* acknowledgement is best-effort */ }
  }

  async function unlockReceived(transferPin: string) {
    try {
      if (!incomingRef.current) throw new Error("هنوز داده‌ای دریافت نشده است.");
      const envelope = validateTransferEnvelope(JSON.parse(incomingRef.current) as BackupEnvelope);
      const raw = await openBackupEnvelope(envelope, transferPin.trim().toUpperCase()); const data = JSON.parse(raw) as Record<string, unknown>;
      const nextPreview = validateTransferData(data); incomingDataRef.current = data; setPin(transferPin.trim().toUpperCase()); setPreview(nextPreview); setStatus("ready"); setError(null);
    } catch { setError("رمز انتقال درست نیست یا بسته انتقال آسیب دیده است."); }
  }

  async function sendData() {
    try {
      const channel = channelRef.current; if (!channel || channel.readyState !== "open") throw new Error("اول کد پاسخ دستگاه جدید را وارد کن تا اتصال برقرار شود.");
      setStatus("sending"); setProgress(0); const payload = await exportDatabaseObject(); const envelope = await createBackupEnvelope(JSON.stringify(payload), pin);
      const text = JSON.stringify(envelope); const chunks = splitTransferText(text); const digest = await sha256Text(text);
      const frames = [JSON.stringify({ type: "meta", chunks: chunks.length, digest, exportedAt: envelope.exportedAt } satisfies TransferMeta), ...chunks.map((data, index) => JSON.stringify({ type: "chunk", index, data } satisfies TransferChunk)), JSON.stringify({ type: "done" } satisfies TransferControl)];
      await sendChannelMessages(channel, frames, setProgress); setStatus("connected");
    } catch (reason) { fail(reason); }
  }

  async function importReceived() {
    try {
      if (!incomingDataRef.current) throw new Error("ابتدا رمز را وارد کن و پیش‌نمایش داده را ببین."); setStatus("importing");
      await createRecoverySnapshot("قبل از انتقال از دستگاه دیگر"); await importDatabaseObject(incomingDataRef.current);
      try { if (channelRef.current?.readyState === "open") channelRef.current.send(JSON.stringify({ type: "ack", stage: "imported" } satisfies TransferControl)); } catch { /* acknowledgement is best-effort */ }
      setStatus("complete");
    } catch (reason) { fail(reason); }
  }

  return { supported, mode, status, offerCode, answerCode, pin, progress, preview, error, acknowledged, startSender, acceptAnswer, startReceiver, unlockReceived, sendData, importReceived, reset };
}
