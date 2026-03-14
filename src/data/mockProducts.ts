import type { Product, Category } from "@/types/product";

import categoryClothing from "@/assets/category-clothing.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import categoryShoes from "@/assets/category-shoes.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productSunglasses from "@/assets/product-sunglasses.jpg";
import productBelt from "@/assets/product-belt.jpg";
import productSweater from "@/assets/product-sweater.jpg";

export const categories: Category[] = [
  { id: 1, name: "Clothing", slug: "clothing", count: 6 },
  { id: 2, name: "Accessories", slug: "accessories", count: 5 },
  { id: 3, name: "Shoes", slug: "shoes", count: 3 },
];

export const products: Product[] = [
  {
    id: 1, name: "Tailored Wool Blazer", slug: "tailored-wool-blazer",
    description: "Premium tailored blazer crafted from Italian wool blend. Perfect for both formal and smart-casual occasions.",
    price: 189, salePrice: 149, stockQuantity: 12, categoryId: 1, categoryName: "Clothing",
    imageUrl: categoryClothing, rating: 4.8, reviewCount: 24, badge: "Sale", createdAt: "2026-02-15",
  },
  {
    id: 2, name: "Leather Crossbody Bag", slug: "leather-crossbody-bag",
    description: "Handcrafted full-grain leather crossbody bag with adjustable strap and gold-tone hardware.",
    price: 120, stockQuantity: 8, categoryId: 2, categoryName: "Accessories",
    imageUrl: categoryAccessories, rating: 4.6, reviewCount: 18, createdAt: "2026-01-20",
  },
  {
    id: 3, name: "Classic Oxford Shoes", slug: "classic-oxford-shoes",
    description: "Timeless leather oxford shoes with Goodyear welt construction for lasting durability.",
    price: 165, stockQuantity: 15, categoryId: 3, categoryName: "Shoes",
    imageUrl: categoryShoes, rating: 4.9, reviewCount: 32, badge: "Best Seller", createdAt: "2025-11-10",
  },
  {
    id: 4, name: "Silk Blend Scarf", slug: "silk-blend-scarf",
    description: "Luxurious silk-cashmere blend scarf in a timeless pattern. Lightweight yet warm.",
    price: 75, stockQuantity: 20, categoryId: 2, categoryName: "Accessories",
    imageUrl: categoryAccessories, rating: 4.4, reviewCount: 11, badge: "New", createdAt: "2026-03-01",
  },
  {
    id: 5, name: "Heritage Leather Watch", slug: "heritage-leather-watch",
    description: "Swiss-movement watch with sapphire crystal and hand-stitched Italian leather strap.",
    price: 295, stockQuantity: 5, categoryId: 2, categoryName: "Accessories",
    imageUrl: productWatch, rating: 4.9, reviewCount: 41, badge: "Best Seller", createdAt: "2025-09-05",
  },
  {
    id: 6, name: "Aviator Sunglasses", slug: "aviator-sunglasses",
    description: "Gold-frame aviator sunglasses with polarized lenses and UV400 protection.",
    price: 135, salePrice: 99, stockQuantity: 22, categoryId: 2, categoryName: "Accessories",
    imageUrl: productSunglasses, rating: 4.5, reviewCount: 15, badge: "Sale", createdAt: "2026-02-01",
  },
  {
    id: 7, name: "Italian Leather Belt", slug: "italian-leather-belt",
    description: "Full-grain Italian leather belt with brushed brass buckle. 35mm width.",
    price: 85, stockQuantity: 30, categoryId: 2, categoryName: "Accessories",
    imageUrl: productBelt, rating: 4.7, reviewCount: 27, createdAt: "2025-12-15",
  },
  {
    id: 8, name: "Cashmere Ribbed Sweater", slug: "cashmere-ribbed-sweater",
    description: "100% Mongolian cashmere ribbed-knit sweater. Relaxed fit with rolled edges.",
    price: 220, stockQuantity: 9, categoryId: 1, categoryName: "Clothing",
    imageUrl: productSweater, rating: 4.8, reviewCount: 19, badge: "New", createdAt: "2026-03-05",
  },
  {
    id: 9, name: "Suede Chelsea Boots", slug: "suede-chelsea-boots",
    description: "Premium suede Chelsea boots with leather sole and elastic side panels.",
    price: 195, salePrice: 159, stockQuantity: 7, categoryId: 3, categoryName: "Shoes",
    imageUrl: categoryShoes, rating: 4.6, reviewCount: 22, badge: "Sale", createdAt: "2026-01-10",
  },
  {
    id: 10, name: "Linen Summer Shirt", slug: "linen-summer-shirt",
    description: "Breathable pure linen shirt with mother-of-pearl buttons. Relaxed fit.",
    price: 95, stockQuantity: 18, categoryId: 1, categoryName: "Clothing",
    imageUrl: categoryClothing, rating: 4.3, reviewCount: 9, createdAt: "2026-02-20",
  },
  {
    id: 11, name: "Merino Wool Coat", slug: "merino-wool-coat",
    description: "Double-breasted merino wool coat with satin lining. A wardrobe essential.",
    price: 345, stockQuantity: 4, categoryId: 1, categoryName: "Clothing",
    imageUrl: categoryClothing, rating: 4.9, reviewCount: 36, badge: "Best Seller", createdAt: "2025-10-01",
  },
  {
    id: 12, name: "Canvas Sneakers", slug: "canvas-sneakers",
    description: "Minimalist canvas sneakers with vulcanized rubber sole. Versatile everyday wear.",
    price: 79, stockQuantity: 25, categoryId: 3, categoryName: "Shoes",
    imageUrl: categoryShoes, rating: 4.2, reviewCount: 14, badge: "New", createdAt: "2026-03-08",
  },
];
