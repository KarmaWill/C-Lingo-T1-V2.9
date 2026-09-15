export type FmLyricLine = {
  /** seconds from track start */
  t: number
  text: string
  textZh?: string
}

export type FmTrack = {
  id: string
  title: string
  cover: string
  audio: string
  durationSec: number
  lyrics: readonly FmLyricLine[]
}

export type FmAlbum = {
  id: string
  title: string
  artist: string
  cover: string
  year: number
  genre: string
  blurb: string
  tracks: readonly FmTrack[]
}

export type FmShelf = {
  id: string
  title: string
  albumIds: readonly string[]
}

const ARTIST_CLINGO = 'By C-Lingo'
const ARTIST_PROMAX = 'ProMax'

const BEYOND_LYRICS: readonly FmLyricLine[] = [
  // Intro ~0–12
  { t: 0, text: 'Beyond Language', textZh: '超越语言' },
  // Verse 1 ~12–48
  { t: 12, text: 'I once thought the world was far away', textZh: '曾以为世界很遥远' },
  { t: 17, text: 'Somewhere beyond my sight', textZh: '在视线之外的那一边' },
  { t: 22, text: 'Until a stranger word', textZh: '直到一个陌生的词' },
  { t: 27, text: 'Fell like starlight into my eyes', textZh: '像星光落进我眼前' },
  { t: 32, text: 'With curious steps I move', textZh: '我带着探索的好奇' },
  { t: 37, text: 'A little closer to the unknown', textZh: '向未知再靠近一点' },
  { t: 42, text: 'Every voice I dare to speak', textZh: '每一次开口的声音' },
  { t: 47, text: 'Lets me see a little farther', textZh: '都让我看见更远' },
  // Pre-Chorus ~52–72
  { t: 52, text: 'Every sound is like a footstep', textZh: '每个声音 都像脚步' },
  { t: 57, text: 'Every line shows me more', textZh: '每句话 都让我看见更多' },
  { t: 62, text: 'I only want to know', textZh: '我只是想知道' },
  { t: 66, text: 'How far I still can go', textZh: '还能走多远' },
  // Chorus ~72–118
  { t: 72, text: 'Beyond Language', textZh: '超越语言' },
  { t: 76, text: 'To Bigger Worlds', textZh: '走向更大的世界' },
  { t: 81, text: 'Every word lights the way ahead', textZh: '每一个词 都点亮前方' },
  { t: 86, text: 'Carrying me past familiar borders', textZh: '带我越过熟悉的边界' },
  { t: 91, text: 'Starting from language', textZh: '从语言出发' },
  { t: 95, text: 'We walk toward a bigger world', textZh: '我们一起走向更大的世界' },
  { t: 100, text: 'When different hearts begin to meet', textZh: '当不同的心开始相遇' },
  { t: 105, text: 'Every voice finds its reply', textZh: '每一个声音都有了回应' },
  { t: 110, text: 'Brave enough to turn a new page', textZh: '勇敢翻开崭新的一页' },
  { t: 115, text: 'The world leans a little closer', textZh: '世界也向我们靠近一点' },
  { t: 119, text: 'Bit by bit~ bit by bit~', textZh: '一点～一点～' },
  // Verse 2 ~124–160
  { t: 124, text: 'In stories I learn to listen', textZh: '我在故事里学会倾听' },
  { t: 129, text: 'In dialogue I slowly draw near', textZh: '也在对话中慢慢靠近' },
  { t: 134, text: 'Those once-strange voices', textZh: '那些曾陌生的声音' },
  { t: 139, text: 'Take shape and find their meaning', textZh: '渐渐有了形状和意义' },
  { t: 144, text: 'Through different names and scenes', textZh: '走过不同名字和风景' },
  { t: 149, text: 'We trade each other’s eyes', textZh: '我们交换彼此的眼睛' },
  { t: 154, text: 'When I try to understand your world', textZh: '当我试着理解你的世界' },
  { t: 159, text: 'Even faraway places', textZh: '再远的远方' },
  { t: 163, text: 'We can arrive together', textZh: '也能一起抵达那里' },
  // Pre-Chorus 2 ~168–188
  { t: 168, text: 'With every new line I learn', textZh: '每学会一句' },
  { t: 172, text: 'The world opens a little wider', textZh: '世界就展开多一些' },
  { t: 177, text: 'Even if I lose the way sometimes', textZh: '就算偶尔迷失方向' },
  { t: 182, text: "It's alright", textZh: '也没关系' },
  { t: 185, text: 'There is still scenery ahead', textZh: '前方还有风景' },
  { t: 189, text: 'Waiting to be found', textZh: '等待被发现' },
  // Chorus 2 ~194–236
  { t: 194, text: 'Starting from language', textZh: '从语言出发' },
  { t: 198, text: 'Toward a bigger world', textZh: '走向更大的世界' },
  { t: 203, text: 'Every word lights the way ahead', textZh: '每一个词 都点亮前方' },
  { t: 208, text: 'Carrying me past familiar borders', textZh: '带我越过熟悉的边界' },
  { t: 213, text: 'Beyond Language', textZh: '超越语言' },
  { t: 217, text: 'To Bigger Worlds', textZh: '走向更大的世界' },
  { t: 222, text: 'When different hearts begin to meet', textZh: '当不同的心开始相遇' },
  { t: 227, text: 'Every voice finds its reply', textZh: '每一个声音都有了回应' },
  { t: 232, text: 'Brave enough to turn a new page', textZh: '勇敢翻开崭新的一页' },
  { t: 237, text: 'The world leans a little closer', textZh: '世界也向我们靠近一点' },
  { t: 241, text: 'Bit by bit~ bit by bit~', textZh: '一点～一点～' },
  // Bridging Rap ~246–268
  { t: 246, text: 'If mistakes pull me off course', textZh: '如果犯错让我偏离航线' },
  { t: 250, text: 'Try again and find the way', textZh: '那就再试一次 找回方向' },
  { t: 254, text: 'If the unknown makes my heart race', textZh: '如果未知让我心跳加快' },
  { t: 258, text: 'Maybe a new dawn is ahead', textZh: '也许新的黎明正在前方' },
  { t: 262, text: 'No road must be walked alone', textZh: '没有一条路只能独自走' },
  { t: 266, text: 'No voice must stay silent', textZh: '没有一种声音必须沉默' },
  { t: 270, text: 'When we choose to hear each other', textZh: '当我们愿意彼此听见' },
  { t: 274, text: 'A bigger world', textZh: '更大的世界' },
  { t: 277, text: 'Opens to us right now', textZh: '就在此刻向我们打开' },
  // Build-up ~280–292
  { t: 280, text: 'I keep setting out with wonder', textZh: '我带着好奇继续出发' },
  { t: 284, text: 'And the wish to understand', textZh: '也带着理解彼此的愿望' },
  { t: 288, text: 'As language draws us closer', textZh: '当语言让我们慢慢靠近' },
  { t: 292, text: 'Distant worlds', textZh: '遥远的世界' },
  { t: 295, text: 'Begin to echo in time', textZh: '开始同频回响' },
  // Final Chorus ~298–307 (compress remaining)
  { t: 298, text: 'From one word', textZh: '从一个词' },
  { t: 301, text: 'To a wider sky', textZh: '到更辽阔的天空' },
  { t: 304, text: 'Beyond Language — To Bigger Worlds', textZh: '超越语言 · 走向更大的世界' },
  { t: 307, text: 'Bigger Worlds', textZh: '更大的世界' },
]

