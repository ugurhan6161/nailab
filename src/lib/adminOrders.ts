import type { Order, OrderItem } from './supabase';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isOrderItem(value: unknown): value is OrderItem {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.order_id === 'string'
    && isNullableString(value.product_id)
    && typeof value.product_name === 'string'
    && isNullableString(value.product_image)
    && typeof value.quantity === 'number'
    && Number.isFinite(value.quantity)
    && typeof value.unit_price === 'number'
    && Number.isFinite(value.unit_price)
    && typeof value.total_price === 'number'
    && Number.isFinite(value.total_price);
}

export function isAdminOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false;
  const addressIsValid = value.shipping_address === null
    || (isRecord(value.shipping_address)
      && Object.values(value.shipping_address).every((part) => typeof part === 'string'));
  return typeof value.id === 'string'
    && typeof value.order_number === 'string'
    && isNullableString(value.user_id)
    && isNullableString(value.guest_email)
    && isNullableString(value.guest_name)
    && isNullableString(value.guest_phone)
    && typeof value.status === 'string'
    && typeof value.subtotal === 'number'
    && Number.isFinite(value.subtotal)
    && typeof value.shipping_cost === 'number'
    && Number.isFinite(value.shipping_cost)
    && typeof value.total === 'number'
    && Number.isFinite(value.total)
    && addressIsValid
    && typeof value.payment_method === 'string'
    && isNullableString(value.notes)
    && typeof value.created_at === 'string'
    && typeof value.updated_at === 'string'
    && (value.order_items === undefined
      || (Array.isArray(value.order_items) && value.order_items.every(isOrderItem)));
}
