import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-settings')
export class Settings extends LitElement {
  @query('button') updateBtnEle: HTMLButtonElement;

  @state() updateBtnText = 'Check for updates';

  @state() hasDbConn = true;

  @state() pageHideLogs = [];

  @state() allSubs = new Subscription();

  static styles = [
    mvpCss,
    css`
      section {
        text-align: center;
      }
      header h2 {
        color: green;
      }
      article {
        border: solid 2px black;
        padding: 0.6rem;
        width: 70%;
      }
    `,
  ];

  constructor() {
    super();
    this.created();
  }

  created() {
    console.log('SETTINGS-Created!');

    document.addEventListener(
      'visibilitychange',
      () => this.handleVisibilityChange,
      false
    );

    globalThis.addEventListener('pagehide', () => this.handlePagehide, false);

    const sub1 = storeSvc.hasDbConn$.subscribe(hasDbConn => {
      this.hasDbConn = hasDbConn;
    });

    this.allSubs.add(sub1);
  }

  handleVisibilityChange() {
    console.log('document.visibilityState===', document.visibilityState);
    const timestamp = new Date().toLocaleString();
    this.pageHideLogs = this.pageHideLogs.concat([
      `${timestamp}-visibilityState-${document.visibilityState}`,
    ]);
  }

  handlePagehide(evt) {
    console.log('-----handlePagehide-EVT:', evt);
    const timestamp = new Date().toLocaleString();
    this.pageHideLogs = this.pageHideLogs.concat([
      `${timestamp}-handlePagehide`,
    ]);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
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
          <article>${this.hasDbConn}</article>
        </section>
        <br />
        <section>
          <article>
            ${navigator.vendor} | ${navigator.platform} |
            ${globalThis.ApplePaySession ? 'ApplePay=yes' : 'ApplePay=NO'}
          </article>
        </section>
        <br />
        <section>
          ${this.pageHideLogs.map(p => html`<article>${p}</article>`)}
        </section>
      </main>
    `;
  }
}
