import { SidebarButtonItem, SidebarPanelWrapper } from "./SidebarComponents";
import NodePreviewDraggable from "./NodePreviewDraggable";
import { AVAILABLE_NODES } from "./DefaultNodesEdges";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { createNodeWithDefaultData } from "./DefaultNodesEdges";

function useInsertNode() {
  const { addNodes, screenToFlowPosition, getNodes, updateNode } =
    useReactFlow();

  return useCallback(
    (type, pos) => {
      const _pos =
        pos ||
        screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });

      getNodes().forEach((node) => {
        if (node.selected) {
          updateNode(node.id, { selected: false });
        }
      });

      const newNode = createNodeWithDefaultData(type, {
        position: _pos,
        selected: true,
      });
      addNodes(newNode);
    },
    [screenToFlowPosition, getNodes, addNodes, updateNode]
  );
}

export function DesktopSidebarFragment() {
  const insertNode = useInsertNode();
  return (
    <div
      className="relative max-w-sm w-fit flex flex-col p-4 border-l border-gray-300 bg-gray-50"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div className="p-2">
        <SidebarPanelWrapper>
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="mt-4 text-sm font-medium text-gray-800">
              Available Nodes
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Drag and drop nodes to build your Mavlon Flow{" "}
            </div>
          </div>

          <div className="grid gap-4 p-4">
            {AVAILABLE_NODES.map((node) => (
              <NodePreviewDraggable
                key={node.type}
                type={node.type}
                icon={node.icon}
                title={node.title}
                description={node.description}
                insertNode={insertNode}
              />
            ))}
          </div>
        </SidebarPanelWrapper>
      </div>
    </div>
  );
}
