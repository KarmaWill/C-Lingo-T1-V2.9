export type FmTrack = {
  id: string
  title: string
  cover: string
  audio: string
}

export type FmAlbum = {
  id: string
  title: string
  artist: string
  cover: string
  tracks: readonly FmTrack[]
}

const ARTIST = 'By C-Lingo'

export const FM_ALBUMS: readonly FmAlbum[] = [
  {
    id: 'beyond',
    title: 'Beyond Language',
    artist: ARTIST,
    cover: '/images/fm/beyond-language.png',
    tracks: [
      {
        id: 'beyond-language',
        title: 'Beyond Language',
        cover: '/images/fm/beyond-language.png',
        audio: '/fm/beyond-language.mp3',
      },
    ],
  },
  {
    id: 'lumi',
    title: 'Lumi-Nation',
    artist: ARTIST,
    cover: '/images/fm/lumi-nation.png',
    tracks: [
      {
        id: 'lumi-nation-op',
        title: 'Lumi-Nation',
        cover: '/images/fm/lumi-nation.png',
        audio: '/fm/lumi-nation-op.mp3',
      },
    ],
  },
  {
    id: 'hsk-flow',
    title: 'HSK Flow',
    artist: ARTIST,
    cover: '/images/fm/hsk-flow.png',
    tracks: [
      {
        id: 'hsk3',
        title: 'HSK Flow',
        cover: '/images/fm/hsk-flow.png',
        audio: '/fm/hsk3.mp3',
      },
    ],
  },
]
