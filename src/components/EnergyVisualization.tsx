
import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { UtilityDataPoint, CarbonIntensityData, VisualizationMode, TimeRange } from '@/types/energy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { a, useSpring } from '@react-spring/three';

// Create a bar component for the visualization
const Bar = ({ position, height, color, value, label }: { 
  position: [number, number, number], 
  height: number, 
  color: string, 
  value: number,
  label: string 
}) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { scaleY } = useSpring({
    scaleY: height,
    config: { tension: 150, friction: 20 }
  });
  
  return (
    <a.mesh
      ref={meshRef}
      position={position}
      scale-y={scaleY}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      {hovered && (
        <Html position={[0, height / 1.5, 0]} center>
          <div className="bg-white p-2 rounded shadow-md text-sm">
            <div className="font-semibold">{label}</div>
            <div>{value.toFixed(2)}</div>
          </div>
        </Html>
      )}
    </a.mesh>
  );
};

// Main scene component
const EnergyScene = ({ 
  utilityData, 
  carbonData,
  visualizationMode,
  timeRange 
}: { 
  utilityData: UtilityDataPoint[], 
  carbonData?: CarbonIntensityData,
  visualizationMode: VisualizationMode,
  timeRange: TimeRange
}) => {
  const controlsRef = useRef<any>(null);
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  // Process data based on visualization mode
  const processedData = useMemo(() => {
    if (!utilityData || utilityData.length === 0) return [];
    
    // Find max values for scaling
    const maxKwh = Math.max(...utilityData.map(d => d.kwh));
    const maxCost = Math.max(...utilityData.map(d => d.cost || 0));
    
    // Scale factor for better visual representation
    const heightScaleFactor = 5 / (visualizationMode === 'cost' ? maxCost : maxKwh);
    
    return utilityData.map((point, index) => {
      let value: number;
      let label: string;
      let color: string;
      
      switch (visualizationMode) {
        case 'cost':
          value = point.cost || 0;
          label = `$${value.toFixed(2)}`;
          color = '#3B82F6'; // blue
          break;
        case 'emissions':
          // Calculate CO2e if we have carbon intensity data
          value = carbonData ? point.kwh * carbonData.co2e_per_kwh : point.kwh;
          label = `${value.toFixed(2)} kg CO₂e`;
          color = '#10B981'; // green
          break;
        case 'usage':
        default:
          value = point.kwh;
          label = `${value.toFixed(2)} kWh`;
          color = '#F59E0B'; // amber
          break;
      }
      
      const height = value * heightScaleFactor;
      const position: [number, number, number] = [index - (utilityData.length / 2), height / 2, 0];
      
      return { position, height, value, color, label };
    });
  }, [utilityData, carbonData, visualizationMode]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {processedData.map((data, index) => (
        <Bar
          key={index}
          position={data.position}
          height={data.height}
          color={data.color}
          value={data.value}
          label={data.label}
        />
      ))}
      
      <OrbitControls 
        ref={controlsRef} 
        enablePan={false} 
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
};

// Main component that wraps the Three.js visualization
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
  const canvasContainerStyle = { 
    height: '400px',
    position: 'relative' as const
  };
  
  // We can format the title based on the current visualization mode
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
    <div style={canvasContainerStyle}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <EnergyScene 
          utilityData={utilityData} 
          carbonData={carbonData}
          visualizationMode={visualizationMode}
          timeRange={timeRange} 
        />
      </Canvas>
    </div>
  );
}
