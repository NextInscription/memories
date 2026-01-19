import Header from './components/Header'
import Hero from './components/Hero'
import AlbumGrid from './components/AlbumGrid'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#0e181b] dark:text-gray-100 min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <Hero />
        <AlbumGrid />
      </main>
      <Footer />
    </div>
  )
}

export default App
