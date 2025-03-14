import {
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import CustomDeletableEdge from "./CustomEdge";
import { ConditionalPathNode } from "./CustomCoditionalNode";
import TaskPathNode from "./CustomTaskNode";
import { defaultEdges, defaultNodes } from "./DefaultNodesEdges";
import { UseNodeAutoAdjust } from "./CustomHooks";
import { UseDragDropFlowBuilder } from "./UseDragFlowBuilder";
import { StartNode } from "./StartNode";
import { EndNode } from "./EndNode";
import { DesktopSidebarFragment } from "./Sidebar";
import { produce } from "immer";

console.log(TaskPathNode);

const edgeTypes = {
  deletable: CustomDeletableEdge,
};

const nodeTypes = {
  conditionalNode: ConditionalPathNode,
  taskPathNode: TaskPathNode,
  start: StartNode,
  end: EndNode,
};

function applyChange(change, element) {
  // Example implementation for applying a single change
  switch (change.type) {
    case "position":
      if (change.position) {
        element.position = { ...change.position }; // Ensure immutability
      }
      break;
    // Add other cases as needed (e.g., data updates, labels, etc.)
    default:
      console.warn(`Unhandled change type: ${change.type}`);
  }
}

function applyChanges(changes, elements) {
  const updatedElements = [];
  const changesMap = new Map();
  const addItemChanges = [];

  for (const change of changes) {
    if (change.type === "add") {
      addItemChanges.push(change);
      continue;
    } else if (change.type === "remove" || change.type === "replace") {
      changesMap.set(change.id, [change]);
    } else {
      const elementChanges = changesMap.get(change.id);
      if (elementChanges) {
        if (change.type === "position") {
          elementChanges.push(change);
        }
      } else {
        if (change.type === "position") {
          changesMap.set(change.id, [change]);
        }
      }
    }
  }

  for (const element of elements) {
    const changesForElement = changesMap.get(element.id);
    if (!changesForElement) {
      updatedElements.push(element);
      continue;
    }

    if (changesForElement[0].type === "remove") {
      continue;
    }

    if (changesForElement[0].type === "replace") {
      updatedElements.push({ ...changesForElement[0].item });
      continue;
    }

    const updatedElement = { ...element };
    for (const change of changesForElement) {
      applyChange(change, updatedElement);
    }

    updatedElements.push(updatedElement);
  }

  if (addItemChanges.length) {
    addItemChanges.forEach((change) => {
      if (change.index !== undefined) {
        updatedElements.splice(change.index, 0, { ...change.item });
      } else {
        updatedElements.push({ ...change.item });
      }
    });
  }

  return updatedElements;
}

const useCustomNodesChange = (setNodes) => {
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nodes) =>
        produce(nodes, (draft) => {
          const updatedNodes = applyChanges(changes, draft);
          return updatedNodes;
        })
      );
    },
    [setNodes]
  );

  return onNodesChange;
};

export default function Flow() {
  const [nodes, setNodes, _] = useNodesState(defaultNodes);
  const onNodesChange = useCustomNodesChange(setNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const { getNodes } = useReactFlow();
  const autoAdjustNode = UseNodeAutoAdjust();
  const [onDragOver, onDrop] = UseDragDropFlowBuilder();

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, id: nanoid(), type: "deletable" };
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        console.log(change);
        if (change.type === "dimensions") {
          const node = getNodes().find((n) => n.id === change.id);
          console.log(getNodes());
          if (node) {
            autoAdjustNode(node);
          }
        }
      });
    },
    [autoAdjustNode, getNodes, onNodesChange]
  );

  return (
    <div
      className="flex flex-row h-screen"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        className="flex-grow bg-dark-500"
        style={{
          width: "60vw",
          height: "100vh",
        }}
      >
        <ReactFlow
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
          onInit={({ fitView }) => fitView().then()}
          nodes={nodes}
          onNodesChange={handleNodesChange}
          edgeTypes={edgeTypes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStop={(_, node) => {
            autoAdjustNode(node);
          }}
          multiSelectionKeyCode={null}
          snapGrid={[16, 16]}
          snapToGrid
          fitView
        />
      </div>

      {/* Sidebar */}
      <div className="bg-dark-700">
        <DesktopSidebarFragment />
      </div>
    </div>
  );
}
