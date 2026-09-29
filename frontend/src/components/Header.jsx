import React from 'react';
import { Network, Activity, RefreshCw, Cpu, GitFork, CheckCircle2, Server } from 'lucide-react';

export default function Header({ 
  presetId, 
  onSelectPreset, 
  availablePresets, 
  nodesCount, 
  edgesCount, 
  loading,
  lastApiResponse,
  onResetNetwork
}) {
  return (
    <header style={{
      borderBottom: '2px solid var(--color-rose-taupe)',
      backgroundColor: 'var(--color-surface-card)',
      padding: '1.25rem 2rem',
      boxShadow: '0 2px 12px rgba(23, 21, 21, 0.04)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        {/* Project Branding & Editorial Title */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            marginBottom: '0.35rem',
            color: 'var(--color-rose-taupe)',
            fontWeight: 600,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <Network size={16} />
            <span>CBP / Computer Networks Laboratory</span>
            <span style={{ color: 'var(--color-muted-taupe)' }}>•</span>
            <span>Layer 3 Routing Simulation</span>
          </div>

          <h1 style={{ 
            fontSize: '2.1rem', 
            lineHeight: 1.15, 
            color: 'var(--color-near-black)',
            margin: '0 0 0.35rem 0'
          }}>
            Performance-Aware Routing
            <span style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '1rem', 
              fontWeight: 400, 
              color: 'var(--color-rose-taupe)',
              marginLeft: '0.75rem',
              verticalAlign: 'middle',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: '4px',
              border: '1px solid var(--color-border-subtle)'
            }}>
              Composite Network Metrics
            </span>
          </h1>

          <p style={{ 
            fontSize: '0.92rem', 
            color: 'var(--color-muted-taupe)', 
            maxWidth: '680px',
            lineHeight: 1.45
          }}>
            Comparing traditional distance-vector / shortest-path routing (Dijkstra) with intelligent 
            performance-aware routing dynamically synthesized from latency, bandwidth, congestion, and link cost.
          </p>
        </div>

        {/* System Status & Topology Presets */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end', 
          gap: '0.8rem' 
        }}>
          {/* Status Badge & API Telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {lastApiResponse && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                backgroundColor: '#EAF4EC',
                border: '1px solid #B0D7B8',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-intelligent)'
              }}>
                <CheckCircle2 size={12} />
                <span>API: {lastApiResponse.status} ({lastApiResponse.durationMs}ms)</span>
              </div>
            )}

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              backgroundColor: loading ? 'var(--color-surface-subtle)' : '#EAF4EC',
              border: `1px solid ${loading ? 'var(--color-muted-taupe)' : '#98C9A3'}`,
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: loading ? 'var(--color-muted-taupe)' : 'var(--color-intelligent)'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: loading ? 'var(--color-muted-taupe)' : 'var(--color-intelligent)',
                display: 'inline-block'
              }}></span>
              <span>{loading ? 'CALCULATING PATHS...' : 'SYSTEM STATUS: READY'}</span>
            </div>

            <button
              onClick={onResetNetwork}
              title="Reset topology to default baseline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '4px',
                color: 'var(--color-near-black)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} />
              <span>Reset State</span>
            </button>
          </div>

          {/* Preset Topology Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <GitFork size={15} style={{ color: 'var(--color-rose-taupe)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-near-black)' }}>
              Topology Preset:
            </span>
            <select
              value={presetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              style={{
                backgroundColor: '#FFF',
                border: '1px solid var(--color-taupe-border)',
                borderRadius: '4px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.82rem',
                color: 'var(--color-near-black)',
                fontWeight: 500,
                outline: 'none'
              }}
            >
              {availablePresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <span style={{ 
              fontSize: '0.78rem', 
              color: 'var(--color-muted-taupe)',
              marginLeft: '0.5rem',
              fontFamily: 'var(--font-mono)'
            }}>
              [{nodesCount} Routers / {edgesCount} Links]
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
