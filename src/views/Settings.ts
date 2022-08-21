import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-settings')
export class Settings extends LitElement {
  @query('#CheckUpdatesBtn') checkUpdatesBtnEle: HTMLButtonElement;

  @state() updateBtnText = 'Check for updates';

  @state() hasDbConn = true;

  @state() newUpdateAvailable = false;

  @state() visibilityState = [];

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
    const sub1 = storeSvc.hasDbConn$.subscribe(hasDbConn => {
      this.hasDbConn = hasDbConn;
    });

    const sub2 = storeSvc.visibilityState$.subscribe(visibilityState => {
      this.visibilityState = visibilityState;
    });

    const sub3 = storeSvc.bannerMessage$.subscribe(bannerMessage => {
      this.newUpdateAvailable = bannerMessage?.type === 'app-update';
    });

    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
    this.allSubs.add(sub3);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  async checkForUpdates() {
    this.checkUpdatesBtnEle.disabled = true;
    this.checkUpdatesBtnEle.textContent = 'Checking...';
    // const swReg = await navigator.serviceWorker.getRegistration();
    // console.log('checkForUpdates-swReg', swReg);
    await storeSvc.checkSvcWorkerOnServer();

    await new Promise(resolve => setTimeout(() => resolve(''), 2500));
    this.checkUpdatesBtnEle.disabled = false;
    this.checkUpdatesBtnEle.textContent = this.updateBtnText;
  }

  async applyUpdate() {
    const swReg = await navigator.serviceWorker.getRegistration();
    swReg?.waiting.postMessage({ type: 'SKIP_WAITING' });

    storeSvc.bannerMessage$.next({});

    if (globalThis.ApplePaySession) {
      await new Promise(resolve => setTimeout(() => resolve(''), 777));
      globalThis.location.reload();
    }

    if (!globalThis.ApplePaySession) {
      setTimeout(() => {
        globalThis.location.reload();
      }, 777);
    }
  }

  render() {
    return html`
      <main>
        <header>
          ${this.newUpdateAvailable
            ? html`<button
                style="margin-top: 3rem;"
                @click="${() => this.applyUpdate()}"
              >
                APPLY UPDATE
              </button>`
            : ''}
          <h2>App Settings</h2>
        </header>
        <section>
          ${this.newUpdateAvailable
            ? ''
            : html` <button
                id="CheckUpdatesBtn"
                @click="${() => this.checkForUpdates()}"
              >
                ${this.updateBtnText}
              </button>`}
        </section>
        <br />
        <section>
          <article>Is connected? ${this.hasDbConn}</article>
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
          ${this.visibilityState.map(
            p =>
              html`<article>${p}</article>
                <br />`
          )}
        </section>
      </main>
    `;
  }
}
