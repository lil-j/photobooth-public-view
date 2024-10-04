import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const image_url = searchParams.get('image_url');
    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    src={image_url} style={{ width: 600, height: 1500, transform: 'rotate(90deg)', }} />
            </div>
        ),
        {
            width: 1500,
            height: 600,
        },
    );
}
