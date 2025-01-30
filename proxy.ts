export default {
  '/api': {
    target: process.env.SERVER_API,
    changeOrigin: true,
  },
}
