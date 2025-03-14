export const slidesToElements = (initial, slides) => {
  const stack = [{ id: initial, position: { x: 0, y: 0 } }];
  const visited = new Set();
  const nodes = [];
  const edges = [];
  const SLIDE_WIDTH = 220;
  const SLIDE_HEIGHT = 70;
  const SPACING_FACTOR = 1.5; // Adjust spacing between sibling nodes

  while (stack.length) {
    const { id, position } = stack.pop();
    const data = slides[id].data;
    const node = { id, type: "node", position, data };
    nodes.push(node);
    visited.add(id);

    // Define offsets for directions
    let directionOffsets = {
      left: { x: -SLIDE_WIDTH, y: 0 },
      right: { x: SLIDE_WIDTH, y: 0 },
      up: { x: 0, y: -SLIDE_HEIGHT },
      down: { x: 0, y: SLIDE_HEIGHT },
    };

    ["left", "right", "up", "down"].forEach((direction) => {
      if (!data[direction]) return;

      const childCount = data[direction].length;
      data[direction].forEach((childId, index) => {
        if (!visited.has(childId)) {
          // Calculate position offset for each child
          const offsetMultiplier = index - (childCount - 1) / 2; // Center children around the parent
          const nextPosition = {
            x:
              position.x +
              directionOffsets[direction].x +
              (direction === "down" || direction === "up"
                ? offsetMultiplier * SPACING_FACTOR * SLIDE_WIDTH
                : 0),
            y:
              position.y +
              directionOffsets[direction].y +
              (direction === "left" || direction === "right"
                ? offsetMultiplier * SPACING_FACTOR * SLIDE_HEIGHT
                : 0),
          };

          stack.push({ id: childId, position: nextPosition });
          edges.push({
            id: `${id}->${childId}`,
            source: slides[id],
            target: slides[childId],
            type: "customEdge",
          });
        }
      });
    });
  }

  return { nodes, edges };
};
