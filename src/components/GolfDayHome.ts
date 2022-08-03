import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  static styles = [
    css`
      article {
        margin: 6rem;
      }
      li {
        margin: 1rem;
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
          <h2>All golf days</h2>
        </header>
        <ul>
          <li><a href="golf-day/2022-08-03">2022-08-03</a></li>
          <li><a href="golf-day/2022-07-27">2022-07-27</a></li>
          <li><a href="golf-day/2022-07-20">2022-07-20</a></li>
          <li><a href="golf-day/2022-07-13">2022-07-13</a></li>
        </ul>
      </article>
    `;
  }
}
