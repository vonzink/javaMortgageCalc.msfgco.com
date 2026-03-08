export const PROCESSING_TYPES = [
  { value: 'title', label: 'Title' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'voe', label: 'VOE' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'amc', label: 'AMC' },
  { value: 'payoffs', label: 'Payoffs' },
  { value: 'other', label: 'Other' },
] as const;

export const PROCESSING_STATUSES = [
  'ordered',
  'received',
  'reviewed',
  'cleared',
  'pending',
  'issue',
] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
] as const;
