import 'dotenv/config';

export default {
  expo: {
    name: "Grocery",
    slug: "grocery-app",

    extra: {
      clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  },
};