const LUMI_LYRICS: readonly FmLyricLine[] = [
  // Intro ~0–10 (205s total)
  { t: 0, text: 'Welcome to C-Lingo FM', textZh: '欢迎收听 C-Lingo FM' },
  { t: 5, text: 'Tonight, keep your signal open...', textZh: '今晚，请保持你的信号畅通…' },
  // Verse 1 ~10–42
  { t: 10, text: 'I left the city after midnight', textZh: '午夜后我离开这座城市' },
  { t: 14, text: 'With no map inside my hands', textZh: '手里没有地图' },
  { t: 18, text: 'Neon rain across the window', textZh: '霓虹雨落在窗上' },
  { t: 22, text: 'Calling me to something else', textZh: '召唤我去向别处' },
  { t: 26, text: 'Then a voice came through the static', textZh: '然后一个声音穿过静电' },
  { t: 30, text: 'Like a spark across the dark', textZh: '像黑暗中的一束火花' },
  { t: 34, text: "Nora’s name became a signal", textZh: 'Nora 的名字变成信号' },
  { t: 38, text: 'C-Mark flashing in my palm', textZh: 'C-Mark 在掌心闪烁' },
  // Pre-Chorus ~42–58
  { t: 42, text: "I don’t know where this road is going", textZh: '我不知道这条路通向哪里' },
  { t: 46, text: 'But I feel it pulling me', textZh: '但我感到它在牵引我' },
  { t: 50, text: 'One more step into the unknown', textZh: '再向未知迈出一步' },
  { t: 54, text: 'One more door I need to see', textZh: '还有一扇门等我看见' },
  // Chorus ~58–86
  { t: 58, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 61, text: "We’re on our way", textZh: '我们正在路上' },
  { t: 64, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 67, text: 'Light up the gray', textZh: '点亮灰暗' },
  { t: 71, text: 'Every voice can be a signal', textZh: '每个声音都能成为信号' },
  { t: 75, text: 'Every heart can find a home', textZh: '每颗心都能找到归处' },
  { t: 79, text: 'When the night begins to open', textZh: '当夜色开始敞开' },
  { t: 83, text: 'No one has to walk alone', textZh: '没有人必须独行' },
  // Verse 2 ~86–114
  { t: 86, text: 'I took wrong turns through the static', textZh: '我在静电里走错过' },
  { t: 90, text: 'Lost the rhythm, missed the signs', textZh: '丢了节奏，错过路标' },
  { t: 94, text: 'Three sparks moving close beside me', textZh: '三束火花贴近身旁' },
  { t: 98, text: 'Keeping time with every light', textZh: '与每一道光同拍' },
  { t: 102, text: 'Different faces, different stories', textZh: '不同面孔，不同故事' },
  { t: 106, text: 'Different ways to name the sky', textZh: '用不同方式命名天空' },
  { t: 110, text: 'What was strange became a language', textZh: '陌生变成了语言' },
  { t: 114, text: 'What was distant came alive', textZh: '遥远开始鲜活' },
  // Bridge ~118–134
  { t: 118, text: 'I lost my way, but stayed in motion', textZh: '我迷过路，却仍在前进' },
  { t: 122, text: 'No perfect map, no fixed direction', textZh: '没有完美地图，也没有固定方向' },
  { t: 126, text: "I don’t need to be somebody else", textZh: '我不必成为别人' },
  { t: 130, text: 'I just need to let my signal show', textZh: '我只需要让信号亮起' },
  // Build-Up ~134–150
  { t: 134, text: 'If you hear me, send it back', textZh: '如果你听见我，请回传' },
  { t: 138, text: "If you’re searching, join the track", textZh: '如果你在寻找，就加入这条轨道' },
  { t: 142, text: 'One small light becomes a current', textZh: '一点微光汇成电流' },
  { t: 146, text: 'One more voice can change the night', textZh: '再一个声音也能改写夜晚' },
  // Final Chorus ~150–188
  { t: 150, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 153, text: "We’re on our way", textZh: '我们正在路上' },
  { t: 156, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 159, text: 'Light up the gray', textZh: '点亮灰暗' },
  { t: 163, text: 'Every voice can be a signal', textZh: '每个声音都能成为信号' },
  { t: 167, text: 'Every heart can find a home', textZh: '每颗心都能找到归处' },
  { t: 171, text: 'When our separate lights come together', textZh: '当我们各自的光聚在一起' },
  { t: 176, text: 'We become a world of our own', textZh: '我们就成为自己的世界' },
  { t: 180, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 183, text: "We’re on our way", textZh: '我们正在路上' },
  { t: 186, text: 'Lumi-Nation', textZh: 'Lumi-Nation' },
  { t: 189, text: "We’re alive today", textZh: '我们今天正活着' },
  { t: 192, text: 'No more hiding in the silence', textZh: '不再躲进沉默' },
  { t: 195, text: 'No more waiting for a sign', textZh: '不再等待一个信号' },
  { t: 198, text: 'If you bring your light beside me', textZh: '如果你把光带到我身边' },
  { t: 201, text: "I’ll bring mine", textZh: '我也带上我的' },
  // Outro ~203–205
  { t: 203, text: 'Lumi-Nation... We’re on our way...', textZh: 'Lumi-Nation… 我们正在路上…' },
  { t: 205, text: 'Keep your signal open. Lumi-Nation is calling.', textZh: '保持信号畅通。Lumi-Nation 在召唤。' },
]

