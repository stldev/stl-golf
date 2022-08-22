import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-my-team')
export class MyTeam extends LitElement {
  @state() allSubs = new Subscription();

  @state() teamRoster = [];

  static styles = [
    mvpCss,
    css`
      section {
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        background: white;
        max-width: 470px;
        margin: 25px auto 8px;
        padding: 16px 12px;
        border-radius: 3px;
      }
      header {
        padding-bottom: 0;
      }
      header h2 {
        color: green;
      }
    `,
  ];

  constructor() {
    super();
    this.created();
  }

  created() {
    const team = localStorage.getItem('woodchopper-team');
    storeSvc.getRoster(team);
    storeSvc.getAllDaysForTeam(team);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  connectedCallback() {
    const sub1 = storeSvc.teamRoster$.subscribe(tr => {
      const teamRoster = Object.entries(tr).reduce((acc, [player, info]) => {
        acc.push({ player, info });
        return acc;
      }, []);

      this.teamRoster = teamRoster;
    });

    const sub2 = storeSvc.schedule$.subscribe(s => {
      Object.entries(s).reduce((acc, [day, pairs]) => {
        if (day === '2022-07-27') {
          console.log('IS_FRONT', (pairs as any).isFront);
        }
        return 1;
      }, 0);
    });

    const sub3 = storeSvc.allDaysForTeam$.subscribe(ad => {
      Object.entries(ad).reduce((acc, [theDay, info]) => {
        if ((info as any).p1 === 'RB') {
          const holeScores = Object.values(info)
            .map(player => player.p1)
            .filter(Boolean);

          console.log('theDay', theDay);
          console.log('holeScores', holeScores);
        }
        acc.push({ id: 1 });
        return acc;
      }, []);
    });

    this.allSubs.add(sub1);
    this.allSubs.add(sub2);
    this.allSubs.add(sub3);

    if (super.connectedCallback) super.connectedCallback();
  }

  render() {
    return html`
      <main>
        <header>
          <h2>My Team!</h2>
        </header>
        ${this.teamRoster.map(
          tr =>
            html`
              <section>
                <table>
                  <tr>
                    <td style="text-align:center;" colspan="2">
                      ${tr.info.isCaptain ? '👑' : ''} ${tr.info.name}
                      (${tr.info.nameShort})
                    </td>
                  </tr>
                  <tr>
                    <td>Handicap (start):</td>
                    <td>${tr.info['handicap-start']}</td>
                  </tr>
                  <tr>
                    <td>Handicap (current):</td>
                    <td>${tr.info['handicap-now']}</td>
                  </tr>
                </table>
              </section>
            `
        )}
      </main>
    `;
  }
}
