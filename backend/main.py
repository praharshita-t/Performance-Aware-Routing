"""
FastAPI Backend for Performance-Aware Routing Using Composite Network Metrics
Computer Networks Laboratory API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import uvicorn

try:
    from backend.topologies import get_preset_topologies
    from backend.routing_engine import NetworkRoutingEngine
except ImportError:
    from topologies import get_preset_topologies
    from routing_engine import NetworkRoutingEngine

app = FastAPI(
    title="Computer Networks - Performance-Aware Routing API",
    description="Backend routing engine comparing baseline Dijkstra shortest path with Intelligent Composite Metric routing.",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory active routing engine instance initialized with standard 6-node lab topology
presets = get_preset_topologies()
current_preset_id = "lab_core_6"
engine = NetworkRoutingEngine(presets[current_preset_id])

# Request / Response Schemas
class MetricWeights(BaseModel):
    distance: float = Field(0.30, ge=0.0, le=1.0, description="Weight for physical link distance")
    delay: float = Field(0.30, ge=0.0, le=1.0, description="Weight for transmission/propagation delay")
    congestion: float = Field(0.25, ge=0.0, le=1.0, description="Weight for link congestion percentage")
    cost: float = Field(0.15, ge=0.0, le=1.0, description="Weight for administrative link cost")

class RouteRequest(BaseModel):
    source: str = Field(..., example="N1")
    destination: str = Field(..., example="N6")
    weights: MetricWeights = Field(default_factory=MetricWeights)

class EdgeUpdateRequest(BaseModel):
    edge_id: Optional[str] = None
    source: Optional[str] = None
    target: Optional[str] = None
    distance: Optional[float] = None
    delay: Optional[float] = None
    congestion: Optional[float] = None
    bandwidth: Optional[float] = None
    cost: Optional[float] = None

class AddNodeRequest(BaseModel):
    id: str
    label: str
    x: Optional[float] = 300.0
    y: Optional[float] = 250.0
    role: Optional[str] = "transit"
    ip: Optional[str] = "10.0.0.1"

class AddEdgeRequest(BaseModel):
    source: str
    target: str
    distance: float = 15.0
    delay: float = 15.0
    congestion: float = 10.0
    bandwidth: float = 1000.0
    cost: float = 10.0

class PresetRequest(BaseModel):
    preset_id: str

class PacketSimRequest(BaseModel):
    path: List[str]
    packet_id: Optional[str] = "PKT-101"


@app.get("/")
def read_root():
    return {
        "project": "Performance-Aware Routing Using Composite Network Metrics",
        "lab": "Computer Networks",
        "status": "READY",
        "active_preset": current_preset_id,
        "nodes_count": len(engine.nodes),
        "edges_count": len(engine.edges)
    }

@app.get("/api/network")
def get_network():
    """Retrieve current network topology and available presets."""
    return {
        "preset_id": current_preset_id,
        "available_presets": [
            {"id": p_id, "name": p["name"], "description": p["description"]}
            for p_id, p in presets.items()
        ],
        "topology": engine.get_topology()
    }

@app.post("/api/network/preset")
def load_preset(req: PresetRequest):
    """Load a predefined network topology."""
    global engine, current_preset_id
    if req.preset_id not in presets:
        raise HTTPException(status_code=404, detail=f"Preset '{req.preset_id}' not found.")
    current_preset_id = req.preset_id
    engine = NetworkRoutingEngine(presets[current_preset_id])
    return {
        "message": f"Loaded preset '{presets[current_preset_id]['name']}'",
        "preset_id": current_preset_id,
        "topology": engine.get_topology()
    }

@app.post("/api/network/edge")
def update_edge(req: EdgeUpdateRequest):
    """Update link metrics such as congestion, delay, or cost."""
    updates = {}
    if req.distance is not None:
        updates["distance"] = req.distance
    if req.delay is not None:
        updates["delay"] = req.delay
    if req.congestion is not None:
        updates["congestion"] = req.congestion
    if req.bandwidth is not None:
        updates["bandwidth"] = req.bandwidth
    if req.cost is not None:
        updates["cost"] = req.cost
    if req.source:
        updates["source"] = req.source
    if req.target:
        updates["target"] = req.target

    success = engine.update_edge(req.edge_id or "", updates)
    if not success:
        raise HTTPException(status_code=404, detail="Edge could not be found or updated.")
    return {
        "message": "Edge metrics updated successfully",
        "topology": engine.get_topology()
    }

class BatchEdgeUpdateRequest(BaseModel):
    edges: List[Dict[str, Any]]

@app.post("/api/network/batch-update")
def batch_update_edges(req: BatchEdgeUpdateRequest):
    """Batch update multiple edges simultaneously (e.g. clear or randomize traffic)."""
    for e in req.edges:
        edge_id = e.get("edge_id") or e.get("id") or f"{e.get('source')}-{e.get('target')}"
        engine.update_edge(edge_id, e)
    return {
        "message": f"Updated {len(req.edges)} communication links successfully",
        "topology": engine.get_topology()
    }

@app.post("/api/network/node")
def add_node(req: AddNodeRequest):
    """Add a new router node to the graph."""
    success = engine.add_node(req.dict())
    if not success:
        raise HTTPException(status_code=400, detail="Node already exists or invalid data.")
    return {
        "message": f"Router node '{req.id}' added.",
        "topology": engine.get_topology()
    }

@app.post("/api/network/add-edge")
def add_edge(req: AddEdgeRequest):
    """Add a new communication link between existing routers."""
    success = engine.add_edge(req.dict())
    if not success:
        raise HTTPException(status_code=400, detail="Cannot create edge (nodes missing, self-loop, or duplicate edge).")
    return {
        "message": f"Link '{req.source} - {req.target}' added.",
        "topology": engine.get_topology()
    }

@app.post("/api/route")
def compute_route(req: RouteRequest):
    """
    Core Routing Engine Endpoint:
    Computes both Dijkstra and Intelligent Performance-Aware Routing
    using current graph topology and dynamic user metric weights.
    """
    try:
        result = engine.compute_routes(
            source=req.source,
            destination=req.destination,
            weights=req.weights.dict()
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")

@app.post("/api/simulate/packet")
def simulate_packet(req: PacketSimRequest):
    """Simulate packet hop-by-hop forwarding along calculated path."""
    try:
        trace = engine.simulate_packet_trace(req.path, req.packet_id or "PKT-101")
        return trace
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Packet simulation error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
