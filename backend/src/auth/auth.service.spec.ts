import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PARTICIPANT,
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = { id: '1', ...registerDto, password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.PARTICIPANT,
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        id: '1',
        email: loginDto.email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'participant',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw error with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should return user if validation succeeds', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        id: '1',
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});

