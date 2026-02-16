
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { AnalysisResult, ShelfAnalysisResult, IngredientAnalysisResult } from "@/types/analysis";
import { ImageAnnotator } from "@/components/image-annotator";

interface ResultsViewProps {
  results: AnalysisResult;
  mode: "shelf" | "ingredients";
  imageSrcs: string[];
}

export function ResultsView({ results, mode, imageSrcs }: ResultsViewProps) {
  const handleExport = () => {
    if (mode === "shelf") {
      const data = (results as ShelfAnalysisResult).products.map((p) => ({
        "Product Name": p.name,
        Brand: p.brand,
        Category: p.category,
        Price: p.price,
        Details: p.details,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Shelf Analysis");
      XLSX.writeFile(wb, "shelf_analysis.xlsx");
    } else {
      const data = (results as IngredientAnalysisResult).ingredients.map((i) => ({
        "Ingredient": i.name,
        "Content": i.content,
        "Origin": i.origin || "",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ingredient Analysis");
      XLSX.writeFile(wb, "ingredient_analysis.xlsx");
    }
  };

  if (mode === "shelf") {
    const data = results as ShelfAnalysisResult;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">Product Data</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
            <TabsTrigger value="visuals">Visuals</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detected Products ({data.products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.price || "-"}</TableCell>
                        <TableCell>{product.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                  {data.market_analysis}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visuals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageSrcs.map((src, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Image {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageAnnotator imageSrc={src} products={data.products} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  } else {
    const data = results as IngredientAnalysisResult;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ingredient Analysis</h2>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="summary">Product Details</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Origin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.ingredients.map((ing, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{ing.name}</TableCell>
                        <TableCell>{ing.content}</TableCell>
                        <TableCell>{ing.origin || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Product Name</h3>
                  <p>{data.product_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Origin</h3>
                  <p>{data.origin_place}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Nutrition Facts</h3>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-md">
                    {data.nutrition_facts}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
}
