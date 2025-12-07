interface WholeSaleProductsItemProps {
  active: boolean;
  onClick: () => void;
}

export default function WholeSaleProductsItem({ active, onClick }: WholeSaleProductsItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 group
        ${active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 mr-3 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18M4 7v10a1 1 0 001 1h1a1 1 0 001-1V7M16 7v10a1 1 0 001 1h1a1 1 0 001-1V7" />
      </svg>
      <span className="font-medium">Prix en Gros</span>
      
      {active && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
      )}
    </button>
  );
}