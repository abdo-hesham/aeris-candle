export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 52"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 36C10 4 53 2 59 44M19 11C26 53 77 49 82 15"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="30" cy="7" r="1.3" fill="currentColor" />
      <path d="M59 47v2" stroke="currentColor" />
    </svg>
  );
}
