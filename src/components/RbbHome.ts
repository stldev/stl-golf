import { LitElement, html, css } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/camera';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-home')
export class RbbHome extends LitElement {
  @property({ type: String }) title = 'Woodchoppers';

  @property({ type: Boolean }) hasAuth = false;

  @property({ type: Boolean }) authLoading = false;

  @property({ type: String }) userEmail = '';

  @query('#loginForm') loginFormEle: HTMLDivElement;

  @query('#itemsSection') itemsSection: HTMLElement;

  @query('#team-select') emailEle: HTMLInputElement;

  @query('#errorMessage') errorMessage: HTMLParagraphElement;

  @property({ type: Object }) allSubs = new Subscription();

  private currentUserEmail$ = storeSvc.currentUserEmail$;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--rbb-cleaning-background-color);
    }

    main {
      flex-grow: 1;
    }

    #message,
    #itemsSection {
      background: white;
      max-width: 470px;
      margin: 25px auto 8px;
      padding: 16px 12px;
      border-radius: 3px;
    }
    #message h2 {
      color: #ffa100;
      font-weight: bold;
      font-size: 16px;
      margin: 0 0 8px;
    }
    #message p {
      line-height: 140%;
      margin: 16px 0 24px;
      font-size: 14px;
    }
    #itemsSection,
    #message {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
  `;

  firstUpdated() {
    this.authLoading = true;
    const sub1 = this.currentUserEmail$.subscribe(currentUserEmail => {
      this.authLoading = false;
      if (currentUserEmail) {
        this.userEmail = currentUserEmail;
        this.hasAuth = true;
      } else {
        this.hasAuth = false;
      }
    });

    this.allSubs.add(sub1);
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    console.log(`${this.tagName} destroyed!`);
  }

  private handleAuthLoginDisplay() {
    if (this.hasAuth) {
      this.loginFormEle.style.display = 'none';
      this.itemsSection.style.display = 'block';
    } else {
      this.loginFormEle.style.display = 'block';
      this.itemsSection.style.display = 'none';
    }
  }

  protected updated(
    _changedProps: Map<string | number | symbol, unknown>
  ): void {
    if (_changedProps.has('hasAuth')) this.handleAuthLoginDisplay();
  }

  private async doUserLogin() {
    this.errorMessage.innerHTML = '';
    this.errorMessage.style.display = 'none';
    const signInResult: UserCredential = await signInWithEmailAndPassword(
      getAuth(),
      `woodchoppers.golf+team${this.emailEle.value}@gmail.com`,
      `${process.env.PASSWORD_BASE}${this.emailEle.value}`
    ).catch(err => {
      this.errorMessage.innerHTML = err.message || 'sign in error.';
      this.errorMessage.style.display = 'block';
      this.hasAuth = false;
      return null;
    });

    if (signInResult?.user) {
      const { user } = signInResult;
      console.log('signInResult-user', user);
      this.emailEle.value = '';
      this.loginFormEle.style.display = 'none';
      this.hasAuth = true;
    } else {
      this.hasAuth = false;
    }
  }

  private authDisplay() {
    if (this.hasAuth) {
      const teamName = this.userEmail
        .replace('woodchoppers.golf+', '')
        .replace('@gmail.com', '')
        .toUpperCase();
      return html`${teamName}`;
    }
    if (this.authLoading) return html`loading...`;

    return html`Welcome!`;
  }

  render() {
    return html`
      <main>
        <h1>${this.title}</h1>
        <section id="message">
          <h2>${this.authDisplay()}</h2>
          <div id="loginForm" style="display: none">
            <p id="errorMessage" style="color:red; display: none;">Error</p>
            <select name="teams" id="team-select">
              <option value="">--Select your team--</option>
              <option value="4">Team 4</option>
              <option value="5">Team 5</option>
              <option value="6">Team 6</option>
              <option value="7">Team 7</option>
            </select>
            <button type="button" @click="${this.doUserLogin}">
              doUserLogin
            </button>
          </div>
        </section>
        <section id="itemsSection" style="display: none">
          <h3><a href="/golf-day">Check out all days</a></h3>
        </section>
      </main>
    `;
  }
}
