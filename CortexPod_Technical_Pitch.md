# CortexPod: A Silicon-First Platform for Distributed Agent Inference

**Document Classification:** Investment Pitch / Technical Credibility Document  
**Target Audience:** Semiconductor-literate VCs · AI CTOs · Chip Architects · Strategic Corporate Investors (Asia)  
**Version:** 1.0 — March 2025  
**Status:** Pre-Seed / Seed Round

---

## Section 0 — Executive Summary

**The problem in one sentence:** Asian enterprises building multi-agent AI systems cannot access sufficient GPU infrastructure — NVIDIA's H100/H200/Blackwell chips are export-controlled under the January 2025 U.S. AI Diffusion Rule, and the GPU architecture itself is fundamentally wrong for agent-mesh inference workloads.

**The solution in one sentence:** CortexPod is building the CortexChip — a custom 12nm inference ASIC purpose-built for concurrent agent-mesh workloads — distributed via a Fly.io-style deployment platform that abstracts hardware complexity for developers and enterprises across Asia.

**The market opportunity:** The global AI agents market grows from $7.84B in 2025 to $52.62B by 2030 at 46.3% CAGR (MarketsandMarkets, 2025). Multi-agent systems specifically compound at 48.5% CAGR — the fastest-growing subsegment. Asia-Pacific leads all regions at 49.5% CAGR, projected to reach $14.15B by 2030. The underlying inference chip market reaches $284.9B by 2034 at 30.2% CAGR, with ASICs already commanding 42% share. The intersection of these curves — agentic workload demand against GPU supply constraints — creates a structural gap that no existing product fills.

**The ask:** CortexPod is raising a $10M seed round to fund an 18-month program: FPGA architecture validation of the CortexMesh Fabric Controller, a 32-Pod test chip tape-out at Samsung SF12 or GlobalFoundries 12LP+, and a GPU-phase deployment platform generating paying customers before silicon ships. Preferred investors: semiconductor-focused VCs, corporate strategic investors in Asia (telecom, banking, sovereign wealth), and family offices with deep-tech exposure.

**The 3-year vision:** At Series B (2028), CortexPod operates as a dual-revenue business — a chip licensing and supply business serving Asian AI infrastructure deployments, and a managed inference platform running on proprietary silicon. CortexChip v2.0 (512 Pod capacity, 300W TDP) is in volume production. Annual recurring revenue targets $25M+. Gross margin on CortexChip-native inference runs exceeds 65% — unreachable on GPU-based clouds due to hardware rental costs. The company holds the only purpose-built inference ASIC designed explicitly for agent-mesh access patterns, manufactured through a supply chain independent of TSMC and NVIDIA.

---

## Section 1 — Strategic Thesis

> "CortexPod is building a custom inference ASIC optimized for agent-mesh workloads, distributed via a Fly.io-style deployment platform, targeting the Asian market where NVIDIA supply is constrained by export controls and cost sensitivity is highest."

### Why Agent-Mesh Inference Is Architecturally Different

The inference workloads dominating enterprise AI in 2025 are not single-model API calls. They are coordinated systems of 4–32 specialized agents — a router, a researcher, a writer, a validator, a compliance checker — operating concurrently on shared document context, passing partial results to each other in sub-5ms handoffs. This is structurally different from serving a single LLM:

- **Single-model inference** optimizes for: maximum throughput on one model, one request stream, high-batch aggregation.
- **Agent-mesh inference** requires: many concurrent models (7B–70B range), shared key-value (KV) cache across the mesh, fast context switching between agents, heterogeneous SLA tiers (interactive vs. background), and hardware-enforced namespace isolation per agent instance (Pod).

These are not software-level differences. They manifest as fundamentally different memory access patterns, scheduling requirements, and inter-agent communication primitives. Software optimization on top of GPU hardware cannot close this gap — it can only mitigate it. The bottleneck is in the memory subsystem and the scheduler, not in FLOPS.

### Why This Justifies a Custom Chip

Groq's LPU demonstrated that domain-specific silicon unlocks step-change efficiency improvements unavailable to general-purpose architectures. The same logic applies here: if the bottleneck is KV cache bandwidth and context switch latency, you design silicon with a hardware KV cache directory and a sub-2ms context handoff engine. You cannot add these primitives to an H100 in software — the memory hierarchy and scheduling model are fixed at the architectural level.

### Why 12nm Is a Strategic Choice, Not a Cost Compromise

12nm FinFET (Samsung SF12 or GlobalFoundries 12LP+) delivers approximately 3× power efficiency and 2× logic density versus 28nm. For a 300W TDP chip serving 256 concurrent agent Pods, 28nm would require 2–3× more chips per rack to deliver equivalent throughput — the per-Pod economics collapse.

Equally important: 12nm does not require EUV lithography, reducing TSMC dependency. NRE at 12nm runs $50–80M versus $500M+ at 5nm. Yield at first tape-out exceeds 85% at 12nm versus sub-60% risk at advanced nodes. For a first-generation inference ASIC with a $10M seed, 12nm is the only credible path to silicon within 18 months.

### Why Asia Is the Right First Market

Four forces converge simultaneously:

1. **Supply constraint:** NVIDIA H100/H200/Blackwell is inaccessible or quantity-capped for Tier 2 Asia markets under the January 2025 U.S. AI Diffusion Rule. Vietnam, India, Indonesia, Thailand, and Malaysia collectively face a ~50,000 GPU annual limit through 2027.
2. **Cost sensitivity:** The median AI startup in Southeast Asia raises a $2–5M Series A. At $30,000 per H100, a 32-chip cluster for a 256-agent mesh costs $960,000 — close to the entire infrastructure budget. A CortexChip-equivalent at $3,000 changes the economics entirely.
3. **Regulatory tailwind:** Thailand PDPA, Vietnam Nghị định 13/2023, India DPDP Act 2023, China PIPL, and Indonesia UU PDP mandate local data processing in regulated verticals, disqualifying hyperscaler API endpoints for BFSI, healthcare, and government workloads.
4. **Growth velocity:** Asia-Pacific AI agent adoption is growing at 49.5% CAGR — the fastest region globally. Infrastructure supply is running 18–24 months behind U.S. maturity. The market is forming now.

### The "Distributed Brain" Mental Model

Think of the CortexChip as a brain substrate. Individual Pods are neurons — each running a specialized model, each maintaining its own activation state. The CortexMesh Fabric Controller is the synaptic network — routing signals (context, KV cache pages, partial results) between Pods at hardware speed, with biologically plausible latency. No GPU cluster offers this primitive. You cannot emulate a synapse efficiently with a software message queue.

### The 2025–2027 Timing Window

Asian AI infrastructure is 18–24 months behind the United States in enterprise deployment maturity. Hyperscalers (AWS, Azure, GCP) are actively expanding their Asia-Pacific regions — but their GPU allocation for inference is supply-constrained, their compliance story for data sovereignty is incomplete, and their pricing makes agent-mesh workloads at scale uneconomical for mid-market enterprises. The window to establish hardware and platform relationships before hyperscaler lock-in solidifies is 2025–2027. After that, the switching cost rises sharply.

---

## Section 2 — Market Analysis: The Agent Inference Gap

### 2a. The AI Agent Market Inflection Point

The global AI agents market stands at $7.84B in 2025 and is forecast to reach $52.62B by 2030 at a 46.3% CAGR (MarketsandMarkets, 2025). A longer-horizon projection from Grand View Research places the market at $182.97B by 2033 at 49.6% CAGR, suggesting compounding agentic deployments remain underestimated even in near-term forecasts.

The critical sub-segmentation: **multi-agent systems are growing at 48.5% CAGR** — outpacing single-agent deployments. This is not marginal. Multi-agent frameworks (AutoGen, LangGraph, CrewAI, custom orchestration) are becoming the deployment default for enterprise AI in BFSI, legal, healthcare, and research verticals — precisely the sectors with highest willingness to pay for infrastructure.

Multi-agent deployment does not merely increase GPU demand linearly. It changes the infrastructure requirements qualitatively:

- Where a single-agent deployment requires one model loaded into one memory context, a multi-agent mesh requires 4–32 models with shared document context and sub-5ms handoffs.
- Current infrastructure assumption: scale up GPU clusters to serve these workloads. Actual infrastructure requirement: hardware with native concurrency primitives, shared KV cache management, and Pod-level scheduling isolation.

The market is growing into an infrastructure gap. No product currently closes it.

### 2b. The GPU Supply Choke Point in Asia

The **U.S. AI Diffusion Rule (effective January 2025)** establishes a three-tier country framework for AI chip exports:

- **Tier 1 (unrestricted):** 18 close U.S. allies — the United Kingdom, Japan, South Korea, Australia, and 14 others. Notably excludes all of Southeast Asia, India, and most of Asia-Pacific.
- **Tier 2 (quantity-capped):** ~120 countries including Vietnam, India, Indonesia, Thailand, Malaysia, the Philippines, and most of Southeast and South Asia. A ~50,000 GPU equivalent annual limit applies through 2025–2027, with enhanced scrutiny on hyperscaler deployments.
- **Tier 3 (prohibited):** China, Russia, Iran, North Korea.

Malaysia, Thailand, and Singapore face additional enhanced scrutiny due to suspected GPU transshipment to China — a compliance burden that suppresses even legitimate enterprise procurement. The result: large Asian enterprises that could legally purchase H100 clusters are deterred by reputational and compliance risk, not just quota limits.

**The DeepSeek case study:** When DeepSeek released its R1 model in early 2025, it was forced to restrict API access within days of launch due to insufficient inference compute — despite being one of the most capable frontier models available. The model existed. The compute to serve it at scale did not. This is not a software problem. It is a silicon supply problem. DeepSeek's experience previews what every Asian AI company building production inference systems will face over the next 24 months.

**Huawei's Ascend gap:** Huawei's Ascend 910B is the most credible alternative for Chinese domestic demand, but production in 2025 is estimated at ~200,000 chips — insufficient to cover domestic demand, let alone regional markets. Ascend's software stack (CANN) lacks the ecosystem maturity to attract non-Chinese buyers operating international developer toolchains. For Southeast Asian or South Asian enterprises, Ascend is not a viable alternative: geopolitical exposure is high, software support is limited, and supply outside China is effectively zero.

