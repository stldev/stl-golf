import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { router } from '../router';

@customElement('rbb-golf-day')
export class GolfDay extends LitElement {
  @property({ type: Object }) location = router.location;

  @property({ type: String }) day = '';

  @property({ type: String }) team = '';

  @property({ type: String }) teamOther = '';

  static styles = [
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

  firstUpdated() {
    this.team = localStorage
      .getItem('woodchopper-email')
      .replace('woodchoppers.golf+', '')
      .replace('@gmail.com', '');

    this.teamOther = this.team === 'team6' ? 'team7' : 'team6';

    this.day = this.location.params.day.toString();

    const myTeamToday = ref(getDatabase(), `/${this.team}/${this.day}`);
    onValue(myTeamToday, snapshot => {
      const allData = snapshot.val();
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');
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
    });

    const otherTeamToday = ref(getDatabase(), `/${this.teamOther}/${this.day}`);
    onValue(otherTeamToday, snapshot => {
      const allData = snapshot.val();
      Object.entries(allData).forEach(([hole, scores]) => {
        const bothScores = (scores as any).split('-');
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
    });
  }

  // private addTheItem() {
  //   this.itemsSectionOL.insertAdjacentHTML('beforeend', '<li>item</li>');
  //   const db = getDatabase();
  //   set(ref(db, '/team7/2022-07-27/h3'), '1-2');
  // }

  // eslint-disable-next-line class-methods-use-this
  private onChange(e: any) {
    const changedProps = e.target.id.split('-');

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
    set(ref(db, `/${team}/${this.day}/${hole}`), `${scoreP1}-${scoreP2}`);
  }

  render() {
    return html`
      <article>
        <header>
          <h2>${this.team} on ${this.day}</h2>
        </header>
        <table>
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
            <td>1</td>
            <td>
              <select
                id="team6-h1-p1"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team6-h1-p2"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team7-h1-p1"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team7-h1-p2"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>
              <select
                id="team6-h2-p1"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team6-h2-p2"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team7-h2-p1"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
            <td>
              <select
                id="team7-h2-p2"
                @change=${(e: Event) => this.onChange(e)}
              >
                <option value="0" selected>0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </td>
          </tr>
        </table>
      </article>
    `;
  }
}
