import "../sharedCss.css"
import "./index.css"
import { highlightColor, iconLevel1, imageInOnePage } from "../sharedConstants";
import { MetaInformation } from "./components/MetaInformation";
import { ContentDescription } from "./components/ContentDescription";
import { PaintingBoard } from "./components/PaintingBoard";
import { SegmentationList } from "./components/SegmentationList";
import { AnnotationList } from "./components/AnnotationList";
import { SegmentTools } from "./components/SegmentTools.js";
import Konva from "konva";
import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import * as _ from "underscore";
import {
    modelInputProps,
} from "../helpers/Interface";
import AppContext from "../hooks/createContext";
// @ts-ignore
import * as d3 from "d3";
import jDBSCAN from "../helpers/jDBScan";
import { countColorinSticker } from "../utils";

export const SegmentationView = ({
    scale,
    hasClicked,
    setHasClicked,
    setColors,
    image,
    colors,
    handleImageResegment
}: any) => {
    // component states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const {
        click: [click, setClick],
        clicks: [clicks, setClicks],
        clicksHistory: [clicksHistory, setClicksHistory],
        svg: [svg, setSVG],
        stickers: [stickers, setStickers],
        isErased: [, setIsErased],
        maskImg: [maskImg, setMaskImg],
        userNegClickBool: [userNegClickBool, setUserNegClickBool],
        isLoading: [isLoading, setIsLoading],
        hasNegClicked: [, setHasNegClicked],
        stickerTabBool: [stickerTabBool, setStickerTabBool],
        svgs: [svgs, setSVGs],
        isHovering: [isHovering, setIsHovering],
        editingMode: [editingMode],
        predMask: [predMask, setPredMask],
        predMasks: [predMasks, setPredMasks],
        predMasksHistory: [predMasksHistory, setPredMasksHistory],
        segUrl: [segUrl, setSegUrl],  // 这里为什么要全局
        imageContext: [imageContext],
        segMaskArray: [segMaskArray],
        segMaskIndex: [segMaskIndex, setSegMaskIndex],
        stickerForTrack: [stickerForTrack, setStickerForTrack],
        currentIndex: [currentIndex, setCurrentIndex],
        imagePageIndex: [imagePageIndex],
        filteredImages: [filteredImages, setFilteredImages],
        isTracking: [isTracking],
        chosenColors: [chosenColors, setChosenColors],
        displayedColors: [displayedColors, setDisplayedColors],
        resegmentedSticker: [resegmentedSticker]
    } = useContext(AppContext)!;

    const konvaRef = useRef<Konva.Stage>(null);
    const [currentScale, setCurrentScale] = useState(1);
    
    if (image && segUrl === "") {
        setSegUrl(image.src);
    }

    // move the first clustering logic from tracking. => failed
    // useEffect(() => {
    //     if(imagePageIndex !== -1) {
    //         const currentImages = filteredImages[imagePageIndex];
    //         for(let i = 0; i < currentImages.length; i++) {
    //             const trackedSegs = currentImages[i]["trackedSegs"];
    //             if(trackedSegs && JSON.stringify(trackedSegs) !== "{}") {
    //                 const keys = Object.keys(trackedSegs);
    //                 filteredImages[imagePageIndex][i]["countedColors"] = {};
    //                 filteredImages[imagePageIndex][i]["hasColors"] = {};

    //                 for(let k = 0; k < keys.length; k++) {
    //                     const trackedSeg = trackedSegs[keys[k]];
    //                     filteredImages[imagePageIndex][i]["hasColors"][keys[k]] = [];
            
    //                     if(trackedSeg !== undefined && trackedSeg !== "") {
    //                         // 为每个seg统计颜色
    //                         const img = new window.Image();
    //                         img.src = `data:image/png;base64,${trackedSeg}`;
    //                         img.onload = () => {
    //                             const colorFrequency = countColorinSticker(img.width, img.height, img);
    //                             filteredImages[imagePageIndex][i]["countedColors"][keys[k]] = colorFrequency;
    //                         }
    //                     } else {
    //                         filteredImages[imagePageIndex][i]["countedColors"][keys[k]] = {};
    //                     }
    //                 }
    //             }
    //         }
    //         // setFilteredImages([...filteredImages]); // BUGs: 会一直更新 => 搬迁到第二次聚类的逻辑中也会问题（无法访问到更新后的数据）
    //     }
    // }, [filteredImages, imagePageIndex, setFilteredImages])


    // 更新color bins => 在最后一层还是不要再做归一化了，直接体现数量的大小
    useEffect(() => {
        if((editingMode !== "natural-image") && imagePageIndex !== -1 && isTracking === true) {
            console.log("test-print-update-color")

            const currentImages = filteredImages[imagePageIndex];
            const newColors: any = [];
            const stickerNum = stickers.length;
            for(let i = 0; i < stickerNum; i++) {
                newColors[i] = {};
                const labs: any = [], keyMap: any = [];

                for(let k = 0; k < currentImages.length; k++) {
                    if(currentImages[k]["countedColors"] !== undefined) { // 测试的时候没有计算全部的结果
                        // console.log("test-print-countedColors", currentImages[k]);
                        const countedColors = currentImages[k]["countedColors"][i + 1];
                        // 先得把 filteredImages[imagePageIndex][k]["hasColors"] 置为空 => 但不影响结果

                        if(countedColors && JSON.stringify(countedColors) !== "{}") {
                            Object.keys(countedColors).forEach((c) => {
                                labs.push(d3.lab(c));
                                keyMap.push([k, i, c]); // 将labs和原先的位置关联起来
                            });
                        }
                    }
                }

                if(labs.length > 0) { // 第二次聚类
                    // @ts-ignore
                    const dbscanner = jDBSCAN().eps(60).minPts(0).data(labs);  // 允许minPts=0，因为不一定有簇  
                    dbscanner();
                    const cluster_centers = dbscanner.getClusters(); // 并不是所有的点都会被归为某一个类

                    // console.log("test-print-cluster_centers", cluster_centers)
                    cluster_centers.forEach(({ l, a, b, dimension, parts }: any) => {
                        const newColor = d3.rgb(d3.lab(l, a, b)).toString();
                        // @ts-ignore
                        newColors[i][newColor] = 0;
                        parts.forEach((p: any) => {
                            const [k, i, c] = keyMap[p];
                            const colorBins = filteredImages[imagePageIndex][k]["hasColors"][i + 1];
                            if(colorBins.indexOf(newColor) === -1) filteredImages[imagePageIndex][k]["hasColors"][i + 1].push(newColor)
                            newColors[i][newColor] += filteredImages[imagePageIndex][k]["countedColors"][i + 1][c];
                        });

                        // newColors[i][newColor] /= dimension;
                        newColors[i][newColor] = Math.sqrt(newColors[i][newColor]);
                    });
                }
            }

            // console.log("test-print-newColors", newColors)
            setColors(newColors);
        }
    }, [imagePageIndex, isTracking, filteredImages, stickers, setColors, editingMode])                

    const superDefer = (cb: Function) => {
        setTimeout(
            () =>
                window.requestAnimationFrame(() => {
                    setTimeout(() => {
                        cb();
                    }, 0);
                }),
            0
        );
    };

    // 保存当前的segmentation
    const handleCreateSticker = () => {
        if (konvaRef.current === null) return;
        setIsLoading(true);
        superDefer(() =>
            superDefer(() => superDefer(() => superDefer(doHandleCreateSticker)))
        );
    };

    const doHandleCreateSticker = () => {
        if (konvaRef.current === null) return;

        const cropImageFromCanvasTS = (ref: any) => { 
            let newCanvas = null;
            try {
                const canvas = ref!.toCanvas().getContext("2d", { willReadFrequently: true });
                // console.log("ref:", ref)
                // console.log(canvas); // height 不对 => 非常神奇的bug: 关掉浏览器试试 => 建议：不缩放自然图片

                let w = ref.width();
                let h = ref.height();
                const pix: {x: number[], y: number[]} = { x: [], y: [] };
                const imageData = canvas.getImageData(0, 0, w, h);
                let x;
                let y;
                let index;

                // console.log("test-print-cutParams", w, h) // (2234, 1914) 古画原图的大小 => 乘积为4275876
                // console.log("test-print-imageData", imageData.data.length) // 17103504 => 是乘积的4倍

                const maskIndex = segMaskIndex + 1;

                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        index = (y * w + x) * 4;
                        if (imageData.data[index + 3] > 0) {
                            // console.log("test-print-imageData.data", imageData.data[index + 3]) // 127 or 255 or 32 or 64 
                            pix.x.push(x);
                            pix.y.push(y);

                            segMaskArray[y][x] = maskIndex;
                        }
                    }
                }
                pix.x.sort(function (a: number, b: number) {
                    return a - b;
                });
                pix.y.sort(function (a: number, b: number) {
                    return a - b;
                });
                const n = pix.x.length - 1;
                // console.log(pix);

                // 裁剪了最小外包矩形
                w = 1 + pix.x[n] - pix.x[0];
                h = 1 + pix.y[n] - pix.y[0];
                // console.log("test-print-bugfix", pix.x[0], pix.y[0], w, h) // undefined
                const cut = canvas.getImageData(pix.x[0], pix.y[0], w, h);

                // console.log("test-print-cutParams", w, h) // 77 61

                canvas.width = w;
                canvas.height = h;
                canvas.putImageData(cut, 0, 0);

                newCanvas = document.createElement("canvas");
                newCanvas.width = w;
                newCanvas.height = h;
                newCanvas.getContext("2d", { willReadFrequently: true })!.putImageData(cut, 0, 0);

                setSegMaskIndex(maskIndex);

                return {
                    newSticker: newCanvas,
                    rectPosition: [pix.x[0], pix.x[n], pix.y[0], pix.y[n]]
                };
            } catch (error) {
                console.log(error);
                return {
                    newSticker: newCanvas,
                    rectPosition: []
                };
            }
        };

        const konvaClone = konvaRef.current.clone();
        // console.log("test-print-konvaClone", typeof(konvaClone), konvaClone); // object

        // 按交互比例缩放
        konvaClone.width(konvaClone.width() / currentScale);
        konvaClone.height(konvaClone.height() / currentScale);

        const svgLayer = konvaClone.findOne(".svgMask");
        // console.log("test-print-svgLayer", svgLayer); // 有三层layers：svgMask, animateAllSvg, annotations

        // 这个是什么可能得看怎么画的了
        const pathNodes = svgLayer.find("Path");
        const imageNode = svgLayer.find("Image")[0];
        const newStickers: HTMLCanvasElement[] = [];
        const newStickersPosition: number[][] = [];
        // console.log("test-print-pathNodes", pathNodes)
        // console.log("test-print-imageNode", imageNode)
        
        const srcUrl = image?.src; 
        // console.log("test-print-image", image) // <img>标签

        const addedImageContext = (srcUrl && imageContext[srcUrl]) || {}; // 双竖杠前面为null、undefined、false、‘’、0时取后面的值
        addedImageContext["stickers"] = addedImageContext["stickers"] ?? []; // 双问号前面为null、undefined时取后面的值
        
        // 隐藏图层
        konvaClone.findOne(".annotations").hide();
        konvaClone.findOne(".animateAllSvg").hide();

        // globalCompositeOperation指某个全局复合操作；
        // destination-atop: 在源图像顶部显示目标图像
        svgLayer.globalCompositeOperation("destination-atop");

        imageNode.opacity(-1);
        imageNode.remove();

        for (const pathNode of pathNodes) { 
            pathNode.opacity(-1).remove();
        }

        for (const pathNode of pathNodes) {
            svgLayer.add(imageNode);
            svgLayer.add(pathNode);
            const {newSticker, rectPosition} = cropImageFromCanvasTS(konvaClone); // 有时候会剪不出来
            if (newSticker) {
                newStickers.push(newSticker);
                newStickersPosition.push(rectPosition);
            }
            imageNode.remove();
            pathNode.remove();
        }

        // console.log("test-print-isEditing", isEditing) // 0

        if (editingMode === "natural-image" && currentIndex >= 0) {
            if(stickerForTrack.length > 0 ) {
                // 再次往里加入的话会丢失索引 => 给一些UI上的tag，要求用户按顺序重新添加吧
                stickerForTrack[currentIndex] = [...stickerForTrack[currentIndex], ...newStickers];
                setStickerForTrack(stickerForTrack); // canvas对象不能用JSON.parse(JSON.stringify(...))深度拷贝

                if(currentIndex + 1 < stickerForTrack.length) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    setCurrentIndex(-1);
                    // 将segMaskArray存起来
                    addedImageContext["maskArray"] = JSON.parse(JSON.stringify(segMaskArray));
                }
            }
        } else if (editingMode === "painting") {
            // 更新segmented stickers
            setStickers([...(stickers || []), ...(newStickers || [])]);

            // 初始化自然图片的stickerForTrack
            const initialStickerArray = Array.from({length: newStickers.length}, () => []);
            setStickerForTrack([...stickerForTrack, ...initialStickerArray]);

            // 为每个sticker初始化color-filter的交互状态记录
            const initialSelectedColors = Array.from({length: newStickers.length}, () => []);
            setChosenColors([...chosenColors, ...initialSelectedColors])

            const initialDisplayedColors = Array.from({length: newStickers.length}, () => []);
            setDisplayedColors([...displayedColors, ...initialDisplayedColors])

            // save stickers
            handleSaveInteraction(addedImageContext["stickers"], -1);
        } else if (editingMode === "sticker") {
            // save stickers to filterImages
            const imageIndex = resegmentedSticker[0] % imageInOnePage;
            // console.log("test-print-cropStickers", newStickers, filteredImages[imagePageIndex][imageIndex]);
            const sticker = newStickers[0];
            const stickerCanvas = sticker.getContext("2d", { willReadFrequently: true });
            const highlightCoordinate = newStickersPosition[0];
            const w = highlightCoordinate[1] - highlightCoordinate[0] + 1;
            const h = highlightCoordinate[3] - highlightCoordinate[2] + 1;

            // update countedColors -- copy from reference view
            const colorFrequency = countColorinSticker(w, h, newStickers[0]);

            // console.log("test-print-colorFrequency", colorFrequency, filteredImages[imagePageIndex][imageIndex]["countedColors"][(resegmentedSticker[1] + 1).toString()])
            filteredImages[imagePageIndex][imageIndex]["countedColors"][(resegmentedSticker[1] + 1).toString()] = colorFrequency;

            // update trackedSegs
            const base64Image = (newStickers[0].toDataURL("image/png")).split(",");
            filteredImages[imagePageIndex][imageIndex]["trackedSegs"][(resegmentedSticker[1] + 1).toString()] = base64Image[base64Image.length - 1];

            // update highlightSegs
            const imageData = stickerCanvas?.getImageData(0, 0, w, h);
            if(imageData && stickerCanvas) {
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const index = (y * w + x) * 4;
                        if (imageData.data[index + 3] > 0) {
                            imageData.data[index] = highlightColor[0];
                            imageData.data[index + 1] = highlightColor[1];
                            imageData.data[index + 2] = highlightColor[2];
                            imageData.data[index + 3] = highlightColor[3];
                        }
                    }
                }
                stickerCanvas.putImageData(imageData, 0, 0);
                const base64Image = (sticker.toDataURL("image/png")).split(",");

                filteredImages[imagePageIndex][imageIndex]["highlightSegs"][(resegmentedSticker[1] + 1).toString()] = {
                    coordinates: highlightCoordinate,
                    highlight: base64Image[base64Image.length - 1]
                }
            }

            setFilteredImages(JSON.parse(JSON.stringify(filteredImages)));
            setCurrentIndex(-1);
            
            // 直接设置分割完成后自动切回古画
            handleImageResegment(resegmentedSticker[0], "")
        }

        handleResetInteraction();
        setIsLoading(false);
        if(editingMode !== "sticker") imageContext[srcUrl ?? "undefined"] = addedImageContext;
    };

    // console.log("test-print-setStickerForTrack", stickerForTrack);

    const handleMouseDown = (e: any) => {
        // console.log("test-print-stickerTabBool", stickerTabBool)
        // console.log("test-print-clicksHistory", clicksHistory)
        if (stickerTabBool) return;
        if (clicksHistory) setClicksHistory(null);
        if (predMasksHistory) setPredMasksHistory(null);
    };

    const handleMouseUp = (e: any) => {
        if (stickerTabBool) return;
        setIsLoading(true);
        setHasClicked(true);
        const {x, y} = e.target.getStage().getPointerPosition();
        const newClick = getClick(e, x, y) || null;
        if (newClick?.clickType === 0) {
            setHasNegClicked(true);
        }
        setClick(newClick);
    };

    const getClick = (
        e: any,
        x: number,
        y: number
    ): modelInputProps | undefined => {
        let clickType;
        if (e.evt.button === 0 || !e.evt.button) {
            clickType = 1;
        } else if (e.evt.button === 2) {
            clickType = 0;
        }
        if (clickType === undefined) return;
        if (userNegClickBool) clickType = 0;
        const ex = x, ey = y;
        x /= currentScale;
        y /= currentScale;
        return { x, y, width: null, height: null, clickType, ex, ey };
    };

    const handleResetInteraction = () => {
        setSVG(null);
        setSVGs(null);
        setClick(null);
        setClicks(null);
        setClicksHistory(null);
        setMaskImg(null);
        setUserNegClickBool(false);
        setIsHovering(null);
        setPredMask(null);
        setPredMasks(null);
        setPredMasksHistory(null);
        setIsLoading(false);
        setHasClicked(false);
        setStickerTabBool(true); // work
    };

    const handleUndoInteraction = () => {
        if (predMasks?.length && clicks?.length) {
            const newPredMasks = [...predMasks];
            const oldPredMask = newPredMasks.pop();
            const newPredMasksHistory = [...(predMasksHistory || [])];
            setPredMasks(newPredMasks);
            if (oldPredMask) {
                newPredMasksHistory.push(oldPredMask);
            }
            setPredMasksHistory(newPredMasksHistory);
            const newClicks = [...clicks];
            const oldClick = newClicks.pop();
            const newClicksHistory = [...(clicksHistory || [])];
            if (oldClick) {
                newClicksHistory.push(oldClick);
            }
            setClicksHistory(newClicksHistory);
            if (clicks.length === 1) {
                setPredMask(null);
                setHasClicked(false);
                setClicks(null);
                setSVG(null);
                setIsErased(false);
                setMaskImg(null);
            } else {
                setIsLoading(true);
                setPredMask(newPredMasks[newPredMasks.length - 1]);
                setClicks(newClicks);
            }
        }
    };

    const handleRedoInteraction = () => {
        if (predMasksHistory?.length && clicksHistory?.length) {
            setIsLoading(true);
            setHasClicked(true);
            const newPredMasks = [...(predMasks || [])];
            const newPredMasksHistory = [...(predMasksHistory || [])];
            const newPredMask = newPredMasksHistory.pop();
            if (newPredMask) {
                newPredMasks.push(newPredMask);
            }
            setPredMasksHistory(newPredMasksHistory);
            setPredMasks(newPredMasks);
            setPredMask(newPredMasks[newPredMasks.length - 1]);
            const newClicks = [...(clicks || [])];
            const newClicksHistory = [...(clicksHistory || [])];
            const newClick = newClicksHistory.pop();
            if (newClick) {
                newClicks.push(newClick);
            }
            setClicksHistory(newClicksHistory);
            setClicks(newClicks);
        }
    };

    const handleSaveInteraction = (base: any, index: number) => {
        index = index !== -1 ? index : stickers.length;
        base[index] = {
            ...(base[index] || {}),
            "svg": svg,
            "svgs": svgs,
            "click": click,
            "clicks": clicks,
            "clicksHistory": clicksHistory,
            "maskImg": maskImg,
            "userNegClickBool": userNegClickBool,
            "isHovering": isHovering,
            "predMask": predMask,
            "predMasks": predMasks,
            "predMasksHistory": predMasksHistory,
            "isLoading": isLoading,
        };
    };

    return <div className="SView-container">
        <div className="View-content">
            <div className={isDrawerOpen ? "Drawer" : "Drawer-hidden"}>
                <div className="Drawer-content">
                    <div className="Meta-container">
                        <div className="STitle-container">
                            <span className="STitle-text">Meta Information</span>
                        </div>
                        <div className="SContent-container">
                            <MetaInformation />
                        </div>
                    </div>
                    <div className="Description-container">
                        <div className="STitle-container">
                            <span className="STitle-text">Content Commentaries</span>
                        </div>
                        <div className="SContent-container">
                            <ContentDescription />
                        </div>
                    </div>
                </div>
                <div className="Drawer-openIcon">
                    <div className="Icon-button"
                        style={{
                            background: `url(../assets/openclose.svg) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconLevel1}px`,
                            height: `${iconLevel1}px`,
                            transform: `rotate(${isDrawerOpen ? -90 : 90}deg)`,
                            cursor: 'pointer',
                        }}
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    />
                </div>
            </div>
            <div className="Painting-board-contaienr">
                <PaintingBoard
                    konvaRef={konvaRef}
                    scale={scale}
                    handleMouseUp={handleMouseUp}
                    handleMouseDown={handleMouseDown}
                    hasClicked={hasClicked}
                    currentScale={currentScale}
                    setCurrentScale={setCurrentScale}
                />
                <SegmentTools
                    handleResetInteraction={handleResetInteraction}
                    handleUndoInteraction={handleUndoInteraction}
                    handleRedoInteraction={handleRedoInteraction}
                    handleCreateSticker={handleCreateSticker}
                    userNegClickBool={userNegClickBool}
                    setUserNegClickBool={setUserNegClickBool}
                    hasClicked={hasClicked}
                />
            </div>
            <div className="SandA-container">
                <div className="Segmentations-container">
                    <div className="STitle-container">
                        <span className="STitle-text">Segments</span>
                    </div>
                    <div className="SContent-container">
                        <SegmentationList colors={colors} />
                    </div>
                </div>
                <div className="Annotations-container">
                    <div className="STitle-container">
                        <span className="STitle-text">Annotations</span>
                    </div>
                    <div className="SContent-container">
                        <AnnotationList />
                    </div>
                </div>
            </div>
        </div>
    </div>
}
