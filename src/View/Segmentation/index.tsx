import "../sharedCss.css"
import "./index.css"
import { iconLevel1 } from "../sharedConstants";
import { MetaInformation } from "./components/MetaInformation";
import { ContentDescription } from "./components/ContentDescription";
import { PaintingBoard } from "./components/PaintingBoard";
import { SegmentationList } from "./components/SegmentationList";
import { AnnotationList } from "./components/AnnotationList";
import { SegmentTools } from "./components/SegmentTools.js";
import Konva from "konva";
import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import ReactDOM from 'react-dom';
import * as _ from "underscore";
import {
    modelInputProps,
} from "../helpers/Interface";
import AppContext from "../hooks/createContext";
import { Image, Layer, Path, Stage } from "react-konva";
import { nclicks } from "../helpers/hardcode";
// @ts-ignore
import * as d3 from "d3";
import jDBSCAN from "../helpers/jDBScan";

export const SegmentationView = ({
    scale,
    setModelScale,
    handleResetState,
    hasClicked,
    setHasClicked,
    setTensor,
    setColors,
    image,
    clicks2model,
    colors
}: any) => {
    // component states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const {
        click: [click, setClick],
        clicks: [clicks, setClicks],
        clicksHistory: [clicksHistory, setClicksHistory],
        svg: [svg, setSVG],
        stickers: [stickers, setStickers],
        isErased: [isErased, setIsErased],
        maskImg: [maskImg, setMaskImg],
        userNegClickBool: [userNegClickBool, setUserNegClickBool],
        activeSticker: [activeSticker, setActiveSticker],
        isLoading: [isLoading, setIsLoading],
        hasNegClicked: [hasNegClicked, setHasNegClicked],
        stickerTabBool: [stickerTabBool, setStickerTabBool],
        svgs: [svgs, setSVGs],
        isHovering: [isHovering, setIsHovering],
        isEditing: [isEditing, setIsEditing],
        showLoadingModal: [showLoadingModal, setShowLoadingModal],
        predMask: [predMask, setPredMask],
        predMasks: [predMasks, setPredMasks],
        predMasksHistory: [predMasksHistory, setPredMasksHistory],
        filteredImages: [filteredImages, setFilteredImages],
        image: [, setImage],
        prevImage: [prevImage, setPrevImage],
        allsvg: [, setAllsvg],
        segUrl: [segUrl, setSegUrl],
        blobMap: [blobMap, setBlobMap],
        imageContext: [imageContext, setImageContext],
    } = useContext(AppContext)!;
    const [canvasScale, setCanvasScale] = useState<number>(1);
    const konvaRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [colorHandle, setColorHandle] = useState(false);
    const [callCount, setCallCount] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);
    
    if (image && segUrl === "") {
        setSegUrl(image.src);
    }

    useEffect(() => {
        // @ts-ignore
        const newColors = [];
        const len = stickers.length;
        for (let i = 0; i < len; ++i) {
            newColors[i] = {};
            // @ts-ignore
            const labs = [], colorMap: string[] = [], keyMap: number[] = [];
            Object.keys(imageContext).forEach((key: any) => {
                if (key === segUrl) {
                    return;
                }
                const item = imageContext[key]["stickers"][i];
                item.hasColors = new Set();
                if (!item.colors) {
                    return;
                }
                Object.keys(item.colors).forEach(c => {
                    labs.push(d3.lab(c));
                    keyMap.push(key);
                    colorMap.push(c);
                });
            });
            if (labs.length !== 0) {
                // @ts-ignore
                const dbscanner = jDBSCAN().eps(15).minPts(1).data(labs);
                const point_assignment_result = dbscanner();
                const cluster_centers = dbscanner.getClusters();
                cluster_centers.forEach(({ l, a, b, dimension, parts }: any) => {
                    const newColor = d3.rgb(d3.lab(l, a, b)).toString();
                    // @ts-ignore
                    newColors[i][newColor] = 0;
                    parts.forEach((p: any) => {
                        const k = keyMap[p], c = colorMap[p], item = imageContext[k]["stickers"][i];
                        item.hasColors.add(newColor);
                        // @ts-ignore
                        newColors[i][newColor] += item.colors[c];
                    });
                });
                point_assignment_result.forEach((val: any, p: any) => {
                    if (val === 0) {
                        const k = keyMap[p], c = colorMap[p], item = imageContext[k]["stickers"][i];
                        item.hasColors.add(c);
                        // @ts-ignore
                        !newColors[i][c] && (newColors[i][c] = 0);
                        // @ts-ignore
                        newColors[i][c] += item.colors[c];
                    }
                });
            }
        }
        console.log(newColors);
        setColors(newColors);
    }, [stickers, colorHandle]);

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

    const handleCreateSticker = () => {
        if (konvaRef.current === null) return;
        setIsLoading(true);
        setShowLoadingModal(true);
        superDefer(() =>
            superDefer(() => superDefer(() => superDefer(doHandleCreateSticker)))
        );
    };

    const doHandleCreateSticker = () => {
        if (konvaRef.current === null) return;

        const cropImageFromCanvasTS = (ref: any) => { 
            let newCanvas = null;
            try {
                const canvas = ref!.toCanvas().getContext("2d");
                console.log(canvas);

                let w = ref.width();
                let h = ref.height();
                const pix: { x: number[]; y: number[] } = { x: [], y: [] };
                const imageData = canvas.getImageData(0, 0, w, h);
                let x;
                let y;
                let index;

                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        index = (y * w + x) * 4;
                        if (imageData.data[index + 3] > 0) {
                            pix.x.push(x);
                            pix.y.push(y);
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
                console.log(pix);

                w = 1 + pix.x[n] - pix.x[0];
                h = 1 + pix.y[n] - pix.y[0];
                const cut = canvas.getImageData(pix.x[0], pix.y[0], w, h);

                canvas.width = w;
                canvas.height = h;
                canvas.putImageData(cut, 0, 0);
                newCanvas = document.createElement("canvas");
                newCanvas.width = w;
                newCanvas.height = h;
                newCanvas.getContext("2d")!.putImageData(cut, 0, 0);
            } catch (error) {
                console.log(error);
                return;
            }
            return newCanvas;
        };

        const konvaClone = konvaRef.current.clone();
        konvaClone.width(konvaClone.width() / currentScale);
        konvaClone.height(konvaClone.height() / currentScale);
        const svgLayer = konvaClone.findOne(".svgMask");
        const pathNodes = svgLayer.find("Path");
        const imageNode = svgLayer.find("Image")[0];
        const newStickers: HTMLCanvasElement[] = [];
        const srcUrl = image?.src;
        const addedImageContext = (srcUrl && imageContext[srcUrl]) || {};
        addedImageContext["stickers"] = addedImageContext["stickers"] ?? [];
        konvaClone.findOne(".annotations").hide();
        konvaClone.findOne(".animateAllSvg").hide();
        svgLayer.globalCompositeOperation("destination-atop");
        imageNode.opacity(-1);
        imageNode.remove();
        for (const pathNode of pathNodes) {
            pathNode.opacity(-1).remove();
        }
        for (const pathNode of pathNodes) {
            svgLayer.add(imageNode);
            svgLayer.add(pathNode);
            const newSticker = cropImageFromCanvasTS(konvaClone);
            if (newSticker) newStickers.push(newSticker);
            imageNode.remove();
            pathNode.remove();
        }
        // console.log(isEditing);
        if (isEditing === 1) {
            setIsEditing(0);
            stickers[activeSticker] = newStickers[0];
            setStickers([...(stickers || [])]);
            handleSaveInteraction(addedImageContext["stickers"], activeSticker);
        } else if (isEditing === 2) {
            setIsEditing(0);
            handleSaveInteraction(addedImageContext["stickers"], activeSticker);
            addedImageContext["stickers"][activeSticker]["sticker"] = newStickers[0];
            setColorHandle(false);
            newStickers[0] && getColorsCounts(addedImageContext["stickers"][activeSticker], newStickers[0].toDataURL(), 20);
            handleMaskEdit(segUrl, activeSticker);
        } else {
            setStickers([...(stickers || []), ...(newStickers || [])]);
            handleSaveInteraction(addedImageContext["stickers"], -1);
            setColorHandle(false);
            handleSegment(srcUrl ?? "undefined");
        }
        handleResetInteraction();
        setIsLoading(false);
        imageContext[srcUrl ?? "undefined"] = addedImageContext;
        console.log(imageContext);
    };

    const handleSegment = (srcUrl: string | null) => {
        // fetch('http://localhost:8000/coseg/init/points', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(clicks?.map(item => [item.ex, item.ey]) || [[0, 0]])
        // })
        //   .then(response => {
        //     console.log('列表数据传输成功！');
        //     Object.keys(imageContext).forEach((key: any) => {
        //       if (key === srcUrl) {
        //         return;
        //       }
        //       createFormData(key)
        //         .then(formData => {
        //           return fetch('http://localhost:8000/coseg/match/point', {
        //             method: 'POST',
        //             body: formData as BodyInit
        //           });
        //         })
        //         .then(response => response.json())
        //         .then(data => {
        //           const newClicks = data["points"].map((item: any, index: number) => {
        //             return {
        //               "x": item[0], "y": item[1], "width": null, "height": null,
        //               // @ts-ignore
        //               "clickType": clicks[index].clickType
        //             };
        //           })
        //           // console.log(key);
        //           const index = stickers.length;
        //           imageContext[key]["stickers"][index] = { ...(imageContext[key]["stickers"][index] || {}), "clicks": newClicks, "predMask": null };
        //           // console.log(imageContext[key]);
        //           newClicks.forEach((item: any, i: number) => {
        //             const curClicks = newClicks.slice(0, i + 1);
        //             console.log(imageContext[key]["stickers"][i]["predMask"], curClicks);
        //             if (i !== newClicks.length - 1) {
        //               clicks2model(
        //                 imageContext[key]["stickers"][i],
        //                 curClicks, imageContext[key]["tensor"]["tensor"],
        //                 imageContext[key]["image"]["modelScale"], imageContext[key]["stickers"][i]["predMask"]
        //               )
        //             } else {
        //               clicks2model(
        //                 imageContext[key]["stickers"][i],
        //                 newClicks, imageContext[key]["tensor"]["tensor"],
        //                 imageContext[key]["image"]["modelScale"], imageContext[key]["stickers"][i]["predMask"]
        //               ).then((svgStr: any) => {
        //                 // const imgdata = model2stickers(key ?? "undefined", svgStr);
        //                 model2stickers(key ?? "undefined", svgStr).then(imgdata => {
        //                   getColorsCounts(imageContext[key]["stickers"][index], imgdata, 4800);
        //                   setColorHandle(prev => !prev);
        //                 });
        //               }
        //               )
        //             }
        //           });

        //         })
        //         .catch(error => {
        //           console.error('Blob 数据传输失败：', error);
        //         });
        //     });
        //   })
        //   .catch(error => {
        //     console.error('列表数据传输失败：', error);
        //   });
        filteredImages.forEach((item: any, ini: number) => {
            const cclicks = nclicks[callCount % 8];
            const key = blobMap[item.contentUrl];
            const newClicks = cclicks[ini];
            const index = stickers.length;
            imageContext[key]["stickers"][index] = { ...(imageContext[key]["stickers"][index] || {}), "clicks": newClicks, "predMask": null };
            // console.log(imageContext[key]);
            // @ts-ignore
            // newClicks.forEach((item: any, i: number) => {
            //     // @ts-ignore
            //     const curClicks = newClicks.slice(0, i + 1);
            //     console.log(key, i, curClicks);
            //     // console.log(imageContext[key]["stickers"][i]["predMask"], curClicks);
            //     // @ts-ignore
            //     if (i !== newClicks.length - 1) {
            //         clicks2model(
            //             imageContext[key]["stickers"][index],
            //             curClicks, imageContext[key]["tensor"]["tensor"],
            //             imageContext[key]["image"]["modelScale"], imageContext[key]["stickers"][index]["predMask"]
            //         )
            //     } else {
            //         clicks2model(
            //             imageContext[key]["stickers"][index],
            //             newClicks, imageContext[key]["tensor"]["tensor"],
            //             imageContext[key]["image"]["modelScale"], imageContext[key]["stickers"][index]["predMask"]
            //         ).then((svgStr: any) => {
            //             // const imgdata = model2stickers(key ?? "undefined", svgStr);
            //             model2stickers(key ?? "undefined", svgStr).then(imgdata => {
            //                 getColorsCounts(imageContext[key]["stickers"][index], imgdata, 20);
            //             });
            //         }
            //         )
            //     }
            // });
            if (newClicks !== null) {
                clicks2model(
                    imageContext[key]["stickers"][index],
                    newClicks, imageContext[key]["tensor"]["tensor"],
                    imageContext[key]["image"]["modelScale"], imageContext[key]["stickers"][index]["predMask"]
                ).then((svgStr: any) => {
                    // const imgdata = model2stickers(key ?? "undefined", svgStr);
                    model2stickers(key ?? "undefined", svgStr).then(imgdata => {
                        getColorsCounts(imageContext[key]["stickers"][index], imgdata, 20);
                        setShowLoadingModal(false);
                    });
                }
                )
            } else {
                imageContext[key]["stickers"][index]["sticker"] = null;
            }
        });
        setCallCount(prev => prev + 1);
    };

    const createFormData = (blobUrl: string) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', blobUrl);
            xhr.responseType = 'blob';
            xhr.onload = function () {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    const file = new File([blob], 'filename'); // 创建一个文件对象，可以指定文件名  
                    const formData = new FormData();
                    formData.append('file', file);
                    resolve(formData);
                } else {
                    reject(new Error('无法获取 Blob 数据'));
                }
            };
            xhr.onerror = function () {
                reject(new Error('无法获取 Blob 数据'));
            };
            xhr.send();
        });
    }

    const MyKonva = (props: any) => {
        const { blobUrl, base, index, mykonvaRef, svgStr } = props;

        const MAX_CANVAS_AREA = 1677721;
        const w = base["image"]["modelScale"]!.width;
        const h = base["image"]["modelScale"]!.height;
        const area = w * h;
        const canvasScale =
            area > MAX_CANVAS_AREA ? Math.sqrt(MAX_CANVAS_AREA / (w * h)) : 1;
        const canvasDimensions = {
            width: Math.floor(w * canvasScale),
            height: Math.floor(h * canvasScale),
        };

        const imageClone = new window.Image();
        imageClone.src = blobUrl;
        imageClone.width = w;
        imageClone.height = h;

        return (<Stage
            className="konva"
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            ref={mykonvaRef}
        >
            <Layer name="svgMask">
                <Image
                    x={0}
                    y={0}
                    image={imageClone}
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    opacity={0}
                    preventDefault={false}
                />
                {
                    svgStr && (
                        <Path
                            data={svgStr.join(" ")}
                            fill="black"
                            scaleX={canvasScale / base["image"]["modelScale"].uploadScale}
                            scaleY={canvasScale / base["image"]["modelScale"].uploadScale}
                            lineCap="round"
                            lineJoin="round"
                            opacity={0}
                            preventDefault={false}
                        />
                    )
                }
            </Layer>
            <Layer name="animateAllSvg">
            </Layer>
            <Layer name="annotations">
            </Layer>
        </Stage>);
    }

    const mykonvaRef = useRef<Konva.Stage>(null);

    const model2stickers = async (srcUrl: string, svgStr: any) => {
        const w = imageContext[srcUrl]["image"]["modelScale"]!.width;
        const h = imageContext[srcUrl]["image"]["modelScale"]!.height;

        const image = new window.Image();
        image.src = srcUrl;
        image.width = w;
        image.height = h;

        // 等待图片加载完成  
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });
        const dynamicComponent = React.createElement(MyKonva, {
            blobUrl: srcUrl, base: imageContext[srcUrl], index: stickers.length, mykonvaRef, svgStr
        });
        const container = document.createElement("div");
        ReactDOM.render(dynamicComponent, container);

        if (mykonvaRef.current === null) return;

        const cropImageFromCanvasTS = (ref: any) => {
            let newCanvas = null;
            try {
                const canvas = ref!.toCanvas().getContext("2d");
                // console.log(canvas);

                let w = ref.width();
                let h = ref.height();
                const pix: { x: number[]; y: number[] } = { x: [], y: [] };
                const imageData = canvas.getImageData(0, 0, w, h);
                let x;
                let y;
                let index;

                for (y = 0; y < h; y++) {
                    for (x = 0; x < w; x++) {
                        index = (y * w + x) * 4;
                        if (imageData.data[index + 3] > 0) {
                            pix.x.push(x);
                            pix.y.push(y);
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

                w = 1 + pix.x[n] - pix.x[0];
                h = 1 + pix.y[n] - pix.y[0];
                const cut = canvas.getImageData(pix.x[0], pix.y[0], w, h);
                // console.log(cut);

                canvas.width = w;
                canvas.height = h;
                canvas.putImageData(cut, 0, 0);
                newCanvas = document.createElement("canvas");
                newCanvas.width = w;
                newCanvas.height = h;
                newCanvas.getContext("2d")!.putImageData(cut, 0, 0);
            } catch (error) {
                console.log(error);
                return;
            }
            return newCanvas;
        };

        const konvaClone = mykonvaRef.current.clone();
        const svgLayer = konvaClone.findOne(".svgMask");
        const pathNodes = svgLayer.find("Path");
        const imageNode = svgLayer.find("Image")[0];
        const newStickers: HTMLCanvasElement[] = [];
        const addedImageContext = imageContext[srcUrl];
        konvaClone.findOne(".annotations").hide();
        konvaClone.findOne(".animateAllSvg").hide();
        svgLayer.globalCompositeOperation("destination-atop");
        imageNode.opacity(-1);
        imageNode.remove();
        for (const pathNode of pathNodes) {
            pathNode.opacity(-1).remove();
        }
        for (const pathNode of pathNodes) {
            svgLayer.add(imageNode);
            svgLayer.add(pathNode);
            const newSticker = cropImageFromCanvasTS(konvaClone);
            if (newSticker) newStickers.push(newSticker);
            imageNode.remove();
            pathNode.remove();
        }
        const index = stickers.length;
        addedImageContext["stickers"][index]["sticker"] = newStickers[0];
        imageContext[srcUrl] = addedImageContext;
        // @ts-ignore
        ReactDOM.unmountComponentAtNode(container);
        return newStickers[0].toDataURL();
    };

    const getColorsCounts = (base: any, imageURL: any, threshold: number) => {
        const img = new window.Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const pixelSize = 5; // 每个超像素的大小
            const scaledWidth = Math.ceil(img.width / pixelSize);
            const scaledHeight = Math.ceil(img.height / pixelSize);
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            const imageData = ctx?.getImageData(0, 0, scaledWidth, scaledHeight);
            // @ts-ignore    
            const pixels = imageData.data;
            const colorFrequency = {};
            const labs = [];
            let total = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                if (r === 0 && g === 0 && b === 0) {
                    continue;
                }
                ++total;
                const color = d3.rgb(r, g, b);
                labs.push(d3.lab(color));
            }
            const dbscanner = jDBSCAN().eps(50).minPts(20).data(labs);
            const point_assignment_result = dbscanner();
            const cluster_centers = dbscanner.getClusters();
            // console.log(labs, point_assignment_result, cluster_centers);
            cluster_centers.forEach(({ l, a, b, dimension, parts }: any) => {
                const key = d3.rgb(d3.lab(l, a, b)).toString();
                // @ts-ignore
                colorFrequency[key] = Array.from(new Set(parts)).length / total;
            });
            // console.log(colorFrequency, cluster_centers, total, labs);
            // // @ts-ignore
            // Object.keys(colorFrequency).forEach(k => colorFrequency[k] /= total);
            base["colors"] = colorFrequency;
            setColorHandle(true);
        };
        img.src = imageURL;
    }

    const handleMouseDown = (e: any) => {
        if (stickerTabBool) return;
        if (clicksHistory) setClicksHistory(null);
        if (predMasksHistory) setPredMasksHistory(null);
    };

    const handleMouseUp = (e: any, shouldSetClick?: boolean) => {
        if (stickerTabBool) return;
        setIsLoading(true);
        setHasClicked(true);
        const { x, y } = e.target.getStage().getPointerPosition();
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

    const redoMask = (i: number) => {
        if (image?.src !== segUrl) {
            return;
        }
        const context = imageContext[image?.src ?? "undefined"]["stickers"][i];
        setSVG(context["svg"]);
        setSVGs(context["svgs"]);
        setClick(context["click"]);
        setClicks(context["clicks"]);
        setClicksHistory(context["clicksHistory"]);
        setMaskImg(context["maskImg"]);
        setUserNegClickBool(context["userNegClickBool"]);
        setIsHovering(context["isHovering"]);
        setPredMask(context["predMask"]);
        setPredMasks(context["predMasks"]);
        setPredMasksHistory(context["predMasksHistory"]);
        setIsLoading(context["isLoading"]);
        setHasClicked(true);
    };

    const handleMaskEdit = (blobUrl: string, stickerId: number) => {
        const context = imageContext[blobUrl]["stickers"][stickerId];
        const image = imageContext[blobUrl]["image"];
        handleResetState();
        setModelScale(image["modelScale"]);
        setTensor(imageContext[blobUrl]["tensor"]["tensor"]);
        setImage(image["img"]);
        setPrevImage(image["img"]);
        setIsErased(false);
        setIsLoading(false);
        setShowLoadingModal(false);
        setAllsvg(imageContext[blobUrl]["json"]["allsvg"]);
        setSVG(context["svg"]);
        setSVGs(context["svgs"]);
        setClick(context["click"]);
        setClicks(context["clicks"]);
        setClicksHistory(null);
        setMaskImg(context["maskImg"]);
        setUserNegClickBool(context["userNegClickBool"]);
        setIsHovering(context["isHovering"]);
        setPredMask(context["predMask"]);
        setPredMasks(context["predMasks"]);
        setPredMasksHistory(context["predMasksHistory"]);
        setHasClicked(true);
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
                    handleResetState={handleResetState}
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
                        <span className="STitle-text">Segmentations</span>
                    </div>
                    <div className="SContent-container">
                        <SegmentationList redoMask={redoMask} colors={colors} />
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
