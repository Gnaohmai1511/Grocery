import { Stack } from "expo-router";
import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ClerkProvider tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <StripeProvider
            publishableKey={
              process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!
            }
          >
            <Stack screenOptions={{ headerShown: false }} />
          </StripeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});