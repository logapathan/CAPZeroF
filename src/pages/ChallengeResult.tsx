import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Clock } from "lucide-react";

interface SubmissionResult {
  challengeId: string;
  timeElapsed: number;
  finalScore: number;
  timeScore: number;
  accuracyScore: number;
  stlAnalysis: {
    volume: number;
    surfaceArea: number;
    dimensionalAccuracy: number;
    geometryMatch: number;
  };
  performanceMetrics: {
    rank: string;
    percentile: number;
    averageTime: number;
    bestTime: number;
  };
}

const ChallengeResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    // Get results from navigation state
    if (location.state?.results) {
      setResults(location.state.results);
    } else {
      // If no results in state, redirect back to practice page
      navigate("/");
    }
  }, [location.state, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 95)
      return { text: "Exceptional", color: "bg-purple-100 text-purple-800" };
    if (percentile >= 85)
      return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (percentile >= 70)
      return { text: "Good", color: "bg-blue-100 text-blue-800" };
    if (percentile >= 50)
      return { text: "Average", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  if (!results) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Results...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const performanceBadge = getPerformanceBadge(
    results.performanceMetrics.percentile
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="container py-8">
          {/* Header with overall score */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cadarena-500 to-cadarena-600 rounded-full mb-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Challenge Complete!
            </h1>
            <div className="text-6xl font-bold mb-2">
              <span className={getScoreColor(results.finalScore)}>
                {results.finalScore}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <Badge className={performanceBadge.color}>
              {performanceBadge.text} (Top{" "}
              {100 - results.performanceMetrics.percentile}%)
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>
                  How your final score was calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">STL Accuracy</span>
                    <span className="font-bold">
                      {results.accuracyScore}/70
                    </span>
                  </div>
                  <Progress
                    value={(results.accuracyScore / 70) * 100}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">
                        Dimensional Accuracy:
                      </span>
                      <span className="font-medium ml-2">
                        {results.stlAnalysis.dimensionalAccuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Geometry Match:</span>
                      <span className="font-medium ml-2">
                        {results.stlAnalysis.geometryMatch.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Time Efficiency</span>
                    <span className="font-bold">{results.timeScore}/30</span>
                  </div>
                  <Progress
                    value={(results.timeScore / 30) * 100}
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Completed in {formatTime(results.timeElapsed)}
                    (Average:{" "}
                    {formatTime(results.performanceMetrics.averageTime)})
                  </p>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Final Score</span>
                  <span className={getScoreColor(results.finalScore)}>
                    {results.finalScore}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>
                  Your performance compared to other submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-cadarena-600" />
                    <div className="text-2xl font-bold">
                      {formatTime(results.timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-600">Your Time</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-cadarena-600" />
                    <div className="text-2xl font-bold">
                      #{results.performanceMetrics.rank}
                    </div>
                    <div className="text-sm text-gray-600">Global Rank</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Performance Percentile</span>
                    <span className="font-bold">
                      {results.performanceMetrics.percentile}%
                    </span>
                  </div>
                  <Progress
                    value={results.performanceMetrics.percentile}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    You performed better than{" "}
                    {results.performanceMetrics.percentile}% of submissions
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Time Comparison</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Your time:</span>
                      <span className="font-medium">
                        {formatTime(results.timeElapsed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average time:</span>
                      <span>
                        {formatTime(results.performanceMetrics.averageTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best time:</span>
                      <span>
                        {formatTime(results.performanceMetrics.bestTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* STL Analysis Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>STL File Analysis</CardTitle>
              <CardDescription>
                Detailed analysis of your submitted STL file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Geometric Properties</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span className="font-medium">
                        {results.stlAnalysis.volume.toFixed(2)} mm³
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Surface Area:</span>
                      <span className="font-medium">
                        {results.stlAnalysis.surfaceArea.toFixed(2)} mm²
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Accuracy Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Dimensional Accuracy</span>
                        <span className="text-sm font-medium">
                          {results.stlAnalysis.dimensionalAccuracy.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={results.stlAnalysis.dimensionalAccuracy}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Geometry Match</span>
                        <span className="text-sm font-medium">
                          {results.stlAnalysis.geometryMatch.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={results.stlAnalysis.geometryMatch}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeResults;
