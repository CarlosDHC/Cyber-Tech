import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../FirebaseConfig"; //

// Dentro do componente:
const { id } = useParams();
const [dadosDesafio, setDadosDesafio] = useState(null);

useEffect(() => {
    const getDados = async () => {
        const docRef = doc(db, "desafios", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setDadosDesafio(docSnap.data());
        }
    };
    getDados();
}, [id]);