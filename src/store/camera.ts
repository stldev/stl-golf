import { ReplaySubject } from 'rxjs';
import { getAuth } from 'firebase/auth';

class StoreService {
  public currentUserEmail$ = new ReplaySubject<string>(1);

  init() {
    const email = localStorage.getItem('woodchopper-email');

    if (email) {
      this.currentUserEmail$.next(email);
    } else {
      this.currentUserEmail$.next('');
    }

    getAuth().onAuthStateChanged(user => {
      if (user?.email) {
        this.currentUserEmail$.next(user.email);
        localStorage.setItem('woodchopper-email', user.email);
      } else {
        this.currentUserEmail$.next('');
        localStorage.removeItem('woodchopper-email');
      }
    });
  }
}

export const storeSvc = new StoreService();
