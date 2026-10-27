/** Lightweight vector fallback only: the active character is built from real 3D meshes. */
export default function CompanionFallback() {
  return (
    <svg viewBox="0 0 150 190" aria-hidden="true" className="companion-fallback">
      <ellipse cx="75" cy="180" rx="29" ry="5" fill="var(--accent)" opacity=".15" />
      <g stroke="#252733" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M57 144h17v30H55zm19 0h17l2 30H76" fill="#252733" />
        <path d="M54 170q-8 12 4 12h15v-11zm23 1v11h17q10-1 0-12" fill="#191d28" />
        <path d="M50 116q-14 4-15 26l9 2 13-20m43-8q14 4 15 26l-9 2-13-20" fill="#252733" />
        <ellipse cx="39" cy="146" rx="7" ry="8" fill="#c58b64" />
        <ellipse cx="111" cy="146" rx="7" ry="8" fill="#c58b64" />
        <path d="M54 112q21-10 42 0l5 38H49z" fill="#252733" />
        <path d="m64 111 11 34 11-34" fill="#fff9ed" />
        <path d="m73 116 4 0 2 20-4 6-4-6z" fill="#151722" />
        <path d="m53 115 11-6 10 36-20-18 6-4zm44 0-11-6-10 36 20-18-6-4z" fill="#3a3e4c" />
        <ellipse cx="30" cy="72" rx="8" ry="12" fill="#c58b64" />
        <ellipse cx="120" cy="72" rx="8" ry="12" fill="#c58b64" />
        <ellipse cx="75" cy="68" rx="45" ry="47" fill="#c58b64" stroke="#b77c59" />
        <path
          d="M31 65Q20 15 57 19l7-9 12 8 13-5 5 9q39 0 27 44l-10-18-8 8-9-18-12 17-9-14-15 15-9-9z"
          fill="#20212c"
        />
      </g>
      <g fill="#fff9ed">
        <ellipse cx="58" cy="74" rx="10" ry="12" />
        <ellipse cx="92" cy="74" rx="10" ry="12" />
      </g>
      <g fill="#362822">
        <ellipse cx="60" cy="75" rx="6.5" ry="9" />
        <ellipse cx="90" cy="75" rx="6.5" ry="9" />
      </g>
      <g fill="white">
        <circle cx="57" cy="71" r="2.5" />
        <circle cx="87" cy="71" r="2.5" />
      </g>
      <path
        d="M49 58q9-5 18-1m16 0q9-4 18 1M66 94q9 9 18 0"
        fill="none"
        stroke="#33242a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
