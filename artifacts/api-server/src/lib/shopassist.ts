import type {
  Activity,
  CategoryMetric,
  CustomerProfile,
  Dashboard,
  Order,
  Product,
  Return,
  TimelineStep,
  ToolMetric,
  TrendPoint,
} from "@workspace/api-zod";

const imageUrls = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
];

type ProductSeed = [string, string, number, number, number, string];

const productSeed: ProductSeed[] = [
  ["Wireless Headphones", "Electronics", 2499, 4.5, 24, "Deep bass, adaptive noise cancellation, and 32-hour battery life."],
  ["AeroRun Knit Trainers", "Footwear", 4299, 4.8, 11, "Breathable everyday trainers built for light runs and long walks."],
  ["Everyday Linen Shirt", "Fashion", 1899, 4.4, 38, "Soft, relaxed-fit linen with an easy summer drape."],
  ["Pulse Smartwatch", "Electronics", 6999, 4.6, 7, "Sleep, heart-rate, and workout tracking in a slim aluminium case."],
  ["CloudSoft Pillow", "Home", 1299, 4.7, 52, "Cooling memory foam support for side and back sleepers."],
  ["Glow Vitamin C Serum", "Beauty", 899, 4.5, 29, "A brightening daily serum with gentle, non-sticky absorption."],
  ["TrailFlex Running Shorts", "Sports", 1599, 4.3, 18, "Lightweight, quick-dry shorts with a secure phone pocket."],
  ["Compact Air Fryer", "Home", 5499, 4.4, 5, "Crisp snacks with less oil and a simple one-dial control."],
  ["Everyday Canvas Tote", "Fashion", 799, 4.2, 64, "Heavyweight cotton canvas with an interior laptop sleeve."],
  ["ProCharge Power Bank", "Electronics", 2199, 4.6, 16, "20,000 mAh fast charging with USB-C and dual output."],
  ["Studio Ceramic Set", "Home", 2499, 4.8, 9, "Four hand-finished mugs in a warm, speckled glaze."],
  ["Calm Face Cleanser", "Beauty", 649, 4.5, 44, "Low-foam cleanser for a clean, comfortable finish."],
  ["Recovery Foam Roller", "Sports", 1799, 4.6, 13, "Textured density for post-workout muscle recovery."],
  ["Leather Crossbody Bag", "Fashion", 3299, 4.7, 4, "Compact vegetable-tanned leather bag with an adjustable strap."],
  ["Mini Projector", "Electronics", 8999, 4.1, 3, "Portable 1080p projection for movie nights anywhere."],
  ["Bamboo Desk Organizer", "Home", 1099, 4.4, 21, "A tidy home for pens, cables, and daily desk essentials."],
  ["Hydra Gel Moisturizer", "Beauty", 1099, 4.6, 31, "A featherlight gel cream that locks in all-day hydration."],
  ["FlexGrip Yoga Mat", "Sports", 1999, 4.8, 14, "Cushioned, grippy, and easy to roll for home practice."],
  ["Classic Oxford Shirt", "Fashion", 2199, 4.5, 19, "A polished cotton staple with a comfortable tailored fit."],
  ["Smart LED Bulb Duo", "Home", 1499, 4.3, 22, "Warm-to-cool light with app and voice control."],
  ["Pulse Wireless Mouse", "Electronics", 1599, 4.5, 26, "Quiet clicks, ergonomic shape, and multi-device pairing."],
  ["Daily SPF 50", "Beauty", 749, 4.7, 47, "Invisible, non-greasy sun protection for every morning."],
  ["Hydration Running Belt", "Sports", 999, 4.2, 27, "Bounce-free storage for keys, phone, and a small bottle."],
  ["Relaxed Cargo Pants", "Fashion", 2399, 4.3, 12, "Roomy utility pockets and a soft, structured cotton twill."],
  ["Digital Kitchen Scale", "Home", 899, 4.6, 34, "Precise gram measurements with a clear backlit display."],
  ["Mechanical Keyboard", "Electronics", 4999, 4.8, 8, "Tactile switches, compact layout, and warm backlighting."],
  ["Overnight Repair Mask", "Beauty", 1299, 4.4, 15, "A nourishing overnight mask for a softer morning glow."],
  ["Commuter Sneakers", "Footwear", 3799, 4.5, 6, "Cushioned low-profile sneakers for everyday city miles."],
  ["Resistance Band Kit", "Sports", 1399, 4.6, 20, "Five progressive bands with a door anchor and carry bag."],
  ["Soft Knit Throw", "Home", 1899, 4.7, 10, "A textured, machine-washable layer for cool evenings."],
];

