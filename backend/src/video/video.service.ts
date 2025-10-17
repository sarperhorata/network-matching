import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from '../meetings/entities/meeting.entity';

/**
 * Video Call Service
 * Integrates with Jitsi Meet for video conferencing
 * 
 * Setup Options:
 * 1. Use Jitsi Meet (Free, open-source)
 * 2. Use Agora.io (Paid, better quality)
 * 3. Use Daily.co (Good balance)
 */

export interface CreateVideoRoomDto {
  meetingId: string;
  roomName: string;
  moderatorName: string;
  participantNames: string[];
}

export interface VideoRoomConfig {
  roomUrl: string;
  roomName: string;
  jwt?: string;
  config: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableRecording?: boolean;
    enableScreenSharing?: boolean;
    enableChat?: boolean;
  };
}

@Injectable()
export class VideoService {
  private readonly jitsiDomain: string;
  private readonly jitsiAppId?: string;
  private readonly jitsiSecret?: string;

  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
  ) {
    // Configuration
    this.jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    this.jitsiAppId = process.env.JITSI_APP_ID;
    this.jitsiSecret = process.env.JITSI_SECRET;
  }

  /**
   * Create video room for meeting
   */
  async createVideoRoom(dto: CreateVideoRoomDto): Promise<VideoRoomConfig> {
    const meeting = await this.meetingRepository.findOne({
      where: { id: dto.meetingId },
      relations: ['participant1', 'participant2', 'event'],
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Generate unique room name
    const roomName = this.generateRoomName(dto.meetingId);

    // Generate JWT token for moderator (if using secured Jitsi)
    const jwt = this.jitsiSecret ? this.generateJitsiJWT(dto.moderatorName, roomName) : undefined;

    const roomUrl = `https://${this.jitsiDomain}/${roomName}`;

    return {
      roomUrl,
      roomName,
      jwt,
      config: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableRecording: true,
        enableScreenSharing: true,
        enableChat: true,
      },
    };
  }

  /**
   * Generate unique room name
   */
  private generateRoomName(meetingId: string): string {
    // Create URL-safe room name
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `oniki-${meetingId}-${timestamp}-${random}`;
  }

  /**
   * Generate Jitsi JWT token (for secured instances)
   */
  private generateJitsiJWT(userName: string, roomName: string): string | undefined {
    if (!this.jitsiAppId || !this.jitsiSecret) {
      return undefined;
    }

    // This is a placeholder. In production, use jsonwebtoken library
    // Uncomment when ready:
    /*
    const jwt = require('jsonwebtoken');
    
    const payload = {
      context: {
        user: {
          name: userName,
          avatar: '', // Optional
          email: '', // Optional
          id: '', // Optional
        },
        features: {
          livestreaming: false,
          recording: true,
          transcription: false,
        },
      },
      aud: this.jitsiAppId,
      iss: this.jitsiAppId,
      sub: this.jitsiDomain,
      room: roomName,
      moderator: true,
    };

    return jwt.sign(payload, this.jitsiSecret, {
      algorithm: 'HS256',
      expiresIn: '2h',
    });
    */

    return undefined;
  }

  /**
   * Get room info
   */
  async getRoomInfo(meetingId: string): Promise<VideoRoomConfig | null> {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
      relations: ['participant1', 'participant2'],
    });

    if (!meeting) {
      return null;
    }

    const roomName = this.generateRoomName(meetingId);
    const roomUrl = `https://${this.jitsiDomain}/${roomName}`;

    return {
      roomUrl,
      roomName,
      config: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableRecording: true,
        enableScreenSharing: true,
        enableChat: true,
      },
    };
  }

  /**
   * End video call
   */
  async endVideoCall(meetingId: string): Promise<void> {
    // Update meeting status
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });

    if (meeting) {
      // Mark meeting as completed
      console.log(`Video call ended for meeting: ${meetingId}`);
    }
  }

  /**
   * Get Jitsi configuration for frontend
   */
  getJitsiConfig(): {
    domain: string;
    options: {
      roomName: string;
      width: string;
      height: string;
      parentNode: string;
      configOverwrite: any;
      interfaceConfigOverwrite: any;
    };
  } {
    return {
      domain: this.jitsiDomain,
      options: {
        roomName: '',
        width: '100%',
        height: '100%',
        parentNode: 'jitsi-container',
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          enableWelcomePage: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'stats',
            'shortcuts',
            'tileview',
            'help',
          ],
        },
      },
    };
  }
}

