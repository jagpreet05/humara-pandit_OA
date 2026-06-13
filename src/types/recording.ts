export type RecordingStatus = 'pending' | 'completed' | 'archived';

export interface Recording {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  date: string;
  duration: number; // seconds
  fileSize: number; // bytes
  status: RecordingStatus;
  notes: string;
  tags: string[];
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordingFilters {
  search: string;
  clientId: string;
  status: RecordingStatus | 'all';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date_desc' | 'date_asc' | 'duration_desc' | 'duration_asc' | 'title_asc';
}

export interface PaginatedRecordings {
  data: Recording[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
