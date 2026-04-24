/**
 * MOCK: weekly leaderboard — replace when backend exists.
 */
export type LeaderboardRow = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
  isYou?: boolean;
};

export const MOCK_LEADERBOARD: LeaderboardRow[] = [
  { id: "1", name: "Aurora", avatar: "🦊", xp: 8420, level: 12, streak: 18, rank: 1 },
  { id: "2", name: "River", avatar: "🐿️", xp: 7980, level: 11, streak: 12, rank: 2 },
  { id: "3", name: "Nova", avatar: "🦉", xp: 7610, level: 11, streak: 9, rank: 3 },
  { id: "4", name: "Kai", avatar: "🐢", xp: 6540, level: 10, streak: 21, rank: 4 },
  { id: "5", name: "Mira", avatar: "🐰", xp: 6120, level: 9, streak: 7, rank: 5 },
  { id: "6", name: "Sol", avatar: "🐼", xp: 5880, level: 9, streak: 5, rank: 6 },
];
