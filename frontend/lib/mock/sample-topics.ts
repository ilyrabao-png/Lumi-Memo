/**
 * MOCK: sample topic cards for Home when user has no lessons yet.
 */
export type SampleTopic = {
  id: string;
  title: string;
  subtitle: string;
  accent: "orange" | "blue" | "brown";
};

export const MOCK_SAMPLE_TOPICS: SampleTopic[] = [
  {
    id: "s1",
    title: "Photosynthesis basics",
    subtitle: "Biology · 6 min read",
    accent: "orange",
  },
  {
    id: "s2",
    title: "French greetings",
    subtitle: "Language · quick primer",
    accent: "blue",
  },
  {
    id: "s3",
    title: "Momentum in motion",
    subtitle: "Physics · core ideas",
    accent: "brown",
  },
];
