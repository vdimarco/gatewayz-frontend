import ModelInsightsDashboard from '@/components/dashboard/model-insights-dashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-screen-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8 font-headline">Model Insights</h1>
        <ModelInsightsDashboard />
      </div>
    </main>
  );
}
