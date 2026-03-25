import { defineDevSnapshot } from 'server/dev-snapshot/define'

export default defineDevSnapshot({
  enabled: true,
  asUser: {
    username: 'admin',
  },
  GET: {
    query: {
      page: '1',
      pageSize: '10',
    },
  },
})
