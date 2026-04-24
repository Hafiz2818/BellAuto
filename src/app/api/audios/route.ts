// app/api/audio/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BUCKET_NAME = "audios"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!supabase) {
      return NextResponse.json({ 
        error: "Storage service not configured",
        details: "Supabase environment variables missing"
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get("userId")
    
    const targetUserId = queryUserId || session?.user?.id
    
    if (!targetUserId) {
      return NextResponse.json([])
    }

    const audios = await db.audio.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(audios)
  } catch (error) {
    console.error("Get audios error:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!supabase) {
      return NextResponse.json({ 
        error: "Storage service not configured",
        details: "Supabase environment variables missing"
      }, { status: 503 })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null
    const name = formData.get("name") as string

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Validasi tipe file audio
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json({ 
        error: "Invalid audio type. Allowed: MP3, WAV, OGG, AAC" 
      }, { status: 400 })
    }

    // Validasi ukuran (max 20MB)
    if (audioFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File too large. Max 20MB" 
      }, { status: 400 })
    }

    const cleanName = audioFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `audio-${session.user.id}-${Date.now()}-${cleanName}`
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, audioFile, {
        cacheControl: '3600',
        contentType: audioFile.type || 'audio/mpeg',
        upsert: false
      })

    if (uploadError) {
      console.error("Supabase audio upload error:", uploadError)
      return NextResponse.json({ 
        error: "Failed to upload audio",
        details: uploadError.message 
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    const audio = await db.audio.create({
      data: {
        name: name || audioFile.name.replace(/\.[^/.]+$/, ""),
        originalName: audioFile.name,
        mimeType: audioFile.type || "audio/mpeg",
        size: audioFile.size,
        filePath: publicUrl, // Simpan URL publik
        userId: session.user.id
      }
    })

    return NextResponse.json(audio)
  } catch (error) {
    console.error("Upload audio error:", error)
    return NextResponse.json({ 
      error: "Failed to upload audio",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!supabase) {
      return NextResponse.json({ 
        error: "Storage service not configured"
      }, { status: 503 })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Get audio and verify ownership
    const audio = await db.audio.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 })
    }

    // Delete file from Supabase Storage
    try {
      const fileName = audio.filePath?.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([fileName])
      }
    } catch (e) {
      console.log("Could not delete audio from storage:", e)
      // Lanjutkan delete dari DB meski file storage gagal dihapus
    }

    // Delete from database
    await db.audio.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete audio error:", error)
    return NextResponse.json({ error: "Failed to delete audio" }, { status: 500 })
  }
}