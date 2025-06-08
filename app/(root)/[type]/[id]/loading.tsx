import ContentDetails from "@/components/content/ContentDetails"
import { ContentType } from "@/lib/types"

export default function Loading() {
  return (
    <ContentDetails
      type={"movie" as ContentType}
      content={{
        id: "",
        title: "",
        description: "",
        number_of_seasons: null,
        number_of_episodes: null,
        coverColor: "#000000"
      }}
      relatedContent={{}}
      session={{} as any}
      isLoading={true}
    />
  )
} 