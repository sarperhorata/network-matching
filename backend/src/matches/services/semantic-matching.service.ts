import { Injectable } from '@nestjs/common';

/**
 * NLP-based Semantic Matching Service
 * Uses text similarity algorithms to match users based on their bios and interests
 */
@Injectable()
export class SemanticMatchingService {
  private readonly stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our',
    'their', 'this', 'that', 'these', 'those',
  ]);

  /**
   * Tokenize and clean text
   */
  private tokenize(text: string): string[] {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word));
  }

  /**
   * Calculate TF (Term Frequency)
   */
  private calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const totalTokens = tokens.length;

    tokens.forEach((token) => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    // Normalize by total tokens
    tf.forEach((count, term) => {
      tf.set(term, count / totalTokens);
    });

    return tf;
  }

  /**
   * Calculate IDF (Inverse Document Frequency)
   * Simplified version - in production, this would use a larger corpus
   */
  private calculateIDF(
    documents: string[][],
    term: string,
  ): number {
    const docsWithTerm = documents.filter((doc) =>
      doc.includes(term),
    ).length;

    if (docsWithTerm === 0) return 0;

    return Math.log(documents.length / docsWithTerm);
  }

  /**
   * Calculate TF-IDF vector for a document
   */
  private calculateTFIDF(
    tokens: string[],
    allDocuments: string[][],
  ): Map<string, number> {
    const tf = this.calculateTF(tokens);
    const tfidf = new Map<string, number>();

    tf.forEach((tfValue, term) => {
      const idf = this.calculateIDF(allDocuments, term);
      tfidf.set(term, tfValue * idf);
    });

    return tfidf;
  }

  /**
   * Calculate cosine similarity between two TF-IDF vectors
   */
  private cosineSimilarity(
    vector1: Map<string, number>,
    vector2: Map<string, number>,
  ): number {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Get all unique terms
    const allTerms = new Set([
      ...vector1.keys(),
      ...vector2.keys(),
    ]);

    allTerms.forEach((term) => {
      const v1 = vector1.get(term) || 0;
      const v2 = vector2.get(term) || 0;

      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    });

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Calculate Jaccard similarity between two sets
   */
  private jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set(
      [...set1].filter((x) => set2.has(x)),
    );
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  /**
   * Calculate semantic similarity between two user profiles
   */
  calculateSemanticSimilarity(
    user1: {
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    },
    user2: {
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    },
  ): {
    score: number;
    bioSimilarity: number;
    interestsSimilarity: number;
    details: {
      commonKeywords: string[];
      uniqueUser1Keywords: string[];
      uniqueUser2Keywords: string[];
    };
  } {
    // Combine all text for each user
    const user1Text =
      `${user1.bio || ''} ${(user1.interests || []).join(' ')} ${(
        user1.industries || []
      ).join(' ')} ${(user1.networkingGoals || []).join(' ')}`;

    const user2Text =
      `${user2.bio || ''} ${(user2.interests || []).join(' ')} ${(
        user2.industries || []
      ).join(' ')} ${(user2.networkingGoals || []).join(' ')}`;

    // Tokenize
    const user1Tokens = this.tokenize(user1Text);
    const user2Tokens = this.tokenize(user2Text);

    // Calculate TF-IDF (using both documents as corpus)
    const allDocuments = [user1Tokens, user2Tokens];
    const user1TFIDF = this.calculateTFIDF(user1Tokens, allDocuments);
    const user2TFIDF = this.calculateTFIDF(user2Tokens, allDocuments);

    // Calculate cosine similarity
    const overallSimilarity = this.cosineSimilarity(user1TFIDF, user2TFIDF);

    // Calculate bio similarity separately (if bios exist)
    let bioSimilarity = 0;
    if (user1.bio && user2.bio) {
      const bio1Tokens = this.tokenize(user1.bio);
      const bio2Tokens = this.tokenize(user2.bio);

      const bioDocuments = [bio1Tokens, bio2Tokens];
      const bio1TFIDF = this.calculateTFIDF(bio1Tokens, bioDocuments);
      const bio2TFIDF = this.calculateTFIDF(bio2Tokens, bioDocuments);

      bioSimilarity = this.cosineSimilarity(bio1TFIDF, bio2TFIDF);
    }

    // Calculate interests similarity using Jaccard
    const interests1 = new Set(user1.interests || []);
    const interests2 = new Set(user2.interests || []);
    const interestsSimilarity = this.jaccardSimilarity(interests1, interests2);

    // Find common and unique keywords
    const user1Set = new Set(user1Tokens);
    const user2Set = new Set(user2Tokens);

    const commonKeywords = [...user1Set].filter((word) => user2Set.has(word));
    const uniqueUser1Keywords = [...user1Set].filter((word) => !user2Set.has(word));
    const uniqueUser2Keywords = [...user2Set].filter((word) => !user1Set.has(word));

    // Weighted final score
    const finalScore =
      overallSimilarity * 0.5 +
      bioSimilarity * 0.3 +
      interestsSimilarity * 0.2;

    return {
      score: Math.round(finalScore * 100),
      bioSimilarity: Math.round(bioSimilarity * 100),
      interestsSimilarity: Math.round(interestsSimilarity * 100),
      details: {
        commonKeywords: commonKeywords.slice(0, 10),
        uniqueUser1Keywords: uniqueUser1Keywords.slice(0, 5),
        uniqueUser2Keywords: uniqueUser2Keywords.slice(0, 5),
      },
    };
  }

  /**
   * Extract key phrases from text (simple n-gram extraction)
   */
  extractKeyPhrases(text: string, topN: number = 5): string[] {
    if (!text) return [];

    const tokens = this.tokenize(text);
    if (tokens.length < 2) return tokens;

    // Generate bigrams and trigrams
    const phrases: string[] = [];

    // Bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
    }

    // Trigrams
    for (let i = 0; i < tokens.length - 2; i++) {
      phrases.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
    }

    // Count frequency
    const phraseCount = new Map<string, number>();
    phrases.forEach((phrase) => {
      phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1);
    });

    // Return top N most frequent phrases
    return Array.from(phraseCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([phrase]) => phrase);
  }

  /**
   * Calculate semantic match score between two users
   * Returns a score from 0-100
   */
  calculateSemanticMatchScore(
    user1: {
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    },
    user2: {
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    },
  ): {
    score: number;
    reasons: string[];
  } {
    const similarity = this.calculateSemanticSimilarity(user1, user2);

    const reasons: string[] = [];

    if (similarity.bioSimilarity > 50) {
      reasons.push(`High bio similarity (${similarity.bioSimilarity}%)`);
    }

    if (similarity.interestsSimilarity > 50) {
      reasons.push(
        `Strong interest overlap (${similarity.interestsSimilarity}%)`,
      );
    }

    if (similarity.details.commonKeywords.length > 0) {
      reasons.push(
        `Common keywords: ${similarity.details.commonKeywords.slice(0, 3).join(', ')}`,
      );
    }

    return {
      score: similarity.score,
      reasons,
    };
  }

  /**
   * Find semantically similar users
   */
  findSimilarUsers(
    targetUser: {
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    },
    candidates: Array<{
      id: string;
      bio?: string;
      interests?: string[];
      industries?: string[];
      networkingGoals?: string[];
    }>,
    limit: number = 10,
  ): Array<{ userId: string; score: number; reasons: string[] }> {
    const results = candidates.map((candidate) => {
      const matchResult = this.calculateSemanticMatchScore(
        targetUser,
        candidate,
      );

      return {
        userId: candidate.id,
        score: matchResult.score,
        reasons: matchResult.reasons,
      };
    });

    return results
      .filter((r) => r.score > 20) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

