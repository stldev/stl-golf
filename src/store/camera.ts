import { ReplaySubject } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

class StoreService {
  private team = '';

  private pairingPristine = true;

  public currentTeam$ = new ReplaySubject<string>(1);

  public pairings$ = new ReplaySubject<any[]>(1);

  constructor() {
    this.team = localStorage.getItem('woodchopper-team') || '';
  }

  init() {
    this.authHandler(this.team);
    if (this.team) this.getData(this.team);
  }

  authHandler(team: string) {
    if (team) {
      this.currentTeam$.next(team);
    } else {
      this.currentTeam$.next('');
    }

    getAuth().onAuthStateChanged(user => {
      if (user?.email) {
        this.currentTeam$.next(user.email);
        const teamName = user.email
          .replace('woodchoppers.golf+', '')
          .replace('@gmail.com', '');
        localStorage.setItem('woodchopper-team', teamName);
      } else {
        this.currentTeam$.next('');
        localStorage.removeItem('woodchopper-team');
      }
    });
  }

  getData(team: string) {
    if (this.pairingPristine && team) {
      const thisYear = new Date().getFullYear();
      const pairingsTemp = [];

      const schedule = ref(getDatabase(), `/${thisYear}-schedule`);
      onValue(schedule, snapshot => {
        const allData = snapshot.val() || {};

        Object.entries(allData).forEach(([day, pair]) => {
          let pairing = `${day} => ${team} vs `;
          Object.entries(pair).forEach(([teamA, teamB]) => {
            if (teamA === team) pairing += teamB;
            if (teamB === team) pairing += teamA;
          });

          pairingsTemp.push(pairing);
        });

        if (pairingsTemp.length) {
          this.pairings$.next(pairingsTemp);
        } else {
          this.pairings$.next([]);
        }
      });

      this.pairingPristine = false;
    }
  }
}

export const storeSvc = new StoreService();
