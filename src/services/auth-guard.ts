import { storeSvc } from '../store/data';

export async function authGuard(context: any, commands: any) {
  const team = localStorage.getItem('woodchopper-team');
  console.log('authGuard-team', team);
  if (team) {
    storeSvc.getCourse();
    storeSvc.getSchedule(team);
    return undefined;
  }

  console.log('User not authorized', context.pathname);
  return commands.redirect('/home');
}
