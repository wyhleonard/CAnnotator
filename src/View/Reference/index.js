import "../sharedCss.css"
import "./index.css"
import SearchIcon from "../../Icons/search.svg";
import LeftIcon from "../../Icons/triangle.svg";
import ConfirmIcon from "../../Icons/confirm.svg";
import { iconLevel1 } from "../sharedConstants";
import { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { localPictureData } from "../helpers/pictureData";
import { initPositions } from "../helpers/hardcode";
import AppContext from "../hooks/createContext";
import Scatter from "./Scatter";
import ReSegmentSVG from "../../Icons/resegment.svg";

const iconRatio = 0.7;
const subscriptionKey = '3086c6e7bd714a75a85f68725e4ff267';
const path = 'https://api.bing.microsoft.com/v7.0/images/search';

const iconStyle = (iconPath) => {
    return {
        background: `url(${iconPath}) no-repeat`,
        backgroundSize: 'contain',
        width: `${iconLevel1 * iconRatio}px`,
        height: `${iconLevel1 * iconRatio}px`,
        cursor: 'pointer',
    }
}

export const ReferenceView = ({
    colors, handleMaskEdit, handleSelectedImage, selectedImg, setSelectedImg
}) => {
    const {
        chosenColors: [chosenColors, setChosenColors],
        isPreProcess: [, setIsPreProcess],
        chosenStickers: [chosenStickers, setChosenStickers],
        filteredImages: [filteredImages, setFilteredImages],
        stickers: [stickers, setStickers],
        blobMap: [blobMap, setBlobMap],
        isEditing: [, setIsEditing],
        showLoadingModal: [, setShowLoadingModal],
        segUrl: [segUrl,],
        activeSticker: [activeSticker, setActiveSticker],
        imageContext: [imageContext, setImageContext],
    } = useContext(AppContext);

    const blockRef = useRef(null);
    const inputRef = useRef(null);
    const [blockSize, setBlockSize] = useState(0);
    const [dots, setDots] = useState([[0, 0]]);
    const [spot, setSpot] = useState(null);
    const [isFilter, setIsFilter] = useState(false);

    const sortedImages = filteredImages.toSorted((a, b) => b.marked - a.marked);
    const chosenList = Array.from(chosenStickers);

    useEffect(() => {
        setBlockSize([
            blockRef.current?.offsetWidth || 0,
            blockRef.current?.offsetHeight || 0
        ]);
    }, [blockRef])

    const onSearch = () => {
        const value = inputRef.current.value;
        if (value === "") {
            return;
        }
        // const headers = {
        //   'Ocp-Apim-Subscription-Key': subscriptionKey,
        // };
        // axios.get(path + '?q=' + encodeURIComponent(value), { headers })
        //   .then(response => {
        //     console.log(response);
        //     setPictures(response.data.value);
        //   })
        //   .catch(error => {
        //     console.error(error);
        //   });
        setShowLoadingModal(true);
        localPictureData.forEach(item => item["marked"] = 0);
        const threads = [];
        !filteredImages.length && localPictureData.forEach((item) => {
            const url = new File([item.contentUrl], item.contentUrl);
            threads.push(handleSelectedImage(url, {
                shouldDownload: true,
                saveOnly: true
            }));
        });
        Promise.all(threads).then(() => setShowLoadingModal(false));
        setFilteredImages(localPictureData);
        setIsPreProcess(true);
        // fetch('http://localhost:8000/scatter/positions/url', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(localPictureData.map(item => item.contentUrl))
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         // console.log(JSON.parse(data));
        //         setDots(JSON.parse(data));
        //     })
        //     .catch(error => {
        //         console.log("positions: ", error);
        //     });
        setDots(initPositions);
    };

    const handleFilter = (images) => {
        filteredImages.forEach(item => item.marked === 1 && (item.marked = 0));
        images.forEach(i => filteredImages[i].marked === 0 && (filteredImages[i].marked = 1));
        setFilteredImages([...filteredImages]);
        if (images.length) {
            setIsFilter(true);
        } else {
            setIsFilter(false);
        }
    };

    const doCrop = async (data) => {
        const srcImg = new window.Image();
        const dstImg = new window.Image();
        srcImg.src = data.url;
        dstImg.src = data.seg;

        // 等待图片加载完成  
        await new Promise((resolve, reject) => {
            srcImg.onload = resolve;
            srcImg.onerror = reject;
        });
        await new Promise((resolve, reject) => {
            dstImg.onload = resolve;
            dstImg.onerror = reject;
        });

        // 创建一个Canvas元素  
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        const scale = 3;
        const sw = dstImg.width, sh = dstImg.height;
        const w = srcImg.width, h = srcImg.height;
        const tw = scale * sw > w ? w : scale * sw, th = scale * sh > h ? h : scale * sh;
        const px = data.click.ex - sw > 0 ? data.click.ex - sw : 0;
        const py = data.click.ey - sh > 0 ? data.click.ey - sh : 0;

        // 设置Canvas的宽度和高度为给定的长宽  
        canvas.width = tw;
        canvas.height = th;

        // 在Canvas上绘制图像，并根据给定的坐标点和长宽进行裁剪  
        ctx.drawImage(srcImg, px, py, tw, th, 0, 0, tw, th);

        // 将Canvas转换为Blob对象  
        return new Promise((resolve) => {
            canvas.toBlob(resolve);
        });

    }

    const crop = async (el) => {
        const srcData = {
            url: segUrl,
            seg: stickers[el].toDataURL(),
            click: imageContext[segUrl]["stickers"][el]["clicks"][0],
        };
        const tgtsData = filteredImages.map(item => {
            const u = blobMap[item.contentUrl]
            return {
                url: u,
                seg: imageContext[u]["stickers"][el]["sticker"].toDataURL(),
                click: imageContext[u]["stickers"][el]["clicks"][0],
            }
        });
        // console.log(srcData, tgtsData);
        const srcBlob = await doCrop(srcData);
        const tgtBlobs = await tgtsData.map(async (item) => { return await doCrop(item) });
        return {
            src: srcBlob,
            tgts: tgtBlobs
        }
    }

    const handleScatter = (el) => {
        if (spot === el) {
            setSpot(null);
        } else {
            setSpot(el);
        }

        var formData = new FormData();

        crop(el)
            .then(data => {
                formData.append('sourceFile', data.src, 'sourceFile.jpg');
                Promise.all(data.tgts.map(async function (blob, index) {
                    const b = await blob;
                    formData.append('targetFiles', b, 'targetFiles.jpg');
                })).then(() => {
                    // 发起POST请求，将FormData对象发送到后端  
                    fetch('http://localhost:8000/scatter/positions/blob', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            // 处理后端返回的响应数据  
                            // console.log(data);
                            setDots(JSON.parse(data));
                        })
                        .catch(error => {
                            // 处理错误  
                            console.error(error);
                        });
                })
            })
            .catch(error => {
                // 处理错误  
                console.error(error);
            });
    }

    // 滚轮隐藏后，无法直接触发滑动行为，需要新写一个滚轮函数 👇
    const handleSegmentScroll = (e) => {
        const srollElements = document.getElementsByClassName("segmentList");
        for (const srollElement of srollElements) {
            if (e.deltaY > 0) {
                srollElement.scrollLeft += blockSize[0] + 8;
            } else if (e.deltaY < 0) {
                srollElement.scrollLeft -= blockSize[0] + 8;
            }
        }

    }

    const handleSegmentScrollFirstCol = (e) => {
        const srollElement = document.getElementById("segmentRow");
        if (e.deltaY > 0) {
            srollElement.scrollTop += blockSize[1] + 8;
        } else if (e.deltaY < 0) {
            srollElement.scrollTop -= blockSize[1] + 8;
        }
    }

    const handleBarClick = (color) => {
        if (chosenColors.has(color)) {
            chosenColors.delete(color);
        } else {
            chosenColors.add(color);
        }
        if (chosenColors.size == 0) {
            filteredImages.forEach(item =>
                (item.marked = 0)
            );
        } else {
            filteredImages.forEach(item =>
                (item.marked = -1)
            );
            // console.log(chosenColors);
            chosenColors.forEach((c) => {
                Array.from(chosenStickers).forEach(el => {
                    filteredImages.forEach(item =>
                        imageContext[blobMap[item.contentUrl]]["stickers"][el]["hasColors"].has(c) && (item.marked = 0)
                    )
                })

            });
        }
        setChosenColors(new Set([...chosenColors]));
    };
    

    const segItem = chosenList.map((el, i) => {
        return <div
            key={`r-segmentation-item-${i}`}
            className="R-segmentation-item"
            style={{
                marginRight: i === chosenList.length - 1 ? "0px" : "8px",
            }}
        >
            <img className="Segmentation-image-container" src={stickers[el].toDataURL()} alt="" onClick={() => handleScatter(el)} />
            <div className="Segmentation-color-list" onWheel={(e) => { e.stopPropagation() }}>
                {
                    Object.keys(colors[el]).toSorted((a, b) => colors[el][b] - colors[el][a]).map((item) => {
                        const c = d3.color(item);
                        c.opacity = 0.2;
                        return (<div
                            className="Segmentation-color-item" style={{
                                backgroundColor: !chosenColors.size ?
                                    item :
                                    (chosenColors.has(item) ? item : c)
                            }}
                            onClick={() => handleBarClick(item)}
                        />)
                    })
                }
            </div>
        </div>
    })

    return <div className="SView-container">
        <div className="Reference-view-content">
            <div className="STitle-container">
                <span className="STitle-text">Reference Images</span>
            </div>
            <div className="STitle-container" style={{ marginTop: "8px" }}>
                <div className="Reference-toolbar-container">
                    <input ref={inputRef} className="Reference-toolbar-search" />
                    <div className="Reference-search-button">
                        <div
                            className="Icon-button"
                            style={iconStyle(SearchIcon)}
                            onClick={onSearch}
                        />
                    </div>
                    <div className="Reference-number-switch-left">
                        <div
                            className="Icon-button"
                            style={iconStyle(LeftIcon)}
                        />
                    </div>
                    <div className="Reference-number-display">
                        <span className="STitle-text-contrast" style={{ marginLeft: "0px", fontSize: "16px" }}>1 - 60</span>
                    </div>
                    <div className="Reference-number-switch-right">
                        <div
                            className="Icon-button"
                            style={{ ...iconStyle(LeftIcon), transform: "rotateY(180deg)" }}
                        />
                    </div>
                    <div className={`Reference-image-confirm ${selectedImg === -1 ? '' : 'active'}`}>
                        <div
                            className="Icon-button"
                            style={iconStyle(ConfirmIcon)}
                            onClick={() => {

                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="Reference-image-list">
                <div className="Reference-image-firstrow">
                    {
                        sortedImages.length ? <>
                            <div className="Reference-projection-container" ref={blockRef}>
                                <div className="Reference-projection">
                                    <Scatter handleFilter={handleFilter} dots={dots} />
                                </div>
                            </div>
                            <div
                                className="Reference-segmentation-list segmentList"
                                onWheel={handleSegmentScroll}
                            >
                                {segItem}
                            </div>
                        </> : <></>
                    }
                </div>

                <div className="Reference-image-rows" id="segmentRow" onWheel={handleSegmentScrollFirstCol}>
                    {sortedImages.length ? sortedImages.map((item, r) => (
                        <div
                            className={`Reference-image-appendrow ${sortedImages[r].marked === -1 || (isFilter && sortedImages[r].marked === 0) ? 'miss' : ''}`}
                            key={`Reference-image-${r}`}
                            style={{
                                marginTop: `${r === 0 ? "0px": "8px"}`
                            }}
                        >
                            {
                                <>
                                    <div className={`Reference-image-container ${r === selectedImg ? 'active' : ''}`} ref={blockRef}>
                                        <div className="Reference-image" onClick={() => { setSelectedImg(selectedImg === r ? -1 : r) }}>
                                            <img
                                                src={item.thumbnailUrl}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: "6px"
                                                }}
                                                alt=""
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="Reference-segmentation-list segmentList"
                                    >
                                        {
                                            chosenList.map((el, i) => {
                                                return <div
                                                    key={`r-segmentation-projection-${el}-${i}`}
                                                    className="R-segmentation-image"
                                                    style={{
                                                        marginRight: i === chosenList.length - 1 ? "0px" : "8px",
                                                    }}
                                                >
                                                    <div>
                                                        {
                                                            imageContext[blobMap[item.contentUrl]]["stickers"][el]["sticker"] ?
                                                                <img
                                                                    alt=""
                                                                    src={imageContext[blobMap[item.contentUrl]]["stickers"][el]["sticker"].toDataURL()}
                                                                /> : <></>
                                                        }
                                                    </div>

                                                    <div className='R-segmentation-mask'>
                                                        <button onClick={() => {
                                                            setIsEditing(2);
                                                            setActiveSticker(el);
                                                            handleMaskEdit(blobMap[item.contentUrl], el)
                                                        }}>
                                                            <div
                                                                style={{
                                                                    background: `url(${ReSegmentSVG}) no-repeat`,
                                                                    backgroundSize: 'contain',
                                                                    width: `${48}px`,
                                                                    height: `${48}px`,
                                                                    cursor: 'pointer',
                                                                }}
                                                            />
                                                        </button>
                                                    </div>

                                                </div>
                                            })
                                        }
                                    </div>
                                </>
                            }
                        </div>
                    )) : <></>
                    }
                </div>
            </div>
        </div>
    </div>
}
