"use client"

import Image from "next/image";
import AppleWallet from "@/app/apple_wallet.webp";

export default function AddToWallet ({id}) {
    return <div
        className="fixed w-full bottom-5 flex items-center justify-center">
        <div
            onClick={() => {
                window.open(`/api/get-pass?strip_id=${id}`, '_blank')
            }}
            className="items-center border-2 border-black gap-2 px-8 py-2 text-white font-bold whitespace-nowrap flex bg-black/70 backdrop-blur tracking-tight rounded-xl">
            <Image src={AppleWallet} alt="Apple Wallet Logo" className="w-10 h-10"/>
            <p>Add to your Apple Wallet</p>
        </div>
    </div>
}
