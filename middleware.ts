import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function safeEqual(actual: string, expected: string): boolean {
  let difference = actual.length ^ expected.length;
  const length = Math.max(actual.length, expected.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (actual.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export function middleware(request: NextRequest) {
  const expectedUser = process.env.INTERNAL_EMAIL_USER;
  const expectedPassword = process.env.INTERNAL_EMAIL_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return new NextResponse("Internal email console is not configured.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  const authorization = request.headers.get("authorization");
  const encoded = authorization?.startsWith("Basic ")
    ? authorization.slice(6)
    : "";

  let user = "";
  let password = "";
  try {
    const credentials = atob(encoded);
    const separator = credentials.indexOf(":");
    if (separator >= 0) {
      user = credentials.slice(0, separator);
      password = credentials.slice(separator + 1);
    }
  } catch {
    // Invalid Basic Auth payload. Fall through to the challenge.
  }

  const userMatches = safeEqual(user, expectedUser);
  const passwordMatches = safeEqual(password, expectedPassword);
  if (!userMatches || !passwordMatches) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "cache-control": "no-store",
        "www-authenticate": 'Basic realm="Sparck internal", charset="UTF-8"',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/interno/:path*", "/api/internal/:path*"],
};
