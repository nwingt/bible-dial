export default defineNuxtPlugin(() => {
  const prevent = (e: Event) => e.preventDefault()

  document.addEventListener('gesturestart', prevent)
  document.addEventListener('gesturechange', prevent)
  document.addEventListener('gestureend', prevent)

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault()
  }, { passive: false })
})
