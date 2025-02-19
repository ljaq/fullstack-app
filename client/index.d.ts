import { UpdatableRouteOptions, Register } from '@tanstack/react-router'
import { ReactNode } from 'react'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }

  interface UpdatableRouteOptions {
    meta?: {
      name?: string
      icon?: ReactNode
    }
  }
}
