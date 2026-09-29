import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Header from './components/Header';
import NetworkConfig from './components/NetworkConfig';
import TopologyCanvas from './components/TopologyCanvas';
import RouteAnalysis from './components/RouteAnalysis';
import BottomTables from './components/BottomTables';
import LinkInspectorModal from './components/LinkInspectorModal';

const API_BASE = '/api';

export default function App() {
  // Network graph state
  const [presetId, setPresetId] = useState('lab_core_6');
  const [availablePresets, setAvailablePresets] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // Routing parameters
  const [source, setSource] = useState('N1');
  const [destination, setDestination] = useState('N6');
  const [weights, setWeights] = useState({
    distance: 0.30,
    delay: 0.30,
    congestion: 0.25,
    cost: 0.15
  });

  // Calculation results
  const [routingResult, setRoutingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastApiResponse, setLastApiResponse] = useState(null);

  // Inspector state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Packet simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [packetTrace, setPacketTrace] = useState(null);
  const [simPacketState, setSimPacketState] = useState(null);
  const animFrameRef = useRef(null);

  // Dynamic simulation logs
  const [simulationLogs, setSimulationLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setSimulationLogs((prev) => [{ timestamp: ts, message, type }, ...prev.slice(0, 99)]);
  };

  // 1. Fetch initial network topology
  const fetchTopology = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/network`);
      if (!res.ok) throw new Error('Failed to fetch network topology');
      const data = await res.json();
      setNodes(data.topology.nodes || []);
      setEdges(data.topology.edges || []);
      setPresetId(data.preset_id || 'lab_core_6');
      setAvailablePresets(data.available_presets || []);

      // Default endpoints
      if (data.topology.nodes && data.topology.nodes.length >= 2) {
        const first = data.topology.nodes[0].id;
        const last = data.topology.nodes[data.topology.nodes.length - 1].id;
        setSource(first);
        setDestination(last);
      }

      addLog(`Network graph loaded (${data.topology.nodes?.length} routers, ${data.topology.edges?.length} links)`, 'info');
      return data.topology;
    } catch (err) {
      console.error(err);
      setError(err.message);
      addLog(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Compute routes
  const handleComputeRoute = async (src = source, dst = destination, w = weights) => {
    if (!src || !dst || src === dst) {
      addLog('Source and destination must be distinct routers', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      addLog(`Initiating route computation from ${src} to ${dst}`, 'calc');

      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: src,
          destination: dst,
          weights: w
        })
      });
      const t1 = performance.now();

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Routing calculation failed');
      }

      const data = await res.json();
      setRoutingResult(data);
      setLastApiResponse({
        status: `${res.status} OK`,
        timestamp: new Date().toLocaleTimeString(),
        durationMs: Math.max(1, Math.round(t1 - t0))
      });

      addLog(`Dijkstra shortest path: ${data.dijkstra.path.join(' -> ')} (Distance: ${data.dijkstra.total_distance} km)`, 'info');
      addLog(`Intelligent QoS path: ${data.intelligent.path.join(' -> ')} (Composite Cost: ${data.intelligent.total_composite_cost})`, 'calc');
      
      if (data.analysis.is_same_path) {
        addLog('Both algorithms converged to the same path under current metrics', 'info');
      } else {
        addLog(`Intelligent routing rerouted traffic via ${data.intelligent.path.join(' -> ')} to avoid congestion`, 'calc');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      addLog(`Routing error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load topology on mount and run initial routing
  useEffect(() => {
    const init = async () => {
      const top = await fetchTopology();
      if (top && top.nodes && top.nodes.length >= 2) {
        const first = top.nodes[0].id;
        const last = top.nodes[top.nodes.length - 1].id;
        handleComputeRoute(first, last, weights);
      }
    };
    init();
  }, []);

  // 3. Preset change
  const handleSelectPreset = async (newPresetId) => {
    try {
      setLoading(true);
      addLog(`Loading topology preset '${newPresetId}'...`, 'info');
      const res = await fetch(`${API_BASE}/network/preset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_id: newPresetId })
      });
      if (!res.ok) throw new Error('Failed to load preset');
      const data = await res.json();
      setPresetId(data.preset_id);
      setNodes(data.topology.nodes || []);
      setEdges(data.topology.edges || []);

      const first = data.topology.nodes[0].id;
      const last = data.topology.nodes[data.topology.nodes.length - 1].id;
      setSource(first);
      setDestination(last);
      setSelectedNode(null);
      setSelectedEdge(null);
      setPacketTrace(null);
      setIsSimulating(false);

      addLog(`Topology preset '${newPresetId}' successfully activated`, 'info');
      handleComputeRoute(first, last, weights);
    } catch (err) {
      addLog(`Preset error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Edge parameters
  const handleUpdateEdge = async (edgeData) => {
    try {
      const res = await fetch(`${API_BASE}/network/edge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edgeData)
      });
      if (!res.ok) throw new Error('Failed to update edge');
      const data = await res.json();
      setEdges(data.topology.edges);
      addLog(`Link ${edgeData.source || edgeData.edge_id} metrics updated (Congestion: ${edgeData.congestion}%)`, 'calc');
      handleComputeRoute(source, destination, weights);
    } catch (err) {
      addLog(`Edge update error: ${err.message}`, 'error');
    }
  };

  // 5. Dynamic Condition Injections
  const handleInjectBottleneck = () => {
    const targetEdge = edges.find((e) => e.id === 'N2-N4' || e.id === 'R2-R4' || e.id === 'N1-N2') || edges[0];
    if (targetEdge) {
      handleUpdateEdge({
        edge_id: targetEdge.id,
        source: targetEdge.source,
        target: targetEdge.target,
        congestion: 85.0,
        delay: 24.0
      });
      addLog(`TRAFFIC INJECTION: Link ${targetEdge.source}-${targetEdge.target} congestion surged to 85%`, 'calc');
    }
  };

  const handleClearCongestion = () => {
    edges.forEach((e) => {
      handleUpdateEdge({
        edge_id: e.id,
        source: e.source,
        target: e.target,
        congestion: 12.0
      });
    });
    addLog('NETWORK RECOVERY: Traffic congestion cleared across all communication links', 'info');
  };

  const handleRandomizeTraffic = () => {
    edges.forEach((e) => {
      const randCong = Math.floor(Math.random() * 75) + 10;
      handleUpdateEdge({
        edge_id: e.id,
        source: e.source,
        target: e.target,
        congestion: randCong
      });
    });
    addLog('LIVE TRAFFIC: Fluctuating realistic packet queue loads across the network', 'calc');
  };

  // 1-Click Divergence Demo trigger for live presentation
  const handleTriggerDivergenceDemo = async () => {
    const targetEdge = edges.find((e) => e.id === 'N2-N4' || e.id === 'R2-R4' || e.id === 'N1-N2') || edges[0];
    if (targetEdge) {
      await fetch(`${API_BASE}/network/edge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edge_id: targetEdge.id,
          source: targetEdge.source,
          target: targetEdge.target,
          congestion: 85.0,
          delay: 24.0
        })
      });
      setEdges((prev) =>
        prev.map((e) =>
          e.id === targetEdge.id ? { ...e, congestion: 85.0, delay: 24.0 } : e
        )
      );
    }

    const divergenceWeights = { distance: 0.15, delay: 0.20, congestion: 0.55, cost: 0.10 };
    setWeights(divergenceWeights);
    addLog('DIVERGENCE TRIGGERED: Applied 85% bottleneck on N2-N4 and Congestion-Sensitive QoS profile', 'calc');
    await handleComputeRoute(source, destination, divergenceWeights);
  };

  // 6. Add Node & Edge
  const handleAddNode = async (nodeData) => {
    try {
      const res = await fetch(`${API_BASE}/network/node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData)
      });
      if (!res.ok) throw new Error('Failed to add node');
      const data = await res.json();
      setNodes(data.topology.nodes);
      addLog(`New Router ${nodeData.id} integrated into topology`, 'info');
    } catch (err) {
      addLog(`Add node error: ${err.message}`, 'error');
    }
  };

  const handleAddEdge = async (edgeData) => {
    try {
      const res = await fetch(`${API_BASE}/network/add-edge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edgeData)
      });
      if (!res.ok) throw new Error('Failed to add edge');
      const data = await res.json();
      setEdges(data.topology.edges);
      addLog(`New link ${edgeData.source} <-> ${edgeData.target} established`, 'info');
      handleComputeRoute(source, destination, weights);
    } catch (err) {
      addLog(`Add edge error: ${err.message}`, 'error');
    }
  };

  // 7. Simulated Packet Flow
  const handleRunPacketSimulation = async () => {
    if (!routingResult || !routingResult.intelligent || !routingResult.intelligent.path) {
      addLog('Cannot simulate: No calculated path available', 'error');
      return;
    }

    const path = routingResult.intelligent.path;
    const packetId = `PKT-${Math.floor(Math.random() * 900) + 100}`;

    try {
      addLog(`SIMULATION: Dispatching ${packetId} along path ${path.join(' -> ')}`, 'info');
      const res = await fetch(`${API_BASE}/simulate/packet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, packet_id: packetId })
      });
      if (!res.ok) throw new Error('Packet simulation call failed');
      const trace = await res.json();
      setPacketTrace(trace);
      setIsSimulating(true);

      // Execute smooth animation through the hops
      let currentHopIndex = 0;
      let progress = 0;
      const hops = trace.hops;

      const animateHop = () => {
        if (currentHopIndex >= hops.length) {
          setIsSimulating(false);
          setSimPacketState(null);
          addLog(`SIMULATION: ${packetId} successfully delivered at egress router ${destination} (Total delay: ${trace.total_time_ms} ms)`, 'info');
          return;
        }

        const hop = hops[currentHopIndex];
        progress += 0.035; // speed step

        if (progress >= 1.0) {
          currentHopIndex += 1;
          progress = 0;
        }

        if (currentHopIndex < hops.length) {
          const activeHop = hops[currentHopIndex];
          setSimPacketState({
            packetId,
            hopIndex: currentHopIndex,
            totalHops: hops.length,
            fromNodeId: activeHop.current_node,
            toNodeId: activeHop.next_hop,
            progress,
            currentHop: activeHop,
            currentHopLatency: activeHop.hop_latency_ms
          });
          animFrameRef.current = requestAnimationFrame(animateHop);
        } else {
          setIsSimulating(false);
          setSimPacketState(null);
          addLog(`SIMULATION: ${packetId} delivered at ${destination}`, 'info');
        }
      };

      if (hops.length > 0) {
        animFrameRef.current = requestAnimationFrame(animateHop);
      }
    } catch (err) {
      addLog(`Simulation error: ${err.message}`, 'error');
      setIsSimulating(false);
    }
  };

  const handlePauseSimulation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsSimulating(false);
    addLog('Packet transmission paused', 'info');
  };

  const handleResetSimulation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsSimulating(false);
    setSimPacketState(null);
    addLog('Packet transmission simulation reset', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Editorial Header */}
      <Header
        presetId={presetId}
        onSelectPreset={handleSelectPreset}
        availablePresets={availablePresets}
        nodesCount={nodes.length}
        edgesCount={edges.length}
        loading={loading}
        lastApiResponse={lastApiResponse}
        onResetNetwork={() => handleSelectPreset(presetId)}
      />

      {/* 2. Main Lab Workspace */}
      <main style={{
        flex: 1,
        maxWidth: '1800px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Error notification banner (No emojis) */}
        {error && (
          <div style={{
            backgroundColor: '#FAF0ED',
            border: '1px solid #E8B4AC',
            color: 'var(--color-congested)',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <AlertTriangle size={15} />
              <span>{error}</span>
            </span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 700, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3-Column Core Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr 340px',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* LEFT: Network Configuration & Metrics */}
          <NetworkConfig
            nodes={nodes}
            edges={edges}
            source={source}
            setSource={(src) => {
              setSource(src);
              handleComputeRoute(src, destination, weights);
            }}
            destination={destination}
            setDestination={(dst) => {
              setDestination(dst);
              handleComputeRoute(source, dst, weights);
            }}
            weights={weights}
            setWeights={setWeights}
            onComputeRoute={handleComputeRoute}
            onInjectBottleneck={handleInjectBottleneck}
            onClearCongestion={handleClearCongestion}
            onRandomizeTraffic={handleRandomizeTraffic}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
            loading={loading}
            lastApiResponse={lastApiResponse}
          />

          {/* CENTER: Interactive Network Topology Graph */}
          <TopologyCanvas
            nodes={nodes}
            edges={edges}
            source={source}
            destination={destination}
            dijkstraPath={routingResult?.dijkstra?.path || []}
            intelligentPath={routingResult?.intelligent?.path || []}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onSelectEdge={(edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            simPacketState={simPacketState}
            isSimulating={isSimulating}
          />

          {/* RIGHT: Routing Analysis & Comparison */}
          <RouteAnalysis
            routingResult={routingResult}
            onRunPacketSimulation={handleRunPacketSimulation}
            isSimulating={isSimulating}
            onPauseSimulation={handlePauseSimulation}
            onResetSimulation={handleResetSimulation}
            simPacketState={simPacketState}
            onTriggerDivergenceDemo={handleTriggerDivergenceDemo}
          />
        </div>

        {/* 3. Bottom Layer: Tables, Traces & Logs */}
        <BottomTables
          source={source}
          routingTable={routingResult?.routing_table || []}
          packetTrace={packetTrace}
          linksEvaluated={routingResult?.links_evaluated || []}
          edges={edges}
          weights={weights}
          simulationLogs={simulationLogs}
          onComputeRoute={() => handleComputeRoute(source, destination, weights)}
        />
      </main>

      {/* 4. Node / Edge Inspector Modal Drawer */}
      <LinkInspectorModal
        selectedItem={selectedNode || selectedEdge}
        itemType={selectedNode ? 'node' : (selectedEdge ? 'edge' : null)}
        onClose={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        onUpdateEdge={handleUpdateEdge}
        allEdges={edges}
        allNodes={nodes}
      />
    </div>
  );
}
