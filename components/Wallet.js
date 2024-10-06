"use client"

import Image from "next/image";
import AppleWallet from "@/app/apple_wallet.webp";
import {motion} from "framer-motion";
import {useState} from "react";

export default function AddToWallet({id}) {
    const [loading, setLoading] = useState(false)
    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0, scale: [1, 1.05, 1] }} // Adding the scale animation
            transition={{
                duration: 1,
                bounce: 0,
                type: "spring",
                delay: 0.5,
                scale: {
                    repeat: Infinity, // Repeat the scale animation indefinitely
                    repeatType: "reverse", // Go back and forth between scale values
                    duration: 2, // Duration of each zoom in and out
                },
            }}
            className="active:opacity-75 transition-opacity fixed w-full bottom-5 flex items-center justify-center"
        >
            <div
                onClick={() => {
                    setLoading(true)
                    window.open(`/api/get-pass?strip_id=${id}`, "_self")
                    setTimeout(
                        () => {
                            setLoading(false)
                        }
                ,
                        3000
                    )
                }}
                className="cursor-pointer items-center border-2 border-black gap-2 px-8 py-2 text-white font-bold whitespace-nowrap flex bg-black/70 backdrop-blur tracking-tight rounded-xl"
            >
                <Image src={AppleWallet} alt="Apple Wallet Logo" className="w-10 h-10" />
                <p>{
                    loading ? "Adding to Wallet..." : "Add to your Apple Wallet"

                }</p>
            </div>
        </motion.div>
    );
}
