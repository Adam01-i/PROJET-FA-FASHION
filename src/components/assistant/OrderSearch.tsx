import { Search } from 'lucide-react';

import PropTypes from 'prop-types';

type OrderSearchProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

const OrderSearch: React.FC<OrderSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une commande..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

OrderSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default OrderSearch;