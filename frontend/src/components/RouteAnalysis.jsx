import React from 'react';
import { 
  BarChart3, 
  Play, 
  Pause, 
  RotateCcw, 
  GitCommit, 
  Clock, 
  Flame, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Split,
  Equal
} from 'lucide-react';

export default function RouteAnalysis({
  routingResult,
  onRunPacketSimulation,
  isSimulating,
  onPauseSimulation,
  onResetSimulation,
  simPacketState,
  onTriggerDivergenceDemo
}) {
  if (!routingResult) {
    return (
      <aside style={{
        backgroundColor: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '8px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        color: 'var(--color-muted-taupe)'
      }}>
        <BarChart3 size={36} style={{ color: 'var(--color-taupe-border)', marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-near-black)', marginBottom: '0.35rem' }}>
          No Routing Telemetry Available
        </h3>
        <p style={{ fontSize: '0.82rem', maxWidth: '280px', lineHeight: 1.4 }}>
          Select source and destination routers, adjust metric weights, and click <strong>Compute & Compare Routes</strong>.
        </p>
      </aside>
    );
  }

  const { dijkstra, intelligent, analysis } = routingResult;
  const isSamePath = analysis?.is_same_path;

  return (
    <aside style={{
      backgroundColor: 'var(--color-surface-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 1px 4px rgba(23, 21, 21, 0.03)'
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border-subtle)',
        paddingBottom: '0.75rem'
      }}>
        <h2 style={{
          fontSize: '1.15rem',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <BarChart3 size={18} style={{ color: 'var(--color-rose-taupe)' }} />
          <span>Routing Analysis</span>
        </h2>
        <span style={{
          fontSize: '0.74rem',
          fontFamily: 'var(--font-mono)',
          padding: '0.2rem 0.55rem',
          borderRadius: '4px',
          backgroundColor: isSamePath ? 'var(--color-surface-subtle)' : '#EAF4EC',
          color: isSamePath ? 'var(--color-muted-taupe)' : 'var(--color-intelligent)',
          border: `1px solid ${isSamePath ? 'var(--color-taupe-border)' : '#B0D7B8'}`,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          {isSamePath ? <Equal size={13} /> : <Split size={13} />}
          <span>{isSamePath ? 'IDENTICAL PATHS' : 'DIVERGENT OPTIMIZATION'}</span>
        </span>
      </div>

      {/* Divergence Notification / Helper */}
      {isSamePath && onTriggerDivergenceDemo && (
        <div style={{
          backgroundColor: '#FAF5EE',
          border: '1px solid #E8DCC9',
          borderRadius: '6px',
          padding: '0.65rem 0.85rem',
          fontSize: '0.78rem'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-near-black)', marginBottom: '0.2rem' }}>
            Current Status: Both algorithms selected the same path
          </div>
          <div style={{ color: 'var(--color-muted-taupe)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
            Under current network weights and low congestion, the physical shortest distance route also has acceptable delay.
          </div>
          <button
            onClick={onTriggerDivergenceDemo}
            style={{
              backgroundColor: 'var(--color-vanilla)',
              border: '1px solid var(--color-rose-taupe)',
              borderRadius: '4px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-near-black)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Flame size={13} style={{ color: 'var(--color-congested)' }} />
            <span>Simulate Bottleneck to Demonstrate Path Divergence</span>
          </button>
        </div>
      )}

      {/* Side-by-Side Path Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {/* 1. Dijkstra Baseline Card */}
        <div style={{
          border: '1px solid #C4D5DF',
          borderRadius: '6px',
          backgroundColor: 'var(--color-dijkstra-bg)',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--color-dijkstra)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              DIJKSTRA (SHORTEST PATH)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted-taupe)', fontFamily: 'var(--font-mono)' }}>
              Base Dist
            </span>
          </div>

          {/* Path Forwarding string */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--color-near-black)',
            backgroundColor: '#FFF',
            padding: '0.35rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #D5E1E8',
            wordBreak: 'break-all'
          }}>
            {dijkstra.path.join(' -> ')}
          </div>

          {/* Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Hop Count:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{dijkstra.hop_count} hops</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Total Distance:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{dijkstra.total_distance} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>End-to-End Delay:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{dijkstra.effective_delay} ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Avg Congestion:</span>
              <span className="mono" style={{ 
                fontWeight: 700,
                color: dijkstra.average_congestion > 50 ? 'var(--color-congested)' : 'inherit'
              }}>
                {dijkstra.average_congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Max Link Congestion:</span>
              <span className="mono" style={{ 
                fontWeight: 700,
                color: dijkstra.max_congestion > 70 ? 'var(--color-congested)' : 'inherit'
              }}>
                {dijkstra.max_congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D5E1E8', paddingTop: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-near-black)' }}>Composite Cost:</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--color-dijkstra)' }}>
                {dijkstra.total_composite_cost}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Intelligent Performance-Aware Card */}
        <div style={{
          border: '1px solid #BFDCC4',
          borderRadius: '6px',
          backgroundColor: 'var(--color-intelligent-bg)',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--color-intelligent)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              INTELLIGENT (COMPOSITE)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-intelligent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              QoS Aware
            </span>
          </div>

          {/* Path Forwarding string */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--color-near-black)',
            backgroundColor: '#FFF',
            padding: '0.35rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #CFE5D4',
            wordBreak: 'break-all'
          }}>
            {intelligent.path.join(' -> ')}
          </div>

          {/* Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Hop Count:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{intelligent.hop_count} hops</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Total Distance:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{intelligent.total_distance} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>End-to-End Delay:</span>
              <span className="mono" style={{ fontWeight: 600, color: 'var(--color-intelligent)' }}>
                {intelligent.effective_delay} ms
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Avg Congestion:</span>
              <span className="mono" style={{ 
                fontWeight: 700,
                color: intelligent.average_congestion > 50 ? 'var(--color-congested)' : 'var(--color-intelligent)'
              }}>
                {intelligent.average_congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Max Link Congestion:</span>
              <span className="mono" style={{ 
                fontWeight: 700,
                color: intelligent.max_congestion > 70 ? 'var(--color-congested)' : 'var(--color-intelligent)'
              }}>
                {intelligent.max_congestion}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #CFE5D4', paddingTop: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-near-black)' }}>Composite Cost:</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--color-intelligent)' }}>
                {intelligent.total_composite_cost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Trade-Off Analysis Box */}
      <section style={{
        backgroundColor: '#FFF',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: '4px solid var(--color-rose-taupe)',
        padding: '0.85rem 1rem',
        borderRadius: '0 6px 6px 0'
      }}>
        <div style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          color: 'var(--color-rose-taupe)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.35rem'
        }}>
          Algorithmic Trade-Off Analysis
        </div>

        <p style={{
          fontSize: '0.84rem',
          fontWeight: 600,
          color: 'var(--color-near-black)',
          lineHeight: 1.4,
          marginBottom: '0.5rem'
        }}>
          {analysis?.summary}
        </p>

        <ul style={{
          paddingLeft: '1.1rem',
          margin: 0,
          fontSize: '0.78rem',
          color: '#4A403D',
          lineHeight: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem'
        }}>
          {analysis?.reasons?.map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </section>

      {/* Simulated Packet Flow Controller */}
      <section style={{
        backgroundColor: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '6px',
        padding: '0.85rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem'
        }}>
          <span style={{
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--color-near-black)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <GitCommit size={15} style={{ color: 'var(--color-rose-taupe)' }} />
            Simulated Packet Flow
          </span>

          <span style={{ 
            fontSize: '0.7rem', 
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-muted-taupe)'
          }}>
            Layer 3 Datagram
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <button
            onClick={onRunPacketSimulation}
            disabled={isSimulating}
            style={{
              flex: 1,
              backgroundColor: isSimulating ? 'var(--color-surface-subtle)' : 'var(--color-vanilla)',
              border: '1px solid var(--color-rose-taupe)',
              borderRadius: '4px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--color-near-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: isSimulating ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={13} />
            <span>{isSimulating ? 'Transmitting...' : 'Run Packet Simulation'}</span>
          </button>

          {isSimulating && (
            <button
              onClick={onResetSimulation}
              title="Reset Simulation"
              style={{
                padding: '0.45rem 0.6rem',
                backgroundColor: '#FFF',
                border: '1px solid var(--color-taupe-border)',
                borderRadius: '4px',
                color: 'var(--color-rose-taupe)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Live Packet Telemetry State */}
        {simPacketState && (
          <div style={{
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#FFF',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Datagram:</span>
              <span style={{ fontWeight: 700 }}>{simPacketState.packetId || 'PKT-101'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Current Hop:</span>
              <span style={{ fontWeight: 600 }}>
                {simPacketState.currentHop?.current_node} -&gt; {simPacketState.currentHop?.next_hop}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Hop Latency:</span>
              <span>{simPacketState.currentHop?.hop_latency_ms} ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Buffer Queue Risk:</span>
              <span style={{ 
                fontWeight: 700,
                color: simPacketState.currentHop?.drop_risk?.includes('HIGH') ? 'var(--color-congested)' : 'var(--color-intelligent)'
              }}>
                {simPacketState.currentHop?.drop_risk}
              </span>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