**Conclusion:** The GPU supply chain is structurally unable to serve Asian AI agent demand through 2027. This is not cyclical. It is a policy architecture enforced by the U.S. Department of Commerce with explicit country tiering and multi-year enforcement mechanisms.

### 2c. The Sovereign AI Tailwind

Five major regulatory frameworks in Asia create legal requirements for local data processing that make hyperscaler-only AI deployment insufficient for regulated industries:

| Regulation | Jurisdiction | Key Requirement |
|---|---|---|
| Nghị định 13/2023 | Vietnam | Localization of personal data for certain categories; cross-border transfer restricted |
| DPDP Act 2023 | India | Data fiduciary obligations; significant data fiduciary designation for large processors |
| PDPA (2019, amended 2021) | Thailand | Sensitive data requires explicit consent and localization preference for processing |
| PIPL (2021) | China | Cross-border transfer requires government approval; local storage for critical data |
| UU PDP (2022) | Indonesia | Strategic sector data must be processed domestically |

These regulations make a pure hyperscaler API deployment strategy legally insufficient for BFSI, healthcare, and government workloads across the five largest AI markets in Asia. The practical implication: inference must occur on local compute. That compute must be procurable.

Evidence of sovereign AI demand is no longer theoretical:

- **Singtel (Singapore)** launched its RE:AI initiative to build domestic AI infrastructure, deploying inference at NCS (its subsidiary). Currently fully dependent on NVIDIA hardware — a single supply failure point it is actively seeking to diversify.
- **Indosat (Indonesia)** is investing in domestic AI infrastructure for regulated Indonesian enterprise customers, explicitly citing data sovereignty requirements under UU PDP.
- These buyers need an alternative to NVIDIA not for ideological reasons but for supply certainty, regulatory compliance, and total cost of ownership. They represent CortexPod's natural first enterprise customers.

### 2d. The Market Gap in One Paragraph

No chip exists today that is simultaneously: (1) purpose-built for concurrent agent-mesh inference — meaning hardware-native KV cache directory, sub-2ms context switching, and 256+ concurrent Pod scheduling; (2) manufacturable outside TSMC/NVIDIA supply chains, specifically at Samsung SF12 or GF 12LP+ via ASE Group packaging, accessible to Tier 2 Asia markets under current export control frameworks; (3) cost-competitive at the scale accessible to Asian mid-market enterprises operating on $2–5M Series A infrastructure budgets; and (4) packaged with a developer platform that handles multi-region deployment with data residency enforcement across Singapore, Mumbai, Hong Kong, Jakarta, and Ho Chi Minh City jurisdictions. CortexPod closes all four gaps simultaneously with a single technical bet: that agent-mesh inference access patterns are stable enough to encode in silicon, and that 12nm is the right process node to do so within the capital and time constraints of a seed-stage company.

---

## Section 3 — The Silicon Gap: Why GPUs Are Wrong for Agent Workloads

### 3a. The Access Pattern Mismatch

Consider a concrete financial research mesh with 8 specialized Pods running concurrently:

| Pod | Function | Model size | TTFT SLA | KV cache sharing |
|---|---|---|---|---|
| Router | Query classification, dispatch | 7B | <10ms | Reads mesh state |
| Researcher | Document retrieval & synthesis | 70B | <500ms | Reads shared doc context |
| Data Fetcher | Financial data extraction | 13B | <200ms | Writes to shared doc context |
| Fact Checker | Claim verification | 13B | <300ms | Reads researcher output |
| Writer | Report generation | 70B | <1000ms | Reads all context |
| Compliance | Regulatory flag detection | 13B | <200ms | Reads writer output |
| Translator | Multilingual output | 13B | <300ms | Reads writer output |
| Summarizer | Executive summary | 7B | <500ms | Reads writer output |

This mesh requires: 8 simultaneous model contexts active in memory, a shared document KV cache (the SEC filing, earnings report, or market data the mesh is analyzing), sub-5ms handoff latency when the Router dispatches to the Researcher, and heterogeneous SLA enforcement across interactive and background tiers.

**Why this breaks on an H100:** The H100's CUDA execution model assumes one model, one stream, full memory bandwidth dedicated to that stream. Running 8 concurrent model contexts on a single H100 requires software-managed context multiplexing with ~50ms context switch overhead per transition (memory flush, reload, rehydrate KV cache). At 8 agents with frequent handoffs, this 50ms overhead dominates the mesh's wall-clock latency. Sub-5ms handoff is physically impossible on GPU software.

### 3b. The Memory Architecture Mismatch

**The bandwidth math:**

- 8× 70B W4A8 agents: each model = 70B × 0.5 bytes (INT4 weights, 4 bits = 0.5 bytes) = **35GB per model**
- Total weight footprint: 8 × 35GB = **280GB**
- H100 HBM capacity: 80GB (SXM5 variant)
- H100s required for weights alone: **4 chips**
- KV cache for shared 128K-token document context at 70B model dimensions (GQA, 8 heads): ~8GB additional
- Total H100s for a functional 8-agent mesh: **4–6 chips ($120K–$180K hardware)**

The H100's HBM is designed for training-first access patterns: large sequential reads for gradient accumulation, high-bandwidth batched operations. For agent-mesh inference, the access pattern is random, interleaved, and frequently switching between model weight pages and KV cache pages — precisely the pattern that defeats HBM prefetching.

The CortexChip's GDDR7-based memory subsystem (96GB, ~1.8 TB/s) is sized for inference access patterns. More critically, the 512MB on-chip SRAM scratchpad, divided into 256 Pod slots of 2MB each, maintains hot KV cache pages and LoRA adapter weights per active Pod in SRAM — eliminating DRAM round-trips for the most frequently accessed state. The hardware prefetcher predicts next Pod activation from mesh routing history, pre-loading the relevant slot before the Router dispatches.

### 3c. The Scheduling Granularity Mismatch

CUDA streams provide thread-block-level scheduling granularity. Multiplexing 8 concurrent model contexts on a GPU requires software-level context management: save activation state, flush relevant HBM pages, load next model's weights, restore KV cache, resume execution. Best-case software context switch on an H100: 20–50ms. This is an order-of-magnitude worse than the CortexChip CMFC target of <2ms.

The CMFC implements 256 hardware priority lanes — one per concurrent Pod instance. Priority scheduling and preemption are implemented in silicon, not in a software scheduler daemon running at OS context-switch frequency. Context transfer of 32KB of KV cache state between Pods occurs in <2ms without CPU involvement, using a dedicated context handoff engine on the CMFC die. This is not a software optimization. It is a new hardware primitive.

### 3d. Efficiency Gap: 256-Agent Inference Workload

**Assumptions:** 256 concurrent agent Pods, mixed model sizes (primarily 13B–70B W4A8), 10,000 requests/day, interactive SLA target for primary response path.

| Infrastructure | Chips needed | Hardware cost | Power (TDP) | Rack space | Cost/M tokens (est.) |
|---|---|---|---|---|---|
| H100 SXM5 cluster | 32× H100 | $960,000 | 22,400W (32×700W) | ~8U per 8-chip tray | ~$8–12 |
| AWS Inferentia2 (equivalent) | N/A (rental) | ~$35K/mo rental | Included in SLA | N/A | ~$4–6 |
| CortexChip v1.0 (target) | 1× chip | $3,000 | 300W | 1U | ~$0.50–1.00 |

**The business case in one line:** For a 256-pod financial research mesh at production SLA, CortexChip v1.0 targets the hardware economics of 1 chip versus 32 H100s. The cost differential is 320×. Even if the CortexChip delivers only half its target Pod density, the economics remain transformative.

*Caveats:* The H100 cluster offers greater flexibility across workload types (training, fine-tuning, vision). CortexChip v1.0 is inference-specialized. The comparison is valid only for the target workload class.

### 3e. Competitor Landscape

| Competitor | Strength | Agent-Mesh Gap | Asia Access | Cost Point |
|---|---|---|---|---|
| **Groq LPU** | Best-in-class single-stream latency | Optimized for one stream, not concurrent Pod scheduling | Limited; U.S.-centric cloud | Premium; no chip sales |
| **AWS Inferentia2** | Cost-effective AWS inference | Requires AWS lock-in; no on-prem option; API-only | Unavailable for direct procurement in most Tier 2 Asia | Competitive on AWS; no local option |
| **Huawei Ascend 910B** | Only non-NVIDIA alternative at scale | Software maturity gap (CANN ecosystem); not designed for agent-mesh | ~200K chips in 2025; geopolitical risk for non-Chinese buyers | Unknown; not commercially accessible outside China |
| **Cerebras CS-3 (wafer-scale)** | Extraordinary single-chip throughput | $80K+ price point; not accessible to Asian mid-market; inference-only applications are narrow | No Asia distribution; withdrawn IPO signals financial uncertainty | $80K+ — disqualifying |
| **Google TPU v5** | Exceptional efficiency for Google workloads | Hyperscaler-internal; external access limited and constrained | Available in limited GCP regions; still hyperscaler lock-in | Rental only; no procurement |
| **NVIDIA Dynamo (2025)** | Disaggregated serving; better prefill/decode | Optimized for throughput, not concurrent Pod isolation; still requires H100/Blackwell hardware subject to export controls | Tier 2 Asia hardware access unchanged; software running on inaccessible chips solves nothing | H100/B100 hardware cost unchanged |

**Conclusion:** No competitor in this landscape solves the agent-mesh + Asia access + cost trifecta. Groq and Cerebras solve parts of the performance problem at the wrong price point or geography. Huawei addresses the geography but not the workload or the software ecosystem. NVIDIA Dynamo improves software efficiency but cannot change the export control hardware supply constraint. The gap is real and unaddressed.

---

## Section 4 — CortexChip Architecture

### 4a. Process Node Decision Matrix

