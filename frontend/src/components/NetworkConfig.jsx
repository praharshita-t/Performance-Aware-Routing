import React, { useState } from 'react';
import { 
  Sliders, 
  ArrowRightLeft, 
  Flame, 
  ShieldCheck, 
  Shuffle, 
  PlusCircle, 
  Server, 
  Zap,
  Info,
  Scale,
  Compass,
  Clock,
  Check,
  CheckCircle2
} from 'lucide-react';

export default function NetworkConfig({
  nodes,
  edges,
  source,
  setSource,
  destination,
  setDestination,
  weights,
  setWeights,
  onComputeRoute,
  onInjectBottleneck,
  onClearCongestion,
  onRandomizeTraffic,
  onAddNode,
  onAddEdge,
  loading,
  lastApiResponse
}) {
  const [showTopologyEditor, setShowTopologyEditor] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeDistance, setNewEdgeDistance] = useState('15');
  const [newEdgeCongestion, setNewEdgeCongestion] = useState('15');

  // Compute normalized display percentages
  const sumWeights = weights.distance + weights.delay + weights.congestion + weights.cost;
  const normDist = sumWeights > 0 ? Math.round((weights.distance / sumWeights) * 100) : 25;
  const normDelay = sumWeights > 0 ? Math.round((weights.delay / sumWeights) * 100) : 25;
  const normCong = sumWeights > 0 ? Math.round((weights.congestion / sumWeights) * 100) : 25;
  const normCost = 100 - (normDist + normDelay + normCong); // Ensure sums to 100

  const handleSwapNodes = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Toggle selection / unselection of weight profiles
  const handleToggleProfile = (profileKey) => {
    if (activeProfile === profileKey) {
      // Unselect and restore default baseline weights
      setActiveProfile(null);
      const defaultWeights = { distance: 0.30, delay: 0.30, congestion: 0.25, cost: 0.15 };
      setWeights(defaultWeights);
      onComputeRoute(source, destination, defaultWeights);
    } else {
      // Select new profile
      setActiveProfile(profileKey);
      let newWeights = { distance: 0.25, delay: 0.25, congestion: 0.25, cost: 0.25 };
      if (profileKey === 'congestion_sensitive') {
        newWeights = { distance: 0.15, delay: 0.20, congestion: 0.55, cost: 0.10 };
      } else if (profileKey === 'distance_only') {
        newWeights = { distance: 0.85, delay: 0.05, congestion: 0.05, cost: 0.05 };
      } else if (profileKey === 'delay_latency') {
        newWeights = { distance: 0.10, delay: 0.60, congestion: 0.20, cost: 0.10 };
      } else if (profileKey === 'balanced') {
        newWeights = { distance: 0.25, delay: 0.25, congestion: 0.25, cost: 0.25 };
      }
      setWeights(newWeights);
      onComputeRoute(source, destination, newWeights);
    }
  };

  const handleManualSliderChange = (key, value) => {
    setActiveProfile(null); // Clear selected preset profile when user manually tweaks
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    onComputeRoute(source, destination, updated);
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    if (!newNodeId) return;
    onAddNode({
      id: newNodeId.toUpperCase(),
      label: newNodeLabel || `Router ${newNodeId.toUpperCase()}`,
      role: 'transit',
      ip: `10.0.${nodes.length + 1}.1`
    });
    setNewNodeId('');
    setNewNodeLabel('');
  };

  const handleCreateEdge = (e) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) return;
    onAddEdge({
      source: newEdgeSource,
      target: newEdgeTarget,
      distance: parseFloat(newEdgeDistance) || 15.0,
      delay: parseFloat(newEdgeDistance) || 15.0,
      congestion: parseFloat(newEdgeCongestion) || 15.0,
      bandwidth: 1000.0,
      cost: 12.0
    });
  };

  return (
    <aside style={{
      backgroundColor: 'var(--color-surface-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      boxShadow: '0 1px 4px rgba(23, 21, 21, 0.03)'
    }}>
      {/* 1. Ingress & Egress Router Selection */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}>
          <h2 style={{
            fontSize: '1.15rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Server size={18} style={{ color: 'var(--color-rose-taupe)' }} />
            <span>Path Endpoints</span>
          </h2>
          <span style={{ 
            fontSize: '0.72rem', 
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-muted-taupe)',
            textTransform: 'uppercase'
          }}>
            Layer 3 Routing
          </span>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center', 
          gap: '0.5rem',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--color-border-subtle)'
        }}>
          {/* Source Node */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--color-rose-taupe)',
              marginBottom: '0.25rem',
              letterSpacing: '0.04em'
            }}>
              SOURCE (INGRESS)
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-taupe-border)',
                backgroundColor: '#FFF',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--color-near-black)',
                outline: 'none'
              }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === destination}>
                  {n.id} - {n.label.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapNodes}
            title="Reverse Path Direction"
            style={{
              padding: '0.35rem',
              borderRadius: '4px',
              border: '1px solid var(--color-taupe-border)',
              backgroundColor: '#FFF',
              color: 'var(--color-rose-taupe)',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowRightLeft size={14} />
          </button>

          {/* Destination Node */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--color-rose-taupe)',
              marginBottom: '0.25rem',
              letterSpacing: '0.04em'
            }}>
              DESTINATION (EGRESS)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-taupe-border)',
                backgroundColor: '#FFF',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--color-near-black)',
                outline: 'none'
              }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === source}>
                  {n.id} - {n.label.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Composite Routing Metric Sliders & Weight Profiles */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <h2 style={{
            fontSize: '1.15rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sliders size={17} style={{ color: 'var(--color-rose-taupe)' }} />
            <span>Composite Metric Weights</span>
          </h2>
          <span style={{ 
            fontSize: '0.75rem', 
            fontFamily: 'var(--font-mono)', 
            backgroundColor: 'var(--color-vanilla)',
            padding: '0.15rem 0.45rem',
            borderRadius: '3px',
            fontWeight: 600,
            border: '1px solid #E5D292'
          }}>
            Normalized Sum = 100%
          </span>
        </div>

        <p style={{
          fontSize: '0.78rem',
          color: 'var(--color-muted-taupe)',
          lineHeight: 1.35,
          marginBottom: '0.85rem'
        }}>
          Formula: <code className="mono" style={{ color: 'var(--color-near-black)', fontWeight: 600 }}>
            C(e) = Wd*D + Wt*T + Wc*C + Wk*K
          </code>
        </p>

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Distance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 500 }}>Physical Distance (Wd)</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--color-near-black)' }}>
                {normDist}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.distance}
              onChange={(e) => handleManualSliderChange('distance', parseFloat(e.target.value))}
            />
          </div>

          {/* Delay / Latency */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 500 }}>Transmission Delay (Wt)</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--color-near-black)' }}>
                {normDelay}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.delay}
              onChange={(e) => handleManualSliderChange('delay', parseFloat(e.target.value))}
            />
          </div>

          {/* Congestion */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 500, color: normCong > 35 ? 'var(--color-congested)' : 'inherit' }}>
                Link Congestion (Wc)
              </span>
              <span className="mono" style={{ 
                fontWeight: 700, 
                color: normCong > 35 ? 'var(--color-congested)' : 'var(--color-near-black)'
              }}>
                {normCong}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.congestion}
              onChange={(e) => handleManualSliderChange('congestion', parseFloat(e.target.value))}
            />
          </div>

          {/* Administrative Cost */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 500 }}>Administrative Cost (Wk)</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--color-near-black)' }}>
                {normCost}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.cost}
              onChange={(e) => handleManualSliderChange('cost', parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Weight Profiles (Click to Select / Click again to Unselect) */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 600, 
              color: 'var(--color-muted-taupe)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Weight Profiles (Click to toggle):
            </span>
            {activeProfile && (
              <span style={{ fontSize: '0.7rem', color: 'var(--color-rose-taupe)', fontWeight: 600 }}>
                Click active to unselect
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
            {/* Congestion Sensitive */}
            <button
              onClick={() => handleToggleProfile('congestion_sensitive')}
              style={{
                fontSize: '0.74rem',
                padding: '0.45rem 0.6rem',
                backgroundColor: activeProfile === 'congestion_sensitive' ? 'var(--color-vanilla)' : 'var(--color-surface-subtle)',
                border: activeProfile === 'congestion_sensitive' ? '2px solid var(--color-rose-taupe)' : '1px solid var(--color-border-subtle)',
                borderRadius: '4px',
                textAlign: 'left',
                color: 'var(--color-near-black)',
                fontWeight: activeProfile === 'congestion_sensitive' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: activeProfile === 'congestion_sensitive' ? '0 1px 4px rgba(138, 102, 116, 0.2)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={13} style={{ color: 'var(--color-congested)' }} />
                <span>Congestion Sensitive</span>
              </span>
              {activeProfile === 'congestion_sensitive' && <Check size={12} style={{ color: 'var(--color-rose-taupe)' }} />}
            </button>

            {/* Balanced QoS */}
            <button
              onClick={() => handleToggleProfile('balanced')}
              style={{
                fontSize: '0.74rem',
                padding: '0.45rem 0.6rem',
                backgroundColor: activeProfile === 'balanced' ? 'var(--color-vanilla)' : 'var(--color-surface-subtle)',
                border: activeProfile === 'balanced' ? '2px solid var(--color-rose-taupe)' : '1px solid var(--color-border-subtle)',
                borderRadius: '4px',
                textAlign: 'left',
                color: 'var(--color-near-black)',
                fontWeight: activeProfile === 'balanced' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: activeProfile === 'balanced' ? '0 1px 4px rgba(138, 102, 116, 0.2)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scale size={13} style={{ color: 'var(--color-rose-taupe)' }} />
                <span>Balanced QoS</span>
              </span>
              {activeProfile === 'balanced' && <Check size={12} style={{ color: 'var(--color-rose-taupe)' }} />}
            </button>

            {/* Distance Heavy */}
            <button
              onClick={() => handleToggleProfile('distance_only')}
              style={{
                fontSize: '0.74rem',
                padding: '0.45rem 0.6rem',
                backgroundColor: activeProfile === 'distance_only' ? 'var(--color-vanilla)' : 'var(--color-surface-subtle)',
                border: activeProfile === 'distance_only' ? '2px solid var(--color-rose-taupe)' : '1px solid var(--color-border-subtle)',
                borderRadius: '4px',
                textAlign: 'left',
                color: 'var(--color-near-black)',
                fontWeight: activeProfile === 'distance_only' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: activeProfile === 'distance_only' ? '0 1px 4px rgba(138, 102, 116, 0.2)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={13} style={{ color: 'var(--color-dijkstra)' }} />
                <span>Distance Heavy</span>
              </span>
              {activeProfile === 'distance_only' && <Check size={12} style={{ color: 'var(--color-rose-taupe)' }} />}
            </button>

            {/* Latency Sensitive */}
            <button
              onClick={() => handleToggleProfile('delay_latency')}
              style={{
                fontSize: '0.74rem',
                padding: '0.45rem 0.6rem',
                backgroundColor: activeProfile === 'delay_latency' ? 'var(--color-vanilla)' : 'var(--color-surface-subtle)',
                border: activeProfile === 'delay_latency' ? '2px solid var(--color-rose-taupe)' : '1px solid var(--color-border-subtle)',
                borderRadius: '4px',
                textAlign: 'left',
                color: 'var(--color-near-black)',
                fontWeight: activeProfile === 'delay_latency' ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: activeProfile === 'delay_latency' ? '0 1px 4px rgba(138, 102, 116, 0.2)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={13} style={{ color: 'var(--color-intelligent)' }} />
                <span>Latency Sensitive</span>
              </span>
              {activeProfile === 'delay_latency' && <Check size={12} style={{ color: 'var(--color-rose-taupe)' }} />}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Primary Execution & Dynamic Simulation Controls */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={() => onComputeRoute(source, destination, weights)}
          disabled={loading}
          style={{
            backgroundColor: 'var(--color-vanilla)',
            border: '2px solid var(--color-rose-taupe)',
            color: 'var(--color-near-black)',
            fontWeight: 700,
            fontSize: '0.94rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(138, 102, 116, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          <Zap size={18} style={{ color: 'var(--color-rose-taupe)' }} />
          <span>{loading ? 'Recomputing Routes...' : 'Compute & Compare Routes'}</span>
        </button>

        {/* Live Backend Connection & Fetch Feedback */}
        {lastApiResponse && (
          <div style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-intelligent)',
            backgroundColor: '#EAF4EC',
            padding: '0.35rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid #B0D7B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} />
              <span>Live API: {lastApiResponse.status}</span>
            </span>
            <span style={{ color: 'var(--color-muted-taupe)' }}>
              {lastApiResponse.durationMs}ms ({lastApiResponse.timestamp})
            </span>
          </div>
        )}

        {/* Dynamic Condition Controls */}
        <div style={{
          borderTop: '1px dashed var(--color-taupe-border)',
          paddingTop: '0.85rem'
        }}>
          <span style={{ 
            fontSize: '0.74rem', 
            fontWeight: 700, 
            color: 'var(--color-rose-taupe)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Simulate Network Conditions:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button
              onClick={onInjectBottleneck}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#FAF0ED',
                border: '1px solid #E8B4AC',
                borderRadius: '4px',
                color: 'var(--color-congested)',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <Flame size={15} />
              <span>Inject Bottleneck on N2-N4 (85%)</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                onClick={onClearCongestion}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: '#EAF4EC',
                  border: '1px solid #B0D7B8',
                  borderRadius: '4px',
                  color: 'var(--color-intelligent)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={14} />
                <span>Clear Load</span>
              </button>

              <button
                onClick={onRandomizeTraffic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--color-near-black)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Shuffle size={14} />
                <span>Fluctuate Load</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Network Setup / Topology Mode (Editor) */}
      <section style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.85rem' }}>
        <button
          onClick={() => setShowTopologyEditor(!showTopologyEditor)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            color: 'var(--color-rose-taupe)',
            fontSize: '0.82rem',
            fontWeight: 600,
            padding: '0.2rem 0',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={15} />
            <span>Network Topology Editor</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted-taupe)' }}>
            {showTopologyEditor ? 'Close' : 'Expand'}
          </span>
        </button>

        {showTopologyEditor && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {/* Add Node */}
            <form onSubmit={handleCreateNode}>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                Add Router Node:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="ID (e.g. N7)"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  style={{
                    width: '70px',
                    padding: '0.25rem 0.4rem',
                    border: '1px solid var(--color-taupe-border)',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Label (e.g. Router N7)"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.4rem',
                    border: '1px solid var(--color-taupe-border)',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--color-vanilla)',
                    border: '1px solid var(--color-rose-taupe)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </form>

            {/* Add Link */}
            <form onSubmit={handleCreateEdge} style={{ borderTop: '1px dashed var(--color-taupe-border)', paddingTop: '0.6rem' }}>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                Add Communication Link:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <select
                  value={newEdgeSource}
                  onChange={(e) => setNewEdgeSource(e.target.value)}
                  style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--color-taupe-border)' }}
                >
                  <option value="">Src Router</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
                </select>
                <select
                  value={newEdgeTarget}
                  onChange={(e) => setNewEdgeTarget(e.target.value)}
                  style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--color-taupe-border)' }}
                >
                  <option value="">Dst Router</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Dist (km)"
                  value={newEdgeDistance}
                  onChange={(e) => setNewEdgeDistance(e.target.value)}
                  style={{ width: '80px', padding: '0.25rem 0.4rem', border: '1px solid var(--color-taupe-border)', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Cong (%)"
                  value={newEdgeCongestion}
                  onChange={(e) => setNewEdgeCongestion(e.target.value)}
                  style={{ width: '80px', padding: '0.25rem 0.4rem', border: '1px solid var(--color-taupe-border)', borderRadius: '4px' }}
                />
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-vanilla)',
                    border: '1px solid var(--color-rose-taupe)',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Link
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </aside>
  );
}
