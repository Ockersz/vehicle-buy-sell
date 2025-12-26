import useBreakpoint from "./useBreakpoint";
import MobileLayout from "../layouts/MobileLayout";
import WebLayout from "../layouts/WebLayout";

export default function AppShell({ children }) {
  const { isMobile } = useBreakpoint();
  return isMobile ? <MobileLayout>{children}</MobileLayout> : <WebLayout>{children}</WebLayout>;
}
