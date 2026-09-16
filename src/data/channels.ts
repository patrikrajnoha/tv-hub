import type { Channel } from '../types'

// Keep stream URLs null until an authorized source is available.
export const channels: Channel[] = [
  {
    id: 'markiza',
    name: 'Markíza',
    playerType: 'embed',
    embedUrl: 'https://media.cms.markiza.sk/embed/markiza-live',
    allow: 'autoplay; fullscreen; encrypted-media; clipboard-read; clipboard-write',
  },
  {
    id: 'joj',
    name: 'JOJ',
    playerType: 'hls',
    streamUrl: null,
  },
  {
    id: 'test',
    name: 'HLS Test',
    playerType: 'hls',
    // Public Big Buck Bunny test stream used by the hls.js demo.
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
]

export function findChannel(channelId: string) {
  return channels.find((channel) => channel.id === channelId)
}
