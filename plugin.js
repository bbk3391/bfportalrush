// BF Portal Rush - PvP-AI Rush-Style Mode by bbk3391

Plugin.register("bfportalrush", (api) => {
  const { game, player, team, event, vars } = api;

  const STATE = {
    phase: 0, // Tracks which MCOM set is active: 0 = first, 1 = second, 2 = third
    activeMCOMs: [],
    attackers: 1, // Team 1 = BF3 Engineers (attackers)
    defenders: 2, // Team 2 = BC2 Engineers (defenders)
    mcomSets: [
      ["A1", "A2"],
      ["B1", "B2"],
      ["C1", "C2"]
    ],
    mcomDestroyed: new Set(),
    tickets: 100,
    ticketDrain: 1
  };

  // Initialize match
  game.on("matchStart", () => {
    STATE.phase = 0;
    STATE.mcomDestroyed.clear();
    STATE.tickets = 100;
    activateMCOMSet(0);
    game.broadcast("Attackers: Destroy the objectives!");
  });

  // Handle player deaths (simulate ticket loss)
  player.on("killed", (event) => {
    const p = event.player;
    if (p.team === STATE.attackers) {
      STATE.tickets -= STATE.ticketDrain;
      if (STATE.tickets <= 0) {
        endGame(STATE.defenders);
      }
    }
  });

  // Simulate MCOM destruction (you can place destructible objects and track when they're destroyed)
  // For now, simulate with chat command: type `/destroy A1` etc.
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

  // Respawn rule: attackers always spawn forward, defenders hold back
  player.on("initialSpawn", (event) => {
    assignLoadout(event.player);
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
        STATE.tickets = 100; // Reset tickets for next phase
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

  // Optional: Auto-balance bots into correct teams on join
  event.on("playerJoin", (event) => {
    const p = event.player;
    assignLoadout(p);
  });
});
