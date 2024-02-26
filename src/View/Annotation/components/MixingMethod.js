import { useMemo } from "react";
import "../../sharedCss.css";
import "./MixingMethod.css";
import ConfirmIcon from "../../../Icons/confirm.svg";

// const basisQuantity = 0.01;
const rectSize = 22;
const symbolGap = 4;
const iconSize = 15;

export const MixingMethod = ({
    setPigmentConfirmed,
    mixedStepState,
}) => {
    // console.log("test-print-mixedStepState", mixedStepState);
    const pigmentItems = useMemo(() => {
        if(mixedStepState.length > 0) {
            const itemList = [];
            for(let i = 0; i < mixedStepState.length; i++) {
                if(i !== 0) {
                    const lastValue = mixedStepState[i - 1][2][1];
                    if(lastValue > mixedStepState[i][0][1]) {
                        // >
                        itemList.push(<div
                            key={`symbol(>)-${i}`} 
                            className="Pigment-symbol-container"
                            style={{
                                marginTop: "-2px",
                                width: `${rectSize + symbolGap}px`,
                                height: `${rectSize}px`,
                            }}
                        >
                            <span className="STitle-text-contrast" 
                                style={{
                                    marginLeft: "0px", 
                                    fontSize: "24px",
                                    fontWeight: "600"
                                }}>
                                    {">"}
                            </span>
                        </div>)

                        // pigment-01
                        itemList.push(<div
                            key={`pigment-01-${i}`} 
                            className="Pigment-item-container"
                            style={{
                                width: `${rectSize}px`,
                                height: `${rectSize}px`,
                                borderRadius: `${i === 0 ? 4 : rectSize / 2}px`,
                                background: `${mixedStepState[i][0][0]}`
                            }}
                        >
                            <span className="Pigment-quantity-text">{Math.round(mixedStepState[i][0][1])}</span>
                        </div>)
                    } else if (lastValue < mixedStepState[i][0][1]) {
                        // <
                        itemList.push(<div
                            key={`symbol(<)-${i}`} 
                            className="Pigment-symbol-container"
                            style={{
                                marginTop: "-2px",
                                width: `${rectSize + symbolGap}px`,
                                height: `${rectSize}px`,
                            }}
                        >
                            <span className="STitle-text-contrast" 
                                style={{
                                    marginLeft: "0px", 
                                    fontSize: "24px",
                                    fontWeight: "600"
                                }}>
                                    {"<"}
                            </span>
                        </div>)

                        // pigment-01
                        itemList.push(<div
                            key={`pigment-01-${i}`} 
                            className="Pigment-item-container"
                            style={{
                                width: `${rectSize}px`,
                                height: `${rectSize}px`,
                                borderRadius: `${i === 0 ? 4 : rectSize / 2}px`,
                                background: `${mixedStepState[i][0][0]}`
                            }}
                        >
                            <span className="Pigment-quantity-text">{Math.round(mixedStepState[i][0][1])}</span>
                        </div>)
                    } else {

                    }
                } else {
                    // pigment-01
                    itemList.push(<div
                        key={`pigment-01-${i}`} 
                        className="Pigment-item-container"
                        style={{
                            width: `${rectSize}px`,
                            height: `${rectSize}px`,
                            borderRadius: `${i === 0 ? 4 : rectSize / 2}px`,
                            background: `${mixedStepState[i][0][0]}`
                        }}
                    >
                        <span className="Pigment-quantity-text">{Math.round(mixedStepState[i][0][1])}</span>
                    </div>)
                }

                // +
                itemList.push(<div
                    key={`symbol(+)-${i}`} 
                    className="Pigment-symbol-container"
                    style={{
                        marginTop: "-4px",
                        width: `${rectSize + symbolGap}px`,
                        height: `${rectSize}px`,
                    }}
                >
                    <span className="STitle-text-contrast" 
                        style={{
                            marginLeft: "0px", 
                            fontSize: "24px",
                            fontWeight: "600"
                        }}>
                            {"+"}
                    </span>
                </div>)

                // pigment-02
                itemList.push(<div
                    key={`pigment-02-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        background: `${mixedStepState[i][1][0]}`
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(mixedStepState[i][1][1])}</span>
                </div>)
                
                // =
                itemList.push(<div
                    key={`symbol(=)-${i}`} 
                    className="Pigment-symbol-container"
                    style={{
                        marginTop: "-4px",
                        width: `${rectSize + symbolGap}px`,
                        height: `${rectSize}px`,
                    }}
                >
                    <span className="STitle-text-contrast" 
                        style={{
                            marginLeft: "0px", 
                            fontSize: "24px",
                            fontWeight: "600"
                        }}>
                            {"="}
                    </span>
                </div>)

                // pigment-mixed
                itemList.push(<div
                    key={`pigment-mixed-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        borderRadius: `${rectSize / 2}px`,
                        background: `${mixedStepState[i][2][0]}`,
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(mixedStepState[i][2][1])}</span>
                </div>)
                
            }

            return itemList
        }
    }, [mixedStepState])

    return <div 
        className="SDefault-container"
        style={{
            display: "flex",
            alignItems: "center"
        }}
    >
        <span className="STitle-text-contrast" style={{fontSize: "16px"}}>Mixing Method:</span>
        <div className="Pigment-mixture-method">
            {pigmentItems}
        </div>
        <div className="SConfirm-button-container">
            <div 
                className="Icon-button"
                style={{
                    background: `url(${ConfirmIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    cursor: 'pointer',
                }}
                onClick={() => {
                    //确认配色方案 传递给父组件
                    // setPigmentConfirmed(current => !current);
                    setPigmentConfirmed(true);
                }}
            />
        </div>
    </div>
}