import "../../sharedCss.css"
import "./ContentDescription.css"

const contentDescriptions = [
    {
        image: "/demoData/descriptions/1.png",
        description: "The pheasant in the painting is also incredibly lifelike, capturing the panicked fleeing posture, the fearful gaze, the ruffled feathers, and especially the precise depiction of the swift movement of the hind legs kicking out and then retracting the claws. This accurately portrays the desperate situation of a creature in a hurry to escape its fate, revealing the artist's keen insight into the dynamics of living beings and their fleeting moments, as well as their exceptional ability to portray these moments vividly."
    },
    {
        image: "/demoData/descriptions/2.png",
        description: "The eagle in the painting is depicted on the withered tree branch in the upper-left corner of the canvas, its body extending towards the upper-right corner, strikingly exaggerated and full of vitality. The eagle's head is inclined downward, glaring with round eyes, its sharp beak tightly shut, revealing a fierce and domineering aura without doubt. The artist pays special attention to critical features of the eagle, such as its eyes, beak, and claws. The eagle's talons are almost devoid of visible ink lines, emphasizing the muscular strength of its powerful claws. The artist applies ink powder to depict the bones of the eagle's talons, covering them with a light ink wash after thorough drying, creating a realistic and three-dimensional effect with contrasting shades."
    }
]

export const ContentDescription = () => {
    const description = contentDescriptions.map((content, index) => {
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