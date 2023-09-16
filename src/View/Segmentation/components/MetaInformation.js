import "../../sharedCss.css"
import "./MetaInformation.css"

export const MetaInformation = () => {
    return <div className="SDefault-container">
        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "16%"}}>
                <span className="STitle-text-contrast">Title</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(84% - 8px)"}}>
                <span className="STitle-text-contrast">Maple, Eagle and Pheasant</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "21.8%"}}>
                <span className="STitle-text-contrast">Author</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(78.2% - 8px)"}}>
                <span className="STitle-text-contrast">Di Li</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "24%"}}>
                <span className="STitle-text-contrast">Dynasty</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(76% - 8px)"}}>
                <span className="STitle-text-contrast">Southern Song</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "26.2%"}}>
                <span className="STitle-text-contrast">Category</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(73.8% - 8px)"}}>
                <span className="STitle-text-contrast">Ink and Color on Silk</span>
            </div>
        </div>
    </div>
}