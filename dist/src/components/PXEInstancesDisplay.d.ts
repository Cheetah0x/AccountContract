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
interface PXEInstancesDisplayProps {
    PXEInstances: PXEWithUrl[];
}
export declare const PXEInstancesDisplay: React.FC<PXEInstancesDisplayProps>;
export {};
//# sourceMappingURL=PXEInstancesDisplay.d.ts.map