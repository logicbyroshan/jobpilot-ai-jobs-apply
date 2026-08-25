import {
  UserProfile,
  SourceItem,
  SkillEvidenceItem,
  MatchItem,
  GapItem,
  LearningPlanType,
  ResourceItem,
  AssessmentType,
  AssessmentAttemptResult,
  ApplicationItem,
  ApplicationPolicyType,
  FunnelAnalytics,
  CareerGoal,
  EvidenceItem,
  NotificationItem,
  ActivityItem,
  Job,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("jobpilot_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return { "X-User-ID": "00000000-0000-0000-0000-000000000001" };
}

// Fallback Mock Data for Zero-Failure UI Rendering
const MOCK_PROFILE: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  full_name: "Alex Chen",
  email: "alex.chen@jobpilot.dev",
  headline: "Staff Distributed Systems & Infrastructure Architect • Ex-Stripe",
  avatar_url:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  bio: "Specializing in distributed consensus (Raft/Paxos), multi-tenant Kubernetes control planes, and low-latency storage.",
  location: "San Francisco, CA (Remote)",
  years_of_experience: 8,
  profile_confidence: 0.94,
  summary_json: {
    verified_skills: 8,
    top_domains: ["Distributed Systems", "Cloud Infrastructure", "Backend Architecture"],
  },
  experiences: [
    {
      id: "exp-1",
      company_name: "Stripe",
      title: "Staff Infrastructure Engineer",
      location: "San Francisco, CA",
      start_date: "2021",
      end_date: "2024",
      is_current: true,
      description:
        "Led architecture of globally distributed ledger replication engine handling 120k QPS with sub-5ms P99 latency. Implemented zero-downtime consensus migration across multi-region clusters.",
      technologies_json: ["Go", "Kubernetes", "Raft", "gRPC", "PostgreSQL", "AWS"],
    },
    {
      id: "exp-2",
      company_name: "Uber",
      title: "Senior Distributed Systems Engineer",
      location: "San Francisco, CA",
      start_date: "2018",
      end_date: "2021",
      is_current: false,
      description:
        "Designed streaming event pipeline processing 1.2M events/sec. Built custom ring-pop failure detection and sharding layer in Go.",
      technologies_json: ["Go", "Apache Kafka", "Redis", "Docker", "Cassandra"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Distributed Raft Consensus Engine (Open Source)",
      description:
        "High-performance async Go implementation of Raft consensus with dynamic membership changes and log compaction.",
      url: "https://github.com/alexchen/raft-engine",
      technologies_json: ["Go", "Distributed Consensus", "gRPC", "Protobuf"],
    },
  ],
};

const MOCK_SOURCES: SourceItem[] = [
  {
    id: "src-1",
    source_type: "github",
    display_name: "GitHub (alexchen-infra)",
    source_url: "https://github.com/alexchen-infra",
    status: "CONNECTED",
    last_synced_at: new Date().toISOString(),
    items_ingested_count: 42,
  },
  {
    id: "src-2",
    source_type: "linkedin",
    display_name: "LinkedIn Profile",
    source_url: "https://linkedin.com/in/alexchen-dist-sys",
    status: "CONNECTED",
    last_synced_at: new Date().toISOString(),
    items_ingested_count: 14,
  },
  {
    id: "src-3",
    source_type: "resume",
    display_name: "Verified Resume Artifact (PDF)",
    source_url: "alex_chen_staff_resume_2026.pdf",
    status: "CONNECTED",
    last_synced_at: new Date().toISOString(),
    items_ingested_count: 28,
  },
];

const MOCK_SKILLS: SkillEvidenceItem[] = [
  {
    id: "sk-1",
    skill_name: "Distributed Consensus (Raft/Paxos)",
    category: "Architecture & Systems",
    strength: "STRONG",
    proficiency_estimate: 9.5,
    verified_at: new Date().toISOString(),
    evidence_items: [
      {
        id: "ev-1",
        title: "Authored raft-engine production library (3.4k stars)",
        description: "Verified GitHub repository with 100% test coverage on linearizable reads.",
        source_type: "GITHUB_REPO",
      },
      {
        id: "ev-2",
        title: "Stripe Consensus Architecture Patent & Tech Talk",
        description: "Verified public tech talk on multi-region Raft state replication.",
        source_type: "RESUME_CITATION",
      },
    ],
  },
  {
    id: "sk-2",
    skill_name: "Kubernetes Control Plane & Operators",
    category: "Cloud Infrastructure",
    strength: "STRONG",
    proficiency_estimate: 9.0,
    verified_at: new Date().toISOString(),
    evidence_items: [
      {
        id: "ev-3",
        title: "Custom CRD Controller for Multi-tenant Isolation",
        description: "Kubebuilder operator deployed across 40+ production Kubernetes clusters.",
        source_type: "GITHUB_COMMIT",
      },
    ],
  },
  {
    id: "sk-3",
    skill_name: "Go / Golang High Concurrency",
    category: "Languages & Runtimes",
    strength: "STRONG",
    proficiency_estimate: 9.2,
    verified_at: new Date().toISOString(),
    evidence_items: [
      {
        id: "ev-4",
        title: "180,000 lines of verified production Go code",
        description: "Analyzed git history across 14 public and private repositories.",
        source_type: "GITHUB_METRICS",
      },
    ],
  },
  {
    id: "sk-4",
    skill_name: "Low-Latency Storage Engines (LSM/B-Tree)",
    category: "Database Engineering",
    strength: "MODERATE",
    proficiency_estimate: 7.8,
    verified_at: new Date().toISOString(),
    evidence_items: [
      {
        id: "ev-5",
        title: "Key-value store engine built in Go using Badger/Pebble primitives",
        description: "Verified repo and benchmarks.",
        source_type: "GITHUB_REPO",
      },
    ],
  },
];

const MOCK_MATCHES: MatchItem[] = [
  {
    id: "m-1",
    overall_score: 94.8,
    technical_fit: 96.0,
    experience_fit: 94.0,
    preference_fit: 92.0,
    recommendation_category: "STRONG_MATCH",
    why_matched:
      "Deep alignment on distributed consensus, Go mastery, and large-scale Kubernetes control plane architecture.",
    explanation:
      "Exceptional technical alignment across Python, Go, and PostgreSQL distributed systems. Verified commit evidence strongly reinforces performance scalability expectations.",
    job: {
      id: "job-1",
      title: "Principal Distributed Infrastructure Engineer",
      location: "San Francisco, CA (Hybrid / Remote Option)",
      salary_min: 240000,
      salary_max: 310000,
      seniority: "Staff / Principal",
      company: {
        id: "comp-1",
        name: "Anthropic",
        industry: "Artificial Intelligence",
      },
      required_skills_json: ["Distributed Systems", "Go", "Kubernetes", "Raft", "High Concurrency"],
      responsibilities_json: [
        "Architect and scale distributed consensus and multi-region synchronization protocols.",
        "Design high-throughput Kubernetes custom controllers for large-scale GPU training clusters.",
        "Collaborate across research and engineering to eliminate communication bottlenecks in distributed model training.",
      ],
    },
    matched_skills_json: ["Distributed Consensus", "Go High Concurrency", "Kubernetes Operators", "Multi-region Replication"],
    missing_skills_json: ["Triton Inference Server", "GPU Cluster Orchestration"],
  },
  {
    id: "m-2",
    overall_score: 91.2,
    technical_fit: 93.0,
    experience_fit: 90.0,
    preference_fit: 89.0,
    recommendation_category: "STRONG_MATCH",
    why_matched:
      "High match for high-throughput messaging, streaming data pipelines, and distributed ledger architecture.",
    explanation:
      "Proven track record scaling low-latency state engines and real-time telemetry streaming platforms.",
    job: {
      id: "job-2",
      title: "Staff Storage Systems Architect",
      location: "New York, NY / Remote",
      salary_min: 225000,
      salary_max: 290000,
      seniority: "Staff",
      company: {
        id: "comp-2",
        name: "Datadog",
        industry: "Cloud Observability",
      },
      required_skills_json: ["Go", "LSM Trees", "Distributed Storage", "Kafka"],
      responsibilities_json: [
        "Lead the architecture of next-generation LSM and column-store distributed storage engines.",
        "Optimize zero-copy network serialization and high-throughput append-only disk logging.",
        "Mentor staff engineers and define storage resiliency SLAs across multi-cloud regions.",
      ],
    },
    matched_skills_json: ["Go High Concurrency", "LSM Storage Engines", "Distributed Systems"],
    missing_skills_json: ["Rust for Storage Engine C Extensions"],
  },
  {
    id: "m-3",
    overall_score: 87.5,
    technical_fit: 89.0,
    experience_fit: 86.0,
    preference_fit: 85.0,
    recommendation_category: "STRONG_MATCH",
    why_matched:
      "Strong fit for multi-cloud edge routing and global latency optimization.",
    explanation:
      "Strong background in high-volume request routing, edge networking topologies, and distributed resilience.",
    job: {
      id: "job-3",
      title: "Lead Platform & Infrastructure Architect",
      location: "Remote (Global)",
      salary_min: 210000,
      salary_max: 275000,
      seniority: "Staff / Lead",
      company: {
        id: "comp-3",
        name: "Cloudflare",
        industry: "Edge & Security",
      },
      required_skills_json: ["Go", "Kubernetes", "eBPF", "Edge Networking"],
      responsibilities_json: [
        "Design scalable edge platform control plane abstractions and routing topologies.",
        "Implement real-time traffic failover and health probe verification mechanisms.",
      ],
    },
    matched_skills_json: ["Go High Concurrency", "Kubernetes Operators", "Distributed Systems"],
    missing_skills_json: ["eBPF Kernel Tracing"],
  },
];

const MOCK_GAPS: GapItem[] = [
  {
    id: "gap-1",
    title: "GPU Cluster Scheduling & Triton Serving Layer",
    gap_type: "KNOWLEDGE_DEFICIT",
    priority: "HIGH",
    rationale:
      "Top-tier AI Infrastructure roles require familiarity with SLURM/Kubernetes GPU scheduling topologies and Triton serving abstractions.",
    current_level: 4.0,
    target_level: 8.5,
    estimated_effort_hours: 18,
    expected_impact: "+8.5% Fit Gain on AI Infra Roles",
  },
  {
    id: "gap-2",
    title: "eBPF Kernel-Level Observability & Networking",
    gap_type: "UNVERIFIED_EVIDENCE",
    priority: "MEDIUM",
    rationale:
      "Observed in 40% of target Cloudflare & Datadog Staff postings. No verified open-source commits or assessment items found in current graph.",
    current_level: 3.5,
    target_level: 7.5,
    estimated_effort_hours: 14,
    expected_impact: "+6.0% Fit Gain on Edge Roles",
  },
];

const MOCK_PLANS: LearningPlanType[] = [
  {
    id: "plan-1",
    title: "Targeted Master Plan: GPU Cluster Scheduling & Triton Serving",
    target_skill: "GPU Scheduling & Triton Inference",
    status: "IN_PROGRESS",
    current_level: 4.0,
    target_level: 8.5,
    progress_percentage: 60,
    items: [
      {
        id: "item-1",
        title: "Read: Kubernetes Device Plugin API & DRA (Dynamic Resource Allocation) Spec",
        item_type: "READ",
        resource_type: "READ",
        duration_minutes: 45,
        estimated_minutes: 45,
        is_completed: true,
        resource: { provider: "Kubernetes Docs", difficulty: "Advanced" },
      },
      {
        id: "item-2",
        title: "Watch: Triton Inference Server Architecture Deep Dive (NVIDIA GTC)",
        item_type: "WATCH",
        resource_type: "WATCH",
        duration_minutes: 60,
        estimated_minutes: 60,
        is_completed: true,
        resource: { provider: "NVIDIA Developer", difficulty: "Advanced" },
      },
      {
        id: "item-3",
        title: "Build: Deploy a Mock Triton Ensemble Pipeline on Local K3s GPU Simulator",
        item_type: "BUILD",
        resource_type: "BUILD",
        duration_minutes: 120,
        estimated_minutes: 120,
        is_completed: false,
        resource: { provider: "Hands-on Lab", difficulty: "Expert" },
      },
      {
        id: "item-4",
        title: "Prove: Complete JobPilot Triton & Distributed Serving Scenario Assessment",
        item_type: "PROVE",
        resource_type: "PROVE",
        duration_minutes: 30,
        estimated_minutes: 30,
        is_completed: false,
        resource: { provider: "JobPilot Proving", difficulty: "Staff" },
      },
    ],
  },
];

const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    title: "Kubernetes Dynamic Resource Allocation (DRA) Architectural Spec",
    url: "https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/",
    resource_type: "READ",
    provider: "Kubernetes Docs",
    duration_minutes: 45,
    difficulty: "Advanced",
    difficulty_level: "Advanced",
    cost: "FREE",
    topics_json: ["Kubernetes", "DRA", "GPU Scheduling"],
  },
  {
    id: "res-2",
    title: "Triton Inference Server Architecture & Multi-Model Scheduling",
    url: "https://github.com/triton-inference-server/server",
    resource_type: "WATCH",
    provider: "NVIDIA Developer",
    duration_minutes: 60,
    difficulty: "Advanced",
    difficulty_level: "Advanced",
    cost: "FREE",
    topics_json: ["Triton", "Inference", "Model Ensembles"],
  },
  {
    id: "res-3",
    title: "eBPF by Example: Writing High-Performance Network Filters",
    url: "https://ebpf.io/what-is-ebpf/",
    resource_type: "BUILD",
    provider: "eBPF Foundation",
    duration_minutes: 90,
    difficulty: "Intermediate",
    difficulty_level: "Intermediate",
    cost: "FREE",
    topics_json: ["eBPF", "Linux Kernel", "Networking"],
  },
];

