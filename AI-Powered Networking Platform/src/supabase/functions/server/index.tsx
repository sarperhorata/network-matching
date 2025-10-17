import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to verify user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/make-server-fb863e38/auth/signup', async (c) => {
  try {
    const { email, password, name, role, industry, interests, goals, profileImage } = await c.req.json();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm email since email server not configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userId = data.user.id;
    const userData = {
      id: userId,
      email,
      name,
      role: role || 'participant',
      industry: industry || '',
      interests: interests || [],
      goals: goals || [],
      profileImage: profileImage || '',
      createdAt: new Date().toISOString(),
      profileCompletion: 50,
      stats: {
        eventsAttended: 0,
        totalMatches: 0,
        acceptedMatches: 0,
        totalMeetings: 0,
      }
    };

    await kv.set(`user:${userId}`, userData);

    return c.json({ user: userData });
  } catch (error) {
    console.log(`Signup processing error: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Note: Login is handled client-side using Supabase auth
// The server only provides user data retrieval via /users/me endpoint

// ============================================================================
// USER ROUTES
// ============================================================================

app.get('/make-server-fb863e38/users/me', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const userData = await kv.get(`user:${user.id}`);
  return c.json({ user: userData });
});

app.put('/make-server-fb863e38/users/me', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const updates = await c.req.json();
    const currentData = await kv.get(`user:${user.id}`) || {};
    
    const updatedData = {
      ...currentData,
      ...updates,
      id: user.id, // Prevent ID change
    };

    // Calculate profile completion
    const fields = ['name', 'industry', 'profileImage'];
    const arrayFields = ['interests', 'goals'];
    let completed = fields.filter(f => updatedData[f]).length;
    completed += arrayFields.filter(f => updatedData[f]?.length > 0).length;
    updatedData.profileCompletion = Math.round((completed / (fields.length + arrayFields.length)) * 100);

    await kv.set(`user:${user.id}`, updatedData);

    return c.json({ user: updatedData });
  } catch (error) {
    console.log(`User update error: ${error}`);
    return c.json({ error: 'Update failed' }, 500);
  }
});

// ============================================================================
// EVENT ROUTES
// ============================================================================

app.post('/make-server-fb863e38/events', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const eventData = await c.req.json();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id: eventId,
      ...eventData,
      organizerId: user.id,
      createdAt: new Date().toISOString(),
      participants: [],
      pendingRequests: [],
      checkedInUsers: [],
    };

    await kv.set(`event:${eventId}`, event);

    // Add to organizer's events
    const organizerEvents = await kv.get(`organizer_events:${user.id}`) || [];
    organizerEvents.push(eventId);
    await kv.set(`organizer_events:${user.id}`, organizerEvents);

    return c.json({ event });
  } catch (error) {
    console.log(`Event creation error: ${error}`);
    return c.json({ error: 'Event creation failed' }, 500);
  }
});

app.get('/make-server-fb863e38/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    
    // Filter out null values and sort by date
    const validEvents = events
      .filter(e => e !== null)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return c.json({ events: validEvents });
  } catch (error) {
    console.log(`Events fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.get('/make-server-fb863e38/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    return c.json({ event });
  } catch (error) {
    console.log(`Event fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

app.post('/make-server-fb863e38/events/:id/join', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if already participant
    if (event.participants?.includes(user.id)) {
      return c.json({ error: 'Already a participant' }, 400);
    }

    // Check if already has pending request
    if (event.pendingRequests?.includes(user.id)) {
      return c.json({ error: 'Request already pending' }, 400);
    }

    // Add to pending requests
    event.pendingRequests = event.pendingRequests || [];
    event.pendingRequests.push(user.id);
    
    await kv.set(`event:${eventId}`, event);

    return c.json({ event });
  } catch (error) {
    console.log(`Join event error: ${error}`);
    return c.json({ error: 'Failed to join event' }, 500);
  }
});

app.post('/make-server-fb863e38/events/:id/approve/:userId', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const eventId = c.req.param('id');
    const targetUserId = c.req.param('userId');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if user is organizer
    if (event.organizerId !== user.id) {
      return c.json({ error: 'Only organizer can approve' }, 403);
    }

    // Move from pending to participants
    event.pendingRequests = event.pendingRequests?.filter(id => id !== targetUserId) || [];
    event.participants = event.participants || [];
    event.participants.push(targetUserId);
    
    await kv.set(`event:${eventId}`, event);

    // Update user stats
    const userData = await kv.get(`user:${targetUserId}`);
    if (userData) {
      userData.stats = userData.stats || {};
      userData.stats.eventsAttended = (userData.stats.eventsAttended || 0) + 1;
      await kv.set(`user:${targetUserId}`, userData);
    }

    return c.json({ event });
  } catch (error) {
    console.log(`Approve join error: ${error}`);
    return c.json({ error: 'Failed to approve' }, 500);
  }
});

app.post('/make-server-fb863e38/events/:id/checkin', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check if user is participant
    if (!event.participants?.includes(user.id)) {
      return c.json({ error: 'Not a participant' }, 403);
    }

    // Check if already checked in
    event.checkedInUsers = event.checkedInUsers || [];
    if (event.checkedInUsers.includes(user.id)) {
      return c.json({ error: 'Already checked in' }, 400);
    }

    event.checkedInUsers.push(user.id);
    await kv.set(`event:${eventId}`, event);

    return c.json({ event });
  } catch (error) {
    console.log(`Check-in error: ${error}`);
    return c.json({ error: 'Check-in failed' }, 500);
  }
});

// ============================================================================
// MATCHING ROUTES
// ============================================================================

app.get('/make-server-fb863e38/matches/recommendations', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { eventId } = c.req.query();
    
    if (!eventId) {
      return c.json({ error: 'Event ID required' }, 400);
    }

    const currentUser = await kv.get(`user:${user.id}`);
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Get all participants
    const participants = await Promise.all(
      (event.participants || [])
        .filter(id => id !== user.id)
        .map(id => kv.get(`user:${id}`))
    );

    // Calculate match scores
    const matches = participants
      .filter(p => p !== null)
      .map(participant => {
        let score = 0;
        const reasons = [];

        // Industry match (40 points)
        if (currentUser.industry && participant.industry === currentUser.industry) {
          score += 40;
          reasons.push(`Same industry: ${currentUser.industry}`);
        }

        // Interest overlap (30 points)
        const commonInterests = currentUser.interests?.filter(
          i => participant.interests?.includes(i)
        ) || [];
        if (commonInterests.length > 0) {
          score += Math.min(30, commonInterests.length * 10);
          reasons.push(`Common interests: ${commonInterests.slice(0, 2).join(', ')}`);
        }

        // Goal alignment (30 points)
        const commonGoals = currentUser.goals?.filter(
          g => participant.goals?.includes(g)
        ) || [];
        if (commonGoals.length > 0) {
          score += Math.min(30, commonGoals.length * 10);
          reasons.push(`Aligned goals: ${commonGoals.slice(0, 2).join(', ')}`);
        }

        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
          id: matchId,
          user: participant,
          score,
          reasons,
          eventId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      })
      .filter(m => m.score > 20) // Only show matches with score > 20
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 matches

    // Store matches
    for (const match of matches) {
      await kv.set(`match:${match.id}`, match);
    }

    return c.json({ matches });
  } catch (error) {
    console.log(`Match recommendations error: ${error}`);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

app.post('/make-server-fb863e38/matches/:id/respond', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const matchId = c.req.param('id');
    const { status } = await c.req.json(); // 'accepted' or 'declined'
    
    const match = await kv.get(`match:${matchId}`);
    if (!match) {
      return c.json({ error: 'Match not found' }, 404);
    }

    match.status = status;
    match.respondedAt = new Date().toISOString();
    
    await kv.set(`match:${matchId}`, match);

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats = userData.stats || {};
      userData.stats.totalMatches = (userData.stats.totalMatches || 0) + 1;
      if (status === 'accepted') {
        userData.stats.acceptedMatches = (userData.stats.acceptedMatches || 0) + 1;
      }
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ match });
  } catch (error) {
    console.log(`Match response error: ${error}`);
    return c.json({ error: 'Failed to respond to match' }, 500);
  }
});

// ============================================================================
// MESSAGING ROUTES
// ============================================================================

app.get('/make-server-fb863e38/conversations', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const allConversations = await kv.getByPrefix('conversation:');
    
    // Filter conversations where user is a participant
    const userConversations = allConversations
      .filter(conv => conv && conv.participants?.includes(user.id))
      .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - 
                      new Date(a.lastMessageAt || a.createdAt).getTime());

    return c.json({ conversations: userConversations });
  } catch (error) {
    console.log(`Conversations fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

app.post('/make-server-fb863e38/conversations', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { participantId } = await c.req.json();
    
    // Check if conversation already exists
    const allConversations = await kv.getByPrefix('conversation:');
    const existingConv = allConversations.find(conv => 
      conv && conv.participants?.includes(user.id) && 
      conv.participants?.includes(participantId)
    );

    if (existingConv) {
      return c.json({ conversation: existingConv });
    }

    // Create new conversation
    const convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation = {
      id: convId,
      participants: [user.id, participantId],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messages: [],
    };

    await kv.set(`conversation:${convId}`, conversation);

    return c.json({ conversation });
  } catch (error) {
    console.log(`Conversation creation error: ${error}`);
    return c.json({ error: 'Failed to create conversation' }, 500);
  }
});

app.get('/make-server-fb863e38/conversations/:id/messages', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const convId = c.req.param('id');
    const conversation = await kv.get(`conversation:${convId}`);
    
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    if (!conversation.participants?.includes(user.id)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    return c.json({ messages: conversation.messages || [] });
  } catch (error) {
    console.log(`Messages fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post('/make-server-fb863e38/conversations/:id/messages', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const convId = c.req.param('id');
    const { content } = await c.req.json();
    
    const conversation = await kv.get(`conversation:${convId}`);
    
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    if (!conversation.participants?.includes(user.id)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    conversation.messages = conversation.messages || [];
    conversation.messages.push(message);
    conversation.lastMessageAt = message.createdAt;
    
    await kv.set(`conversation:${convId}`, conversation);

    return c.json({ message });
  } catch (error) {
    console.log(`Message send error: ${error}`);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// ============================================================================
// MEETING ROUTES
// ============================================================================

app.post('/make-server-fb863e38/meetings', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const meetingData = await c.req.json();
    const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const meeting = {
      id: meetingId,
      ...meetingData,
      organizerId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`meeting:${meetingId}`, meeting);

    // Update user stats
    const userData = await kv.get(`user:${user.id}`);
    if (userData) {
      userData.stats = userData.stats || {};
      userData.stats.totalMeetings = (userData.stats.totalMeetings || 0) + 1;
      await kv.set(`user:${user.id}`, userData);
    }

    return c.json({ meeting });
  } catch (error) {
    console.log(`Meeting creation error: ${error}`);
    return c.json({ error: 'Failed to create meeting' }, 500);
  }
});

app.get('/make-server-fb863e38/meetings', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const allMeetings = await kv.getByPrefix('meeting:');
    
    // Filter meetings where user is organizer or participant
    const userMeetings = allMeetings
      .filter(meeting => meeting && (
        meeting.organizerId === user.id || 
        meeting.participantId === user.id
      ))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return c.json({ meetings: userMeetings });
  } catch (error) {
    console.log(`Meetings fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch meetings' }, 500);
  }
});

app.patch('/make-server-fb863e38/meetings/:id/status', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const meetingId = c.req.param('id');
    const { status } = await c.req.json();
    
    const meeting = await kv.get(`meeting:${meetingId}`);
    
    if (!meeting) {
      return c.json({ error: 'Meeting not found' }, 404);
    }

    if (meeting.organizerId !== user.id && meeting.participantId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    meeting.status = status;
    meeting.updatedAt = new Date().toISOString();
    
    await kv.set(`meeting:${meetingId}`, meeting);

    return c.json({ meeting });
  } catch (error) {
    console.log(`Meeting status update error: ${error}`);
    return c.json({ error: 'Failed to update meeting status' }, 500);
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

app.get('/make-server-fb863e38/analytics/user', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const userData = await kv.get(`user:${user.id}`);
    
    const analytics = {
      eventsAttended: userData?.stats?.eventsAttended || 0,
      totalMatches: userData?.stats?.totalMatches || 0,
      acceptedMatches: userData?.stats?.acceptedMatches || 0,
      totalMeetings: userData?.stats?.totalMeetings || 0,
      profileCompletion: userData?.profileCompletion || 0,
    };

    return c.json({ analytics });
  } catch (error) {
    console.log(`User analytics error: ${error}`);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

app.get('/make-server-fb863e38/analytics/event/:id', async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    if (event.organizerId !== user.id) {
      return c.json({ error: 'Unauthorized - organizer only' }, 403);
    }

    const analytics = {
      totalParticipants: event.participants?.length || 0,
      pendingRequests: event.pendingRequests?.length || 0,
      checkedInUsers: event.checkedInUsers?.length || 0,
      checkInRate: event.participants?.length > 0 
        ? Math.round((event.checkedInUsers?.length || 0) / event.participants.length * 100) 
        : 0,
    };

    return c.json({ analytics });
  } catch (error) {
    console.log(`Event analytics error: ${error}`);
    return c.json({ error: 'Failed to fetch event analytics' }, 500);
  }
});

// ============================================================================
// SEED DATA ROUTE (Development only)
// ============================================================================

app.post('/make-server-fb863e38/seed', async (c) => {
  try {
    // Define demo user data
    const demoUsersData = [
      { 
        email: 'ahmet@example.com', 
        password: 'demo123', 
        name: 'Ahmet Yılmaz',
        role: 'participant',
        industry: 'Teknoloji',
        interests: ['Yapay Zeka', 'Web Geliştirme', 'Girişimcilik'],
        goals: ['Network Genişletme', 'İş Ortağı Bulmak', 'Proje İşbirlikleri'],
        profileCompletion: 80,
        stats: {
          eventsAttended: 5,
          totalMatches: 12,
          acceptedMatches: 8,
          totalMeetings: 6,
        }
      },
      { 
        email: 'zeynep@example.com', 
        password: 'demo123', 
        name: 'Zeynep Kaya',
        role: 'organizer',
        industry: 'Finans',
        interests: ['Blockchain', 'Finans', 'Yönetim'],
        goals: ['Etkinlik Düzenleme', 'Mentorluk Vermek', 'Network Genişletme'],
        profileCompletion: 90,
        stats: {
          eventsAttended: 8,
          totalMatches: 15,
          acceptedMatches: 10,
          totalMeetings: 12,
        }
      },
      { 
        email: 'mehmet@example.com', 
        password: 'demo123', 
        name: 'Mehmet Demir',
        role: 'sponsor',
        industry: 'Pazarlama',
        interests: ['Pazarlama', 'İçerik Üretimi', 'Satış'],
        goals: ['Müşteri Bulmak', 'Teknoloji Partnerleri', 'Network Genişletme'],
        profileCompletion: 75,
        stats: {
          eventsAttended: 3,
          totalMatches: 8,
          acceptedMatches: 5,
          totalMeetings: 4,
        }
      },
      { 
        email: 'ayse@example.com', 
        password: 'demo123', 
        name: 'Ayşe Özkan',
        role: 'participant',
        industry: 'Teknoloji',
        interests: ['Veri Bilimi', 'Yapay Zeka', 'Siber Güvenlik'],
        goals: ['Mentorluk Almak', 'İş Fırsatları', 'Bilgi Paylaşımı'],
        profileCompletion: 85,
        stats: {
          eventsAttended: 6,
          totalMatches: 14,
          acceptedMatches: 9,
          totalMeetings: 7,
        }
      },
      { 
        email: 'can@example.com', 
        password: 'demo123', 
        name: 'Can Arslan',
        role: 'participant',
        industry: 'E-ticaret',
        interests: ['E-ticaret', 'Pazarlama', 'Girişimcilik'],
        goals: ['Yatırımcı Bulmak', 'Network Genişletme', 'İş Ortağı Bulmak'],
        profileCompletion: 70,
        stats: {
          eventsAttended: 4,
          totalMatches: 10,
          acceptedMatches: 6,
          totalMeetings: 5,
        }
      }
    ];

    // Create or get auth users and store their data
    const createdUserIds: string[] = [];
    const sampleUsers = [];

    for (const userData of demoUsersData) {
      let userId: string;
      
      // Try to create or get existing user
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: { name: userData.name },
        email_confirm: true,
      });

      if (createError) {
        // User might already exist, try to find them
        console.log(`User ${userData.email} might exist, fetching...`);
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.log(`Error listing users: ${listError.message}`);
          continue;
        }

        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update password for existing user
          await supabase.auth.admin.updateUserById(userId, {
            password: userData.password,
          });
        } else {
          console.log(`Could not find or create user ${userData.email}`);
          continue;
        }
      } else {
        userId = createData.user.id;
      }

      createdUserIds.push(userId);

      // Create user data object
      const userDataObject = {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        industry: userData.industry,
        interests: userData.interests,
        goals: userData.goals,
        profileImage: '',
        createdAt: new Date().toISOString(),
        profileCompletion: userData.profileCompletion,
        stats: userData.stats,
      };

      sampleUsers.push(userDataObject);
      
      // Store in KV
      await kv.set(`user:${userId}`, userDataObject);
    }

    // Make sure we have at least 5 users
    if (createdUserIds.length < 5) {
      console.log(`Only created ${createdUserIds.length} users, skipping event creation`);
      return c.json({ 
        success: true, 
        message: 'Partial seed completed - some users could not be created',
        summary: {
          users: sampleUsers.length,
          events: 0
        }
      });
    }

    // Create sample events using real user IDs
    const now = new Date();
    const [userId0, userId1, userId2, userId3, userId4] = createdUserIds;
    
    const sampleEvents = [
      {
        id: 'event_sample_1',
        title: 'İstanbul Teknoloji Zirvesi 2025',
        description: 'Türkiye\'nin en büyük teknoloji etkinliği. Yapay zeka, blockchain ve web3 konularında uzmanlarla tanışın.',
        category: 'Tech',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'İstanbul Congress Center',
        capacity: 500,
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZXxlbnwxfHx8fDE3NjA2ODA2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        organizerId: userId1, // Zeynep (organizer)
        participants: [userId0, userId3], // Ahmet, Ayşe
        pendingRequests: [userId2], // Mehmet
        checkedInUsers: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_sample_2',
        title: 'Startup Networking Gecesi',
        description: 'Girişimciler, yatırımcılar ve mentorlar bir araya geliyor. İş fikirlerinizi paylaşın, ortaklar bulun.',
        category: 'Business',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Startup House İstanbul',
        capacity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JraW5nJTIwZXZlbnR8ZW58MXx8fHwxNzYwNzMzNzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        organizerId: userId1, // Zeynep (organizer)
        participants: [userId0, userId4], // Ahmet, Can
        pendingRequests: [],
        checkedInUsers: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_sample_3',
        title: 'Fintech ve Blockchain Konferansı',
        description: 'Finans teknolojilerinin geleceği ve blockchain uygulamaları üzerine derinlemesine tartışmalar.',
        category: 'Finance',
        startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Zorlu Center PSM',
        capacity: 300,
        imageUrl: 'https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYwNjQ5NzkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        organizerId: userId1, // Zeynep (organizer)
        participants: [userId1], // Zeynep herself
        pendingRequests: [userId0, userId3], // Ahmet, Ayşe
        checkedInUsers: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_sample_4',
        title: 'Dijital Pazarlama Workshop',
        description: 'Sosyal medya pazarlama, SEO ve içerik stratejileri üzerine uygulamalı workshop.',
        category: 'Marketing',
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Impact Hub İstanbul',
        capacity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2MDY3NDI5NHww&ixlib=rb-4.1.0&q=80&w=1080',
        organizerId: userId2, // Mehmet (sponsor)
        participants: [userId2, userId4], // Mehmet, Can
        pendingRequests: [],
        checkedInUsers: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_sample_5',
        title: 'AI & Machine Learning Meetup',
        description: 'Yapay zeka ve makine öğrenmesi konularında çalışan profesyoneller için networking etkinliği.',
        category: 'Tech',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Google Campus Istanbul',
        capacity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDF8fHx8MTc2MDcwOTc5OXww&ixlib=rb-4.1.0&q=80&w=1080',
        organizerId: userId1, // Zeynep (organizer)
        participants: [userId0, userId3], // Ahmet, Ayşe
        pendingRequests: [userId4], // Can
        checkedInUsers: [],
        createdAt: new Date().toISOString(),
      }
    ];

    // Store events
    for (const event of sampleEvents) {
      await kv.set(`event:${event.id}`, event);
    }

    // Add events to organizer lists
    await kv.set(`organizer_events:${userId1}`, ['event_sample_1', 'event_sample_2', 'event_sample_3', 'event_sample_5']);
    await kv.set(`organizer_events:${userId2}`, ['event_sample_4']);

    // Create sample matches for event_sample_1
    const sampleMatches = [
      {
        id: 'match_sample_1',
        user: sampleUsers[1], // Zeynep for Ahmet
        score: 85,
        reasons: [
          'Same industry: Teknoloji',
          'Common interests: Yapay Zeka, Girişimcilik',
          'Aligned goals: Network Genişletme'
        ],
        eventId: 'event_sample_1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      },
      {
        id: 'match_sample_2',
        user: sampleUsers[3], // Ayşe for Ahmet
        score: 90,
        reasons: [
          'Same industry: Teknoloji',
          'Common interests: Yapay Zeka, Web Geliştirme',
          'Aligned goals: Bilgi Paylaşımı, Network Genişletme'
        ],
        eventId: 'event_sample_1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      },
      {
        id: 'match_sample_3',
        user: sampleUsers[0], // Ahmet for Zeynep
        score: 85,
        reasons: [
          'Common interests: Yapay Zeka',
          'Aligned goals: Network Genişletme, Proje İşbirlikleri'
        ],
        eventId: 'event_sample_1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
      },
      {
        id: 'match_sample_4',
        user: sampleUsers[2], // Mehmet for Can
        score: 72,
        reasons: [
          'Common interests: Pazarlama, Girişimcilik',
          'Aligned goals: Network Genişletme, İş Ortağı Bulmak'
        ],
        eventId: 'event_sample_2',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    // Store matches
    for (const match of sampleMatches) {
      await kv.set(`match:${match.id}`, match);
    }

    // Create sample conversations and messages
    const sampleConversations = [
      {
        id: 'conv_sample_1',
        participants: [userId0, userId1], // Ahmet & Zeynep
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastMessageAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        messages: [
          {
            id: 'msg_sample_1',
            senderId: userId1,
            content: 'Merhaba Ahmet! Yapay zeka projelerin hakkında konuşmak isterim. Etkinlikte tanışacağımızı duydum.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg_sample_2',
            senderId: userId0,
            content: 'Merhaba Zeynep! Evet, harika olur. Özellikle makine öğrenmesi modellerinin finans sektöründe kullanımı konusunda fikir alışverişi yapabiliriz.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg_sample_3',
            senderId: userId1,
            content: 'Harika! O zaman etkinlikte kahve molasında bir araya gelelim mi?',
            createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
            read: false,
          },
        ],
      },
      {
        id: 'conv_sample_2',
        participants: [userId0, userId3], // Ahmet & Ayşe
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastMessageAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        messages: [
          {
            id: 'msg_sample_4',
            senderId: userId3,
            content: 'Selam Ahmet, veri bilimi projen çok ilginç görünüyor. Detaylarını merak ediyorum.',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg_sample_5',
            senderId: userId0,
            content: 'Teşekkürler Ayşe! Şu anda e-ticaret için öneri sistemleri üzerinde çalışıyorum. Senin siber güvenlik çalışmaların nasıl gidiyor?',
            createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg_sample_6',
            senderId: userId3,
            content: 'Çok iyi! AI ile güvenlik açıklarının tespiti konusunda bir araştırma yapıyorum. Belki işbirliği yapabiliriz.',
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
            read: false,
          },
        ],
      },
      {
        id: 'conv_sample_3',
        participants: [userId1, userId2], // Zeynep & Mehmet
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        lastMessageAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        messages: [
          {
            id: 'msg_sample_7',
            senderId: userId2,
            content: 'Merhaba Zeynep, organizasyon konusunda deneyimlerini paylaşır mısın?',
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            read: true,
          },
          {
            id: 'msg_sample_8',
            senderId: userId1,
            content: 'Tabii ki! Öncelikle hedef kitlenizi iyi tanımanız çok önemli. Pazarlama workshop\'unuz için yardımcı olabilirim.',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            read: false,
          },
        ],
      },
    ];

    // Store conversations
    for (const conv of sampleConversations) {
      await kv.set(`conversation:${conv.id}`, conv);
    }

    // Create sample meetings
    const sampleMeetings = [
      {
        id: 'meeting_sample_1',
        title: 'Proje İşbirliği Toplantısı',
        description: 'Yapay zeka projesi üzerine fikir alışverişi',
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        location: 'Online - Zoom',
        organizerId: userId0,
        participantId: userId1,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'meeting_sample_2',
        title: 'Veri Bilimi Danışmanlığı',
        description: 'E-ticaret önerileri ve güvenlik konuları',
        scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        location: 'Starbucks, Levent',
        organizerId: userId0,
        participantId: userId3,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    // Store meetings
    for (const meeting of sampleMeetings) {
      await kv.set(`meeting:${meeting.id}`, meeting);
    }

    return c.json({ 
      success: true, 
      message: 'Sample data seeded successfully',
      summary: {
        users: sampleUsers.length,
        events: sampleEvents.length,
        matches: sampleMatches.length,
        conversations: sampleConversations.length,
        meetings: sampleMeetings.length,
      }
    });
  } catch (error) {
    console.log(`Seed data error: ${error}`);
    return c.json({ error: 'Failed to seed data' }, 500);
  }
});

Deno.serve(app.fetch);
