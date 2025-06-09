Plugin.register("bfportalrush", (api) => {
  const STATE = {
    attackers: 1,
    defenders: 2,
    activeMCOMs: ["A", "B"],
    mcomDestroyed: new Set(),
    currentPhase: 0
  };

  api.on("gameStart", () => {
    api.say("BF Portal Rush initialized. Attackers: destroy the objectives!");
  });

  api.on("playerDeath", (event) => {
    if (event.player.team === STATE.attackers) {
      api.addTickets(STATE.defenders, 1);
    }
  });

  api.on("playerChat", (player, message) => {
    if (message.startsWith("/destroy")) {
      const mcom = message.split(" ")[1]?.toUpperCase();
      if (STATE.activeMCOMs.includes(mcom) && !STATE.mcomDestroyed.has(mcom)) {
        STATE.mcomDestroyed.add(mcom);
        api.say(`Objective ${mcom} destroyed!`);

        if (STATE.mcomDestroyed.size === STATE.activeMCOMs.length) {
          STATE.currentPhase += 1;
          STATE.mcomDestroyed.clear();
          api.say(`Phase ${STATE.currentPhase + 1} started!`);
        }
      }
    }
  });
});