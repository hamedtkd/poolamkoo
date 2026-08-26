export const PWA_UPDATE_MESSAGE = "SKIP_WAITING";

export type PwaUpdateSignals = {
  hasController: boolean;
  hasWaitingWorker: boolean;
};

export function pwaUpdateReady(signals: PwaUpdateSignals) {
  return signals.hasController && signals.hasWaitingWorker;
}