const HSK_LYRICS: readonly FmLyricLine[] = [
  { t: 0, text: 'Breathe in, level one', textZh: '深呼吸，从一级开始' },
  { t: 4, text: 'Step by step into the flow', textZh: '一步一步进入节奏' },
  { t: 8, text: 'Listen close, then let it go', textZh: '仔细听，再放开手' },
  { t: 13, text: 'Answer calm, and take it slow', textZh: '冷静作答，放慢节奏' },
  { t: 18, text: 'HSK Flow', textZh: 'HSK Flow' },
  { t: 23, text: 'Keep your focus in the lane', textZh: '专注留在轨道上' },
  { t: 28, text: 'Reading clear, then write again', textZh: '读得清楚，再写一遍' },
  { t: 33, text: 'Every drill becomes a gain', textZh: '每一次练习都是收获' },
  { t: 38, text: 'Breathe out, level two', textZh: '呼气，迎向二级' },
  { t: 43, text: 'Confidence is how you grow', textZh: '自信是成长的方式' },
  { t: 48, text: 'HSK Flow', textZh: 'HSK Flow' },
  { t: 53, text: 'You already know', textZh: '你其实已经知道' },
]

export const FM_ALBUMS: readonly FmAlbum[] = [
  {
    id: 'beyond',
    title: 'Beyond Language',
    artist: ARTIST_PROMAX,
    cover: '/images/fm/beyond-language.png',
    year: 2026,
    genre: 'Pop',
    blurb:
      'An anthem for learners crossing borders—one word at a time—toward bigger worlds together.',
    tracks: [
      {
        id: 'beyond-language',
        title: 'Beyond Language',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-language.mp3',
        durationSec: 307,
        lyrics: BEYOND_LYRICS,
      },
      {
        id: 'beyond-language-x',
        title: 'Beyond Language X (feat. ProMax)',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-language-x.mp3',
        durationSec: 339,
        lyrics: BEYOND_LYRICS,
      },
      {
        id: 'beyond-language-y',
        title: 'Beyond Language Y',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-language-y.mp3',
        durationSec: 268,
        lyrics: BEYOND_LYRICS,
      },
      {
        id: 'beyond-language-z',
        title: 'Beyond Language Z',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-language-z.mp3',
        durationSec: 303,
        lyrics: BEYOND_LYRICS,
      },
      {
        id: 'beyond-from-language',
        title: '从语言起身',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-from-language.mp3',
        durationSec: 282,
        lyrics: BEYOND_LYRICS,
      },
    ],
  },
  {
    id: 'lumi',
    title: 'Lumi-Nation',
    artist: ARTIST_CLINGO,
    cover: '/images/fm/lumi-nation.png',
    year: 2026,
    genre: 'Electronic',
    blurb:
      'Keep your signal open. Nora’s call through the static—light for anyone still searching after midnight.',
    tracks: [
      {
        id: 'lumi-nation-op',
        title: 'Lumi-Nation',
        cover: '/images/fm/lumi-nation.png',
        audio: '/fm/lumi-nation-op.mp3',
        durationSec: 205,
        lyrics: LUMI_LYRICS,
      },
      {
        id: 'lumi-nation-musical',
        title: 'Lumi-Nation (Musical)',
        cover: '/images/fm/lumi-nation.png',
        audio: '/fm/lumi-nation-musical.mp3',
        durationSec: 257,
        lyrics: LUMI_LYRICS,
      },
      {
        id: 'lumi-explorer',
        title: '探索者',
        cover: '/images/fm/lumi-nation.png',
        audio: '/fm/lumi-explorer.mp3',
        durationSec: 274,
        lyrics: LUMI_LYRICS,
      },
      {
        id: 'lumi-the-explorer',
        title: 'The Explorer',
        cover: '/images/fm/lumi-nation.png',
        audio: '/fm/lumi-the-explorer.mp3',
        durationSec: 283,
        lyrics: LUMI_LYRICS,
      },
    ],
  },
  {
    id: 'hsk-flow',
    title: 'HSK Flow',
    artist: ARTIST_CLINGO,
    cover: '/images/fm/hsk-flow.png',
    year: 2026,
    genre: 'Study Beat',
    blurb:
      'Breathe in, level one. A steady study beat for drills, reading, and calm focus on exam day.',
    tracks: [
      {
        id: 'hsk3',
        title: 'HSK Flow',
        cover: '/images/fm/hsk-flow.png',
        audio: '/fm/hsk3.mp3',
        durationSec: 155,
        lyrics: HSK_LYRICS,
      },
      {
        id: 'hsk-level-one',
        title: 'Level One Breath',
        cover: '/images/fm/hsk-flow.png',
        audio: '/fm/hsk3.mp3',
        durationSec: 155,
        lyrics: HSK_LYRICS.slice(0, 8),
      },
      {
        id: 'hsk-keep-lane',
        title: 'Keep the Lane',
        cover: '/images/fm/hsk-flow.png',
        audio: '/fm/hsk3.mp3',
        durationSec: 155,
        lyrics: HSK_LYRICS.slice(4),
      },
      {
        id: 'hsk-you-know',
        title: 'You Already Know',
        cover: '/images/fm/hsk-flow.png',
        audio: '/fm/hsk3.mp3',
        durationSec: 155,
        lyrics: HSK_LYRICS.slice(6),
      },
    ],
  },
]

/** Browse shelves — same catalog, Music-style section rows */
export const FM_SHELVES: readonly FmShelf[] = [
  { id: 'listen-now', title: 'Listen Now', albumIds: ['beyond', 'lumi', 'hsk-flow'] },
  { id: 'originals', title: 'C-Lingo Originals', albumIds: ['lumi', 'beyond', 'hsk-flow'] },
  { id: 'study', title: 'Study Flow', albumIds: ['hsk-flow', 'lumi', 'beyond'] },
]

export function getFmAlbum(id: string): FmAlbum | undefined {
  return FM_ALBUMS.find((album) => album.id === id)
}

export function albumTotalSec(album: FmAlbum): number {
  return album.tracks.reduce((sum, track) => sum + track.durationSec, 0)
}

export function activeLyricIndex(lyrics: readonly FmLyricLine[], t: number): number {
  if (!lyrics.length) return -1
  let idx = 0
  for (let i = 0; i < lyrics.length; i += 1) {
    if (lyrics[i].t <= t) idx = i
    else break
  }
  return idx
}
