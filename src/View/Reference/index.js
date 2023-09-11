import "../sharedCss.css"
import "./index.css"
import SearchIcon from "../../Icons/search.svg";
import LeftIcon from "../../Icons/triangle.svg";
import ConfirmIcon from "../../Icons/confirm.svg";
import { iconLevel1 } from "../sharedConstants";
import { useEffect, useRef, useState } from "react";

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

const iconRatio = 0.7;

export const ReferenceView = () => {
    const blockRef = useRef(null);
    const [blockSize, setBlockSize] = useState(0);

    useEffect(() => {
        setBlockSize([
            blockRef.current?.offsetWidth || 0,
            blockRef.current?.offsetHeight || 0
        ]);
    }, [blockRef])

    // console.log("wyh-test-01", blockSize)

    // 滚轮隐藏后，无法直接触发滑动行为，需要新写一个滚轮函数 👇
    const handleSegmentScroll = (e) => {
        const srollElement = document.getElementById("segmentList");
        if(e.deltaY > 0) {
            srollElement.scrollLeft += blockSize[0] + 8;
        } else if (e.deltaY < 0) {
            srollElement.scrollLeft -= blockSize[0] + 8;
        }
    }

    const segItem = demoSegs.map((seg, idx) => {
        return <div
            key={`r-segmentation-item-${idx}`}
            className="R-segmentation-item"
            style={{
                marginRight: idx === demoSegs.length - 1 ? "0px" : "8px",
            }}
        >
            <img className="Segmentation-image-container" src={seg.image} alt="" />
            <div className="Segmentation-color-list">

            </div>
        </div>
    })

    return <div className="SView-container">
        <div className="Reference-view-content">
            <div className="STitle-container">
                <span className="STitle-text">Reference Images</span>
            </div>
            <div className="STitle-container" style={{marginTop: "8px"}}>
                <div className="Reference-toolbar-container">
                    <input className="Reference-toolbar-search"/>
                    <div className="Reference-search-button">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${SearchIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconLevel1 * iconRatio}px`,
                                height: `${iconLevel1 * iconRatio}px`,
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                    <div className="Reference-number-switch-left">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${LeftIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconLevel1 * iconRatio * 0.9}px`,
                                height: `${iconLevel1 * iconRatio * 0.9}px`,
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                    <div className="Reference-number-display">
                        <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>1 - 50</span>
                    </div>
                    <div className="Reference-number-switch-right">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${LeftIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconLevel1 * iconRatio * 0.9}px`,
                                height: `${iconLevel1 * iconRatio * 0.9}px`,
                                cursor: 'pointer',
                                transform: "rotateY(180deg)"
                            }}
                        />
                    </div>
                    <div className="Reference-image-confirm">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${ConfirmIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconLevel1 * iconRatio * 0.9}px`,
                                height: `${iconLevel1 * iconRatio * 0.9}px`,
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="Reference-image-list">
                <div className="Reference-image-firstrow">
                    <div className="Reference-projection-container" ref={blockRef}>
                        <div className="Reference-projection">

                        </div>
                    </div>
                    <div 
                        className="Reference-segmentation-list"
                        onWheel={handleSegmentScroll}
                        id="segmentList"
                    >
                        {segItem}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
