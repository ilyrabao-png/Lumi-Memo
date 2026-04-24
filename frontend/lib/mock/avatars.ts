/**
 * MOCK: avatar gallery — replace when backend exists.
 */
export type AvatarItem = {
  id: string;
  label: string;
  emoji: string;
  unlocked: boolean;
  selected: boolean;
};

export const MOCK_AVATARS: AvatarItem[] = [
  { id: "fox", label: "Fox", emoji: "🦊", unlocked: true, selected: true },
  { id: "squirrel", label: "Squirrel", emoji: "🐿️", unlocked: true, selected: false },
  { id: "owl", label: "Owl", emoji: "🦉", unlocked: true, selected: false },
  { id: "rabbit", label: "Rabbit", emoji: "🐰", unlocked: false, selected: false },
  { id: "turtle", label: "Turtle", emoji: "🐢", unlocked: false, selected: false },
  { id: "panda", label: "Panda", emoji: "🐼", unlocked: false, selected: false },
];
