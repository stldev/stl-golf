import { Router } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { storeSvc } from './store/data';

@customElement('rbb-app')
export class RbbApp extends LitElement {
  @state() visibilityStateLog = [];

  constructor() {
    super();
    this.created();
  }

  created() {
    setInterval(() => {
      this.checkSvcWorkerOnServer();
    }, 60000);

    document.addEventListener(
      'visibilitychange',
      () => {
        console.log('document.visibilityState: ', document.visibilityState);
        const timestamp = new Date().toLocaleString();
        this.visibilityStateLog = this.visibilityStateLog.concat([
          `${timestamp}-visibilityState-${document.visibilityState}`,
        ]);
        storeSvc.visibilityState$.next(this.visibilityStateLog);
      },
      false
    );
  }

  firstUpdated() {
    if (globalThis.location.pathname === '/')
      setTimeout(() => Router.go('/home'), 25);
  }

  async checkSvcWorkerOnServer() {
    const swReg = await navigator.serviceWorker.getRegistration();
    if (swReg) {
      if (swReg.waiting) {
        console.log('swReg2.....', swReg);
        storeSvc.newUpdateReady$.next(true);
      } else {
        console.log('swReg.update()');
        swReg.update();
      }
    }
  }

  render() {
    return html`
      <rbb-app-header></rbb-app-header>
      <slot></slot>
    `;
  }
}
