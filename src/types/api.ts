export type UUID = string
export type ISODateTime = string
export type Money = number

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export type ApiError = {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  errors?: Record<string, string>
}

export type CategorySummary = {
  id: UUID
  name: string
  slug: string
}

export type Category = CategorySummary & {
  description: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type CategoryRequest = {
  name: string
  description?: string
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"

export type Product = {
  id: UUID
  name: string
  description: string | null
  price: Money
  stockQuantity: number
  sku: string
  slug: string
  imageUrl: string | null
  category: CategorySummary | null
  status: ProductStatus
  averageRating: number | null
  reviewCount: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type ProductRequest = {
  name: string
  description?: string
  price: Money
  stockQuantity: number
  sku: string
  imageUrl?: string
  categoryId?: UUID
}

export type ProductSearchParams = {
  searchTerm?: string
  minPrice?: number
  maxPrice?: number
  onlyAvailable?: boolean
  categoryId?: UUID
  categorySlug?: string
  page?: number
  size?: number
  sort?: string
}

export type AddressRequest = {
  street: string
  city: string
  state?: string
  country: string
  zipcode: string
}

export type Address = AddressRequest & {
  id: UUID
  state: string | null
}

export type UserRole = "CUSTOMER" | "ADMIN"

export type User = {
  id: UUID
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  address: Address | null
  role: UserRole
  active: boolean
}

export type UserRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber?: string
  address?: AddressRequest
  role?: UserRole
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  token: string
  refreshToken: string
  userId: UUID
  email: string
}

export type CartItem = {
  id: UUID
  productId: UUID
  sku: string
  quantity: number
  priceAtAdded: Money
  totalPrice: Money
}

export type Cart = {
  id: UUID
  userId: UUID
  items: CartItem[]
  totalCartPrice: Money
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED"

export type OrderItem = {
  id: UUID
  productId: UUID
  productName: string
  sku: string
  priceAtPurchase: Money
  quantity: number
  totalPrice: Money
}

export type Order = {
  id: UUID
  orderNumber: string
  userId: UUID
  status: OrderStatus
  totalAmount: Money
  items: OrderItem[]
  createdAt: ISODateTime
}

export type ReviewRequest = {
  rating: number
  comment?: string
}

export type Review = {
  id: UUID
  productId: UUID
  userId: UUID
  authorName: string
  rating: number
  comment: string | null
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type WishlistItem = {
  id: UUID
  productId: UUID
  productName: string
  sku: string
  price: Money
  imageUrl: string | null
  addedAt: ISODateTime
}
