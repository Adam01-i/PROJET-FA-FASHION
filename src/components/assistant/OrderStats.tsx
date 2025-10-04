import { ShoppingBag, Clock, Truck, CheckCircle } from 'lucide-react';

import { FC } from 'react';

type Order = {
  status: string;
  // add other fields as needed
};

interface OrderStatsProps {
  orders: Order[];
}

const OrderStats: FC<OrderStatsProps> = ({ orders }) => {
  const stats = [
    {
      label: 'Total Commandes',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'text-blue-500'
    },
    {
      label: 'En attente',
      value: orders.filter(o => o.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'text-yellow-500'
    },
    {
      label: 'En cours',
      value: orders.filter(o => o.status === 'processing').length,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'text-blue-500'
    },
    {
      label: 'Terminées',
      value: orders.filter(o => o.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'text-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <IconComponent className={`h-8 w-8 ${stat.bgColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStats;