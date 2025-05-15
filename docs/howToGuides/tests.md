# How to Run Tests

This tutorial will guide you through running various types of tests in the project, including unit tests, type checking, linting, and security tests.

## Prerequisites

Before proceeding, make sure to follow the [setup instructions](./setup.md) to configure your environment correctly.

## Step 1: Running Unit Tests

Unit tests help verify the functionality of individual components or functions. Run the following command to execute all unit tests:

```sh
pnpm test:unit
```

This will run all unit tests using Jest and display the results in the terminal.

## Step 2: Type Checking

To ensure there are no TypeScript type errors in your code, run:

```sh
pnpm test:types
```

This command runs the TypeScript compiler in `noEmit` mode, checking for type issues without generating any output files.

## Step 3: Running Tests in Watch Mode (Development Mode)

When actively working on code, you may want tests to automatically re-run upon file changes. To enable watch mode, run:

```sh
pnpm test:dev
```

This will start Jest in watch mode, continuously running relevant tests as you modify files.

## Step 4: Linting Your Code

To check for code style issues and potential errors, use ESLint:

```sh
pnpm lint
```

This will analyze your code and report any issues related to formatting, best practices, and potential bugs.

## Step 5: Running Security Tests with Snyk

Snyk helps detect security vulnerabilities in dependencies. There are two ways to authenticate and run Snyk tests:

### Option 1: Using an Environment Variable

Run the security tests by setting your Snyk API key as an environment variable:

```sh
SNYK_API_KEY=your_snyk_api_key pnpm test:snyk
```

## Summary

- Ran unit tests with `pnpm test:unit`
- Checked TypeScript types with `pnpm test:types`
- Used watch mode for active development with `pnpm test:dev`
- Ensured code quality with `pnpm lint`
- Conducted security scans using Snyk

Within this project, you can confidently run tests and maintain code quality in your project!
