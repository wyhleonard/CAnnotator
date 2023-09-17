import React from 'react';
import { useState, useEffect, useRef } from 'react';
import DeletePigmentIcon from "../../../Icons/negative.svg";
import { valuePositionWithMinMaxValues } from "../../utils";

const PigmentItem = ({
    pigment,
    index,
    originPigment,
    demoSliderLength,
    demoSilderBlockWidth,
    iconSize
}) => {
    const demoMixedPigmentInDiffQuantities = [
        [['#cdc56d', 0.02], ['#cbc46d', 0.03], ['#cbc46c', 0.04], ['#ccc56b', 0.05], ['#ccc66b', 0.06], ['#cac56a', 0.07], ['#c7c36a', 0.08], ['#c3bf66', 0.09], ['#bebc64', 0.1], ['#b7b964', 0.11], ['#a2b464', 0.13], ['#8caf62', 0.15], ['#7aa95c', 0.17]],
        [['#cdc56d', 0.02], ['#cbc46d', 0.03], ['#cbc46c', 0.04], ['#ccc56b', 0.05], ['#ccc66b', 0.06], ['#cac56a', 0.07], ['#c7c36a', 0.08], ['#c3bf66', 0.09], ['#bebc64', 0.1], ['#b7b964', 0.11], ['#a2b464', 0.13], ['#8caf62', 0.15], ['#7aa95c', 0.17]],
        [['#cdc56d', 0.02], ['#cbc46d', 0.03], ['#cbc46c', 0.04], ['#ccc56b', 0.05], ['#ccc66b', 0.06], ['#cac56a', 0.07], ['#c7c36a', 0.08], ['#c3bf66', 0.09], ['#bebc64', 0.1], ['#b7b964', 0.11], ['#a2b464', 0.13], ['#8caf62', 0.15], ['#7aa95c', 0.17]],
    ]
    const originPigmentInDiffQuantities = [
        [],
        [],
        [],
        [['#98c2ca', 0.01], ['#97c2cb', 0.02], ['#97c2cb', 0.03], ['#96c2cc', 0.04], ['#94c2cd', 0.05], ['#90c2ce', 0.06], ['#8abecf', 0.07], ['#82bace', 0.08], ['#7ab6cd', 0.09], ['#72b2cc', 0.1], ['#60aac9', 0.12], ['#4fa2c5', 0.14], ['#429bc1', 0.16]],
        [],
        [],
        [['#fcea28', 0.01], ['#faea2d', 0.02], ['#f8e935', 0.03], ['#f7e83c', 0.04], ['#f4e647', 0.05], ['#f0e252', 0.06], ['#e9dc5d', 0.07], ['#dfd263', 0.08], ['#d7c765', 0.09], ['#d2c065', 0.1], ['#ceba66', 0.12], ['#cbb866', 0.14], ['#c9b666', 0.16]],
        [['#98c2ca', 0.01], ['#97c2cb', 0.02], ['#97c2cb', 0.03], ['#96c2cc', 0.04], ['#94c2cd', 0.05], ['#90c2ce', 0.06], ['#8abecf', 0.07], ['#82bace', 0.08], ['#7ab6cd', 0.09], ['#72b2cc', 0.1], ['#60aac9', 0.12], ['#4fa2c5', 0.14], ['#429bc1', 0.16]],
        [],
        [],
        [],
        [],
        [],
    ]



    let silderBackground = "linear-gradient(to right,";
    const backgroundColors = originPigmentInDiffQuantities[pigment[0]];
    backgroundColors.forEach((color, idx) => idx !== backgroundColors.length - 1 ? silderBackground += (color[0] + ",") : silderBackground += color[0] + ")")

    let silderBackground2 = "linear-gradient(to right,";
    const backgroundColors2 = demoMixedPigmentInDiffQuantities[index];
    backgroundColors2.forEach((color, idx) => idx !== backgroundColors2.length - 1 ? silderBackground2 += (color[0] + ",") : silderBackground2 += color[0] + ")")

    // 根据quantity计算position TODO：根据position计算quantity
    const displayedQuantities = originPigmentInDiffQuantities[pigment[0]];
    const silderPositon = valuePositionWithMinMaxValues(pigment[1], displayedQuantities);
    // const finalPosition = silderPositon * demoSliderLength - demoSilderBlockWidth / 2;
    const [finalPosition, setFinalPosition] = useState(silderPositon * demoSliderLength - demoSilderBlockWidth / 2);

    const sliderRef = useRef(null);
    const isDragging = useRef(false);

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    // 处理滑块拖拽
    const handleMouseMove = (event) => {
        if (isDragging.current) {
            const sliderWidth = sliderRef.current.offsetWidth;
            const offsetX = event.clientX - sliderRef.current.offsetLeft;
            const newValue = (offsetX / sliderWidth) * 100;
            newValue < 0 ? setFinalPosition(0) : newValue > sliderWidth ? setFinalPosition(100) :  // 限制滑块在slider内
            setFinalPosition(newValue);
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div key={`apigment-item-${index}`} className="A-pigment-item-container">
            <div className="A-color-block" style={{ marginLeft: "0px", background: `${originPigment[pigment[0]][0]}` }} />
            <div
                ref={sliderRef}
                className="A-slider-container"
                onMouseDown={handleMouseDown}>
                <div className="A-slider-item" style={{ background: silderBackground }} />
                <div className="A-slider-item" style={{ marginTop: "2px", background: silderBackground2 }} />
                <div
                    className="A-slider-block"
                    style={{ left: `${finalPosition}px`, cursor: "grab" }}
                >
                    <div className="A-slider-icon" />
                </div>
            </div>
            <div className="A-silder-value">
                <span className="STitle-text-contrast" style={{ marginLeft: "4px", fontSize: "16px" }}>{`${(finalPosition/100).toFixed(1)}`}</span>
            </div>
            <div className="A-pigment-delete">
                <div className="Icon-button" style={{
                    background: `url(${DeletePigmentIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    cursor: 'pointer',
                }} />
            </div>
            {/* <div
                ref={sliderRef}
                style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: 'lightgray',
                    borderRadius: '10px',
                    position: 'relative',
                    cursor: 'pointer'
                }}
                onMouseDown={handleMouseDown}
            >
                <div className='A-slider-block' style={{ left: `${finalPosition}px`, cursor: "grab" }}
                />
                <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    Value: {Math.round(finalPosition)}
                </p>
            </div> */}
        </div>
    );
};

export default PigmentItem;
