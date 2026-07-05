import { queryOptions } from '@tanstack/react-query'
import { getParts } from '@/server/parts'
import { getMySettings } from '@/server/settings'

/** パーツマスタはほぼ不変のため実質恒久キャッシュ（docs/04 §5.1） */
export const partsQueryOptions = queryOptions({
  queryKey: ['parts'],
  queryFn: () => getParts(),
  staleTime: Infinity,
})

export const mySettingsQueryOptions = queryOptions({
  queryKey: ['settings', 'me'],
  queryFn: () => getMySettings(),
})
