export function RaisedFistIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Fist - closed hand raised in solidarity */}
      <path d="M12 3c1 0 1.5.5 1.5 1.5v4" />
      <path d="M9.5 4c1 0 1.5.5 1.5 1.5v3" />
      <path d="M14.5 4c1 0 1.5.5 1.5 1.5v3" />
      <path d="M7 6.5c.8-.3 1.5 0 1.5 1v2" />
      {/* Fist body */}
      <path d="M7 9.5c0 0-1 .5-1 2.5 0 3 2 5 6 5s6-2 6-5c0-2-1-2.5-1-2.5" />
      {/* Wrist/arm */}
      <path d="M9 17v4" />
      <path d="M15 17v4" />
    </svg>
  )
}
