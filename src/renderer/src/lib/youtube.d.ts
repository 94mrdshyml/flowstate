declare namespace YT {
  interface VideoData {
    video_id: string
    title: string
    author: string
  }

  interface OnReadyEvent {
    target: Player
  }

  interface OnStateChangeEvent {
    target: Player
    data: number
  }

  interface PlayerOptions {
    height?: string | number
    width?: string | number
    host?: string
    playerVars?: {
      listType?: 'playlist'
      list?: string
      playsinline?: 0 | 1
      controls?: 0 | 1
    }
    events?: {
      onReady?: (event: OnReadyEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
    }
  }

  class Player {
    constructor(elementOrId: HTMLElement | string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    nextVideo(): void
    previousVideo(): void
    setVolume(volume: number): void
    getVolume(): number
    getVideoData(): VideoData
    destroy(): void
  }
}

interface Window {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}
