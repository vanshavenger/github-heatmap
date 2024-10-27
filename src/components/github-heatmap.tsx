import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { colorPatterns, ColorPattern } from "@/lib/colorPatterns";
import debounce from "lodash.debounce";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GitHubHeatmapProps {
  username: string;
  colorPattern?: ColorPattern;
  showLegend?: boolean;
  cellSize?: number;
  cellGap?: number;
  tooltipFormat?: (date: string, count: number) => string;
  onDataLoad?: (data: ContributionData) => void;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  apiUrl?: string;
}

const defaultTooltipFormat = (date: string, count: number) =>
  `${new Date(date).toLocaleDateString()}: ${count} contribution${count !== 1 ? "s" : ""}`;

export default function GitHubHeatmap({
  username,
  colorPattern = colorPatterns[0],
  showLegend = true,
  cellSize = 14,
  cellGap = 2,
  tooltipFormat = defaultTooltipFormat,
  onDataLoad,
  loadingComponent,
  errorComponent,
  apiUrl = "https://hono-backend.vanshchopra101.workers.dev/api/contributions",
}: GitHubHeatmapProps) {
  const [contributionData, setContributionData] =
    useState<ContributionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContributions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch contribution data");
      }
      const data = await response.json();
      const calendarData =
        data.data.user.contributionsCollection.contributionCalendar;
      setContributionData(calendarData);
      onDataLoad?.(calendarData);
    } catch {
      setError("Failed to load contribution data");
      // console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [username, apiUrl, onDataLoad]);

  const debouncedFetchContributions = useMemo(
    () => debounce(fetchContributions, 300),
    [fetchContributions],
  );

  useEffect(() => {
    debouncedFetchContributions();
    return () => {
      debouncedFetchContributions.cancel();
    };
  }, [debouncedFetchContributions]);

  const getColorLevel = useCallback(
    (count: number): string => {
      const levelIndex = colorPattern.ranges.findIndex(
        ([min, max]) => count >= min && count <= max,
      );
      return colorPattern.colors[levelIndex];
    },
    [colorPattern],
  );

  if (error) {
    return (
      errorComponent || (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    );
  }

  if (isLoading) {
    return loadingComponent || <Skeleton className="w-full h-32" />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GitHub Contributions for {username}</CardTitle>
        <CardDescription>
          Total Contributions: {contributionData?.totalContributions || 0}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="flex flex-wrap items-center justify-center mb-4 min-w-max"
            role="img"
            aria-label={`GitHub contribution heatmap for ${username}`}
            style={{ gap: `${cellGap}px` }}
          >
            {contributionData?.weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col"
                style={{ gap: `${cellGap}px` }}
              >
                {week.contributionDays.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="rounded-sm transition-transform hover:scale-125 focus:scale-125"
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            backgroundColor: getColorLevel(
                              day.contributionCount,
                            ),
                          }}
                          aria-label={tooltipFormat(
                            day.date,
                            day.contributionCount,
                          )}
                          tabIndex={0}
                          role="gridcell"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{tooltipFormat(day.date, day.contributionCount)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
        {showLegend && (
          <div
            className="flex flex-wrap gap-4 justify-center mt-4"
            role="legend"
            aria-label="Contribution level legend"
          >
            {colorPattern.ranges.map((range, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 mr-2 rounded-sm"
                  style={{ backgroundColor: colorPattern.colors[index] }}
                  aria-hidden="true"
                />
                <span className="text-sm">
                  {range[0] === range[1]
                    ? `${range[0]}`
                    : `${range[0]}-${range[1] === Infinity ? "+" : range[1]}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
