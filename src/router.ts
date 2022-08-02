import { ActionResult, Route, Router } from '@vaadin/router';
import './app';
import { authGuard } from './services/auth-guard';

const routes: Route[] = [
  {
    path: '/',
    component: 'rbb-app',
    children: [
      {
        path: 'home',
        component: 'rbb-cleaning',
        action: async () => {
          await import('./components/RbbCleaning');
        },
      },
      {
        path: 'golf-day-home',
        component: 'rbb-golf-day-home',
        action: async () => authGuard as unknown as ActionResult,
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
