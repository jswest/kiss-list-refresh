window.letters = window.letters.map((l) => {
	return {
		letter: l.letter,
		path: window.parser(l.d),
	};
});
const scaled = (number, offset, scale) => number * scale + offset;

const accumulate = (
	el,
	phrase,
	padding,
	scale,
	xOffset,
	yOffset,
	className,
	styles
) => {
	const ready = [];
	let accumulation = 0;
	phrase.forEach((l, index) => {
		if (l !== " ") {
			const letter = letters.find((letter) => letter.letter === l);
			const letterWidth = Math.max(
				...letter.path
					.map((l) => scaled(l.x, 0, scale))
					.filter((l) => l)
			);
			const pathD = getLetterD(letter, scale, accumulation, yOffset);
			accumulation += letterWidth + padding;
			ready.push({
				d: pathD,
				className: className,
				styles: styles,
			});
		} else {
			accumulation += (accumulation - padding * index) / index - padding;
		}
	});
	return ready;
};

const getLetterD = (letter, scale, xOffset, yOffset) => {
	const path = d3.path();
	letter.path.forEach((i) => {
		if (i.code === "M") {
			path.moveTo(
				scaled(i.x, xOffset, scale),
				scaled(i.y, yOffset, scale)
			);
		}
		if (i.code === "L") {
			path.lineTo(
				scaled(i.x, xOffset, scale),
				scaled(i.y, yOffset, scale)
			);
		}
		if (i.code === "C") {
			path.bezierCurveTo(
				scaled(i.x1, xOffset, scale),
				scaled(i.y1, yOffset, scale),
				scaled(i.x2, xOffset, scale),
				scaled(i.y2, yOffset, scale),
				scaled(i.x, xOffset, scale),
				scaled(i.y, yOffset, scale)
			);
		}
		if (i.code === "Z") {
			path.closePath();
		}
	});
	return path.toString();
};

const svg = d3
	.select("#main")
	.append("svg")
	.attr("width", window.sizes.width)
	.attr("height", window.sizes.height);

// svg.style("background-color", "white");

const guts = svg
	.append("g")
	.classed("guts", true)
	.attr(
		"transform",
		`translate(${window.sizes.padding.left},${window.sizes.padding.top})`
	);

const legend = guts
	.append("g")
	.classed("legend", true)
	.attr("transform", `translate(${window.sizes.cwidth}, 30)`);

const name = guts
	.append("text")
	.classed("chart-title", true)
	.attr("x", 0)
	.attr("y", 0);
guts.selectAll(".chart-title")
	.style("fill", colors.pastels.red)
	.style("font-family", "Source Sans Pro")
	.style("font-size", "30px")
	.style("font-weight", 700);

const title = ["K", "I", "S", "S", " ", "L", "I", "S", "T"];
const titles = accumulate(guts, title, 10, 1, 20, 20, "kiss", {
	fill: window.colors.pastels.red,
});

const title1 = ["K", "I", "S", "S", " ", "L", "I", "S", "T"];
const titles1 = accumulate(guts, title1, 10, 1, 20, 20, "kiss", {
	fill: window.colors.pastels.red,
});

const title2 = ["K", "I", "S", "S", " ", "L", "I", "S", "T"];
const titles2 = accumulate(guts, title2, 10, 1, 20, 20, "kiss", {
	fill: window.colors.pastels.red,
});

const title3 = ["K", "I", "S", "S", " ", "L", "I"];
const titles3 = accumulate(guts, title3, 10, 1, 20, 20, "kiss", {
	fill: window.colors.pastels.red,
});

const subtitle = ["G", "A", "L", "E", "N", " ", "B", "E", "E", "B", "E"];
const subtitles = accumulate(guts, subtitle, 10, 1, 20, 150, "kiss", {
	fill: window.colors.pastels.green,
});

const subsubtitle = ["J", "O", "H", "N", " ", "W", "E", "S", "T"];
const subsubtitles = accumulate(guts, subsubtitle, 10, 1, 20, 280, "kiss", {
	fill: window.colors.pastels.blue,
});

window.data.kisses.forEach((d, i) => {
	d.letter = titles
		.concat(titles1)
		.concat(titles2)
		.concat(titles3)
		.concat(subtitles)
		.concat(subsubtitles)[i];
});

const kisses = guts
	.selectAll("path.kiss")
	.data(window.data.kisses)
	.enter("path.kiss")
	.append("path")
	.classed("kiss", true)
	.attr("id", (d) => `kiss-${d.id}`);

const xAxis = guts
	.append("g")
	.classed("axis", true)
	.attr("transform", `translate(0,${window.sizes.cheight})`);

