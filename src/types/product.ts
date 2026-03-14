export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  badge?: "New" | "Sale" | "Best Seller";
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}
