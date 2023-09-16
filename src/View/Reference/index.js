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

const demoSegs = [
    {
        image: "/demoData/segmentations/1.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/2.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/3.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/4.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/5.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/6.png",
        colorHistogram: []
    },
    {
        image: "/demoData/segmentations/7.png",
        colorHistogram: []
    }
]

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
    colors, handleMaskEdit, handleSelectedImage
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
    const sortedImages = filteredImages.toSorted((a, b) => b.marked - a.marked);
    const chosenList = Array.from(chosenStickers);

    // console.log(filteredImages.map(item =>
    //   imageContext[blobMap[item.contentUrl]]?.stickers[3].clicks
    // ));

    useEffect(() => {
        setBlockSize([
            blockRef.current?.offsetWidth || 0,
            blockRef.current?.offsetHeight || 0
        ]);
    }, [blockRef])

    const onSearch = () => {
        const value = inputRef.current.value;
        if (value == "") {
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
        // setFilteredImages(images.slice(0, 4));
        // console.log(images);
        filteredImages.forEach(item => item.marked == 1 && (item.marked = 0));
        images.forEach(i => filteredImages[i].marked == 0 && (filteredImages[i].marked = 1));
        setFilteredImages([...filteredImages]);
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

        // console.log(sw, sh, px, py, data);
        // console.log(srcImg.width, srcImg.height);

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
            <div className="Segmentation-color-list">
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
                        <span className="STitle-text-contrast" style={{ marginLeft: "0px", fontSize: "16px" }}>1 - 50</span>
                    </div>
                    <div className="Reference-number-switch-right">
                        <div
                            className="Icon-button"
                            style={{ ...iconStyle(LeftIcon), transform: "rotateY(180deg)" }}
                        />
                    </div>
                    <div className="Reference-image-confirm">
                        <div
                            className="Icon-button"
                            style={iconStyle(ConfirmIcon)}
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
                            className="Reference-image-appendrow"
                            key={`Reference-image-${r}`}
                        >
                            {
                                <>
                                    <div className={`Reference-image-container ${sortedImages[r].marked == 1 ? 'active' :
                                        (sortedImages[r].marked == 0 ? 'marked' : '')
                                        } `} ref={blockRef}>
                                        <div className="Reference-image">
                                            <img
                                                src={item.thumbnailUrl}
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
                                                        <img
                                                            alt=""
                                                            src={imageContext[blobMap[item.contentUrl]]["stickers"][el]["sticker"].toDataURL()}
                                                        />
                                                    </div>

                                                    <div className='R-segmentation-mask'>
                                                        <button onClick={() => {
                                                            setIsEditing(2);
                                                            setActiveSticker(el);
                                                            handleMaskEdit(blobMap[item.contentUrl], el)
                                                        }}>
                                                            <svg t="1692934799400" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4052" width="60" height="60"><path d="M511.582491 63.413262C265.134543 63.413262 64.62588 263.921925 64.62588 510.369873s200.508663 446.957635 446.957635 446.957635 446.957635-200.508663 446.957635-446.957635S758.031463 63.413262 511.582491 63.413262zM509.001713 751.859903c-98.517781 0-182.467775-62.623269-214.771505-150.056598l0.327458-0.134053c-2.007727-4.036943-3.38305-8.422833-3.38305-13.237489 0-16.647145 13.494339-30.142507 30.142507-30.142507 13.389962 0 24.358781 8.877181 28.2893 20.955264l0.422625-0.172939c23.269983 65.442478 85.645612 112.503307 158.972665 112.503307 93.106538 0 168.845523-75.738985 168.845523-168.845523s-75.738985-168.845523-168.845523-168.845523c-20.432355 0-39.874149 3.980661-58.013275 10.66899l21.248953 40.742936c2.486634 2.677992 4.0175 6.2831 4.0175 10.243295 0 8.417717-8.404414 14.921851-15.365966 15.07023-0.102331 0-0.206708 0-0.309038 0-0.220011 0-0.427742 0-0.647753-0.013303l-150.579507-6.463202c-5.372358-0.234337-10.229992-3.310396-12.716626-8.093329-2.486634-4.76963-2.236947-10.509355 0.647753-15.055904l80.890308-127.179564c2.8847-4.533246 8.006348-7.151887 13.365402-6.960529 5.372358 0.234337 10.227945 3.312442 12.71458 8.095375l18.580171 35.625382c26.629497-10.855232 55.683207-16.963347 86.168522-16.963347 126.338407 0 229.130537 102.791108 229.130537 229.130537S635.340119 751.859903 509.001713 751.859903z" fill="#594d3a" p-id="4053"></path></svg>
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
