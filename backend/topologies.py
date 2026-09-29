"""
Network Topology Presets for Computer Networks Routing Lab
Defines structured graph datasets representing router networks.
"""

from typing import Dict, Any, List

def get_preset_topologies() -> Dict[str, Dict[str, Any]]:
    return {
        "lab_core_6": {
            "id": "lab_core_6",
            "name": "6-Node Core & Distribution Topology",
            "description": "Standard 6-router topology from project specification with alternate paths via N2-N4 and N3-N5.",
            "nodes": [
                {"id": "N1", "label": "Router N1 (Ingress)", "x": 120, "y": 250, "role": "ingress", "ip": "10.0.1.1"},
                {"id": "N2", "label": "Router N2 (Core North)", "x": 320, "y": 120, "role": "core", "ip": "10.0.2.1"},
                {"id": "N3", "label": "Router N3 (Transit Mid)", "x": 320, "y": 380, "role": "transit", "ip": "10.0.3.1"},
                {"id": "N4", "label": "Router N4 (Core North-East)", "x": 560, "y": 120, "role": "core", "ip": "10.0.4.1"},
                {"id": "N5", "label": "Router N5 (Transit South)", "x": 480, "y": 450, "role": "transit", "ip": "10.0.5.1"},
                {"id": "N6", "label": "Router N6 (Egress)", "x": 750, "y": 250, "role": "egress", "ip": "10.0.6.1"}
            ],
            "edges": [
                {
                    "id": "N1-N2",
                    "source": "N1",
                    "target": "N2",
                    "distance": 12.0,   # km
                    "delay": 14.0,      # ms
                    "congestion": 25.0, # %
                    "bandwidth": 1000.0,# Mbps
                    "cost": 10.0        # administrative cost
                },
                {
                    "id": "N1-N3",
                    "source": "N1",
                    "target": "N3",
                    "distance": 16.0,
                    "delay": 18.0,
                    "congestion": 15.0,
                    "bandwidth": 1000.0,
                    "cost": 15.0
                },
                {
                    "id": "N1-N5",
                    "source": "N1",
                    "target": "N5",
                    "distance": 32.0,
                    "delay": 35.0,
                    "congestion": 10.0,
                    "bandwidth": 500.0,
                    "cost": 30.0
                },
                {
                    "id": "N2-N3",
                    "source": "N2",
                    "target": "N3",
                    "distance": 10.0,
                    "delay": 12.0,
                    "congestion": 30.0,
                    "bandwidth": 1000.0,
                    "cost": 10.0
                },
                {
                    "id": "N2-N4",
                    "source": "N2",
                    "target": "N4",
                    "distance": 14.0,
                    "delay": 16.0,
                    "congestion": 85.0, # High congestion bottleneck scenario
                    "bandwidth": 1000.0,
                    "cost": 12.0
                },
                {
                    "id": "N3-N4",
                    "source": "N3",
                    "target": "N4",
                    "distance": 18.0,
                    "delay": 20.0,
                    "congestion": 20.0,
                    "bandwidth": 1000.0,
                    "cost": 18.0
                },
                {
                    "id": "N3-N6",
                    "source": "N3",
                    "target": "N6",
                    "distance": 36.0,
                    "delay": 40.0,
                    "congestion": 15.0,
                    "bandwidth": 500.0,
                    "cost": 35.0
                },
                {
                    "id": "N4-N6",
                    "source": "N4",
                    "target": "N6",
                    "distance": 15.0,
                    "delay": 15.0,
                    "congestion": 35.0,
                    "bandwidth": 1000.0,
                    "cost": 14.0
                },
                {
                    "id": "N5-N6",
                    "source": "N5",
                    "target": "N6",
                    "distance": 22.0,
                    "delay": 24.0,
                    "congestion": 12.0,
                    "bandwidth": 1000.0,
                    "cost": 20.0
                },
                {
                    "id": "N3-N5",
                    "source": "N3",
                    "target": "N5",
                    "distance": 14.0,
                    "delay": 15.0,
                    "congestion": 10.0,
                    "bandwidth": 1000.0,
                    "cost": 12.0
                }
            ]
        },
        "backbone_mesh_9": {
            "id": "backbone_mesh_9",
            "name": "9-Node Multi-Tier ISP Backbone Mesh",
            "description": "Multi-tier telecommunications mesh network with redundant regional rings and high-speed core links.",
            "nodes": [
                {"id": "R1", "label": "R1 (West Gateway)", "x": 100, "y": 240, "role": "ingress", "ip": "172.16.1.1"},
                {"id": "R2", "label": "R2 (Northwest Tier-2)", "x": 250, "y": 100, "role": "transit", "ip": "172.16.2.1"},
                {"id": "R3", "label": "R3 (Southwest Tier-2)", "x": 250, "y": 380, "role": "transit", "ip": "172.16.3.1"},
                {"id": "R4", "label": "R4 (Core Backbone North)", "x": 450, "y": 100, "role": "core", "ip": "172.16.4.1"},
                {"id": "R5", "label": "R5 (Central Core Hub)", "x": 450, "y": 240, "role": "core", "ip": "172.16.5.1"},
                {"id": "R6", "label": "R6 (Core Backbone South)", "x": 450, "y": 380, "role": "core", "ip": "172.16.6.1"},
                {"id": "R7", "label": "R7 (Northeast Tier-2)", "x": 650, "y": 100, "role": "transit", "ip": "172.16.7.1"},
                {"id": "R8", "label": "R8 (Southeast Tier-2)", "x": 650, "y": 380, "role": "transit", "ip": "172.16.8.1"},
                {"id": "R9", "label": "R9 (East Gateway)", "x": 800, "y": 240, "role": "egress", "ip": "172.16.9.1"}
            ],
            "edges": [
                {"id": "R1-R2", "source": "R1", "target": "R2", "distance": 18.0, "delay": 20.0, "congestion": 30.0, "bandwidth": 10000.0, "cost": 15.0},
                {"id": "R1-R3", "source": "R1", "target": "R3", "distance": 18.0, "delay": 20.0, "congestion": 25.0, "bandwidth": 10000.0, "cost": 15.0},
                {"id": "R1-R5", "source": "R1", "target": "R5", "distance": 35.0, "delay": 38.0, "congestion": 60.0, "bandwidth": 5000.0, "cost": 30.0},
                {"id": "R2-R4", "source": "R2", "target": "R4", "distance": 20.0, "delay": 22.0, "congestion": 80.0, "bandwidth": 10000.0, "cost": 18.0},
                {"id": "R2-R5", "source": "R2", "target": "R5", "distance": 22.0, "delay": 25.0, "congestion": 20.0, "bandwidth": 10000.0, "cost": 20.0},
                {"id": "R3-R5", "source": "R3", "target": "R5", "distance": 22.0, "delay": 25.0, "congestion": 35.0, "bandwidth": 10000.0, "cost": 20.0},
                {"id": "R3-R6", "source": "R3", "target": "R6", "distance": 20.0, "delay": 22.0, "congestion": 15.0, "bandwidth": 10000.0, "cost": 18.0},
                {"id": "R4-R5", "source": "R4", "target": "R5", "distance": 15.0, "delay": 15.0, "congestion": 45.0, "bandwidth": 20000.0, "cost": 10.0},
                {"id": "R4-R7", "source": "R4", "target": "R7", "distance": 20.0, "delay": 22.0, "congestion": 75.0, "bandwidth": 10000.0, "cost": 18.0},
                {"id": "R5-R6", "source": "R5", "target": "R6", "distance": 15.0, "delay": 15.0, "congestion": 20.0, "bandwidth": 20000.0, "cost": 10.0},
                {"id": "R5-R7", "source": "R5", "target": "R7", "distance": 25.0, "delay": 28.0, "congestion": 30.0, "bandwidth": 10000.0, "cost": 22.0},
                {"id": "R5-R8", "source": "R5", "target": "R8", "distance": 25.0, "delay": 28.0, "congestion": 20.0, "bandwidth": 10000.0, "cost": 22.0},
                {"id": "R6-R8", "source": "R6", "target": "R8", "distance": 20.0, "delay": 22.0, "congestion": 15.0, "bandwidth": 10000.0, "cost": 18.0},
                {"id": "R7-R9", "source": "R7", "target": "R9", "distance": 18.0, "delay": 20.0, "congestion": 40.0, "bandwidth": 10000.0, "cost": 15.0},
                {"id": "R8-R9", "source": "R8", "target": "R9", "distance": 18.0, "delay": 20.0, "congestion": 18.0, "bandwidth": 10000.0, "cost": 15.0},
                {"id": "R5-R9", "source": "R5", "target": "R9", "distance": 35.0, "delay": 38.0, "congestion": 70.0, "bandwidth": 5000.0, "cost": 30.0}
            ]
        }
    }
