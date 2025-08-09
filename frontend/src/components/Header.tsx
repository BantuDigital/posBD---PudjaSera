
export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="w-full h-14 md:h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        {/* Tombol menu mobile */}
        {onMenuClick && (
          <button
            className="md:hidden bg text-blue-600    p-2 rounded                                                                                                                                                 focus:outline-none"
            onClick={onMenuClick}
            aria-label="Buka menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        )}
        <h1 className="text-base md:text-xl font-bold text-blue-700"> Mealikmu</h1>
      </div>
      <div className="text-gray-500 text-xs md:text-base">Selamat datang 👋</div>
    </header>
  );
}
