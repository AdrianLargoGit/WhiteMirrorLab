// Visible index fingertips measured in the source images, scaled to their
// displayed sizes. The normal glove is reflected horizontally around its center.
export const CURSOR_HOTSPOTS = {
  normal: {
    x: 20 - (148.5 / 400) * 20,
    y: (17.5 / 400) * 20,
  },
  hover: {
    x: (14 / 32) * 24,
    y: (0.5 / 32) * 24,
  },
  // The bristle tip is the painting point in the 20px SVG.
  brush: {
    x: 1,
    y: 19,
  },
} as const
