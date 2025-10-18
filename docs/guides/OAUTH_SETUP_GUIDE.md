# 🔐 OAuth Setup Guide - Google & LinkedIn

**Status**: Endpoints added ✅, Implementation pending ⏳  
**Estimated Time**: 2-3 hours

---

## 📋 Current Status

### ✅ Added to Backend
- `GET /api/auth/google` - OAuth initiation endpoint
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/linkedin` - LinkedIn OAuth initiation
- `GET /api/auth/linkedin/callback` - LinkedIn callback
- Swagger documentation complete

### ⏳ Pending Implementation
- Google OAuth Strategy (Passport)
- LinkedIn OAuth Strategy (Passport)
- OAuth service methods
- User entity provider field

---

## 🚀 Implementation Steps

### Step 1: Install Dependencies (5 mins)
```bash
cd /Users/sarperhorata/12net/backend

npm install passport-google-oauth20 passport-linkedin-oauth2 @types/passport-google-oauth20
```

### Step 2: Update User Entity (10 mins)

**File**: `backend/src/users/entities/user.entity.ts`

Add fields:
```typescript
@Column({ nullable: true })
provider?: string; // 'local', 'google', 'linkedin'

@Column({ nullable: true })
providerId?: string; // OAuth provider user ID

@Column({ nullable: true })
googleId?: string;

@Column({ nullable: true })
linkedinId?: string;
```

### Step 3: Create Google Strategy (30 mins)

**File**: `backend/src/common/strategies/google.strategy.ts`

```typescript
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profilePhoto: photos[0]?.value,
      provider: 'google',
    };

    // Find or create user
    const existingUser = await this.authService.findOrCreateOAuthUser(user);
    
    done(null, existingUser);
  }
}
```

### Step 4: Create LinkedIn Strategy (30 mins)

**File**: `backend/src/common/strategies/linkedin.strategy.ts`

```typescript
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get('LINKEDIN_CALLBACK_URL') || 'http://localhost:3000/api/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, emails, name, photos } = profile;

    const user = {
      linkedinId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profilePhoto: photos[0],
      provider: 'linkedin',
      linkedinUrl: `https://linkedin.com/in/${profile._json.vanityName}`,
    };

    const existingUser = await this.authService.findOrCreateOAuthUser(user);
    
    done(null, existingUser);
  }
}
```

### Step 5: Update Auth Service (45 mins)

**File**: `backend/src/auth/auth.service.ts`

Add method:
```typescript
async findOrCreateOAuthUser(oauthProfile: any) {
  const { email, googleId, linkedinId, provider, firstName, lastName, profilePhoto } = oauthProfile;

  // Find existing user by email or OAuth ID
  let user = await this.usersRepository.findOne({
    where: [
      { email },
      ...(googleId ? [{ googleId }] : []),
      ...(linkedinId ? [{ linkedinId }] : []),
    ],
  });

  if (!user) {
    // Create new user from OAuth profile
    user = this.usersRepository.create({
      email,
      firstName,
      lastName,
      provider,
      googleId,
      linkedinId,
      profilePhoto,
      role: UserRole.PARTICIPANT,
      isActive: true,
      emailVerified: true, // OAuth emails are pre-verified
    });

    await this.usersRepository.save(user);
  } else {
    // Update OAuth IDs if missing
    if (googleId && !user.googleId) {
      user.googleId = googleId;
    }
    if (linkedinId && !user.linkedinId) {
      user.linkedinId = linkedinId;
    }
    if (!user.profilePhoto && profilePhoto) {
      user.profilePhoto = profilePhoto;
    }
    await this.usersRepository.save(user);
  }

  // Generate JWT token
  const payload = { sub: user.id, email: user.email, role: user.role };
  const access_token = await this.jwtService.signAsync(payload);

  return {
    access_token,
    user,
  };
}
```

### Step 6: Update Auth Controller (15 mins)

**File**: `backend/src/auth/auth.controller.ts`

Update OAuth endpoints to use Guards:
```typescript
import { GoogleOAuthGuard } from '../common/guards/google-oauth.guard';
import { LinkedInOAuthGuard } from '../common/guards/linkedin-oauth.guard';

@Get('google')
@UseGuards(GoogleOAuthGuard)
async googleAuth() {
  // Handled by Passport
}

@Get('google/callback')
@UseGuards(GoogleOAuthGuard)
async googleAuthCallback(@Request() req, @Res() res) {
  // Redirect to frontend with token
  const { access_token, user } = req.user;
  const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
}

