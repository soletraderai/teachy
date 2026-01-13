import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useAuthStore } from '../stores/authStore';

const API_BASE = 'http://localhost:3001/api';

// Convert mastery level string to numeric value for sizing/coloring
const masteryToNumber = (mastery: string): number => {
  switch (mastery) {
    case 'MASTERED': return 5;
    case 'PROFICIENT': return 4;
    case 'DEVELOPING': return 3;
    case 'INTRODUCED': return 2;
    case 'NOT_STARTED': return 1;
    default: return 1;
  }
};

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

interface KnowledgeMapData {
  nodes: MapNode[];
  connections: MapConnection[];
  categories: string[];
  totalTopics: number;
}

// Optimized node rendering with pre-calculated values
interface RenderNode extends MapNode {
  radius: number;
  hue: number;
}

export default function KnowledgeMap() {
  const { user, isAuthenticated } = useAuthStore();
  const isPro = isAuthenticated() && user?.tier === 'PRO';

  const [data, setData] = useState<KnowledgeMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutProgress, setLayoutProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const workerRef = useRef<Worker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Pre-calculate render nodes for better performance
  const renderNodes = useMemo<RenderNode[]>(() => {
    if (!data) return [];
    return data.nodes.map(node => ({
      ...node,
      radius: 20 + (masteryToNumber(node.masteryLevel) * 4),
      hue: Math.min(120, masteryToNumber(node.masteryLevel) * 24),
    }));
  }, [data]);

  // Filter nodes based on category
  const filteredNodes = useMemo(() => {
    if (!selectedCategory) return renderNodes;
    return renderNodes.filter(node => node.category === selectedCategory);
  }, [renderNodes, selectedCategory]);

  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  // Initialize Web Worker
  useEffect(() => {
    // Create worker from blob to avoid build configuration issues
    const workerCode = `
      // Force-directed layout algorithm
      function calculateForceDirectedLayout(nodes, connections, width, height, iterations) {
        const positions = new Map();
        const centerX = width / 2;
        const centerY = height / 2;

        // Initialize positions - group by category in a circle
        const categoryGroups = new Map();
        nodes.forEach(node => {
          const category = node.category || 'Uncategorized';
          if (!categoryGroups.has(category)) {
            categoryGroups.set(category, []);
          }
          categoryGroups.get(category).push(node);
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

        // Force simulation parameters
        const repulsionStrength = 500;
        const attractionStrength = 0.1;
        const dampening = 0.9;
        const minDistance = 60;

        // Run simulation
        for (let iter = 0; iter < iterations; iter++) {
          const alpha = 1 - iter / iterations;

          // Apply repulsion between all nodes
          for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];
            const posA = positions.get(nodeA.id);

            for (let j = i + 1; j < nodes.length; j++) {
              const nodeB = nodes[j];
              const posB = positions.get(nodeB.id);

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
            }
          }

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
            const padding = 50;
            pos.x = Math.max(padding, Math.min(width - padding, pos.x));
            pos.y = Math.max(padding, Math.min(height - padding, pos.y));
          });

          if (iter % 20 === 0) {
            self.postMessage({ type: 'progress', progress: Math.round((iter / iterations) * 100) });
          }
        }

        const finalPositions = {};
        positions.forEach((pos, id) => {
          finalPositions[id] = { x: pos.x, y: pos.y };
        });
        return finalPositions;
      }

      self.onmessage = (event) => {
        const { type, nodes, connections, width, height, iterations } = event.data;
        if (type === 'calculate') {
          try {
            const positions = calculateForceDirectedLayout(nodes, connections, width, height, iterations || 100);
            self.postMessage({ type: 'complete', positions });
          } catch (error) {
            self.postMessage({ type: 'error', error: String(error) });
          }
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (event) => {
      const { type, positions, progress } = event.data;
      if (type === 'progress') {
        setLayoutProgress(progress);
      } else if (type === 'complete') {
        const posMap = new Map<string, { x: number; y: number }>();
        Object.entries(positions).forEach(([id, pos]) => {
          posMap.set(id, pos as { x: number; y: number });
        });
        setNodePositions(posMap);
        setLayoutProgress(100);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // Fetch knowledge map data
  useEffect(() => {
    const fetchData = async () => {
      if (!isPro) {
        setLoading(false);
        return;
      }

      try {
        const { accessToken } = useAuthStore.getState();
        const response = await fetch(`${API_BASE}/knowledge-map`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch knowledge map');
        }

        const mapData = await response.json();
        setData(mapData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load knowledge map');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isPro]);

  // Calculate positions using Web Worker
  useEffect(() => {
    if (!data || !canvasRef.current || !workerRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = 500;

    // Use fallback calculation if nodes are few, otherwise use worker
    if (data.nodes.length < 50) {
      // Simple circular layout for small datasets
      const positions = new Map<string, { x: number; y: number }>();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      data.nodes.forEach((node, i) => {
        const angle = (i / data.nodes.length) * Math.PI * 2;
        positions.set(node.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      });
      setNodePositions(positions);
    } else {
      // Use Web Worker for large datasets
      workerRef.current.postMessage({
        type: 'calculate',
        nodes: data.nodes,
        connections: data.connections,
        width: canvas.width,
        height: canvas.height,
        iterations: Math.min(150, 50 + data.nodes.length),
      });
    }
  }, [data]);

  // Optimized drawing using requestAnimationFrame
  const drawMap = useCallback(() => {
    if (!data || !canvasRef.current || nodePositions.size === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Clear with background color (faster than clearRect for opaque backgrounds)
    ctx.fillStyle = '#FFFEF5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw connections (batch drawing for performance)
    ctx.beginPath();
    data.connections.forEach(conn => {
      if (!filteredNodeIds.has(conn.source) || !filteredNodeIds.has(conn.target)) return;

      const source = nodePositions.get(conn.source);
      const target = nodePositions.get(conn.target);
      if (!source || !target) return;

      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
    });
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1 / zoom;
    ctx.stroke();

    // Draw nodes (batch by color for performance)
    const nodesByColor = new Map<string, RenderNode[]>();
    filteredNodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode?.id === node.id;
      const isSearchResult = searchResults.includes(node.id);

      let color: string;
      if (isSearchResult) {
        color = '#FF6B6B';
      } else if (isSelected) {
        color = '#FFDE59';
      } else if (isHovered) {
        color = `hsl(${node.hue}, 70%, 60%)`;
      } else {
        color = `hsl(${node.hue}, 60%, 70%)`;
      }

      if (!nodesByColor.has(color)) {
        nodesByColor.set(color, []);
      }
      nodesByColor.get(color)!.push(node);
    });

    // Draw nodes by color groups
    nodesByColor.forEach((nodes, color) => {
      ctx.fillStyle = color;
      nodes.forEach(node => {
        const pos = nodePositions.get(node.id);
        if (!pos) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw borders and labels (separate pass)
    filteredNodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode?.id === node.id;
      const isSearchResult = searchResults.includes(node.id);

      // Border
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, node.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isSearchResult ? '#FF0000' : '#000';
      ctx.lineWidth = (isSelected || isHovered || isSearchResult ? 3 : 2) / zoom;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#000';
      ctx.font = `${isSelected || isHovered ? 'bold ' : ''}${Math.max(10, 12 / zoom)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxLength = 15;
      const displayName = node.name.length > maxLength
        ? node.name.substring(0, maxLength) + '...'
        : node.name;
      ctx.fillText(displayName, pos.x, pos.y + node.radius + 15);
    });

    ctx.restore();
  }, [data, nodePositions, hoveredNode, selectedNode, zoom, panOffset, filteredNodes, filteredNodeIds, searchResults]);

  // Animate with requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      drawMap();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Only start animation loop when needed (during pan/zoom interactions)
    if (isPanning) {
      animate();
    } else {
      drawMap();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawMap, isPanning]);

  // Redraw when state changes (but not during panning - that uses rAF)
  useEffect(() => {
    if (!isPanning) {
      drawMap();
    }
  }, [drawMap, isPanning]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - panOffset.x) / zoom,
      y: (screenY - panOffset.y) / zoom,
    };
  }, [panOffset, zoom]);

  // Find node at position (optimized with spatial check)
  const findNodeAtPosition = useCallback((x: number, y: number): MapNode | null => {
    for (const node of filteredNodes) {
      const pos = nodePositions.get(node.id);
      if (!pos) continue;

      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= node.radius) {
        return node;
      }
    }
    return null;
  }, [filteredNodes, nodePositions]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data || isPanning) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);

    const node = findNodeAtPosition(x, y);
    setSelectedNode(node && selectedNode?.id === node.id ? null : node);
  }, [data, isPanning, screenToCanvas, findNodeAtPosition, selectedNode]);

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle panning
    if (isPanning) {
      const dx = screenX - panStart.x;
      const dy = screenY - panStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: screenX, y: screenY });
      return;
    }

    const { x, y } = screenToCanvas(screenX, screenY);
    const node = findNodeAtPosition(x, y);

    if (node?.id !== hoveredNode) {
      setHoveredNode(node?.id || null);
    }
  }, [data, isPanning, panStart, screenToCanvas, findNodeAtPosition, hoveredNode]);

  // Handle mouse down for panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setPanStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsPanning(true);
    }
  }, []);

  // Handle mouse up
  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel for zooming
  const handleCanvasWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor));

    const zoomRatio = newZoom / zoom;
    setPanOffset(prev => ({
      x: mouseX - (mouseX - prev.x) * zoomRatio,
      y: mouseY - (mouseY - prev.y) * zoomRatio,
    }));

    setZoom(newZoom);
  }, [zoom]);

  // Reset zoom and pan
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!data || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const matches = data.nodes
      .filter(node => node.name.toLowerCase().includes(lowerQuery))
      .map(node => node.id);
    setSearchResults(matches);

    if (matches.length === 1) {
      const matchId = matches[0];
      const pos = nodePositions.get(matchId);
      if (pos && canvasRef.current) {
        const canvas = canvasRef.current;
        setPanOffset({
          x: canvas.width / 2 - pos.x * zoom,
          y: canvas.height / 2 - pos.y * zoom,
        });
        setSelectedNode(data.nodes.find(n => n.id === matchId) || null);
      }
    }
  }, [data, nodePositions, zoom]);

  // Go to specific search result
  const goToSearchResult = useCallback((nodeId: string) => {
    const pos = nodePositions.get(nodeId);
    if (pos && canvasRef.current && data) {
      const canvas = canvasRef.current;
      setPanOffset({
        x: canvas.width / 2 - pos.x * zoom,
        y: canvas.height / 2 - pos.y * zoom,
      });
      setSelectedNode(data.nodes.find(n => n.id === nodeId) || null);
    }
  }, [nodePositions, zoom, data]);

  // Export map as image
  const handleExportImage = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-map-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: 'Knowledge map exported!', type: 'success' });
    }, 'image/png');
  }, []);

  // Non-Pro state
  if (!isPro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-text">Knowledge Map</h1>
        </div>

        <Card className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 border-3 border-border flex items-center justify-center">
            <svg className="w-10 h-10 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-text mb-2">Pro Feature</h2>
          <p className="text-text/70 mb-6 max-w-md mx-auto">
            The Knowledge Map visualization is a Pro feature. Upgrade to visualize how your topics connect and see your learning journey unfold.
          </p>
          <Link to="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-text">Knowledge Map</h1>
        <Card className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-3 border-border border-t-primary animate-spin mb-4" />
            {layoutProgress > 0 && layoutProgress < 100 && (
              <p className="text-text/70">Calculating layout... {layoutProgress}%</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-text">Knowledge Map</h1>
        <Card className="text-center py-12">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!data || data.nodes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold text-text">Knowledge Map</h1>
        <Card className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface border-3 border-border flex items-center justify-center">
            <svg className="w-10 h-10 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-text mb-2">No Topics Yet</h2>
          <p className="text-text/70 mb-6">
            Complete some learning sessions to start building your knowledge map!
          </p>
          <Link to="/">
            <Button>Start Learning</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text">Knowledge Map</h1>
          <p className="text-text/70 mt-1">
            Visualize how your {data.totalTopics} topics connect across {data.categories.length} categories
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search topics..."
            className="pl-10 pr-4 py-2 border-3 border-border bg-background text-text placeholder:text-text/40 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border-3 border-border shadow-lg max-h-48 overflow-y-auto z-10">
              {searchResults.map(nodeId => {
                const node = data.nodes.find(n => n.id === nodeId);
                if (!node) return null;
                return (
                  <button
                    key={nodeId}
                    onClick={() => {
                      goToSearchResult(nodeId);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-primary/20 text-sm text-text border-b border-border last:border-b-0"
                  >
                    {node.name}
                    {node.category && (
                      <span className="ml-2 text-xs text-text/60">({node.category})</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border-3 border-border shadow-lg p-3 text-sm text-text/60 z-10">
              No topics found
            </div>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-surface border-b-3 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(0,60%,70%)] border-2 border-border" />
                <span className="text-sm text-text/70">New</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(60,60%,70%)] border-2 border-border" />
                <span className="text-sm text-text/70">Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[hsl(120,60%,70%)] border-2 border-border" />
                <span className="text-sm text-text/70">Mastered</span>
              </div>
            </div>
            <span className="text-sm text-text/60">Click a node to see details</span>
          </div>
        </div>

        <div className="relative bg-background" style={{ minHeight: '500px' }}>
          <canvas
            ref={canvasRef}
            className={`w-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={() => { setHoveredNode(null); setIsPanning(false); }}
            onWheel={handleCanvasWheel}
          />
          {/* Layout progress indicator */}
          {layoutProgress > 0 && layoutProgress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto border-3 border-border border-t-primary animate-spin mb-4" />
                <p className="text-text/70">Calculating layout... {layoutProgress}%</p>
              </div>
            </div>
          )}
          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              className="p-2 bg-surface border-2 border-border hover:bg-primary/20 text-text"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <span className="px-2 py-1 bg-surface border-2 border-border text-sm font-medium text-text min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev / 1.2))}
              className="p-2 bg-surface border-2 border-border hover:bg-primary/20 text-text"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="p-2 bg-surface border-2 border-border hover:bg-primary/20 text-text"
              title="Reset view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={handleExportImage}
              className="p-2 bg-primary border-2 border-border hover:shadow-[2px_2px_0_#000] text-text"
              title="Export as image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-text">{selectedNode.name}</h3>
              <p className="text-text/70 text-sm">From: {selectedNode.sessionTitle}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-surface rounded"
            >
              <svg className="w-5 h-5 text-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-surface border-2 border-border text-center">
              <div className="text-2xl font-bold text-text">{selectedNode.masteryLevel}</div>
              <div className="text-xs text-text/60">Mastery Level</div>
            </div>
            <div className="p-3 bg-surface border-2 border-border text-center">
              <div className="text-2xl font-bold text-text">{selectedNode.reviewCount}</div>
              <div className="text-xs text-text/60">Reviews</div>
            </div>
            <div className="p-3 bg-surface border-2 border-border text-center">
              <div className="text-2xl font-bold text-text">{selectedNode.category || '-'}</div>
              <div className="text-xs text-text/60">Category</div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Link to={`/review?topicId=${selectedNode.id}`}>
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Review This Topic
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Categories Filter */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-text">Filter by Category</h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-3 py-1 border-2 border-border text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-text shadow-[2px_2px_0_#000]'
                  : 'bg-primary/20 text-text hover:bg-primary/40'
              }`}
            >
              {category}
            </button>
          ))}
          {data.categories.length === 0 && (
            <span className="text-text/60 text-sm">No categories assigned yet</span>
          )}
        </div>
        {selectedCategory && (
          <p className="mt-3 text-sm text-text/70">
            Showing topics in: <span className="font-semibold">{selectedCategory}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
