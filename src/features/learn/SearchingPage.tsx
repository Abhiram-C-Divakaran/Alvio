import AlgorithmsWorkspace from '../workspace/AlgorithmsWorkspace';

export default function SearchingPage() {
  return (
    <div className="w-full h-full">
      <AlgorithmsWorkspace filterType="searching" viewMode="2d" />
    </div>
  );
}