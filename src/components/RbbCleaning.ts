import { LitElement, html, css } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-cleaning')
export class RbbCleaning extends LitElement {
  @property({ type: String }) title = 'RBB-Cleaning';

  @property({ type: Boolean }) hasAuth = false;

  @property({ type: String }) userEmail = '';

  @query('#loginForm') loginFormEle: HTMLDivElement;

  @query('#itemsSection') itemsSection: HTMLElement;

  @query('#itemsSection ol') itemsSectionOL: HTMLOListElement;

  @query('#userEmail') emailEle: HTMLInputElement;

  @query('#userPass') passwordEle: HTMLInputElement;

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
    getAuth().onAuthStateChanged(user => {
      console.log('onAuthStateChanged-user', user);

      if (user?.email) {
        this.userEmail = user.email;
        this.hasAuth = true;
      } else {
        this.hasAuth = false;
      }
    });

    const rbbCleaningDataRef = ref(getDatabase(), '/data');
    onValue(rbbCleaningDataRef, snapshot => {
      console.log('database-value-snapshot-----', snapshot);
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
      this.emailEle.value,
      this.passwordEle.value
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
      this.passwordEle.value = '';
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
  }

  private async signMeOut() {
    await signOut(getAuth());
    console.log(`${this.title} - signMeOut`);
  }

  private authDisplay() {
    if (this.hasAuth) {
      return html`${this.userEmail}
        <button type="button" @click="${this.signMeOut}">signOut</button>`;
    }
    return html`anonymous`;
  }

  render() {
    return html`
      <main>
        <h1>${this.title}</h1>
        <section id="message">
          <h2>${this.authDisplay()}</h2>
          <div id="loginForm" style="display: none">
            <p id="errorMessage" style="color:red; display: none;">Error</p>
            email: <input id="userEmail" type="email" /> <br />
            pass: <input id="userPass" type="password" /> <br />
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
