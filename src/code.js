figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === "close-plugin") {
    figma.closePlugin();
  }
};
