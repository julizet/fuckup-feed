export type Category =
  | 'racism'
  | 'homophobia'
  | 'sexism'
  | 'transphobia'
  | 'ableism'
  | 'religious-discrimination'
  | 'political'
  | 'police-brutality'
  | 'workplace'
  | 'other'

export interface Post {
  id: string
  user_id: string | null
  title: string
  description: string
  image_url: string | null
  location: string | null
  category: Category
  hashtags: string[]
  vote_count: number
  created_at: string
  updated_at: string
  // client-side only
  user_voted?: boolean
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'racism', label: 'Racism', color: 'bg-red-600' },
  { value: 'homophobia', label: 'Homophobia', color: 'bg-rose-500' },
  { value: 'sexism', label: 'Sexism', color: 'bg-orange-500' },
  { value: 'transphobia', label: 'Transphobia', color: 'bg-pink-500' },
  { value: 'ableism', label: 'Ableism', color: 'bg-amber-500' },
  { value: 'religious-discrimination', label: 'Religious Discrimination', color: 'bg-yellow-600' },
  { value: 'political', label: 'Political Misconduct', color: 'bg-blue-600' },
  { value: 'police-brutality', label: 'Police Brutality', color: 'bg-slate-600' },
  { value: 'workplace', label: 'Workplace Abuse', color: 'bg-teal-600' },
  { value: 'other', label: 'Other', color: 'bg-zinc-500' },
]

export function getCategoryInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}
