
import { useMemo, useState } from 'react';
import { UtilityDataPoint, CarbonIntensityData, VisualizationMode, TimeRange } from '@/types/energy';
import { Card, CardContent } from '@/components/ui/card';

// Create a standard 2D bar chart component to replace the 3D visualization
const EnergyBarChart = ({ 
  utilityData, 
  visualizationMode,
}: { 
  utilityData: UtilityDataPoint[], 
  visualizationMode: VisualizationMode,
}) => {
  const processedData = useMemo(() => {
    if (!utilityData || utilityData.length === 0) return [];
    
    return utilityData.map((point) => {
      let value: number;
      let color: string;
      
      switch (visualizationMode) {
        case 'cost':
          value = point.cost || 0;
          color = '#3B82F6'; // blue
          break;
        case 'emissions':
          value = point.kwh; // Simplified for now
          color = '#10B981'; // green
          break;
        case 'usage':
        default:
          value = point.kwh;
          color = '#F59E0B'; // amber
          break;
      }
      
      const maxValue = Math.max(...utilityData.map(d => 
        visualizationMode === 'cost' ? (d.cost || 0) : d.kwh
      ));
      
      // Calculate height as percentage of max value (80% of container height)
      const heightPercentage = (value / maxValue) * 80;
      
      return { value, color, heightPercentage };
    });
  }, [utilityData, visualizationMode]);

  return (
    <div className="flex items-end justify-around h-[320px] w-full px-4">
      {processedData.map((data, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="w-12 mx-1 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer relative group"
            style={{ 
              height: `${data.heightPercentage}%`, 
              backgroundColor: data.color,
              minHeight: '4px'
            }}
          >
            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-xs whitespace-nowrap z-10">
              {visualizationMode === 'cost' 
                ? `$${data.value.toFixed(2)}` 
                : visualizationMode === 'emissions'
                  ? `${data.value.toFixed(2)} kg CO₂e`
                  : `${data.value.toFixed(2)} kWh`}
            </div>
          </div>
          <div className="text-xs mt-1 text-gray-500">{`Day ${index + 1}`}</div>
        </div>
      ))}
    </div>
  );
};

// Main component that wraps the visualization
export default function EnergyVisualization({
  utilityData,
  carbonData,
  visualizationMode,
  timeRange,
}: {
  utilityData: UtilityDataPoint[];
  carbonData?: CarbonIntensityData;
  visualizationMode: VisualizationMode;
  timeRange: TimeRange;
}) {
  // Format the title based on the current visualization mode
  const title = useMemo(() => {
    switch (visualizationMode) {
      case 'cost':
        return 'Energy Cost';
      case 'emissions':
        return 'Carbon Emissions';
      case 'usage':
      default:
        return 'Energy Usage';
    }
  }, [visualizationMode]);

  return (
    <div className="h-[400px] flex flex-col">
      <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>
      {utilityData.length > 0 ? (
        <EnergyBarChart 
          utilityData={utilityData}
          visualizationMode={visualizationMode}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
}
