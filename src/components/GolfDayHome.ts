/* eslint-disable no-param-reassign */
import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day-home')
export class GolfDayHome extends LitElement {
  @state() pairings = [];

  @state() allSubs = new Subscription();

  @query('.rain') rainEle: HTMLTableSectionElement;

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
        const nineDisplay = pair.isFront ? 'Front' : 'Back ';
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

  protected firstUpdated() {
    setTimeout(() => {
      Array(60)
        .fill(0)
        .forEach((_, i) => {
          const dropLeft = `${Math.floor(Math.random() * window.innerWidth)}px`;
          const animationDur = `${0.2 + Math.random() * 0.3}s`;
          const animationDelay = `${Math.random() * 5}s`;
          setTimeout(() => {
            const htmlToUse = `<hr style="left:${dropLeft}; animation-duration: ${animationDur}"; animation-delay: ${animationDelay}  />`;
            this.rainEle?.insertAdjacentHTML('afterbegin', htmlToUse);
          }, 10 * i);
        });
    }, 555);
  }

  render() {
    return html`
      <article>
        <header>
          <h2>All golf days for ${GolfDayHome.getTeam()}</h2>
        </header>
        <div>
          ${this.pairings.map(pair => {
            if (pair.rainOut) {
              return html`<section class="rain">
                  ${pair.day} | ${pair.nineDisplay} | ${pair.match}<br />
                  ${pair.rainDisplay}
                </section>
                <br />`;
            }
            return html`<button @click="${() => this.goTo(pair.day)}">
                ${pair.day} | ${pair.nineDisplay} | ${pair.match}<br />
                ${pair.rainDisplay}</button
              ><br />`;
          })}
        </div>
      </article>
    `;
  }
}
