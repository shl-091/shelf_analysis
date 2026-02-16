
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow 60 seconds for processing

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Shelf Analysis App";

export async function POST(req: NextRequest) {
  try {
    const { images, mode, model } = await req.json();
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured" },
        { status: 500 }
      );
    }

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const SITE_NAME = "Shelf Analysis App";

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "shelf") {
      systemPrompt = `You are an expert retail shelf analyzer. Anlayze the shelf images provided.
      You must detect all products on the shelf.
      
      Return a VALID JSON object with the following structure:
      {
        "products": [
          {
            "name": "Product Name",
            "brand": "Brand Name",
            "category": "Category",
            "price": "Price (if visible, else null)",
            "details": "Other details (flavor, size, etc.)",
            "box_2d": [ymin, xmin, ymax, xmax] // Normalized coordinates (0-1000)
          }
        ],
        "market_analysis": "A comprehensive analysis of the shelf. What is the store selling? Is it premium or budget? What is the average price range? Provide market insights."
      }
      
      IMPORTANT: The 'box_2d' coordinates should be [ymin, xmin, ymax, xmax] normalized to 1000x1000.
      Ensure the JSON is valid and parseable. Do not include markdown formatting like \`\`\`json.`;

      userPrompt = "Analyze these shelf images. Detect all products and provide market analysis.";
    } else if (mode === "ingredients") {
      systemPrompt = `You are an expert product ingredient analyzer. Analyze the product back/ingredient images.
      
      Return a VALID JSON object with the following structure:
      {
        "product_name": "Product Name",
        "ingredients": [
          {
            "name": "Ingredient Name",
            "content": "Content amount/percentage",
            "origin": "Origin (if available)"
          }
        ],
        "origin_place": "Country/Place of Origin",
        "nutrition_facts": "Summary of nutrition facts"
      }
      
      Ensure the JSON is valid and parseable. Do not include markdown formatting like \`\`\`json.`;

      userPrompt = "Analyze the ingredients and product details from these images.";
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const content = [
      {
        type: "text",
        text: userPrompt,
      },
      ...images.map((img: string) => ({
        type: "image_url",
        image_url: {
          url: img, // Expecting base64 data URL
        },
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "qwen/qwen-2.5-vl-72b-instruct",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: content,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json(
        { error: `OpenRouter API Error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const contentString = data.choices[0]?.message?.content;

    try {
      const jsonResponse = JSON.parse(contentString);
      return NextResponse.json(jsonResponse);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // Fallback: try to strip markdown code blocks if present
      const cleanContent = contentString.replace(/```json\n?|\n?```/g, "");
      try {
        const validJson = JSON.parse(cleanContent);
        return NextResponse.json(validJson);
      } catch (e2) {
        return NextResponse.json(
          { error: "Failed to parse model response as JSON", raw: contentString },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
