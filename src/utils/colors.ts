// utils/colors.ts
export const wholesaleColors = {
  primary: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-100',
  },
  badge: {
    bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
    text: 'text-white',
  },
  discount: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  status: {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    }
  }
};

export const stockColors = {
  inStock: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  lowStock: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  outOfStock: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  }
};