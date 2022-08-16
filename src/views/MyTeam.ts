import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-my-team')
export class MyTeam extends LitElement {
  @state() allSubs = new Subscription();

  @state() teamRoster = null;

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

  constructor() {
    super();
    this.created();
  }

  created() {
    const team = localStorage.getItem('woodchopper-team');
    storeSvc.getRoster(team);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  connectedCallback() {
    const sub1 = storeSvc.teamRoster$.subscribe(tr => {
      this.teamRoster = tr;
      console.log('this.teamRosterthis.teamRoster');
      console.log(this.teamRoster);
    });

    this.allSubs.add(sub1);

    if (super.connectedCallback) super.connectedCallback();
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
