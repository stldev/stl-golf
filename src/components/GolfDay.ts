/* eslint-disable lit-a11y/click-events-have-key-events */
import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { router } from '../router';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day')
export class GolfDay extends LitElement {
  @state() location = router.location;

  @state() day = '';

  @state() team = '';

  @state() teamOther = '';

  @query('#ScoresTable tbody') scoresTableEle: HTMLTableElement;

  @query('#total-team-p1') totalTeamP1Ele: HTMLTableElement;

  @query('#total-team-p2') totalTeamP2Ele: HTMLTableElement;

  @query('#total-teamother-p1') totalTeamOtherP1Ele: HTMLTableElement;

  @query('#total-teamother-p2') totalTeamOtherP2Ele: HTMLTableElement;

  protected updated(_changedProps: Map<string | number | symbol, unknown>) {
    if (_changedProps.has('day')) this.dayHandler();
  }

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 3rem;
      }
      header {
        color: blue;
        padding: 0;
      }
      table td {
        padding: 0.6rem;
      }
      table td span {
        display: inline-block;
        margin-bottom: 1rem;
        font-size: large;
      }
    `,
  ];

  constructor() {
    super();
    this.team = GolfDay.getTeam();
  }

  connectedCallback() {
    this.day = this.location.params.day.toString();
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
    // const selectNodes = this.shadowRoot?.querySelectorAll('select');
    // const selectAry = Array.from(selectNodes);
    // selectAry.forEach(ele => {
    //   ele.removeEventListener('change', evt => this.onChange(evt));
    // });
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  dayHandler() {
    this.getPairings();
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

  getPairings() {
    const thisYear = new Date().getFullYear();

    const schedule = ref(getDatabase(), `/${thisYear}-schedule`);
    onValue(schedule, snapshot => {
      const allData = snapshot.val() || {};

      const pair = allData[this.day] || {};

      Object.entries(pair).forEach(([teamA, teamB]) => {
        if (teamA === this.team) this.teamOther = teamB as string;
        if (teamB === this.team) this.teamOther = teamA as string;
      });

      this.createTable(pair.isFront);
      this.getAllData();
    });
  }

  getAllData() {
    console.log('GET=ALL-DATA');
    const myTeamToday = ref(getDatabase(), `/${this.team}/${this.day}`);
    onValue(myTeamToday, snapshot => {
      const allData = snapshot.val() || {};
      let totalP1 = 0;
      let totalP2 = 0;
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');

        totalP1 += Number(bothScores[0]);
        totalP2 += Number(bothScores[1]);

        const p1Ele = this.shadowRoot?.querySelector(
          `#${this.team}-${hole}-p1`
        ) as HTMLSelectElement;

        // eslint-disable-next-line prefer-destructuring
        if (p1Ele) p1Ele.value = bothScores[0];

        const p2Ele = this.shadowRoot?.querySelector(
          `#${this.team}-${hole}-p2`
        ) as HTMLSelectElement;

        // eslint-disable-next-line prefer-destructuring
        if (p2Ele) p2Ele.value = bothScores[1];
      });
      this.setTotals('team', totalP1, totalP2);
    });

    const otherTeamToday = ref(getDatabase(), `/${this.teamOther}/${this.day}`);
    onValue(otherTeamToday, snapshot => {
      const allData = snapshot.val() || {};
      let totalP1 = 0;
      let totalP2 = 0;
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');

        totalP1 += Number(bothScores[0]);
        totalP2 += Number(bothScores[1]);

        const p1Ele = this.shadowRoot?.querySelector(
          `#${this.teamOther}-${hole}-p1`
        ) as HTMLSpanElement;

        // eslint-disable-next-line prefer-destructuring
        if (p1Ele) p1Ele.textContent = bothScores[0];

        const p2Ele = this.shadowRoot?.querySelector(
          `#${this.teamOther}-${hole}-p2`
        ) as HTMLSpanElement;

        // eslint-disable-next-line prefer-destructuring
        if (p2Ele) p2Ele.textContent = bothScores[1];
      });
      this.setTotals('teamOther', totalP1, totalP2);
    });
  }

  static getTeam() {
    return localStorage
      .getItem('woodchopper-email')
      .replace('woodchoppers.golf+', '')
      .replace('@gmail.com', '');
  }

  private createTable(isFront: boolean) {
    const allOptions = Array(11)
      .fill('')
      .map((e, i) => {
        if (i === 0) return '<option value="0" selected>0</option>';
        return `<option value="${i}">${i}</option>`;
      });

    const holesToUse = isFront
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
      : [10, 11, 12, 13, 14, 15, 16, 17, 18];

    let htmlToUse = '';

    const extraHours = 3600000 * 4;
    const cutoffTimeInFuture = new Date(
      new Date(`${this.day}T23:59:00.000Z`).getTime() + extraHours
    ).getTime();
    // TODO: put this back in effect after beta testing
    // const cutoffTimeInPast = new Date(`${this.day}T15:30:00.000Z`).getTime();

    const isDisabledFuture = Date.now() > cutoffTimeInFuture ? 'disabled' : '';
    // TODO: put this back in effect after beta testing
    const isDisabledPast = false; // Date.now() < cutoffTimeInPast ? 'disabled' : '';

    holesToUse.forEach(e => {
      htmlToUse += `<tr>
      <td>${e}</td>
      <td><select ${isDisabledFuture || isDisabledPast} id="${
        this.team
      }-h${e}-p1">${allOptions}</select></td>
      <td><select ${isDisabledFuture || isDisabledPast} id="${
        this.team
      }-h${e}-p2">${allOptions}</select></td>
      <td><span id="${this.teamOther}-h${e}-p1">0</span></td>
      <td><span id="${this.teamOther}-h${e}-p2">0</span></td>
      </tr>`;
    });

    this.scoresTableEle.insertAdjacentHTML('beforeend', htmlToUse);

    const selectNodes = this.shadowRoot?.querySelectorAll('select');
    const selectAry = Array.from(selectNodes);
    selectAry.forEach(ele => {
      ele.addEventListener('change', evt => this.onChange(evt), { once: true });
    });
  }

  private onChange(e: any) {
    const changedProps = e.target.id.split('-');
    // console.log(changedProps);
    const team = changedProps[0];
    const hole = changedProps[1];
    const scoreP1 = (
      this.shadowRoot?.querySelector(`#${team}-${hole}-p1`) as HTMLSelectElement
    ).value;
    const scoreP2 = (
      this.shadowRoot?.querySelector(`#${team}-${hole}-p2`) as HTMLSelectElement
    ).value;

    const db = getDatabase();
    // set(ref(db, '/team7/2022-07-27/h3'), '1-2');
    set(ref(db, `/${team}/${this.day}/${hole}`), `${scoreP1}-${scoreP2}`).catch(
      err => {
        console.log('Firebase-database-ERROR', err);
        Router.go(`/golf-day/${this.day}`);
      }
    );
  }

  private refresh() {
    this.getPairings();
  }

  render() {
    return html`
      <article>
        <header>
          <h3>
            ${this.team} on ${this.day} &nbsp;&nbsp;
            <span
              style="font-size: 9px; border: 1px black solid;"
              @click="${() => this.refresh()}"
              >refresh</span
            >
          </h3>
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
        </table>
      </article>
    `;
  }
}