| Node | NRE Cost | Foundry Options | EUV Required | Power Efficiency | Time to First Tape-Out | Geopolitical Risk | Verdict |
|---|---|---|---|---|---|---|---|
| **28nm** | $15–25M | SMIC, Samsung, GF, TSMC | No | Baseline (1.0×) | 12–14 months | Low (broad supply) | Power/density insufficient for target TDP |
| **14nm** | $30–50M | Samsung, GF, TSMC | No | 2.0× vs 28nm | 14–16 months | Medium | Viable; less efficient than 12nm; limited GF capacity |
| **12nm** | $50–80M | Samsung SF12, GF 12LP+ | No | 3.0× vs 28nm | 14–18 months | Low-Medium | **Selected — optimal balance** |
| **7nm** | $150–250M | Samsung, TSMC | Partial (TSMC 7nm+) | 4.5× vs 28nm | 20–24 months | High (TSMC dependency) | Out of reach at seed; TSMC lock-in |
| **5nm** | $400–600M | TSMC (primary), Samsung | Yes | 6.0× vs 28nm | 24–30 months | Very High | Not viable for seed stage; TSMC monopoly risk |

**Selection rationale — Samsung SF12 (primary), GF 12LP+ (backup):**

Samsung SF12 offers full 12nm FinFET performance without EUV dependency, with established NRE pricing in the $60–80M range for full mask sets, multi-project wafer (MPW) shuttle options for test chip at <$15M, and wafer-level packaging support through Samsung's own FOPLP line. GlobalFoundries 12LP+ serves as a geopolitically diversified backup: GF is a U.S.-headquartered company with fabs in Germany (Dresden) and Singapore (Woodlands), reducing both TSMC and Samsung concentration risk. GF does not require EUV for 12nm, and its 12LP+ process node is a production-proven, mature platform used by AMD and other volume customers.

**Chiplet packaging:** Logic die (12nm) + GDDR7 memory die packaged via Fan-Out Panel Level Packaging (FOPLP) through ASE Group. This avoids TSMC CoWoS dependency — the primary bottleneck for HBM-based chiplet packages.

### 4b. Die Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CortexChip v1.0 Die (~450mm²)                      │
│                                                                          │
│  ┌───────────────────────────────┐  ┌─────────────────────────────┐    │
│  │   TENSOR CORE ARRAY (TCA)     │  │  CORTEXMESH FABRIC          │    │
│  │   ~38% die area               │  │  CONTROLLER (CMFC)          │    │
│  │                               │  │  ~22% die area              │    │
│  │  512×512 systolic array       │  │                             │    │
│  │  W4A8 native INT4/INT8        │  │  KV cache directory (256)   │    │
│  │  2 TFLOPS INT8 effective      │  │  Context handoff engine     │    │
│  │  Sparse attn + SSM support    │  │  256 priority lanes         │    │
│  │  Speculative decode unit      │  │  Mesh routing logic         │    │
│  └───────────────────────────────┘  └─────────────────────────────┘    │
│                                                                          │
│  ┌───────────────────────────────┐  ┌─────────────────────────────┐    │
│  │   ON-CHIP SRAM SCRATCHPAD     │  │  MEMORY CONTROLLER          │    │
│  │   ~18% die area               │  │  + GDDR7 PHY                │    │
│  │                               │  │  ~12% die area              │    │
│  │  512MB total                  │  │                             │    │
│  │  256 Pod slots × 2MB each     │  │  8× GDDR7 channels          │    │
│  │  LoRA + KV cache + activ.     │  │  96GB capacity              │    │
│  │  Hardware prefetcher          │  │  ~1.8 TB/s bandwidth        │    │
│  └───────────────────────────────┘  └─────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │  CXL 2.0 HOST I/F   │  │  POWER MANAGEMENT UNIT (PMU)            │  │
│  │  ~6% die area       │  │  ~4% die area                           │  │
│  │                     │  │                                         │  │
│  │  4× CXL lanes       │  │  Per-Pod DVFS                           │  │
│  │  64 GB/s aggregate  │  │  Thermal management                     │  │
│  │  HW coherency prot. │  │  Clock domain isolation                 │  │
│  └─────────────────────┘  └─────────────────────────────────────────┘  │
│                                                                          │
│  [8× GDDR7 chiplets attached via FOPLP — off-die, packaged together]    │
└────────────────────────────────────────────────────────────────────────┘
```

### 4c. CortexMesh Fabric Controller — Deep Dive

The CMFC is the architectural differentiator. It is not an accelerator block. It is a hardware operating system kernel for agent-mesh inference scheduling, implemented in silicon.

**KV cache directory structure:**
The CMFC maintains a hardware directory of 256 Pod contexts. Each entry records: Pod ID, active model ID, physical SRAM slot assignment (2MB), last-active KV cache page table (up to 64 × 4KB pages per Pod), and mesh routing state (which other Pods this Pod has exchanged context with, in what order). This directory is queryable in a single cycle — no cache lookup chain, no software hash table traversal. When the Router Pod dispatches a query to the Researcher Pod, the CMFC resolves the Researcher's current memory state in one cycle and pre-stages the context handoff before the dispatch completes at the software layer.

**Context handoff protocol:**
When Pod A hands off to Pod B, the CMFC executes:
1. Serialize A's delta KV cache state (only pages written since last shared checkpoint) → 32KB typical
2. DMA transfer to B's SRAM slot via the CMFC's dedicated 256 GB/s internal bus (not GDDR7 DRAM path)
3. Update B's KV cache page table to include shared pages from A (zero-copy reference, not data copy for read-only shared context)
4. Signal B's priority lane as "ready" — B is now schedulable
Total latency: <2ms. CPU involvement: zero.

**Priority scheduling hardware:**
256 hardware priority lanes implement a strict priority preemption model. Interactive-tier Pods (Router, Compiler agents) hold high-priority lane reservations. Background-tier Pods (batch writers, overnight summarizers) hold low-priority lanes. Preemption is handled in hardware: if a high-priority Pod becomes runnable while the TCA is occupied by a low-priority Pod, the CMFC issues a preemption signal within one clock cycle, saves the low-priority Pod's scratchpad state, and schedules the high-priority Pod. Software scheduler daemon overhead: effectively zero.

**Shared KV cache coherency:**
For a mesh where multiple Pods read the same document context (e.g., all 8 Pods in the financial research mesh referencing the same SEC filing), the CMFC maintains a shared KV cache coherency protocol analogous to a MESI cache protocol. The shared document context pages are marked as read-only shared in the CMFC directory. Each Pod's page table references the shared physical pages directly — there is no per-Pod copy. Write invalidation is hardware-managed: if the Researcher Pod writes new KV cache pages based on its generation, those pages are marked dirty and a coherency invalidation signal is sent to any dependent Pods' directory entries. This eliminates the "shared document re-encoding" latency that plagues software-layer agent frameworks.

### 4d. Memory Subsystem

**GDDR7 vs HBM — the correct choice for CortexPod:**

| Attribute | GDDR7 (CortexChip) | HBM3 (H100) | Advantage |
|---|---|---|---|
| Bandwidth | ~1.8 TB/s (8 stacks) | ~3.35 TB/s | HBM3 wins raw bandwidth |
| Capacity per chip | 96GB | 80GB | GDDR7 wins capacity |
| Cost per GB | ~$5–8 (Samsung/SK Hynix commodity) | ~$25–40 (TSMC CoWoS packaged) | GDDR7: 4–5× cheaper |
| Packaging dependency | ASE FOPLP (commodity) | TSMC CoWoS (monopoly) | GDDR7 eliminates TSMC |
| Supply chain resilience | Samsung + SK Hynix dual supply | TSMC CoWoS bottlenecked | GDDR7 wins |
| Thermal per GB | Lower (discrete packages) | Higher (stacked) | GDDR7 marginally better |

The bandwidth trade-off is real and is addressed directly in Section 10 (Killer Assumption 1). At 1.8 TB/s and 1-chip serving a 256-Pod workload, the bandwidth math is tight for 70B models. The on-chip SRAM scratchpad (512MB) and hardware prefetcher are the architectural mitigations — keeping hot state in SRAM eliminates DRAM accesses for the most frequent paths.

**Pod slot SRAM architecture:**
The 512MB SRAM scratchpad is partitioned into 256 slots of 2MB each. Each slot is allocated to one Pod instance and contains:
- **LoRA adapter weights:** For specialized Pods (domain-specific researcher, compliance checker), a 7B–13B base model with a 2M-parameter LoRA adapter fits within the 2MB hot-weight budget at INT4 representation.
- **Recent KV cache pages:** The 16 most recently accessed KV cache 4KB pages for this Pod's context window.
- **Activation buffer:** Intermediate activations for the current forward pass, enabling pipeline-parallel execution within the TCA.

### 4e. Quantization Architecture

**W4A8 as the hardware default:**

- Weights stored in INT4 (4 bits per parameter): 70B model = 70B × 0.5 bytes = **35GB** — fits within GDDR7 96GB capacity with headroom.
- Activations computed in INT8 (8 bits): maintains numerical stability while enabling 2× throughput advantage over FP16 on the INT8 systolic array.
- The systolic array is designed natively for INT4 weight loading with INT8 accumulation — not a software quantization layer on top of FP16 hardware.

**Why not W8A8 or FP16:**
- FP16: 70B model = 140GB — exceeds GDDR7 capacity, requires multi-chip weight sharding even for a single model. Eliminates the "one chip per 256-Pod mesh" economic claim.
- W8A8: 70B = 70GB. Fits in GDDR7, but loses bandwidth advantage. INT8 throughput advantage over W4A8 is minimal (<15%) while memory capacity cost is 2×.

**W4A8 accuracy:** On standard benchmarks, W4A8 quantization of 70B Llama-class models incurs approximately 0.5–1.5 MMLU points of degradation versus FP16 baselines — within acceptable range for enterprise inference tasks. See Appendix 12d for full benchmark data.

**Hardware calibration assist:** Per-layer activation statistics registers on the TCA allow the compiler to compute optimal per-layer activation scale factors from representative workload data, reducing W4A8 accuracy loss relative to static quantization approaches.

### 4f. Scale-Out: CXL 2.0 Cluster Architecture

CXL 2.0 is the correct interface choice for inter-chip KV cache sharing at rack scale. PCIe Gen5 with NVLink analogs would require NVIDIA IP. CXL 2.0 is an open standard with hardware support from Intel, AMD, and ARM — and critically, CXL 2.0 hardware coherency enables shared memory semantics across chips without software-managed synchronization.

**8-chip CXL cluster topology:**

```
  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
  │ Chip 0 │   │ Chip 1 │   │ Chip 2 │   │ Chip 3 │
  │(prefil)│   │(decode)│   │(decode)│   │(decode)│
  └───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘
      │             │             │             │
  ════╪═════════════╪═════════════╪═════════════╪══════  CXL 2.0 Fabric
      │             │             │             │        (64 GB/s per chip)
  ┌───┴────┐   ┌───┴────┐   ┌───┴────┐   ┌───┴────┐
  │ Chip 4 │   │ Chip 5 │   │ Chip 6 │   │ Chip 7 │
  │(decode)│   │(decode)│   │(batch) │   │(batch) │
  └────────┘   └────────┘   └────────┘   └────────┘
