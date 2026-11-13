export function publicHtmlAllowsPixels(accepted: boolean): string {
  if (!accepted) return "<main>store</main>";
  return "<main>store</main><script>fbq('init')</script><script>gtag('config')</script>";
}
