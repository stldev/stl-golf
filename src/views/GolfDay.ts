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

  @query('rbb-player-dialog') playerDialogEle: HTMLElement;

  @query('#MyTeam .p1') myTeamP1Ele: HTMLSpanElement;

  @query('#MyTeam .p2') myTeamP2Ele: HTMLSpanElement;

  @query('#OtherTeam .p1') otherTeamP1Ele: HTMLSpanElement;

  @query('#OtherTeam .p2') otherTeamP2Ele: HTMLSpanElement;

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
      }
      td,
      span,
      #p1 {
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
      #launch-dialog {
        background: tomato;
        border-radius: 4px;
        color: #fff;
        font-family: Helvetica, Arial, sans-serif;
        padding: 0.5rem 1rem;
        position: static;
      }
      #MyTeam {
        color: blue;
        font-weight: bold;
      }
      .foo-bar {
        width: 20%;
      }
      .p1,
      .p2 {
        font-size: larger;
        font-weight: bold;
      }
      #MyTeam .p1,
      #MyTeam .p2 {
        border: 1px solid blue;
        padding: 0.3rem;
        color: white;
        background-color: blue;
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
    });

    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
    this.allSubs.add(sub3);

    if (super.connectedCallback) super.connectedCallback();
  }

  // onDestroy
  disconnectedCallback() {
    // this.myTeamP1Ele.removeEventListener('touchstart', this.checkIfLongPress);
    // this.myTeamP2Ele.removeEventListener('touchstart', this.checkIfLongPress);
    storeSvc.day$.next('');
    storeSvc.errors$.next('');
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  protected firstUpdated() {
    const theDay = new Date(`${this.day}T12:00:00.000Z`).toLocaleDateString();
    // don't like this, but DISCONNECTED (from other component) is fired AFTER this components startup hooks
    setTimeout(() => {
      storeSvc.day$.next(theDay);
    }, 50);

    const epoch = new Date(`${this.day}T23:59:00.000Z`).getTime();
    const cutoffTimeInFuture = new Date(epoch + 3600000 * 4).getTime();
    // this means that at about 11pm the day of golf the hole dropdowns are no longer changable
    const isDisabledFuture = Date.now() > cutoffTimeInFuture;

    if (!isDisabledFuture) {
      this.myTeamP1Ele.addEventListener(
        'touchstart',
        () => this.checkIfLongPress('p1'),
        { passive: true }
      );
      this.myTeamP2Ele.addEventListener(
        'touchstart',
        () => this.checkIfLongPress('p2'),
        { passive: true }
      );

      this.myTeamP1Ele.addEventListener('touchend', evt => {
        evt.preventDefault();
        this.touchStart = 0;
        globalThis.clearInterval(this.touchStartRef);
      });

      this.myTeamP2Ele.addEventListener('touchend', evt => {
        evt.preventDefault();
        this.touchStart = 0;
        globalThis.clearInterval(this.touchStartRef);
      });
    }
  }

  checkIfLongPress(player: string) {
    this.touchStartRef = setInterval(() => {
      if (this.touchStart > 2) {
        console.log('IS-LONG-PRESS');
        (this.playerDialogEle as any).open = true;
        (this.playerDialogEle as any).currentPlayerSelected = player;
        this.touchStart = 0;
        globalThis.clearInterval(this.touchStartRef);
      }
      this.touchStart += 1;
    }, 250) as unknown as number;
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
    this.otherTeamP1Ele.textContent = holeAndScore.p1 || 'P_1';
    this.otherTeamP2Ele.textContent = holeAndScore.p2 || 'P_2';
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
    this.myTeamP1Ele.textContent = holeAndScore.p1 || 'P_1';
    this.myTeamP2Ele.textContent = holeAndScore.p2 || 'P_2';
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

  openModal(player: string) {
    (this.playerDialogEle as any).open = true;
    (this.playerDialogEle as any).currentPlayerSelected = player;
  }

  render() {
    return html`
      <rbb-player-dialog day="${this.day}">
        <span slot="heading">Set Player</span>
      </rbb-player-dialog>
      <article>
        <table>
          <tr>
            <td># (par)</td>
            <td id="MyTeam" colspan="2">
              ${this.team?.toUpperCase()} <br />
              <span @dblclick="${() => this.openModal('p1')}" class="p1"
                >p1</span
              >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span @dblclick="${() => this.openModal('p2')}" class="p2"
                >p2</span
              >
            </td>
            <td id="OtherTeam" colspan="2">
              ${this.teamOther} <br />
              <span class="p1">p1</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span class="p2">p2</span>
            </td>
          </tr>
          ${Array(9)
            .fill(0)
            .map(
              (_, i) =>
                html`<tr>
                  <td
                    class="h${i + this.startingHole}"
                    style="font-size: 1.25rem;"
                  >
                    ${i + this.startingHole}
                    (${this.getHoleInfo(i + this.startingHole)})
                  </td>
                  <td class="foo-bar">
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p1"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-select>
                  </td>
                  <td class="foo-bar">
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p2"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-select>
                  </td>
                  <td class="foo-bar">
                    <rbb-golf-score-view
                      id="${this.teamOther}-h${i + 1}-p1"
                      day="${this.day}"
                      par="${this.getHoleInfo(i + this.startingHole)}"
                    ></rbb-golf-score-view>
                  </td>
                  <td class="foo-bar">
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
