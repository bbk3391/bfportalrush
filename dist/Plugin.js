export default function main(api) {
  api.onReady(() => {
    api.workspace.clear();

    api.workspace.addBlock("rush_intro", {
      when: "On Game Started",
      do: [
        `UIMessage("Rush mode active!")`,
        `Log("Rush mode logic initialized.")`
      ]
    });
  });
}
