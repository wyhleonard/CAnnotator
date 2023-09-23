import { useMemo } from "react";
import "../../sharedCss.css";
import "./MixingMethod.css";
import ConfirmIcon from "../../../Icons/confirm.svg";
// demo

// const pigments = [[6, 0.01], [7, 0.01], [3, 0.03]];
// const mixedPigments = [['#87c6d1', 0.02], ['#dbd6a0', 0.05]];
const basisQuantity = 0.01;

const rectSize = 22;
const symbolGap = 4;
const iconSize = 15;

export const MixingMethod = ({
    pigments,
    mixedPigments,
    pigmentChanged,
    setPigmentConfirmed
}) => {

    const pigmentItems = useMemo(() => {
        console.log("pigments:", pigments);
        console.log("mixedPigments:", mixedPigments);
        
        const itemList = [];
        // console.log("pigments:", pigments);
        for(let i = 0; i < pigments.length; i++) {
            if(i === 0) {
                itemList.push(<div
                    key={`pigment-item-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        // background: `${originPigment[pigments[i][0]][0]}`
                        background: `${pigments[i][0]}`
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
                        // background: `${originPigment[pigments[i][0]][0]}`
                        background: `${pigments[i][0]}`
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
    }, [pigmentChanged]); // 后面需要根据pigments和mixedPigment数组更新的

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
                onClick={() => {  //确认配色方案 传递给父组件
                    setPigmentConfirmed(current => !current); 
                }}
            />
        </div>
    </div>
}