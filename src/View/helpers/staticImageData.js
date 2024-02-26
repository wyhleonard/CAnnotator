/*
    author: Yanhong Wu
    date: 2023-12-15
 */

// 假装有个数据库
export function fetchStaticImageData(dataName, fixedImageNumber) {
    // const fixedImageNumber = 60;
    const staticImageData = [];
    for(let i = 1; i <= fixedImageNumber; i++) {
        const imagePath = '/studyData/natural-images/' + dataName + '/' + i + '.jpg';
        staticImageData.push({
            "thumbnailUrl": imagePath,
            "contentUrl": imagePath,
        })
    }

    // TODO：打乱一下图片的顺序 => 已经做了
    // console.log("test-print-staticImageData", staticImageData)
    
    return staticImageData
}