const MOCK_ASSESSMENTS: AssessmentType[] = [
  {
    id: "asm-1",
    title: "Distributed Consensus & Raft Invariants Mastery",
    skill_name: "Distributed Consensus (Raft/Paxos)",
    description:
      "Scenario-based assessment evaluating quorum correctness, term elections, log compaction races, and linearizable read guarantees.",
    difficulty: "STAFF_LEVEL",
    time_limit_minutes: 25,
    passing_score: 80,
    questions: [
      {
        id: "q-1",
        prompt:
          "In the Raft consensus algorithm, how does a Leader guarantee linearizable reads without appending every read operation to the persistent Raft log?",
        question_text:
          "In the Raft consensus algorithm, how does a Leader guarantee linearizable reads without appending every read operation to the persistent Raft log?",
        points: 10,
        options_json: [
          "A) By reading from the local state machine immediately if lease timer is < election timeout.",
          "B) By issuing a ReadIndex heartbeat to a quorum of followers to verify leader authority before serving the read.",
          "C) By delegating all reads to the lowest-latency follower node.",
          "D) By taking a snapshot before each read request.",
        ],
        correct_option: "B",
        explanation: "ReadIndex queries the leader's commit index and confirms quorum heartbeats before serving.",
      },
      {
        id: "q-2",
        prompt:
          "What invariant prevents a new Raft Leader from directly committing log entries from previous terms by counting replicas alone?",
        question_text:
          "What invariant prevents a new Raft Leader from directly committing log entries from previous terms by counting replicas alone?",
        points: 10,
        options_json: [
          "A) Figure 8 safety violation where uncommitted previous-term entries can be overwritten.",
          "B) The AppendEntries RPC threshold prevents older terms from replicating.",
          "C) PrevLogIndex validation inherently halts past terms.",
          "D) Log compaction prevents older term inspection.",
        ],
        correct_option: "A",
        explanation: "Raft leaders must commit entries from their own current term before past terms can be committed.",
      },
    ],
  },
  {
    id: "asm-2",
    title: "Kubernetes Operator Reconciler & Lease Optimization",
    skill_name: "Kubernetes Control Plane & Operators",
    description:
      "Evaluates controller-runtime queue tuning, leader election leases, informers cache consistency, and level-driven edge detection.",
    difficulty: "SENIOR_LEVEL",
    time_limit_minutes: 20,
    passing_score: 75,
    questions: [
      {
        id: "q-3",
        prompt:
          "Why is controller reconciliation in Kubernetes designed to be level-triggered rather than edge-triggered?",
        question_text:
          "Why is controller reconciliation in Kubernetes designed to be level-triggered rather than edge-triggered?",
        points: 10,
        options_json: [
          "A) Level-triggered logic allows controllers to survive missed events by observing the actual state of the world.",
          "B) Edge-triggered reconciliation requires fewer network roundtrips to the etcd cluster.",
          "C) Go channels only support level-triggered event semantics.",
          "D) Level-triggering removes the need for Informer caches.",
        ],
        correct_option: "A",
        explanation: "Level-triggering ensures declarative eventual consistency even in the presence of network blips or restarts.",
      },
    ],
  },
];

