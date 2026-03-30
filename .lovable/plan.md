

# Remove All Yelp Feedback from Database

## What
Delete all 47 records from `customer_feedback` where `channel = 'yelp'`.

## How
Run a single database migration:

```sql
DELETE FROM customer_feedback WHERE channel = 'yelp';
```

One migration, no code changes needed.