let last = [],
	current = [];

const renderLast = () => {
	name.text("");
	legend.selectAll(".block").remove();
	xAxis.html("");
	kisses
		.transition()
		.duration(1000)
		.style("fill", "transparent");
};

const renderMain = (isFirst) => {
	name.text("");
	legend.selectAll(".block").remove();
	if (!isFirst) {
		current = last.slice();
		last = [];
		kisses
			.transition()
			.duration(1000)
			.attr("transform", "translate(0,0)")
			.attrTween("d", (d, i) => {
				last.push(d.letter.d);
				return flubber.interpolate(current[i], d.letter.d);
			})
			.style("fill", (d) => (d.letter ? d.letter.styles.fill : ""));
		xAxis.html("");
	} else {
		kisses
			.attr("d", (d) => (d.letter ? d.letter.d : ""))
			.attr("transform", (d) => "")
			.style("fill", (d) => (d.letter ? d.letter.styles.fill : ""));
	}
	kisses.each((d) => {
		last.push(d.letter.d);
	});
};

const render = (xprop, cprop) => {
	const legendData = window.data.field_values[cprop]
		? window.data.field_values[cprop].map((d, i) => ({ name: d, value: i }))
		: [...new Set(window.data.kisses.map((k) => k[cprop]))].map((d) => ({
				name: d,
				value: d,
		  }));
	legend.selectAll(".block").remove();
	legend
		.selectAll(".block")
		.data(legendData)
		.enter()
		.append("text")
		.classed("block", true)
		.text((d) => d.name)
		.attr("y", (d, i) => 12 + i * 20)
		.style("fill", (d) => window.scales.c[cprop](d.value));
	const niceXProp = data.field_nice_names[xprop];
	const niceCProp = data.field_nice_names[cprop];
	name.text(`${niceXProp} / ${niceCProp}`);

	if (xprop !== "date") {
		xAxis
			.transition()
			.duration(1000)
			.attr("transform", `translate(0,${window.sizes.cheight + 20})`);
	} else {
		xAxis
			.transition()
			.duration(1000)
			.attr("transform", `translate(0,${window.sizes.cheight / 2 + 50})`);
	}
	xAxis.call(
		d3.axisBottom(window.scales.x[xprop]).tickFormat((d, i) => {
			if (window.data.field_values[xprop]) {
				return window.data.field_values[xprop][i];
			} else if (xprop === "date") {
				return d.getFullYear();
			} else {
				return typeof d === "string" ? d.split("-").join(" ") : d;
			}
		})
	);

	const propertyValues = [];
	kisses
		.sort((a, b) => (a[cprop] < b[cprop] ? 1 : -1))
		.each((d) => {
			const extant = propertyValues.find((p) => p.property === d[xprop]);
			if (extant) {
				extant.data.push(d);
			} else {
				propertyValues.push({ property: d[xprop], data: [d] });
			}
		}, []);

	let step;
	let monthsMap = {};
	if (xprop !== "date") {
		step = window.scales.x[xprop].step();
	} else {
		kisses.each((d) => {
			monthsMap[
				d.date
					.split("-")
					.slice(0, 2)
					.join("-")
			] = 0;
		});
	}

	const y = d3
		.scaleLinear()
		.domain([0, Math.max(...propertyValues.map((d) => d.data.length))])
		.range([window.sizes.cheight, 0]);

	kisses
		.transition()
		.duration(1000)
		.attrTween("d", (d, i) => {
			if (xprop === "date") {
				last.push("M 0 0 L 5 0 L 8 50 L 0 50Z");
				return flubber.interpolate(
					current[i],
					"M 0 0 L 5 0 L 8 50 L 0 50Z"
				);
			} else {
				last.push(d.letter.d);
				return flubber.interpolate(
					current[i],
					`M 0 0` +
						`L ${step - 10} 3` +
						`L ${step - 10} 10` +
						`L 0 10` +
						`Z`
				);
			}
		})
		.attr("transform", (d) => {
			let xx;
			let yy;
			if (xprop === "date") {
				const kissHeight = 50;
				const kissWidth = 4;
				const month = d.date
					.split("-")
					.slice(0, 2)
					.join("-");
				const monthDate = new Date(month + "-28");
				xx = window.scales.x.date(monthDate);
				yy =
					window.sizes.cheight / 2 -
					kissHeight / 2 -
					monthsMap[month] * 55;
				monthsMap[month]++;
			} else {
				xx = window.scales.x[xprop](d[xprop]);
				yy = y(
					propertyValues
						.find((p) => p.property === d[xprop])
						.data.findIndex((v) => v.id === d.id)
				);
			}
			return `translate(${xx},${yy})`;
		})
		.attr("x", (d) => window.scales.x[xprop](d[xprop]))
		.style("fill", (d) => {
			return window.scales.c[cprop](d[cprop]);
		});

	current = last.slice();
	last = [];
	if (xprop === "date") {
		last.push("M 0 0 L 4 0 L 4 50 L 0 50Z");
	} else {
		kisses.each((d) =>
			last.push(
				`M 0 0` +
					`L ${step - 10} 0` +
					`L ${step - 10} 10` +
					`L 0 10` +
					`Z`
			)
		);
	}
};

