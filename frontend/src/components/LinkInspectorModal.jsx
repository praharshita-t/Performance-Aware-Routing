import React, { useState, useEffect } from 'react';
import { X, Sliders, Radio, Link as LinkIcon, Activity, Check } from 'lucide-react';

export default function LinkInspectorModal({
  selectedItem,
  itemType, // 'node' or 'edge'
  onClose,
  onUpdateEdge,
  allEdges = [],
  allNodes = []
}) {
  if (!selectedItem) return null;

  // Local state for edge editing
  const [distance, setDistance] = useState(selectedItem.distance || 15);
  const [delay, setDelay] = useState(selectedItem.delay || 15);
  const [congestion, setCongestion] = useState(selectedItem.congestion || 15);
  const [bandwidth, setBandwidth] = useState(selectedItem.bandwidth || 1000);
  const [cost, setCost] = useState(selectedItem.cost || 10);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (itemType === 'edge' && selectedItem) {
      setDistance(selectedItem.distance || 15);
      setDelay(selectedItem.delay || 15);
      setCongestion(selectedItem.congestion || 15);
      setBandwidth(selectedItem.bandwidth || 1000);
      setCost(selectedItem.cost || 10);
      setIsSaved(false);
    }
  }, [selectedItem, itemType]);

  const handleApplyEdgeChanges = () => {
    onUpdateEdge({
      edge_id: selectedItem.id,
      source: selectedItem.source,
      target: selectedItem.target,
      distance: parseFloat(distance),
      delay: parseFloat(delay),
      congestion: parseFloat(congestion),
      bandwidth: parseFloat(bandwidth),
      cost: parseFloat(cost)
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Connected neighbors if node
  const connectedEdges = itemType === 'node' ? allEdges.filter(
    (e) => e.source === selectedItem.id || e.target === selectedItem.id
  ) : [];

  const neighborNodeIds = connectedEdges.map((e) =>
    e.source === selectedItem.id ? e.target : e.source
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      width: '360px',
      backgroundColor: '#FFF',
      border: '2px solid var(--color-rose-taupe)',
      borderRadius: '8px',
      boxShadow: '0 8px 30px rgba(23, 21, 21, 0.15)',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'slideUp 0.2s ease-out'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-surface-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {itemType === 'node' ? (
            <Radio size={16} style={{ color: 'var(--color-rose-taupe)' }} />
          ) : (
            <LinkIcon size={16} style={{ color: 'var(--color-rose-taupe)' }} />
          )}
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-near-black)' }}>
            {itemType === 'node' ? `ROUTER: ${selectedItem.id}` : `LINK: ${selectedItem.source} ↔ ${selectedItem.target}`}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-muted-taupe)',
            cursor: 'pointer',
            padding: '0.2rem'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem', fontSize: '0.82rem' }}>
        {itemType === 'node' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Router Label:</span>
              <span style={{ fontWeight: 600 }}>{selectedItem.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Loopback IP:</span>
              <span className="mono" style={{ fontWeight: 600 }}>{selectedItem.ip || '10.0.0.1'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Routing Role:</span>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{selectedItem.role || 'transit'}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--color-taupe-border)', paddingTop: '0.5rem' }}>
              <span style={{ color: 'var(--color-muted-taupe)', display: 'block', marginBottom: '0.35rem' }}>
                Connected Adjacencies:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {neighborNodeIds.map((nid) => (
                  <span
                    key={nid}
                    className="mono"
                    style={{
                      backgroundColor: 'var(--color-vanilla)',
                      border: '1px solid #E5D292',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      fontWeight: 700
                    }}
                  >
                    {nid}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Live Congestion Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600, color: congestion > 70 ? 'var(--color-congested)' : 'inherit' }}>
                  Link Congestion:
                </span>
                <span className="mono" style={{ fontWeight: 700, color: congestion > 70 ? 'var(--color-congested)' : 'inherit' }}>
                  {congestion}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={congestion}
                onChange={(e) => setCongestion(parseFloat(e.target.value))}
              />
            </div>

            {/* Delay */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 600 }}>Transmission Delay:</span>
                <span className="mono" style={{ fontWeight: 700 }}>{delay} ms</span>
              </div>
              <input
                type="range"
                min="1"
                max="80"
                step="1"
                value={delay}
                onChange={(e) => setDelay(parseFloat(e.target.value))}
              />
            </div>

            {/* Distance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Physical Distance:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value))}
                  style={{ width: '60px', padding: '0.2rem 0.4rem', border: '1px solid var(--color-taupe-border)', borderRadius: '4px' }}
                />
                <span className="mono">km</span>
              </div>
            </div>

            {/* Bandwidth */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Interface Bandwidth:</span>
              <select
                value={bandwidth}
                onChange={(e) => setBandwidth(parseFloat(e.target.value))}
                style={{ padding: '0.2rem 0.4rem', border: '1px solid var(--color-taupe-border)', borderRadius: '4px' }}
              >
                <option value="500">500 Mbps</option>
                <option value="1000">1 Gbps (1000M)</option>
                <option value="5000">5 Gbps</option>
                <option value="10000">10 Gbps</option>
              </select>
            </div>

            {/* Administrative Cost */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-muted-taupe)' }}>Administrative Cost:</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value))}
                style={{ width: '60px', padding: '0.2rem 0.4rem', border: '1px solid var(--color-taupe-border)', borderRadius: '4px' }}
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyEdgeChanges}
              style={{
                backgroundColor: isSaved ? '#EAF4EC' : 'var(--color-vanilla)',
                border: '1px solid var(--color-rose-taupe)',
                borderRadius: '4px',
                padding: '0.5rem',
                fontWeight: 700,
                color: isSaved ? 'var(--color-intelligent)' : 'var(--color-near-black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                marginTop: '0.35rem'
              }}
            >
              {isSaved ? <Check size={14} /> : <Sliders size={14} />}
              <span>{isSaved ? 'Metrics Updated & Recalculated' : 'Apply Link Changes'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
