"use client"

import {generatePass} from "@/lib/actions";

export default function GeneratePass() {
    return (
        <div>
            <h1>Generate Pass</h1>
            <button
                onClick={async () => {
                    await generatePass()
                }}
            >
                Download Pass
            </button>
        </div>
    )
}
