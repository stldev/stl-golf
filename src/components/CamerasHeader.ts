/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable lit-a11y/anchor-is-valid */
import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { getAuth, signOut } from 'firebase/auth';
import { mvpCss } from '../styles-3rdParty';

@customElement('cameras-header')
export class CamerasHeader extends LitElement {
  @property({ type: Boolean }) hideButton: boolean = true;

  @query('#mySidenav') _sideNav: HTMLDivElement;

  @query('#backdrop') _backDrop: HTMLDivElement;

  static styles = [
    mvpCss,
    css`
      .backdrop-container {
        display: none;
        position: fixed;
        z-index: 2;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.4);
        -webkit-animation: fadeIn 1.2s ease-in-out;
        animation: fadeIn 1.2s ease-in-out;
      }

      nav {
        width: 100%;
        height: 5vh;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        background-color: white;
        z-index: 1;
      }

      .mobile-nav-open-icon {
        font-size: 2rem;
        padding: 1rem;
        cursor: pointer;
        margin-right: 2rem;
        color: black;
        margin-left: 1rem;
      }

      .sidenav-container {
        height: 100%;
        width: 0;
        position: fixed;
        z-index: 3;
        top: 0;
        left: 0;
        background-color: #111;
        overflow-x: hidden;
        transition: 0.5s;
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .sidenav-container a {
        text-decoration: none;
        font-size: 1rem;
        color: #818181;
        display: block;
        transition: 0.3s;
        margin: 10px 0;
      }

      .link-border {
        padding: 0.5rem;
        border: 5px solid yellow;
      }

      .sidenav-container a:hover {
        color: #f1f1f1;
      }

      .sidenav-container .closebtn {
        font-size: 3rem;
        font-weight: 700;
        color: #c9002b;
        padding-right: 1rem;
      }

      .sidenav-container .drawer-close-button {
        height: 3rem;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 3rem;
      }

      @media only screen and (display-mode: standalone) and (min-device-width: 375px) and (max-device-width: 812px) and (orientation: portrait) {
        nav {
          background: #389466;
          position: fixed;
          width: 100%;
          height: 40px;
          top: 0;
          z-index: 1;
        }
      }

      @media only screen and (display-mode: standalone) and (min-device-width: 375px) and (max-device-width: 667px) and (orientation: portrait) {
        nav {
          background: #389466;
          position: fixed;
          width: 100%;
          height: 40px;
          top: 0;
          z-index: 1;
        }
      }
    `,
  ];

  private openNav() {
    this._sideNav.style.width = '50%'; // opens side navbar by 70 percent
    this._backDrop.style.display = 'block'; // displays overlay
  }

  private closeNav() {
    this._sideNav.style.width = '0';
    this._backDrop.style.display = 'none';
  }

  disconnectedCallback() {
    console.log(`${this.tagName} destroyed!`);
  }

  private async signMeOut() {
    await signOut(getAuth());
    console.log(`${this.title} - signMeOut`);
    this.closeNav();
    setTimeout(() => Router.go('/home'), 25);
  }

  render() {
    return html`
      <div id="mySidenav" class="sidenav-container">
        <span class="drawer-close-button">
          <a
            href="javascript:void(0)"
            class="closebtn"
            @click="${this.closeNav}"
            >&times;</a
          >
        </span>

        <a class="link-border" href="/home" @click="${this.closeNav}">Home</a>
        <a class="link-border" href="/golf-day" @click="${this.closeNav}"
          >Golf Days</a
        >
        <button @click="${this.signMeOut}">Sign out</button>
      </div>
      <div class="backdrop-container" id="backdrop"></div>
      <nav>
        <span @click="${this.openNav}" class="mobile-nav-open-icon"
          >&#9776;</span
        >
        Woodchoppers &nbsp;&nbsp;&nbsp;
      </nav>
    `;
  }
}
