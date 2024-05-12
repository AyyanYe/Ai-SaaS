// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// const instructionMessage: OpenAI.ChatCompletionMessage = {
//     role: "system",
//     content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
// }

// export async function POST(req: Request) {
//     try {
//         const { userId } = auth();
//         const body = await req.json();
//         const { messages } = body;

//         if (!userId) {
//             return new NextResponse("Unauthorized", { status: 401 });
//         }

//         if (!openai.apiKey) {
//             return new NextResponse("OpenAI API Key not configured", { status: 500 });
//         }

//         if (!messages) {
//             return new NextResponse("Messages are required", { status: 400 });
//         }

//         const freeTrail = await checkApiLimit();

//         if (!freeTrail) {
//             return new NextResponse("Free trail has expired.", { status: 403 })
//         }

//         const response = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [instructionMessage, ...messages]
//         });

//         await increaseApiLimit();

//         return NextResponse.json(response.choices[0].message);

//     } catch (error) {
//         console.log("[CODE_ERROR]", error);
//         return new NextResponse("Internal error", { status: 500 });
//     }
// }
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;
    const prompt = messages.join("\n");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.API_KEY) {
      return new NextResponse("Gemini AI API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({ content: response.text() });

  } catch (error) {
    console.log("[CODE_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
