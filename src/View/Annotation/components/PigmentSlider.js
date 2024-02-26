import { useMemo } from 'react';
import { useState, useEffect, useRef } from 'react';
import DeletePigmentIcon from "../../../Icons/negative.svg";
import "./PigmentSlider.css";
import "./MixingMethod.css";

const silderValueGap = 10; // slider的值域范围为16

const PigmentSlider = ({
    pigmentList,
    currentIndex,
    targetColor,
    changeMatchedColor,
    changeMatchedDist,
    sliderBlockWidth,
    iconSize,
    changeMixedPigmentList,
    basePigments
}) => {
    // console.log("test-pigment-slider", currentIndex, pigmentList); // pigmentList: [[2, 0.5], [4, 7.5], [3, 1]]
    const [silderPosition, setSliderPosition] = useState(-1);
    const [valueRange, setValueRange] = useState([0, 0]);
    const [sliderBackgroundBase, setSliderBackgroundBase] = useState([]);
    const [sliderBackground, setSliderBackground] = useState([]);
    
    // initial valueRange and silderPosition
    useEffect(() => {
        if(silderPosition === -1) {
            // 自适应valueRange
            const pigmentQuantity = pigmentList[currentIndex][1];
            const rangeStart = Math.floor(pigmentQuantity / silderValueGap);
            setValueRange([rangeStart * silderValueGap, (rangeStart + 1) * silderValueGap])
            setSliderPosition((pigmentQuantity - rangeStart * silderValueGap) / silderValueGap)
        }
    }, [silderPosition, pigmentList, currentIndex, valueRange])

    // update the silder background
    useEffect(() => {
        if(valueRange[1] !== 0) {
            // console.log("test-print-bugs: ", pigmentList, currentIndex, valueRange)

            let body = {
                pigmentList: pigmentList, 
                index: currentIndex,
                valueRange: valueRange,
            }
            fetch("http://localhost:8000/gen_slider_bg", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                console.log("backend - gen_slider_bg: ", data)
                setSliderBackgroundBase(data['base_bg']);
                setSliderBackground(data['mixed_bg']);
            })
            .catch(error => console.error("Error fetching data:", error));
        }
    }, [pigmentList, currentIndex, valueRange])

    const silderBackgroundOrigin = useMemo(() => {
        let silderBackgroundOrigin = "linear-gradient(to right,";
        sliderBackgroundBase.forEach((color, idx) => idx !== sliderBackgroundBase.length - 1 ? silderBackgroundOrigin += (color + ",") : silderBackgroundOrigin += color + ")")
        return silderBackgroundOrigin
    }, [sliderBackgroundBase])

    const silderBackgroundMixed = useMemo(() => {
        let silderBackgroundMixed = "linear-gradient(to right,";
        sliderBackground.forEach((color, idx) => idx !== sliderBackground.length - 1 ? silderBackgroundMixed += (color + ",") : silderBackgroundMixed += color + ")")
        return silderBackgroundMixed
    }, [sliderBackground])

    // 拖拽的逻辑
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const finalSilderPositon = sliderRef.current ? silderPosition * sliderRef.current.offsetWidth - sliderBlockWidth * 0.5 : - sliderBlockWidth * 0.5;

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);

        // 更新matchedColor and distance, silderBackgroundMixed
        const newQuantity = valueRange[0] + silderPosition * silderValueGap;
        let body = {
            pigmentList: pigmentList,
            index: currentIndex,
            newQuantity: newQuantity, 
            targetColor: targetColor
        }
        fetch("http://localhost:8000/gen_slider_result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
        .then(response => response.json())
        .then(data => {
            console.log("backend: - gen_slider_result", data);
            changeMatchedColor(data['color'])
            changeMatchedDist(data['dist'])
            changeMixedPigmentList(data['newList'])
        })
        .catch(error => console.error("Error fetching data:", error));
    };

    // 处理滑块拖拽 => 就这样吧
    const handleMouseMove = (event) => {
        if (isDragging && sliderRef.current) {
            const boundingRect = sliderRef.current.getBoundingClientRect() // use this function !
            const offsetX = event.clientX - boundingRect['x'];
            const tempWidth = offsetX / boundingRect['width'];
            // console.log("test-print-tempWidth", offsetX, tempWidth);

            if(tempWidth < 0) {
                const rangeStart = valueRange[0] - silderValueGap;
                if(rangeStart < 0) {
                    setValueRange([0, silderValueGap]);
                    setSliderPosition(0);
                } else {
                    setValueRange([rangeStart, rangeStart + silderValueGap]);
                    setSliderPosition(1);
                }
                setIsDragging(false);
            } else if(tempWidth > 1) {
                setValueRange([valueRange[0] + silderValueGap, valueRange[1] + silderValueGap]);
                setSliderPosition(0);
                setIsDragging(false);
            } else {
                setSliderPosition(tempWidth);
            }
        }
    };

    return <div className="A-pigment-item-container">
        <div className="A-color-block" style={{ marginLeft: "0px", background: basePigments[pigmentList[currentIndex][0]][0]}} />
        <div className="A-slider-container" ref={sliderRef}>
            <div className="A-slider-item" style={{ background: silderBackgroundOrigin}} />
            <div className="A-slider-item" style={{ marginTop: "2px", background: silderBackgroundMixed}} />
            <div
                className="A-slider-block"
                style={{ left: `${finalSilderPositon}px`, pointer: "cursor" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <div className="A-slider-icon" />
            </div>
        </div>
        
        <div className="A-silder-value">
            <span 
                className="STitle-text-contrast" 
                style={{ 
                    marginLeft: "4px", 
                    fontSize: "16px"
                }}>
                    {`${(valueRange[0] + silderPosition * silderValueGap).toFixed(2)}`}
                </span>
        </div>

        <div className="A-pigment-delete">
            <div 
                className="Icon-button" 
                style={{
                    background: `url(${DeletePigmentIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    cursor: 'pointer',
                }}
                onClick={() => {
                    pigmentList.splice(currentIndex, 1);
                    changeMixedPigmentList(JSON.parse(JSON.stringify(pigmentList)));

                    if(pigmentList.length > 0) {
                        let body = {
                            pigmentList: pigmentList,
                            targetColor: targetColor
                        }
                        fetch("http://localhost:8000/gen_mixed_result", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(body),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log("backend - gen_mixed_result: ", data)
                            changeMatchedColor(data['mixed_color']);
                            changeMatchedDist(data['mixed_dist']);
                        })
                        .catch(error => console.error("Error fetching data:", error));
                    } else {
                        changeMatchedColor("#ffffff");
                        changeMatchedDist(0);
                    }
                }}
            />
        </div>
    </div>
};

export default PigmentSlider;
