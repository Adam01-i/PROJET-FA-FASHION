interface MyAccountItemProps {
  active: boolean;
  onClick: () => void;
}

export default function MyAccountItem({ active, onClick }: MyAccountItemProps) {
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
      {/* <Users className={`h-5 w-5 mr-3 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} /> */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 mr-3 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zM19.071 4.929a10 10 0 11-14.142 0 10 10 0 0114.142 0z"
        />
      </svg>
      <span className="font-medium">Mon compte</span>
      
      {active && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
      )}
    </button>
  );
}