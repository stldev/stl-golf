import { ReplaySubject } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

class StoreService {
  private pristine = {
    course: true,
    roster: true,
    schedule: true,
  };

  public course$ = new ReplaySubject<any>(1);

  public teamRoster$ = new ReplaySubject<any>(1);

  public schedule$ = new ReplaySubject<any>(1);

  public currentTeam$ = new ReplaySubject<string>(1);

  public visibilityState$ = new ReplaySubject<any[]>(1);

  public day$ = new ReplaySubject<string>(1);

  public errors$ = new ReplaySubject<string>(1);

  public myTeamToday$ = new ReplaySubject<any>(1);

  public allDaysForTeam$ = new ReplaySubject<any>(1);

  public otherTeamToday$ = new ReplaySubject<any>(1);

  public allTeamsToday$ = new ReplaySubject<any>(1);

  public bannerMessage$ = new ReplaySubject<any>(1);

  init() {
    const team = localStorage.getItem('woodchopper-team') || '';
    this.authHandler(team);
    setTimeout(() => {
      this.getConnectionState();
    }, 2500);
  }

  setPristine() {
    this.pristine.course = true;
    this.pristine.roster = true;
    this.pristine.schedule = true;
  }

  setPristineSchedule() {
    this.pristine.schedule = true;
  }

  public async checkSvcWorkerOnServer() {
    const ONE_MINUTE_MILLI = 60000;
    const TIME_TO_WAIT = ONE_MINUTE_MILLI * 2;
    const lastUpdateTimeString =
      localStorage.getItem('woodchopper-last-update') || '0';
    const lastUpdateTime = Number(lastUpdateTimeString);

    if (lastUpdateTime + TIME_TO_WAIT < Date.now()) {
      console.log('we can update');
      const swReg = await navigator.serviceWorker.getRegistration();
      if (swReg) {
        if (swReg.waiting) {
          console.log('swReg.waiting=TRUE', swReg);
          this.bannerMessage$.next({
            type: 'app-update',
            text: 'New update available!',
            link: '/settings',
          });
        } else {
          console.log('swReg.update()');
          swReg.update();
        }
      }
    }
  }

  getConnectionState() {
    const connectedRef = ref(getDatabase(), '.info/connected');
    onValue(connectedRef, snap => {
      if (snap.val() === true) {
        this.bannerMessage$.next({});
      } else {
        this.bannerMessage$.next({
          type: 'db-conn',
          text: 'Trouble connecting to server.',
          bgColor: 'red',
        });
      }
    });
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

  getCourse() {
    if (this.pristine.course) {
      const courseDb = ref(getDatabase(), `/course`);
      onValue(courseDb, snapshot => {
        this.course$.next(snapshot.val() || {});
      });

      this.pristine.course = false;
    }
  }

  getRoster(team: string) {
    if (this.pristine.roster && team) {
      console.log('DATA-getRoster');
      const scheduleDb = ref(getDatabase(), `/${team}/roster`);
      onValue(scheduleDb, snapshot => {
        console.log('this.teamRoster$.next-VAL', snapshot.val());
        this.teamRoster$.next(snapshot.val() || {});
      });

      this.pristine.roster = false;
    }
  }

  getSchedule(team: string, year?: string) {
    if (this.pristine.schedule && team) {
      const thisYear = year || new Date().getFullYear();

      const scheduleDb = ref(getDatabase(), `/schedules/${thisYear}`);
      onValue(scheduleDb, snapshot => {
        this.schedule$.next(snapshot.val() || {});
      });

      this.pristine.schedule = false;
    }
  }

  getMyTeamToday(team: string, day: string) {
    this.myTeamToday$.next({});
    const myTeamTodayDb = ref(getDatabase(), `/${team}/${day}`);
    onValue(myTeamTodayDb, snapshot => {
      this.myTeamToday$.next(snapshot.val() || {});
    });
  }

  getAllDaysForTeam(team: string) {
    this.allDaysForTeam$.next({});
    const allDaysForTeamDb = ref(getDatabase(), `/${team}`);
    onValue(allDaysForTeamDb, snapshot => {
      this.allDaysForTeam$.next(snapshot.val() || {});
    });
  }

  getOtherTeamToday(team: string, day: string) {
    this.otherTeamToday$.next({});
    const otherTeamTodayDb = ref(getDatabase(), `/${team}/${day}`);
    onValue(otherTeamTodayDb, snapshot => {
      this.otherTeamToday$.next(snapshot.val() || {});
    });
  }

  getAllTeamsToday(day: string) {
    const allTeamScores = {};
    const allRefs = Array(8)
      .fill(0)
      .map((_, i) => {
        const team = `team${i + 1}`;
        const dbRef = ref(getDatabase(), `/team${i + 1}/${day}`);
        return { dbRef, team };
      });

    allRefs.forEach(e => {
      onValue(e.dbRef, snapshot => {
        if (Object.keys(allTeamScores).length === 7) {
          allTeamScores[e.team] = snapshot.val();
          this.allTeamsToday$.next(allTeamScores);
        }

        allTeamScores[e.team] = snapshot.val();
      });
    });
  }
}

export const storeSvc = new StoreService();
