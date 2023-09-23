import React from 'react';
import { useState, useEffect, useRef } from 'react';
import DeletePigmentIcon from "../../../Icons/negative.svg";
import { valuePositionWithMinMaxValues } from "../../utils";

const originPigment = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]]
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
            ['#363937', 0.13]],
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

const PigmentItem = ({
    pigments,
    mixedPigments,
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
    

    let silderBackground = "linear-gradient(to right,";
    const backgroundColors = originPigmentInDiffQuantities[pigment[0]];
    // const backgroundColors = generateGradientArray(originPigment[pigment[0]][0], 16, 0.5);
    backgroundColors.forEach((color, idx) => idx !== backgroundColors.length - 1 ? silderBackground += (color[0] + ",") : silderBackground += color[0] + ")")
    // console.log(pigment);

    let silderBackground2 = "linear-gradient(to right,";
    const [backgroundColors2,setBackgroundColors2] = useState(demoMixedPigmentInDiffQuantities[index]);
    backgroundColors2.forEach((color, idx) => idx !== backgroundColors2.length - 1 ? silderBackground2 += (color[0] + ",") : silderBackground2 += color[0] + ")")
    // console.log(silderBackground2);

    // 根据quantity计算position TODO：根据position计算quantity
    const displayedQuantities = originPigmentInDiffQuantities[pigment[0]];
    const silderPositon = valuePositionWithMinMaxValues(pigment[1], displayedQuantities);
    // console.log(pigment[1], silderPositon);
    // const finalPosition = silderPositon * demoSliderLength - demoSilderBlockWidth / 2;
    const [finalPosition, setFinalPosition] = useState(silderPositon);

    useEffect(() => {
        console.log("finalPosition:", finalPosition);
    }, [finalPosition]);

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
            const newValue = (offsetX / sliderWidth) * demoSliderLength;
            newValue < 0 ? setFinalPosition(0) : newValue > sliderWidth ? setFinalPosition(sliderWidth) :  // 限制滑块在slider内
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

    useEffect(() => {
        let body = { pigments: pigments, mixedPigments: mixedPigments, index: index }
            fetch("http://localhost:8000/gen_slider_bg", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                console.log("Success:",index, data);
                setBackgroundColors2(data['new_bg']);
            })
            .catch(error => console.error("Error fetching data:", error));
    }, [pigments]);

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
                <span className="STitle-text-contrast" style={{ marginLeft: "4px", fontSize: "16px" }}>{`${((finalPosition+10)/10 ).toFixed(0)}`}</span>
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
