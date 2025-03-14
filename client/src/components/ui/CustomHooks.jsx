import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { createNodeWithDefaultData } from "./DefaultNodesEdges";



import { animate, easeOut } from "popmotion";

const NODE_MARGIN = 64;
const NODE_PADDING = 16;

function doesNodeOverlap(a, b) {
  const aAdj = {
    x: a.x - NODE_PADDING,
    y: a.y - NODE_PADDING,
    w: a.w + 2 * NODE_PADDING,
    h: a.h + 2 * NODE_PADDING,
  };
  const bAdj = {
    x: b.x - NODE_PADDING,
    y: b.y - NODE_PADDING,
    w: b.w + 2 * NODE_PADDING,
    h: b.h + 2 * NODE_PADDING,
  };

  const doesOverlap =
    aAdj.x < bAdj.x + bAdj.w &&
    aAdj.x + aAdj.w > bAdj.x &&
    aAdj.y < bAdj.y + bAdj.h &&
    aAdj.y + aAdj.h > bAdj.y;
  if (!doesOverlap) return false;

  const position = {
    top: a.y - b.h - NODE_MARGIN,
    bottom: a.y + a.h + NODE_MARGIN,
    left: a.x - b.w - NODE_MARGIN,
    right: a.x + a.w + NODE_MARGIN,
  };

  const directions = [
    { direction: "left", distance: Math.abs(b.x - position.left) },
    { direction: "right", distance: Math.abs(b.x - position.right) },
    { direction: "top", distance: Math.abs(b.y - position.top) },
    { direction: "bottom", distance: Math.abs(b.y - position.bottom) },
  ];

  directions.sort((a, b) => a.distance - b.distance);

  return { directions };
}

function getOverlappingNodes(node, nodes) {
  return nodes.reduce((acc, n) => {
    const overlap = doesNodeOverlap(node, n);
    if (overlap) {
      acc.push({ ...n, overlap });
    }
    return acc;
  }, []);
}

function moveNode(node, direction, distance) {
  const moveByDirection = {
    left: (pos) => pos - distance,
    right: (pos) => pos + distance,
    top: (pos) => pos - distance,
    bottom: (pos) => pos + distance,
  };

  return {
    id: node.id,
    x:
      direction === "left" || direction === "right"
        ? moveByDirection[direction](node.x)
        : node.x,
    y:
      direction === "top" || direction === "bottom"
        ? moveByDirection[direction](node.y)
        : node.y,
    w: node.w,
    h: node.h,
  };
}

function getBestMove(overlapNode, allNodes) {
  return (
    overlapNode.overlap.directions.reduce((best, direction) => {
      const simulatedNode = moveNode(
        overlapNode,
        direction.direction,
        direction.distance
      );
      const newOverlappingNodes = getOverlappingNodes(
        simulatedNode,
        allNodes.filter((n) => n.id !== simulatedNode.id)
      );
      const count = newOverlappingNodes.length;
      return count < best.count ? { ...direction, count } : best;
    },
    { direction: "left", distance: 0, count: Infinity })
  );
}

function applyMove(overlapNode, bestMove, allNodes, movedNodes) {
  const movedNode = moveNode(
    overlapNode,
    bestMove.direction,
    bestMove.distance
  );
  allNodes.forEach((n, index) => {
    if (n.id === overlapNode.id) {
      allNodes[index] = movedNode;
    }
  });
  movedNodes.set(overlapNode.id, movedNode);
}

function handleNodeOverlaps(node, allNodes, movedNodes) {
  const overlappingNodes = getOverlappingNodes(
    node,
    allNodes.filter((n) => n.id !== node.id)
  );
  if (overlappingNodes.length > 0) {
    for (const overlapNode of overlappingNodes) {
      const bestMove = getBestMove(overlapNode, allNodes);
      applyMove(overlapNode, bestMove, allNodes, movedNodes);
    }
    return true;
  }
  return false;
}

function handleOverlaps(allNodes, movedNodes) {
  let hasOverlap = false;
  for (const currentNode of allNodes) {
    if (handleNodeOverlaps(currentNode, allNodes, movedNodes)) {
      hasOverlap = true;
    }
  }
  return hasOverlap;
}

function calculateCoordinates(node, nodes) {
  const allNodes = [node, ...nodes];
  const movedNodes = new Map();
  const MAX_ITERATIONS = 10000;
  let iterations = 0;

  let hasOverlap = true;
  while (hasOverlap && iterations < MAX_ITERATIONS) {
    hasOverlap = handleOverlaps(allNodes, movedNodes);
    iterations++;
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn("Max iterations reached, there may still be overlaps.");
  }

  return Array.from(movedNodes.values());
}

export function UseNodeAutoAdjust() {
  const { getNodes, updateNode } = useReactFlow();

  return useCallback(
    (node) => {
      const currentNodeCoordinates = {
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        w: node.measured?.width || 0,
        h: node.measured?.height || 0,
      };

      const nodes = getNodes().reduce((acc, n) => {
        if (n.id !== currentNodeCoordinates.id) {
          acc.push({
            id: n.id,
            x: n.position.x,
            y: n.position.y,
            w: n.measured?.width || 0,
            h: n.measured?.height || 0,
          });
        }
        return acc;
      }, []);

      const adjustedNodes = calculateCoordinates(currentNodeCoordinates, nodes);
      adjustedNodes.forEach(({ id, x, y }) => {
        const _node = getNodes().find((n) => n.id === id);

        animate({
          from: {
            x: _node?.position.x || 0,
            y: _node?.position.y || 0,
          },
          to: { x, y },
          duration: 200,
          ease: easeOut,
          onUpdate: ({ x, y }) => {
            updateNode(id, { position: { x, y } });
          },
        });
      });
    },
    [getNodes, updateNode]
  );
}
