import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { mvpCss } from '../styles-3rdParty';
import { storeSvc } from '../store/data';

@customElement('rbb-app-banner')
export class AppBanner extends LitElement {
  @state() allSubs = new Subscription();

  @state() curTeamName = '';

  @state() dayDisplay = '';

  @state() hasDbConn = true;

  @state() msgType = '';

  @state() msgText = '';

  @state() msgLink = '';

  @state() newUpdateReady = false;

  static styles = [
    mvpCss,
    css`
      header {
        position: fixed;
        top: 4vh;
        left: 0;
        width: 100%;
        background-color: greenyellow;
        padding: 1rem;
        font-weight: bold;
      }
    `,
  ];

  constructor() {
    super();
    this.created();
  }

  // onDestroy
  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  created() {
    const sub1 = storeSvc.bannerMessage$.subscribe(bannerMessage => {
      console.log('bannerMessage===', bannerMessage);
      this.msgType = bannerMessage?.type || '';
      this.msgText = bannerMessage?.text || '';
      this.msgLink = bannerMessage?.link || '';
    });

    this.allSubs.add(sub1);
  }

  private goTo(path: string) {
    Router.go(path);
  }

  render() {
    if (this.msgType)
      return html`
        <header>
          ${this.msgText}
          ${this.msgLink ? html`<a href="${this.msgLink}">Go Here!</a>` : ''}
        </header>
      `;
    return '';
  }
}
