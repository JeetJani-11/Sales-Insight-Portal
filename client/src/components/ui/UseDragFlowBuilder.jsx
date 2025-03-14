import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
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
export function UseDragDropFlowBuilder() {
    const { screenToFlowPosition } = useReactFlow();
    const insertNode = useInsertNode();
    const onDragOver = useCallback((e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }, []);
    const onDrop = useCallback(
      (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/flow-builder.node-type");
        console.log("type", type);
        if (typeof type === "undefined" || !type) return;
        insertNode(
          type,
          screenToFlowPosition({
            x: e.clientX,
            y: e.clientY,
          })
        );
      },
      [insertNode, screenToFlowPosition]
    );
  
    return [onDragOver, onDrop];
  }