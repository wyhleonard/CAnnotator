import "../../sharedCss.css"
import "./SegmentationList.css"
import { useContext } from "react";
import Histogram from "./Histogram";
import AppContext from "../../hooks/createContext";

const segSize = 60;

export const SegmentationList = ({
    colors
}) => {
    const {
        stickers: [stickers, ],
        activeSticker: [, setActiveSticker],
        chosenStickers: [chosenStickers, setChosenStickers],
        isEditing: [isEditing,],
    } = useContext(AppContext);

    const handleStickerClick = (i) => {
        if (isEditing === 0) {

            const chosenStickersArray = Array.from(chosenStickers);
            const stickerIndex = chosenStickersArray.indexOf(i);
            if(stickerIndex !== -1) {
                chosenStickersArray.splice(stickerIndex, 1);
                setChosenStickers(new Set(chosenStickersArray));
            } else {
                setChosenStickers(new Set([...chosenStickersArray, i]));
            }

            setActiveSticker(i); // 有什么用
        }
    };

    // console.log("test-print-stickers", stickers)
    // console.log("test-print-colors", colors) // [{}]

    const segItems = stickers.map((el, i) => {

        return <div
            key={`segment-item-${i}`}
            className="Segment-item-container"
            style={{ height: `${segSize}px` }}
        >
            <div className={`Segment-item-image ${chosenStickers.has(i) ? "active" : ""}`} style={{ width: `${segSize}px` }}>
                <img 
                    className="Image-container" 
                    src={el.toDataURL()} 
                    alt="" 
                    onClick={() => handleStickerClick(i)} 
                />
            </div>
            {
                JSON.stringify(colors[i]) !== "{}" &&
                <div className={`Segment-item-histogram`} style={{ width: `calc(100% - ${segSize}px - 8px)`}}>
                    <Histogram colors={colors[i]} />
                </div>
            }
        </div>
    })

    return <div className="SDefault-container" style={{overflowY: "hidden"}}>
        <div className="STitle-container" style={{ marginTop: "8px", background: "#b09872" }}>
            <div className="Segment-title-container" style={{width: "60px"}}>
                <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>SEG</span>
            </div>
            <div className="Segment-title-container" style={{width: "calc(100% - 68px)", marginLeft: "8px"}}>
                <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>Color DIST</span>
            </div>
        </div>
        <div className="Segment-list-container">
            {segItems}
        </div>
    </div>
}
