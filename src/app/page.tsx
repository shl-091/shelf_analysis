
"use client";

import * as React from "react";
import { FileUpload } from "@/components/file-upload";
import { ModelSelector } from "@/components/model-selector";
import { ResultsView } from "@/components/results-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ScanLine, ShoppingBasket, Search } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { resizeImage } from "@/lib/image-utils";

export default function Home() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [mode, setMode] = React.useState<"shelf" | "ingredients">("shelf");
  const [model, setModel] = React.useState<string>("qwen/qwen-2.5-vl-72b-instruct");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [imageSrcs, setImageSrcs] = React.useState<string[]>([]);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      // Resize and convert files to base64
      const base64Images = await Promise.all(
        files.map((file) => resizeImage(file))
      );

      setImageSrcs(base64Images);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: base64Images,
          mode,
          model
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error: ${text.slice(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResults(data);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try fewer or smaller images.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setImageSrcs([]);
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3">
              <ScanLine className="w-10 h-10 text-primary" />
              Shelf<span className="text-primary">Insight</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              AI-Powered Retail & Ingredient Analysis using Multimodal AI
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ModelSelector value={model} onValueChange={setModel} />
          </div>
        </header>

        <main className="space-y-8">
          {!results ? (
            <Card className="border-2 border-dashed shadow-sm">
              <CardHeader>
                <CardTitle>Start Analysis</CardTitle>
                <CardDescription>Select a mode and upload images to begin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "shelf" | "ingredients")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="shelf" className="text-base gap-2">
                      <ShoppingBasket className="w-4 h-4" /> Shelf Analysis
                    </TabsTrigger>
                    <TabsTrigger value="ingredients" className="text-base gap-2">
                      <Search className="w-4 h-4" /> Ingredient Analysis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={mode} className="mt-0 space-y-4">
                    <FileUpload files={files} setFiles={setFiles} className="min-h-[300px]" />

                    {error && (
                      <div className="p-4 rounded-md bg-destructive/15 text-destructive font-medium border border-destructive/20">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button
                        size="lg"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || files.length === 0}
                        className="w-full md:w-auto text-lg px-8 py-6 h-auto"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
                          </>
                        ) : (
                          "Start Analysis"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {mode === "shelf" ? <ShoppingBasket className="w-5 h-5 text-primary" /> : <Search className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{mode === "shelf" ? "Shelf Analysis" : "Ingredient Analysis"}</h3>
                    <p className="text-sm text-muted-foreground">{files.length} Image(s) Processed</p>
                  </div>
                </div>
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold px-6"
                >
                  Analyzing New Images
                </Button>
              </div>

              <ResultsView results={results} mode={mode} imageSrcs={imageSrcs} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
