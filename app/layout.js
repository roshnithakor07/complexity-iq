import "./globals.css";

export const metadata = {
  title: "ComplexityIQ — Time & Space Complexity Analyser",
  description:
    "AI-powered tool to analyse Big-O time and space complexity of your code.",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest", // optional
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
