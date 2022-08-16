import { ReplaySubject } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';

class StoreService {
  private team = '';

  private schedulePristine = true;

  private coursePristine = true;

  private rosterPristine = true;

  public currentTeam$ = new ReplaySubject<string>(1);

  public day$ = new ReplaySubject<string>(1);

  public errors$ = new ReplaySubject<string>(1);

  public schedule$ = new ReplaySubject<any>(1);

  public course$ = new ReplaySubject<any>(1);

  public teamRoster$ = new ReplaySubject<any>(1);

  public myTeamToday$ = new ReplaySubject<any>(1);

  public otherTeamToday$ = new ReplaySubject<any>(1);

  public allTeamsToday$ = new ReplaySubject<any>(1);

  public newUpdateReady$ = new ReplaySubject<boolean>(1);

  constructor() {
    this.team = localStorage.getItem('woodchopper-team') || '';
  }

  init() {
    this.authHandler(this.team);
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
    if (this.coursePristine) {
      const courseDb = ref(getDatabase(), `/course`);
      onValue(courseDb, snapshot => {
        this.course$.next(snapshot.val() || {});
      });

      this.coursePristine = false;
    }
  }

  getRoster(team: string) {
    if (this.rosterPristine && team) {
      const scheduleDb = ref(getDatabase(), `/${team}/roster`);
      onValue(scheduleDb, snapshot => {
        this.teamRoster$.next(snapshot.val() || {});
      });

      this.rosterPristine = false;
    }
  }

  getSchedule(team: string) {
    if (this.schedulePristine && team) {
      const thisYear = new Date().getFullYear();

      const scheduleDb = ref(getDatabase(), `/schedules/${thisYear}`);
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
