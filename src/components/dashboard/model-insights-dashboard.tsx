import TokenGenerationChart from './token-generation-chart';
import TopModelsTable from './top-models-table';

export default function ModelInsightsDashboard() {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="flex flex-col gap-8">
        <TokenGenerationChart />
        <TopModelsTable />
      </div>
    </div>
  );
}
