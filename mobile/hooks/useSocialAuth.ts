import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.log("💥 Error in Google auth:", error);
      Alert.alert(
        "Error",
        "Failed to sign in with Google. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleGoogleAuth };
}

export default useGoogleAuth;
