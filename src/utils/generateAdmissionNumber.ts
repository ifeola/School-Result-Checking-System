const generateAdmissionNumber = async (db: {
	query: (
		arg0: string,
		arg1: (string | number | null | boolean | Date)[],
	) => any;
}) => {
	const date = new Date();
	const year = date.getFullYear();
	const schoolName = "DEAC";

	const query = `
    SELECT COUNT(*) AS total
    FROM students
    WHERE admission_number LIKE $1
  `;
	const values = [`${schoolName}-${year}-%`];
	const result = await db.query(query, values);

	// Convert count to number
	const count = Number(result.rows[0].total);

	// Next sequence number
	const nextNumber = count + 1;

	// Pad with leading zeros
	const paddedNumber = String(nextNumber).padStart(4, "0");

	return `${schoolName}-${year}-${paddedNumber}`;
};

export { generateAdmissionNumber };
