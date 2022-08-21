import { Router } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('rbb-app')
export class RbbApp extends LitElement {
  constructor() {
    super();
    this.created();
  }

  created() {
    console.log('RBB_APP-CREATED!!!');
  }

  firstUpdated() {
    if (globalThis.location.pathname === '/')
      setTimeout(() => Router.go('/home'), 25);
  }

  render() {
    return html`
      <rbb-app-header></rbb-app-header>
      <rbb-app-banner></rbb-app-banner>
      <slot></slot>
    `;
  }
}
