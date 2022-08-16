import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-my-team')
export class MyTeam extends LitElement {
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

  render() {
    return html`
      <main>
        <header>
          <h2>My Team</h2>
        </header>
        <section>Roster and stuff here</section>
      </main>
    `;
  }
}
