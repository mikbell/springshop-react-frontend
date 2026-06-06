import { Footer } from "../shop/footer"
import Header from "../shop/header"
import { Outlet } from "react-router-dom"


export function ShopLayout() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Header/>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}