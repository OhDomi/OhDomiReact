function GeneratingBanner({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="generating-banner" role="status" aria-live="polite">
      <i aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </div>
  )
}

export default GeneratingBanner
