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

  @property({ type: String }) par = '';

  @state() team = '';

  @state() hole = '';

  @state() player = '';

  @state() allSubs = new Subscription();

  @state() pScore = 0;

  static styles = [
    mvpCss,
    css`
      span {
        display: inline-block;
        margin-bottom: 1rem;
        font-size: 1.4rem;
      }
      .low-score {
        color: mediumseagreen;
      }
      .high-score {
        color: red;
      }
    `,
  ];

  connectedCallback() {
    const [, hole, player] = this.id.split('-');
    // this.team = team;
    this.hole = hole;
    this.player = player;

    const sub1 = storeSvc.otherTeamToday$.subscribe(s => {
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

  render() {
    let cssClass = '';
    if (this.pScore < Number(this.par)) cssClass = 'low-score';
    if (this.pScore > Number(this.par)) cssClass = 'high-score';
    if (this.pScore === 0) cssClass = '';

    return html`<span class="${cssClass}"
      >${this.pScore === 0 ? '--' : this.pScore}</span
    >`;
  }
}
