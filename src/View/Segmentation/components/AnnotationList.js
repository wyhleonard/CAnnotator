import "../../sharedCss.css"
import "./AnnotationList.css"
import "./SegmentationList.css"

const demoAnnos = [
    {
        image: "/demoData/segmentations/1.png",
        annotations: [
            [154, 15, 8],
            [246, 130, 28],
            [60, 128, 97],
            [30, 64, 97],
        ]
    },
    {
        image: "/demoData/segmentations/2.png",
        annotations: [
            [60, 128, 97],
            [30, 64, 97],
        ],
    },
    {
        image: "/demoData/segmentations/3.png",
        annotations: [],
    },
    {
        image: "/demoData/segmentations/4.png",
        annotations: [],
    },
    {
        image: "/demoData/segmentations/5.png",
        annotations: [],
    },
]

const annoSize = 60;
const colorItemSize = 15;

export const AnnotationList = (

) => {
    const annoItems = demoAnnos.map((anno, idx) => {

        const colorItems = anno.annotations.map((color, idx) => {
            return <div
                key={`color-item-${idx}`}
                className="Color-item-container"
                style={{
                    marginTop: `${idx === 0 ? 0 : 2}px`,
                    height: `${colorItemSize}px`,
                    backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
                }}
            >

            </div>
        })

        return <div
            key={`anno-item-${idx}`} 
            className="Annotation-item-container"
            style={{
                marginLeft: `${idx % 2 === 0 ? 0: 8}px`,
                height: `${annoSize}px`,
            }}
        >
            <div className="Annotation-item-image" style={{width: `${annoSize}px`}}>
                <img className="Image-container" src={anno.image} alt="" />
            </div>
            <div className="Annotation-item-colors" style={{width: `calc(100% - ${annoSize}px)`}}>
                <div className="Annotation-item-colorlist">
                    {colorItems}
                </div>
            </div>
        </div>
    })

    return <div className="SDefault-container" style={{display: "flex", flexWrap: "wrap"}}>
        {annoItems}
    </div>
}