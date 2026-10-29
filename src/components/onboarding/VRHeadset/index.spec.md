# VRHeadset

A 3D spatial computing model of the Apple Vision Pro designed to fit the digital brain model during the Direction beat of the onboarding flow.

## Inputs & Props
- `mountProgress?: number`: 0 to 1 scalar driving the mounting animation. At 0, the headset is hidden/unmounted. As progress reaches 1, the headset smoothly glides along the forward line of sight and locks flush onto the cranial curvature.
- `mountProgressRef?: React.RefObject<number>`: Ref to dynamic mounting scalar for high-framerate animation.
- `isTracking?: boolean`: When true, animates the internal EyeSight dynamic cyan gradient display with subtle organic breathing waves.

## Behavior
Renders the Apple Vision Pro architecture:
1. 3D laminated curved front glass enclosure with high reflectivity and clearcoat sheen.
2. Internal EyeSight dynamic cyan OLED display.
3. Curved bead-blasted anodized aluminum alloy frame.
4. Top-mounted Digital Crown and Top Capture Button.
5. Dual spatial audio strap pods with speaker slits.
6. Signature 3D-ribbed Solo Knit Band with tension Fit Dial.
7. Breathable charcoal light seal interface.
