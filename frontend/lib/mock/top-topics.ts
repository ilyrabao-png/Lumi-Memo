/**
 * MOCK: topical mastery rows when user has fewer than 3 real lessons to visualize.
 */
export type TopTopic = {
  id: string;
  name: string;
  mastery: number;
};

export const MOCK_TOP_TOPICS: TopTopic[] = [
  { id: "m1", name: "Daily recall", mastery: 0.62 },
  { id: "m2", name: "Concept mapping", mastery: 0.48 },
  { id: "m3", name: "Exam sprint", mastery: 0.36 },
];
