import "../../sharedCss.css"
import "./AnnotationList.css"
import "./SegmentationList.css"

const demoAnnos = [
    // {
    //     image: "/demoData/segmentations/1.png",
    //     annotations: [
    //         [133, 8, 4],
    //         [144, 77, 34],
    //         [37, 9, 0],
    //     ]
    // },
    // {
    //     image: "/demoData/segmentations/10.png",
    //     annotations: [
    //         [207, 162, 105],
    //         [134, 98, 66],
    //     ],
    // },
    // {
    //     image: "/demoData/segmentations/11.png",
    //     annotations: [
    //         [211, 168, 134],
    //         [211, 188, 156],
    //         [46, 37, 22]
    //     ],
    // },
]

const annoSize = 63.8;
const colorItemSize = 14.8;

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