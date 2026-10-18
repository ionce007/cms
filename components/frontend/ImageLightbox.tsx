// components/common/ImageLightbox.tsx
'use client';

import { useState, createContext, useContext } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface LightboxContextType {
    openLightbox: (images: string[], index?: number) => void;
}

const LightboxContext = createContext<LightboxContextType>({
    openLightbox: () => { },
});

export function useLightbox() {
    return useContext(LightboxContext);
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    const openLightbox = (imgs: string[], startIndex = 0) => {
        setImages(imgs);
        setIndex(startIndex);
        setOpen(true);
    };

    return (
        <LightboxContext.Provider value={{ openLightbox }}>
            {children}
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                slides={images.map(src => ({ src }))}
                index={index}
                plugins={[Zoom, Thumbnails]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    scrollToZoom: true,
                }}
                carousel={{ finite: true }}
            />
        </LightboxContext.Provider>
    );
}