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
  summary_json?: {
    verified_skills?: number;
    top_domains?: string[];
    [key: string]: any;
  };
  experiences: WorkExperience[];
  projects?: Project[];
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
}

export interface MatchItem {
  id: string;
  overall_score: number;
  technical_fit: number;
  experience_fit: number;
  preference_fit: number;
  recommendation_category: string;
  why_matched: string;
  explanation?: string;
  job: Job;
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
  feedback?: string;
  evaluations?: AssessmentEvaluationItem[];
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
  status: string;
  created_at: string;
  tailored_role_title?: string;
  match_score_at_application: number;
  notes?: string;
  job: Job;
  artifacts: ApplicationArtifact[];
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
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion_rate_percentage: number;
}

export interface LifecycleEvent {
  id: string;
  event_type: string;
  notes: string;
  occurred_at: string;
}

export interface FunnelAnalytics {
  stages: FunnelStage[];
  primary_bottleneck: string;
  strategic_recommendation: string;
  recent_events: LifecycleEvent[];
  offers?: number;
  [key: string]: any;
}
