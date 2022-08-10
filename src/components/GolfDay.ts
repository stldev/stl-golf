/* eslint-disable lit-a11y/click-events-have-key-events */
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

  @state() teamOther = '';

  @state() startingHole = 10;

  @state() allSubs = new Subscription();

  @query('#ScoresTable tbody') scoresTableEle: HTMLTableElement;

  @query('#total-team-p1') totalTeamP1Ele: HTMLTableElement;

  @query('#total-team-p2') totalTeamP2Ele: HTMLTableElement;

  @query('#total-teamother-p1') totalTeamOtherP1Ele: HTMLTableElement;

  @query('#total-teamother-p2') totalTeamOtherP2Ele: HTMLTableElement;

  private schedule = storeSvc.schedule$;

  private myTeamToday = storeSvc.myTeamToday$;

  private otherTeamToday = storeSvc.otherTeamToday$;

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 2.25rem;
        width: 100%;
      }
      header {
        color: blue;
        padding: 0;
      }
      table td {
        padding: 0.4rem 0.8rem;
      }
    `,
  ];

  constructor() {
    super();
    const team = GolfDay.getTeam();
    storeSvc.getSchedule(team);
    this.team = team;
  }

  static getTeam() {
    return localStorage.getItem('woodchopper-team');
  }

  connectedCallback() {
    this.day = this.location.params.day.toString();
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
    this.allSubs.unsubscribe();
    // const selectNodes = this.shadowRoot?.querySelectorAll('select');
    // const selectAry = Array.from(selectNodes);
    // selectAry.forEach(ele => {
    //   ele.removeEventListener('change', evt => this.onChange(evt));
    // });
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  protected updated(_changedProps: Map<string | number | symbol, unknown>) {
    if (_changedProps.has('day')) this.dayHandler();
  }

  dayHandler() {
    const sub1 = this.schedule.subscribe(s => {
      const pair = s[this.day] || {};

      if (pair.isFront) this.startingHole = 1;

      Object.entries(pair).forEach(([teamA, teamB]) => {
        if (teamA === this.team) this.teamOther = teamB as string;
        if (teamB === this.team) this.teamOther = teamA as string;
      });

      // this.createTable(pair.isFront);
      storeSvc.getMyTeamToday(this.team, this.day);
      storeSvc.getOtherTeamToday(this.teamOther, this.day);

      this.dataHandler();
    });

    this.allSubs.add(sub1);
  }

  dataHandler() {
    const sub = combineLatest({
      myTeam: this.myTeamToday,
      otherTeam: this.otherTeamToday,
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

  render() {
    return html`
      <article>
        <header>
          ${new Date(`${this.day}T12:00:00.000Z`).toLocaleDateString()}
        </header>
        <table id="ScoresTable">
          <tr>
            <td>Hole</td>
            <td style="color: blue; font-weight: bold;" colspan="2">
              ${this.team} <br />
              Player1&nbsp;Player2
            </td>
            <td colspan="2">
              ${this.teamOther} <br />
              Player1&nbsp;Player2
            </td>
          </tr>
          <tr>
            <td>total</td>
            <td id="total-team-p1"></td>
            <td id="total-team-p2"></td>
            <td id="total-teamother-p1"></td>
            <td id="total-teamother-p2"></td>
          </tr>
          ${Array(9)
            .fill(0)
            .map(
              (hole, i) =>
                html`<tr>
                  <td style="font-size: 1.5rem;">${i + this.startingHole}</td>
                  <td>
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p1"
                      day="${this.day}"
                    ></rbb-golf-score-select>
                  </td>
                  <td>
                    <rbb-golf-score-select
                      id="${this.team}-h${i + 1}-p2"
                      day="${this.day}"
                    ></rbb-golf-score-select>
                  </td>
                  <td>
                    <rbb-golf-score-view
                      id="${this.teamOther}-h${i + 1}-p1"
                      day="${this.day}"
                    ></rbb-golf-score-view>
                  </td>
                  <td>
                    <rbb-golf-score-view
                      id="${this.teamOther}-h${i + 1}-p2"
                      day="${this.day}"
                    ></rbb-golf-score-view>
                  </td>
                </tr>`
            )}
        </table>
      </article>
    `;
  }
}
