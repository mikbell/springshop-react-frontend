import { apiRequest, clearAuthTokens, getRefreshToken, setAuthTokens } from "@/api/client"
import type {
  Address,
  AddressRequest,
  AuthResponse,
  Cart,
  Category,
  CategoryRequest,
  LoginRequest,
  Order,
  OrderStatus,
  PageResponse,
  Product,
  ProductRequest,
  ProductSearchParams,
  Review,
  ReviewRequest,
  User,
  UserRequest,
  UUID,
  WishlistItem,
} from "@/types/api"

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await apiRequest<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    })
    setAuthTokens(response)
    return response
  },
  register(payload: UserRequest) {
    return apiRequest<User>("/api/v1/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    })
  },
  async logout() {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      await apiRequest<void>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined)
    }
    clearAuthTokens()
  },
}

export const productsApi = {
  list(params: ProductSearchParams = {}) {
    return apiRequest<PageResponse<Product>>("/api/v1/products", {
      auth: false,
      query: params,
    })
  },
  byId(id: UUID) {
    return apiRequest<Product>(`/api/v1/products/id/${id}`, { auth: false })
  },
  bySlug(slug: string) {
    return apiRequest<Product>(`/api/v1/products/slug/${slug}`, { auth: false })
  },
  create(payload: ProductRequest) {
    return apiRequest<Product>("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update(id: UUID, payload: ProductRequest) {
    return apiRequest<Product>(`/api/v1/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  remove(id: UUID) {
    return apiRequest<void>(`/api/v1/products/${id}`, { method: "DELETE" })
  },
}

export const categoriesApi = {
  list() {
    return apiRequest<Category[]>("/api/v1/categories", { auth: false })
  },
  create(payload: CategoryRequest) {
    return apiRequest<Category>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update(id: UUID, payload: CategoryRequest) {
    return apiRequest<Category>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  remove(id: UUID) {
    return apiRequest<void>(`/api/v1/categories/${id}`, { method: "DELETE" })
  },
}

export const userApi = {
  me() {
    return apiRequest<User>("/api/v1/users/me")
  },
  updateMe(payload: UserRequest) {
    return apiRequest<User>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  address() {
    return apiRequest<Address>("/api/v1/users/me/address")
  },
  upsertAddress(payload: AddressRequest) {
    return apiRequest<Address>("/api/v1/users/me/address", {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  deleteAddress() {
    return apiRequest<void>("/api/v1/users/me/address", { method: "DELETE" })
  },
  list() {
    return apiRequest<User[]>("/api/v1/users")
  },
}

export const cartApi = {
  get() {
    return apiRequest<Cart>("/api/v1/carts")
  },
  add(productId: UUID, quantity: number) {
    return apiRequest<Cart>("/api/v1/carts/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    })
  },
  update(productId: UUID, quantity: number) {
    return apiRequest<Cart>(`/api/v1/carts/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  },
  remove(productId: UUID) {
    return apiRequest<Cart>(`/api/v1/carts/items/${productId}`, {
      method: "DELETE",
    })
  },
  clear() {
    return apiRequest<Cart>("/api/v1/carts", { method: "DELETE" })
  },
}

export const ordersApi = {
  checkout() {
    return apiRequest<Order>("/api/v1/orders", { method: "POST" })
  },
  mine() {
    return apiRequest<Order[]>("/api/v1/orders")
  },
  get(id: UUID) {
    return apiRequest<Order>(`/api/v1/orders/${id}`)
  },
  adminList(params: { status?: OrderStatus; page?: number; size?: number } = {}) {
    return apiRequest<PageResponse<Order>>("/api/v1/admin/orders", {
      query: params,
    })
  },
  updateStatus(id: UUID, status: OrderStatus) {
    return apiRequest<Order>(`/api/v1/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },
}

export const reviewsApi = {
  list(productId: UUID, params: { page?: number; size?: number } = {}) {
    return apiRequest<PageResponse<Review>>(
      `/api/v1/products/${productId}/reviews`,
      { auth: false, query: params }
    )
  },
  create(productId: UUID, payload: ReviewRequest) {
    return apiRequest<Review>(`/api/v1/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  update(reviewId: UUID, payload: ReviewRequest) {
    return apiRequest<Review>(`/api/v1/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  remove(reviewId: UUID) {
    return apiRequest<void>(`/api/v1/reviews/${reviewId}`, { method: "DELETE" })
  },
}

export const wishlistApi = {
  list() {
    return apiRequest<WishlistItem[]>("/api/v1/wishlist")
  },
  add(productId: UUID) {
    return apiRequest<WishlistItem>(`/api/v1/wishlist/items/${productId}`, {
      method: "POST",
    })
  },
  remove(productId: UUID) {
    return apiRequest<void>(`/api/v1/wishlist/items/${productId}`, {
      method: "DELETE",
    })
  },
  clear() {
    return apiRequest<void>("/api/v1/wishlist", { method: "DELETE" })
  },
}
