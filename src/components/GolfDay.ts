import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { router } from '../router';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-day')
export class GolfDay extends LitElement {
  @property({ type: Object }) location = router.location;

  @property({ type: String }) day = '';

  @property({ type: String }) team = '';

  @property({ type: String }) teamOther = '';

  @query('#ScoresTable tbody') scoresTableEle: HTMLTableElement;

  @query('#total-t6-p1') totalT6P1Ele: HTMLTableElement;

  @query('#total-t6-p2') totalT6P2Ele: HTMLTableElement;

  @query('#total-t7-p1') totalT7P1Ele: HTMLTableElement;

  @query('#total-t7-p2') totalT7P2Ele: HTMLTableElement;

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
      }
      header {
        color: red;
      }
      table {
        width: 50%;
        margin: 0 auto;
      }
    `,
  ];

  setTotals(team: string, p1: number, p2: number) {
    if (team === 'team7') {
      this.totalT7P1Ele.textContent = p1.toString();
      this.totalT7P2Ele.textContent = p2.toString();
    }

    if (team === 'team6') {
      this.totalT6P1Ele.textContent = p1.toString();
      this.totalT6P2Ele.textContent = p2.toString();
    }
  }

  getAllData() {
    this.team = localStorage
      .getItem('woodchopper-email')
      .replace('woodchoppers.golf+', '')
      .replace('@gmail.com', '');

    this.teamOther = this.team === 'team6' ? 'team7' : 'team6';

    this.day = this.location.params.day.toString();

    const myTeamToday = ref(getDatabase(), `/${this.team}/${this.day}`);
    onValue(myTeamToday, snapshot => {
      const allData = snapshot.val();
      let totalP1 = 0;
      let totalP2 = 0;
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');

        totalP1 += Number(bothScores[0]);
        totalP2 += Number(bothScores[1]);

        // eslint-disable-next-line prefer-destructuring
        (
          this.shadowRoot?.querySelector(
            `#${this.team}-${hole}-p1`
          ) as HTMLSelectElement
        ).value = bothScores[0];
        // eslint-disable-next-line prefer-destructuring
        (
          this.shadowRoot?.querySelector(
            `#${this.team}-${hole}-p2`
          ) as HTMLSelectElement
        ).value = bothScores[1];
      });
      this.setTotals(this.team, totalP1, totalP2);
    });

    const otherTeamToday = ref(getDatabase(), `/${this.teamOther}/${this.day}`);
    onValue(otherTeamToday, snapshot => {
      const allData = snapshot.val();
      let totalP1 = 0;
      let totalP2 = 0;
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');
        totalP1 += Number(bothScores[0]);
        totalP2 += Number(bothScores[1]);

        // eslint-disable-next-line prefer-destructuring
        (
          this.shadowRoot?.querySelector(
            `#${this.teamOther}-${hole}-p1`
          ) as HTMLSelectElement
        ).value = bothScores[0];
        // eslint-disable-next-line prefer-destructuring
        (
          this.shadowRoot?.querySelector(
            `#${this.teamOther}-${hole}-p2`
          ) as HTMLSelectElement
        ).value = bothScores[1];
      });
      this.setTotals(this.teamOther, totalP1, totalP2);
    });
  }

  firstUpdated() {
    this.createTable();
    this.getAllData();
  }

  private createTable() {
    const allOptions = Array(11)
      .fill('')
      .map((e, i) => {
        if (i === 0) return '<option value="0" selected>0</option>';
        return `<option value="${i}">${i}</option>`;
      });

    const front9Holes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    let htmlToUse = '';

    front9Holes.forEach(e => {
      htmlToUse += `<tr>
      <td>${e}</td>
      <td><select id="team6-h${e}-p1">${allOptions}</select></td>
      <td><select id="team6-h${e}-p2">${allOptions}</select></td>
      <td><select id="team7-h${e}-p1">${allOptions}</select></td>
      <td><select id="team7-h${e}-p2">${allOptions}</select></td>
      </tr>`;
    });

    this.scoresTableEle.insertAdjacentHTML('beforeend', htmlToUse);

    const selectNodes = this.shadowRoot?.querySelectorAll('select');
    const selectAry = Array.from(selectNodes);
    selectAry.forEach(ele => {
      ele.addEventListener('change', evt => this.onChange(evt));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private onChange(e: any) {
    const changedProps = e.target.id.split('-');
    // console.log(changedProps);
    // const dayToUse = this.location.params.day;
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

  render() {
    return html`
      <article>
        <header>
          <h2>${this.team} on ${this.day}</h2>
        </header>
        <table id="ScoresTable">
          <tr>
            <td>Hole</td>
            <td colspan="2">
              Team 6 <br />
              Player1&nbsp;Player2
            </td>
            <td colspan="2">
              Team 7 <br />
              Player1&nbsp;Player2
            </td>
          </tr>
          <tr>
            <td>total:</td>
            <td id="total-t6-p1"></td>
            <td id="total-t6-p2"></td>
            <td id="total-t7-p1"></td>
            <td id="total-t7-p2"></td>
          </tr>
        </table>
      </article>
    `;
  }
}
