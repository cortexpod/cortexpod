**CortexPod — Asia Market Brief | March 2026**

_CortexPod is the only inference ASIC built from silicon up for the AI sovereignty requirements, supply chain constraints, and agent-mesh workload economics of APAC enterprise deployment in 2026._

---

## The APAC Inference Opportunity

The inference flip arrived in Asia first. Vietnam, India, and Singapore are not trailing markets for AI infrastructure — they are leading deployment environments for the agent-mesh workload class that CortexPod is built for. Financial services automation, healthcare document processing, regulatory compliance, and enterprise software localization are live production workloads in all three markets today, running on rented H100 hours from AWS, GCP, and Azure at economics that do not scale.

The common thread across all three markets in 2026 is not just AI adoption — it is **AI sovereignty anxiety**. 50% of APAC enterprise executives report strategic concern over compute dependence on infrastructure controlled by foreign hyperscalers and TSMC-dependent supply chains. National AI strategies in Vietnam, India, and Singapore are explicitly pushing enterprises toward sovereign, on-premise, or regionally controlled inference infrastructure. CortexPod's TSMC-free, on-premise deployment model is not a feature — it is a regulatory alignment.

---

## Vietnam

**Market Context**

Vietnam's National AI Strategy (Decision 127/QĐ-TTg, updated 2024) targets AI as a core pillar of the 2030 digital economy vision. The government has identified financial services, healthcare, and smart manufacturing as priority AI deployment sectors. Vietnam's top-tier banks — Vietcombank, Techcombank, VPBank, MB Bank — are actively deploying AI document processing pipelines for loan origination, KYC automation, and regulatory reporting. These are exactly the multi-agent document workflows CortexPod is built for.

**The H100 Economics Problem**

Vietnamese enterprises accessing H100 compute today do so primarily through AWS (ap-southeast-1, Singapore region) or GCP (asia-southeast1). Indicative 2026 pricing for H100 instances:

| Provider | Instance      | H100 Count | On-Demand Price | Reserved (1yr) |
| -------- | ------------- | ---------- | --------------- | -------------- |
| AWS      | p5.48xlarge   | 8× H100    | ~$98/hr         | ~$65/hr        |
| GCP      | a3-highgpu-8g | 8× H100    | ~$95/hr         | ~$62/hr        |

For a Vietnamese bank running a 32-agent loan document pipeline processing 5,000 applications per day (average 45 minutes of agent-mesh compute per batch):

```
Daily H100 cost: 8× H100 node × $98/hr × 0.75hr effective use × 5,000/batch_size
Assuming batch_size = 50: 100 batches/day × $98 × 0.75hr = ~$7,350/day
Annual cost: ~$2.68M/year — at hyperscaler on-demand rates
```

A single CortexPod on-premise deployment (target price: $180,000–$220,000 per unit, 256 concurrent agent contexts, 300W TDP) amortizes over 3 years at approximately **$67,000–$73,000/year** in capex equivalent — plus power and operations. For the same loan document workload, CortexPod's 256-context hardware handles the 32-agent pipeline natively on a single chip, eliminating the multi-node H100 cluster requirement entirely.

**Payback period: under 4 months versus hyperscaler on-demand.**

**Sovereignty Angle**

Vietnam's State Bank (SBV) data localization requirements mandate that financial transaction data and customer records processed by AI systems must remain within Vietnamese jurisdiction or approved regional zones. AWS Singapore (ap-southeast-1) qualifies under current SBV guidance — but this guidance is under active review as of Q1 2026, with draft regulations circulating that would require on-premise or Vietnam-domiciled infrastructure for Tier 1 financial AI workloads. CortexPod's on-premise deployment model is structurally compliant with the most restrictive interpretation of pending SBV data localization rules.

---

## India

**Market Context**

India's INDIAai Mission (₹10,372 crore, ~$1.25B, approved 2024) is the most aggressive national AI infrastructure commitment in Southeast Asia. The mission includes dedicated compute infrastructure (10,000+ GPU equivalents procured for sovereign AI use), AI application development across healthcare and agriculture, and explicit preference for non-US-controlled compute for sovereign AI workloads. India's financial sector — HDFC Bank, ICICI Bank, SBI, Axis Bank — is deploying agent-mesh AI at scale for credit risk, fraud detection, and regulatory reporting under RBI's AI governance framework.

**The Infrastructure Gap**

India's domestic GPU capacity is critically undersupplied relative to AI demand. The INDIAai compute procurement has faced delays; private enterprises default to AWS (ap-south-1, Mumbai) or Azure (Central India) for H100 access. Indicative costs in the India market:

| Workload                              | AWS ap-south-1 H100 Cost | CortexPod On-Premise Equivalent     |
| ------------------------------------- | ------------------------ | ----------------------------------- |
| 32-agent credit risk pipeline (daily) | ~$6,200–$8,400/day       | ~$185/day (amortized capex + power) |
| 64-agent fraud detection (real-time)  | ~$14,000–$18,000/day     | ~$370/day (2 CortexPod units)       |
| 128-agent regulatory reporting batch  | ~$28,000–$36,000/day     | ~$740/day (4 CortexPod units)       |

_Cost estimates based on H100 on-demand pricing, 16-hour active compute windows, realistic agent-mesh parallelism requirements. CortexPod estimates based on $200,000 unit price, 3-year amortization, $0.08/kWh India industrial power, 300W TDP._

