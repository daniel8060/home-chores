// Initial hardcoded chore definitions
// owner: 'daniel' | 'crimson' | 'both' | 'flexible'
// frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
// frequencyDays: number of days before considered overdue

export const FREQUENCY_DAYS = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export const INITIAL_CHORES = [
  // Daily
  {
    id: 'litter-box',
    name: 'Litter box',
    owner: 'daniel',
    frequency: 'daily',
    notes: "Crimson covers on her days off",
  },
  {
    id: 'dishes-dishwasher',
    name: 'Dishes / dishwasher',
    owner: 'both',
    frequency: 'daily',
    notes: "Whoever didn't cook",
  },
  {
    id: 'wipe-kitchen-counters',
    name: 'Wipe kitchen counters',
    owner: 'both',
    frequency: 'daily',
    notes: 'Spot clean as needed',
  },

  // Weekly
  {
    id: 'roomba-prep-run',
    name: 'Roomba prep + run',
    owner: 'flexible',
    frequency: 'weekly',
    notes: 'Whoever has time; clear floors, run, empty bin',
  },
  {
    id: 'sweep-dry-mop',
    name: 'Sweep / dry mop',
    owner: 'daniel',
    frequency: 'weekly',
    notes: "Edges and corners Roomba can't reach",
  },
  {
    id: 'wet-mop-floors',
    name: 'Wet mop floors',
    owner: 'daniel',
    frequency: 'weekly',
    notes: 'After sweeping',
  },
  {
    id: 'wipe-flat-surfaces',
    name: 'Wipe flat surfaces',
    owner: 'crimson',
    frequency: 'weekly',
    notes: 'Coffee table, dining table, TV stand',
  },
  {
    id: 'trash-recycling',
    name: 'Trash + recycling',
    owner: 'daniel',
    frequency: 'weekly',
    notes: 'On pickup day',
  },
  {
    id: 'laundry',
    name: 'Laundry',
    owner: 'both',
    frequency: 'weekly',
    notes: '',
  },
  {
    id: 'wipe-stovetop-microwave',
    name: 'Wipe stovetop + microwave',
    owner: 'crimson',
    frequency: 'weekly',
    notes: '',
  },
  {
    id: 'grocery-run',
    name: 'Grocery run',
    owner: 'both',
    frequency: 'weekly',
    notes: '',
  },
  {
    id: 'wipe-cat-food-area',
    name: 'Wipe cat food area',
    owner: 'crimson',
    frequency: 'weekly',
    notes: '',
  },

  // Bi-weekly
  {
    id: 'clean-bathroom',
    name: 'Clean bathroom',
    owner: 'both',
    frequency: 'biweekly',
    notes: '',
  },
  {
    id: 'change-bed-sheets',
    name: 'Change bed sheets',
    owner: 'both',
    frequency: 'biweekly',
    notes: '',
  },
  {
    id: 'patio-tidy-up',
    name: 'Patio tidy-up',
    owner: 'daniel',
    frequency: 'biweekly',
    notes: '',
  },

  // Monthly
  {
    id: 'deep-clean-cat-fountain',
    name: 'Deep clean cat water fountain',
    owner: 'crimson',
    frequency: 'monthly',
    notes: 'Permanent Crimson task',
  },
  {
    id: 'clean-roomba-bin-brushes',
    name: 'Clean Roomba bin + brushes',
    owner: 'daniel',
    frequency: 'monthly',
    notes: 'Full maintenance, not just emptying',
  },
  {
    id: 'wipe-baseboards',
    name: 'Wipe baseboards',
    owner: 'daniel',
    frequency: 'monthly',
    notes: '',
  },
  {
    id: 'clean-inside-fridge',
    name: 'Clean inside fridge',
    owner: 'both',
    frequency: 'monthly',
    notes: '',
  },
  {
    id: 'clean-oven-dishwasher-interior',
    name: 'Clean oven + dishwasher interior',
    owner: 'daniel',
    frequency: 'monthly',
    notes: '',
  },
  {
    id: 'wipe-light-switches-door-handles',
    name: 'Wipe light switches + door handles',
    owner: 'crimson',
    frequency: 'monthly',
    notes: '',
  },
];

export const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};

export const FREQUENCY_ORDER = ['daily', 'weekly', 'biweekly', 'monthly'];
