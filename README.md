# Memories - Decentralized Digital Photo Album

> Built with React + TypeScript on Aptos Shelby Network

**Production URL:** https://memories.ekkodev.xyz/

A decentralized photo album application powered by the Shelby Protocol, enabling users to store and manage their digital memories on the Aptos blockchain with permanent, censorship-resistant storage.

## Features

- **Wallet Connection** - Connect with any Aptos-compatible wallet
- **Media Upload** - Upload images and videos up to 500MB
- **Decentralized Storage** - Files stored on Shelby Network using erasure coding
- **Gallery View** - Beautiful masonry-style grid layout with borders
- **Media Preview** - Full-screen image and video preview
- **Search & Filter** - Find memories by title or filename
- **Infinite Scroll** - Seamless loading of large collections
- **Expiration Control** - Set custom expiration dates for your blobs
- **Dark Mode** - Built-in dark mode support

## Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite 6.0** - Build tool and dev server
- **TailwindCSS 3.4** - Styling with custom design system

### Web3 & Blockchain
- **@aptos-labs/ts-sdk** - Aptos TypeScript SDK
- **@aptos-labs/wallet-adapter-react** - Wallet connection
- **@shelby-protocol/sdk** - Shelby Protocol for decentralized storage
- **@shelby-protocol/react** - React hooks for Shelby

### State Management
- **@tanstack/react-query** - Server state management and caching

### Utilities
- **dayjs** - Date/time manipulation
- **buffer** - Node.js Buffer polyfill for browser

## Project Structure

```
memories/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx      # Top navigation with wallet connector
│   │   ├── Hero.tsx        # Image carousel slider
│   │   ├── AlbumGrid.tsx   # Main gallery grid with infinite scroll
│   │   ├── UploadModal.tsx # Upload dialog with preview
│   │   ├── SearchFilters.tsx # Search input component
│   │   └── Footer.tsx      # Page footer
│   ├── hooks/              # Custom React hooks
│   │   └── useShelby.ts    # Hooks for Shelby operations
│   ├── utils/              # Utility functions
│   │   └── shelby.ts       # Shelby client setup & API calls
│   ├── assets/             # Images, logos, etc.
│   ├── App.tsx             # Root component
│   ├── main.tsx            # App entry point with providers
│   └── index.css           # Global styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.cjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Aptos wallet (Petra, Martian, Pontem, etc.)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables (optional)
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Shelby API Key (optional, for rate limit increases)
VITE_SHELBY_API_KEY=your_api_key_here
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The dev server will start at `http://localhost:5173`

## Key Components

### App.tsx
Root component that renders the main layout:
- Header with wallet connection
- Hero carousel section
- Album grid for displaying memories
- Footer

### main.tsx
Application entry point with provider setup:
- `QueryClientProvider` - React Query for data fetching
- `AptosWalletAdapterProvider` - Wallet connection configured for ShelbyNet

### AlbumGrid.tsx
Main gallery component featuring:
- Infinite scroll pagination (100 items per page)
- Lazy loading of blob content from Shelby API
- Search and filter functionality
- Image/video detection and preview
- Upload modal trigger

### UploadModal.tsx
File upload interface with:
- Drag & drop support
- File type validation (images/videos only, max 500MB)
- Preview for selected files
- Custom expiration date picker
- Upload progress indicator

### shelby.ts
Shelby Protocol integration:
- `ShelbyClient` initialization with Reed-Solomon erasure coding
- `getAccountBlobs()` - Fetch user's stored blobs
- `uploadBlob()` - Upload new blob (wrapper for SDK)

## Design System

### Colors
```css
primary: #4ccce6              /* Cyan accent */
background-light: #fbfaf8     /* Light mode background */
background-dark: #111e21      /* Dark mode background */
```

### Typography
- **Display Font:** Inter (UI elements)
- **Serif Font:** Playfair Display (headings, titles)

### Borders
Photo borders cycle through 5 subtle colors:
- `#f0e6d2` (Cream)
- `#e2ece9` (Mint)
- `#f5e1e1` (Rose)
- `#e1e5f5` (Periwinkle)
- `#f5f1e1` (Champagne)

## API Integration

### Shelby API Endpoints

**Get Account Blobs:**
```
GET https://api.shelbynet.shelby.xyz/shelby/v1/blobs/{account}
```

**Download Blob:**
```
GET https://api.shelbynet.shelby.xyz/shelby/v1/blobs/{account}/{filename}
```

### Network Configuration

- **Network:** ShelbyNet (Aptos testnet)
- **Provider:** Reed-Solomon Erasure Coding (pure JS implementation)
- **Default Expiration:** 30 days from upload

## File Upload Process

1. User selects file (image/video, max 500MB)
2. File is validated and previewed
3. User sets title and optional expiration date
4. File is converted to `Uint8Array`
5. `useUploadBlobs` hook from `@shelby-protocol/react` handles:
   - Erasure encoding (splitting into chunks)
   - Transaction signing via wallet
   - Upload to storage nodes
6. On success, gallery refreshes to show new blob

## Deployment

### Build Configuration

The Vite config includes:
- Node.js polyfills for Buffer, global, process
- Terser minification with console removal
- COOP/COEP headers for SharedArrayBuffer support
- WASM asset handling

### Deploy to Production

```bash
# Build
npm run build

# Output directory: ./dist
# Deploy contents to your hosting service
```

For the production site at https://memories.ekkodev.xyz/, deploy the `dist/` folder using your preferred hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

## Troubleshooting

### Wallet Connection Issues
- Ensure wallet is unlocked and on ShelbyNet
- Try refreshing the page and reconnecting
- Check browser console for errors

### Upload Failures
- Verify file size is under 500MB
- Ensure sufficient gas in wallet
- Check that file is valid image/video format
- Try again if network is congested

### Images Not Loading
- Blob content is lazy-loaded from Shelby API
- Check browser console for failed fetch requests
- Verify account address is correct
- Some blobs may still be processing (check `isWritten` status)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues related to:
- **This App:** Check GitHub Issues
- **Shelby Protocol:** Visit [Shelby Documentation](https://shelby.xyz)
- **Aptos Wallet:** Visit wallet provider's support page

---

Built with love for decentralized storage on the Aptos blockchain.
