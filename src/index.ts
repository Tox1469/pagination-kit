export interface OffsetParams {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
}

export interface OffsetResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function parseOffset(params: OffsetParams): { limit: number; offset: number; page: number; pageSize: number } {
  const pageSize = Math.min(Math.max(1, params.pageSize ?? 20), params.maxPageSize ?? 100);
  const page = Math.max(1, params.page ?? 1);
  return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize };
}

export function buildOffsetResponse<T>(items: T[], total: number, params: OffsetParams): OffsetResult<T> {
  const { page, pageSize } = parseOffset(params);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { items, page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

export interface CursorParams {
  cursor?: string | null;
  limit?: number;
  maxLimit?: number;
}

export interface CursorResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function encodeCursor(value: string | number): string {
  return Buffer.from(String(value)).toString("base64url");
}

export function decodeCursor(cursor: string | null | undefined): string | null {
  if (!cursor) return null;
  try { return Buffer.from(cursor, "base64url").toString("utf8"); } catch { return null; }
}

export function buildCursorResponse<T>(
  items: T[],
  limit: number,
  getCursor: (item: T) => string | number,
): CursorResult<T> {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const last = sliced[sliced.length - 1];
  return {
    items: sliced,
    nextCursor: hasMore && last ? encodeCursor(getCursor(last)) : null,
    hasMore,
  };
}

export function parseCursor(params: CursorParams) {
  const limit = Math.min(Math.max(1, params.limit ?? 20), params.maxLimit ?? 100);
  return { limit, cursor: decodeCursor(params.cursor) };
}
