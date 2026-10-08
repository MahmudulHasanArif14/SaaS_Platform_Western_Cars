# ENVIRONMENT MATRIX

| Environment | Supabase   | Payments | Provider APIs | Deployment             |
| ----------- | ---------- | -------- | ------------- | ---------------------- |
| LOCAL       | local/dev  | test     | sandbox/test  | local                  |
| TEST        | test       | sandbox  | test          | CI                     |
| STAGING     | staging    | sandbox  | staging/test  | Vercel preview/staging |
| PRODUCTION  | production | live     | live          | production             |
