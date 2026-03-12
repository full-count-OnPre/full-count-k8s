# k6 Load Test Draft

## Environment Variables

```bash
export BASE_URL=http://PLACEHOLDER_BASE_URL
export GAME_ID=PLACEHOLDER_GAME_ID
export API_TOKEN=PLACEHOLDER_API_TOKEN
```

## Run Examples

```bash
k6 run sre-monitoring/loadtest/k6/schedules-list.js
k6 run sre-monitoring/loadtest/k6/live-page-api.js
k6 run sre-monitoring/loadtest/k6/comments-api.js
k6 run sre-monitoring/loadtest/k6/staged-traffic.js
```

## Notes

- `BASE_URL` should point to the frontend ingress domain or API gateway domain.
- `GAME_ID` should be a real MLB game identifier used by the backend.
- `API_TOKEN` is only needed if the comment API requires authentication.
