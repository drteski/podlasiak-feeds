const generateUid = () => {
	return Math.floor(1000000000000 + Math.random() * 900000000000);
};

export default generateUid;
