export type UserRole = 'participant' | 'organizer' | 'sponsor' | 'admin';

export type EventCategory = 
  | 'Tech' 
  | 'Business' 
  | 'Healthcare' 
  | 'Finance' 
  | 'Marketing' 
  | 'Design' 
  | 'Education' 
  | 'Networking' 
  | 'Sports' 
  | 'Arts';

export type MeetingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MatchStatus = 'pending' | 'accepted' | 'declined';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  industry: string;
  interests: string[];
  goals: string[];
  profileImage?: string;
  createdAt: string;
  profileCompletion: number;
  stats: {
    eventsAttended: number;
    totalMatches: number;
    acceptedMatches: number;
    totalMeetings: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  imageUrl?: string;
  organizerId: string;
  participants: string[];
  pendingRequests: string[];
  checkedInUsers: string[];
  createdAt: string;
}

export interface Match {
  id: string;
  user: User;
  score: number;
  reasons: string[];
  eventId: string;
  status: MatchStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
  lastMessageAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  participantId: string;
  organizerId: string;
  scheduledAt: string;
  location: string;
  agenda?: string;
  notes?: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAnalytics {
  eventsAttended: number;
  totalMatches: number;
  acceptedMatches: number;
  totalMeetings: number;
  profileCompletion: number;
}

export interface EventAnalytics {
  totalParticipants: number;
  pendingRequests: number;
  checkedInUsers: number;
  checkInRate: number;
}
