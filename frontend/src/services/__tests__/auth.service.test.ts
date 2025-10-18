import { authService } from '../auth.service';
import api from '../api';

jest.mock('../api');

describe('authService', () => {
  const mockedApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'participant' as const,
      };

      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: {
            id: '1',
            email: registerData.email,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role: registerData.role,
          },
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await authService.register(registerData);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should throw error on registration failure', async () => {
      mockedApi.post.mockRejectedValue(new Error('Registration failed'));

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'participant',
        }),
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: {
            id: '1',
            email: loginData.email,
            firstName: 'Test',
            lastName: 'User',
          },
        },
      };

      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await authService.login(loginData);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should throw error on login failure', async () => {
      mockedApi.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear token from localStorage', () => {
      localStorage.setItem('token', 'test-token');

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      mockedApi.get.mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(mockedApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not authenticated', async () => {
      mockedApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'test-token');

      const token = authService.getToken();

      expect(token).toBe('test-token');
    });

    it('should return null if no token', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });
});

