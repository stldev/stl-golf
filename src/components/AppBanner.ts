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

  @state() msgType = '';

  @state() msgText = '';

  @state() msgBgColor = 'greenyellow';

  @state() msgLink = '';

  static styles = [
    mvpCss,
    css`
      header {
        position: fixed;
        top: 4vh;
        left: 0;
        width: 100%;
        padding: 1rem;
        font-weight: bold;
      }
    `,
  ];

  constructor() {
    super();
    this.created();
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  created() {
    const sub1 = storeSvc.bannerMessage$.subscribe(bannerMessage => {
      this.msgType = bannerMessage?.type || '';
      this.msgText = bannerMessage?.text || '';
      this.msgLink = bannerMessage?.link || '';
      this.msgBgColor = bannerMessage?.bgColor || this.msgBgColor;
    });

    this.allSubs.add(sub1);
  }

  render() {
    if (this.msgType)
      return html`
        <header style="background-color:${this.msgBgColor}">
          ${this.msgText}
          ${this.msgLink ? html`<a href="${this.msgLink}">Go Here!</a>` : ''}
        </header>
      `;
    return '';
  }
}
