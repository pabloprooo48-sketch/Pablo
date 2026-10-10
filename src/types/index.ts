export interface LineItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  measurement: number;
  unit: 'm²' | 'ud' | 'ml' | 'h' | 'días';
  unitPrice: number;
  subtotal: number;
}

export type QuoteStatus = 'draft' | 'pending' | 'accepted' | 'rejected';

export interface QuotePhoto {
  id: string;
  url: string;
  label: string;
}

export interface Quote {
  id: string;
  ref: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  conceptSummary: string;
  items: LineItem[];
  photos: QuotePhoto[];
  ivaRate: number; // 21, 10, or 0
  validityDays: number; // 15, 30, 60
  status: QuoteStatus;
  statusLabel?: string;
  statusType?: 'viewed' | 'sent' | 'accepted' | 'draft';
  viewedAgo?: string;
  lastViewedDate?: string;
  dateCreated: string;
  dateSent?: string;
  customMessage?: string;
}

export interface FollowUpItem {
  id: string;
  quoteId: string;
  clientName: string;
  clientPhone: string;
  quoteRef: string;
  amount: number;
  type: 'priority_viewed' | 'pending_unopened';
  statusBadge: string;
  statusBadgeType: 'priority' | 'pending';
  lastActivity: string;
  isRead: boolean;
  suggestedMessage: string;
  snoozedUntil?: string;
}

export interface BusinessProfile {
  name: string;
  tradeType: string;
  cif: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  iban: string;
  monthlyGoal: number;
  closingRate: number;
}

export interface CatalogItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  unit: 'm²' | 'ud' | 'ml' | 'h';
  defaultPrice: number;
}
