"use server"

import {supabase} from "@/lib/supabase";

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


    return <div>
        <div className="mt-24 mx-auto px-5">
            <h1 className="mx-auto text-3xl font-semibold">
                Your photos from {new Date(data.photoshoot_sessions.session_time).toLocaleDateString()}
            </h1>
            <div className="flex md:flex-row flex-col gap-4 mt-8 overflow-x-auto">
                {photoUrls.map((photo, index) => {
                    return <img
                        className="aspect-square w-96 object-cover"
                        src={photo} alt={"pic " + index} key={index} />
                })}
            </div>
        </div>
    </div>
}
