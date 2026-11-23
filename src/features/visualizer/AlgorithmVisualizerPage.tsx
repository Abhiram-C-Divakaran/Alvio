import { useSearchParams } from 'react-router-dom';
import AlgorithmsWorkspace from '../workspace/AlgorithmsWorkspace';
import type { AlgoType } from '../workspace/AlgorithmsWorkspace';

export default function AlgorithmVisualizerPage() {
  const [searchParams] = useSearchParams();
  const initialAlgo = (searchParams.get('algo') as AlgoType) || 'bubble-sort';

  return (
    <div className="w-full h-full bg-[var(--color-bg-primary)]">
      <AlgorithmsWorkspace initialAlgo={initialAlgo} viewMode="3d" filterType="all" immersive={true} />
    </div>
  );
}
