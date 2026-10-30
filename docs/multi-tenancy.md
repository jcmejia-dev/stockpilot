# StockPilot Multi-Tenancy Architecture

Status: Alpha design contract

## Tenant boundary

A `business` is the tenant. A user can belong to one or more businesses through `business_user` memberships. Roles start with `OWNER` and `STAFF`.

Every tenant-owned table must carry a non-null `business_id` foreign key, including products, categories, suppliers, stock_movements, inventory_adjustments, audit_logs and reports.

## Server-side rule

The browser must never be trusted to choose an arbitrary `business_id`. Laravel derives the active business from the authenticated user's membership. Every read and write must verify membership and scope the query to that business.

Example concept:

```php
$business = $request->user()->businesses()->findOrFail($activeBusinessId);
$product = $business->products()->findOrFail($productId);
```

A product ID from another business therefore returns not found/forbidden rather than leaking the record.

## Database constraints

- `businesses(id, name, type, currency, timezone, ...)`
- `business_user(business_id, user_id, role)` with a unique `(business_id, user_id)` constraint
- tenant tables use indexed `business_id` foreign keys
- identifiers that only need to be unique inside a tenant use composite constraints, e.g. unique `(business_id, sku)`
- stock movement and quantity updates run in database transactions
- inventory rows are locked when concurrent stock mutations could race

## Required tests

1. Business A cannot list Business B products.
2. Business A cannot fetch Business B product by guessed ID.
3. Business A cannot update/delete Business B product.
4. Business A cannot create movements for Business B product.
5. Reports, suppliers, categories, exports and audit logs obey the same boundary.
6. A user with memberships in two businesses can explicitly switch only between those memberships.
7. Staff cannot perform owner-only actions.

## GitHub Pages preview

The current Vue preview demonstrates the UX by filtering records carrying `business_id` in browser memory. This is not a security boundary. Real tenant isolation begins when the Laravel API and database are deployed.