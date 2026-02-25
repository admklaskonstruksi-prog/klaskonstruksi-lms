const ACCESS_KEY = "f5401951-085f-4ff8-801f9e4de7f5-91e9-446e";
const LIBRARY_ID = "606426";
const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;

export async function uploadVideoToBunny(file: File, title: string): Promise<string | null> {
  try {
    console.log("--- MULAI UPLOAD BUNNY ---");
    console.log("1. Cek Config:", { 
        LibraryID: LIBRARY_ID, 
        KeyExists: !!ACCESS_KEY,
        FileSize: file.size 
    });

    // 1. CREATE ENTRY
    const createResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ title: title || "Untitled Video" }),
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("GAGAL CREATE VIDEO:", errorText);
        throw new Error("Gagal Create Video di Bunny: " + errorText);
    }
    
    const entryData = await createResponse.json();
    const videoId = entryData.guid;
    console.log("2. Video Entry Created. ID:", videoId);

    // 2. UPLOAD FILE
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await fetch(`${BASE_URL}/${videoId}`, {
      method: "PUT",
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "application/octet-stream",
        "Accept": "application/json"
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("GAGAL UPLOAD BINARY:", errorText);
        throw new Error("Gagal Upload File ke Bunny: " + errorText);
    }

    console.log("3. Upload Sukses!");
    return videoId; 

  } catch (error) {
    console.error("BUNNY ERROR TOTAL:", error);
    return null;
  }
}

export async function deleteVideoFromBunny(videoId: string) {
    if (!videoId) return;
    try {
        await fetch(`${BASE_URL}/${videoId}`, {
            method: 'DELETE',
            headers: { 
                AccessKey: ACCESS_KEY,
                "Accept": "application/json"
            }
        });
    } catch (e) {
        console.log("Gagal hapus di bunny (abaikan)", e);
    }
}