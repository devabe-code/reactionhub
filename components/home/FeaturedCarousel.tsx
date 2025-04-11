{items.map((item) => (
  <div key={item.id} className="keen-slider__slide">
    <VideoCard
      id={item.id}
      title={item.title}
      subtitle={item.subtitle}
      thumbnail={item.thumbnail}
      type={item.type}
      primaryLink={item.primaryLink}
      externalLink={item.externalLink}
      showBadge={true}
      showDate={false}
      showButtons={false}
      progress={item.progress}
      duration={item.duration}
    />
  </div>
))}