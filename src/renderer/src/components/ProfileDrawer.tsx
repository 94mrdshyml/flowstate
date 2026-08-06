import { CloseIcon } from './icons'

interface ProfileDrawerProps {
  firstName: string
  lastName: string
  email: string
  onClose: () => void
  onLogout: () => void
}

function ProfileDrawer({
  firstName,
  lastName,
  email,
  onClose,
  onLogout
}: ProfileDrawerProps): React.JSX.Element {
  const avatarUrl = `https://api.dicebear.com/10.x/clay/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`

  return (
    <div className="fixed inset-0 z-10 bg-fs-text/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 flex w-90 flex-col gap-6 border-l border-fs-divider bg-fs-surface px-7.5 py-8 text-fs-text"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[22px] font-extrabold">Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close profile">
            <CloseIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 border-b border-fs-divider pb-6">
          <img
            src={avatarUrl}
            alt=""
            className="h-24 w-24 animate-[fsFloat_3s_ease-in-out_infinite] bg-fs-bg"
          />
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

        <button
          type="button"
          onClick={onLogout}
          className="mt-auto w-fit text-xs text-fs-muted hover:text-fs-text"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default ProfileDrawer
