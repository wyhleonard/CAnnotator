import { useState } from "react";
import "../../sharedCss.css"
import "./SegmentTools.css"
import { iconLevel2 } from "../../sharedConstants";
import PositivePoint from "../../../Icons/positive.svg";
import NegativePoint from "../../../Icons/negative.svg";
// import LeftStep from "../../../Icons/left.svg";
import RightStep from "../../../Icons/right.svg";
import DeleteSeg from "../../../Icons/delete.svg";
import CutSeg from "../../../Icons/cut.svg";

const barWidth = 348;
const barHeight = 64;
const iconRatio = 0.7;

export const SegmentTools = (

) => {
    const [positivePoints, setPositivePoints] = useState([]);
    const [negativePoints, setNegativePoints] = useState([]);

    // 拖拽
    const [currentLT, setCurrentLT] = useState([540, 0]);
    const [isMaskDrag, setIsMaskDrag] = useState(false);
    const [maskMoveP, setMaskMoveP] = useState([0, 0]);

    const handleDragStart = (e) => {
        setIsMaskDrag(true);
        setMaskMoveP([
            e.clientX,
            e.clientY,
        ]);
    }

    const handleDragMove = (e) => {
        if(isMaskDrag) {
            if(e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
                // 没做最大值边界检测 => 试过，但有个BUG
                const newL = Math.max(0, currentLT[0] + e.clientX - maskMoveP[0]);
                const newT = Math.max(0, currentLT[1] + e.clientY - maskMoveP[1]);
                setCurrentLT([newL,newT]);

                setMaskMoveP([
                    e.clientX,
                    e.clientY
                ])
            }
        }
    }

    const handleDragEnd = (e) => {
        if(isMaskDrag) {
            setIsMaskDrag(false);
            setMaskMoveP([0, 0]);
        }
    }

    return <div 
        className="Toolbar-container" 
        style={{
            width: `${barWidth}px`,
            height: `${barHeight}px`,
            left: `${currentLT[0]}px`,
            top: `${currentLT[1]}px`,
        }}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
    >
        {/* positive point button */}
        <div className="Icon-container"
            style={{
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: "solid",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${PositivePoint}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                }}
            />
        </div>
        {/* negative point button */}
        <div className="Icon-container"
            style={{
                marginLeft: "8px",
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: "solid",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${NegativePoint}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                }}
            />
        </div>
        {/* undo button */}
        <div className="Icon-container"
            style={{
                marginLeft: "8px",
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: (positivePoints.length > 0 || negativePoints.length > 0) ? "solid" : "dashed",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${RightStep}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                    transform: "rotateY(180deg)"
                }}
            />
        </div>
        {/* redo button */}
        <div className="Icon-container"
            style={{
                marginLeft: "8px",
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: "solid",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${RightStep}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                }}
            />
        </div>
        {/* delete button */}
        <div className="Icon-container"
            style={{
                marginLeft: "8px",
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: "solid",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${DeleteSeg}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                }}
            />
        </div>
        {/* cut button */}
        <div className="Icon-container"
            style={{
                marginLeft: "8px",
                width: `${iconLevel2}px`,
                height: `${iconLevel2}px`,
                borderStyle: "solid",
            }}
        >
            <div 
                className="Icon-button"
                style={{
                    background: `url(${CutSeg}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel2 * iconRatio}px`,
                    height: `${iconLevel2 * iconRatio}px`,
                    cursor: 'pointer',
                }}
            />
        </div>
    </div>
}