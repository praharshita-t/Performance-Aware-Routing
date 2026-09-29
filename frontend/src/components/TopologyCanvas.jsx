import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Radio, 
  Layers, 
  Activity,
  Zap,
  Clock,
  Gauge
} from 'lucide-react';

export default function TopologyCanvas({
  nodes = [],
  edges = [],
  source,
  destination,
  dijkstraPath = [],
  intelligentPath = [],
  onSelectNode,
  onSelectEdge,
  selectedNode,
  selectedEdge,
  simPacketState,
  isSimulating
}) {
  const [showLabels, setShowLabels] = useState(true);
  const [showDijkstra, setShowDijkstra] = useState(true);
  const [showIntelligent, setShowIntelligent] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Quick lookup map for nodes
  const nodeMap = React.useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      map[n.id] = n;
    });
    return map;
  }, [nodes]);

  // Helper: check if an edge is in a given path
  const isEdgeInPath = (src, tgt, path) => {
    if (!path || path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === src && path[i + 1] === tgt) ||
        (path[i] === tgt && path[i + 1] === src)
      ) {
        return true;
      }
    }
    return false;
  };

  // Helper: get congestion color
  const getCongestionColor = (cong) => {
    if (cong > 70) return '#B94636'; // Congested red
    if (cong > 30) return '#C57D2C'; // Moderate amber
    return '#A99691'; // Normal neutral taupe
  };

  // Calculate packet position if simulating
  let packetCoord = null;
  if (isSimulating && simPacketState && simPacketState.currentHop) {
    const { fromNodeId, toNodeId, progress } = simPacketState;
    const fromNode = nodeMap[fromNodeId];
    const toNode = nodeMap[toNodeId];
    if (fromNode && toNode) {
      const p = Math.max(0, Math.min(1, progress || 0));
      packetCoord = {
        x: fromNode.x + (toNode.x - fromNode.x) * p,
        y: fromNode.y + (toNode.y - fromNode.y) * p,
        from: fromNodeId,
        to: toNodeId,
        pktId: simPacketState.packetId || 'PKT-101'
      };
    }
  }

  return (
    <div style={{
      backgroundColor: '#FAF8F3',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 4px rgba(23, 21, 21, 0.03)'
    }}>
      {/* Topology Toolbar */}
      <div style={{
        padding: '0.65rem 1rem',
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: '#F3EDE4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={16} style={{ color: 'var(--color-rose-taupe)' }} />
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontWeight: 600, 
            fontSize: '1rem',
            color: 'var(--color-near-black)'
          }}>
            Interactive Network Topology
          </span>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '0.15rem 0.4rem',
            borderRadius: '3px',
            color: 'var(--color-muted-taupe)'
          }}>
            L2/L3 Physical & Logical Graph
          </span>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Path Filters */}
          <button
            onClick={() => setShowDijkstra(!showDijkstra)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: showDijkstra ? 'var(--color-dijkstra-bg)' : '#FFF',
              border: `1px solid ${showDijkstra ? 'var(--color-dijkstra)' : 'var(--color-border-subtle)'}`,
              color: showDijkstra ? 'var(--color-dijkstra)' : 'var(--color-muted-taupe)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-dijkstra)' }} />
            <span>Dijkstra Path</span>
          </button>

          <button
            onClick={() => setShowIntelligent(!showIntelligent)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: showIntelligent ? 'var(--color-intelligent-bg)' : '#FFF',
              border: `1px solid ${showIntelligent ? 'var(--color-intelligent)' : 'var(--color-border-subtle)'}`,
              color: showIntelligent ? 'var(--color-intelligent)' : 'var(--color-muted-taupe)'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-intelligent)' }} />
            <span>Intelligent Path</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              backgroundColor: '#FFF',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-near-black)'
            }}
          >
            {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>Metrics</span>
          </button>
        </div>
      </div>

      {/* Live In-Transit Simulation Banner */}
      {isSimulating && packetCoord && (
        <div style={{
          position: 'absolute',
          top: '3.2rem',
          left: '1rem',
          zIndex: 10,
          backgroundColor: 'rgba(23, 21, 21, 0.88)',
          color: '#FFF',
          padding: '0.4rem 0.8rem',
          borderRadius: '4px',
          fontSize: '0.76rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <span style={{ 
            color: 'var(--color-vanilla)', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem' 
          }}>
            <Activity size={13} className="packet-marker" />
            SIMULATED PACKET TRANSMISSION
          </span>
          <span>
            {packetCoord.pktId}: {packetCoord.from} → {packetCoord.to}
          </span>
          <span style={{ color: 'var(--color-vanilla)' }}>
            Hop {simPacketState.hopIndex + 1}/{simPacketState.totalHops}
          </span>
          <span style={{ color: 'var(--color-taupe-border)' }}>
            Delay: {simPacketState.currentHopLatency}ms
          </span>
        </div>
      )}

      {/* SVG Canvas */}
      <div style={{ 
        width: '100%', 
        height: '490px', 
        overflow: 'hidden', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #FAF8F3 0%, #F3ECE1 100%)'
      }}>
        <svg
          viewBox="40 40 820 440"
          style={{
            width: '100%',
            height: '100%',
            userSelect: 'none'
          }}
        >
          {/* Subtle Network Grid Pattern */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.8" fill="#D6CBC4" opacity="0.6" />
            </pattern>
            {/* Markers for Arrows */}
            <marker
              id="arrow-dijkstra"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-dijkstra)" />
            </marker>
            <marker
              id="arrow-intelligent"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-intelligent)" />
            </marker>
          </defs>

          <rect x="0" y="0" width="1000" height="600" fill="url(#grid)" />

          {/* 1. Base Communication Links (Edges) */}
          {edges.map((edge) => {
            const srcNode = nodeMap[edge.source];
            const tgtNode = nodeMap[edge.target];
            if (!srcNode || !tgtNode) return null;

            const isSelected = selectedEdge && selectedEdge.id === edge.id;
            const inDijkstra = showDijkstra && isEdgeInPath(edge.source, edge.target, dijkstraPath);
            const inIntelligent = showIntelligent && isEdgeInPath(edge.source, edge.target, intelligentPath);
            const congColor = getCongestionColor(edge.congestion);

            // Compute center of edge for metric badge
            const midX = (srcNode.x + tgtNode.x) / 2;
            const midY = (srcNode.y + tgtNode.y) / 2;

            // Stroke width according to bandwidth
            const baseStrokeWidth = Math.max(2.5, Math.min(6, (edge.bandwidth || 1000) / 400));

            return (
              <g key={edge.id} onClick={() => onSelectEdge(edge)} style={{ cursor: 'pointer' }}>
                {/* Hit area for clicking edge */}
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Base physical communication link */}
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={congColor}
                  strokeWidth={baseStrokeWidth}
                  strokeOpacity={isSelected ? 1.0 : 0.65}
                  strokeDasharray={edge.congestion > 70 ? '6 3' : 'none'}
                />

                {/* Dijkstra Path Highlight (Muted Blue) */}
                {inDijkstra && (
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="var(--color-dijkstra)"
                    strokeWidth={baseStrokeWidth + 4}
                    strokeOpacity="0.8"
                    strokeLinecap="round"
                  />
                )}

                {/* Intelligent Path Highlight (Muted Green, slightly thinner so overlapping shows both) */}
                {inIntelligent && (
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="var(--color-intelligent)"
                    strokeWidth={inDijkstra ? baseStrokeWidth + 1.5 : baseStrokeWidth + 4}
                    strokeOpacity="0.95"
                    strokeDasharray={inDijkstra ? '8 4' : 'none'}
                    className={isSimulating ? 'active-flow-path' : ''}
                    strokeLinecap="round"
                  />
                )}

                {/* Selected link halo indicator */}
                {isSelected && (
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="var(--color-rose-taupe)"
                    strokeWidth={baseStrokeWidth + 6}
                    strokeOpacity="0.4"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Link Metric Badge */}
                {showLabels && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="4"
                      fill={edge.congestion > 70 ? '#FAECE9' : '#FFFFFF'}
                      stroke={edge.congestion > 70 ? '#E8B4AC' : 'var(--color-taupe-border)'}
                      strokeWidth="1"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                    />
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill="var(--color-near-black)"
                    >
                      {edge.distance}km • {edge.delay}ms
                    </text>
                    <text
                      x="0"
                      y="8"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      fill={congColor}
                    >
                      {edge.congestion}% load
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. In-Transit Packet Marker Animation */}
          {packetCoord && (
            <g transform={`translate(${packetCoord.x}, ${packetCoord.y})`}>
              <circle r="14" fill="var(--color-vanilla)" opacity="0.6" className="packet-marker" />
              <circle r="7" fill="var(--color-rose-taupe)" stroke="#FFF" strokeWidth="2" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill="#FFF"
                filter="drop-shadow(0 1px 3px rgba(0,0,0,0.7))"
              >
                {packetCoord.pktId}
              </text>
            </g>
          )}

          {/* 3. Router Nodes */}
          {nodes.map((node) => {
            const isSource = node.id === source;
            const isDest = node.id === destination;
            const isSelected = selectedNode && selectedNode.id === node.id;
            const inDijkstra = dijkstraPath.includes(node.id);
            const inIntelligent = intelligentPath.includes(node.id);

            let nodeFill = '#FFFFFF';
            let strokeColor = 'var(--color-taupe-border)';
            let strokeWidth = 2.5;

            if (isSource) {
              nodeFill = 'var(--color-vanilla)';
              strokeColor = 'var(--color-rose-taupe)';
              strokeWidth = 3.5;
            } else if (isDest) {
              nodeFill = 'var(--color-rose-taupe)';
              strokeColor = 'var(--color-vanilla)';
              strokeWidth = 3.5;
            } else if (inIntelligent && inDijkstra) {
              strokeColor = 'var(--color-intelligent)';
              strokeWidth = 2.5;
            } else if (inIntelligent) {
              strokeColor = 'var(--color-intelligent)';
              strokeWidth = 2.5;
            } else if (inDijkstra) {
              strokeColor = 'var(--color-dijkstra)';
              strokeWidth = 2.5;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredItem(node)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer Ring for Active Endpoints */}
                {(isSource || isDest || isSelected) && (
                  <circle
                    r="26"
                    fill="none"
                    stroke={isSource ? 'var(--color-rose-taupe)' : (isDest ? 'var(--color-vanilla)' : 'var(--color-rose-taupe)')}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  />
                )}

                {/* Router Base Circle */}
                <circle
                  r="20"
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter="drop-shadow(0 2px 4px rgba(23, 21, 21, 0.08))"
                />

                {/* Router Symbol (Arrows Cross) */}
                <g opacity={isDest ? 0.9 : 0.65} stroke={isDest ? '#FFF' : 'var(--color-near-black)'} strokeWidth="1.5">
                  <path d="M -7 -4 L 7 4 M 7 -4 L -7 4" />
                </g>

                {/* Router Label (e.g. N1, N2) */}
                <text
                  y="4"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  fontSize="11"
                  fill={isDest ? '#FFF' : 'var(--color-near-black)'}
                >
                  {node.id}
                </text>

                {/* Sub-label (IP and Role) */}
                <text
                  y="32"
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                  fontSize="10"
                  fill="var(--color-near-black)"
                >
                  {node.label.split('(')[0].trim()}
                </text>
                <text
                  y="43"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="8.5"
                  fill="var(--color-muted-taupe)"
                >
                  {node.ip || '10.0.x.1'}
                </text>

                {/* Endpoint Badge */}
                {isSource && (
                  <g transform="translate(0, -28)">
                    <rect x="-24" y="-8" width="48" height="15" rx="3" fill="var(--color-vanilla)" stroke="var(--color-rose-taupe)" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--color-near-black)">
                      INGRESS
                    </text>
                  </g>
                )}

                {isDest && (
                  <g transform="translate(0, -28)">
                    <rect x="-24" y="-8" width="48" height="15" rx="3" fill="var(--color-rose-taupe)" stroke="var(--color-vanilla)" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#FFF">
                      EGRESS
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <div style={{
        padding: '0.65rem 1.25rem',
        borderTop: '1px solid var(--color-border-subtle)',
        backgroundColor: '#F7F4EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '14px', height: '4px', backgroundColor: 'var(--color-dijkstra)', borderRadius: '2px' }} />
            <span style={{ fontWeight: 600, color: 'var(--color-dijkstra)' }}>Dijkstra (Shortest Dist)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '14px', height: '4px', backgroundColor: 'var(--color-intelligent)', borderRadius: '2px' }} />
            <span style={{ fontWeight: 600, color: 'var(--color-intelligent)' }}>Intelligent (Composite QoS)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '14px', height: '3px', backgroundColor: '#B94636', borderBottom: '1px dashed #B94636' }} />
            <span style={{ color: 'var(--color-congested)', fontWeight: 500 }}>Congested Link (&gt;70%)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-vanilla)', border: '1px solid var(--color-rose-taupe)' }} />
            <span style={{ fontWeight: 500 }}>Source Router</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-rose-taupe)', border: '1px solid var(--color-vanilla)' }} />
            <span style={{ fontWeight: 500 }}>Destination Router</span>
          </div>
        </div>

        <div style={{ color: 'var(--color-muted-taupe)', fontStyle: 'italic', fontSize: '0.72rem' }}>
          *Click any router node or communication link to inspect telemetry & live parameters
        </div>
      </div>
    </div>
  );
}
