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
import { PAINTINGMASKTENSORDATAPATH, PAINTINGPATH } from './View/sharedConstants';
import { checkImageIsLoaded, findMaxValueInArray, findTargetInFilteredImages } from './View/utils';
import LoadingModal from './View/Segmentation/components/LoadingModal';

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
        image: [image, setImage],
        prevImage: [, setPrevImage],
        svg: [, setSVG],
        svgs: [, setSVGs],
        allsvg: [, setAllsvg],
        isErased: [, setIsErased],
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
        predMasksHistory: [predMasksHistory],
        blobMap: [blobMap,],
        imageContext: [imageContext,],
        segMaskArray: [segMaskArray, setSegMaskArray],
        filteredImages: [filteredImages],
        editingMode: [editingMode, setEditingMode],
        segMaskIndex: [, setSegMaskIndex],
        currentIndex: [, setCurrentIndex],
        stickerForTrack: [stickerForTrack],
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
    const [modelScale, setModelScale] = useState<modelScaleProps | null>(null); // SAM params

    // 变量管理还是很混乱 => 只能重构的时候再做了
    const [colors, setColors] = useState([]);
    const imgSrc = PAINTINGPATH;
    const [referenceImage, setReferenceImage] = useState("");

    // console.log("test-print-modelScale", modelScale)
    // console.log("test-print-referenceImage", referenceImage)

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
        handleSelectedImage(url, true);
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

    // 找到你了
    useEffect(() => {
        const runOnnx = async () => {
            runModel();
        };
        runOnnx();
    }, [clicks, hasClicked]);

    // 载入图片 => 改成同步了
    const handleSelectedImage = (
        data: File | URL,
        isPainting: boolean,
        objectName: string = "",
        isAddContext: boolean = true,
    ) => {

        if (data instanceof File) {
            console.log("GOT FILE " + data.name);
        } else if (data instanceof URL) {
            console.log("GOT URL " + data.pathname);
        } else {
            console.log("GOT STRING " + data);
        }

        handleResetState();
        setShowLoadingModal(true);

        // 为啥一直是False
        // console.log("test-print-setShowLoadingModal", JSON.parse(JSON.stringify(showLoadingModal))) 

        // console.log("test-print-data", data instanceof File, data) // true
        const imgData: File | null = data instanceof File ? data : getFile(data); // 这里用异步的话容易出问题
        const img = new window.Image();
        const lastImage = image?.src;

        // console.log("test-print-instanceof", data instanceof File, data)  // true
        if(imgData !== null) {
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
                setImage(img); // 古画
                setPrevImage(img); // 这个的作用是什么 => 似乎没用

                // 创建与原画大小相同的maskImage = [h, w]
                const createdMaskImage = Array.from(new Array(height), () => new Array(width).fill(0))
                // console.log("test-print-createdMaskImage", createdMaskImage.length, createdMaskImage[0].length, createdMaskImage[0][0])
                
                // 如果segMaskArray不为[]，需要做状态保存
                if(segMaskArray.length > 0 && lastImage !== undefined && isAddContext) {
                    const lastImageContext = imageContext[lastImage];
                    lastImageContext["maskArray"] = JSON.parse(JSON.stringify(segMaskArray));
                } 
                setSegMaskArray(createdMaskImage);
            };

            const regex = /\/(\d+)\.(jpg|png)$/;
            const match = srcUrl.match(regex);
            const name = match ? match[1] : '-1';
            // console.log("test-print-name", name); // "0"

            const loadPathRoot = isPainting ? PAINTINGMASKTENSORDATAPATH : (
                objectName === "" ? "" : `/studyData/mask-and-tensor-jsons/${objectName}/`)
            if(loadPathRoot !== "") {
                loadSegModelResults(loadPathRoot, name, addedImageContext);
                loadllModelResults(loadPathRoot, name, addedImageContext);
            } else {
                console.log("mask/tensor path is undefined.")
            }
            addedImageContext["image"]["img"] = img;
            addedImageContext["image"]["prevImage"] = img;
            addedImageContext["image"]["isErased"] = false;
            addedImageContext["stickers"] = [];
            if(isAddContext) imageContext[srcUrl ?? "undefined"] = addedImageContext;
        }
    };

    // 加载tensor数据
    const loadSegModelResults = (root: string, fileName: string, addedImageContext: any) => {
        // console.log("test-print-tensor-dataPath", root + 'tensor-' + fileName + '.json')

        fetch(root + 'tensor-' + fileName + '.json') // 指定文件路径 
            .then(response => response.json())
            .then(data => {
                const arr = new Float32Array(data.size);
                for (let i = 0; i < data.size; ++i) {
                    arr[i] = data.data[i];
                }
                const tensor = new Tensor(arr, data.dims);

                setTensor(tensor);
                // setIsLoading(false);

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

    // 加载mask数据 => 改成同步，因为只有加载完毕后才能分割
    const loadllModelResults = (root: string, fileName: string, addedImageContext: any) => {
        // const response = await fetch(root + 'mask-' + fileName + '.json') // 指定文件路径  

        fetch(root + 'mask-' + fileName + '.json')
            .then(response => response.json())
            .then(data => {
                setAllsvg(data);
                setIsModelLoaded((prev) => {
                    return { ...prev, allModel: true };
                });
                
                addedImageContext["json"] = {
                    "allsvg": data,
                    "isModelLoaded": { ...isModelLoaded, allModel: true },
                };

                setShowLoadingModal(false);
            })
            .catch(error => {
                console.error(error);
            });
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
        setIsModelLoaded({ boxModel: false, allModel: false });
        setSegmentTypes("Click");
        setIsLoading(false);
        setIsHovering(null);
        setPredMasks(null);
    };

    const handleResetPaintingImage = (imagePath: string) => {
        const paintingImage = imageContext[imagePath]["image"]["img"];
        const paintingMaskArray = imageContext[imagePath]["maskArray"];
        const paintingTensor = imageContext[imagePath]["tensor"]["tensor"];
        const paintingAllSvg = imageContext[imagePath]["json"]["allsvg"];
        const paintingModelScale = imageContext[imagePath]["image"]["modelScale"];

        setImage(paintingImage);
        setPrevImage(paintingImage);
        setModelScale(paintingModelScale);
        setSegMaskArray(paintingMaskArray);
        setTensor(paintingTensor);
        setAllsvg(paintingAllSvg);
        setIsModelLoaded((prev) => {
            return { ...prev, allModel: true };
        });

        setSegMaskIndex(findMaxValueInArray(paintingMaskArray));
    }

    const handleImageResegment = (imageIndex: number, objectName: string) => {
        const [isLoaded, loadedPath]= checkImageIsLoaded(imageContext, imageIndex);
        // console.log("test-print-handleImageResegment", imageIndex, objectName, isLoaded, loadedPath) // 0 pheasant
        
        if(imageIndex !== -1 ) {
            if(isLoaded) {
                if(image) {
                    handleResetState();
                    const splitOne = (image.src).split("/");
                    const splitTwo = splitOne[splitOne.length - 1].split(".");
                    if(parseInt(splitTwo[0]) === imageIndex + 1) {
                        // 切换回古画
                        const keys = Object.keys(imageContext);
                        for(let k = 0; k < keys.length; k++) {
                            if(keys[k].indexOf(PAINTINGPATH) !== -1) {
                                handleResetPaintingImage(keys[k]);
                                setEditingMode("painting");
                                break
                            }
                        }
                    } else {
                        // 不载入，直接切换显示相应的自然图片
                        handleResetPaintingImage(loadedPath as string);
                        setEditingMode("natural-image");

                        let startIndex = -1; // 从新分割的Seg开始
                        for(let i = 0; i < stickerForTrack.length; i++) {
                            if(stickerForTrack[i].length === 0) {
                                startIndex = i;
                                break
                            }
                        }
                        // console.log("test-print-startIndex", stickerForTrack, startIndex)
                        setCurrentIndex(startIndex);
                    }
                }
            } else {
                if(editingMode === "sticker") {
                    // 切换回古画
                    const keys = Object.keys(imageContext);
                    for(let k = 0; k < keys.length; k++) {
                        if(keys[k].indexOf(PAINTINGPATH) !== -1) {
                            handleResetPaintingImage(keys[k]);
                            setEditingMode("painting");
                            break
                        }
                    }
                } else {
                    console.log("handleImageResegment-load-imageIndex", imageIndex)
                    // 读取选中图片的mask and tensor.json, 修改当前显示在paintingboard中的内容
                    const imagePath = findTargetInFilteredImages(imageIndex, filteredImages);
                    const imageFile = new File([imagePath], imagePath);
                    handleSelectedImage(imageFile, false, objectName);

                    // 告诉segmentation view关于状态的更新
                    setEditingMode("natural-image");
                    setSegMaskIndex(0);
                    setCurrentIndex(0);
                }
            }
        }
    }
    
    return (
        <div className="App" >
            <div className="App-header" >
                <span className="App-header-title" > CAnnotator </span>
            </div>
            <div className="App-content" >
                <LoadingModal />
                <div className="App-content-top" >
                    <div className="Segmentation-container" >
                        <SegmentationView
                            scale={modelScale}
                            hasClicked={hasClicked}
                            setHasClicked={setHasClicked}
                            setColors={setColors}
                            image={image}
                            colors={colors}
                            handleImageResegment={handleImageResegment}
                        />
                    </div>
                    < div className="Reference-container" >
                        <ReferenceView 
                            colors={colors} 
                            handleImageResegment={handleImageResegment}
                            setReferenceImage={setReferenceImage}
                            handleResetPaintingImage={handleResetPaintingImage}
                            handleSelectedImage={handleSelectedImage}
                        />
                    </div>
                </div>
                < div className="App-content-bottom" >
                    <AnnotationView 
                        imageSrc={referenceImage}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
