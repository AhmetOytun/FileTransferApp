import "@/styles/globals.css";

export const metadata = {
  title: "File Transfer App by AhmetOytun",
  description: "Simple file transfer app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-gradient-to-tl from-gray-200 to-gray-700 w-screen h-screen flex flex-col justify-center items-center">
          {children}
        </div>
      </body>
    </html>
  );
}
