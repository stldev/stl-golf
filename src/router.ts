import { Route, Router } from '@vaadin/router';
import './app';
import { authGuard } from './services/auth-guard';

// https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos
const routes: Route[] = [
  {
    path: '/',
    component: 'rbb-app',
    children: [
      {
        path: 'home',
        component: 'rbb-home',
        action: async () => {
          await import('./components/RbbHome');
        },
      },
      {
        path: 'golf-day',
        action: authGuard,
        children: [
          {
            path: '/',
            component: 'rbb-golf-day-home',
            action: async () => {
              await import('./components/GolfDayHome');
            },
          },
          {
            path: '/:day',
            component: 'rbb-golf-day',
            action: async () => {
              await import('./components/GolfDay');
            },
          },
        ],
      },
    ],
  },
  {
    path: '(.*)',
    component: 'not-found',
    action: async () => {
      await import('./components/NotFound');
    },
  },
];

const outlet = document.getElementById('outlet');
export const router = new Router(outlet);
router.setRoutes(routes);