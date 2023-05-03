import { useParams } from 'react-router-dom';


export default function ItemView() {
	const {titleid} = useParams();

	return (
		<div>Hi I am item: {titleid}</div>
	)
}