var Match = {
  players: 10,
  balls: 6,
  time: 60,
  runs: [0, 1, 2, 4, 6],
  startTeam: 1,
  mom: { name: "player1", score: 0, team: "Team 1" },
};

let url = new URL(window.location.href);
Match.players = parseInt(url.searchParams.get("players"))
  ? parseInt(url.searchParams.get("players"))
  : Match.players;
Match.time = parseInt(url.searchParams.get("time"))
  ? parseInt(url.searchParams.get("time"))
  : Match.time;
Match.startTeam = parseInt(url.searchParams.get("team"))
  ? parseInt(url.searchParams.get("team"))
  : Match.startTeam;

class ScoreTable {
  name: string;
  Id: string;
  players: number = Match.players;
  balls: number = Match.balls;
  tableHtml: HTMLTableElement;
  cellPosition: number[] = [1, 1];
  playerObjs: Player[] = [];
  isbattingOver: boolean = false;
  scoreBoardId: string;

  constructor(name: string, Id: string, scoreBoardId: string) {
    this.name = name;
    this.Id = Id;
    this.scoreBoardId = scoreBoardId;
    this.tableHtml = <HTMLTableElement>document.createElement("table");
    this.tableHtml.className = "table table-dark table-hover table-bordered ";
    this.tableHtml.appendChild(this.createHead());
    this.tableHtml.appendChild(this.createBody());
    document.getElementById(this.Id).appendChild(this.tableHtml);
  }
  createHead(): HTMLTableSectionElement {
    let head = <HTMLTableSectionElement>document.createElement("thead");
    let headRow = document.createElement("tr");
    let headCell = <HTMLTableHeaderCellElement>document.createElement("th");
    headCell.innerHTML = this.name;
    headRow.appendChild(headCell);
    for (let ballNo = 1; ballNo <= this.balls; ballNo++) {
      headCell = document.createElement("th");
      headCell.scope = "col";
      headCell.innerHTML = `B${ballNo}`;
      headRow.appendChild(headCell);
    }
    headCell = document.createElement("th");
    headCell.innerHTML = "TOTAL";
    headRow.appendChild(headCell);
    head.appendChild(headRow);
    return head;
  }
  createBody(): HTMLTableSectionElement {
    let body = <HTMLTableSectionElement>document.createElement("tbody");
    let bodyRow;
    let headCell: HTMLTableHeaderCellElement;
    for (let playerNo = 1; playerNo <= this.players; playerNo++) {
      this.playerObjs.push(new Player());
      bodyRow = document.createElement("tr");
      headCell = document.createElement("th");
      headCell.scope = "row";
      headCell.innerHTML = `Player ${playerNo}`;
      bodyRow.appendChild(headCell);
      let dataCell: HTMLTableDataCellElement;
      for (let ballNo = 1; ballNo <= this.balls; ballNo++) {
        dataCell = document.createElement("td");
        dataCell.id = `${this.name}P${playerNo}B${ballNo}`;
        bodyRow.appendChild(dataCell);
      }
      dataCell = document.createElement("td");
      dataCell.id = `${this.name}P${playerNo}Total`;
      bodyRow.appendChild(dataCell);
      body.appendChild(bodyRow);
    }

    return body;
  }
  hit(runs = "1"): void {
    if (this.isbattingOver) return;
    let cellid = `${this.name}P${this.cellPosition[0]}B${this.cellPosition[1]}`;
    // console.log(cellid);
    document.getElementById(cellid).innerHTML = runs != "0" ? runs : "out";
    const updateScores = () => {
      let currentPlayer = this.playerObjs[this.cellPosition[0] - 1];

      currentPlayer.runs.push(parseInt(runs));
      if (Match.mom.score < currentPlayer.getTotal()) {
        //selecting mom
        Match.mom.name = `Player${this.cellPosition[0]}`;
        Match.mom.score = currentPlayer.getTotal();
        Match.mom.team = this.name;
      }
      cellid = `${this.name}P${this.cellPosition[0]}Total`;
      document.getElementById(
        cellid
      ).innerHTML = currentPlayer.getTotal().toString();
      document.getElementById(
        this.scoreBoardId
      ).innerHTML = this.getTotal().toString();
    };
    updateScores();

    const nextCell = () => {
      this.cellPosition[1]++;
      if (runs == "0" || this.cellPosition[1] > Match.balls) {
        this.cellPosition[0]++;
        this.cellPosition[1] = 1;
      }
      if (this.cellPosition[0] > Match.players) {
        this.isbattingOver = true;
      }
    };
    nextCell();
  }
  getTotal(): number {
    return this.playerObjs.reduce((t, p) => t + p.getTotal(), 0);
  }
}

