/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-golf-score-view')
export class GolfScoreView extends LitElement {
  @property({ type: String }) id = '';

  @property({ type: String }) day = '';

  @state() team = '';

  @state() hole = '';

  @state() player = '';

  @state() allSubs = new Subscription();

  @state() pScore = 0;

  private otherTeamToday = storeSvc.otherTeamToday$;

  static styles = [
    mvpCss,
    css`
      span {
        display: inline-block;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
    `,
  ];

  connectedCallback() {
    const [, hole, player] = this.id.split('-');
    // this.team = team;
    this.hole = hole;
    this.player = player;

    const sub1 = this.otherTeamToday.subscribe(s => {
      const holeScores = s[this.hole] || {};

      this.pScore = holeScores[`${player}`] || 0;
    });

    this.allSubs.add(sub1);
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  render() {
    return html`<span>${this.pScore}</span>`;
  }
}
