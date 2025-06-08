/* Database Data Types*/
export interface User {
    id: string;
    name?: string;
    email?: string;
    emailVerified?: Date;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
    lastActivityDate?: Date;
  }
  
  export interface Account {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
  }
  
  export interface Session {
    sessionToken: string;
    userId: string;
    expires: Date;
  }
  
  export interface Authenticator {
    credentialID: string;
    userId: string;
    providerAccountId: string;
    credentialPublicKey: string;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports?: string;
  }
  
  export interface Movie {
    id: string;
    title: string;
    original_title?: string | null;
    description: string;
    release_date?: Date;
    runtime?: number;
    budget?: number;
    revenue?: number;
    language?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    coverColor: string;
    genres?: string[] | null[];
    production_companies?: string[];
    tmdb_id: number;
  }
  
  export interface Series extends BaseContent {
    first_air_date?: Date | string| null;
    last_air_date?: Date | string | null;
    number_of_seasons: number | null;
    number_of_episodes: number | null;
  }
  
  export interface Season {
    id: string;
    series_id: string;
    season_number: number;
    air_date?: Date;
    poster_path?: string;
    overview?: string;
    tmdb_id: number;
  }
  
  export interface Episode {
    id: string;
    season_id: string;
    series_id: string;
    title: string;
    episode_number: number;
    description: string;
    air_date?: Date;
    still_path?: string;
    tmdb_id: number;
  }
  
  export interface Anime {
    id: string;
    series_id: string;
    mal_id: number;
    title_japanese?: string;
    title_english?: string;
    title_synonyms?: string[];
    status?: string;
    episodes?: number;
    duration?: string;
    rating?: string;
    coverColor: string;
    score?: number;
    scored_by?: number;
    rank?: number;
    popularity?: number;
    members?: number;
    favorites?: number;
    synopsis?: string;
    background?: string;
    premiered?: string;
    broadcast?: string[];
    genres?: string[] | null[];
  }

  export type ReactionParams = {
    id: string;
    series_id: string | null;
    season_id: string | null;
    episode_id: string | null;
    season_number: number;
    season: Season | null;
    season_title: string | null;
    episode: Episode | null;  
    title: string;
    first_link: string;
    second_link: string;
    thumbnail: string;
    createdAt: Date;
    updatedAt: Date;
    series: Series | null; 
    anime: Anime | null; 
  };
  

/* API Data Types */
export interface TMDbSeriesData {
  id: number
  name: string
  original_name?: string
  overview?: string
  first_air_date?: string
  last_air_date?: string
  number_of_seasons?: number
  number_of_episodes?: number
  original_language?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genres?: Array<{ id: number; name: string }>
  production_companies?: Array<{ id: number; name: string; logo_path?: string; origin_country?: string }>
  seasons?: Array<TMDbSeasonData>
}

export interface TMDbSeasonData {
  id: number
  name: string
  season_number: number
  episode_count?: number
  air_date?: string
  poster_path?: string
  overview?: string
}

export interface TMDbEpisodeData {
  id: number
  name: string
  episode_number: number
  season_number: number
  air_date?: string
  overview?: string
  still_path?: string
}

export interface TMDbMovieData {
  id: number
  title: string
  original_title?: string | null
  overview?: string
  release_date?: string
  runtime?: number
  budget?: number
  revenue?: number
  original_language?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genres?: Array<{ id: number; name: string }>
  production_companies?: Array<{ id: number; name: string; logo_path?: string; origin_country?: string }>
}

