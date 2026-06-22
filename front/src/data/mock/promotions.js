export const promotions = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@mentix.dev',
    projects: { value: 4, required: 3, met: true },
    hearts:   { value: 14, required: 10, met: true },
    comments: { value: 6, required: 5, met: true },
    age:      { value: 41, required: 30, met: true },
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    email: 'marcus.thorne@mentix.dev',
    projects: { value: 2, required: 3, met: false },
    hearts:   { value: 11, required: 10, met: true },
    comments: { value: 5, required: 5, met: true },
    age:      { value: 52, required: 30, met: true },
  },
];

export const revokedMentors = [
  { id: 1, name: 'Liam Vance',  revokedAt: 'Oct 26, 2023 · 7:30 PM',  reason: 'Inactive for 90+ days' },
  { id: 2, name: 'Dana Ortiz',  revokedAt: 'Oct 14, 2023 · 11:05 AM', reason: 'Repeated reported content' },
];
