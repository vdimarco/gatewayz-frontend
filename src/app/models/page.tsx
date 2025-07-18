import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModelsPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">AI Models</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Explore Models</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the page for exploring different AI models. More content will be added soon!</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
