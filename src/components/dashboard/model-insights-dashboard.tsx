import TokenGenerationChart from './token-generation-chart';
import TopModelsTable from './top-models-table';
import type { ModelData } from '@/lib/data';

interface ModelInsightsDashboardProps {
  models: ModelData[];
}

export default function ModelInsightsDashboard({ models }: ModelInsightsDashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="flex flex-col gap-8">
        <TokenGenerationChart models={models} />
        <TopModelsTable models={models} />
      </div>
    </div>
  );
}
