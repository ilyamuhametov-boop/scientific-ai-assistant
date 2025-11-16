export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_PDF = 'PROCESSING_PDF',
  READY = 'READY',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface LibraryArticle {
  id: string;
  fileName: string;
  fileDataUrl: string;
  pdfText: string;
  tags: string[];
  rating: number;
  notes: string;
  dateAdded: string;
  reminderDate?: string;
  reminderNote?: string;
  comments?: Comment[];
}

export interface GraphNode {
  id: number;
  label: string;
  title?: string;
}

export interface GraphEdge {
  from: number;
  to: number;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ComparisonArticle {
  fileName: string;
  pdfText: string;
}

export type UserPlan = 'free' | 'pro';
export type UserPlan = 'free' | 'pro';
