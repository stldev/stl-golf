import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getDatabase, ref, onValue } from 'firebase/database';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  @property({ type: String }) team = '';

  @property({ type: Array }) pairings = [];

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 3rem;
      }
      ul {
        width: 20rem;
        margin: 0 auto;
      }
      header {
        color: #383333;
        padding: 0;
      }
    `,
  ];

  firstUpdated() {
    this.team = localStorage
      .getItem('woodchopper-email')
      .replace('woodchoppers.golf+', '')
      .replace('@gmail.com', '');

    const thisYear = new Date().getFullYear();
    const pairingsTemp = [];

    const schedule = ref(getDatabase(), `/${thisYear}-schedule`);
    onValue(schedule, snapshot => {
      const allData = snapshot.val();

      Object.entries(allData).forEach(([day, pair]) => {
        let pairing = `${day} => ${this.team} vs `;
        Object.entries(pair).forEach(([teamA, teamB]) => {
          if (teamA === this.team) pairing += teamB;
          if (teamB === this.team) pairing += teamA;
        });

        pairingsTemp.push(pairing);
      });

      this.pairings = pairingsTemp;
    });
  }

  render() {
    return html`
      <article>
        <header>
          <h2>All golf days for ${this.team}</h2>
        </header>
        <ul>
          ${this.pairings.map(
            pair =>
              html`
                <li><a href="golf-day/${pair.split(' =>')[0]}">${pair}</a></li>
              `
          )}
        </ul>
      </article>
    `;
  }
}
