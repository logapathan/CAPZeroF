import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Challenge,
  ChallengeLevel,
  ChallengeStatus,
  ChallengeType,
  ChallengeVisibility,
} from "@/utils/types";
import { Clock, Users, Trophy, Download } from "lucide-react";

interface STLAnalysis {
  volume: number;
  surfaceArea: number;
  dimensionalAccuracy?: number;
  geometryMatch?: number;
}

// Mock reference STL data for comparison
const referenceSTLData = {
  volume: 2845.67, // mm³
  surfaceArea: 1247.89, // mm²
  criticalDimensions: {
    pitchDiameter: 48.0, // mm (24 teeth × 2mm module)
    outsideDiameter: 52.0, // mm
    hubDiameter: 30.0, // mm
    hubLength: 15.0, // mm
    keywayWidth: 6.0, // mm
    keywayDepth: 6.0, // mm
  },
};

// Mock challenge data
const challengeData: Challenge = {
  id: "1",
  title: "Basic Gear Design",
  description:
    "Create a simple spur gear with specific tooth profile and dimensions.",
  instructions:
    "Design a spur gear with 24 teeth, module 2mm, and pressure angle of 20°. The gear should have a hub with diameter 30mm and length 15mm. Include keyway with dimensions 6×6mm. Export your design as both native CAD format and STL.",
  level: ChallengeLevel.BEGINNER,
  type: ChallengeType.RACE_AGAINST_TIME,
  visibility: ChallengeVisibility.PUBLIC,
  points: 100,
  thumbnailUrl: "/placeholder.svg",
  status: ChallengeStatus.PUBLISHED,
  creatorId: "org1",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-01-15"),
  startDate: new Date("2023-01-15"),
  endDate: new Date("2023-12-31"),
  submissionCount: 876,
  successRate: 87,
};

// Mock data for quiz questions
const quizQuestions = [
  {
    id: "q1",
    question:
      "What is the formula to calculate the pitch diameter of a spur gear?",
    options: [
      "Pitch Diameter = Number of teeth × Module",
      "Pitch Diameter = Module / Number of teeth",
      "Pitch Diameter = 2 × Module × Number of teeth",
      "Pitch Diameter = Number of teeth / Module",
    ],
    correctAnswer: 0,
  },
  {
    id: "q2",
    question: "Which parameter directly affects the size of gear teeth?",
    options: ["Pressure angle", "Module", "Number of teeth", "Hub diameter"],
    correctAnswer: 1,
  },
  {
    id: "q3",
    question: "What is the purpose of the keyway in this design?",
    options: [
      "To reduce weight",
      "To transmit torque between shaft and gear",
      "To improve aesthetics",
      "To reduce material usage",
    ],
    correctAnswer: 1,
  },
];

const ChallengeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // State for file uploads
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [stlAnalysis, setStlAnalysis] = useState<STLAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notes, setNotes] = useState("");

  // State for quiz answers
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start timer when component mounts
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // STL Analysis Functions
  const calculateSurfaceArea = (vertices: number[][], normals: number[][]) => {
    let totalArea = 0;
    for (let i = 0; i < vertices.length; i += 3) {
      const v1 = vertices[i];
      const v2 = vertices[i + 1];
      const v3 = vertices[i + 2];

      const vec1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
      const vec2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

      const cross = [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
      ];

      const area =
        Math.sqrt(
          cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]
        ) / 2;

      totalArea += area;
    }
    return totalArea;
  };

  const calculateVolume = (vertices: number[][]) => {
    let volume = 0;
    for (let i = 0; i < vertices.length; i += 3) {
      const v1 = vertices[i];
      const v2 = vertices[i + 1];
      const v3 = vertices[i + 2];

      volume +=
        (v1[0] * (v2[1] * v3[2] - v2[2] * v3[1]) +
          v1[1] * (v2[2] * v3[0] - v2[0] * v3[2]) +
          v1[2] * (v2[0] * v3[1] - v2[1] * v3[0])) /
        6.0;
    }
    return Math.abs(volume);
  };

  const calculateDimensionalAccuracy = (submittedAnalysis: STLAnalysis) => {
    // Compare volume and surface area with reference
    const volumeAccuracy = Math.max(
      0,
      100 -
        (Math.abs(submittedAnalysis.volume - referenceSTLData.volume) /
          referenceSTLData.volume) *
          100
    );
    const surfaceAccuracy = Math.max(
      0,
      100 -
        (Math.abs(
          submittedAnalysis.surfaceArea - referenceSTLData.surfaceArea
        ) /
          referenceSTLData.surfaceArea) *
          100
    );

    // Average the accuracies
    return (volumeAccuracy + surfaceAccuracy) / 2;
  };

  const calculateGeometryMatch = (submittedAnalysis: STLAnalysis) => {
    // Simulate geometry matching based on volume ratio and surface area ratio
    const volumeRatio = submittedAnalysis.volume / referenceSTLData.volume;
    const surfaceRatio =
      submittedAnalysis.surfaceArea / referenceSTLData.surfaceArea;

    // Ideal ratios should be close to 1
    const volumeScore = Math.max(0, 100 - Math.abs(1 - volumeRatio) * 100);
    const surfaceScore = Math.max(0, 100 - Math.abs(1 - surfaceRatio) * 100);

    // Weight volume more heavily as it's more critical for functionality
    return volumeScore * 0.7 + surfaceScore * 0.3;
  };

  const calculateTimeScore = (timeInSeconds: number) => {
    // Time scoring: Max 30 points
    // Excellent: < 10 min (30 pts), Good: < 15 min (25 pts), Average: < 20 min (20 pts)
    // Fair: < 30 min (15 pts), Poor: > 30 min (10 pts)

    const timeInMinutes = timeInSeconds / 60;

    if (timeInMinutes < 10) return 30;
    if (timeInMinutes < 15) return 25;
    if (timeInMinutes < 20) return 20;
    if (timeInMinutes < 30) return 15;
    return 10;
  };

  const calculateQuizScore = (userAnswers: Record<string, number>) => {
    // Quiz scoring: Max 20 points
    const correctAnswers = quizQuestions.filter(
      (q) => userAnswers[q.id] === q.correctAnswer
    ).length;

    return Math.round((correctAnswers / quizQuestions.length) * 20);
  };

  const parseSTLFile = (file: File) => {
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const view = new DataView(buffer);
        const triangles = (buffer.byteLength - 84) / 50;

        const meshData = {
          vertices: [] as number[][],
          normals: [] as number[][],
        };

        let offset = 84;

        for (let i = 0; i < triangles; i++) {
          const nx = view.getFloat32(offset, true);
          const ny = view.getFloat32(offset + 4, true);
          const nz = view.getFloat32(offset + 8, true);
          meshData.normals.push([nx, ny, nz]);

          for (let j = 0; j < 3; j++) {
            const x = view.getFloat32(offset + 12 + j * 12, true);
            const y = view.getFloat32(offset + 16 + j * 12, true);
            const z = view.getFloat32(offset + 20 + j * 12, true);
            meshData.vertices.push([x, y, z]);
          }

          offset += 50;
        }

        const volume = calculateVolume(meshData.vertices);
        const surfaceArea = calculateSurfaceArea(
          meshData.vertices,
          meshData.normals
        );

        const analysis: STLAnalysis = {
          volume,
          surfaceArea,
          dimensionalAccuracy: calculateDimensionalAccuracy({
            volume,
            surfaceArea,
          }),
          geometryMatch: calculateGeometryMatch({ volume, surfaceArea }),
        };

        setStlAnalysis(analysis);
      } catch (error) {
        console.error("STL parsing error:", error);
        toast({
          title: "Analysis Failed",
          description:
            "Unable to parse STL file. Please check the file format.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleStlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStlFile(file);
      parseSTLFile(file);
    }
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    // Validate all required components are completed
    if (!stlFile || !stlAnalysis) {
      toast({
        title: "Missing file",
        description: "Please upload and analyze an STL file",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(answers).length < quizQuestions.length) {
      toast({
        title: "Incomplete quiz",
        description: "Please answer all quiz questions",
        variant: "destructive",
      });
      return;
    }

    // Stop timer
    setTimerActive(false);

    // Calculate scores
    const timeScore = calculateTimeScore(timeElapsed);
    const quizScore = calculateQuizScore(answers);
    const accuracyScore = Math.round(
      ((stlAnalysis.dimensionalAccuracy! + stlAnalysis.geometryMatch!) / 2) *
        0.5
    ); // Max 50 points
    const finalScore = timeScore + quizScore + accuracyScore;

    // Prepare quiz analysis
    const answerAnalysis = {
      correctAnswers: quizQuestions.filter(
        (q) => answers[q.id] === q.correctAnswer
      ).length,
      totalQuestions: quizQuestions.length,
      details: quizQuestions.map((q) => ({
        question: q.question,
        userAnswer: q.options[answers[q.id]],
        correctAnswer: q.options[q.correctAnswer],
        isCorrect: answers[q.id] === q.correctAnswer,
      })),
    };

    // Mock performance metrics
    const performanceMetrics = {
      rank: Math.floor(Math.random() * 100 + 1).toString(),
      percentile: Math.max(50, finalScore + Math.random() * 20),
      averageTime: 1320, // 22 minutes in seconds
      bestTime: 542, // 9:02 in seconds
    };

    // Create comprehensive results
    const results = {
      challengeId: id!,
      timeElapsed,
      finalScore,
      timeScore,
      accuracyScore,
      quizScore,
      stlAnalysis: {
        volume: stlAnalysis.volume,
        surfaceArea: stlAnalysis.surfaceArea,
        dimensionalAccuracy: stlAnalysis.dimensionalAccuracy!,
        geometryMatch: stlAnalysis.geometryMatch!,
      },
      answerAnalysis,
      performanceMetrics,
    };

    console.log("Submitting challenge with results:", results);

    toast({
      title: "Challenge submitted!",
      description: `Final score: ${finalScore}/100 in ${formatTime(
        timeElapsed
      )}`,
    });

    // Navigate to results page with results data
    navigate("/challenge-results", { state: { results } });
  };

  const handleGiveUp = () => {
    toast({
      title: "Challenge abandoned",
      description: "You can try this challenge again later.",
      variant: "destructive",
    });

    setTimerActive(false);
    navigate("/practice");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {challengeData.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="outline"
                  className={
                    challengeData.level === ChallengeLevel.BEGINNER
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                      : challengeData.level === ChallengeLevel.INTERMEDIATE
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
                      : challengeData.level === ChallengeLevel.ADVANCED
                      ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-800"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800"
                  }
                >
                  {challengeData.level}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-cadarena-50 text-cadarena-700 border-cadarena-200 dark:bg-cadarena-900 dark:text-cadarena-300 dark:border-cadarena-800"
                >
                  {challengeData.points} points
                </Badge>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm ml-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" onClick={handleGiveUp}>
                Give Up
              </Button>
              <Button onClick={handleSubmit}>Submit Challenge</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="instructions" className="w-full">
                <TabsList>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="reference">
                    Reference Materials
                  </TabsTrigger>
                  <TabsTrigger value="quiz">Knowledge Check</TabsTrigger>
                </TabsList>

                <TabsContent value="instructions" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Challenge Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[450px] pr-4">
                        <div className="space-y-4">
                          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                            <img
                              src="/placeholder.svg"
                              alt="Challenge reference image"
                              className="max-h-full object-contain"
                            />
                          </div>

                          <h3 className="font-semibold text-lg">Description</h3>
                          <p>{challengeData.description}</p>

                          <h3 className="font-semibold text-lg">
                            Requirements
                          </h3>
                          <div className="pl-4">
                            <p className="whitespace-pre-line">
                              {challengeData.instructions}
                            </p>
                          </div>

                          <h3 className="font-semibold text-lg">
                            Deliverables
                          </h3>
                          <ul className="list-disc pl-6 space-y-2">
                            <li>
                              CAD file in your preferred format (STEP, STP,
                              etc.)
                            </li>
                            <li>STL file for 3D printing validation</li>
                            <li>Complete the knowledge check questionnaire</li>
                          </ul>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reference" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reference Materials</CardTitle>
                      <CardDescription>
                        Use these resources to help complete the challenge
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[450px] pr-4">
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-2">
                              Technical Drawing
                            </h3>
                            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                              <img
                                src="/placeholder.svg"
                                alt="Technical drawing"
                                className="max-h-full object-contain"
                              />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Reference drawing with critical dimensions
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">
                              Formula Reference
                            </h3>
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <p className="font-mono">
                                Pitch Diameter (d) = m × z
                              </p>
                              <p className="font-mono">
                                Outside Diameter (da) = d + 2m
                              </p>
                              <p className="font-mono">
                                Root Diameter (df) = d - 2.5m
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Where: m = module, z = number of teeth
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Resources</h3>
                            <ul className="space-y-2">
                              <li>
                                <a
                                  href="#"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Gear Design Principles PDF
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Video Tutorial: Creating Spur Gears
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quiz" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Knowledge Check</CardTitle>
                      <CardDescription>
                        Answer the following questions about gear design
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[450px] pr-4">
                        <div className="space-y-8">
                          {quizQuestions.map((question, index) => (
                            <div key={question.id} className="space-y-3">
                              <h3 className="font-medium">
                                {index + 1}. {question.question}
                              </h3>
                              <RadioGroup
                                value={answers[question.id]?.toString()}
                                onValueChange={(value) =>
                                  handleQuizAnswer(question.id, parseInt(value))
                                }
                              >
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center space-x-2"
                                  >
                                    <RadioGroupItem
                                      value={optionIndex.toString()}
                                      id={`${question.id}-${optionIndex}`}
                                    />
                                    <Label
                                      htmlFor={`${question.id}-${optionIndex}`}
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Upload STL File</h3>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                        {stlFile ? (
                          <div>
                            <p className="text-sm font-medium">
                              {stlFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(stlFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {isAnalyzing && (
                              <p className="text-xs text-blue-600 mt-1">
                                Analyzing...
                              </p>
                            )}
                            {stlAnalysis && (
                              <div className="mt-2 text-xs space-y-1">
                                <p className="text-green-600">
                                  ✓ Analysis Complete
                                </p>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setStlFile(null);
                                setStlAnalysis(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              Upload STL file for validation
                            </p>
                            <div className="flex justify-center">
                              <label
                                htmlFor="stl-file"
                                className="cursor-pointer"
                              >
                                <div className="bg-cadarena-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-cadarena-700">
                                  Select File
                                </div>
                                <Input
                                  id="stl-file"
                                  type="file"
                                  className="hidden"
                                  accept=".stl"
                                  onChange={handleStlFileChange}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Required for 3D printing validation
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Additional Notes</h3>
                      <Textarea
                        placeholder="Add any comments or notes about your solution..."
                        className="min-h-[100px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Time elapsed: {formatTime(timeElapsed)}
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !stlFile ||
                      !stlAnalysis ||
                      isAnalyzing ||
                      Object.keys(answers).length < quizQuestions.length
                    }
                  >
                    Submit Solution
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle>Challenge Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm font-medium">
                        {challengeData.successRate}%
                      </span>
                    </div>
                    <Progress
                      value={challengeData.successRate}
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Submissions
                      </p>
                      <p className="text-xl font-semibold">
                        {challengeData.submissionCount}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Average Time
                      </p>
                      <p className="text-xl font-semibold">14:32</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeView;
