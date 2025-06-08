import HeroSection from "@/components/HeroSection"
import MovieCarousel from "@/components/MovieCarousel"

export default function Loading() {
  return (
    <div className="mx-auto overflow-hidden">
      <div>
        <HeroSection 
          featuredContent={[]} 
          upcomingContent={[]} 
          isLoading={true}
        />
      </div>

      <div className="mx-auto max-w-7xl -mt-35 px-4 sm:px-6 lg:px-8">
        <MovieCarousel 
          items={[]}
          title="Continue Watching"
          isLoading={true}
        />
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-10">
            <MovieCarousel 
              items={[]}
              title="Loading..."
              isLoading={true}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 