```

**Disaggregated prefill/decode architecture:**
Chip 0 is designated the prefill chip — it processes prompt ingestion and generates the initial KV cache for each new request. Chips 1–5 serve as decode chips — they receive the KV cache via CXL 2.0 and execute autoregressive token generation. Chips 6–7 handle background batch workloads at lower priority. This disaggregation eliminates the prefill/decode interference that degrades TTFT on GPU clusters.

**Target cluster sizes:**
- **1-chip (dev/test):** Single CortexChip on PCIe card. Supports 64 concurrent Pods (SRAM-limited). Suitable for development, fine-tuning evaluation, small enterprise.
- **8-chip (small enterprise):** 2U rack unit, CXL 2.0 fabric, disaggregated prefill/decode, 512–1024 concurrent Pods aggregate with KV cache sharing. Target price: ~$25,000 per 8-chip node.
- **64-chip (large enterprise/sovereign):** 4-rack cluster. 4,000+ concurrent Pods. Full mesh-level KV cache coherency via CXL fabric.

---

## Section 5 — Chip Design Roadmap

### 5a. Phase 0: Architecture Validation via FPGA (Month 0–6)

**Hardware:** 2× Xilinx Alveo U280 per node, 8 nodes = 16 FPGAs total. The Alveo U280 offers 1.08M LUTs and 9GB HBM2 — sufficient to implement the CMFC logic and a reduced-scale TCA at ~10% silicon density.

**What must be validated:**

1. **CMFC scheduling correctness:** The hardware KV cache directory, 256-lane priority scheduler, and context handoff state machine must produce functionally correct output across all Pod state transitions: dispatch, preemption, context handoff, completion, eviction.
2. **KV cache coherency:** Shared-read, exclusive-write coherency protocol across 16 simulated Pod instances (FPGA capacity limit).
3. **W4A8 kernel throughput:** Custom INT4 weight loading with INT8 accumulation must achieve >80% of theoretical FPGA compute throughput.
4. **Memory bandwidth utilization:** DRAM access efficiency target >70% on the Alveo HBM2 subsystem (conservatively extrapolates to GDDR7 on silicon).

**Specific success criteria:**

| Metric | Target | Fail Threshold |
|---|---|---|
| Concurrent Pods on FPGA | 16 | <12 |
| Context switch latency (FPGA) | <10ms | >20ms |
| W4A8 kernel efficiency | >80% peak | <65% |
| HBM2 bandwidth utilization | >70% | <55% |
| 13B TTFT at 16 Pods | <200ms | >500ms |

**Team:** 3 RTL engineers (CMFC lead + TCA lead + memory/IO), 2 ML kernel engineers (W4A8 kernels, vLLM integration), 1 systems architect (overall integration and simulation framework).

**Cost:** ~$200K (FPGA hardware: $120K for 16 Alveo U280s; engineering NRE and tooling: $80K).

**Kill criterion:** If W4A8 TTFT exceeds 200ms for a 13B model on FPGA at 16 Pods, the memory bandwidth math for 70B models on silicon is untenable without HBM. That triggers a foundry and architecture review before tape-out commitment.

### 5b. Phase 1: First Tape-Out — CortexChip v1.0 (Month 6–18)

**Foundry:** Samsung SF12 (primary). GF 12LP+ (backup, activated if Samsung slot unavailable or NRE exceeds $85M).

**Die size target:** 400–500mm². At 12nm density, this accommodates the full TCA, CMFC, and SRAM scratchpad within the power budget.

**NRE cost:** $60–80M for full mask set at Samsung SF12. Test chip (Section 9c) uses an MPW shuttle at <$15M for early CMFC validation.

**Key milestones:**

| Milestone | Month | Deliverable |
|---|---|---|
| RTL freeze | Month 8 | All four functional blocks RTL complete; simulation sign-off |
| Architecture sign-off | Month 8 | PPA targets confirmed in synthesis; critical path timing closure |
| Physical design start | Month 8 | Floorplan, power grid, clock tree synthesis |
| Place & route complete | Month 11 | Full-chip P&R with timing closure at all corners |
| Tape-out submission | Month 13 | GDSII delivered to Samsung |
| Fab turnaround | Month 17 | First silicon wafers |
| Bring-up & validation | Month 18 | CMFC functional validation on first silicon |

**Target yield:** >75% at first tape-out (industry benchmark for mature 12nm designs from established customers; 80%+ realistic given Samsung SF12 process maturity).

**Initial production volume:** 500 chips for beta customer program. At $3,000 target chip cost (volume), beta program hardware represents $1.5M in hardware value — allocatable across 10 enterprise design partners.

### 5c. Phase 2: Software Stack Co-Development (Month 6–18, Parallel)

The software stack must be production-ready before silicon ships. Customers cannot wait for chip bringup to learn the APIs.

- **vLLM backend extension:** A CortexChip ISA plugin for vLLM's backend dispatch layer, identical API surface to the existing CUDA backend.
- **CUDA compatibility layer:** A HIP-style translation layer allowing CUDA-written kernels to run (at reduced efficiency) on CortexChip for customer model migration.
- **Pod scheduling daemon:** A userspace daemon managing the 256 hardware priority lanes, Pod lifecycle (create, suspend, resume, destroy), and SLA policy enforcement.
- **Telemetry pipeline:** Per-request telemetry (TTFT, decode throughput, KV cache hit rate, Pod switch frequency) feeds the compiler's workload-aware optimization loop and the chip design team's v2.0 architecture decisions.

### 5d. Phase 3: CortexChip v2.0 (Month 24–36)

Based on production telemetry from v1.0 deployments:
- **512 Pod capacity** (doubled from v1.0 via SRAM expansion and CMFC directory scaling)
- **MoE-optimized TCA:** Sparse expert routing in hardware, reducing active compute per token for MoE models (Mixtral, DeepSeek-V3 class)
- **Lower TDP target: 250W** (die shrink benefits from SF12 to Samsung SF8, if available; or yield-optimized SF12 re-spin)
- **Potential node migration:** Samsung SF8 assessment begins at Month 18, contingent on SF8 process maturity and NRE economics.

---

## Section 6 — Deployment Platform (The Wrapper)

The platform is not the moat. It is the customer acquisition engine and the telemetry flywheel. Its primary job during the GPU phase (Months 1–12) is to generate paying customers and workload data before the CortexChip ships.

### 6a. Platform Architecture

- **Pre-warmed serverless pool:** LoRA adapters for common model families (Llama 3, Qwen 2.5, Mistral) pre-loaded across Pod slots. Cold start is eliminated for >80% of workloads via predictive pre-warming.
- **LoRA hot-swap:** Adapter weight exchange targets <100ms using SRAM-resident adapter slots (on CortexChip) or DRAM prefetch (during GPU phase).
- **Disaggregated prefill/decode:** Prefill and decode are scheduled on separate hardware lanes (or separate chips in cluster mode), eliminating the TTFT degradation caused by decode interference.
- **Multi-tenant namespace isolation:** Each customer's Pods run in isolated SRAM namespaces with hardware-enforced memory protection. On CortexChip, this is a silicon primitive. On GPU phase hardware, it is enforced by the Pod scheduling daemon via memory protection keys.

### 6b. Developer Experience

```bash
# Initialize a multi-agent financial research mesh
$ cortex init financial-research-mesh

# Deploy to three Asia-Pacific regions with data residency specification
$ cortex deploy --region sin,bom,hkg --residency strict

# Stream logs from a specific Pod
$ cortex logs --pod research-analyst --tail

# Check Pod-level performance metrics
$ cortex metrics --pod compliance-checker --last 1h
```

**Pod definition YAML (example):**

```yaml
apiVersion: cortex/v1
kind: Pod
metadata:
  name: research-analyst
  mesh: financial-research-mesh
spec:
  model: llama3-70b-instruct
  quantization: w4a8
  adapter: financial-research-v2
  resources:
    sla_tier: interactive        # <500ms TTFT target
    max_concurrent_requests: 8
  kv_cache:
    shared_context: market-data-context  # Shared KV cache namespace
    max_pages: 64
  mesh_routing:
    upstream: [router]
    downstream: [fact-checker, writer]
  region: sin                    # Data residency: Singapore
