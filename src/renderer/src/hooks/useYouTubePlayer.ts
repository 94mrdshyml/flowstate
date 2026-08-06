import { useEffect, useRef, useState } from 'react'

const YT_STATE_PLAYING = 1
const YT_STATE_CUED = 5
const DEFAULT_VOLUME = 60

export interface UseYouTubePlayerResult {
  isReady: boolean
  isPlaying: boolean
  videoTitle: string | null
  volume: number
  play: () => void
  pause: () => void
  next: () => void
  previous: () => void
  setVolume: (volume: number) => void
}

function loadIframeApi(onLoaded: () => void): void {
  if (window.YT && window.YT.Player) {
    onLoaded()
    return
  }
  const existing = window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = () => {
    existing?.()
    onLoaded()
  }
  if (!document.getElementById('youtube-iframe-api')) {
    const script = document.createElement('script')
    script.id = 'youtube-iframe-api'
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  }
}

export function useYouTubePlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  playlistId: string
): UseYouTubePlayerResult {
  const playerRef = useRef<YT.Player | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME)

  useEffect(() => {
    let cancelled = false

    loadIframeApi(() => {
      if (cancelled || !containerRef.current) return
      playerRef.current = new window.YT!.Player(containerRef.current, {
        height: '0',
        width: '0',
        host: 'https://www.youtube-nocookie.com',
        playerVars: { listType: 'playlist', list: playlistId, playsinline: 1 },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume)
            setIsReady(true)
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === YT_STATE_PLAYING)
            if (event.data === YT_STATE_PLAYING || event.data === YT_STATE_CUED) {
              setVideoTitle(event.target.getVideoData()?.title ?? null)
            }
          }
        }
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId])

  return {
    isReady,
    isPlaying,
    videoTitle,
    volume,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    next: () => playerRef.current?.nextVideo(),
    previous: () => playerRef.current?.previousVideo(),
    setVolume: (next: number) => {
      setVolumeState(next)
      playerRef.current?.setVolume(next)
    }
  }
}
