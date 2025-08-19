import "@/styles/global.css";
import "@/styles/animations.css";
import "@/utils/polyfills";   

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
