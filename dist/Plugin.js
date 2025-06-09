// BF Portal Rush - PvP-AI Rush-Style Mode by bbk3391 using Portal Extensions 2.0

export default function main(api) {
  const { game, player, event, workspace } = api;

  const STATE = {
    phase: 0,
    activeMCOMs: [],
    attackers: 1,
    defenders: 2,
    mcomSets: [
      ["A1", "A2"],
      ["B1", "B2"],
      ["C1", "C2"]
    ],
    mcomDestroyed: new Set(),
    tickets: 100,
    ticketDrain: 1
  };

  game.on("matchStart", () => {
    STATE.phase = 0;
    STATE.mcomDestroyed.clear();
    STATE.tickets = 100;
    activateMCOMSet(0);
    game.broadcast("Attackers: Destroy the objectives!");
  });

  player.on("killed", (event) => {
    const p = event.player;
    if (p.team === STATE.attackers) {
      STATE.tickets -= STATE.ticketDrain;
      if (STATE.tickets <= 0) {
        endGame(STATE.defenders);
      }
    }
  });

  player.on("chat", (event) => {
    const { player, message } = event;
    if (message.startsWith("/destroy ")) {
      const mcom = message.split(" ")[1].toUpperCase();
      if (STATE.activeMCOMs.includes(mcom) && !STATE.mcomDestroyed.has(mcom)) {
        STATE.mcomDestroyed.add(mcom);
        game.broadcast(`Objective ${mcom} destroyed!`);
        checkNextPhase();
      }
    }
  });

  player.on("initialSpawn", (event) => {
    assignLoadout(event.player);
  });

  event.on("playerJoin", (event) => {
    const p = event.player;
    assignLoadout(p);
  });

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

  // Block to indicate script is loaded
  workspace.addBlock({
    id: "rush_initialized",
    type: "text",
    position: { x: 100, y: 100 },
    fields: {
      TEXT: "BF Portal Rush mode loaded and running."
    }
  });
}
