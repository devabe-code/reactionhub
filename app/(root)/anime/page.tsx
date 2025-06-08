import React from 'react';
import { db } from "@/database/drizzle";
import { series } from "@/database/schema";
import { eq, ilike, sql, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const TMDB_URL = "https://image.tmdb.org/t/p/original";

export default async function Anime({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; year?: string }
}) {
  // Build conditions array
  const conditions = [eq(series.is_anime, true)];

  // Add search condition if provided
  if (searchParams.search) {
    conditions.push(ilike(series.title, `%${searchParams.search}%`));
  }

  // Add status condition if provided
  if (searchParams.status) {
    conditions.push(eq(series.status, searchParams.status));
  }

  // Add year condition if provided
  if (searchParams.year) {
    const year = parseInt(searchParams.year);
    conditions.push(sql`EXTRACT(YEAR FROM ${series.first_air_date}) = ${year}`);
  }

  // Fetch all anime series from the database with filters
  const animeList = await db
    .select()
    .from(series)
    .where(and(...conditions))
    .orderBy(series.title);

  // Get unique statuses and years for filters
  const statuses = [...new Set(animeList.map(anime => anime.status))].filter(Boolean) as string[];
  const years = [...new Set(animeList.map(anime => 
    anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : null
  ))].filter((year): year is number => year !== null).sort((a, b) => b - a);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 mt-10 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10">All Anime Series</h1>
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form className="flex gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search anime..."
                name="search"
                defaultValue={searchParams.search || ''}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || ''}
              className="bg-gray-900/50 border border-gray-700 rounded-md px-3 text-white"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              name="year"
              defaultValue={searchParams.year || ''}
              className="bg-gray-900/50 border border-gray-700 rounded-md px-3 text-white"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 md:-mt-20 relative z-10">
        {animeList.map((anime) => (
          <div 
            key={anime.id}
            className={`mb-12 md:mb-16 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-gray-500/10`}
            style={{ 
              background: `linear-gradient(to right, ${anime.coverColor}10, transparent, ${anime.coverColor}10)`,
              boxShadow: `0 4px 30px ${anime.coverColor}30`,
            }}
          >
            <Link href={`/series/${anime.id}`}>
              <div className="relative h-[40vh] sm:h-[45vh] md:h-[50vh] overflow-hidden">
                {/* Backdrop Image */}
                <Image
                  src={anime.backdrop_path ? `${TMDB_URL}${anime.backdrop_path}` : '/placeholder-wide.jpg'}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                
                {/* Gradient Overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-black"
                />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-end md:items-center p-4 sm:p-6 md:p-12">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center w-full">
                    {/* Poster */}
                    <div className="hidden md:block relative h-40 w-28 sm:h-48 sm:w-32 md:h-64 md:w-44 rounded-lg overflow-hidden shadow-2xl border-2 -mt-16 md:mt-0 transition-transform duration-300 hover:scale-105 hover:bg-gray-500/10" style={{ borderColor: anime.coverColor }}>
                      <Image
                        src={anime.poster_path ? `${TMDB_URL}${anime.poster_path}` : 'https://placehold.co/300x450?text=No+Image'}
                        alt={anime.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 mt-2 md:mt-0">
                      <div 
                        className="inline-block px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold mb-2 md:mb-4"
                        style={{ backgroundColor: `${anime.coverColor}90` }}
                      >
                        {anime.status || 'Unknown'}
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 text-white">{anime.title}</h2>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-4">
                        <div className="flex items-center gap-1 flex-wrap">
                            {/* Display anime genres as badges */}
                            {Array.isArray(anime.genres) && anime.genres.slice(0, 3).map((genre, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800/50 text-white mr-1 mb-1 hidden md:block"
                              >
                                {genre.name}
                              </span>
                            ))}
                        </div>

                        <div className="text-sm md:text-base text-white/70">
                            Released {anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : 'Unknown'}
                        </div>
                        <div className="text-sm md:text-base text-white/70 font-bold">
                          {anime.number_of_episodes || '?'} episodes | {anime.number_of_seasons || '?'} seasons
                        </div>
                      </div>
                      
                      <p className="text-sm md:text-base text-white/80 line-clamp-2 sm:line-clamp-3 md:line-clamp-4 max-w-3xl hidden md:block">
                        {anime.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {animeList.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 rounded-xl p-8">
            <p className="text-xl text-gray-400">No anime series found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
