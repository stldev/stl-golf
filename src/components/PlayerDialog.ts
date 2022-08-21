/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
import { getDatabase, ref, update } from 'firebase/database';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-player-dialog')
export class PlayerDialog extends LitElement {
  @property({ type: Boolean }) open = false;

  @property({ type: String }) currentPlayerSelected = '';

  @property({ type: String }) day = '';

  @state() teamRoster = [];

  @state() allSubs = new Subscription();

  static styles = [
    mvpCss,
    css`
      .wrapper {
        opacity: 0;
        transition: visibility 0s, opacity 0.25s ease-in;
      }
      .wrapper:not(.open) {
        visibility: hidden;
      }
      .wrapper.open {
        align-items: center;
        display: flex;
        justify-content: center;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 1;
        visibility: visible;
      }
      .overlay {
        background: rgba(0, 0, 0, 0.8);
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
      }
      .dialog {
        background: #fff;
        width: 85%;
        padding: 1rem;
        position: fixed;
        top: 10%;
      }
      button {
        all: unset;
        cursor: pointer;
        font-size: 1.25rem;
        position: absolute;
        top: 1rem;
        right: 1rem;
      }
      button:focus {
        border: 2px solid blue;
      }
    `,
  ];

  connectedCallback() {
    const sub1 = storeSvc.teamRoster$.subscribe(tr => {
      const teamRoster = Object.entries(tr).reduce((acc, [player, info]) => {
        acc.push({ player, info });
        return acc;
      }, []);

      this.teamRoster = teamRoster;
    });
    this.allSubs.add(sub1);
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  close() {
    this.open = false;
  }

  doIt(nameShort: string) {
    console.log('currentPlayerSelected', this.currentPlayerSelected);
    const team = localStorage.getItem('woodchopper-team');
    const dbUrl = `/${team}/${this.day}`;
    const payload = {};
    payload[`${this.currentPlayerSelected}`] = nameShort;
    update(ref(getDatabase(), dbUrl), payload)
      .then(() => this.close())
      .catch(err => storeSvc.errors$.next(err.message));
  }

  render() {
    return html` <div
      class="wrapper ${this.open ? 'open' : ''}"
      aria-hidden="${!this.open}"
    >
      <div class="overlay"></div>
      <div class="dialog" role="dialog" aria-labelledby="title">
        <button class="close" aria-label="Close" @click=${this.close}>
          ✖️
        </button>
        <h1 id="title"><slot name="heading"></slot></h1>
        ${this.teamRoster.map(
          tr =>
            html`
              <section>
                <article @click="${() => this.doIt(tr.info.nameShort)}">
                  <table style="border: 5px solid black">
                    <tr>
                      <td style="text-align:center;" colspan="2">
                        ${tr.info.isCaptain ? '👑' : ''} ${tr.info.name}
                        (${tr.info.nameShort})
                      </td>
                    </tr>
                    <tr>
                      <td>Handicap (current):</td>
                      <td>${tr.info['handicap-now']}</td>
                    </tr>
                  </table>
                </article>
              </section>
            `
        )}
      </div>
    </div>`;
  }
}
