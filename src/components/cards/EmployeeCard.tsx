import React from 'react';
import { PerformanceCircle } from '../charts';
import { StatusBadge } from '../ui';

interface EmployeeCardProps {
  photo: string;
  name: string;
  role: string;
  department: string;
  performance: number;
  status: string;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  photo,
  name,
  role,
  department,
  performance,
  status,
}) => {
  return (
    <div className="bg-transparent backdrop-blur-md rounded-2xl shadow-lg p-6 flex flex-col items-center scale-in group hover:shadow-2xl transition-all duration-300 relative fade-in-up border border-white/10 overflow-hidden h-full">
      <div className="w-20 h-20 rounded-full overflow-hidden shadow-md mb-4 flex-shrink-0">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <h2 className="text-lg font-bold text-[var(--primary)] mb-1 text-center truncate w-full" title={name}>{name}</h2>
      <div className="mb-2">
        <StatusBadge status={status} />
      </div>
      <div className="text-sm text-[var(--muted)] mb-1 text-center truncate w-full flex-grow" title={role}>{role}</div>
      <div className="text-xs font-bold text-[var(--primary)] mb-3 text-center truncate w-full" title={department}>{department}</div>
      <div className="mt-auto">
        <PerformanceCircle value={performance} />
        <div className="mt-2 text-xs text-[var(--muted)]">Desempenho</div>
      </div>
    </div>
  );
};

export default EmployeeCard;