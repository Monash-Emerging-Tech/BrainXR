# index.tsx

Public entry point for the Aimlabs-style CPT/SART cognitive test module.
Re-exports [[AimlabsScene|AimlabsScene]] (the 3D scene) and
[[AimlabsOverlay|AimlabsOverlay]] (the 2D HUD/modals), plus
[[aimlabsStore|aimlabsStore]]/`AimlabsState` and everything from `./types`,
so callers (e.g. `r3f/index.tsx`) only need this one import path.

No props — this file has no component of its own, just re-exports.
