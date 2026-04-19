export const metadata = {
  title: 'Muqwil',
  description: 'Muqwil Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
