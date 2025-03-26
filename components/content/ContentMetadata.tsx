"use client"

import { Calendar, Clock, Globe, Users, TrendingUp, Award } from "lucide-react"
import type { ContentMetadataProps } from "@/lib/types"

// Helper function to parse JSON if needed
const parseJsonField = (field: any) => {
  if (!field) return []
  if (typeof field === "string") {
    try {
      return JSON.parse(field)
    } catch (e) {
      return []
    }
  }
  return field
}

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Unknown"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function ContentMetadata({ type, content, relatedContent }: ContentMetadataProps) {
  // Determine which metadata to show based on content type
  const getMetadataItems = () => {
    const items = []

    // Release Date / Air Date
    if (type === "movie" && content.release_date) {
      items.push({
        icon: <Calendar size={18} className="text-gray-400" />,
        label: "Release Date",
        value: formatDate(content.release_date),
      })
    }

    if ((type === "series" || type === "anime") && content.first_air_date) {
      items.push({
        icon: <Calendar size={18} className="text-gray-400" />,
        label: "First Air Date",
        value: formatDate(content.first_air_date),
      })

      if (content.last_air_date) {
        items.push({
          icon: <Calendar size={18} className="text-gray-400" />,
          label: "Last Air Date",
          value: formatDate(content.last_air_date),
        })
      }
    }

    if (type === "season" && content.air_date) {
      items.push({
        icon: <Calendar size={18} className="text-gray-400" />,
        label: "Air Date",
        value: formatDate(content.air_date),
      })
    }

    if (type === "episode" && content.air_date) {
      items.push({
        icon: <Calendar size={18} className="text-gray-400" />,
        label: "Air Date",
        value: formatDate(content.air_date),
      })
    }

    // Runtime / Duration
    if (type === "movie" && content.runtime) {
      items.push({
        icon: <Clock size={18} className="text-gray-400" />,
        label: "Runtime",
        value: `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`,
      })
    }

    if (type === "anime" && relatedContent.animeData?.duration) {
      items.push({
        icon: <Clock size={18} className="text-gray-400" />,
        label: "Episode Duration",
        value: relatedContent.animeData.duration,
      })
    }

    // Language
    if (content.language) {
      items.push({
        icon: <Globe size={18} className="text-gray-400" />,
        label: "Language",
        value: content.language.toUpperCase(),
      })
    }

    // Budget & Revenue (for movies)
    if (type === "movie") {
      if (content.budget && content.budget > 0) {
        items.push({
          icon: <Users size={18} className="text-gray-400" />,
          label: "Budget",
          value: `$${content.budget.toLocaleString()}`,
        })
      }

      if (content.revenue && content.revenue > 0) {
        items.push({
          icon: <TrendingUp size={18} className="text-gray-400" />,
          label: "Revenue",
          value: `$${content.revenue.toLocaleString()}`,
        })
      }
    }

    // Anime specific stats
    if (type === "anime" && relatedContent.animeData) {
      const animeData = relatedContent.animeData

      if (animeData.status) {
        items.push({
          icon: <Award size={18} className="text-gray-400" />,
          label: "Status",
          value: animeData.status,
        })
      }

      if (animeData.rating) {
        items.push({
          icon: <Users size={18} className="text-gray-400" />,
          label: "Rating",
          value: animeData.rating,
        })
      }

      if (animeData.rank) {
        items.push({
          icon: <TrendingUp size={18} className="text-gray-400" />,
          label: "Rank",
          value: `#${animeData.rank}`,
        })
      }
    }

    return items
  }

  const metadataItems = getMetadataItems()

  // Production Companies
  const productionCompanies = parseJsonField(content.production_companies)

  return (
    <div className="space-y-6">
      {/* Metadata List */}
      {metadataItems.length > 0 && (
        <div className="space-y-4">
          {metadataItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production Companies */}
      {productionCompanies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Production</h3>
          <ul className="space-y-1 text-sm">
            {productionCompanies.map((company: any, index: number) => (
              <li key={index}>{company.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reactions Count */}
      {relatedContent.reactions && relatedContent.reactions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Reactions</h3>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold text-lg">{relatedContent.reactions.length}</span>
            <span className="text-sm">Available Reaction{relatedContent.reactions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  )
}

