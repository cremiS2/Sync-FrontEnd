import React from 'react';
import { Card, CardContent } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  className = ""
}) => {
  return (
    <Card className={`shadow-lg overflow-hidden h-full ${className}`}>
      <CardContent className="p-3 sm:p-4 md:p-6 h-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3 h-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium truncate" style={{ color }} title={title}>
              {title}
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">{value}</p>
            {subtitle && (
              <p className="text-[10px] sm:text-xs truncate" style={{ color }} title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-sm sm:text-lg md:text-xl flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
