export type IconName =
  | 'tv'
  | 'search'
  | 'film'
  | 'series'
  | 'shows'
  | 'play'
  | 'hockey'
  | 'bookmark'
  | 'back'

interface LauncherBase {
  id: string
  label: string
  icon?: IconName
  accent: string
  visible?: boolean
  variant?: 'secondary'
}

export interface ExternalLauncher extends LauncherBase {
  type: 'external'
  url: string
}

export interface InternalLauncher extends LauncherBase {
  type: 'internal'
  route: string
}

export interface ChannelLauncher extends LauncherBase {
  type: 'channel'
  route: string
  channelId: string
}

export type Launcher = ExternalLauncher | InternalLauncher | ChannelLauncher

export interface CollectionItem {
  id: string
  name: string
  url: string
}

export interface HlsChannel {
  id: string
  name: string
  playerType: 'hls'
  streamUrl: string | null
}

export interface EmbedChannel {
  id: string
  name: string
  playerType: 'embed'
  embedUrl: string
  allow?: string
}

export type Channel = HlsChannel | EmbedChannel
