// 这里是hardcode
const handleImageScale = (data: HTMLImageElement) => {
    const IMAGE_SIZE = 625;
    let w = data.width;
    let h = data.height;
    let scale;

    scale = IMAGE_SIZE / h;
    scale = 1;
    return { height: h, width: w, scale, uploadScale: scale };
  };
  
  export { handleImageScale };
  