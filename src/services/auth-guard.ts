import { getAuth } from 'firebase/auth';

// TODO: current user must be kept in global store/state
export async function authGuard(context: any, commands: any) {
  // const isAuthenticated = await new AuthorizationService().isAuthorized();
  const auth = await getAuth();
  console.log('auth');
  console.log(auth);
  console.log(auth?.currentUser?.email);

  if (auth?.currentUser?.email) return undefined;

  console.log('User not authorized', context.pathname);
  return commands.redirect('/');
}
