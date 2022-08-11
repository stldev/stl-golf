import { ReplaySubject } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

class StoreService {
  private team = '';

  private schedulePristine = true;

  public currentTeam$ = new ReplaySubject<string>(1);

  public day$ = new ReplaySubject<string>(1);

  public schedule$ = new ReplaySubject<any>(1);

  public myTeamToday$ = new ReplaySubject<any>(1);

  public otherTeamToday$ = new ReplaySubject<any>(1);

  constructor() {
    this.team = localStorage.getItem('woodchopper-team') || '';
  }

  init() {
    this.authHandler(this.team);
    if (this.team) this.getSchedule(this.team);
  }

  authHandler(team: string) {
    if (team) {
      this.currentTeam$.next(team);
    } else {
      this.currentTeam$.next('');
    }

    getAuth().onAuthStateChanged(user => {
      if (user?.email) {
        const teamName = user.email
          .replace('woodchoppers.golf+', '')
          .replace('@gmail.com', '')
          .toLowerCase();
        this.currentTeam$.next(teamName);
        localStorage.setItem('woodchopper-team', teamName);
      } else {
        this.currentTeam$.next('');
        localStorage.removeItem('woodchopper-team');
      }
    });
  }

  getSchedule(team: string) {
    if (this.schedulePristine && team) {
      const thisYear = new Date().getFullYear();

      const scheduleDb = ref(getDatabase(), `/${thisYear}-schedule`);
      onValue(scheduleDb, snapshot => {
        this.schedule$.next(snapshot.val() || {});
      });

      this.schedulePristine = false;
    }
  }

  getMyTeamToday(team: string, day: string) {
    this.myTeamToday$.next({});
    const myTeamTodayDb = ref(getDatabase(), `/${team}/${day}`);
    onValue(myTeamTodayDb, snapshot => {
      this.myTeamToday$.next(snapshot.val() || {});
    });
  }

  getOtherTeamToday(team: string, day: string) {
    this.otherTeamToday$.next({});
    const otherTeamTodayDb = ref(getDatabase(), `/${team}/${day}`);
    onValue(otherTeamTodayDb, snapshot => {
      this.otherTeamToday$.next(snapshot.val() || {});
    });
  }
}

export const storeSvc = new StoreService();
