## 2024-05-18 - [Frontend Polling & API Rate Limiting Bottleneck]
**Learning:** The frontend makes a request to `/data` every 5 seconds which resulted in synchronous calls to external weather APIs. This not only causes severe latency on the backend but risks immediate rate-limiting by the external APIs, effectively breaking the application.
**Action:** When working on real-time polling frontends, always ensure that data fetched from rate-limited external APIs on the backend is cached (e.g. TTL cache) to decouple client polling frequency from external API request frequency.
