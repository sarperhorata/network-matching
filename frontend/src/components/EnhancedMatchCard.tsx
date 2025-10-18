import { useState } from 'react';
import type { User } from '../types';

interface EnhancedMatchCardProps {
  user: User;
  matchScore: number;
  breakdown: {
    ruleBasedScore: number;
    semanticScore: number;
    behavioralScore: number;
    compatibilityScore: number;
  };
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
  onConnect: () => void;
  onDismiss: () => void;
}

export default function EnhancedMatchCard({
  user,
  matchScore,
  breakdown,
  reasons,
  confidence,
  onConnect,
  onDismiss,
}: EnhancedMatchCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      {/* Header with confidence badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-600">{user.position}</p>
            <p className="text-sm text-gray-500">{user.company}</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border ${getConfidenceColor(confidence)}`}
        >
          {confidence.toUpperCase()} CONFIDENCE
        </span>
      </div>

      {/* Match Score with Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">AI Match Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>
            {matchScore}%
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              matchScore >= 80
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : matchScore >= 60
                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                : matchScore >= 40
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                : 'bg-gradient-to-r from-gray-400 to-gray-600'
            }`}
            style={{ width: `${matchScore}%` }}
          ></div>
        </div>
      </div>

      {/* Match Reasons */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Why matched:</p>
        <div className="flex flex-wrap gap-2">
          {reasons.slice(0, 3).map((reason, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded-full border border-primary-200"
            >
              {reason}
            </span>
          ))}
          {reasons.length > 3 && (
            <span className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
              +{reasons.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Score Breakdown Toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full text-left text-sm text-primary-600 hover:text-primary-800 font-medium mb-3 flex items-center justify-between"
      >
        <span>View detailed breakdown</span>
        <svg
          className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Breakdown */}
      {showBreakdown && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3 animate-fadeIn">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            AI Algorithm Breakdown
          </h4>
          
          {/* Rule-based Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">
                Rule-based Match (35%)
              </span>
              <span className="text-xs font-semibold">{breakdown.ruleBasedScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${breakdown.ruleBasedScore}%` }}
              ></div>
            </div>
          </div>

          {/* Semantic Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">
                Semantic NLP (25%)
              </span>
              <span className="text-xs font-semibold">{breakdown.semanticScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${breakdown.semanticScore}%` }}
              ></div>
            </div>
          </div>

          {/* Behavioral Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">
                Behavioral Pattern (20%)
              </span>
              <span className="text-xs font-semibold">{breakdown.behavioralScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${breakdown.behavioralScore}%` }}
              ></div>
            </div>
          </div>

          {/* Compatibility Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">
                Mutual Interest (20%)
              </span>
              <span className="text-xs font-semibold">{breakdown.compatibilityScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${breakdown.compatibilityScore}%` }}
              ></div>
            </div>
          </div>

          {/* AI Badge */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-600">
              <svg className="w-4 h-4 mr-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Powered by 4 AI algorithms
            </div>
          </div>
        </div>
      )}

      {/* User Details */}
      <div className="mb-4 space-y-2">
        {user.industries && user.industries.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Industries:</p>
            <div className="flex flex-wrap gap-1">
              {user.industries.slice(0, 3).map((industry) => (
                <span
                  key={industry}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.interests && user.interests.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Interests:</p>
            <div className="flex flex-wrap gap-1">
              {user.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onConnect}
          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          Connect
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

