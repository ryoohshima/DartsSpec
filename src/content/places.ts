export const PLACES_CHECKED_ON = '2026-11-25'

export const PLACE_SEARCHES = [
  {
    name: 'DARTSLIVE SEARCH', machine: 'DARTSLIVE',
    description: 'ダーツライブ設置店を探す公式検索。行きたいエリアや設置機種などの条件からお店を探せます。',
    url: 'https://search.dartslive.com/jp/',
  },
  {
    name: 'PHOENIXDARTS 店舗検索', machine: 'PHOENIXDARTS',
    description: 'フェニックス設置店を探す公式検索。都道府県や設置機種などを指定して検索できます。',
    url: 'https://vs.phoenixdarts.com/jp/shop/shopSearch_terms',
  },
] as const

export const PLACE_CHECKLIST = [
  { title: '遊びたい機種', body: '使っているカードに対応する機種や、練習したいボードがあるかを確認しましょう。スティールダーツは対応店舗へ直接確認を。' },
  { title: '料金の仕組み', body: 'ゲーム代のほか、チャージ・ドリンク注文・時間料金があるかを店舗の案内で確認しましょう。' },
  { title: '営業時間と利用条件', body: '臨時休業、貸切、年齢制限、喫煙環境は来店前に店舗の最新案内を確認しましょう。' },
  { title: '初めてでも遊べるか', body: '貸しダーツの有無や操作の説明を受けられるかを確認すると、道具がなくても遊び始めやすくなります。' },
] as const