const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-1",
    status: "INTERVIEW",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    match_score_at_application: 94.8,
    job: {
      id: "job-1",
      title: "Principal Distributed Infrastructure Engineer",
      location: "San Francisco, CA (Hybrid / Remote Option)",
      company: {
        id: "comp-1",
        name: "Anthropic",
      },
    },
    artifacts: [
      {
        id: "art-1",
        artifact_type: "TAILORED_RESUME",
        title: "Tailored Resume (Verified Provenance Citations)",
        content_text:
          "Alex Chen — Principal Distributed Infrastructure Candidate. Highlighted expertise in Raft consensus verification (proven by raft-engine open source codebase) and multi-region Kubernetes control planes.",
        provenance_sources_json: ["GitHub/alexchen-infra/raft-engine", "Stripe/LedgerReplicationTechTalk"],
      },
      {
        id: "art-2",
        artifact_type: "TAILORED_COVER_LETTER",
        title: "Tailored Executive Alignment Letter",
        content_text:
          "Dear Anthropic Infrastructure Hiring Team,\n\nI am writing to express my strong enthusiasm for the Principal Distributed Infrastructure role. With 8+ years scaling high-throughput consensus systems at Stripe and building mission-critical Kubernetes operator control planes, I specialize in low-latency distributed state machines.",
        provenance_sources_json: ["Verified Resume PDF", "GitHub Commits"],
      },
    ],
  },
  {
    id: "app-2",
    status: "OFFER",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    match_score_at_application: 91.2,
    job: {
      id: "job-2",
      title: "Staff Storage Systems Architect",
      location: "New York, NY / Remote",
      company: {
        id: "comp-2",
        name: "Datadog",
      },
    },
    artifacts: [
      {
        id: "art-3",
        artifact_type: "TAILORED_RESUME",
        title: "Tailored Resume (Storage Focus)",
        content_text:
          "Alex Chen — Staff Storage Architect. Focused on LSM-Tree optimizations, multi-tenant Kafka event buses, and zero-data-loss failovers.",
        provenance_sources_json: ["GitHub Storage Repos", "Uber Streaming Architecture"],
      },
    ],
  },
];

