import "./globals.css";

export const metadata = {
  title: "ComplexityIQ — Time & Space Complexity Analyser",
  description:
    "AI-powered tool to analyse Big-O time and space complexity of your code. Supports JavaScript, Python, Java, C++.",
  keywords: ["Big-O", "complexity", "algorithm", "analyser", "DSA"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
