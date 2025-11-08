import { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import Header from "@/components/shared/header";
import SiteNav from "@/components/navigation/site-nav";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Next Tiptap",
  description:
    "A modern WYSIWYG rich text editor based on tiptap and shadcn ui for ReactJs/NextJs",
  keywords: "Tiptap, WYSIWYG, Rich Text Editor, ReactJS, NextJS",
  metadataBase: new URL(`https://next-tiptap.vercel.app`),
  openGraph: {
    type: "website",
    url: `https://next-tiptap.vercel.app`,
    title: "Next Tiptap",
    description:
      "A modern WYSIWYG rich text editor based on tiptap and shadcn ui for ReactJs/NextJs",
    siteName: "Next Tiptap",
    locale: "en_US",
    images: "/opengraph-image.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontMono.variable} ${fontSans.variable} antialiased`}
    >
      <body className="min-h-screen flex bg-white">
        {/* Sidebar on large screens */}
        <SiteNav />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="px-4 py-6 lg:px-8 grow">{children}</main>
        </div>
      </body>
    </html>
  );
}
