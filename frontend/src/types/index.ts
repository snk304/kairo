export type Role = 'jobseeker' | 'company' | 'admin'

export interface User {
  id: string
  email: string
  role: Role
}

export interface JobseekerProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  disabilityType?: { id: string; name: string }
  disabilityGrade?: string
  desiredJobCategory?: { id: string; name: string }
  prefecture?: { id: string; name: string }
  desiredWorkStyle?: string
  desiredEmploymentType?: string
  desiredSalary?: number
  selfPr?: string
  isPublic: boolean
  // 企業ログイン時のみ
  email?: string
  resumeUrl?: string
}

export interface CompanyPhoto {
  id: string
  photoUrl: string
}

export interface CompanyProfile {
  id: string
  name: string
  industry?: string
  employeeCount?: number
  prefecture?: { id: string; name: string }
  address?: string
  description?: string
  disabledHireCount: number
  considerations?: Considerations
  photos?: CompanyPhoto[]
}

export interface Considerations {
  facility?: string[]
  workStyle?: string[]
  communication?: string[]
  equipment?: string[]
}

export interface Job {
  id: string
  title: string
  company: Pick<CompanyProfile, 'id' | 'name'>
  jobCategory?: { id: string; name: string }
  description?: string
  employmentType?: string
  workStyle?: string
  salaryMin?: number
  salaryMax?: number
  prefecture?: { id: string; name: string }
  considerations?: Considerations
  status: 'draft' | 'published' | 'closed'
  createdAt: string
}

export interface Application {
  id: string
  job: Pick<Job, 'id' | 'title'>
  jobseeker?: { id: string; email: string; role: string }
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected'
  threadId?: string
  createdAt: string
}

export interface Scout {
  id: string
  company?: { id: string; userId: string; name: string }
  jobseeker?: { id: string; userId: string; firstName: string; lastName: string }
  job?: Pick<Job, 'id' | 'title'>
  message: string
  status: 'unread' | 'read' | 'replied'
  createdAt: string
}

export interface Thread {
  id: string
  opponent: { id: string; name: string }
  lastMessage?: { body: string; createdAt: string }
  unreadCount: number
}

export interface Message {
  id: string
  senderId: string
  body: string
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  data: Record<string, string>
  readAt: string | null
  createdAt: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
