import { CheckCircle, Truck, XCircle, Clock } from 'lucide-react';

import PropTypes from 'prop-types';

type OrderStatus = 'completed' | 'processing' | 'cancelled' | 'pending' | string;

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800',
          iconColor: 'text-green-500',
          label: 'Terminée'
        };
      case 'processing':
        return {
          icon: Truck,
          color: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-500',
          label: 'En cours'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800',
          iconColor: 'text-red-500',
          label: 'Annulée'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800',
          iconColor: 'text-yellow-500',
          label: 'En attente'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center">
      <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

OrderStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default OrderStatusBadge;