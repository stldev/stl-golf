import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  static styles = [
    css`
      article {
        text-align: center;
      }
      header {
        color: red;
      }
    `,
  ];

  render() {
    return html`
      <article>
        <header>
          <h2>Golf day home!.</h2>
        </header>
        <slot></slot>
      </article>
    `;
  }
}
