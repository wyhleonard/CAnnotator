import './App.css';
import { ReferenceView } from './View/Reference';
import { SegmentationView } from './View/Segmentation';
import LZString from "lz-string";
import { InferenceSession, Tensor } from "onnxruntime-web";
import * as ort from 'onnxruntime-web';
import React, { useContext, useEffect, useState, useRef } from "react";
import getFile from "./View/helpers/getFile";
import { handleImageScale } from "./View/helpers/ImageHelper";
import { modelScaleProps } from "./View/helpers/Interface";
import ImagePicker from './View/helpers/ImagePicker';
import {
    traceCompressedRLeStringToSVG,
    traceOnnxMaskToSVG,
} from "./View/helpers/mask_utils";
import {
    modelData,
    setParmsandQueryModel,
} from "./View/helpers/modelAPI";
import AppContext from "./View/hooks/createContext";

// Onnxruntime
ort.env.debug = false;
// set global logging level
ort.env.logLevel = 'verbose';

// override path of wasm files - for each file
ort.env.wasm.numThreads = 2;
ort.env.wasm.simd = true;
// ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths = {
    'ort-wasm.wasm': '/ort-wasm.wasm',
    'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
    'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
    'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
};
// ort.env.webgl.pack = true;

function App() {

    const {
        click: [, setClick],
        clicks: [clicks, setClicks],
        clicksHistory: [, setClicksHistory],
        image: [image, setImage],
        prevImage: [prevImage, setPrevImage],
        svg: [, setSVG],
        svgs: [, setSVGs],
        allsvg: [, setAllsvg],
        isErased: [, setIsErased],
        userNegClickBool: [, setUserNegClickBool],
        isModelLoaded: [isModelLoaded, setIsModelLoaded],
        isLoading: [, setIsLoading],
        segmentTypes: [, setSegmentTypes],
        maskImg: [, setMaskImg],
        isErasing: [, setIsErasing],
        stickerTabBool: [stickerTabBool,],
        isHovering: [, setIsHovering],
        showLoadingModal: [, setShowLoadingModal],
        eraserText: [, setEraserText],
        predMask: [predMask, setPredMask],
        predMasks: [predMasks, setPredMasks],
        predMasksHistory: [predMasksHistory, setPredMasksHistory],
        isToolBarUpload: [, setIsToolBarUpload],
        blobMap: [blobMap,],
        imageContext: [imageContext,],
    } = useContext(AppContext)!;
    const [model, setModel] = useState<InferenceSession | null>(null);
    const [tensor, setTensor] = useState<Tensor | null>(null);
    const [hasClicked, setHasClicked] = useState<boolean>(false);
    const [mask, setMask] = useState<
        | string[]
        | Uint8Array
        | Float32Array
        | Int8Array
        | Uint16Array
        | Int16Array
        | Int32Array
        | BigInt64Array
        | Float64Array
        | Uint32Array
        | BigUint64Array
        | null
    >(null);
    const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);
    const [colors, setColors] = useState([{}]);
    const imgSrc = "/demoData/paintings/0.png";

    useEffect(() => {
        const initModel = async () => {
            try {
                // if (process.env.MODEL_DIR === undefined) return;
                const MODEL_DIR = "./interactive_module_quantized_592547_2023_03_19_sam6_long_uncertain.onnx";
                const URL: string = MODEL_DIR;
                // const URL: string = process.env.MODEL_DIR;
                const model = await InferenceSession.create(URL);
                setModel(model);
            } catch (e) {
                console.log("MODEL:", e);
                console.error(e);
            }
        };
        initModel();
        const url = new File([imgSrc], imgSrc);
        handleSelectedImage(url);
    }, []);

    const runModel = async () => {
        // console.log("Running singleMaskModel");
        try {
            // console.log("running model...", model, clicks, tensor, modelScale);
            if (
                model === null ||
                clicks === null ||
                tensor === null ||
                modelScale === null
            )
                return;
            if (stickerTabBool) return;
            // console.log(predMask);
            const feeds = modelData({
                clicks,
                tensor,
                modelScale,
                last_pred_mask: predMask,
            });
            if (feeds === undefined) return;
            // const beforeONNX = Date.now();
            const results = await model.run(feeds);
            // const afterONNX = Date.now();
            // console.log(`ONNX took ${afterONNX - beforeONNX}ms`);
            const output = results[model.outputNames[0]];
            if (hasClicked) {
                // const beforeSVG = Date.now();
                const pred_mask = results[model.outputNames[1]];
                setPredMask(pred_mask);
                if (!predMasksHistory) {
                    setPredMasks([...(predMasks || []), pred_mask]);
                }
                const svgStr = traceOnnxMaskToSVG(
                    output.data,
                    output.dims[1],
                    output.dims[0]
                );
                setSVG(svgStr);
                setMask(output.data);
                // const afterSVG = Date.now();
                // console.log(`SVG took ${afterSVG - beforeSVG}ms`);
            } else {
                // const beforeMask = Date.now();
                // setMaskImg(rleToImage(output.data, output.dims[0], output.dims[1]));
                // const afterMask = Date.now();
                // console.log(`Mask took ${afterMask - beforeMask}ms`);
            }
            setClick(null);
            setIsLoading(false);
            setIsModelLoaded((prev) => {
                return { ...prev, boxModel: true };
            });
            // console.log("boxModel is loaded");
        } catch (e) {
            // console.log(e);
        }
    };

    const clicks2model = async (base: any, clicks: any, tensor: any, modelScale: any, predMask: any) => {
        // console.log("Running clicks2stickers");
        try {
            if (
                model === null ||
                clicks === null ||
                tensor === null ||
                modelScale === null
            )
                return;
            const feeds = modelData({
                clicks,
                tensor,
                modelScale,
                last_pred_mask: predMask,
            });
            if (feeds === undefined) return;
            const results = await model.run(feeds);
            const output = results[model.outputNames[0]];
            const pred_mask = results[model.outputNames[1]];
            base["predMask"] = pred_mask;
            if (!base["predMasksHistory"]) {
                base["predMasks"] = [...(base["predMasks"] || []), pred_mask];
            }
            const svgStr = traceOnnxMaskToSVG(
                output.data,
                output.dims[1],
                output.dims[0]
            );
            base["svg"] = svgStr;
            base["mask"] = output.data;
            base["click"] = null;
            base["isLoading"] = false;
            base["isModelLoaded"] = { ...isModelLoaded, boxModel: true };
            return svgStr;
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        const runOnnx = async () => {
            runModel();
        };
        runOnnx();
    }, [clicks, hasClicked]);

    const handleSelectedImage = async (
        data: File | URL,
        options?: { shouldNotFetchAllModel?: boolean; shouldDownload?: boolean; saveOnly?: boolean }
    ) => {

        if (data instanceof File) {
            console.log("GOT FILE " + data.name);
        } else if (data instanceof URL) {
            console.log("GOT URL " + data.pathname);
        } else {
            console.log("GOT STRING " + data);
        }

        try {
            const shouldNotFetchAllModel = options?.shouldNotFetchAllModel;
            const shouldDownload = options?.shouldDownload;
            const saveOnly = options?.saveOnly ?? false;
            !saveOnly && handleResetState();
            // setIsLoading(true);
            !saveOnly && setShowLoadingModal(true);
            let imgName: string = "";
            if (data instanceof URL) {
                imgName = data.pathname;
            }
            imgName = imgName.substring(imgName.lastIndexOf("/") + 1);
            const imgData: File = data instanceof File ? data : await getFile(data);
            const img = new window.Image();
            // img.src = URL.createObjectURL(imgData);
            img.src = data instanceof File ? data.name : URL.createObjectURL(imgData);
            const srcUrl = img.src;
            (data instanceof URL) && (blobMap[data.href] = srcUrl);
            (data instanceof File) && (blobMap[data.name] = srcUrl);
            const addedImageContext = (srcUrl && imageContext[srcUrl]) || {};
            addedImageContext["image"] = {};
            img.onload = () => {
                !saveOnly && setIsToolBarUpload(false);
                const { height, width, scale, uploadScale } = handleImageScale(img);
                !saveOnly && setModelScale({
                    onnxScale: scale / uploadScale,
                    maskWidth: width * uploadScale,
                    maskHeight: height * uploadScale,
                    scale: scale,
                    uploadScale: uploadScale,
                    width: width,
                    height: height,
                });
                addedImageContext["image"]["modelScale"] = {
                    onnxScale: scale / uploadScale,
                    maskWidth: width * uploadScale,
                    maskHeight: height * uploadScale,
                    scale: scale,
                    uploadScale: uploadScale,
                    width: width,
                    height: height,
                };
                img.width = Math.round(width);
                img.height = Math.round(height);
                !saveOnly && setImage(img);
                !saveOnly && setPrevImage(img);
                !saveOnly && setIsErased(false);
                // setParmsandQueryModel({
                //     width,
                //     height,
                //     uploadScale,
                //     imgData: img,
                //     handleSegModelResults: ({ tensor }: { tensor: Tensor }) => addedImageContext["tensor"] = handleSegModelResults({ tensor, saveOnly, name }),
                //     handleAllModelResults: ({
                //         allJSON,
                //         image_height,
                //     }: {
                //         allJSON: {
                //             encodedMask: string;
                //             bbox: number[];
                //             score: number;
                //             point_coord: number[];
                //             uncertain_iou: number;
                //             area: number;
                //         }[];
                //         image_height: number;
                //     }) => addedImageContext["json"] = handleAllModelResults({ allJSON, image_height, saveOnly, name }),
                //     imgName,
                //     shouldDownload,
                //     shouldNotFetchAllModel,
                // });
            };
            const regex = /\/(\d+)\.(jpg|png)$/;
            const match = srcUrl.match(regex);
            const name = match ? match[1] : '-1';
            loadSegModelResults(name, addedImageContext, saveOnly);
            const pending = await loadllModelResults(name, addedImageContext, saveOnly);
            addedImageContext["image"]["img"] = img;
            addedImageContext["image"]["prevImage"] = img;
            addedImageContext["image"]["isErased"] = false;
            addedImageContext["stickers"] = [];
            imageContext[srcUrl ?? "undefined"] = addedImageContext;
            return pending;
        } catch (error) {
            console.log(error);
        }
    };

    const loadSegModelResults = (fileName: string, addedImageContext: any, saveOnly: boolean) => {
        fetch('/processData/tensor-' + fileName + '.json') // 指定文件路径  
            .then(response => response.json())
            .then(data => {
                const arr = new Float32Array(data.size);
                for (let i = 0; i < data.size; ++i) {
                    arr[i] = data.data[i];
                }
                const tensor = new Tensor(arr, data.dims);
                if (!saveOnly) {
                    setTensor(tensor);
                    setIsLoading(false);
                    setIsErasing(false);
                    setShowLoadingModal(false);
                    setEraserText({ isErase: false, isEmbedding: false });
                }
                addedImageContext["tensor"] = {
                    "tensor": tensor,
                    "isLoading": false,
                    "isErasing": false,
                    "showLoadingModal": false,
                    "eraserText": { isErase: false, isEmbedding: false },
                };
            })
            .catch(error => {
                // 处理错误  
                console.error(error);
            });
    };

    const loadllModelResults = async (fileName: string, addedImageContext: any, saveOnly: boolean) => {
        const response = await fetch('/processData/mask-' + fileName + '.json') // 指定文件路径  
        const data = await response.json();
        if (!saveOnly) {
            setAllsvg(data);
            setIsModelLoaded((prev) => {
                return { ...prev, allModel: true };
            });
        }
        addedImageContext["json"] = {
            "allsvg": data,
            "isModelLoaded": { ...isModelLoaded, allModel: true },
        };
    };

    function saveObjectAsFile(obj: any, fileName: any) {
        // 将对象转换为 JSON 字符串  
        const jsonString = JSON.stringify(obj);

        // 创建 Blob 对象  
        const blob = new Blob([jsonString], { type: 'application/json' });

        // 创建临时 URL  
        const url = URL.createObjectURL(blob);

        // 创建 <a> 标签  
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // 模拟点击 <a> 标签，触发文件下载  
        link.click();

        // 释放临时 URL  
        URL.revokeObjectURL(url);
    }

    const handleSegModelResults = ({ tensor, saveOnly, name }: any) => {
        console.log(tensor, saveOnly);
        if (!saveOnly) {
            setTensor(tensor);
            setIsLoading(false);
            setIsErasing(false);
            setShowLoadingModal(false);
            setEraserText({ isErase: false, isEmbedding: false });
        }
        saveObjectAsFile(tensor, 'tensor-'+name+'.json');
        return {
            "tensor": tensor,
            "isLoading": false,
            "isErasing": false,
            "showLoadingModal": false,
            "eraserText": { isErase: false, isEmbedding: false },
        };
    };

    const handleAllModelResults = ({
        allJSON,
        image_height,
        saveOnly,
        name,
    }: any) => {
        console.log(allJSON, image_height, saveOnly);
        const allMaskSVG = allJSON.map(
            (el: {
                encodedMask: string;
                bbox: number[];
                score: number;
                point_coord: number[];
                uncertain_iou: number;
                area: number;
            }) => {
                const maskenc = LZString.decompressFromEncodedURIComponent(
                    el.encodedMask
                );
                const svg = traceCompressedRLeStringToSVG(maskenc, image_height);
                return { svg: svg, point_coord: el.point_coord };
            }
        );
        if (!saveOnly) {
            setAllsvg(allMaskSVG);
            setIsModelLoaded((prev) => {
                return { ...prev, allModel: true };
            });
        }
        saveObjectAsFile(allMaskSVG, 'mask-'+name+'.json');
        return {
            "allsvg": allMaskSVG,
            "isModelLoaded": { ...isModelLoaded, allModel: true },
        };
    };

    const handleResetState = () => {
        setMaskImg(null);
        setHasClicked(false);
        setClick(null);
        setClicks(null);
        setSVG(null);
        setSVGs(null);
        setAllsvg(null);
        setTensor(null);
        setImage(null);
        setPrevImage(null);
        setPredMask(null);
        setIsErased(false);
        setShowLoadingModal(false);
        setIsModelLoaded({ boxModel: false, allModel: false });
        setSegmentTypes("Click");
        setIsLoading(false);
        setIsHovering(null);
        setPredMasks(null);
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


    return (
        <div className="App" >
            <div className="App-header" >
                <span className="App-header-title" > CAnnotator </span>
                {/* <ImagePicker
                    handleSelectedImage={handleSelectedImage}
                /> */}
            </div>
            <div className="App-content" >
                <div className="App-content-top" >
                    <div className="Segmentation-container" >
                        <SegmentationView
                            scale={modelScale}
                            setModelScale={setModelScale}
                            handleResetState={handleResetState}
                            hasClicked={hasClicked}
                            setHasClicked={setHasClicked}
                            setTensor={setTensor}
                            setColors={setColors}
                            image={image}
                            colors={colors}
                            clicks2model={clicks2model}
                        />
                    </div>
                    < div className="Reference-container" >
                        <ReferenceView colors={colors} handleMaskEdit={handleMaskEdit} handleSelectedImage={handleSelectedImage} />
                    </div>
                </div>
                < div className="App-content-bottom" >
                </div>
            </div>
        </div>
    );
}

export default App;
