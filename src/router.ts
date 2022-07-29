import { Route, Router } from '@vaadin/router';
import './app';

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
