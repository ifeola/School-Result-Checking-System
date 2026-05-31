const generateTeacherNumber = async (db: {
	query: (
		text: string,
		values?: (string | number | null | boolean | Date)[],
	) => any;
}): Promise<string> => {
	const date = new Date();
	const year = date.getFullYear();
	const schoolName = "DEAC";

	const query = `
    SELECT COUNT(*) AS total
    FROM teachers;
  `;
	const result = await db.query(query);

	// Convert count to number
	const count = Number(result.rows[0].total);

	// Next sequence number
	const nextNumber = count + 1;

	// Pad with leading zeros
	const paddedNumber = String(nextNumber).padStart(4, "0");

	return `${schoolName}-STF-${year}-${paddedNumber}`;
};

export default generateTeacherNumber;
