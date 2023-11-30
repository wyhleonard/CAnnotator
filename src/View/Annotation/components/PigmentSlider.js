import React, { useMemo } from 'react';
import { useState, useEffect, useRef } from 'react';
import DeletePigmentIcon from "../../../Icons/negative.svg";
import { valuePositionWithMinMaxValues } from "../../utils";
import "./PigmentSlider.css";
import "./MixingMethod.css";

const originPigments = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]]
const originPigmentInDiffQuantities = [
    [
        ['#f04d40', 0.01],
        ['#e44a3e', 0.02],
        ['#cf473d', 0.03],
        ['#bb413d', 0.04],
        ['#b03e3c', 0.05],
        ['#a83c3c', 0.06],
        ['#9a3a3d', 0.07],
        ['#903a3e', 0.08],
        ['#883c3f', 0.09],
        ['#813e40', 0.1],
        ['#794041', 0.11],
        ['#714242', 0.12],
        ['#6b4342', 0.13]
    ],
    [
        ['#9f0701', 0.01],
        ['#940000', 0.02],
        ['#860500', 0.03],
        ['#830800', 0.04],
        ['#850100', 0.05],
        ['#870000', 0.06],
        ['#870000', 0.07],
        ['#850400', 0.08],
        ['#801600', 0.09],
        ['#762715', 0.1],
        ['#68372c', 0.11],
        ['#55443b', 0.12],
        ['#474940', 0.13]
    ],
    [
        ['#96443f', 0.01],
        ['#703f3a', 0.02],
        ['#633833', 0.03],
        ['#62322d', 0.04],
        ['#652c27', 0.05],
        ['#682721', 0.06],
        ['#69251e', 0.07],
        ['#68251e', 0.08],
        ['#672721', 0.09],
        ['#652923', 0.1],
        ['#622c26', 0.11],
        ['#5e2f2b', 0.12],
        ['#513834', 0.13]
    ],
    [
        ['#fff48f', 0.01],
        ['#fffe90', 0.02],
        ['#ffff90', 0.03],
        ['#ffff91', 0.04],
        ['#fffe92', 0.05],
        ['#fff993', 0.06],
        ['#fff194', 0.07],
        ['#fde994', 0.08],
        ['#f8e094', 0.09],
        ['#f0d191', 0.1],
        ['#eac48c', 0.11],
        ['#e6ba85', 0.12],
        ['#e2b37d', 0.13]
    ],
    [
        ['#e89300', 0.01],
        ['#db8614', 0.02],
        ['#ce7821', 0.03],
        ['#c16b2a', 0.04],
        ['#b65f30', 0.05],
        ['#ae5933', 0.06],
        ['#a95535', 0.07],
        ['#a35036', 0.08],
        ['#994b37', 0.09],
        ['#8e4537', 0.1],
        ['#854137', 0.11],
        ['#803f37', 0.12],
        ['#7c3e36', 0.13]
    ],
    [
        ['#ca5a35', 0.01],
        ['#ae4a3b', 0.02],
        ['#9c4a3e', 0.03],
        ['#924a3f', 0.04],
        ['#8b4b3f', 0.05],
        ['#864d3f', 0.06],
        ['#804e3e', 0.07],
        ['#76483b', 0.08],
        ['#6f3d36', 0.09],
        ['#6b3532', 0.1],
        ['#682f2f', 0.11],
        ['#64292c', 0.12],
        ['#60252b', 0.13]
    ],
    [
        ['#549f2e', 0.01],
        ['#5e9631', 0.02],
        ['#5f8c33', 0.03],
        ['#5d8035', 0.04],
        ['#587535', 0.05],
        ['#516835', 0.06],
        ['#4a5b35', 0.07],
        ['#435035', 0.08],
        ['#3d4735', 0.09],
        ['#3a4135', 0.1],
        ['#383d35', 0.11],
        ['#363a37', 0.12],
        ['#363937', 0.13]
    ],
    [
        ['#8cc9de', 0.01],
        ['#86c0d9', 0.02],
        ['#7bb5d7', 0.03],
        ['#75add7', 0.04],
        ['#69a3d6', 0.05],
        ['#5a98d6', 0.06],
        ['#4e90d4', 0.07],
        ['#438ad3', 0.08],
        ['#3b86d1', 0.09],
        ['#3283cf', 0.1],
        ['#287fcd', 0.11],
        ['#1d7bca', 0.12],
        ['#0d77c7', 0.13]
    ],
    [
        ['#697bd2', 0.01],
        ['#5a79d1', 0.02],
        ['#4974ca', 0.03],
        ['#4a74c7', 0.04],
        ['#4d75c8', 0.05],
        ['#4d75c9', 0.06],
        ['#4a73ca', 0.07],
        ['#4470ca', 0.08],
        ['#3d6cc9', 0.09],
        ['#3466c6', 0.1],
        ['#2d61c4', 0.11],
        ['#275ec2', 0.12],
        ['#245bc1', 0.13]
    ],
    [
        ['#4281df', 0.01],
        ['#4180d7', 0.02],
        ['#1c65ba', 0.03],
        ['#004da3', 0.04],
        ['#004196', 0.05],
        ['#274092', 0.06],
        ['#414595', 0.07],
        ['#4c499b', 0.08],
        ['#4d4ba1', 0.09],
        ['#4a4ca6', 0.1],
        ['#464da9', 0.11],
        ['#424eac', 0.12],
        ['#3e4eae', 0.13]
    ],
    [
        ['#2c2c30', 0.01],
        ['#2e2d30', 0.02],
        ['#2d2d30', 0.03],
        ['#2d2c2f', 0.04],
        ['#2c2c2f', 0.05],
        ['#2b2b2e', 0.06],
        ['#2a292d', 0.07],
        ['#29282b', 0.08],
        ['#28262a', 0.09],
        ['#262528', 0.1],
        ['#252327', 0.11],
        ['#242225', 0.12],
        ['#232024', 0.13]
    ],
    [
        ['#323637', 0.01],
        ['#333537', 0.02],
        ['#333537', 0.03],
        ['#323437', 0.04],
        ['#313337', 0.05],
        ['#313236', 0.06],
        ['#313236', 0.07],
        ['#313135', 0.08],
        ['#313135', 0.09],
        ['#313135', 0.1],
        ['#313135', 0.11],
        ['#313134', 0.12],
        ['#313134', 0.13]
    ],
    [
        ['#f2f0d8', 0.01],
        ['#f2eed7', 0.02],
        ['#efead7', 0.03],
        ['#e9e6d7', 0.04],
        ['#e9e5d7', 0.05],
        ['#e8e4d5', 0.06],
        ['#e4e1d3', 0.07],
        ['#dedcd1', 0.08],
        ['#d9d6cf', 0.09],
        ['#d6d1cd', 0.1],
        ['#d5cecd', 0.11],
        ['#d4cdcd', 0.12],
        ['#d4cdce', 0.13]
    ]
]

