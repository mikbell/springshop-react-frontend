import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import { authApi, userApi } from "@/api/handlers"
import { clearAuthTokens, getAccessToken } from "@/api/client"
import { queryKeys } from "@/lib/query-keys"
import type { LoginRequest, User, UserRequest } from "@/types/api"

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginRequest) => Promise<User | null>
  register: (payload: UserRequest) => Promise<void>
  logout: () => Promise<void>
  reloadUser: () => Promise<User | null>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(Boolean(getAccessToken()))

  const reloadUser = React.useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    try {
      const nextUser = await userApi.me()
      setUser(nextUser)
      return nextUser
    } catch {
      clearAuthTokens()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void reloadUser()
    const onAuthChanged = () => void reloadUser()
    window.addEventListener("springshop:auth-changed", onAuthChanged)
    return () => window.removeEventListener("springshop:auth-changed", onAuthChanged)
  }, [reloadUser])

  const login = React.useCallback(
    async (payload: LoginRequest) => {
      await authApi.login(payload)
      const nextUser = await reloadUser()
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist })
      return nextUser
    },
    [queryClient, reloadUser]
  )

  const register = React.useCallback(async (payload: UserRequest) => {
    await authApi.register(payload)
  }, [])

  const logout = React.useCallback(async () => {
    await authApi.logout()
    setUser(null)
    queryClient.removeQueries({ queryKey: queryKeys.cart })
    queryClient.removeQueries({ queryKey: queryKeys.orders })
    queryClient.removeQueries({ queryKey: queryKeys.wishlist })
    queryClient.removeQueries({ queryKey: queryKeys.adminOrders })
  }, [queryClient])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout,
      reloadUser,
    }),
    [loading, login, logout, register, reloadUser, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
