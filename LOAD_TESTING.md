# Load Testing Strategy & Implementation Plan

## 1. Objective
To assess the performance, reliability, and limits of the application's backend infrastructure (Supabase) and frontend delivery under simulated user traffic. The goal is to identify bottlenecks in database queries, storage I/O, and API quotas before they impact real users.

## 2. Scope
Given the application architecture (Client-Side React + Supabase BaaS), the load testing will focus on:
- **Database Load**: Query performance, specifically for analytics and content fetching.
- **Write Throughput**: Insert performance for "Track Download" and release creation events.
- **Concurrent Connections**: Testing the limits of Supabase connection pooling and Realtime subscriptions.
- **Latency**: End-to-end response time for critical user paths (e.g., "Page Load" -> "Fetch Stats").

## 3. Key Metrics
- **RPS (Requests Per Second)**: Sustainable throughput.
- **P95 & P99 Latency**: 95th and 99th percentile response times (target: < 500ms for APIs).
- **Error Rate**: Percentage of failed requests (target: < 1%).
- **Database CPU/Memory**: (Monitored via Supabase Dashboard).

## 4. Test Scenarios
We will simulate the following critical user journeys:

### Scenario A: The "lurker" (Read Heavy)
*Simulates a user visiting the dashboard.*
1.  Fetch `getLatestRelease` (1 DB Read).
2.  Fetch `getDownloadStats` (4 Parallel DB Reads).
3.  Fetch `getDownloadHistory` (1 DB Read, potentially complex).

### Scenario B: The "Downloader" (Write Intensive)
*Simulates a user downloading the APK.*
1.  Call `trackDownload` (1 DB Write).
2.  (Optional) Verify Realtime subscription update.

### Scenario C: Admin Spike
*Simulates an admin uploading a release (Lower frequency, higher weight).*
1.  `uploadApk` (Storage I/O).
2.  `createReleaseRecord` (DB Write).

## 5. Implementation Strategy
We will use a custom **Node.js Load Simulator** to execute these scenarios.
*Why Node.js?* It allows us to natively use the `@supabase/supabase-js` SDK, providing the most accurate representation of client behavior without needing to reverse-engineer API signatures for generic HTTP tools.

### Phased Execution
1.  **Baseline**: Single user, verify function.
2.  **Ramp Up**: 10 -> 50 -> 100 concurrent simulated users.
3.  **Stress**: Find the breaking point (Rate limits or Timeout).

## 6. Success Criteria
- **Stats API**: < 300ms p95 at 50 concurrent users.
- **Tracking**: 100% data integrity (no lost inserts).
- **Stability**: No 5xx errors or socket disconnects during the test window.
