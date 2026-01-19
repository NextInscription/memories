import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-[#e8f1f3] dark:border-gray-800 bg-white dark:bg-background-dark py-12">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Shelby"
            className="size-6 rounded-full object-contain"
          />
          <span className="text-lg font-bold serif-title italic">Memories</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400"></div>
        <p className="text-sm text-gray-400">© 2026 Digital Memories Inc.</p>
      </div>
    </footer>
  );
}
