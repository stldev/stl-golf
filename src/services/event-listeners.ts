import { storeSvc } from '../store/data';

document.addEventListener(
  'visibilitychange',
  () => {
    const timestamp = new Date().toLocaleString();
    const visibilityStateLog = [
      `${timestamp}-visibilityState-${document.visibilityState}`,
    ];
    storeSvc.checkSvcWorkerOnServer();
    storeSvc.visibilityState$.next(visibilityStateLog);
  },
  false
);
