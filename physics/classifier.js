/**
 * Physics Topic Classifier for PhysiViz AI
 * Uses a heuristic rule-based keyword counting system to detect the most relevant
 * physics topic from a preprocessed clean text or token set.
 */

import { knowledgeBase } from "../knowledge/knowledgeBase.js";

/**
 * Detects the most appropriate physics topic for a given preprocessed problem text.
 * @param {string} cleanText - The normalized, lowercase problem text.
 * @returns {string} - The detected topic ID ('glbb', 'parabola', 'newton', etc.) or 'UNKNOWN'.
 */
export const detectPhysicsTopic = (cleanText) => {
  if (!cleanText) {
    return "UNKNOWN";
  }

  const scores = {};

  // Score each topic in our knowledge base
  Object.entries(knowledgeBase).forEach(([topicId, topicData]) => {
    scores[topicId] = 0;

    topicData.keyword.forEach(keyword => {
      // If the clean text contains the keyword sequence
      if (cleanText.includes(keyword)) {
        // Give higher weight to multi-word phrases to avoid ambiguity
        const weight = keyword.includes(" ") ? 3 : 1;
        scores[topicId] += weight;
      }
    });
  });

  // Find the topic with the maximum score
  let bestTopic = "UNKNOWN";
  let maxScore = 0;

  Object.entries(scores).forEach(([topicId, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topicId;
    }
  });

  // If the max score is 0, we can't recognize it
  if (maxScore === 0) {
    return "UNKNOWN";
  }

  return bestTopic;
};
