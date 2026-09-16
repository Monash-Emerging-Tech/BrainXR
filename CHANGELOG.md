# Changelog

All notable changes to this project, derived from git history, newest first.

## 2026-09-16

- **`ad218f7`** [XR][Performance] Node Selection Lagginess Fixes - Epoch 3 — stopped reallocating the selection/hover halo ring's geometry and material on every hover transition (toggles visibility instead of mounting/unmounting); rebound headset/panel repositioning to the controller's grip button instead of the trigger, and guarded node selection against the grip's near-field pointer so the two gestures no longer compete on the same input channel.
- **`9ef8862`** [XR][Performance] Node Selection Lagginess Fixes - Epoch 2 — stopped `OrbitControls` from running (and fighting the XR camera rig) during presentation; enabled WebXR foveation and framebuffer scaling on Quest 3; dropped shadow casting/receiving on small parts (electrode LEDs, console panel/button), keeping it only on the headset shell.
- **`53ce40e`** [XR][Performance] Node Selection Lagginess Fixes — fixed a broken `React.memo` that caused all 21 electrode nodes to re-render on every hover/select change instead of just the affected node(s); removed per-frame allocation in the camera-focus quaternion math computed while a node stays selected.

## 2026-08-26

- **`9020455`** [Web][XR] Auto Rotate on Click
- **`65da02b`** [Branding] XR Cylinderical Wall
- **`aa6c61e`** [UX][XR] Fix EEG Node Selection, Ring Placement, and Camera Focus
- **`6cc59f6`** Revert "[Performance] state management ig"
- **`2f8fc47`** [Performance] state management ig
- **`e426d03`** [XR][Usability] auto rotate to highlight EEG nodes
- **`f2675b6`** [XR][Usability] Repositioning Contraints, Text Distortion on Cylinder Wall & LED Selection Rings
- **`954e4b5`** [XR][Usability] Easier Repositioning + Selecting Sensor Nodes from Graph
- **`8b974f5`** [XR][Usability] Fix Auto PreSelect Behaviour on Control Panel
- **`afe955b`** Revert "[Claude] UI/UX audit fixes"
- **`44e21a0`** Revert "[XR][Usability] Post Claude Adjustments 1"
- **`bf16b63`** [XR][Usability] Post Claude Adjustments 1

## 2026-08-25

- **`ffb86ac`** [Claude] UI/UX audit fixes
- **`af362d9`** [XR][Usability] Fix in-headset UI/UX audit findings
- **`e4a18c4`** [XR][Usability] Redesign Epoch 7 — de-trailing the trial dial + XR audio stimuli 404
- **`07b9011`** [XR][Usability] Redesign Epoch 6 — highlighting UI mechanism
- **`3c1f36a`** [XR][Usability] Redesign Epoch 5 — more context
- **`a14e307`** [XR][Usability] Redesign Epoch 4 — translucence
- **`ccc8abd`** [XR][Usability] Redesign Epoch 3 — feedback addressed: removed the signals-cylinder dashboard from the homescreen (demo mode only), removed all watch-implementation files, moved focus-component metrics into the space above the playback control panel's pause buttons, removed the playback control panel's background color.
- **`0ec879d`** [XR][Usability] Redesign Epoch 2 — feedback addressed: diverged from the web version's UI design language, fixed the signal cylinder being mirrored, fixed the watch being inactive/unattached to the left controller.
- **`63a9c00`** [XR][Usability] Redesign Epoch 1
- **`2c0a1db`** [XR] UX for cursor visibility on the dashboard
- **`8348d68`** [XR] light theme dashboard + exit XR mode button
- **`c142a29`** [XR] dashboard - signals, focus metrics and trials

## 2026-08-24

- **`1114f24`** [XR] fixing jittering audio and LED
- **`db6846e`** fixing the audio jittering

## 2026-08-17

- **`455732e`** consistent styling between WebXR and desktop
- **`1533989`** demo mode and real time mode menu in XR

## 2026-08-11

- **`281f740`** build optimisations and code splitting
- **`004750a`** compressed by ~50%

## 2026-07-31

- **`03f434f`** free drag STL
- **`e760f6f`** free-rotate STL
- **`03c4119`** XR HUD
- **`0cff52e`** XR mode
- **`26a0c9e`** performance and bug fixes
- **`6f319ff`** unavailable audio toaster
- **`318dbbf`** local network hosting

## 2026-07-22

- **`dac94f0`** audio sync to the EEG stream
- **`0d8efbe`** UI consistency across all the components
- **`dc4b28d`** refining design of the trial dial
- **`2042437`** trial dial

## 2026-07-20

- **`c5875b6`** optimised mobile view
- **`30a65cf`** 3 trials

## 2026-07-19

- **`9302fe7`** coloured and background oscilloscopes
- **`f760d14`** deepen r3f.tsx: extract playback engine, app-mode state, and per-responsibility components
- **`abe2b8e`** normalised data
- **`d6d5263`** progress bar
- **`19defa7`** EEG data integrated to the digital twin

## 2026-07-14

- **`2faf7f9`** final adjustment for the idle page
- **`d84f926`** branding
- **`16adc3c`** compression
- **`77cb680`** high-poly model
- **`a30836c`** born again — digitalTwin MVP

## 2025-08-25

- **`310a767`** orbit controls

## 2025-08-23

- **`078f384`** web visualisation + electrode mapping
- **`1bcddad`** 3D assets for visualisation prototype 1

## 2025-08-09

- **`fd0bcc9`** reference EEG electrode placement system
- **`f4687f1`** react-three-fiber integration
- **`5db00fc`** React and Tailwind integration
- **`39c06b6`** first commit
