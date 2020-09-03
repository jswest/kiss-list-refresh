window.colors = {
	blue: ["rgb(158,175,255)", "rgb(108,120,150)", "rgb(58,70,100)"].map((d) =>
		d3.color(d)
	),
	pink: ["#ffdbdc", "#eaa0a2", "#a66060"].map((d) => d3.color(d)),
	green: ["#dcffdb", "#a2eaa0", "#60a660"].map((d) => d3.color(d)),
	orange: ["#ffb347", "rgb(133,171,191)"].map((d) => d3.color(d)),
	pastels: {
		red: d3.color("#FF69B4"),
		orange: d3.color("#ffac87"),
		yellow: d3.color("#faed27"),
		green: d3.color("#87ff96"),
		blue: d3.color("#15f4ee"),
		purple: d3.color("#B71DDE"),
	},
};

window.sizes = {
	padding: {
		top: 100,
		right: 300,
		bottom: 100,
		left: 60,
	},
};
window.sizes.cheight =
	window.innerHeight < 600
		? window.innerHeight -
		  window.sizes.padding.top -
		  window.sizes.padding.bottom
		: 600 - window.sizes.padding.top - window.sizes.padding.bottom;
window.sizes.cwidth =
	window.innerWidth - window.sizes.padding.left - window.sizes.padding.right;
window.sizes.height = window.innerHeight < 600 ? window.innerHeight : 600;
window.sizes.width = window.innerWidth;

window.scales = {
	c: {},
	x: {
		date: d3
			.scaleTime()
			.domain(
				d3
					.extent(window.data.kisses, (d) => Date.parse(d.date))
					.map((d) => new Date(d))
			)
			.range([0, window.sizes.cwidth])
			.nice(),
	},
};

const linearxs = [
	"age_comparison",
	"city_slug",
	"my_enjoyment_level",
	"gender",
	"how_far_it_went",
	"my_intoxication_level",
	"orientation",
	"post_kiss_communication",
	"shame_level",
	"sun_sign",
	"time_known_before_kiss",
	"time_of_day",
	"was_last_kiss",
];
linearxs.forEach((x) => {
	window.scales.x[x] = d3
		.scaleBand()
		.domain(
			[...new Set(window.data.kisses.map((k) => k[x]))].sort((a, b) => {
				if (window.data.fieldSorts[x] === "number") {
					return +a > +b ? 1 : -1;
				} else {
					return a > b ? 1 : -1;
				}
			})
		)
		.range([0, window.sizes.cwidth]);
});

quasiordinalcs = ["gender", "orientation", "time_of_day"];
quasiordinalcs.forEach((c) => {
	const options = [...new Set(window.data.kisses.map((k) => k[c]))];
	window.scales.c[c] = d3
		.scaleOrdinal()
		.domain(options)
		.range([
			window.colors.pastels.red,
			// window.colors.pastels.orange,
			// window.colors.pastels.yellow,
			window.colors.pastels.green,
			window.colors.pastels.blue,
			// window.colors.pastels.purple,
		]);
});

numericcs = [
	"age_comparison",
	"my_enjoyment_level",
	"how_far_it_went",
	"my_intoxication_level",
	"post_kiss_communication",
	"shame_level",
	"time_known_before_kiss",
];
numericcs.forEach((c) => {
	const options = [...new Set(window.data.kisses.map((k) => k[c]))];
	window.scales.c[c] = d3
		.scaleLinear()
		.domain([0, 1, 2, 3, 4])
		.range([
			window.colors.pastels.red,
			// window.colors.pastels.orange,
			window.colors.pastels.yellow,
			window.colors.pastels.green,
			window.colors.pastels.blue,
			window.colors.pastels.purple,
		]);
});
