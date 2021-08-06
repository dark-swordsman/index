import {Icon} from "react-icons-kit"
import {trashO} from "react-icons-kit/fa/trashO"
import styles from "./IconDelete.module.css"

export default function IconDelete({size}) {
    return <div className={styles.delete + " rounded"}>
        <Icon icon={trashO} size={size}/>
    </div>
}