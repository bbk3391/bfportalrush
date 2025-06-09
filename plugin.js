// Battlefield Portal Custom Rush PvP-AI Mode
// Full game logic setup, assumes portal extensions plugin environment

const bf2042 = getPortal();

bf2042.onGameStart(() => {
    bf2042.log("Starting Custom Rush PvP-AI mode...");
    // Setup initial game state
    initializePvPAIGame();
});

function initializePvPAIGame() {
    // Team setup
    bf2042.setTeam(1, {
        faction: "BF3",
        role: "Engineer",
        gadgets: ["EODBot"],
        isAttacker: true,
        maxPlayers: 20,
        aiFill: true,
    });
    bf2042.setTeam(2, {
        faction: "BC2",
        role: "Engineer",
        weapons: ["M1Garand"],
        gadgets: ["ATMine"],
        isDefender: true,
        maxPlayers: 20,
        aiFill: true,
    });

    // Objective sets (3 sets of 2 MCOMs)
    bf2042.setObjectives([
        { set: 1, mcoms: ["A", "B"], mapAreas: ["SectorAlpha"] },
        { set: 2, mcoms: ["C", "D"], mapAreas: ["SectorBravo"] },
        { set: 3, mcoms: ["E", "F"], mapAreas: ["SectorCharlie"] }
    ]);

    // Win conditions
    bf2042.setWinConditions({
        attackersWinOnAllMCOMsDestroyed: true,
        defendersWinOnTicketDrain: true,
        ticketCount: 100
    });

    // PvP-AI behavior
    bf2042.enablePvPAI({
        replaceBotsWithPlayers: true,
        botSkill: "normal"
    });

    // Music/radio (Valparaiso)
    bf2042.onMapLoad("Valparaiso", () => {
        bf2042.playMusic("Vietnam_War_Radio", {
            volume: 0.5,
            loop: true
        });
    });

    // Intro lines (Bad Company 2 style)
    bf2042.onGameStart(() => {
        bf2042.playVoiceLine("Sweetwater", "I signed up for explosions, not cardio!");
        bf2042.playVoiceLine("Haggard", "Lock and load boys, we're gonna burn this place down!");
    });
}