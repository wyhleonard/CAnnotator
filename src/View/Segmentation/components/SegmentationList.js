import "../../sharedCss.css"
import "./SegmentationList.css"

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

const segSize = 60;

export const SegmentationList = (

) => {

    const segItems = demoSegs.map((seg, idx) => {
        return <div
            key={`segment-item-${idx}`}
            className="Segment-item-container"
            style={{height: `${segSize}px`}}
        >
            <div className="Segment-item-image" style={{width: `${segSize}px`}}>
                <img className="Image-container" src={seg.image} alt="" />
            </div>
            <div className="Segment-item-histogram" style={{width: `calc(100% - ${segSize}px - 8px)`}}>

            </div>
        </div>
    })

    return <div className="SDefault-container">
        {segItems}
    </div>
}
