/* eslint-disable lit-a11y/click-events-have-key-events */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Subscription } from 'rxjs';
// import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

@customElement('rbb-player-dialog')
export class PlayerDialog extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;

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
        top: 20%;
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
    if (super.connectedCallback) super.connectedCallback();
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  close() {
    this.open = false;
  }

  render() {
    return html` <div
      class="wrapper ${this.open ? 'open' : ''}"
      aria-hidden="${!this.open}"
    >
      <div class="overlay" @click="${this.close}"></div>
      <div
        class="dialog"
        role="dialog"
        aria-labelledby="title"
        aria-describedby="content"
      >
        <button class="close" aria-label="Close" @click=${this.close}>
          ✖️
        </button>
        <h1 id="title"><slot name="heading"></slot></h1>
        TODO: allow set player
      </div>
    </div>`;
  }
}
