Plugin.register("bfportalrush", (api) => {
  const { game, player, team, event, vars } = api;

  const MAX_SETS = 3;
  const MCOMS_PER_SET = 2;
  const TOTAL_MCOMS = MAX_SETS * MCOMS_PER_SET;

  let currentSet = 0;
  let mcomsDestroyed = 0;
  let mcomsPerSetDestroyed = 0;

  vars.set("AttackerTickets", 100);

  game.on("matchStarted", () => {
    broadcastIntroMessages();
    loadoutRestrictions();
  });

  player.on("killed", (p, killer) => {
    if (p.team === 1) {
      let tickets = vars.get("AttackerTickets");
      vars.set("AttackerTickets", tickets - 1);
    }
  });

  event.on("mcomDestroyed", (e) => {
    mcomsDestroyed++;
    mcomsPerSetDestroyed++;

    if (mcomsDestroyed >= TOTAL_MCOMS) {
      game.endMatch(1);
    } else if (mcomsPerSetDestroyed >= MCOMS_PER_SET) {
      currentSet++;
      mcomsPerSetDestroyed = 0;
      event.broadcast(`Set ${currentSet + 1} is now live!`);
    }
  });

  function broadcastIntroMessages() {
    team.broadcast(1, "Rush Assault: Use EOD Bots only to destroy objectives!");
    team.broadcast(2, "Rush Defense: Use M1 Garand and AT Mines to hold the line!");
  }

  function loadoutRestrictions() {
    player.on("spawned", (p) => {
      if (p.team === 1) {
        p.inventory.clearAll();
        p.inventory.give("gadgets", "eodbot");
      } else if (p.team === 2) {
        p.inventory.clearAll();
        p.inventory.give("weapons", "m1garand");
        p.inventory.give("gadgets", "at_mine");
      }
    });
  }
});
