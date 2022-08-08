import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getDatabase, ref, onValue } from 'firebase/database';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  @state() team = '';

  @state() pairings = [];

  constructor() {
    super();
    this.team = GolfDayHome.getTeam();
    this.getData();
  }

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

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  static getTeam() {
    return localStorage
      .getItem('woodchopper-email')
      .replace('woodchoppers.golf+', '')
      .replace('@gmail.com', '');
  }

  getData() {
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

  // eslint-disable-next-line class-methods-use-this
  private goTo(pair: string) {
    const path = `golf-day/${pair.split(' =>')[0]}`;

    Router.go(path);
  }

  render() {
    return html`
      <article>
        <header>
          <h2>All golf days for ${this.team}</h2>
        </header>
        <div>
          ${this.pairings.map(
            pair =>
              html`<button @click="${() => this.goTo(pair)}">${pair}</button
                ><br />`
          )}
        </div>
      </article>
    `;
  }
}
