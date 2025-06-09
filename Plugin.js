// BF Portal Rush – PvP-AI Rush-Style Mode by bbk3391

Plugin.register("bfportalrush", (api) => {
  const STATE = {
    activeMCOMs: [],
    mcomDestroyed: new Set(),
    ticketDrain: 0,
    attackers: 1, // Team 1 = BF3 Engineers (attackers)
    defenders: 2, // Team 2 = BC2 Engineers (defenders)
    mcoms: [
      ["A1", "B1"],
      ["A2", "B2"],
      ["A3", "B3"]
    ],
    tickets: 100,
    activeIndex: 0
  };

  function activateMCOMSet(index) {
    STATE.activeMCOMs = STATE.mcoms[index];
    STATE.activeIndex = index;
    game.broadcast(`New objectives: ${STATE.activeMCOMs.join(" & ")}`);
  }

  function checkNextPhase() {
    const remaining = STATE.activeMCOMs.filter(m => !STATE.mcomDestroyed.has(m)).length;
    if (remaining === 0) {
      if (STATE.activeIndex < STATE.mcoms.length - 1) {
        STATE.tickets += 100;
        activateMCOMSet(STATE.activeIndex + 1);
      } else {
        endGame(STATE.attackers);
      }
    }
  }

  function endGame(winningTeam) {
    game.broadcast(winningTeam === STATE.attackers ? "Attackers win!" : "Defenders hold the line!");
    game.endMatch();
  }

  function autoBalanceTeams(player) {
    const team = player.team;
    if (team !== STATE.attackers && team !== STATE.defenders) {
      if (player.teamId === 1) {
        api.assignToTeam(player, STATE.attackers);
      } else {
        api.assignToTeam(player, STATE.defenders);
      }
    }
  }

  function configurePlayer(player) {
    if (player.team === STATE.attackers) {
      api.inventory.clear(player);
      api.inventory.setLoadout(player, {
        class: "engineer",
        weapon: "eodbot"
      });
    } else if (player.team === STATE.defenders) {
      api.inventory.clear(player);
      api.inventory.setLoadout(player, {
        class: "engineer",
        weapon: "m1garand",
        gadget: "antimine"
      });
    }
  }

  return {
    name: "BF Portal Rush",
    version: "1.0.0",
    author: "bbk3391",
    init(api, events) {
      game.on("MatchStarted", () => {
        STATE.activeMCOMs = [];
        STATE.mcomDestroyed.clear();
        STATE.activeIndex = 0;
        STATE.tickets = 100;
        activateMCOMSet(0);
        game.broadcast("Attackers: destroy the objectives!");
      });

      game.on("PlayerKilled", (player, killer) => {
        if (STATE.tickets > 0 && player.team === STATE.attackers) {
          STATE.tickets -= 1;
          if (STATE.tickets <= 0) {
            endGame(STATE.defenders);
          }
        }
      });

      game.on("PlayerUsedChat", (player, msg) => {
        const mcom = msg.toUpperCase().trim();
        if (STATE.activeMCOMs.includes(mcom) && !STATE.mcomDestroyed.has(mcom)) {
          STATE.mcomDestroyed.add(mcom);
          game.broadcast(`${mcom} destroyed!`);
          checkNextPhase();
        }
      });

      events.on("PlayerJoin", (player) => {
        autoBalanceTeams(player);
        configurePlayer(player);
      });

      game.on("PlayerRespawn", configurePlayer);
    }
  };
});
