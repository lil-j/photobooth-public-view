"use server";
import { PKPass } from "passkit-generator";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";
import fetch from 'node-fetch';

// Helper function to convert a readable stream to a buffer
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

// Next.js API route
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const strip_id = searchParams.get('strip_id');

    // Get Strip Data from the database
    const { data, error } = await supabase
        .from("photo_strips")
        .select("*, photoshoot_sessions(*)")
        .eq("id", strip_id)
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: 'Error fetching data from the database' }), { status: 500 });
    }

    const passData = {
        "secondary-auxiliary": [
            {
                fieldUUID: "f8198930-814e-11ef-b825-41174ed9dab8",
                value: `Taken on ${new Date(data.photoshoot_sessions.session_time).toLocaleDateString()}`,
                label: data.photoshoot_sessions.event_name,
                key: "1"
            }
        ],
        backgroundColor: "rgb(0,0,0)",
        foregroundColor: "rgb(0,208,132)",
        labelColor: "rgb(255,255,255)",
        description: "photostrip",
        organizationName: "boothd",
        passTypeIdentifier: "pass.photobooth",
        teamIdentifier: "XFVHH553N7",
        formatVersion: 1,
        logoText: data.photoshoot_sessions.event_name,
        coupon: {
            "headerFields": [
                {
                    "value": "3 Memories",
                    "textAlignment": "PKTextAlignmentLeft",
                    "dateStyle": "PKDateStyleFull",
                    "label": "Photostrip",
                    "dataDetectorTypes": "PKDataDetectorTypeLink",
                    "attributedValue": "<a href=\"https://jxke.me\">Hi</a>",
                    "isRelative": false,
                    "changeMessage": "jljkljlkjl"
                }
            ],
            "primaryFields": []
        }
    };

    console.log(data);

    try {
        // Load certificates
        const certificates = {
            wwdr: fs.readFileSync(path.join(process.cwd(), './certificates/AppleWWDR.pem')),
            signerCert: fs.readFileSync(path.join(process.cwd(), './certificates/passCert.pem')),
            signerKey: fs.readFileSync(path.join(process.cwd(), './certificates/passKey.pem'), 'utf8'), // Read as string
        };

        // Create the pass using PKPass
        const pass = new PKPass({}, certificates, {
            description: `✨ Add your photostrip to your digital wallet! 👉`,
            passTypeIdentifier: "pass.photobooth", // Adjusted to match your data
            serialNumber: `AAGH44625236dddaffbda${Math.random()}`, // Ensure unique serial number
            organizationName: "boothd",
            teamIdentifier: "XFVHH553N7",
            foregroundColor: "rgb(0,208,132)",
            labelColor: "rgb(255,255,255)",
            backgroundColor: "rgb(0,0,0)",
        });

        pass.setBarcodes("36478105430");
        pass.type = "coupon"; // Set the correct pass type

        // Set fields dynamically based on passData
        pass.secondaryFields.push({
            key: "stripDate",
            label: passData["secondary-auxiliary"][0].label,
            value: passData["secondary-auxiliary"][0].value,
        });

        let stripImageUrl = supabase.storage
            .from("photos")
            .getPublicUrl(`/strips/${data.photoshoot_sessions.event_name}/${strip_id}`);
        stripImageUrl = stripImageUrl.data.publicUrl;
        console.log(stripImageUrl);

        // Fetch the image from a direct URL and add to the pass
        const stripImageResponse = await fetch("http://localhost:3000/api/rotate-image?image_url=" + stripImageUrl);

        if (!stripImageResponse.ok) {
            throw new Error('Failed to download image');
        }

        // Convert the stream to a buffer
        const stripImageBuffer = await streamToBuffer(stripImageResponse.body);
        pass.addBuffer("strip.png", stripImageBuffer);

        // Add local images (if needed)
        const icon = fs.readFileSync(path.join(process.cwd(), './model/icon.png'));
        const icon2x = fs.readFileSync(path.join(process.cwd(), './model/icon@2x.png'));

        pass.addBuffer("icon.png", icon);
        pass.addBuffer("icon@2x.png", icon2x);

        // Generate the .pkpass file stream
        const passStream = pass.getAsStream();

        // Create a buffer to accumulate the data chunks from the stream
        const chunks = [];

        // Listen for data events and push chunks
        passStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // Listen for the 'end' event to return the response
        return new Promise((resolve, reject) => {
            passStream.on('end', () => {
                const passBuffer = Buffer.concat(chunks);

                // Return the .pkpass file as a Response object
                resolve(new Response(passBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.apple.pkpass',
                        'Content-Disposition': 'attachment; filename="pass.pkpass"'
                    }
                }));
            });

            passStream.on('error', (err) => {
                console.error('Error creating pass:', err);
                reject(new Response(JSON.stringify({ error: 'Error generating pass' }), { status: 500 }));
            });
        });

    } catch (err) {
        console.error('Error generating pass:', err);
        return new Response(JSON.stringify({ error: 'Error generating pass' }), { status: 500 });
    }
}
