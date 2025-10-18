// User types
export const enum UserRole {
  PARTICIPANT = 'participant',
  ORGANIZER = 'organizer',
  SPONSOR = 'sponsor',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  bio?: string;
  profilePhoto?: string;
  bannerPhoto?: string;
  industries?: string[];
  interests?: string[];
  networkingGoals?: string[];
  linkedinUrl?: string;
  twitterUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event types
export const enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateEventDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  categories?: string[];
  coverImage?: string;
  capacity?: number;
  isPublic?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  categories?: string[];
  coverImage?: string;
  capacity?: number;
  status?: EventStatus;
  isPublic?: boolean;
  requiresApproval?: boolean;
}

export interface JoinEventDto {
  message?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  categories?: string[];
  coverImage?: string;
  capacity: number;
  status: EventStatus;
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

// Match types
export const enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CONNECTED = 'connected',
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  eventId: string;
  score: number;
  status: MatchStatus;
  matchReasons?: Record<string, any>;
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  eventId?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Meeting types
export const enum MeetingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Meeting {
  id: string;
  participant1Id: string;
  participant2Id: string;
  eventId: string;
  scheduledTime: string;
  location?: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  company?: string;
  position?: string;
  industries?: string[];
  interests?: string[];
  networkingGoals?: string[];
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  bio?: string;
  industries?: string[];
  interests?: string[];
  networkingGoals?: string[];
  linkedinUrl?: string;
  twitterUrl?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

