import "../../sharedCss.css"
import "./SegmentationList.css"
import React, {
    useContext,
} from "react";
import Histogram from "./Histogram";
import AppContext from "../../hooks/createContext";

const demoSegs = [
    {
        image: "/demoData/segmentations/1.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/2.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/3.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/4.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/5.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/6.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/7.png",
        colorHistogram: []
    }
]

const segSize = 60;

export const SegmentationList = ({
    redoMask, colors
}) => {
    const {
        stickers: [stickers, setStickers],
        activeSticker: [activeSticker, setActiveSticker],
        chosenStickers: [chosenStickers, setChosenStickers],
        isEditing: [isEditing, setIsEditing],
    } = useContext(AppContext);

    const handleStickerClick = (i) => {
        if (isEditing === 0) {
            // setIsEditing(1);
            setActiveSticker(i);
            setChosenStickers(new Set([...chosenStickers, i]));
        }
    };

    const segItems = stickers.map((el, i) => {
        return <div
            key={`segment-item-${i}`}
            className="Segment-item-container"
            style={{ height: `${segSize}px` }}
        >
            <div className={`Segment-item-image ${chosenStickers.has(i) ? "active" : ""}`} style={{ width: `${segSize}px` }}>
                <img className="Image-container" src={el.toDataURL()} alt="" onClick={(e) => {
                    handleStickerClick(i);
                }} />
            </div>
            <div className={`Segment-item-histogram ${chosenStickers.has(i) ? "active" : ""}`} style={{ width: `calc(100% - ${segSize}px - 8px)` }}>
                <Histogram colors={colors[i]} />
            </div>
        </div>
    })

    return <div className="SDefault-container">
        {segItems}
    </div>
}
