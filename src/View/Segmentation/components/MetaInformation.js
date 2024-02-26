import { useContext } from "react";
import "../../sharedCss.css";
import "./MetaInformation.css";
import AppContext from "../../hooks/createContext";

const metaData = [
    {
        title: "Maple, Eagle and Pheasant",
        author: "Di Li",
        dynasty: "Southern Song",
        category: "Ink and Color on Silk",
    },
    {
        title: "Apricot Blossoms and Spring Bird",
        author: "Chun Lin",
        dynasty: "Southern Song",
        category: "Ink and Color on Silk",
    },
    {
        title: "Loquats and Mountain Bird",
        author: "Chun Lin",
        dynasty: "Southern Song",
        category: "Ink and Color on Silk",
    },
    {
        title: "Oriole on Pine Branch",
        author: "Ji Zhao",
        dynasty: "Northern Song",
        category: "Ink and Color on Silk",
    },
    {
        title: "Snowy Trees and Cold Bird",
        author: "Di Li",
        dynasty: "Southern Song",
        category: "Ink and Color on Silk",
    },
];

const defaultMeta = {
    title: "",
    author: "",
    dynasty: "",
    category: "",
}

export const MetaInformation = () => {
    const {
        painting: [painting],
    } = useContext(AppContext);

    const metaInfo = painting === "" ? defaultMeta : metaData[parseInt(painting)];

    return <div className="SDefault-container">
        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "16%"}}>
                <span className="STitle-text-contrast">Title</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(84% - 8px)"}}>
                <span className="STitle-text-contrast">{metaInfo.title}</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "21.8%"}}>
                <span className="STitle-text-contrast">Author</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(78.2% - 8px)"}}>
                <span className="STitle-text-contrast">{metaInfo.author}</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "24%"}}>
                <span className="STitle-text-contrast">Dynasty</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(76% - 8px)"}}>
                <span className="STitle-text-contrast">{metaInfo.dynasty}</span>
            </div>
        </div>

        <div className="Meta-type">
            <div className="Meta-type-name" style={{width: "26.2%"}}>
                <span className="STitle-text-contrast">Category</span>
            </div>
            <div className="Meta-type-name" style={{marginLeft: "8px", width: "calc(73.8% - 8px)"}}>
                <span className="STitle-text-contrast">{metaInfo.category}</span>
            </div>
        </div>
    </div>
}