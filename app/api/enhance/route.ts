import { NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "nodejs";
export const maxDuration = 60;

const CODEFORMER_MODEL =
  "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56";

const REMBG_MODEL =
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

type Mode = "enhance" | "rembg";

function asUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (output && typeof output === "object" && "url" in output) {
    const url = (output as { url: unknown }).url;
    if (typeof url === "function") return String(url());
    if (typeof url === "string") return url;
  }
  if (Array.isArray(output) && output.length > 0) {
    return asUrl(output[0]);
  }
  return null;
}

export async function POST(request: Request) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Missing REPLICATE_API_TOKEN in .env.local" },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const image = form.get("image");
  const mode = String(form.get("mode") || "enhance") as Mode;

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
  }

  if (mode !== "enhance" && mode !== "rembg") {
    return NextResponse.json({ error: "Choose a valid processing mode." }, { status: 400 });
  }

  const replicate = new Replicate({ auth: token });
  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUri = `data:${image.type || "image/jpeg"};base64,${bytes.toString("base64")}`;

  try {
    const output =
      mode === "rembg"
        ? await replicate.run(REMBG_MODEL, {
            input: { image: dataUri },
          })
        : await replicate.run(CODEFORMER_MODEL, {
            input: {
              image: dataUri,
              codeformer_fidelity: 0.5,
              background_enhance: true,
              face_upsample: true,
              upscale: 2,
            },
          });

    const url = asUrl(output);
    if (!url) {
      return NextResponse.json(
        { error: "Replicate did not return an image URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Replicate request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
