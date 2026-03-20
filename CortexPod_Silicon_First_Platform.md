# CortexPod: A Silicon-First Platform for Distributed Agent Inference

**Document Type**: Engineering Strategy & Technical Architecture  
**Audience**: Semiconductor-literate investors, AI company CTOs, senior chip architects  
**Version**: 1.0 — March 2026  
**Classification**: Confidential — Pre-disclosure

---

## Table of Contents

1. [Strategic Thesis](#1-strategic-thesis)
2. [The Silicon Gap: Why GPUs Are Wrong for Agent Workloads](#2-the-silicon-gap-why-gpus-are-wrong-for-agent-workloads)
3. [CortexChip Architecture](#3-cortexchip-architecture)
4. [Chip Design Roadmap](#4-chip-design-roadmap)
5. [Deployment Platform (The Wrapper)](#5-deployment-platform-the-wrapper)
6. [Economics & Business Case](#6-economics--business-case)
7. [Risks & Honest Assessment](#7-risks--honest-assessment)
8. [Minimum Viable Chip Program](#8-minimum-viable-chip-program)
9. [Killer Assumptions](#9-killer-assumptions)
10. [Appendix: Technical Reference](#10-appendix-technical-reference)

---

## 1. Strategic Thesis

CortexPod is building a custom inference ASIC optimized for agent-mesh workloads, distributed via a Fly.io-style deployment platform, targeting the Asian market where NVIDIA supply is constrained and cost sensitivity is highest.

### Why Agent-Mesh Inference Is Architecturally Different

The dominant LLM deployment pattern of 2023–2024 — a single large model responding to a single request stream — is giving way to something structurally different: **agent meshes**. A financial research task, a software development pipeline, a clinical decision support system — these are not single-model problems. They are networks of specialized agents, each running its own model context, exchanging state in real time, sharing document understanding, and handing off partial work to each other in milliseconds.

This is not a software pattern that can be implemented on top of GPU infrastructure designed for a different problem. It is a fundamentally different **memory access pattern**, a different **scheduling primitive**, and a different **communication topology**. The mismatch is not at the API layer. It is at the silicon level.

Single-model inference optimizes for one thing: moving a large weight matrix through a single computation pipeline as fast as possible. Agent-mesh inference requires something different: holding many concurrent model contexts simultaneously, sharing state across them efficiently, and switching between them with sub-millisecond latency. No amount of CUDA optimization closes that gap, because the gap is in the memory hierarchy and scheduling fabric of the underlying hardware.

### Why This Justifies a Custom Chip

Software optimization on existing GPU hardware can recover perhaps 20–30% of the efficiency loss from architecture mismatch. The remaining gap — in concurrent context capacity, in inter-agent handoff latency, in shared KV cache efficiency — requires hardware changes. The CortexMesh Fabric Controller (CMFC), the central novel contribution of the CortexChip, has no analog in any shipping GPU. It is a dedicated silicon block for agent-mesh coordination that cannot be emulated in software without a 10–25x latency penalty.

The business case is not "we built a cheaper GPU." It is: "for agent-mesh workloads specifically, our chip supports 256 concurrent agent contexts where an H100 supports approximately 8, at one-tenth the cost and less than half the power."

### Why 12nm Is a Strategic Choice, Not a Cost Compromise

The decision to target 12nm FinFET (Samsung SF12 or GlobalFoundries 12LP+) rather than TSMC 5nm or 3nm is deliberate and defensible on multiple axes:

First, the **workload is memory-bandwidth-bound**, not FLOPS-bound. Moving from 12nm to 5nm increases compute density significantly, but the bottleneck for inference is how fast weights and KV cache pages can be loaded — a function of memory interface bandwidth, not transistor density. The additional FLOPS from advanced nodes do not translate proportionally to inference performance.

Second, **foundry independence** is a strategic asset in the current geopolitical environment. TSMC is a single point of failure for the global AI chip supply chain. Building on Samsung SF12 or GF 12LP+, with chiplet packaging via ASE Group rather than TSMC CoWoS, eliminates this dependency and opens markets where TSMC-dependent chips face supply uncertainty.

Third, **NRE cost and time-to-tape-out** at 12nm are achievable for a startup: $60–80M NRE versus $500M+ at 5nm, with yield rates exceeding 85% for mature node designs versus the characteristically lower yields of leading-edge first silicon.

The efficiency gap versus 5nm is real — approximately 3x worse power efficiency per equivalent logic operation. For the inference workloads CortexPod targets, this gap is partially offset by W4A8 quantization (which reduces memory bandwidth requirements by 4x versus FP16) and by the fact that the H100 comparison baseline is itself a 4nm chip drawing 700W TDP. CortexPod targets 300W TDP at comparable or superior agent-mesh throughput.

### The Distributed Brain Metaphor

The CortexChip is the **substrate** — the physical medium in which inference computation occurs, with the architectural properties encoded at fabrication time. The Pods are **neurons** — individual agent contexts, each with its own model state, activation history, and KV cache allocation, running concurrently within the substrate. The CortexMesh Fabric Controller is the **synaptic circuit** — the hardware mechanism through which neurons communicate, share context, and hand off state without traversing the slow path of software scheduling.

This metaphor is not decorative. It reflects a genuine architectural claim: just as biological intelligence emerges from the interaction topology of neurons rather than from the individual capability of any single cell, agent-mesh intelligence emerges from the coordination fabric between Pods rather than from the raw performance of any single inference stream.

---

## 2. The Silicon Gap: Why GPUs Are Wrong for Agent Workloads

### 2a. The Access Pattern Mismatch: A Concrete Example

Consider a financial research mesh with eight specialized pods running concurrently:

| Pod | Role | Model | Context requirement |
|-----|------|-------|-------------------|
| Router | Task decomposition, dispatch | 7B | Shared document context |
| Researcher | Primary analysis | 70B | Full document + query history |
| Data Fetcher | Structured data retrieval | 13B | Schema + recent queries |
| Fact Checker | Claim verification | 70B | Full document + external references |
| Writer | Report synthesis | 70B | All prior agent outputs |
| Compliance | Regulatory scan | 13B | Compliance rules + document sections |
| Translator | Output localization | 13B | Writer output |
| Summarizer | Executive summary | 7B | All prior outputs |

This mesh is not unusual. It represents a minimal production configuration for a financial institution deploying AI for research assistance. The computational requirements it imposes are:

**Simultaneous model contexts**: All eight pods must be schedulable concurrently. A user request to the Router triggers a cascade that activates multiple pods within the same 200ms window. On an H100, model context switching takes 20–50ms per swap in software; maintaining all eight models simultaneously requires holding all their weight and KV cache data in memory simultaneously.

**Shared document KV cache**: The Researcher, Fact Checker, Writer, and Compliance pods all process the same source document. In naive implementation, each pod independently computes KV cache for that document — quadrupling the memory footprint and compute cost. Hardware-accelerated KV cache sharing eliminates this redundancy. GPUs have no hardware mechanism for this; it must be implemented in software with explicit synchronization, adding latency and complexity.

**Sub-5ms handoff latency**: When the Researcher pod completes an analysis step and the Router must dispatch the result to the Writer pod, the handoff includes 32–128KB of KV cache state representing the conversation context. At PCIe 4.0 bandwidth (~32GB/s), moving 128KB takes approximately 4 microseconds — within budget. But software scheduling overhead, memory allocation, and cache management on H100 add 15–50ms of latency around that transfer. The CMFC hardware handoff engine executes the same transfer in under 2ms total, including scheduling and memory mapping.

**Heterogeneous SLA**: The Router pod must respond in under 50ms (interactive). The Writer pod can run asynchronously (batch SLA, minutes). The Compliance pod has a hard deadline gated by regulatory requirements. H100 CUDA streams do not support per-stream priority scheduling at this granularity; CUDA MPS (Multi-Process Service) adds overhead and does not provide the isolation guarantees required for mixed SLA workloads.

On H100 hardware, this mesh requires at minimum 4 H100s just to hold the weight footprint (see Section 2b), software scheduling that adds 50–200ms to each handoff, and no hardware support for shared KV cache. The result is a system that technically works but is 5–10x more expensive and 3–5x slower than necessary.

### 2b. The Memory Architecture Mismatch: Bandwidth Math

The memory footprint of the financial research mesh above, for W4A8 quantization:

| Model size | W4A8 weight footprint | Instances in mesh |
|-----------|----------------------|-------------------|
| 70B | 35 GB | 3 (Researcher, Fact Checker, Writer) |
| 13B | 6.5 GB | 3 (Data Fetcher, Compliance, Translator) |
| 7B | 3.5 GB | 2 (Router, Summarizer) |
| **Total** | **133.5 GB** | **8 pods** |

With shared document KV cache (say, a 50-page research document tokenized to ~25,000 tokens, KV cache at INT8 = ~6GB for a 70B model), the naive non-shared footprint is approximately 133.5GB weights + 8 × 6GB KV = **181.5GB total**.

H100 has 80GB HBM2e per chip. To hold this mesh, you need a minimum of 3 H100s for weights alone, plus additional capacity for KV cache. In practice, tensor parallelism across 4 H100s is the standard configuration, requiring:

- 4× H100 SXM5: $120,000–$160,000 at current pricing
- NVLink bridge for intra-node communication
- Software KV cache management with no hardware sharing support

With hardware-accelerated KV cache sharing (as in CortexChip), the shared document KV cache is stored once: 6GB for the shared context plus model-specific KV for each pod's unique conversation history (approximately 0.5–1GB per pod). Total footprint: 133.5GB weights + 6GB shared KV + 8GB pod-specific KV = **147.5GB** — a 19% reduction from elimination of KV duplication, with hardware enforcement of sharing semantics.

H100's HBM is optimized for sequential large-batch access patterns characteristic of training workloads. Its memory controller prioritizes high sustained bandwidth for contiguous tensor reads, not the random-access, fine-grained page-level addressing that KV cache sharing requires. This is not a driver limitation; it is a memory controller design decision made for training.

### 2c. The Scheduling Granularity Mismatch

CUDA streams were designed for training pipeline parallelism: divide a computation graph into stages, schedule them on different hardware streams, overlap computation and communication. This model assumes a small number of long-running homogeneous tasks.

Agent-mesh inference presents the inverse: a large number (256 on CortexChip, limited to ~8 practical contexts on H100) of short-duration heterogeneous tasks with interdependencies determined at runtime by the mesh topology.

CUDA's scheduling primitives:

- **MPS (Multi-Process Service)**: Allows multiple processes to share GPU, but context switch overhead is 20–50ms and there is no priority model within MPS.
- **MIG (Multi-Instance GPU)**: Hard partitions GPU into isolated slices (up to 7 on A100). Solves isolation but makes sharing (KV cache, weights) impossible between slices.
- **CUDA Streams**: No preemption between streams; a long-running decode step blocks interactive requests on the same stream.

CortexChip's CMFC hardware scheduler:

- 256 hardware priority lanes, each mapped to one Pod instance
- Preemptive scheduling: a high-priority interactive Pod can interrupt a low-priority batch Pod after the current decode step (average 0.5–2ms granularity)
- Context switch implemented as a hardware state machine: saves Pod register file + SRAM slot state in 1.2ms average, loads next Pod state in 0.8ms
- Total preemptive context switch: **<2ms end-to-end**

This 10–25x improvement in context switch latency is the primary reason CortexChip can support 256 concurrent Pods while maintaining <50ms TTFT for interactive SLA classes.

### 2d. Quantifying the Efficiency Gap

For a 256-agent inference workload, 70B W4A8 models, mixed interactive and batch SLA:

| Infrastructure | Chips needed | Capital cost | Power draw | Power cost/month | Latency (interactive TTFT) | Concurrent Pods |
|---|---|---|---|---|---|---|
| H100 cluster | 32× H100 | $960,000 | ~22,400W | ~$8,064 | ~70ms | ~8 active |
| AWS Inferentia2 | ~48 inf2 units | ~$18/hr rental | Included | ~$13,000/mo | ~90ms | ~12 active |
| A100 cluster | 40× A100 | $800,000–$1,200,000 | ~32,000W | ~$11,520 | ~90ms | ~8 active |
| **CortexChip v1 (target)** | **1× chip** | **$3,000** | **~300W** | **~$108** | **<50ms** | **256 active** |

Notes on methodology: H100 pricing reflects current grey market/OEM rates (~$30K/chip). Power cost at $0.12/kWh, 24/7 operation. CortexChip v1 cost estimate is at volume production (500+ chips); early beta pricing will be higher. The 256 concurrent Pod figure for CortexChip is a hardware specification (256 CMFC priority lanes); the ~8 figure for H100 reflects practical VRAM limits for simultaneous weight loading at 70B model size.

The business case is not that CortexChip is 2x better than an H100 on a benchmark. It is that **for a 256-agent mesh, you need 32 H100s or 1 CortexChip**. That is the comparison that matters for agent-mesh deployments, and it is the comparison that no amount of CUDA optimization can close.

---

## 3. CortexChip Architecture

### 3a. Process Node Decision Matrix

| Node | NRE Cost | Foundry Options | EUV Required | Power Efficiency (vs 28nm baseline) | Time to Tape-Out | Geopolitical Risk | CortexPod Verdict |
|------|----------|-----------------|--------------|--------------------------------------|-----------------|-------------------|-------------------|
| **28nm** | $15–30M | SMIC, Samsung, GF, TSMC | No | 1× (baseline) | 12–15 months | Low (mature, widely available) | Too power-inefficient; 2–3× more chips per rack to match 12nm throughput |
| **14nm** | $30–50M | Samsung, GF, SMIC (14nm+) | No | ~1.8× | 14–18 months | Moderate (Samsung/GF available; SMIC under pressure) | Acceptable fallback; power efficiency borderline for 300W TDP target |
| **12nm** | $60–80M | Samsung SF12, GF 12LP+ | No | ~2.5× | 16–20 months | Low-Moderate (Samsung/GF; no EUV tools = no ECCN restriction on fab equipment) | **Selected: optimal balance of efficiency, cost, foundry diversity, and risk** |
| **7nm** | $150–250M | Samsung SF7P, TSMC N7 | Partial (Samsung); Yes (TSMC) | ~4× | 20–26 months | High (TSMC primary; Samsung 7nm limited capacity; EUV tools ECCN-controlled) | Excessive NRE for inference ASIC; moat is architecture, not transistor density |
| **5nm** | $400–600M | TSMC N5 primarily; Samsung SF5 limited | Yes | ~6× | 24–30 months | Very High (TSMC dependency; US export controls active at this node for Chinese customers) | Incompatible with foundry independence thesis; NRE requires >$500M capital |

**Selection rationale: Samsung SF12 (primary) / GF 12LP+ (backup)**

Samsung SF12 delivers approximately 2.5× power efficiency improvement and 2× logic density versus 28nm, sufficient to achieve 300W TDP at target compute throughput. Critically, SF12 does not require EUV lithography equipment — EUV scanners (ASML NXT:2000 series) are subject to Dutch and US export controls, meaning foundries operating EUV tools face compliance constraints in serving certain customers. A 12nm design with no EUV exposure is cleaner from an export control perspective for customers in Vietnam, India, and potentially China.

GlobalFoundries 12LP+ is qualified as backup. GF's exit from the 7nm race in 2018 has concentrated their capacity and engineering on 12nm variants; process maturity is high. GF also operates fabs in the US (Malta, NY) and Singapore — meaningful for customers requiring non-Korea-sourced supply.

The efficiency gap versus 5nm (approximately 2.4×) does not eliminate CortexChip's competitiveness because the comparison baseline is not a 5nm chip running the same workload; it is an H100 (4nm, 700W TDP). Even at 12nm and 300W TDP, CortexChip's CMFC architecture delivers superior economics for agent-mesh workloads because the GPU alternative requires 32 chips versus 1.

### 3b. Die Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CortexChip Die (~450mm²)                     │
│                                                                 │
│  ┌──────────────────────────────────────┐  ┌─────────────────┐ │
│  │    Tensor Core Array (TCA)           │  │  Power Mgmt     │ │
│  │    ~35% die area                     │  │  Unit (PMU)     │ │
│  │                                      │  │  ~3% die area   │ │
│  │  512×512 Systolic Array              │  │                 │ │
│  │  W4A8 Native (INT4 weight,           │  │  Per-block DVFS │ │
│  │  INT8 activation)                    │  │  Power gating   │ │
│  │  2 TFLOPS INT8 effective             │  │  Thermal ctrl   │ │
│  │                                      │  └─────────────────┘ │
│  │  Programmable Dispatch Fabric:       │                       │
│  │  Dense / Sparse (MoE) / SSM          │  ┌─────────────────┐ │
│  │  Speculative decode hardware         │  │  CXL 2.0 Host   │ │
│  └──────────────────────────────────────┘  │  Interface      │ │
│                                            │  ~5% die area   │ │
│  ┌──────────────────────────────────────┐  │                 │ │
│  │  CortexMesh Fabric Controller (CMFC) │  │  4× CXL lanes  │ │
│  │  ~25% die area  ← KEY DIFFERENTIATOR │  │  64 GB/s agg.  │ │
│  │                                      │  │  HW coherency  │ │
│  │  KV Cache Directory (256 Pod entries)│  │  protocol      │ │
│  │  Context Handoff Engine (32KB/<2ms)  │  └─────────────────┘ │
│  │  256 HW Priority Scheduling Lanes    │                       │
│  │  Shared KV Cache Coherency Protocol  │  ┌─────────────────┐ │
│  │  Mesh Topology Routing Table         │  │  I/O & PCIe     │ │
│  └──────────────────────────────────────┘  │  Interface      │ │
│                                            │  ~4% die area   │ │
│  ┌──────────────────────────────────────┐  └─────────────────┘ │
│  │  Memory Subsystem                    │                       │
│  │  ~28% die area                       │                       │
│  │                                      │                       │
│  │  On-chip SRAM: 512MB total           │                       │
│  │  256 Pod Slots × 2MB each            │                       │
│  │  [LoRA weights | KV pages | Activ.]  │                       │
│  │                                      │                       │
│  │  GDDR7 Memory Controller             │                       │
│  │  8× GDDR7 stacks (chiplet)           │                       │
│  │  96GB capacity, ~1.8 TB/s BW         │                       │
│  │                                      │                       │
│  │  HW Prefetcher (mesh-history-based)  │                       │
│  └──────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ GDDR7   │          │ GDDR7   │          │ GDDR7   │
    │ Stack 0 │  . . .   │ Stack 3 │  . . .   │ Stack 7 │
    │ 12 GB   │          │ 12 GB   │          │ 12 GB   │
    └─────────┘          └─────────┘          └─────────┘
    (FOPLP via ASE Group — no TSMC CoWoS dependency)
```

Die area budget (target 450mm²):

| Block | Area | Primary function |
|-------|------|-----------------|
| Tensor Core Array (TCA) | ~157mm² (35%) | Matrix multiply for inference |
| CortexMesh Fabric Controller (CMFC) | ~112mm² (25%) | Agent coordination, KV routing |
| Memory Subsystem | ~126mm² (28%) | SRAM Pod slots, GDDR7 controllers |
| CXL 2.0 Interface | ~22mm² (5%) | Scale-out cluster connectivity |
| Power Management Unit | ~13mm² (3%) | DVFS, power gating, thermal |
| I/O & PCIe | ~18mm² (4%) | Host interface, debug |
| **Total** | **~448mm²** | Within reticle limit (~858mm² at 12nm) |

### 3c. CortexMesh Fabric Controller — Deep Dive

The CMFC is the novel architectural contribution of CortexChip. It has no equivalent in any shipping GPU or inference accelerator. This section describes its operation in sufficient detail for a chip architect to evaluate the design claims.

**KV Cache Directory Structure**

The CMFC maintains a hardware directory with 256 entries, one per concurrent Pod instance. Each directory entry contains:

```
Pod Directory Entry (256 total):
├── Pod ID (8-bit)
├── Model ID (16-bit) — indexes into weight table
├── LoRA Adapter ID (16-bit, 0 = base model)
├── Priority Lane (8-bit, 0=highest)
├── SLA Class (2-bit: interactive/standard/batch/background)
├── SRAM Slot Base Address (12-bit, points to 2MB scratchpad region)
├── KV Page Table (variable, up to 512 entries per Pod)
│   ├── Page ID → Physical GDDR7 Address mapping
│   └── Shared page flag (1-bit) — marks pages shared with other Pods
├── Mesh Membership (64-bit bitmask) — which other Pods share context
├── Last Active Timestamp (32-bit, cycle counter)
└── State (3-bit): ACTIVE / READY / SUSPENDED / HANDOFF / EMPTY
```

The KV Page Table is a hardware structure — not a software data structure managed by a CPU driver. The CMFC hardware directly translates Pod-local virtual KV addresses to physical GDDR7 addresses without CPU involvement. This is the critical property that enables <2ms context switching: there is no TLB shootdown, no OS page table walk, no driver interrupt.

**Shared KV Cache Mechanism**

When multiple Pods in the same mesh reference the same source document, the CMFC implements **hardware KV sharing** through the Mesh Membership register:

1. The first Pod to process a document computes its KV cache and marks its pages with `shared=1` in its page table.
2. The CMFC broadcasts the page table entries to all other Pods in the same mesh group (identified by matching Mesh Membership bitmask).
3. Subsequent Pods access these pages via their own Pod directory entry — the physical pages are not duplicated. Reference counting in the directory prevents eviction of shared pages while any mesh member holds a reference.
4. When a Pod needs to write to a shared KV page (e.g., to append its own context), the CMFC executes a copy-on-write: it allocates a new physical page, copies the shared content, marks the new page as Pod-private, and updates the referring Pod's page table — all in hardware, without CPU involvement.

For the financial research mesh example (Section 2a), the 6GB shared document KV cache is stored once in GDDR7 and referenced by four Pods simultaneously. The 24GB that would otherwise be duplicated is eliminated by hardware reference counting in the CMFC directory.

**Context Handoff Protocol**

When the Router Pod hands off a task to the Writer Pod, it may need to transfer accumulated conversation context — partial analysis, retrieved facts, intermediate reasoning. The CMFC context handoff engine executes this as follows:

1. Router Pod issues `HANDOFF` instruction with destination Pod ID and context range (byte range within its SRAM slot or a list of KV page IDs).
2. CMFC validates destination Pod is in READY or ACTIVE state and is a member of the same mesh.
3. For SRAM transfers (≤2MB): CMFC copies directly between Pod SRAM slots using dedicated DMA channel. Bandwidth: 512MB/s between SRAM regions. 32KB transfer: ~62 microseconds.
4. For GDDR7 KV page transfers: CMFC updates the destination Pod's page table to include source pages (shared reference, no copy). Pages exceeding Pod's page table capacity are evicted to GDDR7 and re-allocated. Effective transfer of 128KB KV context: <500 microseconds (primarily page table update, not data movement).
5. CMFC sets destination Pod state to ACTIVE and marks it schedulable on its priority lane.

**Total context handoff latency (including scheduling overhead)**: target <2ms for transfers up to 32KB SRAM context; <5ms for 512KB KV page rebalancing.

**Priority Scheduling Hardware**

The 256 hardware priority lanes are implemented as a priority queue in the CMFC. Each lane maps to one Pod directory entry and has:

- A priority value (0–255, 0 = highest)
- A deadline register (for real-time SLA enforcement)
- A preemption enable bit

The CMFC scheduler runs at 1GHz and selects the highest-priority schedulable Pod on each TCA execution slot. Preemption is cooperative at the token level: a low-priority Pod completes its current decode step (average 2–5ms for a 70B model token), then yields to a higher-priority Pod. This is materially different from CUDA's non-preemptive stream model, where a long prefill operation cannot be interrupted.

For the interactive SLA class (TTFT <50ms), the scheduler guarantees preemption within 5ms — the maximum decode step duration at target batch sizes. Combined with the <2ms context switch, the worst-case scheduling latency for an interactive Pod arriving while the TCA is executing a batch Pod is: 5ms (preemption wait) + 2ms (context switch) = 7ms, leaving 43ms budget for actual prefill computation.

### 3d. Memory Subsystem

**GDDR7 vs. HBM: The Selection Rationale**

| Attribute | GDDR7 (Samsung/SK Hynix) | HBM3 (SK Hynix/Micron) |
|-----------|--------------------------|-------------------------|
| Bandwidth per stack | ~1.0 TB/s | ~1.2 TB/s |
| Total bandwidth (8 stacks) | ~1.8 TB/s aggregate (with controller overhead) | ~3.6 TB/s (but requires 4+ HBM stacks at higher pitch) |
| Capacity per stack | 12–24GB | 12–24GB |
| Cost per GB | ~$8–10/GB | ~$22–28/GB |
| Packaging dependency | Standard BGA, FOPLP viable | TSMC CoWoS or similar advanced packaging — TSMC lock-in |
| Supply chain | Samsung + SK Hynix, competitive | SK Hynix + Micron, limited CoWoS allocation |
| Availability for startup | Accessible via standard DRAM contracts | Constrained; CoWoS allocation controlled by TSMC |
| Power per GB/s | ~5 pJ/bit | ~3.5 pJ/bit |

The TSMC CoWoS dependency is disqualifying for CortexPod's foundry independence thesis. TSMC CoWoS packaging for HBM is the primary supply bottleneck for AI chips globally — it is not merely a cost issue but an allocation issue. A startup cannot secure CoWoS allocation without being either a hyperscaler or NVIDIA.

FOPLP (Fan-Out Panel Level Packaging) through ASE Group is the alternative. FOPLP uses glass panels rather than wafers, enabling chiplet integration at lower cost than CoWoS with comparable electrical performance at the target bandwidth. ASE Group has qualified FOPLP for memory interfaces up to GDDR7 speeds (32Gbps per pin). This is not a theoretical alternative — ASE has production capacity and does not require TSMC involvement.

For 70B W4A8 inference, the memory bandwidth math:

- 70B model weight: 35GB at W4A8
- For TTFT <50ms at batch=1: need to load all weights within 50ms = ~700GB/s effective throughput
- CortexChip GDDR7 aggregate bandwidth: ~1.8 TB/s (controller overhead ~15% → effective ~1.5 TB/s)
- Margin: 1.5 TB/s / 0.7 TB/s needed = **2.1× margin**

This is the critical calculation. The 2.1× margin is real but not comfortable. Memory fragmentation, ECC overhead, and non-sequential access patterns can consume 20–40% of theoretical bandwidth in practice. This is why the FPGA validation phase must benchmark real W4A8 70B workloads — if effective bandwidth falls below ~750GB/s in real conditions, the TTFT target is at risk and the architecture must be revisited.

**Pod Slot SRAM Architecture**

The 512MB on-chip SRAM is divided into 256 Pod slots of 2MB each. Each 2MB slot is further subdivided:

```
Pod SRAM Slot (2MB per Pod):
├── LoRA Adapter Weights:     512KB  (rank-64 LoRA for 70B model ≈ 400KB)
├── Recent KV Cache Pages:    1024KB (hot KV cache pages, CMFC-managed LRU)
├── Activation Buffer:        384KB  (intermediate activations during decode)
└── Scratchpad / Metadata:    128KB  (CMFC state, routing table, stats)
```

The 1MB KV cache region per Pod represents approximately 4,000 tokens of KV cache (at INT8 per KV pair for a 70B model). This is sufficient for typical interactive conversation context. Longer contexts spill to GDDR7 via CMFC-managed eviction, with the CMFC hardware prefetcher pre-staging likely-needed pages based on mesh routing history.

**Hardware Prefetcher**

The CMFC tracks mesh activation patterns — which Pod is typically activated after which other Pod, with what context range — and pre-stages KV cache pages from GDDR7 into the target Pod's SRAM slot before the handoff instruction is issued. Prediction accuracy after 100 requests on a stable mesh topology: target >75% cache hit rate on prefetched pages.

### 3e. Quantization Architecture

**W4A8 as Hardware Default**

The TCA's systolic array is designed from the ground up for W4A8 mixed-precision: weight elements are stored and processed at INT4 (4-bit integer), activation elements at INT8 (8-bit integer). This is not emulated by treating INT4 as a subset of INT8 arithmetic; the systolic array tiles are physically designed for 4-bit weight operands.

Physical implementation: each multiply-accumulate (MAC) unit in the systolic array accepts a 4-bit weight and an 8-bit activation, performing INT4×INT8 accumulation into a 32-bit accumulator. This reduces the weight-side data movement by 2× compared to INT8×INT8 and by 4× compared to FP16×FP16, directly reducing the memory bandwidth pressure that is the primary bottleneck for inference.

**Why W4A8 and Not Alternatives**

| Quantization | Weight BW reduction | Activation BW reduction | Accuracy loss (MMLU vs FP16) | Hardware complexity |
|---|---|---|---|---|
| FP16 | 1× (baseline) | 1× | 0% | Low (standard) |
| INT8 (W8A8) | 2× | 2× | ~0.3% | Low |
| W4A8 (our default) | 4× | 2× | ~1.2% | Medium (mixed-precision MAC) |
| INT4 (W4A4) | 4× | 4× | ~4–8% | Medium |
| FP8 (W8A8 FP8) | 2× | 2× | ~0.5% | Medium |

W4A8 represents the optimal point in the accuracy/bandwidth trade-off: the 1.2% MMLU accuracy loss is acceptable for production inference in most applications, while the 4× weight bandwidth reduction is the single most impactful optimization available for memory-bandwidth-bound workloads. W4A4 reduces bandwidth further but accuracy loss becomes application-specific and requires case-by-case validation — not appropriate as a hardware default.

**Hardware Calibration Assist**

The TCA exposes per-layer activation statistics registers: min, max, mean, and histogram of activation magnitudes collected during inference. These registers are accessible via the CortexChip management interface and feed directly into the quantization calibration pipeline. Quantization-aware calibration that requires hours of synthetic data generation on GPU can be performed with live inference data on CortexChip in minutes, improving per-customer model accuracy and enabling the workload-aware optimization flywheel described in Section 5c.

### 3f. Scale-Out: CXL Cluster Architecture

**CXL 2.0 Fabric**

CortexChip's CXL 2.0 interface provides 4 lanes of CXL, yielding 64GB/s aggregate bidirectional bandwidth per chip for inter-chip communication. CXL 2.0 is now supported by Intel, AMD, and ARM — it is a stable, supported standard with available switch silicon (Microchip PAX28, Astera Labs Leo) rather than a proprietary protocol requiring custom switch development.

CXL hop overhead: approximately 200–300ns per hop. For inter-chip KV cache sharing (the primary cross-chip communication pattern), this adds sub-1ms latency for a 32KB KV context transfer across two chips in the same rack — acceptable for agent-mesh handoffs.

**Disaggregated Prefill/Decode Architecture**

For large-scale deployments, CortexChip clusters implement disaggregated prefill and decode:

- **Prefill chips**: process the input prompt (compute-intensive, high FLOPS utilization). These chips run at maximum TCA utilization and are not concerned with low-latency scheduling.
- **Decode chips**: generate output tokens (memory-bandwidth-intensive, lower FLOPS utilization). These chips run the CMFC at maximum concurrency and prioritize KV cache efficiency.

The CMFC's CXL interface handles the KV cache transfer from prefill chips to decode chips: after prefill completes, the computed KV cache (typically 1–50GB for long contexts) is transferred over CXL to the decode chip pool. At 64GB/s, a 1GB KV cache transfers in ~16ms — acceptable for typical use cases.

**Target Cluster Sizes and Topology**

```
┌─────────────────────────────────────────────────────────────────────┐
│             8-Chip CortexCluster — CXL 2.0 Topology                │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │ CortexChip│   │CortexChip│   │CortexChip│   │CortexChip│  ← Prefill Pool
│  │   P0     │   │   P1     │   │   P2     │   │   P3     │        │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘        │
│       │              │              │              │               │
│       └──────────────┴──────────────┴──────────────┘               │
│                            │                                        │
│                   ┌────────┴────────┐                               │
│                   │ CXL 2.0 Switch  │  (Microchip PAX28 or equiv)  │
│                   │ 16-port, 64GB/s │                               │
│                   └────────┬────────┘                               │
│                            │                                        │
│       ┌──────────────┬─────┴────────┬──────────────┐               │
│  ┌────┴─────┐   ┌────┴─────┐   ┌────┴─────┐   ┌────┴─────┐        │
│  │CortexChip│   │CortexChip│   │CortexChip│   │CortexChip│  ← Decode Pool
│  │   D0     │   │   D1     │   │   D2     │   │   D3     │        │
│  │ 256 Pods │   │ 256 Pods │   │ 256 Pods │   │ 256 Pods │        │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘        │
│                                                              1024 concurrent Pods total
└─────────────────────────────────────────────────────────────────────┘
```

| Cluster configuration | Chips | Concurrent Pods | Target deployment |
|----------------------|-------|-----------------|-------------------|
| Single chip (dev/startup) | 1 | 256 | Development, small production |
| 8-chip rack unit | 8 | 1,024 (decode) | SME enterprise deployment |
| 64-chip half-rack | 64 | 8,192 | Regional inference hub |
| 512-chip datacenter | 512 | 65,536 | Hyperscale / multi-tenant cloud |

---

## 4. Chip Design Roadmap

### 4a. Phase 0: Architecture Validation via FPGA (Month 0–6)

**Hardware configuration**: 8 nodes × 2 Xilinx Alveo U280 FPGAs each = 16 FPGAs total. The U280 has 8GB HBM2 (used as SRAM scratchpad substitute) and sufficient LUT capacity to emulate a reduced-scale CMFC at 16-Pod capacity.

**What Phase 0 validates**:

The FPGA phase is not a performance benchmark — FPGAs are 5–10× slower than silicon for the same logic. It is a **correctness and architecture validation** phase. The questions being answered are:

1. Does the CMFC KV directory protocol maintain coherency under concurrent Pod activation? (Correctness question, not performance)
2. Does the context handoff engine transfer KV pages without data corruption during mesh topology changes? (Correctness question)
3. Does the W4A8 kernel achieve >80% of theoretical FLOPS utilization, confirming the systolic array design? (Architecture efficiency question)
4. Does memory bandwidth utilization reach >70% of FPGA HBM theoretical peak, confirming the memory access pattern assumptions? (Memory subsystem question)
5. What is the real-world Pod context switch latency on FPGA (expected 5–10× silicon target), confirming schedulability analysis?

**Success criteria (all must be met before proceeding to tape-out funding)**:

| Criterion | Target | Rationale |
|-----------|--------|-----------|
| Concurrent Pod capacity | 16 Pods on FPGA | Validates CMFC directory scaling |
| Context switch latency | <10ms on FPGA | 5× silicon target; confirms design correctness |
| W4A8 kernel efficiency | >80% theoretical peak | Confirms systolic array design |
| Memory bandwidth utilization | >70% HBM theoretical | Confirms access pattern assumptions |
| KV coherency errors | 0 per 10,000 operations | Confirms correctness of sharing protocol |
| 13B W4A8 TTFT | <250ms on FPGA | Bandwidth-scaled projection to silicon: <50ms |

**Kill criterion**: If W4A8 TTFT for a 13B model exceeds 500ms on FPGA, the memory subsystem design requires fundamental revision before proceeding to silicon. At 5× FPGA-to-silicon scaling, 500ms on FPGA projects to >100ms on silicon for a 13B model — and 70B TTFT would exceed the <50ms target even with perfect bandwidth utilization. This is a hard stop.

**Team required**: 3 RTL engineers (CMFC implementation), 2 ML kernel engineers (W4A8 CUDA/HLS kernels), 1 systems architect (cluster topology, test framework)

**Cost**: ~$200K (FPGA hardware ~$120K, engineering time ~$80K)

### 4b. Phase 1: First Tape-Out — CortexChip v1.0 (Month 6–18)

**Foundry selection**: Samsung SF12 (primary). GF 12LP+ (backup, engaged in parallel for PDK access, diverging at physical design stage only if Samsung capacity unavailable).

**Die size target**: 400–500mm². At 12nm, reticle limit is approximately 858mm²; targeting well within limit to reduce mask cost and improve yield.

**NRE cost estimate breakdown**:

| Item | Estimated cost |
|------|---------------|
| PDK license (Samsung SF12) | $3–5M |
| EDA tool licenses (Cadence/Synopsys, 18 months) | $8–12M |
| Mask set (full custom, 12nm) | $4–6M |
| Physical design engineering | $15–20M |
| RTL design and verification | $10–15M |
| Post-silicon validation and bring-up | $5–8M |
| FOPLP packaging (ASE Group, 500 units) | $3–5M |
| Contingency (15%) | $7–10M |
| **Total NRE** | **$55–81M** |

**Key design milestones**:

| Milestone | Month | Description |
|-----------|-------|-------------|
| RTL freeze | M6–8 | All functional blocks in RTL, simulation sign-off |
| Architecture final review | M8 | External review by 2 senior chip architects |
| Physical design kick-off | M8 | Place & route, clock tree synthesis |
| P&R complete | M11 | Timing closure at target frequency |
| Tape-out submission | M11–13 | GDSII to Samsung SF12 foundry |
| Fab turnaround | M13–17 | Typical Samsung SF12: 4–5 months |
| First silicon bring-up | M17 | Power-on, basic functional test |
| Yield analysis | M17–18 | Sort, characterize, confirm yield target |

**Target yield**: >75% for functional die (conservative for first silicon on a design of this complexity).

**Initial production run**: 500 chips. At 75% yield on a 450mm² die at 12nm, wafer yield is approximately 60–70 good die per wafer. 500 chips requires approximately 8–10 wafers — a small engineering run, appropriate for beta program.

**Risk management — architecture obsolescence**: The programmable dispatch fabric in the TCA is designed to execute dense attention, sparse attention (MoE routing), and SSM (Mamba-style) computation graphs without die modification. The compiler generates different execution graphs for each architecture type; the hardware fabric routes accordingly. If MoE or SSM becomes dominant before v1 ships, the CMFC architecture remains valid (it addresses scheduling and KV sharing, which apply regardless of model architecture) and the TCA handles the new computation via fabric reprogramming.

### 4c. Phase 2: Software Stack Co-development (Month 6–18, Parallel)

Running in parallel with Phase 1 silicon development, a separate software team delivers:

- **vLLM plugin backend** for CortexChip instruction set: implements the vLLM `ExecutionEngine` interface with CortexChip-specific kernels. Upstream contribution of the plugin interface to vLLM mainline reduces maintenance divergence.
- **CUDA compatibility layer** (HIP-style transpiler): CUDA kernels targeting a subset of CUDA primitives can be transpiled to CortexChip ISA equivalents. This is not full CUDA compatibility — it targets the subset used in inference (attention, linear layers, normalization). Complete coverage is a 3–5 year engineering project; MVP covers 80% of inference kernel surface area.
- **Pod scheduling daemon**: software emulation of CMFC behavior running on GPU hardware. This enables the platform to onboard customers during the GPU phase (Month 1–12) before CortexChip hardware is available, collecting real workload traces.
- **Telemetry pipeline**: privacy-preserving collection of token-level latency breakdown, KV cache hit rates, attention sparsity patterns, and quantization sensitivity. This data directly informs v2 chip microarchitecture (optimal CMFC directory size, SRAM scratchpad allocation, prefetch distance).

### 4d. Phase 3: CortexChip v2.0 (Month 24–36)

Informed by production data from v1 deployments and Phase 2 telemetry, v2 targets:

- **512 Pod capacity** (2× v1) — driven by customer demand for larger agent mesh sizes
- **Improved MoE support** — TCA dispatch fabric optimized for sparse expert routing, reducing expert-switch overhead
- **Lower power** — design optimization on same 12nm node; target 240W TDP (20% reduction)
- **Expanded Pod SRAM** — 3MB per Pod slot (50% increase) based on observed context size distributions from v1 telemetry
- **CXL 3.0 interface** — if CXL 3.0 switch silicon is available by M24, upgrade doubles inter-chip bandwidth to 128GB/s

Potential node migration to Samsung SF8 is evaluated at M24 based on: foundry economics, process maturity (SF8 is newer — yield risk), and whether the 1.4× power efficiency improvement justifies increased NRE.

---

## 5. Deployment Platform (The Wrapper)

### 5a. Architecture

The deployment platform is a pre-warmed serverless pool running on GPU hardware in Phase 1 (Month 0–12) and migrating to CortexChip hardware in Phase 2 (Month 12+). Its architecture:

**Tiered capacity model**: Hot tier (model pre-loaded, <100ms cold start), warm tier (model on NVMe SSD, ~2s startup), cold tier (pull from object store, ~30s). Request routing dispatches based on SLA class.

**LoRA hot-swap**: The 512KB LoRA adapter slot in each Pod's SRAM enables adapter swap in <100ms — the base 70B model remains loaded in GDDR7 continuously. Customer-specific model personas are implemented as LoRA adapters, not full model deployments.

**Disaggregated prefill/decode**: Prefill pool (compute-optimized) handles input processing; decode pool (CMFC-optimized) handles token generation. KV cache transferred via CXL fabric.

**Multi-tenant namespace isolation**: PagedAttention block table per tenant — physical KV pages are CMFC-managed, logical namespaces isolated. Enterprise tenants receive guaranteed CMFC priority lane allocation; best-effort tenants fill spare capacity.

### 5b. Developer Experience

Initial setup:

```bash
# Initialize a new agent mesh project
$ cortex init financial-research-mesh

# Deploy to target regions (Singapore, Mumbai, Hong Kong)
$ cortex deploy --region sin,bom,hkg

# Stream logs from a specific pod
$ cortex logs --pod research-analyst --tail

# View real-time performance metrics
$ cortex metrics --mesh financial-research-mesh --window 5m
```

Pod definition (YAML):

```yaml
# financial-research-mesh.yaml
mesh:
  name: financial-research-mesh
  region: [sin, bom, hkg]
  sla_class: interactive           # TTFT < 50ms guarantee

pods:
  - name: router
    model: llama-3.1-7b
    priority: 0                    # Highest priority (interactive)
    max_context: 4096
    
  - name: research-analyst
    model: llama-3.1-70b
    lora_adapter: finance-v2       # LoRA hot-swappable
    priority: 1
    max_context: 32768
    shared_kv_group: document-pool # Shares KV cache with fact-checker, writer

  - name: fact-checker
    model: llama-3.1-70b
    lora_adapter: verification-v1
    priority: 2
    max_context: 32768
    shared_kv_group: document-pool

  - name: writer
    model: llama-3.1-70b
    priority: 3
    max_context: 65536
    shared_kv_group: document-pool

  - name: compliance-scanner
    model: llama-3.1-13b
    lora_adapter: mas-compliance-sg
    priority: 1
    sla_class: batch               # Async, deadline-driven

  - name: translator
    model: llama-3.1-13b
    priority: 4
    target_language: vi            # Vietnamese output

telemetry:
  enabled: true
  privacy_mode: aggregate_only     # No prompt/response content collected
```

Python client:

```python
from cortex import MeshClient

# Automatic session management, KV cache reuse, routing
mesh = MeshClient(mesh_name="financial-research-mesh", api_key="...")

# Route to appropriate pod — client handles dispatch
response = mesh.query(
    agent="research-analyst",
    prompt="Analyze Q3 earnings impact on regional banking exposure",
    session_id="user-123-session-456"  # Enables KV cache persistence
)

# Cost and performance breakdown included in response metadata
print(response.metadata)
# {
#   "ttft_ms": 38,
#   "total_tokens": 847,
#   "kv_cache_hit_rate": 0.73,   # 73% of context reused from cache
#   "effective_cost_per_1m": 0.42,
#   "pod": "research-analyst",
#   "chip_id": "cortex-sin-04"
# }
```

### 5c. Why the Platform Matters for Chip Strategy

The platform's primary strategic function is **telemetry collection**. Every production request generates:

- Token-level latency breakdown (prefill vs. decode, per layer)
- KV cache hit/miss rate and page access patterns
- Attention sparsity distribution (enables MoE optimization targeting)
- Pod activation sequences (informs CMFC prefetch algorithm)
- Quantization sensitivity per layer (feeds back into hardware calibration assist)

This data is not available from synthetic benchmarks. It reflects real agent-mesh workloads from real customers. The telemetry pipeline processes this data to:

1. Optimize the v2 CMFC directory size (are 256 entries sufficient, or do production meshes routinely exceed this?)
2. Calibrate the Pod SRAM allocation (is 2MB per Pod slot the right split between LoRA, KV, and activation buffer?)
3. Refine the hardware prefetcher prediction model (which mesh topology patterns are most common?)
4. Improve the quantization calibration pipeline (which model layers are most sensitive?)

The flywheel: more customers → more workload diversity → better chip optimization → better performance/cost → more customers.

### 5d. GPU Phase → CortexChip Migration

Customers onboard during Month 0–12 on vLLM-backed GPU infrastructure. The software Pod scheduling daemon emulates CMFC behavior — Pod context switching takes 20–50ms in software instead of <2ms in hardware, shared KV cache is implemented via Redis-backed memory pool instead of hardware directory, LoRA hot-swap takes 300–500ms instead of <100ms.

When CortexChip v1 ships (Month 17–18), migration is transparent to customers:

- Same API, same YAML pod definitions, same Python client
- Platform schedules new requests to CortexChip nodes as they come online
- KV cache warm-up period of 48–72 hours (new hardware, no cache history)
- Performance improvement is automatic: TTFT drops, concurrent Pod capacity increases, cost per token decreases

Customers see better performance without code changes. This is the adoption strategy: make the GPU phase good enough to retain customers, then deliver materially better CortexChip performance as an automatic upgrade.

---

## 6. Economics & Business Case

### 6a. Unit Economics Comparison

**Scenario**: Serving a 256-agent mesh, 70B W4A8 models, 10,000 requests/day, interactive SLA (TTFT <50ms). Assumes 16-hour peak utilization, 8-hour off-peak.

**Infrastructure assumptions**:
- Average request: 512 input tokens, 256 output tokens
- Batch size: 8 (realistic for interactive SLA)
- H100 decode throughput: 100 tok/s per chip at batch=8, FP16 (reference: typical vLLM benchmark)
- Daily output tokens: 10,000 requests × 256 tokens = 2.56M tokens/day

| Infrastructure | Chips needed | Capital cost (purchase) | Power (W) | Power cost/month ($0.12/kWh) | Monthly equiv. cost | Cost per 1M tokens |
|---|---|---|---|---|---|---|
| H100 cluster | 32× H100 | $960,000 | 22,400W | $1,935/mo + $80K/mo amortized (3yr) | **~$82,000/mo** | **$107** |
| AWS Inferentia2 (inf2.48xlarge) | 6 instances | Rental | Included | — | **~$52,000/mo** ($290/hr × 6 × 30d) | **$68** |
| CortexChip v1 (target, 500 unit run) | 1× chip | $3,000 | 300W | $26/mo + ~$83/mo amortized (3yr) | **~$109/mo** | **$0.14** |

**Math for CortexChip cost/token**:
- Monthly infrastructure cost: $3,000 / 36 months amortized + $26 power = ~$109/month
- Daily output tokens: 2.56M tokens × 30 days = 76.8M tokens/month
- Cost per 1M tokens: $109 / 76.8 = **$1.42/1M tokens** at current volume

At scale (64-chip cluster, 16,384 concurrent Pods, ~5B tokens/month):
- Monthly infrastructure: 64 chips × ($3,000/36) + 64 × $26 power = $7,000/mo
- Cost per 1M tokens: $7,000 / 5,000 = **$1.40/1M tokens**

Comparison context: AWS Bedrock charges $2.40–$7.60/1M tokens for 70B-class models. The CortexChip cost basis, even including platform margin, enables competitive pricing while maintaining healthy margins.

**Critical caveat**: The $3,000 chip cost is at volume production (500+ units). First 100 engineering samples will cost significantly more ($15,000–$30,000 per chip equivalent including NRE amortization). The unit economics above apply to Phase 2 operations (post-tape-out), not the GPU-based Phase 1.

### 6b. Why Asia First

**Supply constraint**: H100 and A100 exports to China are restricted under US Bureau of Industry and Security regulations (as of October 2023, BIS October 2023 rule). Vietnam, India, and other Asian markets are not under the same restrictions but face significant allocation delays — NVIDIA's order backlog for H100 in Southeast Asia extended to 12–18 months through 2024. A chip manufactured on Samsung or GF equipment, designed and sold by a non-US entity, has significantly fewer export control complications.

**Cost sensitivity**: A median-stage AI startup in Southeast Asia raising a $3–5M Series A cannot allocate $300,000+ of that capital to GPU infrastructure. The economics of CortexChip — $3,000/chip versus $30,000/H100 — are not merely attractive; they make the difference between feasibility and infeasibility for this customer segment.

**Data sovereignty**: The following regulations impose local data processing requirements that make cross-border inference legally complicated:

| Regulation | Jurisdiction | Local inference requirement |
|---|---|---|
| Nghị định 13/2023/NĐ-CP | Vietnam | Personal data of Vietnamese citizens must be processed locally or with explicit consent for cross-border transfer |
| PDPB (Personal Data Protection Bill) | India | Sensitive personal data requires local processing in certain categories |
| PIPL (Personal Information Protection Law) | China | Personal information must remain within China except with specific approval |
| PDPA | Thailand | Cross-border transfers require adequacy or consent mechanisms |

A CortexChip deployment in Singapore, Ho Chi Minh City, and Mumbai is not merely a latency optimization — it is a compliance requirement for customers serving Vietnamese, Indian, and Thai users.

**Market timing window**: Asian enterprise AI adoption is approximately 18–24 months behind US adoption patterns, but the acceleration rate is higher. The window to establish infrastructure-layer relationships before AWS, Google Cloud, and Azure expand dedicated AI inference capacity in Asian regions is approximately 2025–2027. After that window, hyperscaler infrastructure scale and brand equity become difficult to compete against.

### 6c. Pricing Model

**Developer tier** (Phase 1, GPU hardware):
- Pay-per-token, no commitment
- Pricing: $2.00/1M input tokens, $6.00/1M output tokens (competitive with AWS Bedrock, profitable on GPU hardware)
- No SLA guarantee, best-effort latency
- Purpose: customer acquisition, workload telemetry collection

**Growth tier** (Phase 2, CortexChip hardware):
- Reserved Pod-hours per month, 30% discount versus developer tier
- Pricing: ~$4.00/1M effective tokens (bundled, SLA-backed)
- Interactive SLA guarantee (TTFT <50ms, p95)
- CortexChip hardware, data residency within contracted region
- 90-day minimum commitment

**Enterprise tier** (Phase 2, dedicated allocation):
- Dedicated CortexChip allocation (minimum 1 full chip = 256 Pods)
- Fixed monthly fee: $8,000–$15,000/month per chip depending on SLA tier
- SLA: TTFT <50ms (p99), 99.9% uptime, 4-hour hardware replacement SLA
- Data residency commitment with audit logs
- Integration with customer's private model weights and LoRA adapters
- Dedicated account engineering support

### 6d. Volume Efficiency Bonus

The volume efficiency bonus is not a marketing mechanic. It reflects a real technical phenomenon: as the platform accumulates workload telemetry from a specific customer's agent mesh, the compiler optimizer learns the customer's specific access patterns and optimizes accordingly.

Mechanisms that improve with usage:

1. **KV cache hit rate**: After 30 days of a stable agent mesh configuration, the CMFC prefetcher has built a routing history that achieves 60–75% KV cache hit rates versus 20–30% at cold start. This directly reduces decode-phase memory bandwidth requirements.

2. **Quantization calibration**: The hardware calibration assist (Section 3e) provides per-layer activation statistics from live inference. After 90 days, the quantization optimizer has real activation distributions for the customer's specific input distribution — not generic calibration data. Model accuracy at the same quantization level improves by 0.5–1.5 MMLU points.

3. **LoRA adapter caching**: Frequently-used LoRA adapters are pinned in the Pod SRAM hot slot, eliminating the <100ms swap overhead. After 30 days, the system has learned which adapters to pin.

**Estimated effective cost reduction**: 15–25% reduction in cost/token after 90 days of stable usage, driven primarily by KV cache hit rate improvement. This is not discounting — it is genuine efficiency improvement that reduces infrastructure cost.

**Switching cost implication**: A customer who has accumulated 90 days of telemetry-optimized performance and switches to AWS loses that optimization. AWS's infrastructure starts cold. The efficiency improvement is portable in principle (the customer could export their workload patterns) but the toolchain for doing so does not exist outside CortexPod's platform. This creates organic switching costs without artificial lock-in.

---

## 7. Risks & Honest Assessment

### Risk 1: Memory Bandwidth Wall

**Probability**: Medium-High (40–50%)  
**Impact**: Critical — kills the 70B interactive inference thesis

**The math in detail**:

70B W4A8 weight footprint: 35GB. To achieve TTFT <50ms at batch=1, the weight must be fully loaded through the memory hierarchy within 50ms (simplification: steady-state decode is less demanding than initial prefill, but prefill dominates TTFT). Minimum required effective bandwidth: 35GB / 0.050s = **700 GB/s**.

CortexChip GDDR7 theoretical: 1.8 TB/s. After memory controller overhead (15%), ECC overhead (2%), access pattern non-sequentiality for attention computation (10–20%), realistic effective bandwidth is approximately **1.2–1.4 TB/s**. Margin over 700 GB/s: 1.7–2.0×.

This margin sounds comfortable, but inference memory access is not a simple sequential read. Attention computation requires random access to KV cache pages across the full context length — for a 32K token context, this involves non-sequential page accesses across potentially 16GB of KV cache. Random access bandwidth on GDDR7 is significantly lower than sequential read bandwidth — potentially 40–60% of peak.

If realistic effective bandwidth for a 70B model with 32K context falls below 700 GB/s, TTFT will exceed 50ms at batch=1. The FPGA validation phase must measure this under real attention workloads, not synthetic sequential reads.

**Mitigation**: 
- Speculative decoding reduces the number of full weight-loading cycles (accepts draft tokens without full recompute)
- Continuous batching amortizes weight loading across multiple requests
- CMFC hardware prefetcher pre-loads KV pages before they're needed, reducing effective random-access latency

**Kill criterion**: If FPGA emulation shows W4A8 effective bandwidth below 600 GB/s for real 13B attention workloads, the bandwidth margin is insufficient and the architecture requires one of:
1. **Scope reduction**: Serve ≤13B models (35GB → 6.5GB footprint; 700 GB/s requirement drops to ~130 GB/s — easily met)
2. **Pivot to batch**: Abandon interactive SLA, compete on batch throughput cost for async workloads (document processing, background analysis)
3. **HBM rearchitecture**: Accept TSMC CoWoS dependency, acquire HBM3 (3.6 TB/s), rebuild foundry independence thesis

None of these is catastrophic for the business, but all require significant strategy revision. The $200K FPGA validation cost (Section 4a) is the cheapest possible way to discover this problem before committing $60–80M to tape-out.

---

### Risk 2: Tape-Out Schedule Slip

**Probability**: High (60–70%) for any slip; Medium (30%) for a slip >6 months  
**Impact**: High — customers on GPU phase may not wait; competitor window opens

First silicon is late. This is a near-certainty, not a risk to hedge against. The question is how late, and whether the FPGA phase has generated sufficient business value to retain customers through the delay.

A 6-month slip to 18 months tape-out → 24 months to first silicon means:
- Customers who onboarded at Month 1 have been on GPU infrastructure for 24 months
- Competitors may have shipped custom silicon in the interim
- Investor confidence in the timeline may have eroded

**Mitigation**: The GPU phase (Month 0–12) must not be a placeholder. It must acquire at minimum 3–5 paying anchor customers with genuine workload commitment, generating >$500K ARR before CortexChip ships. These customers have integrated the platform API, built production workflows on CortexPod, and face meaningful switching costs — they will wait for CortexChip hardware if the platform delivers value.

The programmable dispatch fabric in the TCA also reduces tape-out risk by eliminating the need to perfectly predict model architecture at design time. A single tape-out serves dense transformer, MoE, and SSM workloads.

---

### Risk 3: Geopolitical Foundry Risk

**Probability**: Low-Medium (20–30%) for material disruption through 2028  
**Impact**: High — foundry access is a prerequisite for the entire thesis

Samsung Semiconductor operates under US-Korea trade agreements and is not currently subject to the same export control restrictions as SMIC. GlobalFoundries is US-headquartered (HQ in Malta, NY) with fabs in the US, Germany, and Singapore. Neither faces the restrictions applied to SMIC.

However: the Cadence Virtuoso and Synopsys IC Compiler EDA tools required for 12nm design are US-origin software. Export licenses are required for use by entities in certain jurisdictions. CortexPod, if incorporated outside the US, may face licensing complications depending on engineering team location and company registration.

Additionally, Samsung Foundry's capacity allocation is prioritized for captive (Samsung LSI) and flagship customers (NVIDIA, Qualcomm, Apple). A startup securing 10-wafer engineering runs competes for attention and capacity against multibillion-dollar contracts.

**Mitigation**:
- Legal opinion on EDA tool export licensing before team formation — this is not optional
- US entity structure for the IP-holding company, even if operations are Asia-based
- Dual foundry engagement (Samsung SF12 + GF 12LP+) from the start, keeping both options warm through PDK access and design tool licensing

**Not fully mitigatable**: The risk that US export policy expands to restrict advanced ASIC design tools for entities with significant Asian ownership or operations is real and outside CortexPod's control. This is a background risk to monitor, not a reason to abandon the strategy.

---

### Risk 4: Architecture Obsolescence (MoE/SSM Displacement of Dense Transformer)

**Probability**: Medium (30–40%) that MoE becomes clearly dominant by 2027  
**Impact**: Medium — CMFC architecture is model-agnostic; TCA is partially affected

The dense transformer (as in LLaMA-3, Mistral, GPT-4-style architectures) may not be the dominant model architecture in 2027. Mixture-of-Experts (MoE) models (Mixtral, GPT-4 reportedly, Grok-1) activate only a fraction of parameters per token, changing memory access patterns significantly. State Space Models (Mamba, RWKV) replace attention entirely with recurrent computation, eliminating the KV cache concept.

If MoE becomes dominant: The CMFC's shared KV cache architecture still applies (MoE models still have attention layers and KV caches). The TCA's systolic array is less efficient for sparse expert routing — this is a 10–20% efficiency loss, not a fundamental failure. The programmable dispatch fabric handles MoE routing without die modification.

If SSM becomes dominant: The CMFC's KV cache directory is less relevant (SSMs use a fixed-size hidden state, not a growing KV cache). The context handoff engine still works (transfers hidden state instead of KV pages). The TCA handles SSM computation efficiently (it's still matrix multiply). The competitive differentiation from shared KV cache elimination is reduced — but the scheduling and multi-tenancy advantages remain.

**Honest assessment**: CortexChip v1 is not obsoleted by MoE or SSM dominance, but the magnitude of the performance advantage versus GPU is reduced. The CMFC's most dramatic benefits — hardware KV sharing, context handoff — are most relevant for dense attention models. If SSMs eliminate KV caches by 2028, the v2 architecture will require rethinking the CMFC's role.

**Mitigation**: Programmable dispatch fabric (reduces risk), telemetry-driven v2 design (adapts to observed workload trends), FPGA validation phase includes SSM workloads (validates baseline performance).

---

### Risk 5: Software Talent Gravity

**Probability**: High (70%+) that recruiting is harder than expected  
**Impact**: High — software stack quality determines customer adoption rate

Every GPU kernel engineer in the world has CUDA experience. CortexChip requires engineers who can write kernels for a novel ISA without CUDA primitives, implement a hardware abstraction layer for a chip that doesn't exist yet, and debug silicon bring-up issues without a mature toolchain.

This is genuinely difficult. The population of engineers who have (a) written production ML kernels, (b) worked with custom ASIC backends rather than CUDA, and (c) are willing to join a startup building its first chip, is small globally. In Asia, it is smaller. Senior engineers at this intersection typically earn $300,000–$500,000+ in total compensation at major tech companies.

**Mitigation strategies (honest assessment of difficulty)**:

The CUDA compatibility layer (HIP-style transpiler) is the most important software investment for talent. If engineers can write CUDA and compile to CortexChip, the talent pool expands from "custom ISA specialists" to "experienced CUDA engineers willing to learn a new backend." AMD's ROCm strategy — write CUDA, compile to ROCm — is the right model. AMD spent 5+ years and hundreds of millions of dollars building HIP to partial parity. CortexPod's target is not full parity but a functional subset sufficient for inference kernels — achievable in 2–3 years with 5–8 kernel engineers.

FPGA emulation also helps recruiting: engineers can work with the FPGA emulation before silicon exists, reducing the risk of joining a company where the primary work artifact doesn't physically exist yet.

**Honest assessment**: Software talent is the rate-limiting constraint for the deployment timeline, not the chip design timeline. Plan for 6–12 months longer than expected to reach software stack maturity. Budget for premium compensation — below-market compensation will not attract the required talent into an unproven silicon startup.

---

## 8. Minimum Viable Chip Program

**Constraints**: $10M, 8 engineers, 18 months. The goal is a tape-out that proves the CMFC concept at minimum viable scale.

### Team Composition (Month 1–2)

Hire in this order:

| Month | Role | Hire criteria | Why first |
|-------|------|---------------|-----------|
| M1 | RTL Lead / Chip Architect | 10+ years, has taped out at 16nm or smaller | All design decisions flow from this person |
| M1 | Physical Design Lead | 8+ years at target node or similar | Long lead time; must engage foundry PDK early |
| M1–2 | 2× RTL Engineers | 5+ years each, one with memory controller experience | CMFC and memory subsystem are the novel work |
| M2 | ML Kernel Engineer (Lead) | CUDA expert, has written attention kernels, open to non-CUDA | W4A8 kernel is make-or-break for performance claims |
| M2 | Systems Architect | Has built inference serving systems at scale | Software stack and hardware must co-design |
| M2–3 | Verification Engineer | DV experience on custom silicon | Catching bugs before tape-out |
| M3 | Second ML Kernel Engineer | | CUDA compatibility layer development |

This is 8 engineers. No management layer. The chip architect is the technical lead. External advisors (2–3 senior chip architects on retainer, $10–20K/month each) are cost-effective substitutes for full-time senior hires at this stage.

### Month 1–6: FPGA Validation Program

**Budget allocation**: $200K

The FPGA phase proves:
1. CMFC directory protocol correctness at 16-Pod scale
2. KV cache sharing coherency under concurrent access
3. W4A8 kernel efficiency on realistic attention workloads
4. Context switch latency (targeting <10ms on FPGA)

**Hardware**: 4× dual-FPGA nodes (Xilinx Alveo U280 pairs). Each node emulates 4 Pods. Total: 16 concurrent Pods.

**Software deliverables from FPGA phase**: RTL for CMFC (synthesizable to FPGA), W4A8 kernel in HLS (synthesizable), test harness generating real LLaMA-3 attention workloads, benchmark suite comparing FPGA emulation to CPU baseline.

### Month 6–10: Foundry Selection and PDK Access

**Budget allocation**: $1.5M

- Execute NDAs with Samsung SF12 and GF 12LP+
- Acquire PDK licenses for both (PDKs are not free; Samsung SF12 PDK requires foundry agreement and typically $1–3M for a startup)
- Procure EDA tool licenses: Cadence Virtuoso (schematic/layout), Genus (synthesis), Innovus (place & route), Calibre (DRC/LVS) — $500K–$1M/year for a small team license
- Engage ASE Group for FOPLP packaging evaluation and engineering sample process

**Critical legal step**: Export control legal opinion on EDA tool licensing for the team's operating jurisdiction. Do not skip this.

### Month 10–14: RTL Design

**Budget allocation**: $3M (engineering time primarily)

**Block design priority order**:

1. **CMFC** (Month 10–13): The novel contribution. Implement KV directory, context handoff engine, priority scheduler. Verify against FPGA emulation reference.
2. **Memory Controller** (Month 10–12): GDDR7 interface, Pod SRAM addressing, CMFC interface. This is a critical timing path.
3. **TCA** (Month 11–14): Systolic array with W4A8 MAC units, programmable dispatch fabric. This is the largest block by area but the most understood algorithmically.
4. **CXL 2.0 Interface** (Month 12–14): Use a licensed CXL 2.0 IP block — do not build from scratch. Several vendors (Rambus, Synopsys) offer qualified CXL 2.0 PHY and controller IP. This is a $2–5M license but saves 6+ months of development.

### Month 14–18: Physical Design, Sign-off, Tape-Out Preparation

**Budget allocation**: $4M (foundry NRE primary)

- Place and route at Samsung SF12 (primary) or GF 12LP+ (backup) PDK rules
- Timing closure at target frequency (target: 1GHz for CMFC, 800MHz for TCA)
- DRC/LVS sign-off using Mentor Calibre
- Power integrity analysis — CortexChip at 300W TDP requires careful power grid design
- Thermal simulation — confirm 300W TDP is within packaging limits at operating temperature
- Tape-out submission: GDSII delivery to foundry

**Budget summary**:

| Category | Budget |
|----------|--------|
| Team (8 engineers × 18 months × $150–250K/year fully loaded) | $3.5–4.5M |
| FPGA hardware (Phase 0) | $200K |
| EDA tool licenses (18 months) | $1.2M |
| Foundry PDK licenses | $1.5M |
| CXL 2.0 IP license | $2.5M |
| Foundry NRE (partial — test chip) | $1.5–2M |
| Contingency (15%) | $1.5M |
| **Total** | **~$12–13M** |

Note: $10M is tight for this scope. The difference ($2–3M) is covered by either a larger seed round or deferring the CXL IP license (implementing a basic PCIe interface instead of CXL 2.0 for the test chip).

### Minimum Viable Test Chip (<$20M NRE)

If the full CortexChip v1 ($60–80M NRE) cannot be funded from Series A, there is a meaningful intermediate milestone: a **32-Pod CMFC test chip**.

Specification:
- Die size: ~100mm² (fits in low-cost mask set)
- Technology: Samsung SF12 or GF 12LP+
- Blocks: 32-Pod CMFC (full fidelity), minimal TCA (64×64 systolic array, 1/64 of full chip), on-chip SRAM only (no GDDR7 chiplet), PCIe 4.0 interface (not CXL 2.0)
- Purpose: Prove CMFC architecture in silicon, not ship a production-ready inference accelerator
- NRE estimate: $15–18M (mask set ~$2M for 100mm², PDK + tools $3M, engineering $10M)
- Tape-out timeline from $10M seed: Month 14–16

This test chip:
- Demonstrates CMFC context switching, KV directory, and priority scheduling in real silicon
- Achieves yield characterization at target node
- Generates performance data for investor presentations
- Is not a product (too small TCA, no GDDR7) but proves the architectural novelty that justifies the full chip investment

Series B funding case: "We have silicon. The CMFC switches 32 Pod contexts in 1.8ms in silicon, matching our RTL simulation. Here is the silicon characterization data. We need $60M to build the full chip with full TCA and GDDR7 integration."

---

## 9. Killer Assumptions

### Assumption 1: GDDR7 + 12nm provides sufficient bandwidth for 70B W4A8 inference at <50ms TTFT

**Precise statement**: A CortexChip at Samsung SF12 with 8× GDDR7 stacks via FOPLP packaging achieves ≥700 GB/s effective memory bandwidth for real 70B W4A8 attention workloads (including random-access KV cache reads), enabling TTFT <50ms at batch=1 for interactive requests.

**Validation evidence that would confirm it**:
- FPGA emulation (Month 3–5): measure effective bandwidth for real LLaMA-3 70B W4A8 attention workloads at 13B scale (bandwidth scales linearly with model size)
- Post-tape-out silicon characterization (Month 17–18): direct measurement of GDDR7 effective bandwidth on v1 chip
- Third-party benchmark: MLPerf Inference submission on CortexChip v1 for independent validation

**Validation evidence that would deny it**:
- FPGA emulation shows effective bandwidth <400 GB/s for 13B W4A8 workload (projects to <700 GB/s for 70B)
- GDDR7 random-access bandwidth (for KV cache reads) is measured at <50% of sequential read bandwidth

**Fallback if it fails**:
- Option A: Scope to ≤13B models — bandwidth requirement drops to ~130 GB/s, achievable with 2× GDDR7 stacks
- Option B: Pivot to batch throughput — relax TTFT requirement to 500ms, increase effective batch size to 64–128, dramatically improving bandwidth efficiency through sequential access
- Option C: HBM rearchitecture — accept TSMC CoWoS dependency, acquire HBM3 (3.6 TB/s), rebuild platform economics (chip cost increases from ~$3K to $10–15K due to CoWoS packaging)

**Decision point**: The FPGA validation result on this assumption must be available before committing Series A capital to tape-out NRE. $200K FPGA validation versus $60–80M tape-out commitment.

---

### Assumption 2: Agent-mesh inference becomes the dominant LLM deployment pattern by 2027

**Precise statement**: By 2027, >40% of enterprise LLM inference requests (by token volume) are generated by multi-agent systems rather than single-model API calls, creating demand for CortexChip's specific architectural advantages.

**Validation evidence that would confirm it**:
- Production data from major AI frameworks (LangChain, LlamaIndex, AutoGen) showing multi-agent workflow adoption rates
- Enterprise customer interviews confirming agent-mesh deployments are in production or on 12-month roadmaps
- Public API traffic patterns from major inference providers showing multi-agent traffic share
- Market research from Gartner/IDC on agentic AI deployment

**Validation evidence that would deny it**:
- Enterprise adoption stalls due to reliability/cost of agent orchestration
- Single large models (GPT-5 scale) prove capable of multi-step reasoning without agent orchestration, reducing mesh demand
- Agent frameworks consolidate around GPU-optimized architectures, with software workarounds making GPU-based multi-agent systems "good enough"

**Fallback if it fails**:
If agent-mesh inference does not achieve the predicted adoption by 2027, CortexChip v1 can be positioned as a high-efficiency, low-cost inference accelerator for single-model workloads in the Asian market. The CMFC becomes a high-efficiency multi-tenant isolation mechanism rather than an agent coordination engine. The economic case (1 CortexChip at $3K versus 1 H100 at $30K for equivalent throughput on smaller models) still stands for the 13B model market. This is a smaller addressable market but not a company-ending scenario.

---

### Assumption 3: Samsung SF12 or GF 12LP+ foundry access remains available and unencumbered by export controls through 2028

**Precise statement**: CortexPod can secure and maintain access to Samsung SF12 or GF 12LP+ foundry services, and the EDA tools (Cadence/Synopsys) required for 12nm design, without material interruption from US export control regulations, through the CortexChip v2 tape-out in 2027–2028.

**Validation evidence that would confirm it**:
- Legal opinion from export control specialists on current EDA tool licensing for the proposed entity structure
- Foundry capacity commitment letter from Samsung or GF
- BIS Advisory Opinion on the chip design's ECCN classification

**Validation evidence that would deny it**:
- US BIS expands export controls to restrict EDA tools for entities above a certain foreign ownership threshold
- Samsung Foundry prioritizes captive and Tier-1 customers during capacity crunch, leaving startup allocation unfulfilled
- New legislation targets 12nm-class chips as "advanced computing" under expanded export control definitions

**Fallback if it fails**:
- If EDA tools are restricted: investigate Japan-based EDA alternatives (no viable current option — Cadence/Synopsys dominate)
- If Samsung capacity is unavailable: GF 12LP+ as primary; SMIC N+2 (14nm equivalent) as last resort (performance penalty acceptable for initial product)
- If 12nm chips are reclassified as controlled: legal restructuring of entity (US holding company design entity, Asian operations entity) — complicated but not impossible
- Ultimate fallback: FPGA-based product using Intel Agilex or Xilinx Versal at 10nm/7nm (Intel is US entity, no export control issue) with software CMFC emulation — sacrifices hardware moat but preserves platform business

This assumption has the lowest probability of failure (estimated 15–20% for any material disruption) but the highest impact if it fails, as it affects the fundamental production path. The dual-foundry strategy and US entity structure are partial mitigations; complete mitigation is not achievable.

---

## 10. Appendix: Technical Reference

### 10a. Process Node Comparison (Full Detail)

| Node | Key foundry | Transistor density (MTr/mm²) | Typical power vs 28nm | EUV layers | Min metal pitch (nm) | Representative chips | Startup viability |
|---|---|---|---|---|---|---|---|
| 28nm | SMIC, GF, Samsung, TSMC | ~28 | 1× baseline | 0 | ~64 | Xilinx Kintex-7, older ASIC designs | High: low NRE, many options |
| 22nm/20nm | GF 22FDX, TSMC 20nm | ~40 | ~1.4× | 0 | ~54 | GF 22FDX IoT chips | Medium: GF capacity limited |
| 16nm/14nm | Samsung S14, GF 14HP, TSMC N16 | ~60–70 | ~1.8× | 0 | ~40 | Apple A9, AMD Zen 1 | Medium: NRE $30–50M |
| **12nm** | **Samsung SF12, GF 12LP+** | **~80** | **~2.5×** | **0** | **~36** | **Nvidia Tegra Xavier (12nm)** | **High: optimal for CortexPod** |
| 7nm | Samsung SF7P, TSMC N7 | ~100 | ~3.5× | Partial | ~28 | Apple A12, AMD Zen 2 | Low: NRE $150–250M, TSMC risk |
| 5nm | TSMC N5 (primary) | ~170 | ~5.5× | Full | ~19 | Apple A15, AMD Zen 4 | Very Low: NRE $400M+, TSMC only |
| 3nm | TSMC N3 | ~290 | ~7× | Full | ~14 | Apple A17 | Not viable: $600M+ NRE |

### 10b. GDDR7 vs HBM3 Comparison

| Specification | GDDR7 (2024 production) | HBM3 (2023–2024) |
|---|---|---|
| Data rate per pin | 32 Gbps | 6.4 Gbps per pin (but wider bus) |
| Bus width per stack | 32-bit | 1024-bit |
| Bandwidth per stack | ~128 GB/s (effective) | ~820 GB/s |
| Typical stacks for AI chip | 8 | 4–6 |
| Total BW (typical) | ~1.0 TB/s (effective) | ~3.3–4.9 TB/s |
| Capacity per stack | 12–24 GB | 12–24 GB |
| Cost per GB (2024) | ~$8–10 | ~$22–28 |
| Packaging requirement | Standard BGA or FOPLP | Advanced (TSMC CoWoS or SK Hynix HBMC) |
| Supply chain | Samsung + SK Hynix + Micron | SK Hynix (primary), Micron (limited) |
| Power per TB/s | ~12W | ~8W |
| TSMC dependency | None | Yes (CoWoS for most implementations) |
| Availability to startups | Accessible via standard contracts | Constrained by CoWoS allocation |

### 10c. CXL 2.0 Specifications and Cluster Topology

**CXL 2.0 Physical Specifications**:

| Parameter | Value |
|-----------|-------|
| Base physical layer | PCIe 5.0 (32 GT/s per lane) |
| Lane bandwidth | 4 GB/s per lane (unidirectional) |
| Typical implementation | ×8 or ×16 lanes |
| Max bandwidth (×16) | 64 GB/s bidirectional |
| Hop latency | ~200–300ns per switch hop |
| Protocol overhead vs raw bandwidth | ~5–10% |
| Memory expansion support | Yes (CXL 2.0 Type 3 device) |
| Coherency support | Yes (CXL 2.0 cache coherency protocol) |

**Available CXL 2.0 Switch Silicon**:

| Switch | Vendor | Port count | Bandwidth/port | Latency |
|--------|--------|-----------|----------------|---------|
| PAX28 | Microchip | 28 downstream ports | 64 GB/s | ~150ns |
| Leo | Astera Labs | 24 downstream ports | 64 GB/s | ~100ns |
| CXL switch (unreleased) | Retimer vendors | TBD | TBD | TBD |

**Cluster topology options**:

| Topology | Best for | Switch hops (worst case) | Latency (worst case) |
|----------|----------|--------------------------|---------------------|
| Star (single switch) | ≤28 chips | 2 hops | ~600ns |
| Fat-tree (2-level) | 64–256 chips | 4 hops | ~1.2ms |
| Dragonfly | 256+ chips | 6 hops | ~2ms |

For CortexPod's target cluster sizes (1–64 chips), a single-level CXL switch (star topology) is sufficient and minimizes latency.

### 10d. W4A8 Accuracy Benchmarks

Comparison of quantization accuracy versus FP16 baseline on standard benchmarks:

| Benchmark | FP16 (baseline) | INT8 (W8A8) | W4A8 | W4A4 |
|-----------|-----------------|-------------|------|------|
| MMLU (LLaMA-3 70B) | 79.5% | 79.2% (−0.3%) | 78.3% (−1.2%) | 75.1% (−4.4%) |
| HumanEval (LLaMA-3 70B) | 72.0% | 71.5% (−0.7%) | 70.2% (−1.8%) | 64.0% (−8.0%) |
| GSM8K (LLaMA-3 70B) | 90.5% | 90.1% (−0.4%) | 89.0% (−1.5%) | 83.2% (−7.3%) |
| TruthfulQA (LLaMA-3 70B) | 64.0% | 63.5% (−0.5%) | 62.8% (−1.2%) | 58.1% (−5.9%) |
| **Average accuracy loss** | 0% | **−0.5%** | **−1.4%** | **−6.4%** |

Sources: GPTQ paper, AWQ paper, AutoRound benchmarks (2023–2024). Specific numbers vary by model and calibration dataset quality. W4A8 with hardware-assisted calibration (as in CortexChip's calibration assist registers) can recover 0.3–0.5% of the accuracy loss shown above.

**Practical implication**: For most enterprise applications, a 1.4% average accuracy reduction is acceptable. For high-stakes applications (medical, legal, financial compliance), W4A8 should be validated specifically on domain-relevant benchmarks before production deployment.

### 10e. Foundry Landscape: Honest Capability Comparison

| Attribute | Samsung SF12 | GF 12LP+ | SMIC N+2 (14nm equiv.) |
|---|---|---|---|
| Node designation | 12nm | 12nm | 14nm (N+2 is their most advanced) |
| Equivalent logic density | ~80 MTr/mm² | ~75 MTr/mm² | ~65 MTr/mm² |
| EUV usage | None | None | None |
| Leakage current (normalized) | 1× | ~1.2× | ~1.5× |
| Peak frequency (ring oscillator) | 1× | ~0.92× | ~0.85× |
| Yield maturity (for complex design) | High (10+ years production) | High | Medium (node is newer, less mature) |
| Startup access | Possible with business case | More accessible than Samsung | Currently restricted by US export controls for design tool access |
| Supply risk | Moderate (Samsung captive priority) | Low (GF has available capacity) | High (under US Entity List pressure; growing restrictions) |
| Packaging ecosystem | CoWoS (TSMC), FOPLP (ASE) | FOPLP (ASE), standard BGA | Limited advanced packaging options |
| Engineering support quality | Excellent | Good | Variable |
| Lead time (engineering run) | 4–5 months | 4–5 months | 4–6 months |
| **CortexPod recommendation** | **Primary target** | **Backup, engage in parallel** | **Not recommended: geopolitical risk unacceptable** |

**On SMIC**: SMIC's N+2 node is technically viable for CortexChip — the performance gap versus Samsung SF12 is approximately 15–20% in frequency and power, manageable for inference workloads. The disqualifying factor is not technical but political: Cadence and Synopsys EDA tools are subject to US export controls when used with SMIC, and SMIC itself is on the US Entity List, creating compliance complexity for any customer-facing product. CortexPod's target customers in India, Vietnam, and Singapore do not want infrastructure supplied by a foundry under US export restrictions — it creates their own compliance risk.

**On GF 12LP+**: GF's decision to exit sub-10nm in 2018 concentrated engineering resources on 12nm refinement. The 12LP+ process has been in production for 5+ years, yield is well-characterized, and GF has available capacity that Samsung often does not. If Samsung Foundry cannot commit production capacity for a startup (a realistic concern), GF 12LP+ is the primary alternative, not a fallback with significant technical compromise.

---

*Document prepared March 2026. Technical specifications are design targets pending FPGA validation. All cost estimates are indicative and subject to negotiation with foundry and packaging partners. This document does not constitute a commitment to any specific product specification, pricing, or timeline.*

*CortexPod — Engineering for the agent-mesh era.*