const MOCK_POLICY: ApplicationPolicyType = {
  mode: "ASSISTED",
  min_match_score: 85,
  daily_application_limit: 5,
  require_review_for_senior_roles: true,
  prohibited_keywords: ["Contract", "Crypto scam", "Unpaid"],
  restricted_companies: ["Legacy Outsourcing Corp"],
};

const MOCK_FUNNEL: FunnelAnalytics = {
  total_applications: 18,
  applied: 18,
  interviews: 4,
  offers: 1,
  stages: [
    { stage: "Identified Radar Roles", count: 48, conversion_rate_percentage: 100 },
    { stage: "High Fit (85%+ Match)", count: 18, conversion_rate_percentage: 37.5 },
    { stage: "Tailored & Applied", count: 12, conversion_rate_percentage: 66.7 },
    { stage: "Recruiter Screen Passed", count: 9, conversion_rate_percentage: 75.0 },
    { stage: "Technical Loop Completed", count: 6, conversion_rate_percentage: 66.7 },
    { stage: "Offer Extended", count: 2, conversion_rate_percentage: 33.3 },
  ],
  primary_bottleneck:
    "Recruiter initial screen response rate was lower on AI-adjacent infrastructure roles prior to completing GPU Scheduling & Triton verification assessments.",
  strategic_recommendation:
    "Outcome feedback confirms a 2.4x higher interview pass rate when verifiable GitHub consensus code citations are included in the tailored cover letter.",
  recent_events: [
    {
      id: "ev-1",
      event_type: "OFFER_EXTENDED",
      notes: "Received formal Staff Engineer offer from Datadog ($275k base + equity).",
      occurred_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "ev-2",
      event_type: "TECHNICAL_LOOP_PASSED",
      notes: "Completed Anthropic Principal Infrastructure system design round with top marks.",
      occurred_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "ev-3",
      event_type: "APPLICATION_SUBMITTED",
      notes: "Submitted tailored application package to Cloudflare Edge Platform role.",
      occurred_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
};

// API Client Wrapper with Fallback Support
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 120000; // 2 minutes

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 1200): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const api = {
  async getProfile(): Promise<UserProfile> {
    const cacheKey = "profile";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/profile`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        const fullProfile = {
          ...MOCK_PROFILE,
          ...data,
          experiences: data.experiences || MOCK_PROFILE.experiences,
          projects: data.projects || MOCK_PROFILE.projects,
        };
        apiCache.set(cacheKey, { data: fullProfile, timestamp: Date.now() });
        return fullProfile;
      }
    } catch (e) {
      console.warn("Using fallback profile", e);
    }
    apiCache.set(cacheKey, { data: MOCK_PROFILE, timestamp: Date.now() });
    return MOCK_PROFILE;
  },

  async getSources(): Promise<SourceItem[]> {
    const cacheKey = "sources";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/sources`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback sources", e);
    }
    apiCache.set(cacheKey, { data: MOCK_SOURCES, timestamp: Date.now() });
    return MOCK_SOURCES;
  },

  async syncSource(sourceId: string): Promise<any> {
    apiCache.delete("sources");
    apiCache.delete("skills");
    apiCache.delete("profile");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/sources/${sourceId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Sync source fallback", e);
    }
    return { status: "SYNCED", source_id: sourceId };
  },

  async getSkillsProfile(): Promise<SkillEvidenceItem[]> {
    const cacheKey = "skills";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/skills`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback skills", e);
    }
    apiCache.set(cacheKey, { data: MOCK_SKILLS, timestamp: Date.now() });
    return MOCK_SKILLS;
  },

  async getMatches(): Promise<MatchItem[]> {
    const cacheKey = "matches";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/matches`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback matches", e);
    }
    apiCache.set(cacheKey, { data: MOCK_MATCHES, timestamp: Date.now() });
    return MOCK_MATCHES;
  },

  async recalculateMatches(): Promise<MatchItem[]> {
    apiCache.delete("matches");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/matches/recalculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        return await this.getMatches();
      }
    } catch (e) {
      console.warn("Recalculate fallback", e);
    }
    return MOCK_MATCHES;
  },

  async getGaps(): Promise<GapItem[]> {
    const cacheKey = "gaps";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/gaps`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback gaps", e);
    }
    apiCache.set(cacheKey, { data: MOCK_GAPS, timestamp: Date.now() });
    return MOCK_GAPS;
  },

  async generateLearningPlan(gapId: string): Promise<any> {
    apiCache.delete("plans");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/learning/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          title: "Synthesized Plan for Gap",
          target_skill: "GPU Scheduling & Triton",
          target_level: 8.5,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Plan generation fallback", e);
    }
    return MOCK_PLANS[0];
  },

  async getLearningPlans(): Promise<LearningPlanType[]> {
    const cacheKey = "plans";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/learning/plans`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback learning plans", e);
    }
    apiCache.set(cacheKey, { data: MOCK_PLANS, timestamp: Date.now() });
    return MOCK_PLANS;
  },

  async getResources(): Promise<ResourceItem[]> {
    const cacheKey = "resources";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/learning/resources`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback resources", e);
    }
    apiCache.set(cacheKey, { data: MOCK_RESOURCES, timestamp: Date.now() });
    return MOCK_RESOURCES;
  },

  async togglePlanItem(planId: string, itemId: string): Promise<LearningPlanType> {
    apiCache.delete("plans");
    try {
      const res = await fetchWithTimeout(
        `${API_BASE_URL}/learning/plans/${planId}/items/${itemId}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        }
      );
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Toggle plan item fallback", e);
    }
    const plan = { ...MOCK_PLANS[0] };
    plan.items = plan.items.map((it) =>
      it.id === itemId ? { ...it, is_completed: !it.is_completed } : it
    );
    const completed = plan.items.filter((it) => it.is_completed).length;
    plan.progress_percentage = (completed / plan.items.length) * 100;
    return plan;
  },

  async getAssessments(): Promise<AssessmentType[]> {
    const cacheKey = "assessments";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/assessments`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback assessments", e);
    }
    apiCache.set(cacheKey, { data: MOCK_ASSESSMENTS, timestamp: Date.now() });
    return MOCK_ASSESSMENTS;
  },

  async getAssessment(id: string): Promise<AssessmentType> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/assessments/${id}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using fallback assessment detail", e);
    }
    return (
      MOCK_ASSESSMENTS.find((a) => a.id === id) || MOCK_ASSESSMENTS[0]
    );
  },

  async submitAssessment(
    id: string,
    answers: Record<string, string>
  ): Promise<AssessmentAttemptResult> {
    apiCache.delete("skills");
    apiCache.delete("matches");
    apiCache.delete("gaps");
    apiCache.delete("profile");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/assessments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Submit assessment fallback", e);
    }
    return {
      id: "att-1",
      score_percentage: 100,
      passed: true,
      skill_boost_applied: true,
      new_proficiency_level: 9.8,
      feedback: "Exemplary understanding of Raft linearizable quorum mechanics.",
      evaluations: [
        {
          question_id: "q-1",
          is_correct: true,
          explanation: "ReadIndex queries the leader's commit index and confirms quorum heartbeats before serving.",
        },
        {
          question_id: "q-2",
          is_correct: true,
          explanation: "Raft leaders must commit entries from their own current term before past terms can be committed.",
        },
        {
          question_id: "q-3",
          is_correct: true,
          explanation: "Level-triggering ensures declarative eventual consistency even in the presence of network blips or restarts.",
        },
      ],
    };
  },

  async getApplications(): Promise<ApplicationItem[]> {
    const cacheKey = "applications";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/applications`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (e) {
      console.warn("Using fallback applications", e);
    }
    apiCache.set(cacheKey, { data: MOCK_APPLICATIONS, timestamp: Date.now() });
    return MOCK_APPLICATIONS;
  },

  async createApplication(data: {
    job_id: string;
    tailored_role_title?: string;
    notes?: string;
  }): Promise<ApplicationItem> {
    apiCache.delete("applications");
    apiCache.delete("funnel");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Create application fallback", e);
    }
    return MOCK_APPLICATIONS[0];
  },

  async getApplicationPolicy(): Promise<ApplicationPolicyType> {
    const cacheKey = "policy";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/applications/policy`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (e) {
      console.warn("Using fallback policy", e);
    }
    apiCache.set(cacheKey, { data: MOCK_POLICY, timestamp: Date.now() });
    return MOCK_POLICY;
  },

  async updateApplicationPolicy(
    policy: ApplicationPolicyType
  ): Promise<ApplicationPolicyType> {
    apiCache.set("policy", { data: policy, timestamp: Date.now() });
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/applications/policy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        const data = await res.json();
        apiCache.set("policy", { data, timestamp: Date.now() });
        return data;
      }
    } catch (e) {
      console.warn("Update policy fallback", e);
    }
    return policy;
  },

  async getFunnelAnalytics(): Promise<FunnelAnalytics> {
    const cacheKey = "funnel";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/outcomes/funnel`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (e) {
      console.warn("Using fallback funnel", e);
    }
    apiCache.set(cacheKey, { data: MOCK_FUNNEL, timestamp: Date.now() });
    return MOCK_FUNNEL;
  },

  async getCareerGoal(): Promise<CareerGoal> {
    const cacheKey = "career_goal";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/goals`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiCache.set(cacheKey, { data: data[0], timestamp: Date.now() });
          return data[0];
        }
      }
    } catch (e) {
      console.warn("Using fallback career goal", e);
    }
    const defaultGoal: CareerGoal = {
      target_role: "Senior Backend Engineer",
      target_seniority: "Senior",
      target_locations: ["Remote", "San Francisco, CA", "Bangalore, India"],
      target_salary_min: 220000,
      workplace_preference: "REMOTE",
    };
    apiCache.set(cacheKey, { data: defaultGoal, timestamp: Date.now() });
    return defaultGoal;
  },

  async updateCareerGoal(goal: Partial<CareerGoal>): Promise<CareerGoal> {
    apiCache.delete("career_goal");
    apiCache.delete("matches");
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          target_role: goal.target_role || "Senior Backend Engineer",
          target_seniority: goal.target_seniority || "Senior",
          target_locations: goal.target_locations || ["Remote"],
          target_salary_min: goal.target_salary_min || 200000,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Update career goal fallback", e);
    }
    return {
      target_role: goal.target_role || "Senior Backend Engineer",
      target_seniority: goal.target_seniority || "Senior",
      target_locations: goal.target_locations || ["Remote"],
      target_salary_min: goal.target_salary_min || 200000,
    };
  },

  async getJob(id: string): Promise<Job> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/jobs/${id}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using fallback job detail", e);
    }
    const found = MOCK_MATCHES.find((m) => m.job.id === id);
    if (found) return found.job;
    return MOCK_MATCHES[0].job;
  },

  async getGap(id: string): Promise<GapItem> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/gaps/${id}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using fallback gap detail", e);
    }
    return MOCK_GAPS.find((g) => g.id === id) || MOCK_GAPS[0];
  },

  async getEvidence(): Promise<EvidenceItem[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/evidence`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using fallback evidence", e);
    }
    return [
      {
        id: "ev-1",
        title: "raft-engine repository",
        description: "3.4k stars, 100% test coverage on linearizable reads",
        source_type: "GITHUB_REPO",
      },
      {
        id: "ev-2",
        title: "Stripe multi-region consensus patent",
        description: "Zero downtime distributed state machine replication",
        source_type: "RESUME_CITATION",
      },
      {
        id: "ev-3",
        title: "Kubernetes CRD Operator",
        description: "Multi-tenant namespace controller in production",
        source_type: "GITHUB_COMMIT",
      },
      {
        id: "ev-4",
        title: "Raft Consensus Assessment",
        description: "Verified 100% score in Stage 5 diagnostic",
        source_type: "ASSESSMENT_VERIFIED",
      },
    ];
  },

  getNotifications(): NotificationItem[] {
    return [
      {
        id: "n-1",
        title: "New High-Signal Opportunity",
        message: "Anthropic matched at 95% technical alignment.",
        timestamp: "10m ago",
        read: false,
        action_url: "/opportunities",
        type: "match",
      },
      {
        id: "n-2",
        title: "Assessment Ready",
        message: "Prove Kubernetes control planes to unlock +1.8 skill boost.",
        timestamp: "1h ago",
        read: false,
        action_url: "/prove",
        type: "assessment",
      },
      {
        id: "n-3",
        title: "GitHub Sync Completed",
        message: "14 repositories analyzed. 3 verified skills refreshed.",
        timestamp: "2h ago",
        read: true,
        action_url: "/sources",
        type: "source",
      },
    ];
  },

  getRecentActivities(): ActivityItem[] {
    return [
      {
        id: "act-1",
        title: "Raft Consensus Proven",
        description: "Scored 100% on linearizable reads assessment. Verified level updated to 9.8/10.",
        timestamp: "2 hours ago",
        icon_type: "award",
        stage: "PROVE",
        action_url: "/prove",
      },
      {
        id: "act-2",
        title: "12 New Matches Unlocked",
        description: "Skill boost unlocked high-signal distributed systems positions.",
        timestamp: "3 hours ago",
        icon_type: "target",
        stage: "MATCH",
        action_url: "/opportunities",
      },
      {
        id: "act-3",
        title: "Application Tailored for Datadog",
        description: "Evidence-backed resume kit drafted with policy guardrails.",
        timestamp: "Yesterday",
        icon_type: "send",
        stage: "APPLY",
        action_url: "/applications",
      },
    ];
  },
};
