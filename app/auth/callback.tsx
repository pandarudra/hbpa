import { maybeCompleteAuthSession } from "expo-web-browser";
import { LoadingScreen } from "@/components/common/LoadingScreen";

// Completes the OAuth popup handshake and returns the result to promptAsync().
maybeCompleteAuthSession();

export default function AuthCallback() {
  return <LoadingScreen />;
}
