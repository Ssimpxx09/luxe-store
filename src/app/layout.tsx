import "./globals.css";
import { ChatWidget } from "@/components/ChatWidget";
import { Footer, Header, StoreProvider } from "@/components/Shell";

export const metadata = {
  title: "LUXE — Store",
  description: "Full-stack e-commerce store"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
