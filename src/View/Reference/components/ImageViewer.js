import { useState } from "react";
import "./ImageViewer.css";

export const ImageViewer = ({
    images,
}) => {
    // console.log("test-print-images", images);

    // 点击某个块后展开 => gpt牛逼
    const [expandedImage, setExpandedImage] = useState(-1);

    const imageCards = images.length > 0 ? images.map((img, idx) => {
        return <div 
            className={`Image-Card-Container ${expandedImage === idx ? "expanded" : ""}`} 
            key={`image-card-${idx}`}
            onClick={() => idx !== expandedImage ? setExpandedImage(idx) : setExpandedImage(-1)}
        >
            <img
                className="Image-Card-Content"
                src={img.thumbnailUrl}
                style={{
                    borderRadius: "6px",
                    objectFit: idx !== expandedImage ? "cover" : "cover",
                }}
                alt=""
            />
        </div> 
    }) : [];


    return <div className="Image-Viewer-container">
        {imageCards}
    </div>
}
