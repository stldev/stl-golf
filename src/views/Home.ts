import { LitElement, html, css } from 'lit';
import { state, customElement, query } from 'lit/decorators.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { Subscription } from 'rxjs';
import { storeSvc } from '../store/data';
import { mvpCss } from '../styles-3rdParty';

// const logo = new URL('../../assets/open-wc-logo.svg', import.meta.url).href;

@customElement('rbb-home')
export class Home extends LitElement {
  @state() hasAuth = false;

  @state() authLoading = false;

  @state() curTeamName = '';

  @state() allSubs = new Subscription();

  @query('#loginForm') loginFormEle: HTMLDivElement;

  @query('#itemsSection') itemsSection: HTMLElement;

  @query('#MyTeam') myTeamSectionEle: HTMLElement;

  @query('select') selectEle: HTMLSelectElement;

  @query('input') pinEle: HTMLInputElement;

  @query('#errorMessage') errorMessage: HTMLParagraphElement;

  static styles = [
    mvpCss,
    css`
      section {
        text-align: center;
      }
      select {
        border: 5px solid black;
      }
      select,
      input {
        margin: auto;
        padding: 1rem;
        font-size: x-large;
      }
      header {
        padding-bottom: 0;
      }
      header h2 {
        color: green;
      }
      #itemsSection,
      #MyTeam {
        background: white;
        max-width: 470px;
        margin: 25px auto 8px;
        padding: 16px 12px;
        border-radius: 3px;
      }
      #itemsSection,
      #MyTeam {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      }
    `,
  ];

  constructor() {
    super();
    this.authLoading = true;
    const sub1 = storeSvc.currentTeam$.subscribe(curTeam => {
      this.authLoading = false;
      if (curTeam) {
        this.curTeamName = curTeam;
        this.hasAuth = true;
      } else {
        this.hasAuth = false;
      }
    });

    this.allSubs.add(sub1);
  }

  protected firstUpdated() {
    this.pinEle.disabled = true;
    this.pinEle.style.border = 'none';
  }

  disconnectedCallback() {
    this.allSubs.unsubscribe();
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  private handleAuthLoginDisplay() {
    if (this.hasAuth) {
      this.loginFormEle.style.display = 'none';
      this.itemsSection.style.display = 'block';
      this.myTeamSectionEle.style.display = 'block';
    } else {
      this.loginFormEle.style.display = 'block';
      this.itemsSection.style.display = 'none';
      this.myTeamSectionEle.style.display = 'none';
    }
  }

  protected updated(_changedProps: Map<string | number | symbol, unknown>) {
    if (_changedProps.has('hasAuth')) this.handleAuthLoginDisplay();
  }

  private async doUserLogin(pin: string) {
    this.errorMessage.innerHTML = '';
    this.errorMessage.style.display = 'none';
    const signInResult: UserCredential = await signInWithEmailAndPassword(
      getAuth(),
      `woodchoppers.golf+team${this.selectEle.value}@gmail.com`,
      `${process.env.PASSWORD_BASE}${this.selectEle.value}-${pin}`
    ).catch(err => {
      this.errorMessage.innerHTML = err.message || 'sign in error.';
      return null;
    });

    if (signInResult?.user) {
      this.authLoading = false;
      storeSvc.getSchedule(this.curTeamName);
      // const { user } = signInResult;
      // console.log('signInResult-user', user);
      this.selectEle.value = '';
      this.loginFormEle.style.display = 'none';
      this.hasAuth = true;
      this.pinEle.disabled = false;
      this.pinEle.style.border = '5px solid black';
    } else {
      setTimeout(() => {
        this.errorMessage.style.display = 'block';
        this.hasAuth = false;
        this.authLoading = false;
        this.pinEle.disabled = false;
        this.pinEle.style.border = '5px solid black';
      }, 2500);
    }
  }

  private authDisplay() {
    if (this.hasAuth) return html`${this.curTeamName}`;
    if (this.authLoading) return html`loading...`;
    return html`Welcome!`;
  }

  private onChange(e: any) {
    const inputVal = (e.target.value as string) || '';

    if (inputVal.length === 4) {
      const isValid = /[0-9]{4}/.test(inputVal);
      if (isValid) {
        e.target.value = '';
        this.pinEle.disabled = true;
        this.pinEle.style.border = 'none';
        this.authLoading = true;
        this.doUserLogin(inputVal);
      }
    }
  }

  private onSelectChange(evt: any) {
    if (evt.target.value) {
      this.pinEle.disabled = false;
      this.pinEle.style.border = '5px solid black';
    } else {
      this.pinEle.disabled = true;
      this.pinEle.style.border = 'none';
    }
  }

  render() {
    return html`
      <main>
        <header>
          <h1>Woodchopper Golf</h1>
          <h2>${this.authDisplay()}</h2>
          <h3 id="errorMessage" style="color:red; display: none;">Error</h3>
        </header>
        <section id="loginForm" style="display: none">
          <select @change="${e => this.onSelectChange(e)}">
            <option value="">--Select your team--</option>
            <option value="1">Team 1</option>
            <option value="2">Team 2</option>
            <option value="3">Team 3</option>
            <option value="4">Team 4</option>
            <option value="5">Team 5</option>
            <option value="6">Team 6</option>
            <option value="7">Team 7</option>
            <option value="8">Team 8</option>
          </select>
          <br />
          <p>4 digit team pin:</p>

          <input
            @keyup=${e => this.onChange(e)}
            type="tel"
            pattern="[0-9]{4}"
            size="5"
            maxlength="4"
            minlength="4"
            required
          />
        </section>
        <section id="itemsSection" style="display: none">
          <h3><a href="/golf-day">View Schedule</a></h3>
        </section>
        <section id="MyTeam" style="display: none">
          <h3><a href="/my-team">View My Team</a></h3>
        </section>
      </main>
    `;
  }
}
