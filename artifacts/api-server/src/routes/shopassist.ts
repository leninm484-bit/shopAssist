import { Router, type IRouter } from "express";
import {
  CreateReturnBody,
  CreateReturnResponse,
  GetCustomerProfileResponse,
  GetDashboardResponse,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  ListReturnsResponse,
  SendSupportMessageBody,
  SendSupportMessageResponse,
} from "@workspace/api-zod";
import {
  checkRefundStatus,
  createReturn,
  getCustomerProfile,
  getDashboard,
  getOrderStatus,
  products,
  recordActivity,
  returns,
  searchProducts,
  orders,
} from "../lib/shopassist";

const router: IRouter = Router();

function extractOrderId(message: string): string {
  const match = message.match(/(?:#?QC|order\s*#?)\s*(\d{4})/i);
  return match ? `#QC${match[1]}` : "#QC1024";
}

function inferSearchQuery(message: string): string {
  const lower = message.toLowerCase();
  const category = ["running", "shoes", "trainers", "footwear"].some((term) => lower.includes(term))
    ? "running"
    : ["headphones", "watch", "keyboard", "mouse", "projector"].find((term) => lower.includes(term)) ?? "";
  return category || message.replace(/find|search|recommend|product|something|for me/gi, "").trim();
}

router.get("/shopassist/products", (req, res): void => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q = "", category = "", maxPrice, minRating } = parsed.data;
  const filtered = products.filter((product) => {
    const matchesQuery = !q || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(q.toLowerCase());
    const matchesCategory = !category || product.category === category;
    const matchesPrice = maxPrice === undefined || product.price <= maxPrice;
    const matchesRating = minRating === undefined || product.rating >= minRating;
    return matchesQuery && matchesCategory && matchesPrice && matchesRating;
  });
  res.json(ListProductsResponse.parse(filtered));
});

router.get("/shopassist/orders", (_req, res): void => {
  res.json(ListOrdersResponse.parse(orders));
});

router.get("/shopassist/orders/:orderId", (req, res): void => {
  const parsed = GetOrderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const order = getOrderStatus(parsed.data.orderId);
  if (!order) {
    res.status(404).json({ error: "Sorry, I couldn't find that order. Please check the order ID and try again." });
    return;
  }
  res.json(GetOrderResponse.parse(order));
});

router.get("/shopassist/returns", (_req, res): void => {
  res.json(ListReturnsResponse.parse(returns));
});

router.post("/shopassist/returns", (req, res): void => {
  const parsed = CreateReturnBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const created = createReturn(parsed.data.orderId, parsed.data.reason);
  if (!created) {
    res.status(400).json({ error: "We couldn't find that order. Please check the order ID and try again." });
    return;
  }
  recordActivity("createReturn", "Return created", `${created.id} for ${created.product}`, "green");
  res.status(201).json(CreateReturnResponse.parse(created));
});

router.get("/shopassist/customer-profile", (_req, res): void => {
  res.json(GetCustomerProfileResponse.parse(getCustomerProfile()));
});

router.get("/shopassist/dashboard", (_req, res): void => {
  res.json(GetDashboardResponse.parse(getDashboard()));
});

router.post("/shopassist/support/messages", (req, res): void => {
  const parsed = SendSupportMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const message = parsed.data.message.trim();
  const lower = message.toLowerCase();
  const orderId = extractOrderId(message);
  let tool = "getCustomerProfile";
  let toolLabel = "Customer Memory";
  let category = "General Support";
  let resultSummary = "Alex's preferences and recent activity loaded";
  let result: Record<string, unknown> = { ...getCustomerProfile() };
  let reply = "I’m here to help, Alex. Tell me what you’re shopping for or what you need a hand with.";
  let tone = "green";

  if (lower.includes("return") || lower.includes("damaged") || lower.includes("wrong size")) {
    const reason = lower.includes("damaged") ? "Damaged on arrival" : lower.includes("wrong size") ? "Wrong size" : "Changed my mind";
    const created = createReturn(orderId, reason);
    tool = "createReturn";
    toolLabel = "Return Creation Tool";
    category = "Returns";
    tone = "green";
    if (created) {
      result = { ...created };
      resultSummary = `${created.id} created · pickup scheduled for ${created.pickupDate}`;
      reply = `I’ve set up the return for ${created.product}. Your return ID is ${created.id}, and pickup is scheduled for ${created.pickupDate}. Your refund will start after the item is collected.`;
    } else {
      resultSummary = "Order ID could not be matched";
      reply = "Sorry, I couldn't find that order. Please check the order ID and try again.";
    }
  } else if (lower.includes("refund") || lower.includes("money back") || lower.includes("reimburse")) {
    const refund = checkRefundStatus(orderId);
    tool = "checkRefundStatus";
    toolLabel = "Refund Status Tool";
    category = "Refunds";
    tone = "amber";
    result = refund;
    resultSummary = `${refund.refundId} · ${refund.status}`;
    reply = `Your refund for ${orderId} is ${refund.status.toLowerCase()}. The latest expected date is ${refund.expectedDate}.`;
  } else if (lower.includes("track") || lower.includes("where") || lower.includes("status") || lower.includes("delivery") || lower.includes("arrive")) {
    const order = getOrderStatus(orderId);
    tool = "getOrderStatus";
    toolLabel = "Order Status Tool";
    category = "Order Tracking";
    tone = "blue";
    if (order) {
      result = { ...order };
      resultSummary = `${order.id} · ${order.status} · ${order.expectedDelivery}`;
      reply = order.status === "Out for Delivery"
        ? `Your order ${order.id} is out for delivery and expected today. It’s on the final stretch.`
        : `Your order ${order.id} is currently ${order.status.toLowerCase()}, with an expected delivery of ${order.expectedDelivery}.`;
    } else {
      resultSummary = "Order ID could not be matched";
      reply = "Sorry, I couldn't find that order. Please check the order ID and try again.";
    }
  } else if (lower.includes("find") || lower.includes("recommend") || lower.includes("product") || lower.includes("shoe") || lower.includes("headphone") || lower.includes("under ₹") || lower.includes("under rs")) {
    const found = searchProducts(inferSearchQuery(message));
    tool = "searchProducts";
    toolLabel = "Product Search Tool";
    category = lower.includes("recommend") ? "Recommendations" : "Product Search";
    tone = "purple";
    result = { products: found };
    resultSummary = found.length ? `${found.length} products matched your request` : "No products matched that search";
    if (found.length) {
      const top = found[0];
      reply = `Based on your interest in running and wellness, I’d start with ${top.name} at ₹${top.price.toLocaleString("en-IN")}. It’s rated ${top.rating}★ and has ${top.stock} left in stock.`;
    } else {
      reply = "I couldn’t find an exact match, but I can help you try another category or price range.";
    }
  } else {
    result = { ...getCustomerProfile() };
  }

  recordActivity(tool, `${toolLabel} ran`, resultSummary, tone);
  const response = {
    id: `msg-${Date.now()}`,
    reply,
    category,
    tool,
    toolLabel,
    resultSummary,
    result,
    createdAt: new Date().toISOString(),
  };
  res.json(SendSupportMessageResponse.parse(response));
});

export default router;