// config.js — level data for Spot the Difference.
// Every difference is a circle in scene space (600 x 450). The scene
// drawing code in scenes.js honours the same coordinates, so a click
// inside a circle counts as finding that difference.

export const SCENE_W = 600;
export const SCENE_H = 450;

export const LEVELS = [
  {
    id: 'market',
    name: 'Lantern Night Market',
    tag: 'Easy',
    time: 180,
    seed: 11,
    blurb: 'Warm lanterns, busy stalls — 8 small things changed overnight.',
    diffs: [
      { x: 492, y: 62, r: 30, label: 'The moon' },
      { x: 280, y: 114, r: 26, label: 'Middle lantern' },
      { x: 132, y: 268, r: 24, label: 'Apples on the stall' },
      { x: 528, y: 392, r: 26, label: 'The cat' },
      { x: 300, y: 176, r: 30, label: 'The hanging sign' },
      { x: 176, y: 90, r: 14, label: 'A string bulb' },
      { x: 84, y: 168, r: 26, label: 'The carp windsock' },
      { x: 476, y: 290, r: 26, label: 'Candied hawthorn sticks' },
    ],
  },
  {
    id: 'koi',
    name: 'Koi Pond Garden',
    tag: 'Medium',
    time: 150,
    seed: 23,
    blurb: 'Still water, drifting koi — 8 quiet changes under the leaves.',
    diffs: [
      { x: 200, y: 262, r: 28, label: 'A koi fish' },
      { x: 420, y: 330, r: 24, label: 'The lily flower' },
      { x: 150, y: 362, r: 22, label: 'A pond rock' },
      { x: 300, y: 144, r: 22, label: 'A bridge plank' },
      { x: 70, y: 120, r: 24, label: 'A bamboo stalk' },
      { x: 520, y: 180, r: 26, label: 'The stone lantern' },
      { x: 380, y: 118, r: 20, label: 'The dragonfly' },
      { x: 470, y: 362, r: 24, label: 'The frog' },
    ],
  },
  {
    id: 'observatory',
    name: 'Midnight Observatory',
    tag: 'Hard',
    time: 120,
    seed: 37,
    blurb: 'Dark glass, glowing spores — 8 tiny changes in the dark.',
    diffs: [
      { x: 480, y: 90, r: 32, label: "The ringed planet" },
      { x: 270, y: 240, r: 28, label: 'The telescope' },
      { x: 440, y: 380, r: 24, label: 'A glowing mushroom' },
      { x: 345, y: 372, r: 18, label: 'A console light' },
      { x: 120, y: 80, r: 18, label: 'A star' },
      { x: 520, y: 320, r: 22, label: 'A potted flower' },
      { x: 150, y: 260, r: 24, label: 'The dome window' },
      { x: 90, y: 140, r: 26, label: 'The comet' },
    ],
  },
];

export const HINTS_PER_LEVEL = 3;
export const HINT_COOLDOWN_MS = 8000;
export const TIME_BONUS_PER_FIND = 5;
export const MISS_TIME_PENALTY = 5;
export const POINTS_PER_FIND = 100;
