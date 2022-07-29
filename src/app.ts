import { Router } from '@vaadin/router';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('rbb-app')
export class RbbApp extends LitElement {
  firstUpdated() {
    if (globalThis.location.pathname === '/')
      setTimeout(() => Router.go('/home'), 25);
  }

  render() {
    return html` <slot></slot> `;
  }
}
