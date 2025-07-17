"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSummary } from "@/app/actions";
import { topModels } from "@/lib/data";

const summarizeSchema = z.object({
  modelName: z.string().min(1, "Please select a model."),
  urls: z.string().min(1, "Please enter at least one URL.").refine(
    (value) => {
      const urls = value.split(/[\s,]+/).filter(Boolean);
      return urls.length > 0 && urls.every(url => {
        try {
          // A simple regex is often better for URL validation on the client
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
        } catch (_) {
          return false;
        }
      });
    },
    { message: "Please enter valid URLs, separated by commas or newlines." }
  ),
});

type SummarizeFormValues = z.infer<typeof summarizeSchema>;

export default function SummarizeNews() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SummarizeFormValues>({
    resolver: zodResolver(summarizeSchema),
    defaultValues: {
      modelName: "",
      urls: "",
    },
  });

  async function onSubmit(data: SummarizeFormValues) {
    setIsLoading(true);
    setSummary(null);

    const urls = data.urls.split(/[\s,]+/).filter(Boolean);
    const result = await getSummary({ modelName: data.modelName, urls });

    setIsLoading(false);

    if (result.success) {
      setSummary(result.summary);
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Summarize News</CardTitle>
            <CardDescription>Get AI-powered summaries of recent news for any model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a model..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topModels.map(model => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>News Article URLs</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter URLs, separated by commas or newlines..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {summary && (
        <CardContent>
          <Card className="mt-4 bg-background/50">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
            </CardContent>
          </Card>
        </CardContent>
      )}
    </Card>
  );
}
