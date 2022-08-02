import { LitElement, html, css } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-cleaning')
export class RbbCleaning extends LitElement {
  @property({ type: String }) title = 'Woodchoppers';

  @property({ type: Boolean }) hasAuth = false;

  @property({ type: Boolean }) authLoading = false;

  @property({ type: String }) userEmail = '';

  @query('#loginForm') loginFormEle: HTMLDivElement;

  @query('#itemsSection') itemsSection: HTMLElement;

  @query('#itemsSection ol') itemsSectionOL: HTMLOListElement;

  @query('#team-select') emailEle: HTMLInputElement;

  @query('#errorMessage') errorMessage: HTMLParagraphElement;

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
      max-width: 370px;
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
    const { currentUser } = getAuth();
    console.log('currentUser1');
    console.log(currentUser);

    this.authLoading = true;
    getAuth().onAuthStateChanged(user => {
      console.log('onAuthStateChanged-user', user);
      this.authLoading = false;
      if (user?.email) {
        this.userEmail = user.email;
        this.hasAuth = true;
      } else {
        this.hasAuth = false;
      }
    });

    // const today = new Date().toISOString().split('T')[0];
    // const today = '2022-07-27'; // TESTING

    // const rbbCleaningDataRef = ref(getDatabase(), `/${today}`);
    const rbbCleaningDataRef = ref(getDatabase(), `/team7`);
    onValue(rbbCleaningDataRef, snapshot => {
      // console.log('database-value-snapshot-----', snapshot);
      console.log(snapshot.val());
    });
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
      console.log('user', user);
      this.emailEle.value = '';
      this.loginFormEle.style.display = 'none';
      this.hasAuth = true;

      const rbbCleaningDataRef = ref(getDatabase(), '/data');
      onValue(rbbCleaningDataRef, snapshot => {
        console.log('database-value-snapshot-----222', snapshot);
        console.log(snapshot.val());
      });
    } else {
      this.hasAuth = false;
    }
  }

  private addTheItem() {
    this.itemsSectionOL.insertAdjacentHTML('beforeend', '<li>item</li>');
    const db = getDatabase();
    set(ref(db, '/team7/2022-07-27/h3'), '1-2');
  }

  private async signMeOut() {
    await signOut(getAuth());
    console.log(`${this.title} - signMeOut`);
  }

  private authDisplay() {
    if (this.hasAuth) {
      const teamName = this.userEmail
        .replace('woodchoppers.golf+', '')
        .replace('@gmail.com', '')
        .toUpperCase();
      return html`${teamName} &nbsp;&nbsp;&nbsp;
        <button type="button" @click="${this.signMeOut}">signOut</button>`;
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
              <option value="7">Team 7</option>
              <option value="6">Team 6</option>
            </select>
            <button type="button" @click="${this.doUserLogin}">
              doUserLogin
            </button>
          </div>
        </section>
        <section id="itemsSection" style="display: none">
          <button type="button" @click="${this.addTheItem}">Add Item</button>
          <ol></ol>
        </section>
      </main>
    `;
  }
}
