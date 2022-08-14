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

  @state() pairingsByState = [];

  @state() allSubs = new Subscription();

  private schedule = storeSvc.schedule$;

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 3rem;
      }
      header {
        color: #383333;
        padding: 0;
      }
      hr {
        width: 50px;
        border-color: transparent;
        border-right-color: rgba(255, 255, 255, 0.7);
        border-right-width: 50px;
        position: absolute;
        bottom: 100%;
        transform-origin: 100% 50%;
        animation-name: rain;
        animation-duration: 1s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      @keyframes rain {
        from {
          transform: rotate(105deg) translateX(0);
        }
        to {
          transform: rotate(105deg) translateX(200px);
        }
      }
      .rain {
        overflow: hidden;
        position: relative;
        background-image: linear-gradient(to bottom, #030420, #000000 70%);
        justify-content: center;
        align-items: center;
        border: 2px solid var(--color);
        color: var(--color-bg);
        border-radius: var(--border-radius);
        display: inline-block;
        font-size: medium;
        font-weight: bold;
        line-height: var(--line-height);
        margin: 0.5rem 0px;
        padding: 1rem 2rem;
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
    const team = localStorage.getItem('woodchopper-team');
    const todayEpoch = Date.now();

    const sub1 = this.schedule.subscribe(s => {
      const pairings = Object.entries(s).reduce((acc, [day, pairs]) => {
        const pair: any = pairs;
        const match = Object.entries(pair).reduce((acc2, [teamA, teamB]) => {
          if (teamA === team) acc2 += teamB;
          if (teamB === team) acc2 += teamA;
          return acc2;
        }, `${team} vs `);
        const nineDisplay = pair.isFront ? 'Front' : 'Back';
        acc.push({ day, match, nineDisplay, ...pair });
        return acc;
      }, []);

      pairings.sort((a, b) =>
        b.day.localeCompare(a.day, undefined, { numeric: true })
      );

      pairings.forEach(p => {
        const dayToTest = new Date(`${p.day}T12:00:00.000Z`).getTime();
        if (todayEpoch > dayToTest) {
          p.state = 'past';
        }
        if (todayEpoch < dayToTest) {
          p.state = 'future';
        }
      });

      const mostRecentPast = pairings.findIndex(t => t.state === 'past');

      if (pairings[mostRecentPast - 1])
        pairings[mostRecentPast - 1].state = 'current';

      // today - golfDay = if negative number it is in future
      // today - golfDay = if positive number it is either past or same day
      // if positive number then check:
      // var today = new Date().toISOString()
      // today.split('T')[0] === '2022-08-13' = if match then we know
      // Date.now() - 6 days ago = get list of all those future days and sort by newest and take top 1
      // ---> all other future golf days are in the distant future

      console.log(pairings);

      this.pairings = [...pairings];
      this.filterDays('current');
    });

    this.allSubs.add(sub1);
  }

  // eslint-disable-next-line class-methods-use-this
  private goTo(day: string) {
    const path = `golf-day/${day}`;
    Router.go(path);
  }

  // eslint-disable-next-line class-methods-use-this
  private makeItRain() {
    return Array(60)
      .fill(0)
      .map(() => {
        const dropLeft = `${Math.floor(Math.random() * window.innerWidth)}px`;
        const animationDur = `${0.2 + Math.random() * 0.3}s`;
        const animationDelay = `${Math.random() * 5}s`;

        return html`<hr
          style="left:${dropLeft}; animation-duration: ${animationDur}; animation-delay: ${animationDelay}"
        />`;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  private filterDays(itemState: string) {
    if (itemState === 'all') this.pairingsByState = [...this.pairings];

    if (itemState !== 'all')
      this.pairingsByState = this.pairings.filter(f => f.state === itemState);
  }

  render() {
    return html`
      <article>
        <header>
          <button
            @click="${() => this.filterDays('current')}"
            style="padding: 0.25rem"
          >
            Current
          </button>
          &nbsp;&nbsp;
          <button
            @click="${() => this.filterDays('future')}"
            style="padding: 0.25rem"
          >
            Future
          </button>
          &nbsp;&nbsp;
          <button
            @click="${() => this.filterDays('past')}"
            style="padding: 0.25rem"
          >
            &nbsp; Past &nbsp;
          </button>
          &nbsp;&nbsp;
          <button
            @click="${() => this.filterDays('all')}"
            style="padding: 0.25rem"
          >
            &nbsp; All &nbsp;
          </button>
        </header>
        <div>
          ${this.pairingsByState.map(pair => {
            if (pair.rainOut) {
              return html`<section class="rain">
                  ${pair.day} | ${pair.nineDisplay} | ${pair.match}
                  ${this.makeItRain()}
                </section>
                <br />`;
            }
            return html`<button @click="${() => this.goTo(pair.day)}">
                ${pair.day} | ${pair.nineDisplay} | ${pair.match}</button
              ><br />`;
          })}
        </div>
      </article>
    `;
  }
}
