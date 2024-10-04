import probe from 'probe-image-size';

export const fetchImgInfo = (data) => {
	return new Promise(async (resolve) => {
		const imageData = [];
		for (let i = 0; data.length > i; i++) {
			await probe(data[i].url)
				.then((res) => {
					if (res.width < 400 || res.height < 400) return;
					return imageData.push({
						url: data[i].url,
						main: data[i].main,
						format: res.type,
						width: res.width,
						height: res.height,
					});
				})
				.catch((e) => {});
		}
		resolve(imageData.filter(Boolean));
	});
};

const getMedia = async (data) => {
	const { main, i } = data;
	const mediaSet = [];
	const mainMedia = main[0].ATTR;
	mediaSet.push({
		url: mainMedia.url.replace(/origxorig/gm, 'fit-in/2000x2000'),
		main: true,
		format: '',
		height: 'auto',
		width: 'auto',
	});
	if (i !== undefined) {
		i.forEach((media) => {
			mediaSet.push({
				url: media.ATTR.url.replace(/origxorig/gm, 'fit-in/2000x2000'),
				main: false,
				format: '',
				height: 'auto',
				width: 'auto',
			});
		});
	}
	return mediaSet;
};

// const getMedia = async (data) => {
// 	const { main, i } = data;
// 	const mediaSet = [];
// 	const mainMedia = main[0].ATTR;
// 	mediaSet.push({
// 		url: mainMedia.url.replace(/origxorig/gm, 'fit-in/2000x2000'),
// 		main: true,
// 		format: '',
// 		height: 'auto',
// 		width: 'auto',
// 	});
// 	if (i !== undefined) {
// 		i.forEach((media) => {
// 			mediaSet.push({
// 				url: media.ATTR.url.replace(/origxorig/gm, 'fit-in/2000x2000'),
// 				main: false,
// 				format: '',
// 				height: 'auto',
// 				width: 'auto',
// 			});
// 		});
// 	}
// 	return fetchImgInfo(mediaSet);
// };

export default getMedia;
