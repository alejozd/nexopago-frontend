export interface PagedResult<T> {
  data: T[];
  totalRecords: number;
}

export interface PagedParams {
  page: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
  search?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
