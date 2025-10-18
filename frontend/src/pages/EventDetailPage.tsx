import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { eventsService } from '../services/events.service';
import type { Event } from '../types';
import CheckInModal from '../components/CheckInModal';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const eventData = await eventsService.getEvent(id);
      setEvent(eventData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!id || !user) return;

    setJoining(true);
    try {
      await eventsService.joinEvent(id);
      toast.success('Successfully joined the event!');
      // Reload event to update participant status
      await loadEvent();
    } catch (err: any) {
      console.error('Failed to join event:', err);
      toast.error(err.message || 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-8">
        <div className="container-app mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading event details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-8">
        <div className="container-app mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
            <Link
              to="/events"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const isUpcoming = new Date(event.startDate) > new Date();
  const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8">
      <div className="container-app mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              {event.coverImage && (
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    isUpcoming
                      ? 'bg-green-100 text-green-800'
                      : isOngoing
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Past'}
                  </span>
                </div>

                <p className="text-gray-600 text-lg mb-6">{event.description}</p>

                {/* Event Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-gray-600">{formatDate(event.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-gray-600">{formatDate(event.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>

                  {event.capacity && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-gray-600">{event.capacity} people</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {event.categories && event.categories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.categories.map(category => (
                        <span key={category} className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Join this event</h3>

              {user ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleJoinEvent}
                    disabled={joining}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      joining
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {joining ? 'Joining...' : 'Join Event'}
                  </button>

                  {isUpcoming && (
                    <button
                      onClick={() => {/* Add to calendar */}}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Add to Calendar
                    </button>
                  )}

                  {isOngoing && (
                    <button
                      onClick={() => setShowCheckInModal(true)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Check In
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please log in to join this event</p>
                  <Link
                    to="/login"
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Organizer Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Event Organizer</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold">
                      O
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      Event Organizer
                    </p>
                    <p className="text-gray-600 text-sm">Contact via event platform</p>
                  </div>
                </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Event Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    event.status === 'published' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Public</span>
                  <span className={`font-medium ${event.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                    {event.isPublic ? 'Yes' : 'No'}
                  </span>
                </div>

                {event.requiresApproval && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Required</span>
                    <span className="font-medium text-orange-600">Yes</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-600">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in Modal */}
        {event && (
          <CheckInModal
            eventId={event.id}
            eventTitle={event.title}
            isOpen={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
          />
        )}
      </div>
    </div>
  );
}

