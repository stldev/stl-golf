/* eslint-disable no-param-reassign */
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
    this.created();
  }

  // onDestroy
  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  created() {
    const team = GolfDayHome.getTeam();
    storeSvc.getSchedule(team);
    const sub1 = this.schedule.subscribe(s => {
      const pairings = Object.entries(s).reduce((acc, [day, pairs]) => {
        const pair: any = pairs;
        const match = Object.entries(pair).reduce((acc2, [teamA, teamB]) => {
          if (teamA === team) acc2 += teamB;
          if (teamB === team) acc2 += teamA;
          return acc2;
        }, `${team} vs `);
        const nineDisplay = pair.isFront ? 'Front 9' : 'Back 9';
        const rainDisplay = pair.rainOut ? 'Rain out' : '';
        acc.push({ day, match, nineDisplay, rainDisplay, ...pair });
        return acc;
      }, []);

      // const aaa2 = new Map(aaa.map(a => [a.day, ...a]));
      // console.log(aaa2);

      // const thisDayIsGreaterThanOtherDay = thisDay.localeCompare(otherDay, undefined, { numeric: true });

      this.pairings = pairings;
    });

    this.allSubs.add(sub1);
  }

  // eslint-disable-next-line class-methods-use-this
  private goTo(day: string) {
    const path = `golf-day/${day}`;
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
              html`<button @click="${() => this.goTo(pair.day)}">
                  ${pair.day} | ${pair.nineDisplay} | ${pair.match}<br />
                  ${pair.rainDisplay}</button
                ><br />`
          )}
        </div>
      </article>
    `;
  }
}