// Same for LinkedIn
```

### Step 7: Create OAuth Guards (20 mins)

**File**: `backend/src/common/guards/google-oauth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
```

**File**: `backend/src/common/guards/linkedin-oauth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LinkedInOAuthGuard extends AuthGuard('linkedin') {}
```

### Step 8: Register Strategies in Auth Module (10 mins)

**File**: `backend/src/auth/auth.module.ts`

```typescript
import { GoogleStrategy } from '../common/strategies/google.strategy';
import { LinkedInStrategy } from '../common/strategies/linkedin.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService, 
    JwtStrategy,
    GoogleStrategy,     // ADD
    LinkedInStrategy,   // ADD
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### Step 9: Environment Variables (5 mins)

**File**: `backend/.env`

Add:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:3000/api/auth/linkedin/callback

# Frontend URL (for OAuth redirect)
FRONTEND_URL=http://localhost:5173
```

### Step 10: Frontend OAuth Callback Page (20 mins)

**File**: `frontend/src/pages/AuthCallbackPage.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      navigate('/dashboard');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Completing authentication...</div>
    </div>
  );
}
```

Add route to `App.tsx`:
```typescript
<Route path="auth/callback" element={<AuthCallbackPage />} />
```

---

## 🔑 Getting OAuth Credentials

### Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create new project: "Oniki.net"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/google/callback
     - https://oniki-backend.onrender.com/api/auth/google/callback
5. Copy Client ID and Client Secret

### LinkedIn Developer Portal
1. Go to https://www.linkedin.com/developers
2. Create app: "Oniki.net"
3. Products: Add "Sign In with LinkedIn"
4. Auth settings:
   - Redirect URLs:
     - http://localhost:3000/api/auth/linkedin/callback
     - https://oniki-backend.onrender.com/api/auth/linkedin/callback
5. Copy Client ID and Client Secret

---

## ✅ Testing OAuth

### Local Testing
```bash
# 1. Start backend with OAuth env vars
cd backend
npm run start:dev

# 2. Visit OAuth endpoint
http://localhost:3000/api/auth/google
# Should redirect to Google login

# 3. After auth, should redirect to:
http://localhost:5173/auth/callback?token=<jwt_token>

# 4. User should be logged in
```

### Production Testing
```bash
https://oniki-backend.onrender.com/api/auth/google
https://oniki-backend.onrender.com/api/auth/linkedin
```

---

## 📊 Current Status

### ✅ Completed (This Session)
- [x] OAuth endpoints added to auth.controller.ts
- [x] Swagger documentation for OAuth
- [x] Implementation guide created
- [x] Frontend already has loginWithGoogle() method!

### ⏳ To Do (2-3 hours)
- [ ] Install passport dependencies
- [ ] Create Google + LinkedIn strategies
- [ ] Add provider field to User entity
- [ ] Implement findOrCreateOAuthUser() in AuthService
- [ ] Create OAuth guards
- [ ] Update auth.module.ts
- [ ] Create AuthCallbackPage.tsx
- [ ] Get OAuth credentials from Google/LinkedIn
- [ ] Test OAuth flow

---

## 🎯 Frontend Already Ready!

**File**: `frontend/src/services/auth.service.ts`

```typescript
async loginWithGoogle(): Promise<void> {
  window.location.href = `${api.defaults.baseURL}/auth/google`;
}
```

**Frontend just needs**:
1. AuthCallbackPage.tsx (20 mins)
2. OAuth buttons on Login/Register pages
3. Route for `/auth/callback`

**That's it!** Backend will handle the rest.

---

## 💡 Quick Implementation (If Needed Now)

### Fastest Path (2 hours):
1. `npm install` dependencies (5 mins)
2. Create strategies (30 mins - copy/paste code above)
3. Create guards (10 mins)
4. Update auth.module.ts (10 mins)
5. Update User entity (10 mins)
6. Add findOrCreateOAuthUser to AuthService (30 mins)
7. Create AuthCallbackPage.tsx (20 mins)
8. Test! (15 mins)

### Or: Deploy Later (Recommended)
- Deploy current version without OAuth
- Add OAuth during beta testing
- Users can still register with email/password
- Add OAuth based on user demand

---

**Recommendation**: Add OAuth after initial deployment, during beta testing phase. Email/password auth works perfectly for MVP! ✅

