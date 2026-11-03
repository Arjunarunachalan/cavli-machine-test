
import { NextRequest } from "next/server";

const MODEL_URL =
  "https://d8wojkg2185gh.cloudfront.net/strapi/C41_QS_a3f9c78cdb.glb";

export async function GET(request: NextRequest) {
  try {
    const range = request.headers.get("range");

    const upstream = await fetch(MODEL_URL, {
      headers: range ? { Range: range } : {},
      cache: "force-cache",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return Response.json(
        { error: "Unable to retrieve the 3D model" },
        { status: upstream.status }
      );
    }

    const headers = new Headers({
      "Content-Type": "model/gltf-binary",
      "Cache-Control": "public, max-age=86400",
    });

    for (const header of [
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("3D model proxy failed:", error);

    return Response.json(
      { error: "Failed to fetch the 3D model" },
      { status: 500 }
    );
  }
}
