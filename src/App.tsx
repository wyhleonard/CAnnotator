import './App.css';
import { ReferenceView } from './View/Reference';
import { SegmentationView } from './View/Segmentation';
import { AnnotationView } from './View/Annotation'
import { InferenceSession, Tensor } from "onnxruntime-web";
import * as ort from 'onnxruntime-web';
import { useContext, useEffect, useState } from "react";
import getFile from "./View/helpers/getFile";
import { handleImageScale } from "./View/helpers/ImageHelper";
import { modelScaleProps } from "./View/helpers/Interface";
import {
    traceOnnxMaskToSVG,
} from "./View/helpers/mask_utils";
import {
    modelData,
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
        prevImage: [, setPrevImage],
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
        // isToolBarUpload: [, setIsToolBarUpload],
        blobMap: [blobMap,],
        imageContext: [imageContext,],
        segMaskArray: [, setSegMaskArray]
    } = useContext(AppContext)!;
    const [model, setModel] = useState<InferenceSession | null>(null);
    const [tensor, setTensor] = useState<Tensor | null>(null);
    const [hasClicked, setHasClicked] = useState<boolean>(false);
    const [, setMask] = useState<
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
    const [modelScale, setModelScale] = useState<modelScaleProps | null>(null); // 作用未知
    const [colors, setColors] = useState([{}]);
    const imgSrc = "/demoData/paintings/0.png";
    const [annotationSelectedImg, setAnnotationSelectedImg] = useState(-1);

    // console.log("test-print-modelScale", modelScale)

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
            console.log("running model...", model, clicks, tensor, modelScale);
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

    // 载入图片
    const handleSelectedImage = async (
        data: File | URL,
    ) => {

        if (data instanceof File) {
            console.log("GOT FILE " + data.name);
        } else if (data instanceof URL) {
            console.log("GOT URL " + data.pathname);
        } else {
            console.log("GOT STRING " + data);
        }

        try {
            handleResetState();
            setShowLoadingModal(true);

            // console.log("test-print-data", data)
            const imgData: File = data instanceof File ? data : await getFile(data);
            const img = new window.Image();

            img.src = data instanceof File ? data.name : URL.createObjectURL(imgData);
            const srcUrl = img.src;
            // console.log("test-print-srcUrl", srcUrl);

            (data instanceof URL) && (blobMap[data.href] = srcUrl);
            (data instanceof File) && (blobMap[data.name] = srcUrl); // key-value => "/demoData/paintings/0.png": http://localhost:3000/demoData/paintings/0.png

            const addedImageContext = (srcUrl && imageContext[srcUrl]) || {};
            // console.log("test-print-addedImageContext", addedImageContext); // {}

            addedImageContext["image"] = {};
            img.onload = () => {
                const { height, width, scale, uploadScale } = handleImageScale(img);
                // console.log("test-print-imgParams", height, width, scale, uploadScale) // 1914, 2234, 1, 1
                
                // 作用未知
                const newModelScale = {
                    onnxScale: scale / uploadScale,
                    maskWidth: width * uploadScale,
                    maskHeight: height * uploadScale,
                    scale: scale,
                    uploadScale: uploadScale,
                    width: width,
                    height: height,
                }
                setModelScale(newModelScale);
                addedImageContext["image"]["modelScale"] = newModelScale;

                img.width = Math.round(width);
                img.height = Math.round(height);

                // 作用未知
                setImage(img); // 古画？
                setPrevImage(img);

                // 创建与原画大小相同的maskImage = [h, w]
                const createdMaskImage = Array.from(new Array(height), () => new Array(width).fill(0))
                // console.log("test-print-createdMaskImage", createdMaskImage.length, createdMaskImage[0].length, createdMaskImage[0][0])
                setSegMaskArray(createdMaskImage);
            };

            const regex = /\/(\d+)\.(jpg|png)$/;
            const match = srcUrl.match(regex);
            const name = match ? match[1] : '-1';
            // console.log("test-print-name", name); // "0"

            loadSegModelResults(name, addedImageContext);
            const pending = await loadllModelResults(name, addedImageContext);
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

    // 加载tensor数据
    const loadSegModelResults = (fileName: string, addedImageContext: any) => {
        // paintings/0.png 古画为什么也要load这个东西
        fetch('/processData/tensor-' + fileName + '.json') // 指定文件路径 
            .then(response => response.json())
            .then(data => {
                const arr = new Float32Array(data.size);
                for (let i = 0; i < data.size; ++i) {
                    arr[i] = data.data[i];
                }
                const tensor = new Tensor(arr, data.dims);

                setTensor(tensor);
                // setIsLoading(false);
                setShowLoadingModal(false);

                // 作用未知
                setIsErasing(false);
                setEraserText({ isErase: false, isEmbedding: false });
                
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

    // 加载mask数据
    const loadllModelResults = async (fileName: string, addedImageContext: any) => {
        const response = await fetch('/processData/mask-' + fileName + '.json') // 指定文件路径  
        const data = await response.json();

        // console.log("test-print-svgData", data); // [[svg, coords]] 还不知道怎么画出来的

        setAllsvg(data);
        setIsModelLoaded((prev) => {
            return { ...prev, allModel: true };
        });
        
        addedImageContext["json"] = {
            "allsvg": data,
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
                        <ReferenceView 
                            colors={colors} 
                            handleMaskEdit={handleMaskEdit} 
                            // handleSelectedImage={handleSelectedImage} 
                            selectedImg={annotationSelectedImg}
                            setSelectedImg={setAnnotationSelectedImg}
                        />
                    </div>
                </div>
                < div className="App-content-bottom" >
                    <AnnotationView 
                        imageSrc={annotationSelectedImg === -1 ? "/demoData/references/6.jpg" : "/demoData/references/" + (6) + ".jpg"}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
