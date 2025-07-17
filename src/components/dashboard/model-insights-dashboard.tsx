import TokenGenerationChart from './token-generation-chart';
import TopModelsTable from './top-models-table';
import SummarizeNews from './summarize-news';

export default function ModelInsightsDashboard() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <div className="xl:col-span-3 flex flex-col gap-8">
        <TokenGenerationChart />
        <TopModelsTable />
      </div>
      <div className="xl:col-span-2">
        <SummarizeNews />
      </div>
    </div>
  );
}
