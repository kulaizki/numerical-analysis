import { f, exactSolution } from './solvers';

export function setupCanvas(canvas: HTMLCanvasElement) {
	if (!canvas) return null;
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;
	ctx.scale(dpr, dpr);

	return { ctx, width: rect.width, height: rect.height };
}

export function toCanvasCoords(
	t: number,
	y: number,
	width: number,
	height: number,
	tMin: number,
	tMax: number,
	yMin: number,
	yMax: number
) {
	const padding = 40;
	const x = padding + ((t - tMin) / (tMax - tMin)) * (width - 2 * padding);
	const yCanvas = height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);
	return { x, y: yCanvas };
}

export function drawAxes(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	tMin: number,
	tMax: number,
	yMin: number,
	yMax: number
) {
	const padding = 40;
	ctx.strokeStyle = '#4b5563';
	ctx.lineWidth = 1;

	// Y axis
	ctx.beginPath();
	ctx.moveTo(padding, padding);
	ctx.lineTo(padding, height - padding);
	ctx.stroke();

	// X axis
	ctx.beginPath();
	ctx.moveTo(padding, height - padding);
	ctx.lineTo(width - padding, height - padding);
	ctx.stroke();

	// Labels
	ctx.fillStyle = '#9ca3af';
	ctx.font = '12px Manrope';
	ctx.textAlign = 'center';

	// T axis labels
	for (let t = Math.ceil(tMin); t <= tMax; t += 0.5) {
		const { x } = toCanvasCoords(t, 0, width, height, tMin, tMax, yMin, yMax);
		ctx.fillText(t.toFixed(1), x, height - padding + 20);
	}

	// Y axis labels
	ctx.textAlign = 'right';
	for (let y = Math.ceil(yMin * 2) / 2; y <= yMax; y += 0.5) {
		const { y: yCanvas } = toCanvasCoords(0, y, width, height, tMin, tMax, yMin, yMax);
		ctx.fillText(y.toFixed(1), padding - 10, yCanvas + 4);
	}

	// Axis titles
	ctx.fillStyle = '#d1d5db';
	ctx.font = '14px Manrope';
	ctx.textAlign = 'center';
	ctx.fillText('t', width / 2, height - 5);
	ctx.save();
	ctx.translate(15, height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText('y', 0, 0);
	ctx.restore();
}

export function drawSlopeField(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	tMin: number,
	tMax: number,
	yMin: number,
	yMax: number
) {
	const gridT = 15;
	const gridY = 10;
	const arrowLength = 10;

	ctx.strokeStyle = '#374151';
	ctx.lineWidth = 1;

	for (let i = 0; i <= gridT; i++) {
		for (let j = 0; j <= gridY; j++) {
			const t = tMin + (i / gridT) * (tMax - tMin);
			const y = yMin + (j / gridY) * (yMax - yMin);
			const slope = f(t, y);

			const angle = Math.atan(slope * 0.5); // scale for visibility
			const { x, y: yCanvas } = toCanvasCoords(t, y, width, height, tMin, tMax, yMin, yMax);

			const dx = arrowLength * Math.cos(angle);
			const dy = arrowLength * Math.sin(angle);

			ctx.beginPath();
			ctx.moveTo(x - dx, yCanvas + dy);
			ctx.lineTo(x + dx, yCanvas - dy);
			ctx.stroke();
		}
	}
}

export function drawExactSolution(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	tMin: number,
	tMax: number,
	yMin: number,
	yMax: number
) {
	ctx.strokeStyle = '#6366f1';
	ctx.lineWidth = 2;
	ctx.setLineDash([5, 5]);

	ctx.beginPath();
	for (let t = tMin; t <= tMax; t += 0.01) {
		const y = exactSolution(t);
		const { x, y: yCanvas } = toCanvasCoords(t, y, width, height, tMin, tMax, yMin, yMax);
		if (t === tMin) {
			ctx.moveTo(x, yCanvas);
		} else {
			ctx.lineTo(x, yCanvas);
		}
	}
	ctx.stroke();
	ctx.setLineDash([]);
}

export function clearCanvas(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number
) {
	ctx.fillStyle = '#0f172a';
	ctx.fillRect(0, 0, width, height);
}
