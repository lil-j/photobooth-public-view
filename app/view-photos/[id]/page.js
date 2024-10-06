"use server"

import {supabase} from "@/lib/supabase";
    import GeneratePass from "@/components/GeneratePass";
import PhotoDisplay from "@/components/PhotoDisplay";
import Image from "next/image";
import AppleWallet from "../../apple_wallet.webp"
import AddToWallet from "@/components/Wallet";

export default async function ViewPhotosPage({params}) {
    // Get Strip Info From Supabase
    const {data, error} = await supabase
        .from("photo_strips")
        .select("*, photoshoot_sessions(*)")
        .eq("id", params.id)
        .single()

    let photoUrls = []

    for (const photo of data.raw_photos) {
        const storage = supabase.storage.from("photos").getPublicUrl(`/raw/${data.photoshoot_sessions.event_name}/${photo}`)
        photoUrls.push(storage.data.publicUrl)
    }


    return <div className="mb-[60px]">
        <div className="fixed z-50 tracking-tight flex-col top-0 bg-white/60 backdrop-blur w-full h-[60px] flex items-center justify-center mx-auto text-lg border-black/20 border-b capitalize text-center font-semibold">
            Your Photostrip from {data.photoshoot_sessions.event_name}
        </div>
        <div className="mt-[70px] max-w-xs mx-auto px-5">
            <small
                className="font-normal text-xs opacity-60">{new Date(data.photoshoot_sessions.session_time).toLocaleDateString()}</small>
            <h1>3 Photos</h1>
            <PhotoDisplay photoUrls={photoUrls}/>
        </div>
        <AddToWallet id={params.id}/>
    </div>
}
