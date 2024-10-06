"use client"

import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";

export default function PhotoDisplay({photoUrls}) {
    const [showStack, setShowStack] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setShowStack(false)
        }, 500)
    }, []);
    const initialRotations = [-20, 20, 0]
    return (
        <div className="flex md:flex-row items-center justify-center flex-col gap-4 mt-2 overflow-x-auto">
            <div className="flex gap-4 flex-col justify-center">
                {
                    photoUrls.map((photo, index) => {
                        return <motion.img
                            key={index + "final"}
                            layoutId={"photo-" + photo}
                            style={{
                                rotate: `0deg`,
                            }}
                            className="rounded-lg aspect-square w-full object-cover"
                            src={photo} alt={"pic " + index}/>
                    })
                }
            </div>
        </div>
    )

}