**The 10x cost reduction claim holds in the India market** — and at India's industrial power rates ($0.07–$0.09/kWh versus $0.12–$0.15/kWh in Singapore), CortexPod's 300W TDP versus H100's 700W delivers additional operational savings that compound at scale.

**Sovereignty Angle**

RBI's 2025 AI governance circular requires Tier 1 financial institutions to maintain audit trails and model inference logs within Indian jurisdiction. More significantly, India's draft Digital India Act (circulated Q4 2025) includes provisions for "critical AI infrastructure" classification — under which financial and healthcare AI systems processing data on Indian citizens may be required to run on India-domiciled compute. CortexPod's on-premise deployment is structurally compliant. A hyperscaler running inference on Indian financial data in a US-owned data center is not, under the most aggressive interpretation of pending legislation.

India also represents CortexPod's strongest engineering talent pipeline. Bangalore, Hyderabad, and Pune have deep VLSI and ML systems engineering communities — directly relevant to CortexPod's chip design, FPGA validation, and inference software stack development.

---

## Singapore

**Market Context**

Singapore's National AI Strategy 2.0 (NAIS 2.0, launched 2023, expanded 2025) positions Singapore as the AI governance and infrastructure hub for Southeast Asia. The Monetary Authority of Singapore (MAS) has been among the most sophisticated financial regulators globally in AI governance — its FEAT (Fairness, Ethics, Accountability, Transparency) principles and AI risk management guidelines are the de facto standard for financial AI in ASEAN. Singapore's enterprise AI market is the most mature in the region: DBS Bank, OCBC, UOB, and Singtel are all running production agent-mesh workloads today.

**The Singapore Positioning**

Singapore is not primarily a cost play for CortexPod — it is a **reference customer and regional hub play**. A production CortexPod deployment at a Singapore Tier 1 bank provides:

- MAS-audited inference infrastructure with full on-premise data residency
- Reference architecture for ASEAN financial AI sovereignty compliance
- Proof point for Vietnam and India enterprise sales ("DBS runs on CortexPod")

Singapore enterprises pay a premium for infrastructure that is MAS-compliant, auditable, and sovereign. The TSMC supply chain independence argument resonates differently here than in Vietnam or India — not as a cost argument but as a **geopolitical risk management argument**. Singapore's government and enterprise leadership are acutely aware of TSMC concentration risk in the Taiwan Strait context. An inference ASIC with zero TSMC dependency is a genuinely differentiated procurement option for Singapore's risk-conscious financial institutions.

**Indicative Singapore Enterprise Economics**

| Scenario                                              | H100 Cloud (AWS ap-southeast-1) | CortexPod On-Premise                |
| ----------------------------------------------------- | ------------------------------- | ----------------------------------- |
| DBS-scale agent pipeline (est. 500 concurrent agents) | ~$3.2M–$4.1M/year               | ~$780,000/year (4 units, amortized) |
| MAS regulatory reporting automation                   | ~$890,000/year                  | ~$195,000/year (1 unit)             |
| OCBC-scale fraud detection (real-time, 64 agents)     | ~$2.1M–$2.8M/year               | ~$390,000/year (2 units)            |

_Estimates are illustrative based on publicly available H100 cloud pricing and CortexPod target unit economics. Actual deployment costs vary by workload profile and contract structure._

Singapore is also the natural location for CortexPod's APAC regional headquarters, partnership with the AI Singapore (AISG) programme, and engagement with MAS's regulatory sandbox for AI infrastructure innovation.

---

## Cross-Market Summary

| Dimension                       | Vietnam                           | India                                | Singapore                           |
| ------------------------------- | --------------------------------- | ------------------------------------ | ----------------------------------- |
| Primary buyer                   | Tier 1 banks, healthcare networks | Tier 1 banks, fintech, INDIAai       | DBS, OCBC, UOB, enterprise software |
| Key sovereignty driver          | SBV data localization (pending)   | RBI AI governance, Digital India Act | MAS FEAT, geopolitical risk mgmt    |
| Cost argument strength          | ★★★★★                             | ★★★★★                                | ★★★☆☆                               |
| Sovereignty argument strength   | ★★★★☆                             | ★★★★☆                                | ★★★★★                               |
| Reference customer value        | ★★★☆☆                             | ★★★★☆                                | ★★★★★                               |
| Engineering talent availability | ★★★☆☆                             | ★★★★★                                | ★★★★☆                               |
| Market entry complexity         | Medium                            | Medium-High                          | Low                                 |
| Recommended entry sequence      | 3rd                               | 2nd                                  | **1st**                             |

**Recommended go-to-market sequence: Singapore → India → Vietnam.**

Singapore provides the reference customer and MAS-compliant architecture template. India provides the volume opportunity and engineering depth. Vietnam is the high-growth frontier market where cost economics are most compelling and regulatory tailwinds are strongest — but where enterprise procurement cycles are longer and MLOps capability is still maturing.

---

_CortexPod — Engineering for the agent-mesh era._
_CMFC specifications reflect FPGA validation phase. Production silicon performance subject to tape-out validation._
_Market pricing estimates as of March 2026. Actual costs vary by contract and workload profile._
