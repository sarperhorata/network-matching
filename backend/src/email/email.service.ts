import { Injectable } from '@nestjs/common';

/**
 * Email Service
 * 
 * Setup Instructions:
 * 1. Choose provider: SendGrid or Mailgun
 * 2. Create account and get API key
 * 3. Add to .env: EMAIL_PROVIDER_API_KEY=xxx
 * 4. Install package: npm install @sendgrid/mail OR npm install mailgun-js
 * 5. Uncomment integration code below
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@oniki.net';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Oniki Network';
  }

  /**
   * Send email (generic)
   */
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      console.log(`[Email] Sending to ${template.to}: ${template.subject}`);

      // In development, just log
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email content:', template.html);
        return true;
      }

      // SendGrid integration (uncomment when ready)
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: template.to,
        from: {
          email: template.from || this.fromEmail,
          name: this.fromName,
        },
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      */

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Welcome Email
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    verificationLink?: string,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Oniki Network! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Welcome to Oniki.net - the AI-powered professional networking platform!</p>
              
              <p>We're excited to have you join our community. Here's what you can do:</p>
              
              <ul>
                <li>✨ <strong>Complete your profile</strong> - Add your industries, interests, and networking goals</li>
                <li>🎉 <strong>Browse events</strong> - Find networking opportunities near you</li>
                <li>🤝 <strong>Get matched</strong> - Our AI will connect you with relevant professionals</li>
                <li>💬 <strong>Start networking</strong> - Message your matches and schedule meetings</li>
              </ul>
              
              ${verificationLink ? `
                <p><strong>Please verify your email address:</strong></p>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              ` : ''}
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Happy networking!<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
              <p><a href="https://oniki.net/privacy">Privacy Policy</a> | <a href="https://oniki.net/terms">Terms of Service</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Oniki Network! 🎉',
      html,
      text: `Welcome to Oniki Network, ${firstName}! Complete your profile and start networking.`,
    });
  }

  /**
   * Event Reminder Email
   */
  async sendEventReminder(
    email: string,
    firstName: string,
    event: {
      title: string;
      startDate: Date;
      location: string;
      eventUrl: string;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .event-card { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Reminder 📅</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>This is a friendly reminder about your upcoming event:</p>
              
              <div class="event-card">
                <h2>${event.title}</h2>
                <p><strong>📅 Date:</strong> ${event.startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
              </div>
              
              <p><strong>Don't forget to:</strong></p>
              <ul>
                <li>Complete your profile for better matches</li>
                <li>Review your match recommendations</li>
                <li>Check in using the QR code when you arrive</li>
              </ul>
              
              <a href="${event.eventUrl}" class="button">View Event Details</a>
              
              <p>See you there!<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Reminder: ${event.title} is coming up!`,
      html,
      text: `Hi ${firstName}, don't forget about ${event.title} on ${event.startDate.toLocaleDateString()}!`,
    });
  }

  /**
   * New Match Notification
   */
  async sendMatchNotification(
    email: string,
    firstName: string,
    match: {
      name: string;
      company: string;
      score: number;
      matchUrl: string;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .match-card { background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
            .score { font-size: 48px; font-weight: bold; color: #7C3AED; }
            .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You've Got a New Match! 🎯</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Great news! Our AI has found a highly compatible professional for you:</p>
              
              <div class="match-card">
                <h2>${match.name}</h2>
                <p><strong>${match.company}</strong></p>
                <p class="score">${match.score}%</p>
                <p style="color: #6b7280;">Match Score</p>
              </div>
              
              <p>This match was selected based on your:</p>
              <ul>
                <li>Industry alignment</li>
                <li>Shared interests</li>
                <li>Networking goals</li>
                <li>Professional background</li>
              </ul>
              
              <a href="${match.matchUrl}" class="button">View Match & Connect</a>
              
              <p>Don't wait too long - the best connections happen when you reach out first!</p>
              
              <p>Best of luck,<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
              <p><a href="#">Manage email preferences</a> | <a href="#">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `New Match: ${match.name} (${match.score}% compatibility)`,
      html,
      text: `You've been matched with ${match.name} from ${match.company}! Match score: ${match.score}%`,
    });
  }

  /**
   * Weekly Digest Email
   */
  async sendWeeklyDigest(
    email: string,
    firstName: string,
    stats: {
      newMatches: number;
      newMessages: number;
      upcomingEvents: number;
      pendingMeetings: number;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 36px; font-weight: bold; color: #F59E0B; }
            .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Weekly Network Summary 📊</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Here's what happened in your network this week:</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.newMatches}</div>
                  <div>New Matches</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.newMessages}</div>
                  <div>New Messages</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.upcomingEvents}</div>
                  <div>Upcoming Events</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.pendingMeetings}</div>
                  <div>Pending Meetings</div>
                </div>
              </div>
              
              ${stats.newMatches > 0 ? `
                <p><strong>You have ${stats.newMatches} new ${stats.newMatches === 1 ? 'match' : 'matches'}!</strong> Check them out and start connecting.</p>
              ` : ''}
              
              ${stats.newMessages > 0 ? `
                <p><strong>${stats.newMessages} unread ${stats.newMessages === 1 ? 'message' : 'messages'}</strong> waiting for your response.</p>
              ` : ''}
              
              <a href="https://oniki.net/dashboard" class="button">Go to Dashboard</a>
              
              <p>Keep building your network!<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
              <p><a href="#">Manage email preferences</a> | <a href="#">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Your Weekly Summary: ${stats.newMatches} new matches, ${stats.newMessages} messages`,
      html,
      text: `Weekly summary: ${stats.newMatches} matches, ${stats.newMessages} messages, ${stats.upcomingEvents} events`,
    });
  }

  /**
   * Meeting Confirmation Email
   */
  async sendMeetingConfirmation(
    email: string,
    firstName: string,
    meeting: {
      withPerson: string;
      scheduledTime: Date;
      location: string;
      notes?: string;
      meetingUrl: string;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .meeting-card { background: #ECFDF5; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Meeting Confirmed ✅</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Your meeting has been confirmed!</p>
              
              <div class="meeting-card">
                <h2>Meeting with ${meeting.withPerson}</h2>
                <p><strong>📅 When:</strong> ${meeting.scheduledTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
                <p><strong>📍 Where:</strong> ${meeting.location}</p>
                ${meeting.notes ? `<p><strong>📝 Notes:</strong> ${meeting.notes}</p>` : ''}
              </div>
              
              <p><strong>Meeting Tips:</strong></p>
              <ul>
                <li>Review your match's profile beforehand</li>
                <li>Prepare questions about their work and goals</li>
                <li>Be punctual and professional</li>
                <li>Follow up after the meeting!</li>
              </ul>
              
              <a href="${meeting.meetingUrl}" class="button">View Meeting Details</a>
              
              <p>Good luck with your meeting!<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Meeting Confirmed: ${meeting.withPerson} on ${meeting.scheduledTime.toLocaleDateString()}`,
      html,
      text: `Your meeting with ${meeting.withPerson} is confirmed for ${meeting.scheduledTime.toLocaleDateString()} at ${meeting.location}`,
    });
  }

  /**
   * Password Reset Email
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    resetLink: string,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>We received a request to reset your password for your Oniki Network account.</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p>This link will expire in 1 hour for security reasons.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p>Best regards,<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Oniki Network',
      html,
      text: `Hi ${firstName}, click here to reset your password: ${resetLink}`,
    });
  }

  /**
   * Event Feedback Request
   */
  async sendFeedbackRequest(
    email: string,
    firstName: string,
    event: {
      title: string;
      feedbackUrl: string;
    },
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>How was your experience? 💭</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              
              <p>Thank you for attending <strong>${event.title}</strong>!</p>
              
              <p>We'd love to hear about your experience. Your feedback helps us improve future events and the platform.</p>
              
              <p><strong>Quick questions (2 minutes):</strong></p>
              <ul>
                <li>How would you rate the event?</li>
                <li>Were your matches relevant?</li>
                <li>Did you make valuable connections?</li>
                <li>What can we improve?</li>
              </ul>
              
              <a href="${event.feedbackUrl}" class="button">Share Feedback</a>
              
              <p>Thank you for being part of our community!</p>
              
              <p>Best regards,<br>
              The Oniki Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Oniki.net. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `We'd love your feedback on ${event.title}`,
      html,
      text: `Thanks for attending ${event.title}! Please share your feedback: ${event.feedbackUrl}`,
    });
  }
}

