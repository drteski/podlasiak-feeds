import DownloadFile from 'nodejs-file-downloader';

const FileDownloader = async (url, directory, fileName) => {
	const downloader = new DownloadFile({
		url,
		directory,
		fileName,
		maxAttempts: 10,
		cloneFiles: false,
	});
	try {
		await downloader.download();
		return 'Pobrane';
	} catch (error) {
		console.log(error);
		return error;
	}
};

export default FileDownloader;
