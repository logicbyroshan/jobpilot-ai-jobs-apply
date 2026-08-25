export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  is_active?: boolean;
  auth_provider?: string;
}

export interface WorkExperience {
  id: string;
  company_name: string;
  title: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  technologies_json: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies_json: string[];
}

export interface Education {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  headline: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  years_of_experience: number;
  profile_confidence: number;
  target_role?: string;
  summary_json?: {
    verified_skills?: number;
    top_domains?: string[];
    readiness_percentage?: number;
    [key: string]: any;
  };
  experiences: WorkExperience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
}

export interface CareerGoal {
  id?: string;
  target_role: string;
  target_seniority?: string;
  target_locations?: string[];
  target_salary_min?: number;
  workplace_preference?: "REMOTE" | "HYBRID" | "ONSITE" | string;
  created_at?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  source_type: string;
  url?: string;
  created_at?: string;
}

export interface SkillEvidenceItem {
  id: string;
  skill_name: string;
  category: string;
  strength: "STRONG" | "MODERATE" | "DEVELOPING" | string;
  proficiency_estimate: number;
  confidence_rating?: "HIGH" | "MEDIUM" | "LOW" | string;
  verified_at?: string;
  evidence_items: EvidenceItem[];
}

export interface SourceItem {
  id: string;
  source_type: string;
  display_name: string;
  source_url?: string;
  status: string;
  last_synced_at?: string;
  items_ingested_count?: number;
}

export interface Company {
  id: string;
  name: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  seniority?: string;
  workplace_type?: string;
  company: Company;
  required_skills_json?: string[];
  responsibilities_json?: string[];
  description_markdown?: string;
}

export interface MatchItem {
  id: string;
  job: Job;
  overall_score: number;
  technical_fit: number;
  experience_fit: number;
  preference_fit: number;
  evidence_confidence?: number;
  recommendation_category: string;
  explanation: string;
  why_matched?: string;
  matched_skills_json: string[];
  missing_skills_json: string[];
}

export interface GapItem {
  id: string;
  title: string;
  gap_type: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  rationale: string;
  current_level: number;
  target_level: number;
  estimated_effort_hours?: number;
  estimated_hours_to_close?: number;
  expected_impact?: string;
  blocked_opportunities_count?: number;
  missing_competencies?: string[];
  strengths_noted?: string[];
}

export interface LearningItem {
  id: string;
  title: string;
  description?: string;
  item_type: string;
  resource_type?: string;
  url?: string;
  resource_url?: string;
  duration_minutes?: number;
  estimated_minutes?: number;
  is_completed: boolean;
  resource?: {
    provider?: string;
    difficulty?: string;
    url?: string;
    [key: string]: any;
  };
}

export interface LearningPlanType {
  id: string;
  title: string;
  target_skill: string;
  target_gap_title?: string;
  estimated_total_hours?: number;
  target_weeks?: number;
  status: string;
  current_level: number;
  target_level: number;
  progress_percentage: number;
  items: LearningItem[];
}

export interface ResourceItem {
  id: string;
  title: string;
  url?: string;
  external_url?: string;
  resource_type: string;
  provider?: string;
  topic_tag?: string;
  summary_text?: string;
  recommendation_reason?: string;
  duration_minutes?: number;
  estimated_minutes?: number;
  difficulty?: string;
  difficulty_level?: string;
  cost?: string;
  topics_json?: string[];
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  points: number;
  question_text?: string;
  options_json: string[];
  correct_option?: string;
  explanation?: string;
}

export interface AssessmentType {
  id: string;
  title: string;
  skill_name: string;
  description: string;
  difficulty: string;
  time_limit_minutes: number;
  passing_score: number;
  questions: AssessmentQuestion[];
  unlocked_matches_count?: number;
}

export interface AssessmentEvaluationItem {
  question_id: string;
  is_correct: boolean;
  explanation?: string;
  [key: string]: any;
}

export interface AssessmentAttemptResult {
  id: string;
  score_percentage: number;
  passed: boolean;
  skill_boost_applied: boolean;
  new_proficiency_level?: number;
  previous_proficiency_level?: number;
  feedback?: string;
  evaluations?: AssessmentEvaluationItem[];
  unlocked_opportunities_count?: number;
}

export interface ApplicationArtifact {
  id: string;
  artifact_type: string;
  title: string;
  content_text: string;
  provenance_sources_json: string[];
  metadata_json?: Record<string, any>;
}

export interface ApplicationItem {
  id: string;
  status: "RECOMMENDED" | "DRAFT" | "APPLIED" | "INTERVIEW" | "OFFER" | "ARCHIVED" | string;
  created_at: string;
  tailored_role_title?: string;
  match_score_at_application: number;
  notes?: string;
  job: Job;
  artifacts: ApplicationArtifact[];
  next_action?: string;
  timeline_events?: { date: string; title: string; note: string }[];
}

export interface ApplicationPolicyType {
  id?: string;
  mode: "MANUAL" | "ASSISTED" | "AUTONOMOUS" | string;
  min_match_score: number;
  daily_application_limit: number;
  require_user_review?: boolean;
  auto_tailor_resume?: boolean;
  auto_generate_cover_letter?: boolean;
  require_review_for_senior_roles?: boolean;
  prohibited_keywords?: string[];
  restricted_companies?: string[];
  target_locations?: string[];
  salary_floor?: number;
  is_enabled?: boolean;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion_rate_percentage: number;
}

export interface BottleneckDiagnostic {
  primary_bottleneck_stage: string;
  bottleneck_reason: string;
  actionable_recommendation: string;
  impact_score: number;
}

export interface FunnelAnalytics {
  total_applications: number;
  applied: number;
  interviews: number;
  offers: number;
  stages: FunnelStage[];
  primary_bottleneck?: string;
  strategic_recommendation?: string;
  bottleneck_summary?: BottleneckDiagnostic;
  recent_events?: any[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url: string;
  type: "match" | "assessment" | "source" | "application" | "system";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon_type: string;
  stage: string;
  action_url?: string;
}
