export function SchoolDoodleArt({ className = 'w-full h-auto max-w-lg mx-auto' }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Background Window Frame */}
        <rect x="200" y="30" width="200" height="240" rx="16" fill="#F4F4F5" stroke="#E4E4E7" strokeWidth="3" />
        <line x1="300" y1="30" x2="300" y2="270" stroke="#E4E4E7" strokeWidth="3" />
        <line x1="200" y1="140" x2="400" y2="140" stroke="#E4E4E7" strokeWidth="3" />
        {/* Sky through window */}
        <path d="M205 35 H395 V135 H205 Z" fill="#E0F2FE" opacity="0.6" />
        <circle cx="360" cy="65" r="14" fill="#FDE047" opacity="0.8" />

        {/* Hanging Plant */}
        <line x1="235" y1="30" x2="235" y2="100" stroke="#71717A" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M220 100 Q235 90 250 100 L245 125 Q235 130 225 125 Z" fill="#10B981" />
        {/* Plant leaves */}
        <path d="M235 95 C215 70 200 95 210 115 C220 100 230 105 235 95 Z" fill="#059669" />
        <path d="M235 95 C255 70 270 95 260 115 C250 100 240 105 235 95 Z" fill="#34D399" />
        <path d="M235 90 C235 60 250 65 242 85 Z" fill="#10B981" />

        {/* Floating Book Shelf on Right Wall */}
        <rect x="420" y="80" width="130" height="14" rx="4" fill="#E2E8F0" />
        {/* Books on shelf */}
        <rect x="430" y="44" width="16" height="36" rx="2" fill="#3B82F6" />
        <rect x="448" y="40" width="18" height="40" rx="2" fill="#F59E0B" />
        <rect x="468" y="48" width="14" height="32" rx="2" fill="#10B981" />
        {/* Mini photo frame */}
        <rect x="495" y="42" width="30" height="38" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="510" cy="56" r="6" fill="#F43F5E" />
        <path d="M502 74 C502 66 518 66 518 74 Z" fill="#64748B" />

        {/* Desk Surface */}
        <rect x="50" y="360" width="500" height="24" rx="12" fill="#E4E4E7" />
        <rect x="70" y="384" width="18" height="90" rx="6" fill="#D4D4D8" />
        <rect x="512" y="384" width="18" height="90" rx="6" fill="#D4D4D8" />

        {/* ── Child 1 (Girl with pigtails, left) ── */}
        <g id="child-girl">
          {/* Hair back */}
          <circle cx="170" cy="220" r="42" fill="#1F2937" />
          <path d="M125 210 C110 180 135 150 155 180 Z" fill="#1F2937" />
          <path d="M215 210 C230 180 205 150 185 180 Z" fill="#1F2937" />
          {/* Face */}
          <circle cx="170" cy="225" r="34" fill="#FED7AA" />
          {/* Eyes & Smile */}
          <circle cx="158" cy="222" r="3.5" fill="#1F2937" />
          <circle cx="182" cy="222" r="3.5" fill="#1F2937" />
          <path d="M164 236 Q170 242 176 236" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="152" cy="228" r="4" fill="#FDA4AF" opacity="0.7" />
          <circle cx="188" cy="228" r="4" fill="#FDA4AF" opacity="0.7" />
          {/* Bangs */}
          <path d="M140 210 Q170 215 200 205 Q170 190 140 210 Z" fill="#1F2937" />

          {/* Yellow Dress / Shirt */}
          <path d="M135 265 C135 255 205 255 205 265 L225 360 H115 Z" fill="#FACC15" />
          {/* Pattern dots */}
          <circle cx="160" cy="285" r="2.5" fill="#EAB308" />
          <circle cx="180" cy="295" r="2.5" fill="#EAB308" />
          <circle cx="155" cy="320" r="2.5" fill="#EAB308" />
          <circle cx="185" cy="325" r="2.5" fill="#EAB308" />

          {/* Arms resting on table */}
          <path d="M135 280 Q145 350 180 355" stroke="#FED7AA" strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M205 280 Q195 350 160 355" stroke="#FED7AA" strokeWidth="16" strokeLinecap="round" fill="none" />
        </g>

        {/* ── Open Book on Girl's Side ── */}
        <g id="book-girl">
          <path d="M125 365 L170 348 L215 365 L170 375 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M170 348 V375" stroke="#94A3B8" strokeWidth="2" />
          {/* Text lines */}
          <line x1="138" y1="358" x2="162" y2="354" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="138" y1="363" x2="158" y2="359" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="178" y1="354" x2="202" y2="358" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="178" y1="359" x2="198" y2="363" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── Child 2 (Boy with short hair, right) ── */}
        <g id="child-boy">
          {/* Hair */}
          <path d="M380 185 C350 185 340 215 340 230 C350 232 420 232 425 230 C425 210 410 185 380 185 Z" fill="#27272A" />
          {/* Face */}
          <circle cx="382" cy="235" r="34" fill="#FFEDD5" />
          {/* Eyes & Smile */}
          <circle cx="370" cy="232" r="3.5" fill="#1F2937" />
          <circle cx="394" cy="232" r="3.5" fill="#1F2937" />
          <path d="M376 246 Q382 252 388 246" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="364" cy="238" r="4" fill="#FDA4AF" opacity="0.6" />
          <circle cx="400" cy="238" r="4" fill="#FDA4AF" opacity="0.6" />

          {/* Green Shirt */}
          <path d="M345 275 C345 265 420 265 420 275 L435 360 H330 Z" fill="#0F6D4E" />

          {/* Arms & Hands writing */}
          <path d="M345 290 Q365 350 395 352" stroke="#FFEDD5" strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M420 290 Q400 350 370 355" stroke="#FFEDD5" strokeWidth="16" strokeLinecap="round" fill="none" />
        </g>

        {/* Notebook & Pencil on Boy's Side */}
        <g id="notebook-boy">
          <rect x="340" y="345" width="80" height="26" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="350" y1="353" x2="385" y2="353" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="350" y1="360" x2="400" y2="360" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Yellow Pencil */}
          <line x1="375" y1="362" x2="395" y2="338" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <polygon points="372,365 375,360 378,363" fill="#1F2937" />
        </g>

        {/* Small Pencil Holder on Table */}
        <rect x="250" y="325" width="26" height="35" rx="4" fill="#F43F5E" />
        <line x1="256" y1="325" x2="252" y2="305" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <line x1="264" y1="325" x2="265" y2="300" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <line x1="270" y1="325" x2="274" y2="308" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
