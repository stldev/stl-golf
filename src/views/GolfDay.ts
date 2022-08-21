/* eslint-disable lit-a11y/click-events-have-key-events */
import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { Subscription, combineLatest } from 'rxjs';
import { storeSvc } from '../store/data';
import { router } from '../router';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day')
export class GolfDay extends LitElement {
  @state() location = router.location;

  @state() day = '';

  @state() team = '';

  @state() teamRoster = [];

  @state() teamOther = '';

  @state() startingHole = 10;

  @state() touchStart = 0;

  @state() touchStartRef = 0;

  @state() course = null;

  @state() allSubs = new Subscription();

  @state() error = '';

  @state() clickTimeNow = 0;

  @query('table tbody') scoresTableEle: HTMLTableElement;

  @query('#p1') p1Ele: HTMLSpanElement;

  @query('#total-team-p1') totalTeamP1Ele: HTMLTableElement;

  @query('#total-team-p2') totalTeamP2Ele: HTMLTableElement;

  @query('#total-teamother-p1') totalTeamOtherP1Ele: HTMLTableElement;

  @query('#total-teamother-p2') totalTeamOtherP2Ele: HTMLTableElement;

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 2.25rem;
      }
      header {
        color: blue;
        padding: 0;
      }
      table {
        border: none;
      }
      table tr {
        padding: 0;
        margin: 0;
      }
      table td {
        padding: 0.3rem 0.6rem;
        width: 98%;
      }
      #p1 {
        user-select: none;
      }
    `,
  ];

  constructor() {
    super();
    this.team = localStorage.getItem('woodchopper-team');
    storeSvc.getRoster(this.team);
  }

  connectedCallback() {
    this.day = this.location.params.day.toString();
    const sub1 = storeSvc.course$.subscribe(c => {
      this.course = c;
    });

    const sub2 = storeSvc.errors$.subscribe(error => {
      this.error = error || '';
    });

    const sub3 = storeSvc.teamRoster$.subscribe(tr => {
      const teamRoster = Object.entries(tr).reduce((acc, [player, info]) => {
        acc.push({ player, info });
        return acc;
      }, []);

      this.teamRoster = teamRoster;
      console.log('teamRoster', teamRoster);
    });

    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
    this.allSubs.add(sub3);

    if (super.connectedCallback) super.connectedCallback();
  }

  protected firstUpdated() {
    const theDay = new Date(`${this.day}T12:00:00.000Z`).toLocaleDateString();
    // don't like this, but DISCONNECTED (from other component) is fired AFTER this components startup hooks
    setTimeout(() => {
      storeSvc.day$.next(theDay);
    }, 50);

    this.p1Ele.addEventListener(
      'touchstart',
      () => {
        this.checkIfLongPress();
      },
      { passive: true }
    );

    this.p1Ele.addEventListener(
      'touchend',
      () => {
        this.touchStart = 0;
        globalThis.clearInterval(this.touchStartRef);
      },
      { passive: true }
    );
  }

  checkIfLongPress() {
    this.touchStartRef = setInterval(() => {
      console.log('this.touchStartRef');

      if (this.touchStart > 8) {
        console.log('IS-LONG-PRESS');
        this.p1Ele.style.color = 'red';
        this.touchStart = 0;
        globalThis.clearInterval(this.touchStartRef);
      }
      this.touchStart += 1;
    }, 250) as unknown as number;
  }

  // onDestroy
  disconnectedCallback() {
    storeSvc.day$.next('');
    storeSvc.errors$.next('');
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  protected updated(_changedProps: Map<string | number | symbol, unknown>) {
    if (_changedProps.has('day')) this.dayHandler();
  }

  dayHandler() {
    const sub1 = storeSvc.schedule$.subscribe(s => {
      const pair = s[this.day] || {};

      if (pair.isFront) this.startingHole = 1;

      Object.entries(pair).forEach(([teamA, teamB]) => {
        if (teamA === this.team) this.teamOther = teamB as string;
        if (teamB === this.team) this.teamOther = teamA as string;
      });

      storeSvc.getMyTeamToday(this.team, this.day);
      storeSvc.getOtherTeamToday(this.teamOther, this.day);

      this.dataHandler();
    });

    this.allSubs.add(sub1);
  }

  dataHandler() {
    const sub = combineLatest({
      myTeam: storeSvc.myTeamToday$,
      otherTeam: storeSvc.otherTeamToday$,
    }).subscribe(teams => {
      this.setMyTeam(teams.myTeam);
      this.setOtherTeam(teams.otherTeam);
    });
    this.allSubs.add(sub);
  }

  setOtherTeam(holeAndScore: any) {
    let totalP1 = 0;
    let totalP2 = 0;
    Object.entries(holeAndScore).forEach(([hole, scores]) => {
      totalP1 += (scores as any).p1 || 0;
      totalP2 += (scores as any).p2 || 0;

      const p1Ele = this.shadowRoot?.querySelector(
        `#${this.teamOther}-${hole}-p1`
      ) as HTMLSpanElement;

      // eslint-disable-next-line prefer-destructuring
      if (p1Ele) p1Ele.textContent = (scores as any).p1 || 0;

      const p2Ele = this.shadowRoot?.querySelector(
        `#${this.teamOther}-${hole}-p2`
      ) as HTMLSpanElement;

      // eslint-disable-next-line prefer-destructuring
      if (p2Ele) p2Ele.textContent = (scores as any).p2 || 0;
    });
    this.setTotals('teamOther', totalP1, totalP2);
  }

  setMyTeam(holeAndScore: any) {
    let totalP1 = 0;
    let totalP2 = 0;
    Object.entries(holeAndScore).forEach(([hole, scores]) => {
      totalP1 += (scores as any).p1 || 0;
      totalP2 += (scores as any).p2 || 0;

      const p1Ele = this.shadowRoot?.querySelector(
        `#${this.team}-${hole}-p1`
      ) as HTMLSelectElement;

      // eslint-disable-next-line prefer-destructuring
      if (p1Ele) p1Ele.value = (scores as any).p1 || 0;

      const p2Ele = this.shadowRoot?.querySelector(
        `#${this.team}-${hole}-p2`
      ) as HTMLSelectElement;

      // eslint-disable-next-line prefer-destructuring
      if (p2Ele) p2Ele.value = (scores as any).p2 || 0;
    });
    this.setTotals('team', totalP1, totalP2);
  }

  setTotals(team: string, p1: number, p2: number) {
    if (team === 'team') {
      this.totalTeamP1Ele.textContent = p1.toString();
      this.totalTeamP2Ele.textContent = p2.toString();
    }

    if (team === 'teamOther') {
      this.totalTeamOtherP1Ele.textContent = p1.toString();
      this.totalTeamOtherP2Ele.textContent = p2.toString();
    }
  }

  private goToGameDay() {
    Router.go(`/golf-day/${this.day}/game-day`);
  }

  private getHoleInfo(holeNumber: number) {
    if (!this.course) return '';
    return this.course[`h${holeNumber}`]?.par || '';
  }

  render() {
    return html`
      <article>
        <table>
          <tr>
            <td>Hole (Par)</td>
            <td style="color: blue; font-weight: bold;" colspan="2">
              ${this.team} <br />
              <span id="p1">Player1</span>
              &nbsp; Player2
            </td>
            <td colspan="2">
              ${this.teamOther} <br />
              Player1&nbsp;Player2
            </td>
          </tr>
          ${Array(9)
            .fill(0)
            .map(
              (hole, i) =>
                html`<tr>
                  <td
                    class="h${i + this.startingHole}"
                    style="font-size: 1.25rem;"
                  >
                    ${i + this.startingHole}
                    (${this.getHoleInfo(i + this.startingHole)})
                  </td>
                  <td>
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p1"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-select>
                  </td>
                  <td>
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p2"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-select>
                  </td>
                  <td>
                    <rbb-golf-score-view
                      id="${this.teamOther}-h${i + 1}-p1"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-view>
                  </td>
                  <td>
                    <rbb-golf-score-view
                      id="${this.teamOther}-h${i + 1}-p2"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-view>
                  </td>
                </tr>`
            )}
          <tr style="font-size: 1.5rem;">
            <td>sum:</td>
            <td id="total-team-p1"></td>
            <td id="total-team-p2"></td>
            <td id="total-teamother-p1"></td>
            <td id="total-teamother-p2"></td>
          </tr>
        </table>
        <br />
        <button style="width:50%" @click="${() => this.goToGameDay()}">
          Game Day View
        </button>
        <br />
        <br />
        ${this.error ? html`<h1>${this.error}</h1>` : ''}
        <br />
        <br />
      </article>
    `;
  }
}