export const products: Product[] = productSeed.map(
  ([name, category, price, rating, stock, description], index) => ({
    id: `PROD-${String(index + 1).padStart(3, "0")}`,
    name,
    category,
    price,
    rating,
    stock,
    description,
    image: imageUrls[index % imageUrls.length],
  }),
);

const statuses = ["Delivered", "Delivered", "Shipped", "Out for Delivery", "Processing"] as const;

function timelineFor(status: string, date: string): TimelineStep[] {
  const labels = ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const currentIndex = status === "Cancelled" ? 0 : Math.max(0, labels.indexOf(status));
  return labels.map((label, index) => ({
    label,
    date: index <= currentIndex ? date : "Upcoming",
    completed: index < currentIndex,
    current: index === currentIndex,
  }));
}

export const orders: Order[] = Array.from({ length: 30 }, (_, index) => {
  const orderNumber = 1001 + index;
  const product = products[index % products.length];
  const status = index === 23 ? "Out for Delivery" : statuses[index % statuses.length];
  const date = `2026-${String(8 - Math.floor(index / 12)).padStart(2, "0")}-${String(28 - (index % 20)).padStart(2, "0")}`;
  return {
    id: `#QC${orderNumber}`,
    product: product.name,
    productImage: product.image,
    date,
    status,
    expectedDelivery: status === "Out for Delivery" ? "Today" : status === "Delivered" ? "Delivered" : "Sep 14, 2026",
    amount: product.price + (index % 4) * 199,
    customer: index === 23 ? "Alex Kumar" : ["Priya Shah", "Rohan Mehta", "Aisha Khan", "Alex Kumar"][index % 4],
    trackingNumber: `QX${String(89342100 + index)}`,
    timeline: timelineFor(status, date),
  };
});

export const customers: CustomerProfile[] = [
  {
    id: "CUST-001",
    name: "Alex Kumar",
    initials: "AK",
    email: "alex.kumar@example.com",
    preferredCategory: "Running & wellness",
    lastPurchase: "AeroRun Knit Trainers",
    supportPreference: "Concise answers",
    pastOrders: 8,
    interactions: 12,
  },
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `CUST-${String(index + 2).padStart(3, "0")}`,
    name: ["Priya Shah", "Rohan Mehta", "Aisha Khan", "Neel Joshi", "Maya Rao", "Kabir Singh", "Tara Iyer", "Dev Patel", "Sara Bose"][index],
    initials: "CX",
    email: `customer${index + 2}@example.com`,
    preferredCategory: ["Home", "Fashion", "Electronics"][index % 3],
    lastPurchase: products[(index + 5) % products.length].name,
    supportPreference: "Helpful details",
    pastOrders: 2 + (index % 7),
    interactions: 3 + (index % 8),
  })),
];

export const returns: Return[] = [
  {
    id: "RET-2041",
    orderId: "#QC1017",
    product: "Everyday Linen Shirt",
    reason: "Wrong size",
    status: "Refunded",
    pickupDate: "Aug 29, 2026",
    refundStatus: "Complete",
    amount: 1899,
  },
  {
    id: "RET-2044",
    orderId: "#QC1020",
    product: "Compact Air Fryer",
    reason: "Changed my mind",
    status: "Pickup Scheduled",
    pickupDate: "Sep 12, 2026",
    refundStatus: "Pending inspection",
    amount: 5499,
  },
];

