import { defineDevSnapshot } from "server/dev-snapshot";

export default defineDevSnapshot({
  enabled: true,
  asUser: {
    username: 'admin',
  },
  GET: {
    params: { id: '1' },
  },
  PUT: {
    params: { id: '0' },
    body: {
      username: 'test',
      password: '123456',
      roles: ['test'],
    },
  },
})