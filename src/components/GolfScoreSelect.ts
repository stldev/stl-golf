/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { getDatabase, ref, set } from 'firebase/database';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-score-select')
export class GolfScoreSelect extends LitElement {
  @property({ type: String }) id = '';

  @property({ type: String }) day = '';

  @state() team = '';

  @state() hole = '';

  @state() player = '';

  @state() allSubs = new Subscription();

  @state() pScore = 0;

  @state() scoreDb = getDatabase();

  private myTeamToday = storeSvc.myTeamToday$;

  static styles = [
    mvpCss,
    css`
      span {
        display: inline-block;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      select {
        font-size: 1.5rem;
      }
    `,
  ];

  connectedCallback() {
    const [team, hole, player] = this.id.split('-');
    this.team = team;
    this.hole = hole;
    this.player = player;

    const sub1 = this.myTeamToday.subscribe(s => {
      const holeScores = s[this.hole] || {};

      this.pScore = holeScores[`${player}`] || 0;
    });

    this.allSubs.add(sub1);
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  private onChange(evt: any) {
    const playerScore = Number(evt.target.value);

    set(
      ref(
        this.scoreDb,
        `/${this.team}/${this.day}/${this.hole}/${this.player}`
      ),
      playerScore
    ).catch(err => {
      console.log('Firebase-database-ERROR', err);
      // Router.go(`/golf-day/${this.day}`);
    });
  }

  render() {
    const epoch = new Date(`${this.day}T23:59:00.000Z`).getTime();
    const cutoffTimeInFuture = new Date(epoch + 3600000 * 4).getTime();

    // this means that at about 11pm the day of golf the hole dropdowns are no longer changable
    const isDisabledFuture = Date.now() > cutoffTimeInFuture;
    // TODO: put this back in effect after beta testing
    // const cutoffTimeInPast = new Date(`${this.day}T15:30:00.000Z`).getTime();
    const isDisabledPast = false; // Date.now() < cutoffTimeInPast ? 'disabled' : '';

    if (isDisabledFuture || isDisabledPast)
      return html`<span>${this.pScore}</span>`;

    return html`
      <select @change="${e => this.onChange(e)}">
        ${Array(11)
          .fill(0)
          .map((_, i) => {
            if (i === this.pScore)
              return html`<option selected value="${i}">${i}</option>`;
            return html`<option value="${i}">${i}</option>`;
          })}
      </select>
    `;
  }
}
