# Load Test Results (Run #1)

## Executive Summary
Simulated traffic against the Supabase backend revealed a distinct performance plateau at approximately **25 Requests Per Second (RPS)**. The system scales linearly up to 10 simulated concurrent users but experiences significant latency degradation at 50 concurrent users.

## detailed Metrics

| Users | RPS | Avg Latency | P95 Latency | P99 Latency | Status |
|-------|-----|-------------|-------------|-------------|--------|
| 1     | 2.7 | 371ms       | 609ms       | 976ms       | Healthy |
| 10    | 24.0| 405ms       | 732ms       | 937ms       | Healthy |
| 50    | 27.0| 1034ms      | 1693ms      | 10.3s       | **Degraded** |

## Key Findings
1.  **Throughput Cap**: Total throughput seems capped around 25-30 RPS. This likely corresponds to the Supabase project's compute size (Micro/Free tier) or connection pooling limits.
2.  **Latency Spike**: At 50 concurrent users, average latency doubles (400ms -> 1000ms), and tail latency (P99) hits >10s.
3.  **Stability**: Zero failed requests (errors), which indicates the system queues requests rather than dropping them immediately, ensuring data reliability at the cost of speed.

## Recommendations
1.  **Caching**: The `getDownloadStats` query is heavy (aggregates). Recommendation: Cache this result in a separate `stats_cache` table or Edge Function (Redis) with a 5-minute TTL to reduce database load.
2.  **Pagination**: Ensure `getDownloadHistory` (fetching 30 days) is strictly limited or pre-aggregated.
3.  **Connection Pooling**: Verify Supabase connection pool settings if higher concurrency is required.
