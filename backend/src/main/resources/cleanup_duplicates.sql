-- Option 1: Delete ALL transaction logs (simplest for development)
-- This will clear all transaction history but won't affect wallet balances
TRUNCATE TABLE transaction_logs CASCADE;

-- Option 2: Delete only duplicate gateway_reference entries
-- This keeps non-duplicate records
DELETE FROM transaction_logs 
WHERE gateway_reference IN (
    SELECT gateway_reference 
    FROM transaction_logs 
    GROUP BY gateway_reference 
    HAVING COUNT(*) > 1
);

-- Option 3: Keep the most recent duplicate, delete older ones
-- This preserves the latest transaction for each duplicate gateway_reference
DELETE FROM transaction_logs a
USING transaction_logs b
WHERE a.gateway_reference = b.gateway_reference
  AND a.created_at < b.created_at;

-- After cleanup, verify no duplicates remain:
SELECT gateway_reference, COUNT(*) as count
FROM transaction_logs
GROUP BY gateway_reference
HAVING COUNT(*) > 1;
