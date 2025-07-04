import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";

// Remove the import for NodeSliders if it's in the same file
// import { NodeSliders } from './ControlsPanel';

interface ControlsPanelProps {
  nodeOptions: { label: string; value: number }[];
  centralNodeIndex: number;
  setCentralNodeIndex: (idx: number) => void;
  nodeCount: number;
  setNodeCount: (n: number) => void;
  attributeCount: number;
  setAttributeCount: (n: number) => void;
  k: number;
  setK: (k: number) => void;
  kRep: number;
  setKRep: (k: number) => void;
  angularSpeed: number;
  setAngularSpeed: (n: number) => void;
  nodeSize: number;
  setNodeSize: (n: number) => void;
  centralSize: number;
  setCentralSize: (n: number) => void;
  nodeColor: string;
  setNodeColor: (c: string) => void;
  centralColor: string;
  setCentralColor: (c: string) => void;
  onCameraMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLockToggle: () => void;
  lockState: boolean;
  onResetCamera: () => void;
  mode?: 'night' | 'day';
  setMode?: (mode: 'night' | 'day') => void;
  randomNodeDistribution: boolean;
  setRandomNodeDistribution: (v: boolean) => void;
  debugForces: boolean;
  setDebugForces: (v: boolean) => void;
  showSprings: boolean;
  setShowSprings: (v: boolean) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps & {
  nodes?: any[]; // Array of node objects with traits/preferences
  selectedNodeIndex?: number;
  setNodes?: (nodes: any[]) => void;
}> = ({
  nodeOptions,
  centralNodeIndex,
  setCentralNodeIndex,
  nodeCount,
  setNodeCount,
  attributeCount,
  setAttributeCount,
  k,
  setK,
  kRep,
  setKRep,
  angularSpeed,
  setAngularSpeed,
  nodeSize,
  setNodeSize,
  centralSize,
  setCentralSize,
  nodeColor,
  setNodeColor,
  centralColor,
  setCentralColor,
  onCameraMove,
  onZoomIn,
  onZoomOut,
  onLockToggle,
  lockState,
  onResetCamera,
  mode = 'night',
  setMode,
  randomNodeDistribution,
  setRandomNodeDistribution,
  debugForces,
  setDebugForces,
  nodes = [],
  selectedNodeIndex = 0,
  setNodes = () => {},
  showSprings = false,
  setShowSprings = () => {},
}) => {
  const [minimized, setMinimized] = useState(false);

  const panelBg = mode === 'night' ? '#23203a' : '#fff';
  const panelText = mode === 'night' ? '#fff' : '#23203a';

  const iconBtnStyle = {
    padding: '8px',
    borderRadius: '8px',
    border: '2px solid #C300FF',
    background: 'transparent',
    color: '#C300FF',
    cursor: 'pointer' as 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    transition: 'background 0.3s, transform 0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties;

  // Panel input styles for alignment
  const panelNumberStyle: React.CSSProperties = {
    width: 48, borderRadius: 4, border: '1px solid #c300ff55', background: 'rgba(35,32,58,0.12)', color: 'inherit', padding: '2px 4px', fontSize: '0.97em',
  };
  const panelSliderStyle: React.CSSProperties = {
    width: 70, accentColor: '#c300ff',
  };
  const panelValueStyle: React.CSSProperties = {
    marginLeft: 4, fontWeight: 600, color: '#c300ff', fontSize: '0.97em',
  };

  // Handler for NodeSliders
  const handleNodeSliderChange = (field: 'traits' | 'preferences', key: string, value: number) => {
    if (!nodes[selectedNodeIndex]) return;
    const updatedNodes = nodes.map((node, idx) =>
      idx === selectedNodeIndex
        ? { ...node, [field]: { ...node[field], [key]: value }, mesh: node.mesh }
        : node
    );
    setNodes(updatedNodes);
  };

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 32,
          right: 32,
          zIndex: 10002,
          background: mode === 'night' ? 'rgba(35,32,58,0.92)' : 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          boxShadow: mode === 'night' ? '0 2px 16px #c300ff33, 0 1.5px 8px #0008' : '0 2px 16px #c300ff22, 0 1.5px 8px #0002',
          border: '2px solid #c300ff55',
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setMinimized(false)}
        title="Expand control panel"
      >
        <span style={{ fontSize: 22, color: '#c300ff', fontWeight: 700 }}>☰</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: mode === 'night' ? 'rgba(35,32,58,0.92)' : 'rgba(255,255,255,0.95)',
        color: panelText,
        borderRadius: 16,
        boxShadow: mode === 'night' ? '0 2px 16px #c300ff33, 0 1.5px 8px #0008' : '0 2px 16px #c300ff22, 0 1.5px 8px #0002',
        padding: 12,
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 10002,
        minWidth: 220,
        maxWidth: 320,
        maxHeight: '90vh',
        minHeight: 'unset',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        border: '2px solid #c300ff55',
        transition: 'background 0.3s, color 0.3s',
        opacity: 0.98,
        backdropFilter: 'blur(6px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header always at the top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: '1.1em' }}>Controls</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setMinimized(true)}
            style={{
              background: '#fff',
              border: '2px solid #c300ff',
              color: '#c300ff',
              fontSize: 24,
              cursor: 'pointer',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 4,
              transition: 'background 0.2s, border 0.2s',
            }}
            title="Minimize control panel"
            onMouseOver={e => (e.currentTarget.style.background = '#f3e8ff')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}
          >
            <span style={{ fontWeight: 700, fontSize: 22, lineHeight: 1 }}>&#x25B2;</span>
          </button>
          <button
            onClick={() => setMode && setMode(mode === 'night' ? 'day' : 'night')}
            style={{
              background: mode === 'night' ? '#181c2a' : '#fff',
              color: mode === 'night' ? '#fff' : '#181c2a',
              border: '2px solid #c300ff',
              borderRadius: 8,
              width: 36,
              height: 36,
              fontSize: '1.2em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #c300ff44',
              marginLeft: 8
            }}
            title={mode === 'night' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
          >
            {mode === 'night' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {/* Central Node Selection */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Central Node</label>
          <select
            value={centralNodeIndex}
            onChange={e => setCentralNodeIndex(Number(e.target.value))}
            style={{
              borderRadius: 5,
              padding: '2px 8px',
              fontSize: '0.97em',
              background: mode === 'night' ? '#23203a' : '#fff',
              color: mode === 'night' ? '#fff' : '#23203a',
              border: '1px solid #c300ff55',
              outline: 'none',
              minWidth: 80,
            }}
          >
            {nodeOptions.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Each control row is a flex row with label and input aligned */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Nodes</label>
          <input type="number" min={1} max={20} value={nodeCount} onChange={e => setNodeCount(Number(e.target.value))} style={panelNumberStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Traits (per node)</label>
          <input type="number" min={1} max={6} value={attributeCount} onChange={e => setAttributeCount(Number(e.target.value))} style={panelNumberStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Attraction</label>
          <input type="range" min={0.1} max={2} step={0.01} value={k} onChange={e => setK(Number(e.target.value))} style={panelSliderStyle} />
          <span style={panelValueStyle}>{k.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Repulsion</label>
          <input type="range" min={0.1} max={2} step={0.01} value={kRep} onChange={e => setKRep(Number(e.target.value))} style={panelSliderStyle} />
          <span style={panelValueStyle}>{kRep.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Angular Speed</label>
          <input type="range" min={0.01} max={2} step={0.01} value={angularSpeed} onChange={e => setAngularSpeed(Number(e.target.value))} style={panelSliderStyle} />
          <span style={panelValueStyle}>{angularSpeed.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Node Size</label>
          <input type="range" min={0.5} max={5} step={0.1} value={nodeSize} onChange={e => setNodeSize(Number(e.target.value))} style={panelSliderStyle} />
          <span style={panelValueStyle}>{nodeSize.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Sun Size</label>
          <input type="range" min={1} max={10} step={0.1} value={centralSize} onChange={e => setCentralSize(Number(e.target.value))} style={panelSliderStyle} />
          <span style={panelValueStyle}>{centralSize.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Node Color</label>
          <input type="color" value={nodeColor} onChange={e => setNodeColor(e.target.value)} style={{ ...panelNumberStyle, width: 36, height: 28, padding: 0, border: 'none', background: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Sun Color</label>
          <input type="color" value={centralColor} onChange={e => setCentralColor(e.target.value)} style={{ ...panelNumberStyle, width: 36, height: 28, padding: 0, border: 'none', background: 'none' }} />
        </div>
        {/* Node Distribution Toggle */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#c300ff', fontSize: '0.97em' }}>
            Node Distribution:
          </label>
          <div style={{ marginTop: 6 }}>
            <button
              onClick={() => setRandomNodeDistribution(true)}
              style={{
                background: randomNodeDistribution ? '#c300ff' : '#23203a',
                color: randomNodeDistribution ? '#fff' : '#c300ff',
                border: '2px solid #c300ff',
                borderRadius: 8,
                padding: '4px 10px',
                fontWeight: 'bold',
                fontSize: '0.97em',
                marginRight: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Random
            </button>
            <button
              onClick={() => setRandomNodeDistribution(false)}
              style={{
                background: !randomNodeDistribution ? '#c300ff' : '#23203a',
                color: !randomNodeDistribution ? '#fff' : '#c300ff',
                border: '2px solid #c300ff',
                borderRadius: 8,
                padding: '4px 10px',
                fontWeight: 'bold',
                fontSize: '0.97em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Even
            </button>
          </div>
        </div>
        {/* Debug Forces Toggle */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#00ffff', fontSize: '0.97em' }}>
            Show Force Arrows:
          </label>
          <button
            onClick={() => setDebugForces(!debugForces)}
            style={{
              background: debugForces ? '#00ffff' : '#23203a',
              color: debugForces ? '#23203a' : '#00ffff',
              border: '2px solid #00ffff',
              borderRadius: 8,
              padding: '4px 10px',
              fontWeight: 'bold',
              fontSize: '0.97em',
              marginLeft: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {debugForces ? 'On' : 'Off'}
          </button>
        </div>
        {/* Spring Connections Toggle */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600, color: '#ff00ff', fontSize: '0.97em' }}>
            Show Spring Connections:
          </label>
          <button
            onClick={() => setShowSprings(!showSprings)}
            style={{
              background: showSprings ? '#ff00ff' : '#23203a',
              color: showSprings ? '#fff' : '#ff00ff',
              border: '2px solid #ff00ff',
              borderRadius: 8,
              padding: '4px 10px',
              fontWeight: 'bold',
              fontSize: '0.97em',
              marginLeft: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {showSprings ? 'On' : 'Off'}
          </button>
        </div>
      </div>
      {/* Camera Controls - compact row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 2,
        width: '100%',
      }}>
        <button style={iconBtnStyle} onClick={() => onCameraMove('up')} title="Pan Up"><ArrowUp size={18} /></button>
        <button style={iconBtnStyle} onClick={() => onCameraMove('down')} title="Pan Down"><ArrowDown size={18} /></button>
        <button style={iconBtnStyle} onClick={() => onCameraMove('left')} title="Pan Left"><ArrowLeft size={18} /></button>
        <button style={iconBtnStyle} onClick={() => onCameraMove('right')} title="Pan Right"><ArrowRight size={18} /></button>
        <button style={iconBtnStyle} onClick={onZoomIn} title="Zoom In"><ZoomIn size={18} /></button>
        <button style={iconBtnStyle} onClick={onZoomOut} title="Zoom Out"><ZoomOut size={18} /></button>
        <button style={iconBtnStyle} onClick={onResetCamera} title="Reset Camera"><RefreshCw size={18} /></button>
        <button style={iconBtnStyle} onClick={onLockToggle} title={lockState ? 'Unlock Camera' : 'Lock Camera'}>{lockState ? <Unlock size={18} /> : <Lock size={18} />}</button>
      </div>
      {/* NodeSliders for selected node */}
      {nodes[selectedNodeIndex] && (
        // Change 'export const NodeSliders' to 'const NodeSliders' to avoid export conflict
        <NodeSliders
          node={nodes[selectedNodeIndex]}
          onChange={handleNodeSliderChange}
        />
      )}
    </div>
  );
};

// --- Helper Components ---

// NodeSliders: Dynamic sliders for traits and preferences
const NodeSliders: React.FC<{
  node: { traits: { [key: string]: number }; preferences: { [key: string]: number } };
  onChange: (field: 'traits' | 'preferences', key: string, value: number) => void;
}> = ({ node, onChange }) => (
  <div style={{ marginTop: 16, marginBottom: 16 }}>
    <h3 style={{ color: '#C300FF', marginBottom: 8 }}>Traits</h3>
    {Object.keys(node.traits).map(key => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <label style={{ minWidth: 80 }}>{key}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={node.traits[key]}
          onChange={e => onChange('traits', key, Number(e.target.value))}
          style={{ flex: 1, accentColor: '#60a5fa' }}
        />
        <span style={{ minWidth: 32, color: '#60a5fa' }}>{node.traits[key]}</span>
      </div>
    ))}
    <h3 style={{ color: '#C300FF', margin: '12px 0 8px 0' }}>Preferences</h3>
    {Object.keys(node.preferences).map(key => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <label style={{ minWidth: 80 }}>{key}</label>
        <input
          type="range"
          min={0}
          max={100}
          value={node.preferences[key]}
          onChange={e => onChange('preferences', key, Number(e.target.value))}
          style={{ flex: 1, accentColor: '#c084fc' }}
        />
        <span style={{ minWidth: 32, color: '#c084fc' }}>{node.preferences[key]}</span>
      </div>
    ))}
  </div>
);
