import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layouts/app-layout"
import { ProductsPage } from "./pages/products-page"
import { ProductPage } from "./pages/product-page"
import { CartPage } from "./pages/cart-page"
import { OrdersPage } from "./pages/orders-page"
import { AccountPage } from "./pages/account-page"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
    </Routes>
  )
}


export default App
