import { createXRStore } from "@react-three/xr";

// WebXR Store configuration with high-visibility ray pointers and cursor models
export const xrStore = createXRStore({
  depthSensing: false,
  // Reduce GPU cost on standalone hardware (Quest 3): shade the periphery
  // at lower resolution and render the XR framebuffer below native res.
  foveation: 0.7,
  frameBufferScaling: "mid",
  controller: {
    rayPointer: {
      minDistance: 0,
      rayModel: {
        maxLength: 10,
      },
      cursorModel: true,
    },
  },
  hand: {
    rayPointer: {
      minDistance: 0,
      rayModel: {
        maxLength: 10,
      },
      cursorModel: true,
    },
  },
});
