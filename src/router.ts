import { Route, Router } from '@vaadin/router';
import { authGuard } from './services/auth-guard';
import './app';
import './components/AppHeader';
import './components/GolfScoreSelect';
import './components/GolfScoreView';

// https://vaadin.github.io/router/vaadin-router/demo/#vaadin-router-getting-started-demos
const routes: Route[] = [
  {
    path: '/',
    component: 'rbb-app',
    children: [
      {
        path: '__',
        component: 'rbb-app',
        children: [
          {
            path: '/auth',
            // redirect: '',
            component: 'rbb-app',
            children: [
              {
                path: '/action',
                // redirect: '',
                component: 'rbb-app',
              },
            ],
          },
        ],
      },
      {
        path: 'home',
        component: 'rbb-home',
        action: async () => {
          await import('./views/Home');
        },
      },
      {
        path: 'settings',
        action: authGuard,
        children: [
          {
            path: '/',
            component: 'rbb-settings',
            action: async () => {
              await import('./views/Settings');
            },
          },
        ],
      },
      {
        path: 'golf-day',
        action: authGuard,
        children: [
          {
            path: '/',
            component: 'rbb-golf-day-home',
            action: async () => {
              await import('./views/GolfDayHome');
            },
          },
          {
            path: '/:day/game-day',
            component: 'rbb-game-day',
            action: async () => {
              await import('./views/GameDay');
            },
          },
          {
            path: '/:day',
            component: 'rbb-golf-day',
            action: async () => {
              await import('./views/GolfDay');
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
      await import('./views/NotFound');
    },
  },
];

const outlet = document.getElementById('outlet');
export const router = new Router(outlet);
router.setRoutes(routes);