const PigmentSlider = ({
    pigmentList,
    currentIndex,
    targetColor,
    changeMatchedColor,
    changeMatchedDist,
    sliderLength,
    sliderBlockWidth,
    iconSize,
    changeMixedPigmentList
}) => {
    console.log("test-pigment-slider", currentIndex, pigmentList);
    const [silderPosition, setSliderPosition] = useState(0);

    useEffect(() => {
        const pigmentQuantity = pigmentList[currentIndex][1] / 100;
        const currentPositon = valuePositionWithMinMaxValues(pigmentQuantity, originPigmentInDiffQuantities[currentIndex]);
        
        console.log("test-currentPositon", currentPositon)
        setSliderPosition(currentPositon)
    }, [pigmentList, currentIndex])

    const [sliderBackground, setSliderBackground] = useState([]);
    useEffect(() => {
        console.log("test-gen_slider_bg-enter")
        let body = {pigmentList: pigmentList, index: currentIndex}
        fetch("http://localhost:8000/gen_slider_bg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success: - gen_slider_bg", currentIndex, data);
            setSliderBackground(data['new_bg']);
        })
        .catch(error => console.error("Error fetching data:", error));
    }, [pigmentList, currentIndex])

    let silderBackgroundOrigin = "linear-gradient(to right,";
    const backgroundColors = originPigmentInDiffQuantities[pigmentList[currentIndex][0]];
    backgroundColors.forEach((color, idx) => idx !== backgroundColors.length - 1 ? silderBackgroundOrigin += (color[0] + ",") : silderBackgroundOrigin += color[0] + ")")

    const silderBackgroundMixed = useMemo(() => {
        let silderBackgroundMixed = "linear-gradient(to right,";
        sliderBackground.forEach((color, idx) => idx !== sliderBackground.length - 1 ? silderBackgroundMixed += (color + ",") : silderBackgroundMixed += color + ")")

        console.log("wyh-test-silderBackgroundMixed", silderBackgroundMixed)
        return silderBackgroundMixed
    }, [sliderBackground])

    const finalSilderPositon = silderPosition * sliderLength - sliderBlockWidth * 0.5;

    // console.log("test-print-silderPosition", currentIndex, silderPosition)

    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    // BUG：为啥会被触发两次 => 之前用document绑定的方法的原因
    const handleMouseUp = (event) => {
        setIsDragging(false);

        const sliderWidth = sliderRef.current.offsetWidth;
        const offsetX = event.clientX - sliderRef.current.offsetLeft;
        const tempWidth = offsetX / sliderWidth;
        const newSliderPosition = tempWidth < 0 ? 0 : (tempWidth > 1 ? 1: tempWidth);

        // 更新matchedColor and distance, silderBackgroundMixed
        // console.log("test-handleMouseUp", silderPosition, newSliderPosition) // silderPosition 无效
        let body = {pigmentList: pigmentList, index: currentIndex, newQuantity: (newSliderPosition * 13).toFixed(2), targetColor: targetColor}
        fetch("http://localhost:8000/gen_slider_result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success: - gen_slider_result", data);
            changeMatchedColor(data['color'])
            changeMatchedDist(data['dist'])
            changeMixedPigmentList(data['newList'])
        })
        .catch(error => console.error("Error fetching data:", error));
    };

    // 处理滑块拖拽
    const handleMouseMove = (event) => {
        if (isDragging) {
            const sliderWidth = sliderRef.current.offsetWidth;
            const offsetX = event.clientX - sliderRef.current.offsetLeft;
            const tempWidth = offsetX / sliderWidth;
            const newSliderPosition = tempWidth < 0 ? 0 : (tempWidth > 1 ? 1: tempWidth);
            setSliderPosition(newSliderPosition)
        }
    };

    return <div className="A-pigment-item-container">
        <div className="A-color-block" style={{ marginLeft: "0px", background: originPigments[pigmentList[currentIndex][0]][0]}} />
            <div
                ref={sliderRef}
                className="A-slider-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <div className="A-slider-item" style={{ background: silderBackgroundOrigin}} />
                <div className="A-slider-item" style={{ marginTop: "2px", background: silderBackgroundMixed}} />
                <div
                    className="A-slider-block"
                    style={{ left: `${finalSilderPositon}px`, pointer: "cursor" }}
                >
                    <div className="A-slider-icon" />
                </div>
            </div>

            
            <div className="A-silder-value">
                <span className="STitle-text-contrast" style={{ marginLeft: "4px", fontSize: "16px" }}>{`${(silderPosition * 13).toFixed(2)}`}</span>
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
    </div>
};

export default PigmentSlider;
