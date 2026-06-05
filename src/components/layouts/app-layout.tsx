import Header from "../shared/header"
import { Outlet } from "react-router-dom"


export function AppLayout() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Header/>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}