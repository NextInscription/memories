import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import logo from "../assets/logo.png";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-solid border-[#e8f1f3] dark:border-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Shelby"
            className="size-8 rounded-full object-contain"
          />
          <h2 className="text-xl font-bold tracking-tight serif-title italic">
            Memories
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <WalletConnector />
        </div>
      </div>
    </header>
  );
}
