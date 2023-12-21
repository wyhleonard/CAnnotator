import { reorderSeq } from './hardcode.js'

// const reorderSeq = new Set([0, 8, 13, 18, 19, 21, 24, 37, 44]);

let localPictureData = [

];

for (let i = 1; i <= 60; ++i) {
    localPictureData.push({
        "thumbnailUrl": '/demoData/references/' + i + '.jpg',
        "contentUrl": '/demoData/references/' + i + '.jpg',
    });
}

localPictureData = [].concat(
    localPictureData
    .filter((_, i) => reorderSeq.has(i)))
    .concat(localPictureData.filter((_, i) => !(reorderSeq.has(i)))
)

export { localPictureData };