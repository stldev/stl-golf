import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from '../router';

@customElement('rbb-golf-day')
export class GolfDay extends LitElement {
  @property({ type: Object }) location = router.location;

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

  firstUpdated() {
    // const { day } = location.params; // path: 'analytics/:day'
    console.log('location ==', this.location.params);
  }

  render() {
    return html`
      <article>
        <header>
          <h2>Here we enter scores.</h2>
        </header>
        ok?
      </article>
    `;
  }
}