const activity: Activity[] = [
  { id: "act-1", tool: "getOrderStatus", title: "Order status checked", detail: "#QC1024 is out for delivery", time: "2 min ago", tone: "blue" },
  { id: "act-2", tool: "searchProducts", title: "Product search completed", detail: "5 running products matched", time: "8 min ago", tone: "purple" },
  { id: "act-3", tool: "checkRefundStatus", title: "Refund status checked", detail: "Refund pending inspection", time: "14 min ago", tone: "amber" },
  { id: "act-4", tool: "getCustomerProfile", title: "Customer context loaded", detail: "Alex Kumar profile accessed", time: "19 min ago", tone: "green" },
];

const toolCounts: Record<string, number> = {
  getOrderStatus: 142,
  searchProducts: 98,
  createReturn: 31,
  checkRefundStatus: 46,
  getCustomerProfile: 188,
};

const trend = (values: number[]): TrendPoint[] =>
  values.map((value, index) => ({ label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], value }));

const categoryMetrics: CategoryMetric[] = [
  { label: "Order Tracking", value: 38, color: "#5b6ff5" },
  { label: "Product Search", value: 24, color: "#9b6ff3" },
  { label: "Returns", value: 16, color: "#18b99a" },
  { label: "Refunds", value: 12, color: "#f2ae4b" },
  { label: "Recommendations", value: 10, color: "#e86c9a" },
];

function toolMetrics(): ToolMetric[] {
  const total = Object.values(toolCounts).reduce((sum, value) => sum + value, 0);
  return Object.entries(toolCounts).map(([name, calls]) => ({
    name,
    calls,
    share: Math.round((calls / total) * 100),
  }));
}

export function getDashboard(): Dashboard {
  return {
    totalConversations: 1248 + Math.max(0, activity.length - 4),
    resolvedByAi: 86.4,
    avgResponseTime: 1.8,
    activeCustomers: 312,
    conversationTrend: trend([118, 142, 135, 168, 154, 183, 201]),
    issueCategories: categoryMetrics,
    resolutionTrend: trend([82, 84, 85, 88, 86, 89, 91]),
    toolUsage: toolMetrics(),
    activity: [...activity],
  };
}

export function getCustomerProfile(): CustomerProfile {
  return customers[0];
}

export function getOrderStatus(orderId: string): Order | undefined {
  const normalized = orderId.trim().toUpperCase().replace(/^#?/, "#");
  return orders.find((order) => order.id === normalized);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.toLowerCase().trim();
  const terms = normalized.split(/\s+/).filter(Boolean);
  const matches = products.filter((product) => {
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return terms.length === 0 || terms.some((term) => haystack.includes(term));
  });
  return matches.slice(0, 5);
}

export function checkRefundStatus(orderId: string) {
  const existing = returns.find((item) => item.orderId === orderId);
  return {
    refundId: existing?.id ?? "REF-8492",
    orderId,
    amount: existing?.amount ?? getOrderStatus(orderId)?.amount ?? 5499,
    status: existing?.refundStatus ?? "Processing",
    expectedDate: existing?.refundStatus === "Complete" ? "Completed" : "Sep 16, 2026",
  };
}

export function createReturn(orderId: string, reason: string): Return | undefined {
  const order = getOrderStatus(orderId);
  if (!order) return undefined;
  const productReturn: Return = {
    id: `RET-${2048 + returns.length}`,
    orderId: order.id,
    product: order.product,
    reason,
    status: "Pickup Scheduled",
    pickupDate: "Sep 13, 2026",
    refundStatus: "Starts after pickup",
    amount: order.amount,
  };
  returns.unshift(productReturn);
  return productReturn;
}

export function recordActivity(tool: string, title: string, detail: string, tone: string): void {
  activity.unshift({
    id: `act-${Date.now()}`,
    tool,
    title,
    detail,
    time: "Just now",
    tone,
  });
  if (activity.length > 8) activity.pop();
  toolCounts[tool] = (toolCounts[tool] ?? 0) + 1;
}

export function getToolCounts(): Record<string, number> {
  return { ...toolCounts };
}