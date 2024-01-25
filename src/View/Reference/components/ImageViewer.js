import { imageInOnePage } from "../../sharedConstants";
import "./ImageViewer.css";
import "../index.css";

export const ImageViewer = ({
    images,
    pageIndex,
    expandedImage,
    setExpandedImage,
    segmentedImages,
    getImageAnnotatedIndex
}) => {
    const imageCards = images.length > 0 ? images.map((img, idx) => {
        const imageIndex = pageIndex * imageInOnePage + idx; // index in all images
        const annotatedIndex = getImageAnnotatedIndex(img.thumbnailUrl, segmentedImages);

        return <div 
            className={`Image-Card-Container ${expandedImage === imageIndex ? "expanded" : ""}`}
            style={{
                background: `${annotatedIndex === -1 ? "#fff6dc" : "#5a4e3b"}`
            }}
            key={`image-card-${imageIndex}`}
            onClick={
                () => imageIndex !== expandedImage
                ? setExpandedImage(imageIndex) 
                : setExpandedImage(-1)
            }
        >
            <img
                className="Image-Card-Content"
                src={img.thumbnailUrl}
                style={{
                    borderRadius: "6px",
                    objectFit: "cover",
                }}
                alt=""
            />

            {
                annotatedIndex !== -1 && <div className="Annotated-index">
                    <span 
                        className="STitle-text-contrast" 
                        style={{ 
                            marginLeft: "0px", 
                            fontSize: "16px", 
                            cursor: "default"
                        }}>
                            R{annotatedIndex + 1}
                        </span>
                </div>
            }
        </div> 
    }) : [];

    return <div className="Image-Viewer-container">
        {imageCards}
    </div>
}