class Player {
  runs: number[] = [];
  constructor() {}
  getTotal(): number {
    return this.runs.reduce((t, r) => r + t, 0);
  }
}

class Game {
  playedTeams: number = 0;
  randomRun: number = 1;
  team: number;
  timeGen: number;
  randomRunsGen: number;
  team1: ScoreTable;
  team2: ScoreTable;
  constructor(team1: ScoreTable, team2: ScoreTable) {
    this.team = Match.startTeam;
    this.team1 = team1;
    this.team2 = team2;
    this.playTeam();
  }
  playTeam(): void {
    let getResultsBtn = <HTMLButtonElement>(
      document.getElementById("matchresultbtn")
    );
    let team1Btn = <HTMLButtonElement>document.getElementById("team1hitbtn");
    let team2Btn = <HTMLButtonElement>document.getElementById("team2hitbtn");
    if (this.playedTeams == 2) {
      document.getElementById("roundStatus").innerText = "Match Ended";
      document.getElementById("roundStatus").className = "h3 bg-danger";
      clearInterval(this.timeGen);
      clearInterval(this.randomRunsGen);
      getResultsBtn.disabled = false;
      team1Btn.disabled = true;
      team2Btn.disabled = true;
      return;
    } else {
      if (this.playedTeams == 1) this.team = this.team == 1 ? 2 : 1;
      this.playedTeams++;
      clearInterval(this.timeGen);
      clearInterval(this.randomRunsGen);
      this.startRandomRuns();
      this.startTimer();
    }

    if (this.team == 1) {
      document.getElementById("roundStatus").innerText = "Team 1 on strike";
      document.getElementById("roundStatus").className = "h3 bg-primary";
      getResultsBtn.disabled = true;
      team1Btn.disabled = false;
      team2Btn.disabled = true;
    }
    if (this.team == 2) {
      document.getElementById("roundStatus").innerText = "Team 2 on strike";
      document.getElementById("roundStatus").className = "h3 bg-info";
      getResultsBtn.disabled = true;
      team1Btn.disabled = true;
      team2Btn.disabled = false;
    }
  }
  startRandomRuns(): void {
    let randomNumDisp = document.getElementById("randomRun");
    this.randomRunsGen = setInterval(() => {
      this.randomRun =
        Match.runs[Math.floor(Math.random() * Match.runs.length)];
      randomNumDisp.innerText = this.randomRun.toString();
    }, 100);
  }
  startTimer(): void {
    let timerDisp = document.getElementById("timer");
    let startTime = Match.time;
    timerDisp.innerText = (startTime--).toString();
    this.timeGen = setInterval(() => {
      timerDisp.innerText = (startTime--).toString();
      if (startTime <= -1) {
        let playingteam = this.team == 1 ? team1Table : team2Table;
        playingteam.isbattingOver = true;
        this.playTeam();
      }
    }, 1000);
  }
  hit(): void {
    let playingteam = this.team == 1 ? this.team1 : this.team2;
    playingteam.hit(this.randomRun.toString());
    if (this.playedTeams == 2) {
      let playedteam = this.team == 1 ? this.team2 : this.team1;
      if (playedteam.getTotal() < playingteam.getTotal()) {
        playingteam.isbattingOver = true;
        GameNew.playTeam();
        return;
      }
    }
    if (playingteam.isbattingOver) {
      GameNew.playTeam();
    }
  }
  result(): string {
    if (this.team1.getTotal() > this.team2.getTotal()) {
      return "Team 1 has won";
    } else if (team1Table.getTotal() == team2Table.getTotal()) {
      return " This match is Draw";
    } else {
      return "Team 2 has won";
    }
  }
}

let team1Table = new ScoreTable("TEAM 1", "table-team1", "team1Total");
let team2Table = new ScoreTable("TEAM 2", "table-team2", "team2Total");
let GameNew = new Game(team1Table, team2Table);

const hit = () => {
  GameNew.hit();
};
const results = () => {
  let resultStr = GameNew.result();
  window.open(
    `results.html?result=${resultStr}&mom=${JSON.stringify(Match.mom)}`,
    "_blank"
  );
};
