import { NextResponse } from "next/server";
import { getDriveClient } from "@/lib/google/driveClient";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const drive = getDriveClient();

  try {
    const [metadata, media] = await Promise.all([
      drive.files.get({ fileId, fields: "mimeType", supportsAllDrives: true }),
      drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" },
      ),
    ]);

    return new NextResponse(Buffer.from(media.data as ArrayBuffer), {
      headers: {
        "Content-Type": metadata.data.mimeType ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
