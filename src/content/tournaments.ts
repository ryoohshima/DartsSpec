export type Tournament = {
  id: string
  title: string
  tour: 'JAPAN' | 'PERFECT'
  date: string
  prefecture: string
  venue: string
  source: string
  checkedOn: string
}

// shortcut: 運営が確認した大会のみ収録。掲載件数が増えて更新が追いつかなくなったらCMSを検討する。
export const TOURNAMENTS: Tournament[] = [
  { id: 'perfect-2026-17', title: 'PERFECT 2026 第17戦 横浜', tour: 'PERFECT', date: '2026-10-31', prefecture: '神奈川県', venue: 'パシフィコ横浜', source: 'https://www.prodarts.jp/schedule/', checkedOn: '2026-11-25' },
  { id: 'japan-2026-14', title: 'JAPAN 2026 STAGE14 北海道', tour: 'JAPAN', date: '2026-11-08', prefecture: '北海道', venue: 'アクセスサッポロ', source: 'https://japanprodarts.jp/', checkedOn: '2026-11-25' },
  { id: 'perfect-2026-18', title: 'PERFECT 2026 第18戦 茨城', tour: 'PERFECT', date: '2026-11-28', prefecture: '茨城県', venue: '坂東市LIXIL総合体育館', source: 'https://www.prodarts.jp/schedule/', checkedOn: '2026-11-25' },
  { id: 'japan-2026-15', title: 'JAPAN 2026 STAGE15 広島', tour: 'JAPAN', date: '2026-12-12', prefecture: '広島県', venue: '広島市中小企業会館', source: 'https://japanprodarts.jp/2026/stage15.php', checkedOn: '2026-11-25' },
  { id: 'japan-2026-16', title: 'JAPAN 2026 STAGE16 宮城', tour: 'JAPAN', date: '2026-12-19', prefecture: '宮城県', venue: '夢メッセみやぎ（展示ホールAB）', source: 'https://japanprodarts.jp/2026/stage16.php', checkedOn: '2026-11-25' },
  { id: 'perfect-2026-final', title: 'PERFECT 2026 最終戦 横浜', tour: 'PERFECT', date: '2026-12-19', prefecture: '神奈川県', venue: 'パシフィコ横浜', source: 'https://www.prodarts.jp/schedule/', checkedOn: '2026-11-25' },
  { id: 'japan-2026-17', title: 'JAPAN 2026 STAGE17 静岡', tour: 'JAPAN', date: '2027-02-13', prefecture: '静岡県', venue: 'ツインメッセ静岡', source: 'https://japanprodarts.jp/', checkedOn: '2026-11-25' },
  { id: 'japan-2026-18', title: 'JAPAN 2026 STAGE18 千葉', tour: 'JAPAN', date: '2027-03-20', prefecture: '千葉県', venue: '幕張メッセ', source: 'https://japanprodarts.jp/', checkedOn: '2026-11-25' },
]
