import "../../sharedCss.css"
import "./AnnotationList.css"
import "./SegmentationList.css"
import AppContext from "../../hooks/createContext";
import { useContext, useRef } from "react";

const annoSize = 63.8;
const colorItemSize = 16;

export const AnnotationList = (

) => {
    const {
        stickers: [stickers],
        annotatedLabels: [annotatedLabels],
        checkedColor: [checkedColor, setCheckedColor] // stickerIndex, annoIndex, click.x, click.y
    } = useContext(AppContext);

    // console.log("test-print-annotatedLabels", annotatedLabels)

    const divRef = useRef(null);
    const refPosition = divRef.current ? divRef.current.getBoundingClientRect() : undefined;

    // console.log("test-print-refPosition", refPosition)
    // console.log("test-print-checkedColor", checkedColor)

    const annoItems = annotatedLabels.map((anno, idx) => {
        const colorItems = anno.annotations.map((color, index) => {
            return <div
                key={`color-item-${index}`}
                className="Color-item-container"
                style={{
                    marginTop: `${index === 0 ? 0 : 2}px`,
                    height: `${colorItemSize}px`,
                    backgroundColor: `${color.mixed}`,
                    border: `${checkedColor[0] === idx && checkedColor[1] === index ? '2px solid #5a4e3b' : 'none'}`
                }}
                onClick={(e) => {
                    if(checkedColor[0] === idx && checkedColor[1] === index) {
                        setCheckedColor([-1, -1, -1, -1]);
                    } else if(refPosition) {
                        const tag = idx % 2;
                        const marginGap = tag === 0 ? -4 : 0;
                        const startX = refPosition.x + (idx % 2 + 1) * refPosition.width / 2 + marginGap - 10; // 先这样吧
                        setCheckedColor([idx, index, startX, e.clientY]);
                    }
                }}
            />
        })

        return <div
            key={`anno-item-${idx}`} 
            className="Annotation-item-container"
            style={{
                marginLeft: `${idx % 2 === 0 ? 0: 8}px`,
                height: `${annoSize}px`,
            }}
        >
            <div className="Annotation-item-image" style={{width: `${annoSize}px`}}>
                <img 
                    className="Image-container" 
                    src={stickers[anno.stickerIndex].toDataURL()} 
                    alt=""
                />
            </div>
            <div className="Annotation-item-colors" style={{width: `calc(100% - ${annoSize}px)`}}>
                <div className="Annotation-item-colorlist">
                    {colorItems}
                </div>
            </div>
        </div>
    })

    return <div 
        className="SDefault-container" 
        style={{
            display: "flex", 
            flexWrap: "wrap",
            position: "relative"
        }}
        ref={divRef}
    >
        {annoItems}
    </div>
}