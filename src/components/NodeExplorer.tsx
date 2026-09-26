import React, { useRef } from "react";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import CursorTag from "./NodeExplorer/CursorTag";
import ExplorerOverview from "./NodeExplorer/ExplorerOverview";
import ElectrodeDrawer from "./NodeExplorer/ElectrodeDrawer";
import FocusSensorsDrawer from "./NodeExplorer/FocusSensorsDrawer";

interface NodeExplorerProps {
  isIdle: boolean;
  selectedChannel: ElectrodeName | null;
  hoveredChannel: ElectrodeName | null;
  frame: Frame;
  highlightPrefrontal: boolean;
  onSelectChannel: (name: ElectrodeName | null) => void;
  onHighlightPrefrontal: (highlighted: boolean) => void;
}

const NodeExplorer: React.FC<NodeExplorerProps> = ({
  isIdle, selectedChannel, hoveredChannel, frame, highlightPrefrontal, onSelectChannel, onHighlightPrefrontal,
}) => {
  const lastSelectedRef = useRef<ElectrodeName | null>(selectedChannel);
  if (selectedChannel) lastSelectedRef.current = selectedChannel;

  const clearSelection = () => {
    onSelectChannel(null);
    onHighlightPrefrontal(false);
  };

  return (
    <>
      <CursorTag channel={hoveredChannel} isIdle={isIdle} />
      {!isIdle && selectedChannel == null && !highlightPrefrontal && <ExplorerOverview />}
      {!isIdle && (
        <FocusSensorsDrawer
          open={highlightPrefrontal && selectedChannel == null}
          frame={frame}
          onClose={() => onHighlightPrefrontal(false)}
          onSelectSignal={(channel) => {
            onHighlightPrefrontal(false);
            onSelectChannel(channel);
          }}
        />
      )}
      {!isIdle && (
        <ElectrodeDrawer
          channel={selectedChannel ?? lastSelectedRef.current}
          open={selectedChannel != null}
          frame={frame}
          onClose={clearSelection}
        />
      )}
    </>
  );
};

export default React.memo(NodeExplorer);
