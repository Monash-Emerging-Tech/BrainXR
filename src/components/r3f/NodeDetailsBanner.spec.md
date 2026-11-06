# NodeDetailsBanner

2D desktop banner shown below the headline when an electrode (or the prefrontal group) is selected: region/channel badges, live raw voltage, the node's measured-metric insight text, and prev/next circular nav arrows colored by each neighbor's cortical region.

**Props**: `channel`, `isPrefrontalGroup`, `frame`, `onSelectChannel`.

**Non-obvious**: when `isPrefrontalGroup` is true but no individual `channel` is selected, it defaults the displayed node to `"FpZ"` rather than rendering nothing.
