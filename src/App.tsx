import React, { useState, useCallback, Suspense } from "react";
import GitHubHeatmap from "@/components/github-heatmap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPattern, colorPatterns } from "@/lib/colorPatterns";
import { Skeleton } from "@/components/ui/skeleton";

export default function App() {
  const [username, setUsername] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [cellSize, setCellSize] = useState<number>(14);
  const [cellGap, setCellGap] = useState<number>(2);
  const [selectedColorPattern, setSelectedColorPattern] =
    useState<ColorPattern>(colorPatterns[0]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setCurrentUsername(username);
    },
    [username],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const handleDataLoad = useCallback((_data: any) => {
    // console.log('Data loaded:', data)
  }, []);

  const customTooltipFormat = useCallback(
    (date: string, count: number) =>
      `${new Date(date).toDateString()}: ${count} contribution${count !== 1 ? "s" : ""}`,
    [],
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">GitHub Contribution Heatmap</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Customize Your Heatmap</CardTitle>
          <CardDescription>
            Enter a GitHub username and adjust the settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="flex-grow"
                aria-label="GitHub username"
                id="github-username"
              />
              <Button type="submit" aria-label="Show Heatmap">
                Show Heatmap
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-legend"
                checked={showLegend}
                onCheckedChange={setShowLegend}
                aria-label="Show legend"
              />
              <Label htmlFor="show-legend">Show Legend</Label>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="cell-size">Cell Size: {cellSize}px</Label>
              <Slider
                id="cell-size"
                min={10}
                max={20}
                step={1}
                value={[cellSize]}
                onValueChange={(value) => setCellSize(value[0])}
                aria-label="Cell size"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="cell-gap">Cell Gap: {cellGap}px</Label>
              <Slider
                id="cell-gap"
                min={1}
                max={5}
                step={1}
                value={[cellGap]}
                onValueChange={(value) => setCellGap(value[0])}
                aria-label="Cell gap"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="color-pattern">Color Pattern</Label>
              <Select
                onValueChange={(value) =>
                  setSelectedColorPattern(
                    colorPatterns.find((cp) => cp.name === value) ||
                      colorPatterns[0],
                  )
                }
                aria-label="Select color pattern"
              >
                <SelectTrigger id="color-pattern">
                  <SelectValue placeholder="Select a color pattern" />
                </SelectTrigger>
                <SelectContent>
                  {colorPatterns.map((pattern) => (
                    <SelectItem key={pattern.name} value={pattern.name}>
                      <div className="flex items-center">
                        <span>{pattern.name}</span>
                        <div className="ml-2 flex">
                          {pattern.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-sm"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>
      {currentUsername && (
        <Suspense fallback={<Skeleton className="w-full h-64" />}>
          <GitHubHeatmap
            username={currentUsername}
            showLegend={showLegend}
            cellSize={cellSize}
            cellGap={cellGap}
            colorPattern={selectedColorPattern}
            tooltipFormat={customTooltipFormat}
            onDataLoad={handleDataLoad}
            apiUrl="https://hono-backend.vanshchopra101.workers.dev/api/contributions"
          />
        </Suspense>
      )}
    </main>
  );
}
