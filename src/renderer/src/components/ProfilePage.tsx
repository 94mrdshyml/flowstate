import { ArrowLeftIcon } from './icons'
import type { UpdateState, UpdateStatus } from '../../../preload/types'

interface ProfilePageProps {
  firstName: string
  lastName: string
  email: string
  appVersion: string
  updateStatus: UpdateStatus
  onCheckForUpdates: () => void
  onInstallUpdate: () => void
  onBack: () => void
  onLogout: () => void
}

const UPDATE_STATUS_LABEL: Record<UpdateState, string> = {
  idle: '',
  checking: 'Checking for updates…',
  available: 'Update found — downloading…',
  downloading: 'Downloading update…',
  downloaded: 'Update ready to install',
  'not-available': 'You’re up to date',
  error: 'Couldn’t check for updates'
}

const CHECKING_STATES: UpdateState[] = ['checking', 'available', 'downloading']
const NOTES_STATES: UpdateState[] = ['available', 'downloading', 'downloaded']

function ProfilePage({
  firstName,
  lastName,
  email,
  appVersion,
  updateStatus,
  onCheckForUpdates,
  onInstallUpdate,
  onBack,
  onLogout
}: ProfilePageProps): React.JSX.Element {
  const avatarUrl = `https://api.dicebear.com/10.x/glyphs/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-fs-surface px-9 py-8 text-fs-text">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-fs-muted hover:opacity-70"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h2 className="font-heading text-[22px] font-extrabold">Profile</h2>

        <div className="flex flex-col items-center gap-3 border-b border-fs-divider pb-6">
          <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full bg-fs-bg" />
          <span className="font-heading text-lg font-extrabold">
            {firstName} {lastName}
          </span>
        </div>

        <div className="flex flex-col gap-4.5">
          <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
            First name
            <span className="text-sm text-fs-text">{firstName}</span>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
            Last name
            <span className="text-sm text-fs-text">{lastName}</span>
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-fs-muted">
            Email
            <span className="text-sm text-fs-text">{email}</span>
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-fs-divider pt-6 text-xs text-fs-muted">
          <div className="flex items-center justify-between">
            <span>Version {appVersion}</span>
            <button
              type="button"
              onClick={onCheckForUpdates}
              disabled={CHECKING_STATES.includes(updateStatus.state)}
              className="text-fs-accent hover:opacity-70 disabled:opacity-40"
            >
              Check for updates
            </button>
          </div>
          {UPDATE_STATUS_LABEL[updateStatus.state] && (
            <span>{UPDATE_STATUS_LABEL[updateStatus.state]}</span>
          )}
          {NOTES_STATES.includes(updateStatus.state) && updateStatus.version && (
            <div className="mt-1 border-l-2 border-fs-accent pl-2.5">
              <div className="font-semibold text-fs-text">Version {updateStatus.version}</div>
              {updateStatus.releaseNotes && (
                <p className="mt-0.5 whitespace-pre-line text-fs-muted">
                  {updateStatus.releaseNotes}
                </p>
              )}
            </div>
          )}
          {updateStatus.state === 'downloaded' && (
            <button
              type="button"
              onClick={onInstallUpdate}
              className="mt-1 h-9 w-fit bg-fs-accent px-4 font-heading text-xs font-extrabold text-fs-accent-text"
            >
              Restart & install
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-fit text-xs text-fs-muted hover:text-fs-text"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
