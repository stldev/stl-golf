import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  @state() pairings = [];

  @state() allSubs = new Subscription();

  private schedule = storeSvc.schedule$;

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

  constructor() {
    super();
    const team = GolfDayHome.getTeam();
    storeSvc.getSchedule(team);
    const sub1 = this.schedule.subscribe(s => {
      const pairingsTemp = [];

      Object.entries(s).forEach(([day, pair]) => {
        let pairing = `${day} => ${team} vs `;
        Object.entries(pair).forEach(([teamA, teamB]) => {
          if (teamA === team) pairing += teamB;
          if (teamB === team) pairing += teamA;
        });

        pairingsTemp.push(pairing);
      });
      this.pairings = pairingsTemp;
    });

    this.allSubs.add(sub1);
  }

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  // eslint-disable-next-line class-methods-use-this
  private goTo(pair: string) {
    const path = `golf-day/${pair.split(' =>')[0]}`;

    Router.go(path);
  }

  static getTeam() {
    return localStorage.getItem('woodchopper-team');
  }

  render() {
    return html`
      <article>
        <header>
          <h2>All golf days for ${GolfDayHome.getTeam()}</h2>
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
