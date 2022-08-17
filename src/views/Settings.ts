import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-settings')
export class Settings extends LitElement {
  @query('button') updateBtnEle: HTMLButtonElement;

  @state() updateBtnText = 'Check for updates';

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
    this.updateBtnEle.disabled = true;
    this.updateBtnEle.textContent = 'Checking...';
    const swReg = await navigator.serviceWorker.getRegistration();
    console.log('checkForUpdates-swReg', swReg);
    if (swReg?.waiting) {
      storeSvc.newUpdateReady$.next(true);
      this.updateBtnEle.disabled = false;
      this.updateBtnEle.textContent = this.updateBtnText;
    } else {
      await new Promise(resolve => setTimeout(() => resolve(''), 2500));
      this.updateBtnEle.disabled = false;
      this.updateBtnEle.textContent = this.updateBtnText;
    }
  }

  render() {
    return html`
      <main>
        <header>
          <h2>App Settings</h2>
        </header>
        <section>
          <button @click="${() => this.checkForUpdates()}">
            ${this.updateBtnText}
          </button>
        </section>
        <br />
        <section>
          <article style="border: solid 2px black; padding: 0.6rem;">
            ${navigator.vendor} | ${navigator.platform} |
            ${globalThis.ApplePaySession ? 'ApplePay=yes' : 'ApplePay=NO'}
          </article>
        </section>
      </main>
    `;
  }
}
