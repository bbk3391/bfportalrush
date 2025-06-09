export default function main(api) {
  const { game, player, team, event, vars, workspace } = api;

  const STATE = {
    phase: 0,
    activeMCOMs: [],
    attackers: 1,
    defenders: 2,
    mcomSets: [["A1", "A2"], ["B1", "B2"], ["C1", "C2"]],
    mcomDestroyed: new Set(),
    tickets: 100,
    ticketDrain: 1
  };

  // Register workspace blocks
  workspace.addBlock("Match Start", () => {
    STATE.phase = 0;
    STATE.mcomDestroyed.clear();
    STATE.tickets = 100;
    activateMCOMSet(0);
    game.broadcast("Attackers: Destroy the objectives!");
  });

  workspace.addBlock("Player Killed", (e) => {
    if (e.player.team === STATE.attackers) {
      STATE.tickets -= STATE.ticketDrain;
      if (STATE.tickets <= 0) {
        endGame(STATE.defenders);
      }
    }
  });

  workspace.addBlock("Player Chat", (e) => {
    const { player: p, message } = e;
    if (message.startsWith("/destroy ")) {
      const mcom = message.split(" ")[1].toUpperCase();
      if (STATE.activeMCOMs.includes(mcom) && !STATE.mcomDestroyed.has(mcom)) {
        STATE.mcomDestroyed.add(mcom);
        game.broadcast(`Objective ${mcom} destroyed!`);
        checkNextPhase();
      }
    }
  });

  workspace.addBlock("Player Initial Spawn", (e) => {
    assignLoadout(e.player);
  });

  workspace.addBlock("Player Join", (e) => {
    assignLoadout(e.player);
  });

  // Internal helper functions
  function activateMCOMSet(index) {
    STATE.phase = index;
    STATE.activeMCOMs = STATE.mcomSets[index];
    game.broadcast(`New objectives: ${STATE.activeMCOMs.join(" & ")}`);
  }

  function checkNextPhase() {
    const remaining = STATE.activeMCOMs.filter(m => !STATE.mcomDestroyed.has(m));
    if (remaining.length === 0) {
      if (STATE.phase < STATE.mcomSets.length - 1) {
        activateMCOMSet(STATE.phase + 1);
        STATE.tickets = 100;
      } else {
        endGame(STATE.attackers);
      }
    }
  }

  function endGame(winningTeam) {
    game.endMatch(winningTeam);
    game.broadcast(winningTeam === STATE.attackers ? "Attackers win!" : "Defenders hold the line!");
  }

  function assignLoadout(p) {
    if (p.team === STATE.attackers) {
      p.inventory.clear();
      p.inventory.setLoadout("BF3", "Engineer");
      p.inventory.equipGadget("EODBot");
    } else if (p.team === STATE.defenders) {
      p.inventory.clear();
      p.inventory.setLoadout("BC2", "Engineer");
      p.inventory.equipPrimary("M1 Garand");
      p.inventory.equipGadget("ATMine");
    }
  }
}
