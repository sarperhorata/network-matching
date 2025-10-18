import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelInfo } from './entities/travel-info.entity';

export interface TravelMatch {
  user: any;
  matchType: 'same_flight' | 'same_day' | 'same_city' | 'accommodation' | 'transport' | 'dinner' | 'city_tour';
  details: string;
  similarity: number;
}

@Injectable()
export class TravelBuddyService {
  constructor(
    @InjectRepository(TravelInfo)
    private travelInfoRepository: Repository<TravelInfo>,
  ) {}

  /**
   * Save user travel information
   */
  async saveTravelInfo(userId: string, eventId: string, travelData: Partial<TravelInfo>): Promise<TravelInfo> {
    let travelInfo = await this.travelInfoRepository.findOne({
      where: { userId, eventId },
    });

    if (travelInfo) {
      Object.assign(travelInfo, travelData);
    } else {
      travelInfo = this.travelInfoRepository.create({
        userId,
        eventId,
        ...travelData,
      });
    }

    return this.travelInfoRepository.save(travelInfo);
  }

  /**
   * Find travel buddies for a user
   */
  async findTravelBuddies(userId: string, eventId: string): Promise<TravelMatch[]> {
    const userTravel = await this.travelInfoRepository.findOne({
      where: { userId, eventId },
      relations: ['user'],
    });

    if (!userTravel) {
      return [];
    }

    const allTravelers = await this.travelInfoRepository.find({
      where: { eventId },
      relations: ['user'],
    });

    const matches: TravelMatch[] = [];

    for (const other of allTravelers) {
      if (other.userId === userId) continue;

      // Same flight
      if (
        userTravel.flightNumber &&
        other.flightNumber &&
        userTravel.flightNumber === other.flightNumber
      ) {
        matches.push({
          user: other.user,
          matchType: 'same_flight',
          details: `Same flight: ${userTravel.flightNumber}`,
          similarity: 100,
        });
      }

      // Same arrival day
      else if (
        userTravel.arrivalDate &&
        other.arrivalDate &&
        this.isSameDay(userTravel.arrivalDate, other.arrivalDate)
      ) {
        matches.push({
          user: other.user,
          matchType: 'same_day',
          details: `Arriving same day: ${userTravel.arrivalDate.toLocaleDateString()}`,
          similarity: 90,
        });
      }

      // Same departure city
      else if (
        userTravel.departureCity &&
        other.departureCity &&
        userTravel.departureCity.toLowerCase() === other.departureCity.toLowerCase()
      ) {
        matches.push({
          user: other.user,
          matchType: 'same_city',
          details: `Both from ${userTravel.departureCity}`,
          similarity: 80,
        });
      }

      // Looking for roommate
      if (
        userTravel.lookingForRoommate &&
        other.lookingForRoommate &&
        this.isSameDay(userTravel.arrivalDate, other.arrivalDate)
      ) {
        matches.push({
          user: other.user,
          matchType: 'accommodation',
          details: 'Both looking for roommate',
          similarity: 95,
        });
      }

      // Transport sharing
      if (
        userTravel.willingToShareTransport &&
        other.needsTransport &&
        this.isSameDay(userTravel.arrivalDate, other.arrivalDate)
      ) {
        matches.push({
          user: other.user,
          matchType: 'transport',
          details: 'Can share transport from airport',
          similarity: 85,
        });
      }

      // Dinner interest
      if (userTravel.interestedInDinner && other.interestedInDinner) {
        matches.push({
          user: other.user,
          matchType: 'dinner',
          details: 'Both interested in dinner before/after event',
          similarity: 70,
        });
      }

      // City tour
      if (userTravel.interestedInCityTour && other.interestedInCityTour) {
        matches.push({
          user: other.user,
          matchType: 'city_tour',
          details: 'Both want to explore the city',
          similarity: 70,
        });
      }
    }

    // Remove duplicates and sort by similarity
    const uniqueMatches = this.removeDuplicateUsers(matches);
    return uniqueMatches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Remove duplicate users, keeping highest similarity match
   */
  private removeDuplicateUsers(matches: TravelMatch[]): TravelMatch[] {
    const seen = new Map<string, TravelMatch>();
    
    for (const match of matches) {
      const existing = seen.get(match.user.id);
      if (!existing || match.similarity > existing.similarity) {
        seen.set(match.user.id, match);
      }
    }

    return Array.from(seen.values());
  }
}

