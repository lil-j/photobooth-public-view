"use server";
import { PKPass } from "passkit-generator";
import fs from "fs";
import path from "path";

const passData = {
    "secondary-auxiliary": [
        {
            fieldUUID: "f8198930-814e-11ef-b825-41174ed9dab8",
            value: "Your strip on 9/22/2024",
            label: "Your strip on 9/22/2024",
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
    coupon: {}
};

export async function generatePass() {
    try {
        // Load certificates
        const certificates = {
            wwdr: fs.readFileSync(path.join(process.cwd(), './certificates/AppleWWDR.pem')),
            signerCert: fs.readFileSync(path.join(process.cwd(), './certificates/passCert.pem')),
            signerKey: fs.readFileSync(path.join(process.cwd(), './certificates/passKey.pem'), 'utf8'), // Read as string
        };

        // Create the pass using PKPass
        const pass = new PKPass({}, certificates, {
            description: "Example Apple Wallet Pass",
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

        // Add images to the pass
        const icon = fs.readFileSync(path.join(process.cwd(), './model/icon.png'));
        const icon2x = fs.readFileSync(path.join(process.cwd(), './model/icon@2x.png'));
        const strip = fs.readFileSync(path.join(process.cwd(), './model/strip.png'));

        // Use addBuffer to attach images to the pass
        pass.addBuffer("icon.png", icon);
        pass.addBuffer("icon@2x.png", icon2x);
        pass.addBuffer("strip.png", strip);

        // Generate the .pkpass file stream
        const passStream = pass.getAsStream();

        // Set response headers if this is part of an API response
        const stream = fs.createWriteStream(path.join(process.cwd(), './output/pass.pkpass'));
        passStream.pipe(stream);

        passStream.on('error', (err) => {
            console.error('Error creating pass:', err);
        });

        stream.on('finish', () => {
            console.log('Pass created successfully!');
        });

    } catch (err) {
        console.error('Error generating pass:', err);
    }
}
