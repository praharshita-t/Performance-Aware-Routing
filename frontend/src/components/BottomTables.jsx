import React, { useState, useMemo } from 'react';
import { Table, Terminal, Activity, Layers, ArrowRight } from 'lucide-react';

export default function BottomTables({
  source,
  routingTable = [],
  packetTrace,
  linksEvaluated = [],
  edges = [],
  weights,
  simulationLogs = [],
  onComputeRoute
}) {
  const [activeTab, setActiveTab] = useState('routing_table');

  // Ensure link normalizations are ALWAYS available even before or between route computes
  const displayLinks = useMemo(() => {
    if (linksEvaluated && linksEvaluated.length > 0) {
      return linksEvaluated;
    }
    if (!edges || edges.length === 0) return [];

    const distances = edges.map((e) => Number(e.distance) || 1);
    const delays = edges.map((e) => Number(e.delay) || 1);
    const congestions = edges.map((e) => Number(e.congestion) || 0);
    const costs = edges.map((e) => Number(e.cost) || 1);

    const minD = Math.min(...distances), maxD = Math.max(...distances);
    const minT = Math.min(...delays), maxT = Math.max(...delays);
    const minK = Math.min(...costs), maxK = Math.max(...costs);

    const norm = (val, minV, maxV) => (maxV === minV ? 0.5 : (val - minV) / (maxV - minV));

    const w = weights || { distance: 0.3, delay: 0.3, congestion: 0.25, cost: 0.15 };
    const sumW = (w.distance || 0) + (w.delay || 0) + (w.congestion || 0) + (w.cost || 0) || 1;
    const wd = (w.distance || 0) / sumW;
    const wt = (w.delay || 0) / sumW;
    const wc = (w.congestion || 0) / sumW;
    const wk = (w.cost || 0) / sumW;

    return edges.map((e) => {
      const d_norm = Number(norm(Number(e.distance) || 0, minD, maxD).toFixed(4));
      const t_norm = Number(norm(Number(e.delay) || 0, minT, maxT).toFixed(4));
      const c_norm = Number((Number(e.congestion || 0) / 100).toFixed(4));
      const k_norm = Number(norm(Number(e.cost) || 0, minK, maxK).toFixed(4));
      const comp_cost = Number((wd * d_norm + wt * t_norm + wc * c_norm + wk * k_norm + 0.001).toFixed(4));

      return {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        distance: e.distance,
        delay: e.delay,
        congestion: e.congestion,
        cost: e.cost,
        bandwidth: e.bandwidth,
        d_norm,
        t_norm,
        c_norm,
        k_norm,
        composite_cost: comp_cost
      };
    });
  }, [linksEvaluated, edges, weights]);

  return (
    <section style={{
      backgroundColor: 'var(--color-surface-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '1.5rem',
      boxShadow: '0 1px 4px rgba(23, 21, 21, 0.03)'
    }}>
      {/* Tabs Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface-subtle)',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('routing_table')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'routing_table' ? '3px solid var(--color-rose-taupe)' : '3px solid transparent',
            backgroundColor: activeTab === 'routing_table' ? '#FAF8F3' : 'transparent',
            fontWeight: activeTab === 'routing_table' ? 700 : 500,
            color: activeTab === 'routing_table' ? 'var(--color-near-black)' : 'var(--color-muted-taupe)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Table size={15} />
          <span>Forwarding / Routing Table ({source})</span>
          {routingTable.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'var(--color-vanilla)',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              {routingTable.length} Routes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('packet_trace')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'packet_trace' ? '3px solid var(--color-rose-taupe)' : '3px solid transparent',
            backgroundColor: activeTab === 'packet_trace' ? '#FAF8F3' : 'transparent',
            fontWeight: activeTab === 'packet_trace' ? 700 : 500,
            color: activeTab === 'packet_trace' ? 'var(--color-near-black)' : 'var(--color-muted-taupe)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Activity size={15} />
          <span>Packet Flow Trace Telemetry</span>
          {packetTrace && (
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'var(--color-vanilla)',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              {packetTrace.hops?.length || 0} Hops
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('link_matrix')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'link_matrix' ? '3px solid var(--color-rose-taupe)' : '3px solid transparent',
            backgroundColor: activeTab === 'link_matrix' ? '#FAF8F3' : 'transparent',
            fontWeight: activeTab === 'link_matrix' ? 700 : 500,
            color: activeTab === 'link_matrix' ? 'var(--color-near-black)' : 'var(--color-muted-taupe)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Layers size={15} />
          <span>Evaluated Link Metrics & Normalizations</span>
          <span style={{
            fontSize: '0.7rem',
            backgroundColor: 'var(--color-vanilla)',
            padding: '0.1rem 0.4rem',
            borderRadius: '999px',
            fontWeight: 700
          }}>
            {displayLinks.length} Links
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sim_logs')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'sim_logs' ? '3px solid var(--color-rose-taupe)' : '3px solid transparent',
            backgroundColor: activeTab === 'sim_logs' ? '#FAF8F3' : 'transparent',
            fontWeight: activeTab === 'sim_logs' ? 700 : 500,
            color: activeTab === 'sim_logs' ? 'var(--color-near-black)' : 'var(--color-muted-taupe)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Terminal size={15} />
          <span>Simulation Event Log ({simulationLogs.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ padding: '1rem', minHeight: '260px' }}>
        {/* Tab 1: Routing Table */}
        {activeTab === 'routing_table' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-muted-taupe)', margin: 0 }}>
                Dynamic Layer 3 Forwarding Information Base (FIB) computed for ingress router <strong>{source}</strong> using intelligent composite routing metric.
              </p>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--color-rose-taupe)' }}>
                FIB ENTRIES: {routingTable.length}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.82rem'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--color-taupe-border)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    color: 'var(--color-near-black)',
                    fontWeight: 600
                  }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Destination</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Next Hop Router</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Hop Count</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>End-to-End Delay</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Composite Cost</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Forwarding Path</th>
                  </tr>
                </thead>
                <tbody>
                  {routingTable.map((row) => (
                    <tr
                      key={row.destination}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#FFF'
                      }}
                    >
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }} className="mono">
                        {row.destination}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        <span style={{
                          backgroundColor: 'var(--color-vanilla)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          border: '1px solid #E5D292',
                          fontWeight: 700
                        }} className="mono">
                          {row.next_hop}
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {row.hop_count}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {row.end_to_end_delay} ms
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--color-intelligent)' }} className="mono">
                        {row.composite_cost}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {row.path_str}
                      </td>
                    </tr>
                  ))}
                  {routingTable.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-muted-taupe)' }}>
                        <div>No routes calculated yet.</div>
                        {onComputeRoute && (
                          <button
                            onClick={onComputeRoute}
                            style={{
                              marginTop: '0.5rem',
                              backgroundColor: 'var(--color-vanilla)',
                              border: '1px solid var(--color-rose-taupe)',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Compute Routes Now
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Packet Flow Trace */}
        {activeTab === 'packet_trace' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-muted-taupe)', margin: 0 }}>
                Discrete datagram telemetry recording per-hop propagation, queuing delay (model: <code className="mono">Tq = f(congestion)</code>), and buffer queue risk.
              </p>
              {packetTrace && (
                <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--color-near-black)', fontWeight: 600 }}>
                  TOTAL LATENCY: {packetTrace.total_time_ms} ms
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.8rem'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--color-taupe-border)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    color: 'var(--color-near-black)',
                    fontWeight: 600
                  }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Hop #</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Current Router</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Next Hop</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Link Distance</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Prop. Delay</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Queue Delay</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Hop Latency</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Cumulative</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Congestion</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Buffer Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {packetTrace?.hops?.map((hop) => (
                    <tr
                      key={hop.hop_number}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#FFF'
                      }}
                    >
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }} className="mono">
                        #{hop.hop_number}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.current_node}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.next_hop}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.distance_km} km
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.propagation_delay_ms} ms
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.queuing_delay_ms} ms
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }} className="mono">
                        {hop.hop_latency_ms} ms
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {hop.departure_time_ms} ms
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        <span style={{
                          color: hop.link_congestion_pct > 70 ? 'var(--color-congested)' : 'inherit',
                          fontWeight: hop.link_congestion_pct > 70 ? 700 : 500
                        }}>
                          {hop.link_congestion_pct}%
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          fontWeight: 600,
                          backgroundColor: hop.drop_risk.includes('HIGH') ? '#FAF0ED' : '#EAF4EC',
                          color: hop.drop_risk.includes('HIGH') ? 'var(--color-congested)' : 'var(--color-intelligent)'
                        }}>
                          {hop.drop_risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!packetTrace || !packetTrace.hops || packetTrace.hops.length === 0) && (
                    <tr>
                      <td colSpan="10" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-muted-taupe)' }}>
                        No packet trace active. Click "Run Packet Simulation" in the Routing Analysis panel.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Link Matrix & Normalizations */}
        {activeTab === 'link_matrix' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-muted-taupe)', margin: 0 }}>
                Full normalization matrix displaying raw metrics alongside min-max normalized components ($D_{'{'}norm{'}'}, T_{'{'}norm{'}'}, C_{'{'}norm{'}'}, K_{'{'}norm{'}'}$) and the calculated composite edge weight $C(e)$.
              </p>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--color-rose-taupe)', fontWeight: 600 }}>
                EVALUATED LINKS: {displayLinks.length}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.8rem'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid var(--color-taupe-border)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    color: 'var(--color-near-black)',
                    fontWeight: 600
                  }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Link ID</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Endpoints</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Dist (km)</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Delay (ms)</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Congestion</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Cost</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>D_norm</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>T_norm</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>C_norm</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>K_norm</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Composite Cost C(e)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLinks.map((link) => (
                    <tr
                      key={link.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#FFF'
                      }}
                    >
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700 }} className="mono">
                        {link.id}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        {link.source} - {link.target}
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">{link.distance}</td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">{link.delay}</td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">
                        <span style={{ color: link.congestion > 70 ? 'var(--color-congested)' : 'inherit', fontWeight: link.congestion > 70 ? 700 : 500 }}>
                          {link.congestion}%
                        </span>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem' }} className="mono">{link.cost}</td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-muted-taupe)' }} className="mono">{link.d_norm}</td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-muted-taupe)' }} className="mono">{link.t_norm}</td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-muted-taupe)' }} className="mono">{link.c_norm}</td>
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-muted-taupe)' }} className="mono">{link.k_norm}</td>
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--color-rose-taupe)' }} className="mono">
                        {link.composite_cost}
                      </td>
                    </tr>
                  ))}
                  {displayLinks.length === 0 && (
                    <tr>
                      <td colSpan="11" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-muted-taupe)' }}>
                        No link metrics available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Simulation Event Log */}
        {activeTab === 'sim_logs' && (
          <div style={{
            backgroundColor: '#1E1B1B',
            color: '#E0D8D3',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            padding: '1rem',
            borderRadius: '6px',
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            {simulationLogs.map((log, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: 'var(--color-muted-taupe)' }}>[{log.timestamp}]</span>
                <span style={{
                  color: log.type === 'error' ? '#FF6B6B' : (log.type === 'calc' ? 'var(--color-vanilla)' : '#98C9A3')
                }}>
                  {log.message}
                </span>
              </div>
            ))}
            {simulationLogs.length === 0 && (
              <div style={{ color: 'var(--color-muted-taupe)' }}>No simulation events logged yet.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
