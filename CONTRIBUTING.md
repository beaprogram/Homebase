# Contributing

Thanks for improving Homebase.

## Workflow

1. Open an issue for substantial product or architecture changes.
2. Create a focused branch from `main`.
3. Keep commits small and use clear prefixes such as `feat:`, `fix:`, `test:`, `docs:`, and `ci:`.
4. Run the checks for every component you changed.
5. Open a pull request using the repository template.

## Documentation standard

Describe current behavior separately from planned work. A deployment is "live" only when its public health and user flows have been verified. Infrastructure files alone are not evidence that infrastructure is running.

## Security and data

Never commit `.env` files, tokens, API keys, cloud credentials, database exports containing personal information, or screenshots containing private data. Use the example environment files as templates.
