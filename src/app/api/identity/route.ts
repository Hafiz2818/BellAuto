// app/api/identity/route.ts
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BUCKET_NAME = "logos"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        schoolName: "Aplikasi Bel Sekolah", 
        description: "Silakan login untuk mengelola data sekolah Anda",
        address: "",
        logoUrl: ""
      })
    }

    const identity = await db.appIdentity.findFirst({
      where: { userId: session.user.id }
    })

    return NextResponse.json(identity || { 
      schoolName: "Sekolah Saya", 
      description: "Deskripsi sekolah Anda",
      address: "",
      logoUrl: ""
    })
  } catch (error) {
    console.error("Get identity error:", error)
    return NextResponse.json({ 
      schoolName: "Sekolah", 
      description: "",
      address: "",
      logoUrl: ""
    }, { status: 500 })
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
    const schoolName = formData.get("schoolName") as string || "Sekolah"
    const description = formData.get("description") as string || ""
    const address = formData.get("address") as string || ""
    const logoFile = formData.get("logo") as File | null

    let logoUrl: string | undefined = undefined

    // Handle logo upload to Supabase Storage
    if (logoFile && logoFile.size > 0) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json({ 
          error: "Invalid file type. Allowed: JPG, PNG, WEBP, SVG" 
        }, { status: 400 })
      }

      // Validasi ukuran (max 5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "File too large. Max 5MB" 
        }, { status: 400 })
      }

      const ext = logoFile.name.split(".").pop() || "png"
      const fileName = `logo-${session.user.id}-${Date.now()}.${ext}`
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          contentType: logoFile.type,
          upsert: false
        })

      if (uploadError) {
        console.error("Supabase upload error:", uploadError)
        return NextResponse.json({ 
          error: "Failed to upload logo",
          details: uploadError.message 
        }, { status: 500 })
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)
      
      logoUrl = publicUrl
      console.log("Logo uploaded to Supabase:", logoUrl)
    }

    // Check existing identity
    const existing = await db.appIdentity.findFirst({
      where: { userId: session.user.id }
    })

    if (existing) {
      // Delete old logo from Supabase Storage if new one uploaded
      if (logoUrl && existing.logoUrl) {
        try {
          const oldFileName = existing.logoUrl.split('/').pop()
          if (oldFileName && oldFileName !== logoUrl.split('/').pop()) {
            await supabase.storage
              .from(BUCKET_NAME)
              .remove([oldFileName])
          }
        } catch (e) {
          console.log("Could not delete old logo from storage:", e)
        }
      }

      const updated = await db.appIdentity.update({
        where: { id: existing.id },
        data: {
          schoolName,
          description,
          address,
          ...(logoUrl && { logoUrl })
        }
      })
      return NextResponse.json(updated)
    } else {
      const created = await db.appIdentity.create({
        data: {
          schoolName,
          description,
          address,
          logoUrl,
          userId: session.user.id
        }
      })
      return NextResponse.json(created)
    }
  } catch (error) {
    console.error("Update identity error:", error)
    return NextResponse.json({ 
      error: "Failed to update identity",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  return POST(request)
}