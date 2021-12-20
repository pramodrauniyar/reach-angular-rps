import {Component, OnInit} from '@angular/core';
import * as backend from './build/index.main';
import {loadStdlib} from '@reach-sh/stdlib';
import MyAlgoConnect from "@reach-sh/stdlib/ALGO_MyAlgoConnect";

const stdlib = loadStdlib("ALGO");
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
const HANDS = ['ROCK', 'PAPER', 'SCISSORS'];

stdlib.setWalletFallback(
  stdlib.walletFallback({
    providerEnv: "TestNet",
    MyAlgoConnect,
  })
);
let resolveHandPlayer;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

  acc: any;
  bal: any;
  type: string;
  who: string;
  ctc: any;
  ctcInfo: any;
  acceptedWager: boolean = false;
  showAcceptWager: boolean = false;
  showPlayAs: boolean = false;
  showCTCInputBox: boolean = false;
  showCtcInfo: boolean = true;
  isLoading: boolean = false;
  selectedHand: any;
  winnerMessage: string = '';
  showRPS: boolean = false;
  Player = {
    ...stdlib.hasRandom,
    getHand: async () => {
      const hand = await new Promise(resolve => {
        this.showRPS = true;
        resolveHandPlayer = resolve;
      });
      return hand;
    },
    seeOutcome: (outcome) => {
      console.log(`The outcome is: ${outcome}`);
      this.winnerMessage = `The outcome is: ${OUTCOME[outcome]}`;
    },
    informTimeout: function () {
      console.log(`There was a timeout (Bob)` + this.who);
      process.exit(1);
    }
  }

  constructor() {
  }

  ngOnInit() {

    try {
      if (stdlib) {
        this.getDefaultAccount();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getDefaultAccount() {
    try {
      const acc = await stdlib.getDefaultAccount();
      console.log(acc);
      const balAtomic = await stdlib.balanceOf(acc);
      const bal = stdlib.formatCurrency(balAtomic, 4);
      console.log("Balance is:", bal)
      this.setAccount(acc, bal);
    } catch (e) {
      console.log(e);
    }
  }

  setAccount(acc, bal) {
    this.acc = acc;
    this.bal = bal;
  }

  deployer() {

    try {
      this.isLoading = true;
      this.showPlayAs = true;
      this.who = 'Alice';
      const ctc = this.acc.contract(backend);
      this.ctc = ctc;
      ctc.getInfo().then((info) => {
        console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
        this.ctcInfo = info;
        this.isLoading = false;
      });
      let interact;
      interact = {
        ...stdlib.hasRandom,
        ...this.Player,
        wager: stdlib.parseCurrency(1),
        deadline: 100,
      };
      backend.Alice(this.ctc, interact).catch(error => {
        console.log("Error", error);
      });
      return false;
    } catch (e) {
      console.log(e);
    }
  }

  attacher() {
    this.who = 'Bob';
    this.showPlayAs = true;
    this.showCTCInputBox = true;
    return false;
  }

  attach() {
    try {
      this.showCtcInfo = false;
      const ctc = this.acc.contract(backend, JSON.parse(this.ctcInfo));
      this.ctc = ctc;

      console.log("attached", ctc);
      console.log(ctc.getInfo());
      this.showAcceptWager = true;
      return false;
    } catch (e) {
      console.log(e);
    }
  }

  accept() {
    try {
      console.log(this.ctc);
      let interact;
      let obj = this;
      interact = {
        ...stdlib.hasRandom,
        ...this.Player,
        acceptWager: (amt) => {
          const accepted = 1;
          const wager = stdlib.formatCurrency(amt, 4);
          console.log(`Bob accepts the wager of ${wager}.`);
        },
      };
      backend.Bob(this.ctc, interact).catch(error => {
        console.log("Error", error);
      });

    } catch (e) {
      console.log(e);
    }
  }

  playHand(hand) {
    try {
      console.log(this.who + ":Your hand is" + hand);
      resolveHandPlayer(hand);
      this.showRPS = false;
      this.selectedHand = HANDS[hand];
      return false;
    } catch (e) {
      console.log(e);
    }
  }

  acceptWager() {
    try {
      console.log("accepted!");
      this.acceptedWager = true;
      this.accept();
    } catch (e) {
      console.log(e);
    }
  }

}
