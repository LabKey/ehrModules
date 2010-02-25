SELECT id, FixDate(date) AS Date, (room) AS room, (account) AS account,
FixNewlines(remark) AS remark,
FixNewlines(clinremark) AS clinremark,
CONCAT('Remark: ', remark, '\n', 'ClinRemark', clinremark) AS Description
FROM parahead
