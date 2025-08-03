import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export default function Redirect({ to }: { to: string }) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to)
  }, [to])

  return <></>
}