export interface JikanAnimeData {
  mal_id: number
  title: string
  title_japanese?: string
  title_english?: string
  title_synonyms?: string[]
  status?: string
  episodes?: number
  duration?: string
  rating?: string
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  members?: number
  favorites?: number
  synopsis?: string
  background?: string
  premiered?: string
  broadcast?: { string?: string }
  producers?: Array<{ mal_id: number; type: string; name: string; url: string }>
  licensors?: Array<{ mal_id: number; type: string; name: string; url: string }>
  studios?: Array<{ mal_id: number; type: string; name: string; url: string }>
  genres?: Array<{ mal_id: number; type: string; name: string; url: string }>
  explicit_genres?: Array<{ mal_id: number; type: string; name: string; url: string }>
  themes?: Array<{ mal_id: number; type: string; name: string; url: string }>
  demographics?: Array<{ mal_id: number; type: string; name: string; url: string }>
  images?: {
    jpg?: {
      image_url?: string
      small_image_url?: string
      large_image_url?: string
    }
    webp?: {
      image_url?: string
      small_image_url?: string
      large_image_url?: string
    }
  }
  aired?: {
    from?: string
    to?: string
    string?: string
  }
  source?: string
}

// Common content types
export type ContentType = "movie" | "series" | "anime" | "season" | "episode";

// Base content interface with common properties
export interface BaseContent {
  runtime?: number; // Changed from boolean to optional number
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  id: string;
  title?: string;
  name?: string;
  description: string | null;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  original_title?: string | null;
  genres?: string[] | null[];
  language?: string | null;
  production_companies?: string[] | unknown;
  coverColor: string;
  tmdb_id?: number | null;
  mal_id?: number;
  is_anime?: boolean | null;
}

// Movie specific properties
export interface Movie extends BaseContent {
  // Removed duplicate runtime property
  release_date?: Date;
  budget?: number;
  revenue?: number;
}

// Series specific properties
export interface Series extends BaseContent {
  first_air_date?: Date | string | null;
  last_air_date?: Date | string | null;
  number_of_seasons: number | null; 
  number_of_episodes: number | null; 
}

// Season specific properties
export interface Season extends BaseContent {
  season_number: number;
  air_date?: Date;
  overview?: string;
}

// Episode specific properties
export interface Episode extends BaseContent {
  episode_number: number;
  season_id: string;
  still_path?: string;
  air_date?: Date;
}

export type Reaction = {
  id: string;
  title: string;
  episode?: string;
  thumbnail: string;
  createdAt: Date;
  episode_id?: string;
  season_id?: string;
  first_link?: string;
  progress?: number;
  duration?: number;
}


// Anime specific data
export interface AnimeData {
  title_japanese?: string;
  status?: string;
  episodes?: number;
  duration?: string;
  rating?: string;
  premiered?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  studios?: string[];
  producers?: string[];
}

// Related content interface
export interface RelatedContent {
  series?: Series;
  seasons?: Season[];
  episodes?: Episode[];
  reactions?: Reaction[];
  animeData?: AnimeData;
  episode?: Episode;
  season?: Season;
  otherReactions?: Reaction[];
  nextEpisode?: Episode;
  prevEpisode?: Episode;
}

// Component props interfaces
export interface ContentDetailsProps {
  type: ContentType;
  content: BaseContent;
  relatedContent: RelatedContent;
  session: Session;
}

export interface ContentHeroProps {
  type: ContentType;
  content: BaseContent;
  hasReactions: boolean;
  relatedContent: RelatedContent;
}

export interface ContentMetadataProps {
  type: ContentType;
  content: BaseContent;
  relatedContent: RelatedContent;
}

export interface SeasonListProps {
  series: Series;
  seasons: Season[];
  reactions: Reaction[];
}

export interface EpisodeListProps {
  series: Series;
  episodes: Episode[];
  seasons: Season[];
  reactions: Reaction[];
}

export interface ReactionListProps {
  reactions: Reaction[];
  contentType: ContentType;
  content: BaseContent;
}

export interface ReactionDetailsProps {
  reaction: Reaction;
  relatedContent: RelatedContent;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview?: string;
  tagline?: string;
  release_date?: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  original_language?: string;
  status?: string;
  poster_path?: string;
  backdrop_path?: string | null;
  imdb_id?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  genres?: string[];
  production_companies?: string[];
}

export interface WatchHistory {
  id: string;
  userId: string;
  reactionId: string;
  timestamp: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListItem {
  id: string;
  listId: string;
  seriesId?: string;
  animeId?: string;
  createdAt: Date;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}
