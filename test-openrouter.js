#!/usr/bin/env node

/**
 * Test script for OpenRouter API
 * Run: node test-openrouter.js
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("❌ Error: OPENROUTER_API_KEY environment variable not set!");
  console.error("Set it with: $env:OPENROUTER_API_KEY='your-key-here'");
  process.exit(1);
}

console.log("✓ API Key found:", OPENROUTER_API_KEY.substring(0, 20) + "...");
console.log("");

async function testModel() {
  const url = "https://api.openrouter.ai/v1/chat/completions";
  const model = "nvidia/nemotron-nano-12b-v2-vl:free";
  
  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: "What is 2+2? Return only the number."
      }
    ],
    max_tokens: 100,
    temperature: 0.1,
  };

  console.log("🔄 Testing model:", model);
  console.log("📤 Sending request to:", url);
  console.log("📋 Payload:", JSON.stringify(payload, null, 2));
  console.log("");

  const startTime = Date.now();

  try {
    console.log("⏳ Waiting for response...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    console.log(`✓ Response received in ${elapsed}ms`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      return;
    }

    const json = await response.json();
    
    console.log("📊 Response keys:", Object.keys(json).join(", "));
    console.log("");

    if (json.choices && json.choices[0]) {
      const choice = json.choices[0];
      console.log("📝 First choice keys:", Object.keys(choice).join(", "));
      
      if (choice.message) {
        console.log("💬 Message keys:", Object.keys(choice.message).join(", "));
        
        if (choice.message.thinking) {
          console.log("");
          console.log("🧠 MODEL THINKING:");
          console.log("---");
          console.log(choice.message.thinking);
          console.log("---");
          console.log("");
        }

        if (choice.message.content) {
          console.log("📄 MODEL OUTPUT:");
          console.log("---");
          console.log(choice.message.content);
          console.log("---");
          console.log("");
        }
      }
    }

    if (json.usage) {
      console.log("📊 Token Usage:");
      console.log(`   Input tokens: ${json.usage.prompt_tokens}`);
      console.log(`   Output tokens: ${json.usage.completion_tokens}`);
      console.log(`   Total tokens: ${json.usage.total_tokens}`);
      console.log("");
    }

    console.log("✅ Test completed successfully!");

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Error after ${elapsed}ms:`, error.message);
    console.error("Error type:", error.name);
    if (error.cause) console.error("Error cause:", error.cause);
    console.error("");
    console.error("Full error:", error);
  }
}

// Test with a sample image (base64)
async function testModelWithImage() {
  const url = "https://api.openrouter.ai/v1/chat/completions";
  const model = "nvidia/nemotron-nano-12b-v2-vl:free";

  // Simple 1x1 red pixel PNG in base64
  const sampleImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: `Analyze this image and describe what you see. Return ONLY a one-sentence description.\n\nImageBase64:\n\ndata:image/png;base64,${sampleImageBase64}`,
      }
    ],
    max_tokens: 200,
    temperature: 0.1,
  };

  console.log("");
  console.log("═".repeat(60));
  console.log("🖼️  Testing model with IMAGE");
  console.log("═".repeat(60));
  console.log("");
  console.log("🔄 Testing model:", model);
  console.log("📤 Sending request with image...");
  console.log("");

  const startTime = Date.now();

  try {
    console.log("⏳ Waiting for response...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    console.log(`✓ Response received in ${elapsed}ms`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      return;
    }

    const json = await response.json();

    if (json.choices && json.choices[0] && json.choices[0].message) {
      console.log("📄 MODEL OUTPUT:");
      console.log("---");
      console.log(json.choices[0].message.content);
      console.log("---");
      console.log("");
    }

    if (json.usage) {
      console.log("📊 Token Usage:");
      console.log(`   Input tokens: ${json.usage.prompt_tokens}`);
      console.log(`   Output tokens: ${json.usage.completion_tokens}`);
      console.log(`   Total tokens: ${json.usage.total_tokens}`);
      console.log("");
    }

    console.log("✅ Image test completed successfully!");

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Error after ${elapsed}ms:`, error.message);
  }
}

// Run tests
(async () => {
  await testModel();
  await testModelWithImage();
})();
