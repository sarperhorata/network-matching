import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../NotificationBell';
import { useAuthStore } from '../../stores/authStore';
import { notificationsService } from '../../services/notifications.service';

jest.mock('../../stores/authStore');
jest.mock('../../services/notifications.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotificationBell', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockNotifications = [
    {
      id: '1',
      userId: 'user-123',
      type: 'match' as const,
      title: 'Yeni Eşleşme!',
      message: '%85 uyumla yeni bir eşleşmeniz var!',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user-123',
      type: 'message' as const,
      title: 'Yeni Mesaj',
      message: 'John Doe size mesaj gönderdi',
      isRead: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('should render notification bell', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });

  it('should show unread count badge', async () => {
    (notificationsService.getUnreadCount as jest.Mock).mockResolvedValue(3);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should load notifications when opened', async () => {
    (notificationsService.getUnreadCount as jest.Mock).mockResolvedValue(2);
    (notificationsService.getNotifications as jest.Mock).mockResolvedValue(
      mockNotifications,
    );

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(notificationsService.getNotifications).toHaveBeenCalledWith(20);
    });
  });

  it('should mark notification as read when clicked', async () => {
    (notificationsService.getUnreadCount as jest.Mock).mockResolvedValue(1);
    (notificationsService.getNotifications as jest.Mock).mockResolvedValue(
      mockNotifications,
    );
    (notificationsService.markAsRead as jest.Mock).mockResolvedValue({
      ...mockNotifications[0],
      isRead: true,
    });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const notification = screen.getByText('Yeni Eşleşme!');
      expect(notification).toBeInTheDocument();
    });

    const notification = screen.getByText('Yeni Eşleşme!');
    fireEvent.click(notification.closest('div')!);

    await waitFor(() => {
      expect(notificationsService.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('should mark all as read', async () => {
    (notificationsService.getUnreadCount as jest.Mock).mockResolvedValue(2);
    (notificationsService.getNotifications as jest.Mock).mockResolvedValue(
      mockNotifications,
    );
    (notificationsService.markAllAsRead as jest.Mock).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);

    await waitFor(() => {
      const markAllButton = screen.getByText(/Tümünü okundu işaretle/i);
      expect(markAllButton).toBeInTheDocument();
      fireEvent.click(markAllButton);
    });

    await waitFor(() => {
      expect(notificationsService.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('should not render if user not logged in', () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

    const { container } = render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});

