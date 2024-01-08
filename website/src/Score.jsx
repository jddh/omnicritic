import clsx from "clsx";

export default function Score({ score }) {
	const style = {'--score': score};

	return (
		<div className={clsx("score-wheel", (score == 100) && "perfect")} style={style}>
			<div className="dial"></div>
			<span className="number">{score}</span>
		</div>
	)
}