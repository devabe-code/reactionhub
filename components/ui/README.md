# UI Components

## VideoCard

A flexible card component for displaying video content with various options.

### Usage

```tsx
import { VideoCard } from "@/components/ui/video-card"

export default function MyComponent() {
  return (
    <VideoCard
      id="1"
      title="Video Title"
      subtitle="Optional subtitle"
      thumbnail="/path/to/thumbnail.jpg"
      date={new Date()}
      type="reaction"
      primaryLink="/reactions/1"
      externalLink="https://youtube.com"
      showBadge={true}
      showDate={true}
      showButtons={true}
    />
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | required | Unique identifier for the card |
| title | string | required | Main title of the card |
| subtitle | string | optional | Secondary text below the title |
| thumbnail | string | required | URL to the thumbnail image |
| date | Date | optional | Date to display on the card |
| type | "episode" \| "season" \| "series" \| "reaction" | "reaction" | Type of content, affects badge and icon |
| primaryLink | string | required | URL for the main action (Watch button) |
| externalLink | string | optional | URL for the external link button |
| externalLinkLabel | string | "YouTube" | Label for the external link button |
| className | string | optional | Additional CSS classes |
| aspectRatio | "video" \| "square" \| "portrait" | "video" | Aspect ratio of the thumbnail |
| size | "sm" \| "md" \| "lg" | "md" | Size variant of the card |
| showBadge | boolean | true | Whether to show the type badge |
| showDate | boolean | true | Whether to show the date |
| showButtons | boolean | true | Whether to show action buttons |
| customBadgeColor | string | optional | Custom CSS class for badge color |
| customBadgeText | string | optional | Custom text for the badge |
| customPrimaryButtonText | string | optional | Custom text for primary button |
| customPrimaryButtonIcon | ReactNode | optional | Custom icon for primary button |

## ContentGrid

A responsive grid layout for displaying content cards.

### Usage

```tsx
import { ContentGrid } from "@/components/ui/content-grid"
import { VideoCard } from "@/components/ui/video-card"

export default function MyComponent() {
  return (
    <ContentGrid columns={3}>
      <VideoCard {...props} />
      <VideoCard {...props} />
      <VideoCard {...props} />
    </ContentGrid>
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Grid items to display |
| className | string | optional | Additional CSS classes |
| columns | 1 \| 2 \| 3 \| 4 | 3 | Number of columns at largest breakpoint |

## Examples

Visit `/examples/video-card` to see examples of these components in action.
