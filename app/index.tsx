import { Redirect } from "expo-router";

export default function Index() {
  // Use the Redirect component so navigation happens as part of rendering
  // instead of calling router.replace in a useEffect (which can run
  // before the root navigator is mounted).
  return <Redirect href="/splash" />;
}
