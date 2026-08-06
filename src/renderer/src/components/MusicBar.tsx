import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, VolumeIcon } from './icons'
import { MUSIC_PLAYLISTS } from '../lib/musicPlaylists'
import type { UseYouTubePlayerResult } from '../hooks/useYouTubePlayer'
import type { PhaseTheme } from '../lib/theme'

interface MusicBarProps {
  theme: PhaseTheme
  playlistId: string
  onPlaylistChange: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  music: UseYouTubePlayerResult
}

function MusicBar({
  theme,
  playlistId,
  onPlaylistChange,
  containerRef,
  music
}: MusicBarProps): React.JSX.Element {
  const { isReady, isPlaying, videoTitle, volume, play, pause, next, previous, setVolume } = music

  const transportButtonClass = `flex h-7 w-7 items-center justify-center ${theme.text} hover:opacity-70 disabled:opacity-30 disabled:hover:opacity-30`

  return (
    <div className={`flex items-center gap-4 border-b px-9 py-2.5 ${theme.divider}`}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={previous}
          disabled={!isReady}
          aria-label="Previous track"
          className={transportButtonClass}
        >
          <SkipBackIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={isPlaying ? pause : play}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={`flex h-8 w-8 items-center justify-center border ${theme.divider} ${theme.text} hover:opacity-70 disabled:opacity-30 disabled:hover:opacity-30`}
        >
          {isPlaying ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={next}
          disabled={!isReady}
          aria-label="Next track"
          className={transportButtonClass}
        >
          <SkipForwardIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={`min-w-0 flex-1 truncate text-xs ${theme.muted}`}>
        {videoTitle ?? (isReady ? 'Ready' : 'Loading lofi…')}
      </div>

      <select
        value={playlistId}
        onChange={(e) => onPlaylistChange(e.target.value)}
        aria-label="Playlist"
        className={`bg-transparent px-1.5 py-1 text-xs ${theme.text} ${theme.divider} border outline-none`}
      >
        {MUSIC_PLAYLISTS.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <VolumeIcon className={`h-3.5 w-3.5 shrink-0 ${theme.muted}`} />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="w-20 accent-fs-accent"
        />
      </div>

      <div style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <div ref={containerRef} />
      </div>
    </div>
  )
}

export default MusicBar
