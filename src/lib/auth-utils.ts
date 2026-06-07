export type LocationState = {
  from?: string
}

export function getRedirectTo(state: unknown) {
  const from = (state as LocationState | null)?.from

  if (!from || from === "/login" || from === "/register") {
    return "/"
  }

  return from.startsWith("/") ? from : "/"
}
