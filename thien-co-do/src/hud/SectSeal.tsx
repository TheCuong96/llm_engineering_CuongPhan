// Hand-drawn stylised cloud; no Chinese characters (spec §4.1, §12).
export function SectSeal() {
  return (
    <span className="grid size-9 place-items-center rounded-lg bg-accent" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <path d="M5 15.5h11.5a3.5 3.5 0 0 0 0-7 4.5 4.5 0 0 0-8.6 1.2A3 3 0 0 0 5 15.5Z" />
        <path d="M7 18.5h8" />
        <path d="M12 12.2c1-.9 2.4-.9 3.2.2" />
      </svg>
    </span>
  );
}
