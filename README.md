# Performance-Aware Routing Using Composite Network Metrics
### Computer Networks Laboratory Project

A full-stack Computer Networks routing simulator and research dashboard comparing baseline **Dijkstra Shortest-Path Routing** (distance-optimized) against **Intelligent Performance-Aware Routing** (multi-metric composite QoS).

---

## 🌐 Mathematical Model & Pipeline

```
NETWORK TOPOLOGY GRAPH
         ↓
LINK / EDGE RAW METRICS (Distance D, Propagation Delay T, Congestion C, Administrative Cost K)
         ↓
MIN-MAX NORMALIZATION
  D_norm(e) = (D(e) - D_min) / (D_max - D_min)
  T_norm(e) = (T(e) - T_min) / (T_max - T_min)
  C_norm(e) = C(e) / 100.0
  K_norm(e) = (K(e) - K_min) / (K_max - K_min)
         ↓
COMPOSITE LINK WEIGHT FORMULA
  C(e) = W_d · D_norm(e) + W_t · T_norm(e) + W_c · C_norm(e) + W_k · K_norm(e) + ε
  (where W_d + W_t + W_c + W_k = 1.0)
         ↓
SHORTEST PATH ENGINE (NetworkX Dijkstra)
  • Baseline: Dijkstra on D(e)
  • Intelligent: Dijkstra on C(e)
         ↓
FORWARDING / ROUTING TABLE (FIB) GENERATION
         ↓
DISCRETE PACKET TRANSMISSION TRACE (Queuing Latency & Buffer Risk)
         ↓
QUANTITATIVE TRADE-OFF ANALYSIS
```

> **Zero Hardcoded Routes or Metrics:** All routes, hop counts, end-to-end delays, composite costs, forwarding table entries, and trade-off summaries are computed dynamically from the active graph.

---

## 🚀 How to Run the Application

The application is already running in background daemons:
- **Frontend Dashboard:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **FastAPI Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive API Docs (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Running Manually

If you restart your terminal:

#### 1. Start the Backend Server
```powershell
# From project root:
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start the Frontend Server
```powershell
# In a second terminal:
cd frontend
npm run dev
```
Open **`http://127.0.0.1:5173`** in your browser.

---

## 🎓 Faculty Demonstration Walkthrough

1. **Topology Overview**:
   - Open the dashboard at `http://127.0.0.1:5173`.
   - Explain the 6-Router Core & Distribution Topology ($N_1$ to $N_6$) on the SVG canvas.
   - Point out that edges have physical distance (km), propagation delay (ms), bandwidth (Mbps), and congestion (%).

2. **Select Endpoints**:
   - Ingress Router: **$N_1$**, Egress Router: **$N_6$**.
   - Set weights to default balanced or distance-heavy profile.
   - Click **Compute & Compare Routes**.
   - Notice both algorithms pick the shortest physical path: **$N_1 \rightarrow N_2 \rightarrow N_4 \rightarrow N_6$** (41 km).

3. **Dynamic Congestion Surge (The Core Demonstration)**:
   - Click **"Inject Bottleneck on N2-N4 (85%)"** or click directly on link $N_2 - N_4$ on the graph to slide its congestion to 85%.
   - In the weights panel, click **"⚡ Congestion Sensitive"** (Congestion weight: ~50-55%).
   - Click **Compute & Compare Routes**.
   - **Observe the Result**:
     - **Dijkstra** remains locked to $N_1 \rightarrow N_2 \rightarrow N_4 \rightarrow N_6$ because it only considers distance (41 km), but suffers high queuing delay and 85% peak congestion.
     - **Intelligent Routing** automatically reroutes via $N_1 \rightarrow N_3 \rightarrow N_5 \rightarrow N_6$ (or alternate chord), bypassing the bottleneck, capping peak congestion to ~15%, and significantly reducing end-to-end effective delay.
   - Show the **Algorithmic Trade-Off Analysis** box: it mathematically breaks down the distance penalty vs congestion savings and queuing delay reduction.

4. **Forwarding / Routing Table (FIB)**:
   - Switch to the bottom tab **"Forwarding / Routing Table (N1)"**.
   - Show that next hops, hop counts, end-to-end delays, and paths are computed for every reachable destination router in the network domain.

5. **Simulated Packet Flow**:
   - Click **"Run Packet Simulation"** in the Routing Analysis card.
   - Watch the animated packet dot traverse the calculated path hop-by-hop.
   - Switch to the bottom tab **"Packet Flow Trace Telemetry"** to show per-hop propagation, queuing delay ($T_q = f(\text{congestion})$), cumulative elapsed time, and buffer overflow risk assessment.

6. **Normalization Transparency**:
   - Switch to **"Evaluated Link Metrics & Normalizations"** tab to demonstrate the normalized values ($D_{norm}, T_{norm}, C_{norm}, K_{norm}$) and composite link costs $C(e)$ for all links in the topology.