renderPlay = (xprop, cprop) => {
	render(xprop, cprop);
	const positionDiv = d3.select("#position-control");
	const positionfields = Object.keys(window.data.field_nice_names).filter(
		(field) =>
			[
				"did_talk_about_kiss",
				"journal_entry",
				"time_of_day",
				"was_last_kiss",
			].indexOf(field) === -1
	);
	const colorfields = Object.keys(window.data.field_nice_names).filter(
		(field) =>
			[
				"did_talk_about_kiss",
				"journal_entry",
				"sun_sign",
				"was_last_kiss",
				"city_slug",
				"date",
			].indexOf(field) === -1
	);
	positionDiv.selectAll("li").remove();
	positionDiv
		.append("ul")
		.selectAll("li")
		.data(positionfields)
		.enter()
		.append("li")
		.classed("is-active", (d) => d === xprop)
		.text((d) => window.data.field_nice_names[d])
		.on("click", (d, i, els) => {
			xprop = d;
			positionDiv
				.selectAll("li")
				.classed("is-active", (d) => d === xprop);
			render(xprop, cprop);
		});
	const colorDiv = d3.select("#color-control");
	colorDiv.selectAll("li").remove();
	colorDiv
		.append("ul")
		.selectAll("li")
		.data(colorfields)
		.enter()
		.append("li")
		.classed("is-active", (d) => d === cprop)
		.text((d) => window.data.field_nice_names[d])
		.on("click", (d) => {
			cprop = d;
			colorDiv.selectAll("li").classed("is-active", (d) => d === cprop);
			render(xprop, cprop);
		});
};

const md = window.markdownit();
[...document.getElementsByClassName("who")].forEach((el, i) => {
	el.innerHTML = md.render(window.texts.who[i]);
});
[...document.getElementsByClassName("what")].forEach((el, i) => {
	el.innerHTML = md.render(window.texts.what[i]);
});
[...document.getElementsByClassName("where")].forEach((el, i) => {
	el.innerHTML = md.render(window.texts.where[i]);
});
[...document.getElementsByClassName("when")].forEach((el, i) => {
	el.innerHTML = md.render(window.texts.when[i]);
});

renderMain(true);
const scroller = document.getElementById("scroller-wrapper");
const scrollers = [...document.getElementsByClassName("scroller")];
const renderers = [
	renderMain,
	render.bind(this, "sun_sign", "gender"),
	render.bind(this, "age_comparison", "time_known_before_kiss"),
	render.bind(this, "orientation", "my_enjoyment_level"),
	render.bind(this, "gender", "how_far_it_went"),
	render.bind(this, "my_enjoyment_level", "time_known_before_kiss"),
	render.bind(this, "shame_level", "my_enjoyment_level"),
	render.bind(this, "how_far_it_went", "my_enjoyment_level"),
	render.bind(this, "my_intoxication_level", "how_far_it_went"),
	render.bind(this, "city_slug", "gender"),
	render.bind(this, "city_slug", "my_enjoyment_level"),
	render.bind(this, "city_slug", "my_intoxication_level"),
	render.bind(this, "city_slug", "time_of_day"),
	render.bind(this, "date", "gender"),
	render.bind(this, "date", "my_enjoyment_level"),
	render.bind(this, "date", "my_intoxication_level"),
	render.bind(this, "date", "time_of_day"),
	render.bind(this, "date", "time_of_day"),
	renderPlay.bind(this, "date", "time_of_day"),
	renderLast,
	renderLast,
	renderLast,
].slice(0, scrollers.length);
const statuses = renderers.map((r, i) => (i === 0 ? true : false));
scroller.addEventListener("scroll", () => {
	scrollers.forEach((el, i) => {
		const rect = el.getBoundingClientRect();
		if (!statuses[i] && rect.top < window.innerHeight && rect.bottom > 0) {
			statuses[i] = true;
			renderers[i]();
		} else if (
			statuses[i] &&
			(rect.bottom < 0 || rect.top >= window.innerHeight)
		) {
			statuses[i] = false;
		}
	});
});
