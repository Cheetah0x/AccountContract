import React from 'react';
import { PXEWithUrl } from '@/utils/types';

interface PXEInstancesDisplayProps {
  PXEInstances: PXEWithUrl[];
}

export const PXEInstancesDisplay: React.FC<PXEInstancesDisplayProps> = ({ PXEInstances }) => {
  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-semibold mb-4">PXE Instances Loaded</h2>
      {PXEInstances.length === 0 ? (
        <p>No PXE instances loaded.</p>
      ) : (
        <ul>
          {PXEInstances.map((instance, index) => (
            <li key={index}>
              PXE Instance {index + 1}: {instance.url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
