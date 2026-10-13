function isLumaPage(url: URL): boolean {
  return url.protocol === "https:"
    && ["luma.com", "lu.ma"].includes(url.hostname)
    && !url.port && !url.username && !url.password;
}

export function extractLumaCover(html: string): string | null {
  const script = html.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!script) return null;

  try {
    const data = JSON.parse(script[1]) as {
      props?: { pageProps?: { initialData?: { data?: { event?: { cover_url?: unknown } } } } };
    };
    const cover = data?.props?.pageProps?.initialData?.data?.event?.cover_url;
    if (typeof cover !== "string") return null;
    const url = new URL(cover);
    return url.protocol === "https:" && url.hostname === "images.lumacdn.com"
      && !url.port && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

// Sólo se consulta la página del evento elegido; la portada es opcional.
export async function fetchLumaCover(rawUrl: string): Promise<string | null> {
  try {
    let url = new URL(rawUrl);
    url.search = "";
    url.hash = "";
    const signal = AbortSignal.timeout(4_000);
    for (let redirects = 0; redirects < 3; redirects += 1) {
      if (!isLumaPage(url)) return null;
      const response = await fetch(url, {
        headers: { accept: "text/html" },
        redirect: "manual",
        signal,
        next: { revalidate: 3600 },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return null;
        url = new URL(location, url);
        continue;
      }
      if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
      const html = await response.text();
      return html.length <= 2_000_000 ? extractLumaCover(html) : null;
    }
  } catch {
    // Un timeout o un cambio de Luma no debe impedir mostrar el evento.
  }
  return null;
}