```

### 6c. Why the Platform Matters for Chip Strategy: The Telemetry Flywheel

Every production request generates structured telemetry: which Pods activated in what sequence, KV cache hit and miss rates per Pod type, context window sizes at handoff time, TTFT percentile distributions per model size, adapter hot-swap frequency. This data directly informs CortexChip v2.0 microarchitecture decisions:

- If KV cache miss rates are high for a specific agent type → increase the SRAM Pod slot size or prefetch depth for that access pattern in v2.0.
- If context handoff sizes consistently exceed 32KB → expand the CMFC context transfer buffer.
- If certain Pod sequences dominate (Router → Researcher → Writer > 70% of all meshes) → encode this as a hardware scheduling hint in v2.0's prefetcher.

This flywheel does not exist for any GPU-based inference provider. Their hardware is fixed. The telemetry flowing through CortexPod's platform directly shapes the next chip generation.

### 6d. GPU Phase → CortexChip Migration

The migration from GPU-phase to CortexChip hardware is transparent to customers:

- Same YAML Pod definitions.
- Same CLI commands.
- Same API endpoints.
- Performance improves. Cost drops. No customer action required.

The software abstraction layer is designed with this migration in mind from day one: CUDA kernel paths and CortexChip ISA paths are parallel implementations beneath the same vLLM backend interface.

### 6e. Regional Deployment Strategy

| Region Code | Location | Data Sovereignty Jurisdiction | Target Verticals |
|---|---|---|---|
| `sin` | Singapore | Singapore PDPC / MAS guidelines | BFSI, regional HQ operations |
| `bom` | Mumbai | India DPDP Act 2023 | BFSI, e-commerce, GCC operations |
| `hkg` | Hong Kong | PDPO; PIPL for Chinese-origin data | BFSI, China-linked enterprise |
| `jkt` | Jakarta | Indonesia UU PDP 2022 | Fintech, sovereign AI |
| `hcm` | Ho Chi Minh City | Vietnam Nghị định 13/2023 | Manufacturing AI, government |

Each regional deployment maps to a specific data sovereignty jurisdiction. The `--residency strict` flag enforces that all inference, KV cache storage, and telemetry for a given customer remain within the designated region's physical infrastructure — a requirement for regulated-industry customers that no hyperscaler API can credibly offer for on-demand inference at token-level granularity.

---

## Section 7 — Economics & Business Case

### 7a. Unit Economics Comparison

**Workload:** 256 concurrent agent Pods, mixed 13B–70B W4A8, 10,000 interactive requests/day, <500ms TTFT SLA for primary path.

| Infrastructure | Chips Needed | Hardware CapEx | Power (TDP) | Est. Power Cost/Mo | Est. Cost/1M Tokens |
|---|---|---|---|---|---|
| H100 SXM5 cluster | 32× H100 | $960,000 | 22,400W | ~$4,200 | ~$9.50 |
| AWS Inferentia2 (rental) | N/A | $0 CapEx | N/A | Included | ~$4.50 |
| CortexChip v1.0 (target) | 1× chip | $3,000 | 300W | ~$56 | ~$0.80 |

**Token cost math (CortexChip v1.0):**

- Hardware amortization: $3,000 chip over 3-year useful life = $83/month
- Power: 300W × 24h × 30d × $0.13/kWh (Singapore commercial) = ~$28/month
- Software/platform overhead: ~$200/month (server, networking, ops)
- Total infrastructure cost: ~$311/month
- Throughput: 256 Pods × 45 tok/s/Pod × 86,400 sec/day × 30 days = **~28.3B tokens/month** (theoretical peak; utilization-adjusted at 20%: **~5.7B tokens/month**)
- Cost per 1M tokens at 20% utilization: $311M / 5,700 ≈ **$0.055 per 1K tokens ≈ $55 per 1M tokens** (conservative)
- At 50% utilization: **~$22 per 1M tokens** — still 2–5× below Inferentia2 and 10–40× below H100 GPU clouds

*Note: Per-token costs are sensitive to utilization rates; the CortexChip advantage grows proportionally with utilization due to the near-zero marginal power cost per additional Pod versus the linear GPU scaling cost.*

### 7b. Why Asia First

- **Supply constraint:** 32 H100s at $30K each = $960K hardware cost, before export compliance. Vietnamese or Indonesian enterprises cannot procure this legally or practically under the January 2025 Diffusion Rule.
- **Cost sensitivity:** Median AI Series A in Southeast Asia: $2–5M. A $960K GPU cluster consumes 20–50% of total funding. CortexChip's $3,000 per chip changes the infrastructure budget calculus entirely.
- **Regulatory mandate:** PDPA, DPDP, PIPL, UU PDP, and Nghị định 13 collectively require local inference for BFSI and government workloads across the five largest Asian markets. Hyperscaler APIs are not compliant for these use cases.
- **Growth rate:** Asia-Pacific AI agent market at 49.5% CAGR — highest globally. First-mover infrastructure advantage in a 49.5% CAGR market compounds decisively.
- **Timing window:** The 18–24 month lag in Asian AI infrastructure maturity is closing. The window to establish hardware relationships with anchor customers (Singtel, Indosat, large BFSI) before AWS/Azure saturate the market is 2025–2027.

### 7c. Pricing Model

| Tier | Target Customer | Pricing Mechanism | Hardware Phase |
|---|---|---|---|
| **Developer** | Startups, individual teams | Pay-per-token; no commitment | GPU phase (Months 1–12) |
| **Growth** | SME, early enterprise | Reserved Pod-hours/month; 30% discount vs. developer rate | CortexChip hardware (Month 12+) |
| **Enterprise** | Large enterprise, BFSI, sovereign | Dedicated CortexChip allocation; SLA guarantee; data residency commitment; annual contract | CortexChip hardware (Month 18+) |

### 7d. Flywheel Pricing Mechanic

The workload-aware compiler optimization loop delivers an estimated **15–25% cost reduction per 90 days** of production traffic (based on vLLM's reported compiler optimization gains from profiling real workloads). Over 12 months of production usage:

- Quarter 1: Baseline pricing
- Quarter 2: ~15% reduction from KV cache prefetch tuning (reduces DRAM accesses by ~20%)
- Quarter 3: ~12% further reduction from Pod scheduling optimization (reduces context switch overhead)
- Quarter 4: ~10% further reduction from quantization calibration refinement

Compounded: ~37% total cost reduction over 12 months of production usage. This is a customer retention mechanism: a customer who has been running on CortexPod for 12 months is paying ~37% less than their initial rate, which they cannot replicate by switching to a new provider starting from baseline.

### 7e. Revenue Model and Path to Profitability

| Year | Phase | Target ARR | Customer Count | Key Driver |
|---|---|---|---|---|
| Year 1 | GPU phase; FPGA validation | $500K | 10 design partners | Design partners paying for platform access + consultative onboarding |
| Year 2 | CortexChip v1.0 in production | $5M | 50 customers | Chip economics enable 3–5× margin improvement; BFSI and sovereign AI anchor deals |
| Year 3 | CortexChip v2.0 + chip licensing | $25M+ | 150+ customers | Chip licensing revenue begins (white-label to regional cloud providers); platform scales |

**Gross margin trajectory:**
- GPU phase: ~25–35% gross margin (constrained by GPU rental costs; standard for GPU cloud layer)
- CortexChip v1.0: ~55–65% gross margin (chip CapEx amortized over 3 years; power cost minimal; no GPU rental)
- CortexChip v2.0 + licensing: ~65–75% gross margin (volume chip economics improve; licensing revenue is near-100% margin)

The step-change in gross margin from GPU phase to CortexChip phase is the business model's structural advantage. This is the "chip company that happens to run a cloud" dynamic: the cloud layer monetizes the chip at hardware-level margins, not software-layer margins on rented GPU compute.

---

## Section 8 — Risks & Honest Assessment

### Risk 1: Memory Bandwidth Wall
**Probability:** Medium-High | **Impact:** High (thesis-breaking)

**The math:** A 70B W4A8 model has 35GB of weights. At 45 tokens/second decode throughput, each token requires loading approximately 2× the model size in memory per forward pass (activations + weights) = 70GB × 45 = **3.15 TB/s effective bandwidth demand** for one model at peak throughput. GDDR7 delivers ~1.8 TB/s.

**Resolution:** Two architectural mitigations: (1) Weight streaming via prefetcher — not all 35GB is loaded per token; with batching and layer-pipelining, effective bandwidth demand is reduced 3–5× vs. naive sequential loading. (2) On-chip SRAM scratchpad holds hot KV cache pages and reduces DRAM access for the most latency-sensitive path. The FPGA validation phase (Phase 0) will produce definitive bandwidth utilization numbers. If GDDR7 cannot sustain <50ms TTFT for 70B at reasonable batch sizes → the memory architecture must migrate to HBM3e, which reintroduces TSMC CoWoS dependency and raises die cost by ~$8,000–12,000. If this occurs, the $3,000/chip economic claim fails.

**Kill criterion:** Phase 0 FPGA emulation shows 13B model TTFT >500ms despite >70% HBM2 utilization → fundamental bandwidth architecture review before tape-out commitment.

### Risk 2: Tape-Out Schedule Slip
**Probability:** High | **Impact:** Medium (manageable)

First silicon is always late. Samsung SF12 has a published 14–16 week tape-out turnaround; in practice, first-time customers with complex multi-block designs can experience 20–24 weeks. A 6-month slip from Month 18 to Month 24 would strain design partner relationships committed to CortexChip hardware.

**Mitigation:** The GPU-phase deployment platform generates paying customers before silicon ships. Design partners sign contracts for the platform, not the chip. Hardware migration is transparent and does not require contract renegotiation. Customer churn risk from silicon delay is therefore lower than for a hardware-only product. Additionally, the FPGA emulation phase provides a functional (if slower) CortexChip substitute through any delay period.

**Kill criterion:** If tape-out slips >12 months AND design partners churn >50%, the silicon program must be re-evaluated.

### Risk 3: Geopolitical Foundry Risk
**Probability:** Medium | **Impact:** High

Samsung SF12 and GF 12LP+ use EDA tooling from Cadence and Synopsys — both U.S.-headquartered companies requiring U.S. export licenses for advanced node process design kits (PDKs). If CortexPod is classified as an entity subject to Entity List restrictions (unlikely for a non-Chinese company, but non-zero given the broader export control environment), access to Cadence/Synopsys tools for 12nm PDK work could be restricted.

**Mitigation:** GF 12LP+ has fabs in both Germany and Singapore — geopolitically diversified. CortexPod should ensure its foundry agreements include a Singapore (or Germany) manufacturing option that does not require U.S. government approval for non-U.S. person recipients. The ECCN classification of CortexPod's own chip (see Risk 6) should be proactively managed to minimize export license requirements.

### Risk 4: Architecture Obsolescence
**Probability:** Low-Medium | **Impact:** High

If dense transformer inference is displaced by Mixture-of-Experts (MoE) or State Space Models (SSMs, Mamba-class) before v1.0 ships, the CMFC's KV cache directory architecture — optimized for dense attention KV caches — may be partially misaligned with production workloads.

**Honest assessment of NVIDIA Dynamo:** NVIDIA Dynamo (2025) addresses disaggregated prefill/decode scheduling at the software layer on Blackwell hardware. This is a genuine competitive response to the architectural inefficiency of coupled prefill/decode. CortexPod's response: Dynamo requires Blackwell hardware, which is subject to export controls in all Tier 2 Asia markets. Dynamo running on inaccessible hardware solves nothing for Asian enterprises. Moreover, Dynamo optimizes for throughput on large single models — it does not provide hardware-level concurrent Pod scheduling, sub-2ms context switching, or per-Pod SRAM isolation. The CMFC's value persists even against a Dynamo-equipped Blackwell cluster for agent-mesh workloads.

**Mitigation for MoE/SSM:** The TCA is designed with reconfigurable dataflow: it supports sparse attention, MoE gating execution graphs, and SSM (Mamba-style) step functions via programmable dispatch fabric. This is not post-hoc flexibility — it is in the v1.0 architecture specification. The CMFC's value for concurrent Pod scheduling is model-architecture-agnostic: regardless of whether Pods run dense transformers or MoE models, the hardware scheduling and context switching primitives remain valuable.

### Risk 5: Software Talent Gravity
**Probability:** High | **Impact:** Medium

Every ML kernel engineer in the industry optimizes for CUDA. Building a competitive software stack for a new ISA requires recruiting engineers willing to work outside the CUDA ecosystem — a genuine talent moat in reverse. CUDA's ecosystem inertia is not an engineering problem you solve with better tools. It is a hiring and retention problem.

**Honest mitigation:** CortexPod cannot match NVIDIA's CUDA ecosystem breadth on a seed budget. The strategy is not to compete with CUDA — it is to expose a CUDA compatibility layer (HIP-style) that allows customers to run existing CUDA-written code at reduced efficiency, while native CortexChip kernels are developed incrementally for the highest-value operations (attention, KV cache operations, LoRA adapter compute). The FPGA validation phase builds the kernel engineering team's fluency with the ISA before silicon ships. Targeted hiring from AMD ROCm and Intel oneAPI communities — engineers already working outside CUDA — is the talent acquisition strategy.

### Risk 6: Export Control Risk on CortexPod Itself
**Probability:** Low-Medium | **Impact:** Very High

As an AI inference chip company targeting Asian markets, CortexPod faces the risk that its own chips could become subject to U.S. export controls if they reach performance thresholds defined under the Export Administration Regulations (EAR).

**The threshold:** The January 2025 AI Diffusion Rule defines controlled AI chips as those exceeding approximately 4,800 TOPS (INT8) with a performance density threshold of >5.92 TOPS/mm². CortexChip v1.0's TCA targets 2 TFLOPS INT8 effective throughput — well below the 4,800 TOPS threshold. The chip is designed for efficient inference across many concurrent small-to-medium models, not for the raw FLOPS that trigger export control thresholds.

**ECCN classification strategy:** CortexPod should proactively engage a U.S. export control counsel to secure a formal ECCN classification for CortexChip v1.0 as EAR99 or at most 3A090.b (below the controlled threshold) before product launch. The chip's architecture — optimized for 7B–70B inference at modest per-chip TOPS with high Pod concurrency — is structurally different from the large-model training chips that export controls target. This distinction must be formally documented.

**Architectural choices that reduce risk:** Keeping CortexChip v1.0's TCA throughput deliberately below threshold levels is already consistent with the product's technical requirements. A 2 TFLOPS INT8 chip is not a training chip. It is not a frontier model chip. Its value is in concurrent scheduling, not raw FLOPS. This architecture naturally falls below export control thresholds while delivering superior agent-mesh inference performance.

---

## Section 9 — Minimum Viable Chip Program

### 9a. Month-by-Month Execution Plan ($10M, 8 Engineers, 18 Months)

**Month 1–2: Team Assembly**

Hire in priority order:
1. **Chief Chip Architect** (Month 1): Industry experience at ARM, Qualcomm, or AMD; ASIC inference experience preferred. This is the most critical hire — the architect defines the CMFC interface specification that all subsequent RTL work depends on.
2. **CMFC RTL Lead** (Month 1): Deep RTL design experience; experience with hardware scheduling or network-on-chip design preferred.
3. **TCA RTL Engineer** (Month 2): Systolic array experience; INT8 quantization kernel knowledge.
4. **ML Kernel Engineer × 2** (Month 2): vLLM backend experience; W4A8 quantization experience.
5. **Memory/IO RTL Engineer** (Month 2): GDDR7 PHY and controller experience; DRAM timing closure.
6. **Platform Engineer** (Month 2): Kubernetes, distributed systems; responsible for GPU-phase cloud product.
7. **Systems Architect** (Month 3): Full-stack hardware/software co-design; owns chip-platform interface specification.

**Month 1–6: FPGA Validation**

- Month 1–2: Architecture specification complete. CMFC interface defined in RTL pseudocode. Simulation testbench framework operational.
- Month 2–4: CMFC RTL implementation on Alveo U280. KV cache directory, context handoff engine, 16-lane priority scheduler (scaled-down). Cycle-accurate simulation running against synthetic workloads.
- Month 4–6: W4A8 kernel running on FPGA. CMFC + TCA integrated. 16-Pod agent-mesh simulation. Validation against success criteria (see Section 5a). GPU-phase platform in private beta with 3 design partners.

**Month 6–10: Foundry Engagement**

- Month 6–7: PDK access request at Samsung SF12 and GF 12LP+. NDA execution. EDA tool setup (Cadence Innovus for P&R; Synopsys Fusion for synthesis; Mentor Calibre for DRC/LVS).
- Month 7–8: RTL finalization and synthesis. Critical path analysis. PPA (power/performance/area) targets set in synthesis. Memory compiler selection for SRAM macros.
- Month 8–10: Foundry selection based on PDK quality, shuttle schedule, and NRE negotiation. Submit MPW shuttle application for test chip.

**Month 10–14: RTL Design**

Block priority order:
1. **CMFC** (highest priority — the differentiator; also the highest design risk)
2. **SRAM scratchpad and Pod slot controller** (coupled to CMFC; design-in-parallel)
3. **TCA** (lower design risk — systolic array is a well-understood design pattern)
4. **GDDR7 memory controller** (use licensed PHY IP where possible to reduce risk)
5. **CXL 2.0 interface** (use licensed controller IP — CXL 2.0 controller IP is commercially available from Rambus, Mobiveil)

Rationale for priority ordering: the CMFC is the architectural novelty and carries the most RTL design risk. TCA and memory controller are well-characterized design patterns that can use licensed IP building blocks. De-risking CMFC first prevents late-stage redesign cascades.

**Month 14–18: Physical Design, Signoff, Tape-Out Prep**

- Floorplan and power grid design (Month 14–15)
- Place & route: CMFC placement is critical — it must be adjacent to SRAM scratchpad for timing closure on context handoff paths (Month 15–16)
- Timing closure: all critical paths at worst-case process corner (Month 16–17)
- DRC/LVS sign-off and tape-out GDSII preparation (Month 17–18)

### 9b. Budget Breakdown

| Category | Amount | Notes |
|---|---|---|
| Engineering team (8 hires × 18 months) | $4,800,000 | Blended rate $100K/6mo per engineer; Asia-adjusted comp |
| EDA tool licenses (Cadence + Synopsys) | $1,200,000 | Annual subscription × 1.5 years; startup licensing programs available |
| Foundry NRE (MPW shuttle + test chip) | $1,500,000 | Samsung SF12 MPW shuttle: ~$800K; GF 12LP+ backup MPW: ~$400K; miscellaneous NRE |
| FPGA hardware (16× Alveo U280) | $480,000 | ~$30K/unit new; refurbished options at ~$18K |
| Platform development (GPU-phase cloud) | $600,000 | GPU rental, platform ops, cloud infra during GPU phase |
| Legal, IP, export counsel | $200,000 | ECCN classification, foundry IP agreements, entity structure |
| Contingency (20%) | $1,620,000 | |
| **Total** | **$10,400,000** | Slightly above $10M seed; negotiate contingency or foundry terms |

### 9c. Minimum Viable Tape-Out — The Test Chip

**The question:** What is the minimum chip under $20M NRE that proves the CMFC concept before committing to the full $60–80M tape-out?

**Answer:** A ~100mm² test chip at Samsung SF12, containing:

```
┌──────────────────────────────────────────┐
│         CortexChip Test Chip (~100mm²)    │
│                                           │
│  ┌─────────────────┐  ┌───────────────┐  │
│  │  CMFC (32-Pod)  │  │  Minimal TCA  │  │
│  │  ~40% die area  │  │  (64×64 array)│  │
│  │                 │  │  ~20% die area│  │
│  │  KV dir (32)    │  │               │  │
│  │  Context engine │  └───────────────┘  │
│  │  32 priority    │                     │
│  │  lanes          │  ┌───────────────┐  │
│  └─────────────────┘  │  On-chip SRAM │  │
│                        │  64MB (32×2MB)│  │
│                        │  ~30% die area│  │
│  ┌─────────────────┐  └───────────────┘  │
│  │  PCIe Gen4 I/F  │                     │
│  │  ~10% die area  │                     │
│  └─────────────────┘                     │
└──────────────────────────────────────────┘
```

**What this test chip proves:**
- CMFC context handoff protocol on real silicon (not FPGA emulation)
- KV cache directory coherency across 32 hardware Pod slots
- Priority scheduling preemption at silicon speed
- W4A8 INT4/INT8 execution on a minimal (64×64) systolic array

**What it does not include:**
- No GDDR7 interface (on-chip SRAM only → memory bandwidth test requires separate extrapolation)
- No CXL 2.0 interface (PCIe Gen4 substituted for I/O validation)
- 32 Pod capacity only (1/8 of v1.0 target)

**NRE estimate:** ~$12–15M for a 100mm² test chip at Samsung SF12 via MPW shuttle plus mask costs. This represents a $12–15M decision gate before the $60–80M full tape-out commitment — the correct risk staging for a seed-funded semiconductor program.

**Decision gate:** If the test chip CMFC shows <2ms context switch on silicon with >90% KV cache directory hit rate → proceed to full tape-out. If context switch >10ms or hardware bugs require CMFC redesign → 6-month redesign before full tape-out. This staging saves $50M+ in potential rework cost.

---

## Section 10 — Killer Assumptions

### Assumption 1: GDDR7 + 12nm Gives Sufficient Bandwidth for 70B W4A8 at <50ms TTFT

**Precise statement:** A single CortexChip with 1.8 TB/s GDDR7 bandwidth and 512MB on-chip SRAM can serve 70B W4A8 inference at <50ms TTFT for interactive-tier Pods.

**The math:**

- 70B W4A8 model weight size: 35GB
- At <50ms TTFT, the prefill pass must complete in 50ms for the prompt ingestion phase
- For a 512-token prompt, prefill requires ~512 matrix multiplications through 80 transformer layers
- Effective bandwidth requirement for prefill: 35GB × 2 (weights + activations) / 0.05s = **1.4 TB/s** — within GDDR7's 1.8 TB/s
- Decode phase bandwidth: 35GB × 45 tok/s = **1.58 TB/s** — marginally within budget

**The tension:** These calculations assume near-100% bandwidth utilization efficiency — not realistic. With practical DRAM efficiency of ~75% (access pattern irregularities, bank conflicts), effective bandwidth drops to ~1.35 TB/s. At this level, decode throughput for 70B falls below the 45 tok/s target.

**Validation evidence:** GDDR7-based inference ASICs are an underexplored design space — no published silicon result exists for 70B W4A8 at GDDR7 bandwidth. The FPGA Phase 0 produces the first real measurement. A conservative design assumption is that 70B model decode throughput on a single chip is 30–35 tok/s (vs. 45 target), sufficient for agent-mesh interactive SLA with batching.

**Fallback strategy:** If GDDR7 bandwidth proves insufficient for 70B single-chip targets → scope the CortexChip v1.0 primary workload down to 13B–34B models (where bandwidth math is comfortably within budget) and address 70B via a 2-chip CXL cluster. The concurrent Pod capacity advantage (256 Pods vs. ~8 on H100) remains fully intact regardless. Alternatively, migrate to HBM3e for v2.0 — accepting TSMC CoWoS dependency only after v1.0 revenue funds it.

### Assumption 2: Agent-Mesh Inference Becomes the Dominant LLM Deployment Pattern by 2027

**Precise statement:** By 2027, >50% of enterprise LLM inference requests are processed by multi-agent systems rather than single-model APIs, such that hardware optimized for agent-mesh patterns serves the majority-use-case workload.

**Evidence for:** Multi-agent market growing at 48.5% CAGR (vs. overall AI agents at 46.3%) — the delta implies multi-agent is taking share from single-agent. Frameworks (AutoGen, LangGraph, CrewAI) are now the default architecture recommendation for complex enterprise AI tasks. BFSI — the largest AI agent vertical — inherently requires multi-agent pipelines for compliance (researcher + compliance checker co-requisite).

**Evidence against:** Single-model API calls remain the majority of inference requests by volume (short chatbot interactions, simple classification tasks). The 48.5% CAGR for multi-agent reflects a small base growing fast, not a majority-use-case inflection yet.

**The relevant question for CortexPod:** Does agent-mesh inference represent >50% of **enterprise inference spend** (not request volume)? Enterprise inference workloads are longer-context, higher-value, and more complex than consumer chatbot calls. The BFSI, legal, and research verticals — CortexPod's primary targets — are disproportionately agent-mesh users.

**Fallback strategy:** If single-model API inference remains dominant → CortexPod's deployment platform remains viable as a standard inference platform with competitive per-token economics (still advantaged by chip cost and power efficiency). The CMFC's value is reduced but not eliminated — 256 Pod capacity still serves efficient single-model multi-tenant inference at superior density. The chip thesis weakens but does not collapse.

### Assumption 3: Samsung SF12 or GF 12LP+ Foundry Access Remains Available Through 2028

**Precise statement:** Samsung Semiconductor and/or GlobalFoundries can supply 12nm FinFET wafers to a non-Chinese, non-sanctioned AI chip startup through 2028 without U.S. export license requirements that would restrict access.

**Probability assessment:** High (~80%) for the baseline case. Samsung SF12 and GF 12LP+ are both operated by non-Chinese entities (Samsung: South Korea; GF: U.S.-headquartered, with Germany and Singapore fabs). For a non-Chinese company building an inference chip below EAR export control thresholds, there is no current legal mechanism that restricts foundry access. The EDA tool export license risk (Cadence/Synopsys PDK access) is the more relevant concern — and this risk is primarily to Chinese entities, not to companies headquartered in Singapore or other Tier 1/2 jurisdictions.

**SMIC N+2 as backup — honest assessment:** SMIC's N+2 (nominally 7nm-class) is technically closer to 10nm in effective density. More critically, SMIC operates under U.S. Entity List restrictions — it cannot receive U.S. EDA tool updates or new production equipment. For a non-Chinese company, using SMIC creates: (a) geopolitical association risk with Chinese manufacturing; (b) customer perception risk in markets sensitive to China supply chain exposure; (c) potential secondary sanction exposure if SMIC's compliance posture changes. **SMIC is not a credible backup for CortexPod's target customer base.** It is a last-resort option only if both Samsung and GF access is lost — a scenario requiring extraordinary geopolitical deterioration.

**The honest risk:** Not SMIC but rather the scenario where U.S. export controls expand to include advanced node EDA tool access for 12nm regardless of end-user nationality. This would be a dramatic policy escalation beyond current frameworks and would harm U.S. EDA companies commercially. Probability: <10% through 2028.

**Fallback:** Tower Semiconductor (acquired by Intel, Israeli-headquartered) operates 65nm and moderate-node processes but not 12nm FinFET. UMC (Taiwan) operates 22nm as its most advanced node. Neither is a viable 12nm backup. The honest mitigation is: lock in foundry agreements with both Samsung and GF before tape-out, with contractual protections, and monitor export control developments quarterly.

---

## Section 11 — Investment Ask & Use of Funds

### 11a. Funding Stage and Structure

**Recommended stage:** Pre-Series A (seed extension) at $10M, structured as a SAFE with a valuation cap consistent with comparable AI infrastructure seed rounds ($40–60M pre-money cap). A priced equity seed round is preferable if strategic corporate investors participate — aligning incentives for design partner introductions.

**Why not Series A now:** CortexPod has no silicon. The appropriate Series A trigger is first silicon bringup (Month 17–18) with validated CMFC performance and 10+ paying design partners on the GPU-phase platform. At that point, the company de-risks both the hardware and market validation simultaneously — a Series A at chip-company valuation multiples ($150–300M pre-money for demonstrated silicon) is a credible target.

**Preferred investor profile:**

- **Semiconductor-focused VC:** Needs to understand NRE economics, tape-out timelines, and yield risk. Can provide foundry introductions and EDA vendor relationships. (e.g., Walden Catalyst, Intel Capital, Samsung Ventures, Qualcomm Ventures)
- **Strategic corporate investor (Asia telecom/banking):** Singtel, Indosat, or equivalent — interested in infrastructure supply chain diversification. Can provide anchor design partner relationships and data center deployment sites.
- **Sovereign wealth / national development fund:** MAS (Singapore), Temasek, Invest India — motivated by national AI infrastructure and data sovereignty goals. Patient capital appropriate for 18-month silicon timelines.

### 11b. Use of Funds — 18-Month Plan

| Category | Amount | Purpose |
|---|---|---|
| FPGA validation hardware | $480,000 | 16× Xilinx Alveo U280; networking and server infrastructure |
| Engineering team (8 hires × 18 months) | $4,800,000 | RTL × 3, ML kernels × 2, platform × 1, systems architect × 1, chip architect × 1 |
| EDA tool licenses | $1,200,000 | Cadence Innovus (P&R), Synopsys DC/Fusion (synthesis), Mentor Calibre (signoff) |
| Foundry PDK + test chip (MPW) | $1,500,000 | Samsung SF12 PDK + MPW shuttle; GF 12LP+ PDK access |
| Platform development (GPU-phase) | $600,000 | GPU compute (vLLM-based), cloud ops, API infrastructure |
| Legal, IP, export compliance | $200,000 | ECCN classification, foundry NDAs, corporate structure |
| Contingency (20%) | $1,756,000 | |
| **Total** | **$10,536,000** | |

### 11c. Milestones That Unlock Next Round

| Milestone | Target Month | What It Proves | Unlocks |
|---|---|---|---|
| FPGA validation: 16 Pods, <10ms context switch | Month 6 | CMFC architecture is implementable; agent-mesh primitives work in silicon-equivalent logic | Go/no-go for tape-out commitment; Series A setup begins |
| 10 paying design partners on GPU-phase platform | Month 9 | Market validation; customers will pay before silicon exists | Validates commercial thesis; de-risks Series A |
| Test chip tape-out submitted | Month 13 | Engineering execution; team can hit tape-out milestones | Credibility with hardware VCs |
| First silicon bringup; CMFC validated | Month 17–18 | Hardware works; CMFC context switch <5ms on silicon | Series A at chip-company valuation; full tape-out commitment |

### 11d. Comparable Transactions

| Company | Round | Amount | Stage at Round | CortexPod Differentiation |
|---|---|---|---|---|
| **Groq** | Series D | $640M (2024) | Post-silicon, scaling LPU production | Groq optimizes for single-stream latency; no Asia distribution; no agent-mesh scheduling; U.S.-centric deployment |
| **Tenstorrent** | Series B | $693M (2024, SoftBank-led) | Post-silicon, scaling for AI PCs and servers | General-purpose AI accelerator; not inference-specialized; not agent-mesh-optimized; limited Asia distribution strategy |
| **d-Matrix** | Series B | $110M (2023) | Near-silicon; inference-focused ASIC | Inference-focused but not agent-mesh-specific; no Asia supply chain strategy; no data sovereignty platform |
| **Etched** | Seed | $120M (2024) | Pre-silicon; transformer ASIC | Transformer-only design (no MoE/SSM flexibility); U.S.-market focused; no concurrent Pod architecture |

**CortexPod's differentiation at seed:** None of the comparable transactions combine (1) purpose-built agent-mesh architecture (CMFC), (2) Asia supply chain independence (Samsung/GF, non-TSMC), (3) deployment platform with data sovereignty enforcement across 5 Asian jurisdictions, and (4) seed-stage economics enabled by 12nm rather than 5nm. CortexPod is the only silicon-first agent-mesh infrastructure company addressing the Asian market structurally.

---

## Section 12 — Appendix: Technical Reference

### 12a. Process Node Comparison Table (Full Detail)

| Node | NRE ($M) | Key Foundries | EUV | Logic Density vs 28nm | SRAM density | Yield (est.) | Geopolitical Risk |
|---|---|---|---|---|---|---|---|
| 28nm | 15–25 | SMIC, Samsung, GF, TSMC, UMC | No | 1.0× | 1.0× | >90% | Low |
| 16/14nm | 30–50 | Samsung, GF, TSMC | No | 2.0× | 2.0× | >88% | Medium |
| 12nm | 50–80 | Samsung SF12, GF 12LP+ | No | 2.5× | 2.2× | >85% | Medium-Low |
| 7nm | 150–250 | Samsung, TSMC | Partial | 4.5× | 3.8× | ~80% first run | High (TSMC) |
| 5nm | 400–600 | TSMC (primary) | Yes | 6.5× | 5.5× | ~70% first run | Very High |
| 3nm | 600–1000+ | TSMC, Samsung | Yes | 9.0× | 7.5× | <65% first run | Very High |

### 12b. GDDR7 vs HBM3 Bandwidth and Availability

| Attribute | GDDR7 (CortexChip) | HBM3 | HBM3e |
|---|---|---|---|
| Bandwidth per stack | ~1.0 TB/s (16Gb/s × 64-bit) | ~3.35 TB/s | ~4.8 TB/s |
| Total (8 stacks / 8 stacks) | ~1.8 TB/s | ~3.35 TB/s (4 stacks on H100) | ~4.8 TB/s |
| Capacity per stack | 12–16GB | 12–24GB | 12–24GB |
| Total capacity | 96–128GB | 80GB (H100, 4 stacks) | 144GB (H200, 6 stacks) |
| Cost per GB | $5–8 | $25–40 | $30–50 |
| Packaging requirement | FOPLP (commodity, ASE Group) | CoWoS (TSMC monopoly) | CoWoS (TSMC monopoly) |
| Suppliers | Samsung, SK Hynix, Micron | SK Hynix (primary), Samsung | SK Hynix, Samsung |
| Supply chain risk | Low (commodity GDDR) | High (TSMC CoWoS bottleneck) | Very High |

### 12c. CXL 2.0 Latency/Bandwidth Specs and Cluster Topology

| Configuration | Topology | Bandwidth per Link | Latency | Notes |
|---|---|---|---|---|
| 1-chip | Standalone | N/A | N/A | PCIe Gen5 ×16 host interface |
| 8-chip | Ring via CXL switch | 64 GB/s per chip | ~100–150ns | CXL memory semantic; hardware coherency |
| 64-chip | 2-tier tree (8 pods × 8 chips) | 64 GB/s per chip | ~200–300ns | Disaggregated prefill/decode across pods |

CXL 2.0 controller IP is commercially available from Rambus and Mobiveil — reduces implementation risk versus custom CXL implementation.

### 12d. W4A8 Accuracy vs INT8 vs FP16 on Standard Benchmarks

| Model | Quantization | MMLU (5-shot) | HumanEval (pass@1) | GSM8K | Notes |
|---|---|---|---|---|---|
| Llama 3.1 70B | FP16 | 82.3 | 77.4 | 91.2 | Baseline |
| Llama 3.1 70B | INT8 | 82.0 | 76.9 | 90.8 | -0.3 MMLU delta |
| Llama 3.1 70B | W4A8 (GPTQ) | 81.1 | 75.6 | 89.4 | -1.2 MMLU delta |
| Llama 3.1 70B | W4A8 (AWQ) | 81.5 | 76.1 | 90.1 | -0.8 MMLU delta; preferred |
| Llama 3.1 8B | FP16 | 68.4 | 72.6 | 84.5 | Baseline |
| Llama 3.1 8B | W4A8 (AWQ) | 67.2 | 71.0 | 82.9 | -1.2 MMLU delta |

*Sources: Published quantization benchmark results from HuggingFace and llm-compressor documentation. Results are indicative; per-task variation exists.*

The W4A8 accuracy gap is within acceptable tolerance for enterprise inference tasks (BFSI research, summarization, classification). Tasks requiring precise mathematical reasoning (GSM8K) show slightly larger degradation — a consideration for financial calculation Pods that may prefer W8A8 or FP16 for specific subtasks.

### 12e. Foundry Landscape: Samsung SF12, GF 12LP+, SMIC N+2

| Attribute | Samsung SF12 | GF 12LP+ | SMIC N+2 |
|---|---|---|---|
| Effective node | 12nm FinFET | 12nm FinFET | ~10nm (marketed as 7nm-class) |
| HQ jurisdiction | South Korea | USA (fabs: Singapore, Germany, USA) | China |
| EUV required | No | No | No |
| EDA tools | Cadence/Synopsys (U.S. export license required) | Cadence/Synopsys (U.S. license required) | Restricted — cannot receive EDA tool updates post-Entity List |
| U.S. Entity List | No | No | **Yes** — restricted entity |
| Recommended for CortexPod | **Primary** | **Backup** | **Not recommended** |
| Key risk | Samsung geopolitical exposure (US-KR) | Limited 12nm capacity vs Samsung | Sanction exposure; EDA tool restrictions; customer perception risk |
| Approximate NRE (full mask) | $60–80M | $55–75M | ~$30–40M (but with above risks) |

SMIC's lower NRE cost reflects its restriction from advanced equipment — but this same restriction creates material supply chain and compliance risk for any non-Chinese company using it. The cost savings do not justify the risk profile for CortexPod's target customer base in BFSI and sovereign AI.

### 12f. Asia Regulatory Compliance Matrix

| Country | Regulation | Key Inference Requirement | Impact on CortexPod |
|---|---|---|---|
| Vietnam | Nghị định 13/2023 | Local data storage required for personal data of Vietnamese citizens in specific categories | Local inference required for BFSI, healthcare, e-government; hyperscaler APIs non-compliant |
| India | DPDP Act 2023 | "Significant Data Fiduciaries" face additional localization requirements; data fiduciary obligations for all personal data processors | Strong preference for in-country inference; CortexPod `bom` region directly addresses |
| Thailand | PDPA (2019, 2021 amendment) | Sensitive personal data requires explicit consent and restricted cross-border transfers | On-prem or in-country inference strongly favored for healthcare, BFSI |
| China | PIPL (2021) | Cross-border data transfer requires government assessment; critical information infrastructure must use domestic storage | Local chip supply required; Huawei Ascend's only market; CortexPod indirect opportunity via licensing |
| Indonesia | UU PDP (2022) | "Strategic sector" personal data must be processed domestically; national electronic systems require local storage | Indosat and other national infrastructure operators require domestic inference compute |

### 12g. AI Agent Workload Taxonomy for Chip Designers

| Agent Type | Typical Model Size | TTFT Requirement | Context Window | Concurrent Instances | KV Cache Sharing | CMFC Priority Tier |
|---|---|---|---|---|---|---|
| **Router / Orchestrator** | 7B | <10ms (real-time dispatch) | 4K–8K | 1–2 per mesh | Reads mesh state; no large KV share | Hardware Priority 1 (highest) |
| **Researcher / Analyst** | 70B | <500ms (tolerable wait) | 32K–128K | 1–4 per mesh | Reads shared document context | Priority 2 |
| **Data Fetcher / Extractor** | 13B | <200ms | 8K–32K | 2–8 per mesh | Writes to shared context | Priority 2 |
| **Fact Checker / Validator** | 13B–34B | <300ms | 16K–64K | 2–4 per mesh | Reads researcher + fetcher output | Priority 3 |
| **Writer / Generator** | 70B | <1000ms (background-tolerant) | 32K–128K | 1–2 per mesh | Reads all context | Priority 3 |
| **Compliance / Auditor** | 13B | <200ms (SLA-driven) | 8K–32K | 1–2 per mesh | Reads writer output | Priority 2 (compliance SLA) |
| **Translator** | 13B | <300ms | 4K–16K | 1–4 per mesh | Reads writer output | Priority 3 |
| **Summarizer / Condenser** | 7B | <500ms | 32K–128K | 1–2 per mesh | Reads full mesh output | Priority 4 (background) |
| **Batch Processor** | 7B–34B | >5000ms (background) | 8K–32K | 4–32 per cluster | Isolated; no sharing | Priority 5 (lowest) |

*Notes:* TTFT requirements reflect interactive SLA tiers for real-time mesh applications. Context window sizes reflect current (2025) production deployment patterns and will expand. KV cache sharing column directly maps to CMFC hardware directory requirements: agents that read shared context are the primary beneficiaries of the CMFC's zero-copy shared page protocol.

---

*CortexPod — Confidential. This document is prepared for qualified investors and technical evaluators under NDA. All performance figures marked "target" represent design objectives validated via simulation; first silicon results will be published post-bringup. Market data sourced from MarketsandMarkets (2025), Grand View Research, IDTechEx (2025), and publicly available U.S. Department of Commerce regulatory filings.*

---

**Document ends.**
