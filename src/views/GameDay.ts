/* eslint-disable no-param-reassign */
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

  @state() allTeamsToday = [];

  static styles = [
    mvpCss,
    css`
      article {
        text-align: center;
        margin-top: 3rem;
      }
      header {
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
    if (super.connectedCallback) super.connectedCallback();
  }

  // onDestroy
  disconnectedCallback() {
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
    storeSvc.allTeamsToday$.next({});
    const sub1 = storeSvc.allTeamsToday$.subscribe(s => {
      if (Object.keys(s).length) {
        console.log('ssssssssss');
        console.log(s);
        this.allTeamsToday.push(s.team4);

        console.log('this.allTeamsToday');
        console.log(this.allTeamsToday);
      }
    });

    this.allSubs.add(sub1);
  }

  render() {
    return html`
      <article>
        <header>game day</header>
        <div>show list here</div>
      </article>
    `;
  }
}
