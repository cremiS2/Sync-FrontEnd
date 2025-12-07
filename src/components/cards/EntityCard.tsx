import React from 'react';
import { Card, Avatar } from '@mui/material';
import { StatusChip, ActionButton } from '../ui';

interface EntityCardProps {
  id?: string;
  name: string;
  description?: string;
  status: string;
  image?: string;
  metrics?: {
    efficiency?: number;
    production?: number;
    quality?: number;
  };
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (entity: any) => void;
  }>;
  onClick?: () => void;
  className?: string;
}

const EntityCard: React.FC<EntityCardProps> = ({
  name,
  description,
  status,
  image,
  metrics,
  actions = [],
  onClick,
  className = ''
}) => {
  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden h-full ${className}`}
      onClick={onClick}
    >
      <div className="p-3 sm:p-4 h-full flex flex-col">
        <div className="mb-2 sm:mb-3">
          <div className="flex justify-end mb-1.5 sm:mb-2">
            <StatusChip 
              status={status}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {image && (
              <Avatar 
                src={image} 
                alt={name}
                sx={{ width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 }, flexShrink: 0 }}
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--text)] text-sm sm:text-base mb-0.5 sm:mb-1 truncate" title={name}>{name}</h3>
              {description && (
                <p className="text-xs sm:text-sm text-[var(--muted)] truncate" title={description}>{description}</p>
              )}
            </div>
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-4 flex-grow">
            {metrics.efficiency !== undefined && (
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-[var(--primary)]">
                  {metrics.efficiency}%
                </div>
                <div className="text-[10px] sm:text-xs text-[var(--muted)]">Eficiência</div>
              </div>
            )}
            {metrics.production !== undefined && (
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-[var(--primary)]">
                  {metrics.production}
                </div>
                <div className="text-[10px] sm:text-xs text-[var(--muted)]">Produção</div>
              </div>
            )}
            {metrics.quality !== undefined && (
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-[var(--primary)]">
                  {metrics.quality}%
                </div>
                <div className="text-[10px] sm:text-xs text-[var(--muted)]">Qualidade</div>
              </div>
            )}
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex gap-1.5 sm:gap-2 justify-end mt-auto">
            {actions.map((action, index) => (
              <ActionButton
                key={index}
                label={action.label}
                icon={action.icon}
                onClick={(e) => {
                  if (e) e.stopPropagation();
                  action.onClick({ name, status, metrics });
                }}
                size="small"
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EntityCard; 