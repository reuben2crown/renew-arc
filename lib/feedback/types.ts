/**
 * Feedback Service Contract
 * 
 * Provides interface for user feedback, NPS surveys, and support tickets.
 */

export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'general' | 'complaint';
  message: string;
  rating?: number; // 1-5 stars
  screenshotUrl?: string;
  pageUrl?: string;
  metadata?: Record<string, any>;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface NPSSurvey {
  id: string;
  userId: string;
  score: number; // 0-10
  comment?: string;
  category: 'detractor' | 'passive' | 'promoter';
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  assigneeId?: string;
  tags: string[];
  conversation: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'support';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface FeedbackWidgetConfig {
  enabled: boolean;
  position: 'bottom-left' | 'bottom-right';
  theme: 'light' | 'dark' | 'auto';
  customBranding?: {
    primaryColor: string;
    logoUrl?: string;
  };
  triggers: {
    showOnPageVisit: boolean;
    delayMs: number;
    showAfterActions: string[];
  };
}

export interface SubmitFeedbackParams {
  userId: string;
  type: Feedback['type'];
  message: string;
  rating?: number;
  screenshot?: File;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

export interface SubmitNPSParams {
  userId: string;
  score: number;
  comment?: string;
}

export interface CreateSupportTicketParams {
  userId: string;
  subject: string;
  message: string;
  priority?: SupportTicket['priority'];
  tags?: string[];
}

export interface FeedbackProvider {
  /**
   * Initialize feedback widget
   */
  init(config: FeedbackWidgetConfig): void;

  /**
   * Show feedback widget
   */
  show(): void;

  /**
   * Hide feedback widget
   */
  hide(): void;

  /**
   * Submit feedback
   */
  submitFeedback(params: SubmitFeedbackParams): Promise<Feedback>;

  /**
   * Submit NPS score
   */
  submitNPS(params: SubmitNPSParams): Promise<NPSSurvey>;

  /**
   * Create support ticket
   */
  createTicket(params: CreateSupportTicketParams): Promise<SupportTicket>;

  /**
   * Get user's feedback history
   */
  getUserFeedback(userId: string): Promise<Feedback[]>;

  /**
   * Get user's tickets
   */
  getUserTickets(userId: string): Promise<SupportTicket[]>;

  /**
   * Add message to ticket
   */
  addTicketMessage(ticketId: string, senderId: string, message: string, attachments?: File[]): Promise<TicketMessage>;

  /**
   * Update ticket status
   */
  updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<SupportTicket>;
}

/**
 * NPS Categories based on score
 */
export function getNPSCategory(score: number): NPSSurvey['category'] {
  if (score <= 6) return 'detractor';
  if (score <= 8) return 'passive';
  return 'promoter';
}

/**
 * Default feedback widget configuration
 */
export const DEFAULT_FEEDBACK_CONFIG: FeedbackWidgetConfig = {
  enabled: true,
  position: 'bottom-right',
  theme: 'auto',
  triggers: {
    showOnPageVisit: false,
    delayMs: 30000, // Show after 30 seconds
    showAfterActions: ['ce_uploaded', 'report_generated'],
  },
};

/**
 * Common feedback tags for categorization
 */
export const FEEDBACK_TAGS = {
  OCR_ISSUES: 'ocr-issues',
  UI_UX: 'ui-ux',
  PERFORMANCE: 'performance',
  BILLING: 'billing',
  FEATURE_REQUEST: 'feature-request',
  BUG: 'bug',
  COMPLIMENT: 'compliment',
  STATE_SPECIFIC: 'state-specific',
} as const;
