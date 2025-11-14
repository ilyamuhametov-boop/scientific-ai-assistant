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
  id: string; // Composite key: `${fileName}-${fileSize}`
  fileName: string;
  fileDataUrl: string; // Store file content as a base64 Data URL
  pdfText: string;
  tags: string[];
  rating: number; // 0-5
  notes: string;
  dateAdded: string; // ISO string
  reminderDate?: string; // Optional: ISO string for the reminder
  reminderNote?: string; // Optional: A short note for the reminder
  comments?: Comment[]; // Optional: for shared workspace
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