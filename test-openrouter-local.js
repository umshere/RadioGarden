#!/usr/bin/env node

/**
 * Local test for OpenRouter provider - tests the provider directly without server
 */

// Simulate environment variables
process.env.OPENROUTER_API_KEY =
  "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";
process.env.OPENROUTER_MODEL = "z-ai/glm-4.5-air:free";

async function testOpenRouterAPI() {
  console.log("🧪 Testing OpenRouter API directly...\n");

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  console.log(`Model: ${model}`);
  console.log(`API Key: ${apiKey.substring(0, 20)}...`);

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  try {
    console.log("\n📤 Sending test request to OpenRouter...");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://radio-passport.com",
        "X-Title": "Radio Passport Test",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Respond with a brief JSON object.",
          },
          {
            role: "user",
            content:
              'Return a simple JSON with: {"status": "ok", "message": "Hello from OpenRouter"}',
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    console.log(
      `\n📥 Response Status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ Error Response:");
      console.error(errorText);
      return false;
    }

    const data = await response.json();
    console.log("\n✅ Success! Raw Response:");
    console.log(JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;
    if (content) {
      console.log("\n📝 Generated Content:");
      console.log(content);

      try {
        const parsed = JSON.parse(content);
        console.log("\n✅ Successfully parsed JSON:");
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("\n⚠️ Content is not valid JSON");
      }
    }

    console.log("\n✅ OpenRouter API is working correctly!");
    return true;
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

async function main() {
  console.log("=".repeat(80));
  console.log("OpenRouter Local API Test");
  console.log("=".repeat(80));

  const success = await testOpenRouterAPI();

  console.log("\n" + "=".repeat(80));
  if (success) {
    console.log("✅ All tests passed! OpenRouter is ready to use.");
    console.log("\nYou can now test from the UI at: http://localhost:5174");
  } else {
    console.log("❌ Tests failed. Please check the error messages above.");
  }
  console.log("=".repeat(80));

  process.exit(success ? 0 : 1);
}

main();
