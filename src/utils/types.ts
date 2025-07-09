export enum UserRole {
  STUDENT = "student",
  ORGANIZATION = "organization",
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Student extends User {
  streak: number;
  points: number;
  completedChallenges: number;
  level: number;
  achievements: Achievement[];
}

export interface Organization extends User {
  name: string;
  description: string;
  website?: string;
  logoUrl?: string;
  contestsCreated: number;
  verified: boolean;
  memberSince: Date;
  industry: string;
  location: string;
  employees?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  level: ChallengeLevel;
  type: ChallengeType;
  visibility: ChallengeVisibility;
  points: number;
  thumbnailUrl: string;
  status: ChallengeStatus;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  submissionCount: number;
  successRate: number;
  averageCompletionTime?: number;
  referenceMaterials?: ReferenceMaterial[];
  quizQuestions?: QuizQuestion[];
  inviteToken?: string;
  contestName?: string;
}

export interface ReferenceMaterial {
  id: string;
  type: "image" | "document" | "video" | "link";
  title: string;
  description?: string;
  url: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  challengeIds: string[];
  startDate: Date;
  endDate: Date;
  registeredUsers: number;
  status: "upcoming" | "active" | "completed" | "draft";
  prizes?: string[];
  visibility: ChallengeVisibility;
  registrationType: "open" | "invitation" | "approval";
  inviteToken?: string;
  maxParticipants?: number;
}

export interface ContestParticipant {
  id: string;
  contestId: string;
  userId: string;
  registeredAt: Date;
  inviteToken?: string;
  status: "registered" | "active" | "completed" | "disqualified";
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  contestId?: string;
  submittedAt: Date;
  status: "correct" | "incorrect" | "pending" | "reviewing";
  fileUrl: string;
  score?: number;
  completionTime: number;
  quizAnswers?: Record<string, number>;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  contestId: string;
  issuedAt: Date;
  certificateUrl: string;
  achievementType: "winner" | "runner-up" | "participation";
  issuerName: string;
  contestTitle: string;
}

export interface UserFollowRelation {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface ContestInviteLink {
  id: string;
  contestId: string;
  token: string;
  createdAt: Date;
  expiresAt?: Date;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

export enum ChallengeLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

export enum ChallengeType {
  RACE_AGAINST_TIME = "race_against_time",
  ACCURACY_FOCUSED = "accuracy_focused",
  CREATIVE_DESIGN = "creative_design",
  PROBLEM_SOLVING = "problem_solving",
}

export enum ChallengeVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  ORGANIZATION_ONLY = "organization_only",
}

export enum ChallengeStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  level: ChallengeLevel;
  type: ChallengeType;
  visibility: ChallengeVisibility;
  points: number;
  thumbnailUrl: string;
  status: ChallengeStatus;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  submissionCount: number;
  successRate: number;
}
