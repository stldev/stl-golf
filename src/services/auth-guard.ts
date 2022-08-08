export async function authGuard(context: any, commands: any) {
  const curUser = localStorage.getItem('woodchopper-team');
  console.log('authGuard-curUser', curUser);
  if (curUser) return undefined;

  console.log('User not authorized', context.pathname);
  return commands.redirect('/home');
}
