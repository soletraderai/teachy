// Knowledge Map Layout Web Worker
// Performs force-directed layout calculations off the main thread

interface MapNode {
  id: string;
  name: string;
  category: string | null;
  masteryLevel: string;
  reviewCount: number;
  sessionTitle: string;
}

interface MapConnection {
  source: string;
  target: string;
  strength: number;
}

interface LayoutMessage {
  type: 'calculate';
  nodes: MapNode[];
  connections: MapConnection[];
  width: number;
  height: number;
  iterations?: number;
}

interface Position {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Force-directed layout algorithm
function calculateForceDirectedLayout(
  nodes: MapNode[],
  connections: MapConnection[],
  width: number,
  height: number,
  iterations: number = 100
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, Position>();
  const centerX = width / 2;
  const centerY = height / 2;

  // Initialize positions - group by category in a circle
  const categoryGroups = new Map<string, MapNode[]>();
  nodes.forEach(node => {
    const category = node.category || 'Uncategorized';
    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }
    categoryGroups.get(category)!.push(node);
  });

  // Initial placement in circular arrangement by category
  let totalAngle = 0;
  const radius = Math.min(width, height) * 0.35;

  const categoryAngles = Array.from(categoryGroups.entries()).map(([category, categoryNodes]) => {
    const angleSpan = (categoryNodes.length / nodes.length) * Math.PI * 2;
    const start = totalAngle;
    totalAngle += angleSpan;
    return { category, nodes: categoryNodes, start, span: angleSpan };
  });

  categoryAngles.forEach(({ nodes: categoryNodes, start, span }) => {
    categoryNodes.forEach((node, i) => {
      const angle = start + (span * (i + 0.5) / categoryNodes.length);
      const nodeRadius = radius * (0.6 + Math.random() * 0.4);
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * nodeRadius,
        y: centerY + Math.sin(angle) * nodeRadius,
        vx: 0,
        vy: 0,
      });
    });
  });

  // Build connection lookup for faster access
  const connectionLookup = new Map<string, Set<string>>();
  connections.forEach(conn => {
    if (!connectionLookup.has(conn.source)) {
      connectionLookup.set(conn.source, new Set());
    }
    if (!connectionLookup.has(conn.target)) {
      connectionLookup.set(conn.target, new Set());
    }
    connectionLookup.get(conn.source)!.add(conn.target);
    connectionLookup.get(conn.target)!.add(conn.source);
  });

  // Force simulation parameters
  const repulsionStrength = 500;
  const attractionStrength = 0.1;
  const dampening = 0.9;
  const minDistance = 60;

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations; // Cooling factor

    // Apply repulsion between all nodes
    nodes.forEach((nodeA, i) => {
      const posA = positions.get(nodeA.id)!;

      nodes.slice(i + 1).forEach(nodeB => {
        const posB = positions.get(nodeB.id)!;

        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < minDistance * 3) {
          const force = (repulsionStrength * alpha) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          posA.vx -= fx;
          posA.vy -= fy;
          posB.vx += fx;
          posB.vy += fy;
        }
      });
    });

    // Apply attraction along connections
    connections.forEach(conn => {
      const posA = positions.get(conn.source);
      const posB = positions.get(conn.target);
      if (!posA || !posB) return;

      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;

      const force = attractionStrength * conn.strength * alpha;
      const fx = dx * force;
      const fy = dy * force;

      posA.vx += fx;
      posA.vy += fy;
      posB.vx -= fx;
      posB.vy -= fy;
    });

    // Apply center gravity
    const centerGravity = 0.01 * alpha;
    positions.forEach((pos) => {
      pos.vx += (centerX - pos.x) * centerGravity;
      pos.vy += (centerY - pos.y) * centerGravity;
    });

    // Update positions with velocity
    positions.forEach((pos) => {
      pos.vx *= dampening;
      pos.vy *= dampening;

      pos.x += pos.vx;
      pos.y += pos.vy;

      // Keep within bounds with padding
      const padding = 50;
      pos.x = Math.max(padding, Math.min(width - padding, pos.x));
      pos.y = Math.max(padding, Math.min(height - padding, pos.y));
    });

    // Send progress updates every 20 iterations
    if (iter % 20 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((iter / iterations) * 100),
      });
    }
  }

  // Convert to final format (without velocity)
  const finalPositions = new Map<string, { x: number; y: number }>();
  positions.forEach((pos, id) => {
    finalPositions.set(id, { x: pos.x, y: pos.y });
  });

  return finalPositions;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<LayoutMessage>) => {
  const { type, nodes, connections, width, height, iterations } = event.data;

  if (type === 'calculate') {
    try {
      const positions = calculateForceDirectedLayout(
        nodes,
        connections,
        width,
        height,
        iterations || 100
      );

      // Convert Map to object for postMessage
      const positionsObj: Record<string, { x: number; y: number }> = {};
      positions.forEach((pos, id) => {
        positionsObj[id] = pos;
      });

      self.postMessage({
        type: 'complete',
        positions: positionsObj,
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: String(error),
      });
    }
  }
};

export {};
