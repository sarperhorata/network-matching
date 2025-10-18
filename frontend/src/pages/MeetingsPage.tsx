import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { meetingsService, type CreateMeetingDto } from '../services/meetings.service';
import type { Meeting } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CalendarDays, Plus, Clock, MapPin, User } from 'lucide-react';

export default function MeetingsPage() {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'pending'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const meetingsData = await meetingsService.getUserMeetings(user.id);
      setMeetings(meetingsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load meetings');
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingAction = async (meetingId: string, action: string) => {
    try {
      let updatedMeeting: Meeting;

      switch (action) {
        case 'accept':
          updatedMeeting = await meetingsService.acceptMeeting(meetingId);
          break;
        case 'decline':
          updatedMeeting = await meetingsService.declineMeeting(meetingId);
          break;
        case 'complete':
          updatedMeeting = await meetingsService.completeMeeting(meetingId);
          break;
        default:
          return;
      }

      // Update meeting in local state
      setMeetings(prev =>
        prev.map(meeting =>
          meeting.id === meetingId ? updatedMeeting : meeting
        )
      );
    } catch (err: any) {
      console.error(`Failed to ${action} meeting:`, err);
    }
  };

  const getFilteredMeetings = () => {
    const now = new Date();

    return meetings.filter(meeting => {
      const meetingTime = new Date(meeting.scheduledTime);

      switch (activeTab) {
        case 'upcoming':
          return meetingTime > now && meeting.status === 'confirmed';
        case 'past':
          return meetingTime <= now && meeting.status === 'completed';
        case 'pending':
          return meeting.status === 'pending';
        default:
          return true;
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Toplantılarınızı görmek için lütfen giriş yapın.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-[#0EA5E9]" />
              Toplantılar
            </h1>
            <p className="text-gray-600">Network toplantılarınızı planlayın ve yönetin</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Toplantı Planla
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'pending', label: 'Pending' },
                { key: 'past', label: 'Past' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading meetings...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadMeetings}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : getFilteredMeetings().length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming'
                ? 'Schedule meetings with your matches to start networking.'
                : activeTab === 'pending'
                ? 'No pending meeting requests.'
                : 'No past meetings yet.'}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
              >
                Schedule Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredMeetings().map(meeting => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onAction={handleMeetingAction}
              />
            ))}
          </div>
        )}

        {/* Create Meeting Modal */}
        {showCreateModal && (
          <CreateMeetingModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onMeetingCreated={loadMeetings}
          />
        )}
      </div>
    </div>
  );
}

// Meeting Card Component
function MeetingCard({
  meeting,
  onAction
}: {
  meeting: Meeting;
  onAction: (meetingId: string, action: string) => void;
}) {
  // For now, we'll show placeholder information since we don't have participant details
  // In production, this would come from the API response with populated relations

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const { date, time } = formatDateTime(meeting.scheduledTime);
  const isPast = new Date(meeting.scheduledTime) <= new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-primary-600 font-semibold">
              M
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Meeting
            </h3>
            <p className="text-sm text-gray-600">Networking Meeting</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {time}
        </div>

        {meeting.location && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {meeting.location}
          </div>
        )}

        {meeting.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{meeting.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {meeting.status === 'pending' && (
          <>
            <button
              onClick={() => onAction(meeting.id, 'accept')}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onAction(meeting.id, 'decline')}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Decline
            </button>
          </>
        )}

        {meeting.status === 'confirmed' && !isPast && (
          <>
            <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
              Reschedule
            </button>
            <button
              onClick={() => onAction(meeting.id, 'complete')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete
            </button>
          </>
        )}

        {isPast && meeting.status === 'confirmed' && (
          <button
            onClick={() => onAction(meeting.id, 'complete')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Completed
          </button>
        )}

        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({
  isOpen,
  onClose,
  onMeetingCreated
}: {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
}) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<CreateMeetingDto>({
    participant1Id: user?.id || '',
    participant2Id: '',
    eventId: '',
    scheduledTime: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchUsers();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    try {
      // For now, we'll use a simple search
      // In production, this would be an API call
      setSearchResults([]);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participant2Id || !formData.scheduledTime) return;

    setLoading(true);
    try {
      await meetingsService.createMeeting(formData);
      onMeetingCreated();
      onClose();
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Participant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting With
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, participant2Id: user.id }));
                        setSearchTerm(`${user.firstName} ${user.lastName}`);
                        setShowResults(false);
                      }}
                    >
                      {user.firstName} {user.lastName} - {user.company}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (Optional)
            </label>
            <input
              type="text"
              placeholder="Meeting location or video call link"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Meeting agenda or additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.participant2Id || !formData.scheduledTime}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              loading || !formData.participant2Id || !formData.scheduledTime
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {loading ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
}

