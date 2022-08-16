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
    this.allSubs.add(sub1);
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
              const p1Ele = this.shadowRoot?.querySelector(
                `#${teamName}-${hole}-p1`
              ) as HTMLSelectElement;

              // eslint-disable-next-line prefer-destructuring
              if (p1Ele) p1Ele.textContent = (scores as any).p1 || 0;

              const p2Ele = this.shadowRoot?.querySelector(
                `#${teamName}-${hole}-p2`
              ) as HTMLSelectElement;

              // eslint-disable-next-line prefer-destructuring
              if (p2Ele) p2Ele.textContent = (scores as any).p2 || 0;
            });
          }
        });
      }
    });

    this.allSubs.add(sub1);
  }

  getTeamByHole(i: number) {
    return Array(8)
      .fill(0)
      .map(
        (_, ii) => html`<td id="team${ii + 1}-h${i + 1}-p1">__</td>
          <td id="team${ii + 1}-h${i + 1}-p2">__</td>`
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
            <td>Hole</td>
            ${this.getTeamsHeader()}
          </tr>
          ${Array(9)
            .fill(0)
            .map(
              (hole, i) =>
                html`<tr>
                  <td style="font-size: 1.5rem;">${i + this.startingHole}</td>
                  ${this.getTeamByHole(i)}
                </tr>`
            )}
        </table>
      </article>
    `;
  }
}
