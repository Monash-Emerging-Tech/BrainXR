import { createXRStore } from "@react-three/xr";

// WebXR Store configuration
// Configured for immersive-ar passthrough with automatic browser offerSession support
export const xrStore = createXRStore({
  depthSensing: false,
  offerSession: true,
  // Reduce GPU cost on standalone hardware (Quest 3 / AVP): shade the periphery
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

