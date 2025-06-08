import React from 'react';
import { db } from "@/database/drizzle";
import { movies } from "@/database/schema";
import { ilike, sql, and } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const TMDB_URL = "https://image.tmdb.org/t/p/original";

export default async function Movies({
  searchParams,
}: {
  searchParams: { search?: string; year?: string }
}) {
  // Build conditions array
  const conditions = [];

  // Add search condition if provided
  if (searchParams.search) {
    conditions.push(ilike(movies.title, `%${searchParams.search}%`));
  }

  // Add year condition if provided
  if (searchParams.year) {
    const year = parseInt(searchParams.year);
    conditions.push(sql`EXTRACT(YEAR FROM ${movies.release_date}) = ${year}`);
  }

  // Fetch all movies from the database with filters
  const movieList = await db
    .select()
    .from(movies)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(movies.title);

  // Get unique years for filters
  const years = [...new Set(movieList.map(movie => 
    movie.release_date ? new Date(movie.release_date).getFullYear() : null
  ))].filter((year): year is number => year !== null).sort((a, b) => b - a);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 mt-10 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10">All Movies</h1>
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form className="flex gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search movies..."
                name="search"
                defaultValue={searchParams.search || ''}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
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
        {movieList.map((movie) => (
          <div 
            key={movie.id}
            className={`mb-12 md:mb-16 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:bg-gray-500/10`}
            style={{ 
              background: `linear-gradient(to right, ${movie.coverColor}10, transparent, ${movie.coverColor}10)`,
              boxShadow: `0 4px 30px ${movie.coverColor}30`,
            }}
          >
            <Link href={`/movies/${movie.id}`}>
              <div className="relative h-[40vh] sm:h-[45vh] md:h-[50vh] overflow-hidden">
                {/* Backdrop Image */}
                <Image
                  src={movie.backdrop_path ? `${TMDB_URL}${movie.backdrop_path}` : '/placeholder-wide.jpg'}
                  alt={movie.title}
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
                    <div className="hidden md:block relative h-40 w-28 sm:h-48 sm:w-32 md:h-64 md:w-44 rounded-lg overflow-hidden shadow-2xl border-2 -mt-16 md:mt-0 transition-transform duration-300 hover:scale-105 hover:bg-gray-500/10" style={{ borderColor: movie.coverColor }}>
                      <Image
                        src={movie.poster_path ? `${TMDB_URL}${movie.poster_path}` : 'https://placehold.co/300x450?text=No+Image'}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 mt-2 md:mt-0">
                      <div 
                        className="inline-block px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-semibold mb-2 md:mb-4"
                        style={{ backgroundColor: `${movie.coverColor}90` }}
                      >
                        {movie.status || 'Unknown'}
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 text-white">{movie.title}</h2>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-4">
                        <div className="flex items-center gap-1 flex-wrap">
                            {/* Display movie genres as badges */}
                            {Array.isArray(movie.genres) && movie.genres.slice(0, 3).map((genre, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800/50 text-white mr-1 mb-1 hidden md:block"
                              >
                                {genre.name}
                              </span>
                            ))}
                        </div>

                        <div className="text-sm md:text-base text-white/70">
                            Released {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                        </div>
                      </div>
                      
                      <p className="text-sm md:text-base text-white/80 line-clamp-2 sm:line-clamp-3 md:line-clamp-4 max-w-3xl hidden md:block">
                        {movie.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {movieList.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 rounded-xl p-8">
            <p className="text-xl text-gray-400">No movies found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
