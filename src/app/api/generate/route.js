import { NextResponse } from "next/server";
import sharp from "sharp";
import { createCanvas } from "canvas";

// FONT MAP
const FONT_MAP = {
  bold: "Arial Black",
  modern: "Segoe UI",
  handwritten: "Comic Sans MS",
  scifi: "Courier New",
  horror: "Impact",
  retro: "Georgia",
  elegant: "Palatino Linotype",
};

export async function POST(req) {
  const startTime = Date.now();
  const elapsedMs = () => Date.now() - startTime;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  console.log(`[${elapsedMs()}ms] 🔹 POST request received`);

  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const userText = String(formData.get("text") || "").trim();
    const userStyle = String(formData.get("style") || "modern");

    if (!file || !userText) {
      console.warn(`[${elapsedMs()}ms] ⚠ Missing image or text`);
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    console.log(`[${elapsedMs()}ms] 📥 Image & text received`);

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    console.log(`[${elapsedMs()}ms] 🖼 Image metadata: ${width}x${height}`);

    let plan = null;
    if (OPENROUTER_API_KEY) {
      console.log(`[${elapsedMs()}ms] 🤖 Attempting AI analysis`);
      try {
        plan = await analyzeImageWithAI(imageBuffer, userText, userStyle, width, height, OPENROUTER_API_KEY);
        console.log(`[${elapsedMs()}ms] ✅ AI analysis complete: x=${(plan.x_percent*100).toFixed(1)}%, y=${(plan.y_percent*100).toFixed(1)}%, size=${(plan.font_size_percent*100).toFixed(1)}%, color=${plan.color}`);
      } catch (e) {
        console.error(`[${elapsedMs()}ms] ✗ AI analysis failed:`, e?.message || e);
      }
    } else {
      console.warn(`[${elapsedMs()}ms] ⚠ OPENROUTER_API_KEY not set, skipping AI`);
    }

    if (!plan) {
      console.log(`[${elapsedMs()}ms] 🛠 Using fallback placement`);
      plan = getSmartPlacement(userText, userStyle, width, height);
      console.log(`[${elapsedMs()}ms] ✅ Fallback placement: x=${(plan.x_percent*100).toFixed(1)}%, y=${(plan.y_percent*100).toFixed(1)}%, color=${plan.color}`);
    }

    const fontFamily = FONT_MAP[plan.font_key] || FONT_MAP["modern"];
    const fontSize = Math.max(12, Math.floor(height * (plan.font_size_percent || 0.15)));
    const x = Math.floor(width * (plan.x_percent || 0.5));
    const y = Math.floor(height * (plan.y_percent || 0.5));
    const textColor = plan.color || "#FFFFFF";
    const strokeColor = (textColor.toLowerCase() === "#ffffff" || textColor.toLowerCase() === "#fff") ? "black" : "white";
    const strokeWidth = Math.max(2, Math.floor(fontSize / 15));

    console.log(`[${elapsedMs()}ms] 📝 Rendering text on canvas`);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    ctx.font = `bold ${fontSize}px "${fontFamily}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = textColor;

    const lines = wrapText(ctx, userText, Math.floor(width * 0.8));
    const lineHeight = Math.floor(fontSize * 1.1);
    const startY = y - Math.floor(((lines.length - 1) * lineHeight) / 2);
    lines.forEach((line, i) => {
      const yy = startY + i * lineHeight;
      ctx.strokeText(line, x, yy);
      ctx.fillText(line, x, yy);
    });

    console.log(`[${elapsedMs()}ms] 🎨 Text rendered on canvas`);

    const textBuffer = canvas.toBuffer("image/png");
    const finalBuffer = await sharp(imageBuffer)
      .composite([{ input: textBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    console.log(`[${elapsedMs()}ms] ✅ Final image created (${finalBuffer.length} bytes)`);

    return new NextResponse(finalBuffer, {
      headers: { "Content-Type": "image/jpeg", "X-Process-Time": `${elapsedMs()}ms` },
    });
  } catch (error) {
    console.error(`[${elapsedMs()}ms] ✗ Processing error:`, error?.message || error);
    return NextResponse.json({ error: (error?.message) || "Processing failed" }, { status: 500 });
  }
}

// --- Helpers ---

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function getSmartPlacement(text, style, width, height) {
  const styleDefaults = {
    bold: { font_key: "bold", x: 0.5, y: 0.3, size: 0.18, color: "#FFFF00" },
    modern: { font_key: "modern", x: 0.5, y: 0.5, size: 0.15, color: "#FFFFFF" },
    scifi: { font_key: "scifi", x: 0.5, y: 0.6, size: 0.12, color: "#00FF00" },
    horror: { font_key: "horror", x: 0.5, y: 0.25, size: 0.2, color: "#FF0000" },
    handwritten: { font_key: "handwritten", x: 0.35, y: 0.7, size: 0.1, color: "#8B4513" },
    retro: { font_key: "retro", x: 0.5, y: 0.5, size: 0.08, color: "#FF69B4" },
    elegant: { font_key: "elegant", x: 0.5, y: 0.8, size: 0.12, color: "#FFD700" },
  };
  const config = styleDefaults[style] || styleDefaults["modern"];
  return {
    font_key: config.font_key,
    x_percent: config.x,
    y_percent: config.y,
    color: config.color,
    font_size_percent: config.size,
  };
}

async function analyzeImageWithAI(imageBuffer, text, style, width, height, apiKey) {
  const startTime = Date.now();
  const elapsedMs = () => Date.now() - startTime;

  console.log(`[${elapsedMs()}ms] 🤖 AI analysis started`);

  const base64Image = imageBuffer.toString("base64");
  const systemPrompt = `You are an expert text overlay designer. Your task is to find the BEST position to place text on an image.
Output ONLY valid JSON as: {"x_percent":0.5,"y_percent":0.3,"font_size_percent":0.15,"color":"#FFFFFF"}.
Text: "${text}", Style: "${style}", Image: ${width}x${height}px`;

  const response = await callOpenRouter({
    systemPrompt,
    userText: `Analyze the image and place text: "${text}" in the BEST empty area.`,
    base64Image,
    apiKey,
    startTime,
  });

  let jsonStr = response.trim();
  if (jsonStr.includes("```")) {
    jsonStr = jsonStr.replace(/```json\n?|```\n?/g, "").trim();
  }
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (match) jsonStr = match[0];

  const analysis = JSON.parse(jsonStr);
  console.log(`[${elapsedMs()}ms] 🤖 AI analysis parsed`);

  return {
    x_percent: Math.max(0, Math.min(1, analysis.x_percent || 0.5)),
    y_percent: Math.max(0, Math.min(1, analysis.y_percent || 0.5)),
    font_size_percent: Math.max(0.08, Math.min(0.25, analysis.font_size_percent || 0.15)),
    color: analysis.color && /^#[0-9A-Fa-f]{6}$/.test(analysis.color) ? analysis.color : "#FFFFFF",
    font_key: analysis.font_key || style || "modern",
  };
}

async function callOpenRouter({ systemPrompt, userText, base64Image, apiKey, startTime }) {
  const elapsedMs = () => Date.now() - startTime;
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const model = "nvidia/nemotron-nano-12b-v2-vl:free";

  console.log(`[${elapsedMs()}ms] 📤 Sending request to OpenRouter`);

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 2048,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text;
  if (!content) throw new Error("No content returned from OpenRouter");

  console.log(`[${elapsedMs()}ms] 📥 Response received from OpenRouter`);
  return content;
}
