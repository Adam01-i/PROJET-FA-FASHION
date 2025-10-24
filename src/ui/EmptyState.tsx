// components/ui/EmptyState.tsx
import { Link } from 'react-router-dom';
import { ShoppingBag, Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

export const EmptyState = ({ title, message, actionText, actionLink }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-12 h-12 text-pink-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Search className="w-5 h-5" />
          {actionText}
        </Link>
      )}
    </div>
  );
};