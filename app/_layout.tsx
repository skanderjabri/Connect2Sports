// RootLayout.js
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function RootLayout() {
  const [loaded] = useFonts({
    "Roboto-Regular": require(".././assets/fonts/Roboto/Roboto-Regular.ttf"),
    "Roboto-Bold": require(".././assets/fonts/Roboto/Roboto-Bold.ttf"),
    "Sen-Bold": require(".././assets/fonts/Sen/Sen-Bold.ttf"),
    "Sen-Medium": require(".././assets/fonts/Sen/Sen-Medium.ttf"),
    "Sen-Regular": require(".././assets/fonts/Sen/Sen-Regular.ttf"),
    "Sen-SemiBold": require(".././assets/fonts/Sen/Sen-SemiBold.ttf"),
    "Sen-ExtraBold": require(".././assets/fonts/Sen/Sen-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f4511e",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
