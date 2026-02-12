import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robur Jiu Jitsu - Formulario",
  description: "Formulário de cadastro - Robur Jiu Jitsu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}