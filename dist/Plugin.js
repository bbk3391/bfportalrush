export default function main(api) {
  api.onReady(() => {
    // Clear the editor first
    api.workspace.clear();

    // Example logic block
    api.workspace.addBlock("rush_intro", {
      when: "On Game Started",
      do: [
        `UIMessage("Rush mode initialized!")`,
        `Log("Rush logic running.")`
      ]
    });

    // Add more blocks here...
  });
}
