import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import axios from "axios"; // Import Axios for making HTTP requests

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const apiKey = process.env.API_KEY;

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!apiKey) {
      return new NextResponse("Gemini AI API Key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 })
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error("Failed to generate content");
    }
    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({ content: generatedText });

  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
