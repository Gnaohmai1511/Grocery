import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  if (isSignedIn) {
    return <Redirect href={"../(protected)/(tabs)"} />;
  }

  return <Stack screenOptions={{headerShown: false}} />
}