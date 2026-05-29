"use client";

import { useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

const DEVNET_URL = "https://api.devnet.solana.com";

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    try {
      import("@solana/wallet-adapter-react-ui/styles.css");
    } catch {
      console.warn("Failed to load wallet adapter styles");
    }
  }, []);

  return (
    <ConnectionProvider endpoint={DEVNET_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
