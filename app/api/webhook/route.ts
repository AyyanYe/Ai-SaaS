import { headers } from "next/headers";
import Stripe from "stripe";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    await prismadb.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  return new NextResponse("OK", { status: 200 });
}

// import { auth, currentUser } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// import prismadb from "@/lib/prismadb";
// import { stripe } from "@/lib/stripe";
// import { absoluteUrl } from "@/lib/utils";

// const settingsUrl = absoluteUrl("/settings");

// export async function GET() {
//   try {
//     const { userId } = auth();
//     const user = await currentUser();

//     if (!userId || !user) {
//       return new NextResponse("unauthorized", { status: 401 });
//     }

//     const userSubscription = await prismadb.userSubscription.findUnique({
//       where: {
//         userId
//       }
//     });

//     if (userSubscription && userSubscription.stripeCustomerId) {
//       const stripeSession = await stripe.billingPortal.sessions.create({
//         customer: userSubscription.stripeCustomerId,
//         return_url: settingsUrl,
//       });

//       return new NextResponse(JSON.stringify({ url: stripeSession.url }));
//     }

//     const stripeSession = await stripe.checkout.sessions.create({
//       success_url: settingsUrl,
//       cancel_url: settingsUrl,
//       payment_method_types: ["card"],
//       mode: "subscription",
//       billing_address_collection: "auto",
//       customer_email: user.emailAddresses[0].emailAddress,
//       line_items: [
//         {
//           price_data: {
//             currency: "USD",
//             product_data: {
//               name: "AIMage",
//               description: "Unlimited AI Generation",
//             },
//             unit_amount: 2000,
//             recurring: {
//               interval: "month"
//             }
//           },
//           quantity: 1,
//         }
//       ],
//       metadata: {
//         userId,
//       },
//     });

//     return new NextResponse(JSON.stringify({ url: stripeSession.url }))
//   } catch (error) {
//     console.log("[STRIPE_ERROR]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }