/**
 * PXEInstancesDisplay component displays a list of PXE instances.
 * It shows a header and either lists the instances with their URLs or indicates that no instances are loaded.
 *
 * @param {PXEWithUrl[]} PXEInstances - An array of PXE instances, each with a PXE client and URL.

 * This component performs the following:
 * 1. **Display PXE Instances**: If there are PXE instances available, it lists them with their index and URL.
 * 2. **Handle Empty State**: If no PXE instances are loaded, it displays a message indicating that.
 */

import React from 'react';
import { PXEWithUrl } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PXEInstancesDisplayProps {
  PXEInstances: PXEWithUrl[]; // An array of PXE instances, each with a PXE client and a URL
}

export const PXEInstancesDisplay: React.FC<PXEInstancesDisplayProps> = ({ PXEInstances }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PXE Instances Loaded</CardTitle>
      </CardHeader>
      <CardContent>
        {PXEInstances.length === 0 ? (
          <p>No PXE instances loaded.</p>
        ) : (
          <ul className="list-disc ml-4">
            {PXEInstances.map((instance, index) => (
              <li key={index} className="text-muted-foreground">
                PXE Instance {index + 1}: {instance.url}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
