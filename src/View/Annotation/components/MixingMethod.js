import { useMemo } from "react";
import "../../sharedCss.css";
import "./MixingMethod.css";
import ConfirmIcon from "../../../Icons/confirm.svg";

const originPigment = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]]

// demo

// const pigments = [[6, 0.01], [7, 0.01], [3, 0.03]];
// const mixedPigment = [['#87c6d1', 0.02], ['#dbd6a0', 0.05]];
const basisQuantity = 0.01;

const rectSize = 22;
const symbolGap = 4;
const iconSize = 15;

export const MixingMethod = ({
    pigments,
    mixedPigment
}) => {

    const pigmentItems = useMemo(() => {
        const itemList = [];
        for(let i = 0; i < pigments.length; i++) {
            if(i === 0) {
                itemList.push(<div
                    key={`pigment-item-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        background: `${originPigment[pigments[i][0]][0]}`
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(pigments[i][1] / basisQuantity)}</span>
                </div>)
            } else {
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
                
                // pigment
                itemList.push(<div
                    key={`pigment-item-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        background: `${originPigment[pigments[i][0]][0]}`
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(pigments[i][1] / basisQuantity)}</span>
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

                // mixed pigment
                itemList.push(<div
                    key={`pigment-mixed-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        borderRadius: `${rectSize / 2}px`,
                        background: `${mixedPigments[i - 1][0]}`,
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(mixedPigments[i - 1][1] / basisQuantity)}</span>
                </div>)
            }
        }

        return itemList;
    }, []); // 后面需要根据pigments和mixedPigment数组更新的

    return <div 
        className="SDefault-container"
        style={{
            display: "flex",
            alignItems: "center"
        }}
    >
        <span className="STitle-text-contrast" style={{fontSize: "16px"}}>Mixture Method:</span>
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
            />
        </div>
    </div>
}