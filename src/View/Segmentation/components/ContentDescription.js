import "../../sharedCss.css";
import "./ContentDescription.css";
import AppContext from "../../hooks/createContext";
import { useContext } from "react";

const contentDescriptions = [
    [
        {
            image: "/studyData/paintings/0/d1.png",
            description: "The pheasant in the painting is also incredibly lifelike, capturing the panicked fleeing posture, the fearful gaze, the ruffled feathers, and especially the precise depiction of the swift movement of the hind legs kicking out and then retracting the claws. This accurately portrays the desperate situation of a creature in a hurry to escape its fate, revealing the artist's keen insight into the dynamics of living beings and their fleeting moments, as well as their exceptional ability to portray these moments vividly."
        },
        {
            image: "/studyData/paintings/0/d2.png",
            description: "The goshawk in the painting is depicted on the withered tree branch in the upper-left corner of the canvas, its body extending towards the upper-right corner, strikingly exaggerated and full of vitality. The eagle's head is inclined downward, glaring with round eyes, its sharp beak tightly shut, revealing a fierce and domineering aura without doubt. The artist pays special attention to critical features of the eagle, such as its eyes, beak, and claws. The eagle's talons are almost devoid of visible ink lines, emphasizing the muscular strength of its powerful claws. The artist applies ink powder to depict the bones of the eagle's talons, covering them with a light ink wash after thorough drying, creating a realistic and three-dimensional effect with contrasting shades."
        }
    ], 
    [
        {
            image: "/studyData/paintings/1/d1.png",
            description: "The painting depicts branches of apricot blossoms traversing the entire canvas from left to right, with a waxwing perched on one of the branches, creating a concise composition. The bird's crest feathers stand tall, its body round and plump, and its nails solid and sharp. The sparse and dense arrangement of the two clusters of apricot branches complement each other, with the plain and beautiful flower colors contrasting the bird's vibrant feathers, showcasing the artist's ingenious composition. The entire painting exudes refined brushwork and poetic charm, revealing the painter's outstanding technique and exquisite craftsmanship."
        },
    ],
    [
        {
            image: "/studyData/paintings/2/d1.png",
            description: "The painting depicts the scenery of Jiangnan in May, with ripe loquat fruits appearing incredibly tempting under the summer sunlight. A white-eye with its head raised, tail cocked, and neck stretched out perches on a loquat branch, eager to peck at the fruit. However, it notices an ant on the fruit and pauses, fixing its gaze intently, creating a vivid and intriguing expression. The loquat branch seems to tremble with the bulbul's movements, adding a dynamic element to the otherwise tranquil scene, brimming with delightful humor."
        },
    ],
    [
        {
            image: "/studyData/paintings/3/d1.png",
            description: "The painting depicts an oriole singing on a pine branch with loose brushstrokes. However, the coloring of the oriole is heavy and muddy, which is quite different from Ji Zhao's painting style."
        },
    ],
    [
        {
            image: "/studyData/paintings/4/d1.png",
            description: "In the chilly winter scene, thin snow covers bamboo leaves, while a shrike perches on a thorny tree. The shrike, depicted with a combination of ink washes and detailed strokes, appears fluffy with lively eyes."
        },
    ]
]

export const ContentDescription = () => {
    const {
        painting: [painting],
    } = useContext(AppContext);

    const contentInfo = painting === "" ? [] : contentDescriptions[parseInt(painting)];

    const description = contentInfo.map((content, index) => {
        return <div key={`content-des-${index}`} className="Content-description">
            <div className="Content-image-container">
                <img className="Content-image" src={content.image} alt={""} />
            </div>
            <div className="Content-text-container">
                <div className="Content-text-round">
                    <div className="STitle-text-contrast" style={{marginLeft: "0px", textAlign: "left"}}>{content.description}</div>
                </div>
            </div>
        </div>   
    })
  
    return <div className="SDefault-container">
        {description}
    </div>
}