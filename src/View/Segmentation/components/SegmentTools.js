import { useState, useContext } from "react";
import "../../sharedCss.css"
import "./SegmentTools.css"
import { iconLevel2 } from "../../sharedConstants";
import PositivePoint from "../../../Icons/positive.svg";
import NegativePoint from "../../../Icons/negative.svg";
// import LeftStep from "../../../Icons/left.svg";
import RightStep from "../../../Icons/right.svg";
import DeleteSeg from "../../../Icons/delete.svg";
import CutSeg from "../../../Icons/cut.svg";
import AppContext from "../../hooks/createContext";

const barWidth = 348;
const barHeight = 64;
const iconRatio = 0.7;

const iconContainerStyle = {
    marginLeft: "8px",
    width: `${iconLevel2}px`,
    height: `${iconLevel2}px`,
    borderStyle: "solid",
};

const iconStyle = (imgPath) => {
    return {
        background: `url(${imgPath}) no-repeat`,
        backgroundSize: 'contain',
        width: `${iconLevel2 * iconRatio}px`,
        height: `${iconLevel2 * iconRatio}px`,
        cursor: 'pointer',
    }
};

export const SegmentTools = ({
    handleResetInteraction,
    handleUndoInteraction,
    handleRedoInteraction,
    handleCreateSticker,
    userNegClickBool,
    setUserNegClickBool,
    hasClicked,
}) => {
    const {
        isErased: [isErased, ],
        stickerTabBool: [stickerTabBool, setStickerTabBool],
        svg: [svg, ],
        svgs: [svgs, ],
        clicksHistory: [clicksHistory, ],
    } = useContext(AppContext);

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
        if (isMaskDrag) {
            if (e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
                // 没做最大值边界检测 => 试过，但有个BUG
                const newL = Math.max(0, currentLT[0] + e.clientX - maskMoveP[0]);
                const newT = Math.max(0, currentLT[1] + e.clientY - maskMoveP[1]);
                setCurrentLT([newL, newT]);

                setMaskMoveP([
                    e.clientX,
                    e.clientY
                ])
            }
        }
    }

    const handleDragEnd = (e) => {
        if (isMaskDrag) {
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
        <div className={`Icon-container ${!stickerTabBool && !userNegClickBool && "active"}`}
            style={Object.assign(JSON.parse(JSON.stringify(iconContainerStyle)), {marginLeft: "0px"})}
        >
            <div
                className="Icon-button"
                style={iconStyle(PositivePoint)}
                onClick={() => userNegClickBool ? setUserNegClickBool(false) : setStickerTabBool(prev => !prev)}
            />
        </div>
        {/* negative point button */}
        <div className={`Icon-container ${!hasClicked && "disable"} ${userNegClickBool && "active"}`}
            style={iconContainerStyle}
        >
            <div
                className="Icon-button"
                style={iconStyle(NegativePoint)}
                onClick={() => setUserNegClickBool(true)}
            />
        </div>
        {/* undo button */}
        <div className={`Icon-container ${!svg && "disable"}`}
            style={iconContainerStyle}
        >
            <div
                className="Icon-button"
                style={{ ...iconStyle(RightStep), transform: "rotateY(180deg)" }}
                onClick={handleUndoInteraction}
            />
        </div>
        {/* redo button */}
        <div className={`Icon-container ${!clicksHistory?.length && "disable"}`}
            style={iconContainerStyle}
        >
            <div
                className="Icon-button"
                style={iconStyle(RightStep)}
                onClick={handleRedoInteraction}
            />
        </div>
        {/* delete button */}
        <div className={`Icon-container ${(!svg && !svgs && !isErased) && "disable"}`}
            style={iconContainerStyle}
        >
            <div
                className="Icon-button"
                style={iconStyle(DeleteSeg)}
                onClick={handleResetInteraction}
            />
        </div>
        {/* cut button */}
        <div className={`Icon-container ${!svg && "disable"}`}
            style={iconContainerStyle}
        >
            <div
                className="Icon-button"
                style={iconStyle(CutSeg)}
                onClick={handleCreateSticker}
            />
        </div>
    </div>
}