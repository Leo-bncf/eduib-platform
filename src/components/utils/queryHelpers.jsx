/**
 * Query optimization helpers for common data fetching patterns
 */
import { base44 } from '@/api/base44Client';

export const DEFAULT_PAGE_SIZE = 20;
export const DASHBOARD_PAGE_SIZE = 10;

export async function paginatedQuery(
  entityName,
  filter = {},
  pageSize = DEFAULT_PAGE_SIZE,
  page = 0,
  sort = '-updated_date'
) {
  const skip = page * pageSize;
  const items = await base44.entities[entityName].filter(filter, sort, pageSize, skip);
  return {
    items,
    page,
    pageSize,
    hasMore: items.length === pageSize,
  };
}

export async function batchQueries(queries) {
  return Promise.all(queries.map(({ entity, filter, sort, limit }) =>
    base44.entities[entity].filter(filter, sort, limit)
  ));
}

export async function getDashboardMetrics(schoolId, entityCounts) {
  const metrics = {};
  const results = await Promise.all(
    entityCounts.map(entity =>
      base44.entities[entity].filter({ school_id: schoolId })
    )
  );

  entityCounts.forEach((entity, idx) => {
    metrics[entity] = results[idx].length;
  });

  return metrics;
}