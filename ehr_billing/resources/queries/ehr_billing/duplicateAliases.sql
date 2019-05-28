SELECT
alias,
count(*) as total

FROM ehr_billing.aliases
GROUP BY alias
HAVING COUNT(*) > 1