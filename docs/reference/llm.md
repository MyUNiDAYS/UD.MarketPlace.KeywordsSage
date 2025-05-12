## 🔄 Keyword Generation Flow with Bedrock (Claude 3)

This document describes the event-driven service that generates **UK-specific product search keywords** for university students, tailored to a given **partner brand**, using the **Amazon Bedrock Claude 3 Sonnet model**.

---

### 🛍️ Overview

This flow is triggered by a REST API call to `/generate-keywords`. It validates the request and then invokes **Claude 3 Sonnet** via **Amazon Bedrock** to generate a list of keyword suggestions.

---

### 🧹 Components Involved

* **API Server (Express)**

  * `POST /generate-keywords`: Entry point for requests containing partner information and optional initial keywords.
  * `GET /health`: Health check endpoint.
  * Request validation using `SageRequestSchema`.

* **Model Invocation Layer**

  * `invokeBedrockModel`: Prepares the prompt and makes a call to the Bedrock API using AWS SDK.
  * Reads `claudeRequest.json` as a template and injects the dynamically constructed prompt.
  * Uses model ID: `anthropic.claude-3-sonnet-20240229-v1:0`.

* **Amazon Bedrock (Claude 3 Sonnet)**

  * Generates a concise JSON response containing a list of relevant keywords.
  * Enhances the result with the initial keywords while removing duplicates.

---

### ⚙️ Flow Description

1. **API Request**

   * A client sends a `POST` request to `/generate-keywords` with:

     * `partnerName`: The brand to target (e.g., `"Apple"`).
     * `initialKeywords`: Optional list of user-provided starting keywords.

2. **Request Validation**

   * The request body is validated using `SageRequestSchema`.
   * If invalid, a `400 Bad Request` is returned.

3. **Prompt Preparation**

   * The system reads a pre-defined JSON prompt template (`claudeRequest.json`).
   * Injects a dynamically composed prompt describing:

     * The partner name
     * A fixed set of product categories
     * Instructions for keyword generation
     * Any provided initial keywords

4. **Model Invocation**

   * Calls invoke model api for aws bedrock

5. **Keyword Generation**

   * The response is decoded and parsed.
   * Extracted keywords are merged with the initial ones (if any), deduplicated, and returned as JSON:

     ```json
     { "keywords": ["keyword1", "keyword2", ...] }
     ```

---
