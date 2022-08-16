import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-settings')
export class Settings extends LitElement {
  static styles = [
    mvpCss,
    css`
      section {
        text-align: center;
      }
      header h2 {
        color: green;
      }
    `,
  ];

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  async checkForUpdates() {
    const swReg = await navigator.serviceWorker.getRegistration();
    console.log('checkForUpdates-swReg', swReg);
    if (swReg?.waiting) storeSvc.newUpdateReady$.next(true);
  }

  render() {
    return html`
      <main>
        <header>
          <h2>App Settings</h2>
        </header>
        <section>
          <button @click="${() => this.checkForUpdates()}">
            Check for updates
          </button>
        </section>
      </main>
    `;
  }
}
