"""
Routing Engine for Computer Networks Laboratory
Implements:
1. True Dijkstra Shortest-Path Routing (Base Distance / Physical Metric)
2. Intelligent Performance-Aware Routing (Normalized Composite Metric)
3. Dynamic Forwarding / Routing Table Generation
4. Packet Transmission Flow Trace Simulation
5. Metric Normalization and Trade-Off Analysis

NO HARDCODED VALUES: All metrics and paths are calculated dynamically from the active graph.
"""

from typing import Dict, Any, List, Optional, Tuple
import networkx as nx

class NetworkRoutingEngine:
    def __init__(self, topology_data: Dict[str, Any]):
        self.raw_topology = topology_data
        self.nodes = [dict(n) for n in topology_data.get("nodes", [])]
        self.edges = [dict(e) for e in topology_data.get("edges", [])]
        self._build_graph()

    def _build_graph(self):
        """Constructs an undirected NetworkX graph from the edge list."""
        self.G = nx.Graph()
        for node in self.nodes:
            self.G.add_node(node["id"], **node)
        
        for edge in self.edges:
            # Undirected bidirectional link in telecommunication networks
            self.G.add_edge(
                edge["source"],
                edge["target"],
                id=edge.get("id", f"{edge['source']}-{edge['target']}"),
                distance=float(edge.get("distance", 10.0)),
                delay=float(edge.get("delay", 10.0)),
                congestion=float(edge.get("congestion", 10.0)),
                bandwidth=float(edge.get("bandwidth", 1000.0)),
                cost=float(edge.get("cost", 10.0))
            )

    def update_edge(self, edge_id: str, updates: Dict[str, float]) -> bool:
        """Dynamically update an edge's metrics (e.g. congestion, delay, bandwidth, cost)."""
        updated = False
        for edge in self.edges:
            if edge.get("id") == edge_id or (
                (edge["source"] == updates.get("source") and edge["target"] == updates.get("target")) or
                (edge["source"] == updates.get("target") and edge["target"] == updates.get("source"))
            ):
                for k, v in updates.items():
                    if k in ["distance", "delay", "congestion", "bandwidth", "cost"]:
                        edge[k] = float(v)
                updated = True
                break
        if updated:
            self._build_graph()
        return updated

    def add_node(self, node_data: Dict[str, Any]) -> bool:
        """Add a new router node to the network."""
        node_id = node_data.get("id")
        if not node_id or any(n["id"] == node_id for n in self.nodes):
            return False
        self.nodes.append(node_data)
        self._build_graph()
        return True

    def add_edge(self, edge_data: Dict[str, Any]) -> bool:
        """Add a new communication link between two existing routers."""
        src = edge_data.get("source")
        dst = edge_data.get("target")
        if not src or not dst or src == dst:
            return False
        node_ids = {n["id"] for n in self.nodes}
        if src not in node_ids or dst not in node_ids:
            return False
        
        edge_id = edge_data.get("id", f"{src}-{dst}")
        # check duplicate
        if any(e.get("id") == edge_id for e in self.edges):
            return False

        new_edge = {
            "id": edge_id,
            "source": src,
            "target": dst,
            "distance": float(edge_data.get("distance", 15.0)),
            "delay": float(edge_data.get("delay", 15.0)),
            "congestion": float(edge_data.get("congestion", 10.0)),
            "bandwidth": float(edge_data.get("bandwidth", 1000.0)),
            "cost": float(edge_data.get("cost", 10.0))
        }
        self.edges.append(new_edge)
        self._build_graph()
        return True

    def get_topology(self) -> Dict[str, Any]:
        """Returns the current state of nodes and links."""
        return {
            "nodes": self.nodes,
            "edges": self.edges
        }

    def _calculate_normalizations(self) -> Dict[str, Tuple[float, float]]:
        """
        Computes min and max values across all edges in the active network graph
        for Distance, Delay, Congestion, and Administrative Cost.
        """
        if not self.edges:
            return {
                "distance": (0.0, 1.0),
                "delay": (0.0, 1.0),
                "congestion": (0.0, 100.0),
                "cost": (0.0, 1.0)
            }

        distances = [float(e.get("distance", 1.0)) for e in self.edges]
        delays = [float(e.get("delay", 1.0)) for e in self.edges]
        congestions = [float(e.get("congestion", 0.0)) for e in self.edges]
        costs = [float(e.get("cost", 1.0)) for e in self.edges]

        return {
            "distance": (min(distances), max(distances)),
            "delay": (min(delays), max(delays)),
            "congestion": (0.0, 100.0), # Congestion is naturally 0-100%
            "cost": (min(costs), max(costs))
        }

    def calculate_composite_graph(self, weights: Dict[str, float]) -> nx.Graph:
        """
        Calculates normalized composite edge weights based on:
        C(e) = W_d * D_norm(e) + W_t * T_norm(e) + W_c * C_norm(e) + W_k * K_norm(e)
        where weights are normalized so their sum is 1.0.
        """
        norm_ranges = self._calculate_normalizations()

        raw_wd = max(0.0, float(weights.get("distance", 0.30)))
        raw_wt = max(0.0, float(weights.get("delay", 0.30)))
        raw_wc = max(0.0, float(weights.get("congestion", 0.25)))
        raw_wk = max(0.0, float(weights.get("cost", 0.15)))

        total_weight = raw_wd + raw_wt + raw_wc + raw_wk
        if total_weight <= 0:
            wd = wt = wc = wk = 0.25
        else:
            wd = raw_wd / total_weight
            wt = raw_wt / total_weight
            wc = raw_wc / total_weight
            wk = raw_wk / total_weight

        composite_G = self.G.copy()

        def min_max_norm(val: float, r: Tuple[float, float]) -> float:
            low, high = r
            if high - low == 0:
                return 0.5
            return max(0.0, min(1.0, (val - low) / (high - low)))

        for u, v, data in composite_G.edges(data=True):
            d_norm = min_max_norm(data["distance"], norm_ranges["distance"])
            t_norm = min_max_norm(data["delay"], norm_ranges["delay"])
            c_norm = min_max_norm(data["congestion"], norm_ranges["congestion"])
            k_norm = min_max_norm(data["cost"], norm_ranges["cost"])

            # Composite cost formula
            # Epsilon ensures non-zero strictly positive cost for Dijkstra
            comp_cost = (wd * d_norm) + (wt * t_norm) + (wc * c_norm) + (wk * k_norm) + 0.001

            data["d_norm"] = round(d_norm, 4)
            data["t_norm"] = round(t_norm, 4)
            data["c_norm"] = round(c_norm, 4)
            data["k_norm"] = round(k_norm, 4)
            data["composite_cost"] = round(comp_cost, 4)

        return composite_G

    def _get_edge_data(self, graph: nx.Graph, u: str, v: str) -> Dict[str, Any]:
        """Safely fetch edge attributes between two nodes."""
        if graph.has_edge(u, v):
            return dict(graph[u][v])
        return {}

    def _calculate_path_metrics(self, graph: nx.Graph, path: List[str]) -> Dict[str, Any]:
        """
        Given a graph and an ordered path of router nodes [v0, v1, ..., vk],
        computes the aggregate network layer metrics.
        """
        if not path or len(path) < 2:
            return {
                "path": path,
                "hop_count": 0,
                "total_distance": 0.0,
                "total_delay": 0.0,
                "effective_delay": 0.0,
                "bottleneck_bandwidth": 0.0,
                "average_congestion": 0.0,
                "max_congestion": 0.0,
                "total_composite_cost": 0.0,
                "edges_traversed": []
            }

        hop_count = len(path) - 1
        total_distance = 0.0
        total_delay = 0.0
        effective_delay = 0.0
        min_bw = float("inf")
        congestions = []
        total_comp_cost = 0.0
        edges_traversed = []

        for i in range(hop_count):
            u, v = path[i], path[i+1]
            e_data = self._get_edge_data(graph, u, v)

            dist = float(e_data.get("distance", 0.0))
            delay = float(e_data.get("delay", 0.0))
            cong = float(e_data.get("congestion", 0.0))
            bw = float(e_data.get("bandwidth", 1000.0))
            comp_cost = float(e_data.get("composite_cost", 0.0))

            # Effective delay includes queuing delay model based on congestion:
            # Q_factor = 1 + (cong / (100 - min(cong, 95))) * 0.4
            q_factor = 1.0 + (cong / max(5.0, (100.0 - min(cong, 95.0)))) * 0.4
            eff_link_delay = delay * q_factor

            total_distance += dist
            total_delay += delay
            effective_delay += eff_link_delay
            min_bw = min(min_bw, bw)
            congestions.append(cong)
            total_comp_cost += comp_cost

            edges_traversed.append({
                "from": u,
                "to": v,
                "id": e_data.get("id", f"{u}-{v}"),
                "distance": dist,
                "delay": delay,
                "effective_delay": round(eff_link_delay, 2),
                "congestion": cong,
                "bandwidth": bw,
                "composite_cost": round(comp_cost, 4)
            })

        avg_cong = sum(congestions) / len(congestions) if congestions else 0.0
        max_cong = max(congestions) if congestions else 0.0

        return {
            "path": path,
            "hop_count": hop_count,
            "total_distance": round(total_distance, 2),
            "total_delay": round(total_delay, 2),
            "effective_delay": round(effective_delay, 2),
            "bottleneck_bandwidth": round(min_bw if min_bw != float("inf") else 0.0, 1),
            "average_congestion": round(avg_cong, 1),
            "max_congestion": round(max_cong, 1),
            "total_composite_cost": round(total_comp_cost, 4),
            "edges_traversed": edges_traversed
        }

    def compute_routes(
        self,
        source: str,
        destination: str,
        weights: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Runs both Dijkstra Shortest-Path (baseline distance metric) and
        Intelligent Performance-Aware Routing (composite metric),
        calculating all comparative metrics dynamically.
        """
        if source not in self.G or destination not in self.G:
            raise ValueError(f"Source '{source}' or Destination '{destination}' does not exist in graph.")
        if source == destination:
            raise ValueError("Source and Destination nodes must be distinct routers.")

        if not nx.has_path(self.G, source, destination):
            raise ValueError(f"No communication path exists between router {source} and {destination}.")

        # 1. Dijkstra Shortest-Path Baseline (uses physical distance as edge weight)
        dijkstra_path = nx.shortest_path(self.G, source=source, target=destination, weight="distance")

        # 2. Intelligent Performance-Aware Routing (uses composite cost)
        composite_G = self.calculate_composite_graph(weights)
        intelligent_path = nx.shortest_path(composite_G, source=source, target=destination, weight="composite_cost")

        # Compute full path metrics for both paths on the composite graph
        dijkstra_metrics = self._calculate_path_metrics(composite_G, dijkstra_path)
        intelligent_metrics = self._calculate_path_metrics(composite_G, intelligent_path)

        # Generate routing table for the source router
        routing_table_data = self._generate_routing_table(composite_G, source)

        # Comparative analysis explanation derived strictly from calculated values
        analysis = self._generate_analysis(dijkstra_metrics, intelligent_metrics)

        # Format link cost breakdown for all links in the topology for transparency
        links_evaluated = []
        for u, v, data in composite_G.edges(data=True):
            links_evaluated.append({
                "id": data.get("id", f"{u}-{v}"),
                "source": u,
                "target": v,
                "distance": data["distance"],
                "delay": data["delay"],
                "congestion": data["congestion"],
                "cost": data["cost"],
                "bandwidth": data["bandwidth"],
                "d_norm": data["d_norm"],
                "t_norm": data["t_norm"],
                "c_norm": data["c_norm"],
                "k_norm": data["k_norm"],
                "composite_cost": data["composite_cost"]
            })

        return {
            "source": source,
            "destination": destination,
            "weights_applied": {
                "distance": weights.get("distance", 0.30),
                "delay": weights.get("delay", 0.30),
                "congestion": weights.get("congestion", 0.25),
                "cost": weights.get("cost", 0.15)
            },
            "dijkstra": dijkstra_metrics,
            "intelligent": intelligent_metrics,
            "analysis": analysis,
            "routing_table": routing_table_data,
            "links_evaluated": links_evaluated
        }

    def _generate_routing_table(self, graph: nx.Graph, source: str) -> List[Dict[str, Any]]:
        """
        Generates the forwarding / routing table for the specified source router,
        listing next-hop router, hop count, metric cost, and forwarding path to each reachable destination.
        """
        routing_table = []
        all_nodes = sorted([n for n in self.G.nodes() if n != source])

        for dest in all_nodes:
            if nx.has_path(graph, source, dest):
                path = nx.shortest_path(graph, source=source, target=dest, weight="composite_cost")
                next_hop = path[1] if len(path) > 1 else dest
                metrics = self._calculate_path_metrics(graph, path)
                routing_table.append({
                    "destination": dest,
                    "next_hop": next_hop,
                    "hop_count": metrics["hop_count"],
                    "composite_cost": metrics["total_composite_cost"],
                    "end_to_end_delay": metrics["effective_delay"],
                    "path_str": " -> ".join(path),
                    "path": path
                })
        return routing_table

    def _generate_analysis(
        self,
        dijkstra: Dict[str, Any],
        intelligent: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Produces factual Computer Networks trade-off analysis comparing the two paths.
        Derived strictly from computed path metrics.
        """
        d_path = dijkstra["path"]
        i_path = intelligent["path"]
        same_path = (d_path == i_path)

        dist_diff = round(intelligent["total_distance"] - dijkstra["total_distance"], 2)
        delay_diff = round(intelligent["effective_delay"] - dijkstra["effective_delay"], 2)
        cong_diff = round(intelligent["average_congestion"] - dijkstra["average_congestion"], 1)
        cost_diff = round(intelligent["total_composite_cost"] - dijkstra["total_composite_cost"], 4)

        reasons = []

        if same_path:
            summary = "Both routing algorithms converged to the identical path under current network metrics."
            reasons.append("The topology and metric weights indicate the shortest physical distance path also maintains acceptable congestion and transmission delays.")
            reasons.append(f"Selected route: {' -> '.join(d_path)} with {dijkstra['hop_count']} hops and {dijkstra['total_composite_cost']} composite cost.")
        else:
            summary = "Intelligent Performance-Aware Routing selected an alternate path optimizing multi-metric network health."

            if dist_diff > 0:
                reasons.append(f"Distance Trade-off: Dijkstra selected a physically shorter route ({dijkstra['total_distance']} km vs {intelligent['total_distance']} km, saving {abs(dist_diff)} km).")
            elif dist_diff < 0:
                reasons.append(f"Distance: Intelligent route is actually {abs(dist_diff)} km shorter.")

            if cong_diff < 0:
                reasons.append(f"Congestion Avoidance: Intelligent route reduced average path congestion by {abs(cong_diff)}% ({intelligent['average_congestion']}% vs {dijkstra['average_congestion']}% on Dijkstra).")
                if dijkstra["max_congestion"] > intelligent["max_congestion"]:
                    reasons.append(f"Bottleneck Bypass: Dijkstra traversed a link with peak congestion of {dijkstra['max_congestion']}%, while Intelligent route capped peak congestion to {intelligent['max_congestion']}%.")

            if delay_diff < 0:
                reasons.append(f"End-to-End Delay: Intelligent route reduces effective transmission delay by {abs(delay_diff)} ms ({intelligent['effective_delay']} ms vs {dijkstra['effective_delay']} ms) due to minimized queuing latency.")
            elif delay_diff > 0:
                reasons.append(f"Transmission Delay: Intelligent route has slightly higher base delay ({intelligent['effective_delay']} ms vs {dijkstra['effective_delay']} ms) to bypass congested segments.")

            if cost_diff < 0:
                reasons.append(f"Composite Optimization: Intelligent path achieves a lower total composite cost ({intelligent['total_composite_cost']} vs {dijkstra['total_composite_cost']}).")

        return {
            "is_same_path": same_path,
            "summary": summary,
            "reasons": reasons,
            "delta": {
                "distance_km": dist_diff,
                "delay_ms": delay_diff,
                "avg_congestion_pct": cong_diff,
                "composite_cost": cost_diff
            }
        }

    def simulate_packet_trace(self, path: List[str], packet_id: str = "PKT-101") -> Dict[str, Any]:
        """
        Simulates step-by-step packet transmission across the calculated router path,
        computing per-hop ingress/egress timestamps, queuing delays, and link utilization.
        """
        if not path or len(path) < 2:
            return {"packet_id": packet_id, "hops": [], "delivered": False, "total_time_ms": 0.0}

        hops = []
        current_time = 0.0

        for i in range(len(path) - 1):
            curr_node = path[i]
            next_node = path[i + 1]
            e_data = self._get_edge_data(self.G, curr_node, next_node)

            prop_delay = float(e_data.get("delay", 10.0))
            cong = float(e_data.get("congestion", 10.0))
            bw = float(e_data.get("bandwidth", 1000.0))
            dist = float(e_data.get("distance", 10.0))

            # Queuing delay proportional to link congestion
            # Queuing formula: T_queue = (cong / max(1.0, 100 - cong)) * 5.0 ms
            queue_delay = round((cong / max(5.0, 100.0 - min(cong, 95.0))) * 5.0, 2)
            # Serialization delay for a standard 1500-byte MTU frame: (1500 * 8) / (bw * 10^6) seconds
            serialization_delay = round((1500 * 8) / (bw * 1000.0), 3) # in ms
            hop_latency = round(prop_delay + queue_delay + serialization_delay, 2)

            start_t = round(current_time, 2)
            end_t = round(current_time + hop_latency, 2)
            current_time = end_t

            drop_risk = "LOW"
            if cong > 80.0:
                drop_risk = "HIGH (Queue Overflow Risk)"
            elif cong > 50.0:
                drop_risk = "MODERATE"

            hops.append({
                "hop_number": i + 1,
                "current_node": curr_node,
                "next_hop": next_node,
                "link_id": e_data.get("id", f"{curr_node}-{next_node}"),
                "distance_km": dist,
                "propagation_delay_ms": prop_delay,
                "queuing_delay_ms": queue_delay,
                "serialization_delay_ms": serialization_delay,
                "hop_latency_ms": hop_latency,
                "arrival_time_ms": start_t,
                "departure_time_ms": end_t,
                "link_congestion_pct": cong,
                "bandwidth_mbps": bw,
                "drop_risk": drop_risk,
                "status": "FORWARDED"
            })

        return {
            "packet_id": packet_id,
            "source": path[0],
            "destination": path[-1],
            "total_hops": len(hops),
            "total_time_ms": round(current_time, 2),
            "delivered": True,
            "hops": hops
        }
