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
          await import('./components/Home');
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
              await import('./components/GolfDayHome').catch(err =>
                console.log('routerERROR:', err)
              );
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
