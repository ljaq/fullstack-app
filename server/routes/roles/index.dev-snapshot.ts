import { defineDevSnapshot } from "server/dev-snapshot";

export default defineDevSnapshot({
  enabled: true,
  asUser: {
    username: 'admin',
  },
  GET: {
    params: { id: '1' },
  },
})