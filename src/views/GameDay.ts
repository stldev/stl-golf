/* eslint-disable no-param-reassign */
import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { router } from '../router';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-game-day')
export class GameDay extends LitElement {
  @state() location = router.location;

  @state() allSubs = new Subscription();

  @state() day = '';

  @state() course = null;

  @state() startingHole = 10;

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 3rem;
      }
      header {
        text-align: left;
        color: #383333;
        padding: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.created();
  }

  connectedCallback() {
    this.day = this.location.params.day.toString();

    const sub1 = storeSvc.schedule$.subscribe(s => {
      const pair = s[this.day] || {};
      if (pair.isFront) this.startingHole = 1;
    });
    const sub2 = storeSvc.course$.subscribe(c => {
      this.course = c;
    });
    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
    if (super.connectedCallback) super.connectedCallback();
  }

  protected firstUpdated() {
    const theDay = new Date(`${this.day}T12:00:00.000Z`).toLocaleDateString();
    setTimeout(() => {
      storeSvc.day$.next(theDay);
    }, 50);
  }

  // onDestroy
  disconnectedCallback() {
    storeSvc.day$.next('');
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  protected updated(_changedProps: Map<string | number | symbol, unknown>) {
    if (_changedProps.has('day')) this.dayHandler();
  }

  dayHandler() {
    storeSvc.getAllTeamsToday(this.day);
  }

  created() {
    storeSvc.allTeamsToday$.next(null);
    const sub1 = storeSvc.allTeamsToday$.subscribe(teams => {
      if (teams) {
        Object.entries(teams).forEach(([teamName, holes]) => {
          if (holes) {
            Object.entries(holes).forEach(([hole, scores]) => {
              if (hole.startsWith('h')) {
                const holeNum =
                  Number(hole.replace('h', '')) - 1 + this.startingHole;
                const par = this.course[`h${holeNum}`]?.par || '';

                const p1Ele = this.shadowRoot?.querySelector(
                  `#${teamName}-${hole}-p1`
                ) as HTMLSelectElement;

                if (scores.p1) {
                  if (p1Ele) {
                    p1Ele.textContent = scores.p1;
                    if (scores.p1 < par) p1Ele.style.color = 'mediumseagreen';
                    if (scores.p1 > par) p1Ele.style.color = 'red';
                  }
                }

                if (!scores.p1) {
                  if (p1Ele) p1Ele.textContent = '--';
                }

                const p2Ele = this.shadowRoot?.querySelector(
                  `#${teamName}-${hole}-p2`
                ) as HTMLSelectElement;

                if (scores.p2) {
                  if (p2Ele) {
                    p2Ele.textContent = scores.p2;
                    if (scores.p2 < par) p2Ele.style.color = 'mediumseagreen';
                    if (scores.p2 > par) p2Ele.style.color = 'red';
                  }
                }

                if (!scores.p2) {
                  if (p2Ele) p2Ele.textContent = '--';
                }
              }
            });
          }
        });
      }
    });

    this.allSubs.add(sub1);
  }

  private getHoleInfo(holeNumber: number) {
    if (!this.course) return '';
    return this.course[`h${holeNumber}`]?.par || '';
  }

  getTeamByHole(i: number) {
    return Array(8)
      .fill(0)
      .map(
        (_, ii) => html`<td id="team${ii + 1}-h${i + 1}-p1">--</td>
          <td id="team${ii + 1}-h${i + 1}-p2">--</td>`
      );
  }

  getTeamsHeader() {
    return Array(8)
      .fill(0)
      .map(
        (_, i) => html`<td colspan="2">
          Team${i + 1} <br />
          Player1&nbsp;Player2
        </td>`
      );
  }

  private goBack() {
    Router.go(`/golf-day/${this.day}`);
  }

  render() {
    return html`
      <article>
        <header>
          &nbsp;&nbsp;<button
            @click="${() => this.goBack()}"
            style="padding:0.3rem"
          >
            Back
          </button>
        </header>
        <table>
          <tr>
            <td># (par)</td>
            ${this.getTeamsHeader()}
          </tr>
          ${Array(9)
            .fill(0)
            .map(
              (hole, i) =>
                html`<tr>
                  <td style="font-size: 1.25rem;">
                    ${i + this.startingHole}
                    (${this.getHoleInfo(i + this.startingHole)})
                  </td>
                  ${this.getTeamByHole(i)}
                </tr>`
            )}
        </table>
      </article>
    `;
  }
}
