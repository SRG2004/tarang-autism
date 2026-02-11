export interface DemoResult {
  steps: Array<{
    step: string
    agent: string
  }>
  total_time: string
}

export interface CommunityPost {
  id: number
  author: string
  content: string
  is_safe: number
  created_at: string
  moderation?: {
    safe: boolean
    reason?: string
  }
}

export interface Report {
  id: number
  patient_name: string
  risk_score: number
  confidence: string
  interpretation: string
  breakdown: Record<string, number>
  clinical_recommendation: string
  dissonance_factor: number
  created_at: string
}

export interface User {
  email: string
  full_name: string
  role: 'PARENT' | 'CLINICIAN' | 'ADMIN'
  org_id?: number
}

export interface TokenData {
  username: string
  role: 'PARENT' | 'CLINICIAN' | 'ADMIN'
  org_id?: number
}
